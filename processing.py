import os
import time
import hashlib
import numpy as np
import google.generativeai as genai
from PyPDF2 import PdfReader
from pdf2image import convert_from_path
import pytesseract
import faiss

from fastembed import TextEmbedding  # ⬅️ FastEmbed ONNX backend
from query import QueryBuilder



#MONGO DB (vector database)
#Langchain
#flowwise

class VectorStore:
    """Handles document embeddings and semantic search using FastEmbed + BGE-small-en-v1.5"""

    _model = None  # Singleton embedding model (FastEmbed)

    def __init__(self):
        if VectorStore._model is None:
            # Uses ONNX under the hood, downloads once then cached locally
            VectorStore._model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        self.index = None          # faiss index will be created lazily
        self.metadata: list[dict] = []

    @staticmethod
    def _normalize_text_input(text):
        """Accept either a single string or an iterable of strings."""
        if isinstance(text, str):
            return [text]
        return list(text)

    @staticmethod
    def _embed_texts(texts: list[str]) -> np.ndarray:
        """
        Use FastEmbed to convert a list of strings into a 2D float32 array.

        FastEmbed's TextEmbedding.embed(...) returns a generator of np.ndarray,
        so we materialize and stack them.
        """
        embeddings_list = list(VectorStore._model.embed(texts))
        if not embeddings_list:
            return np.empty((0, 0), dtype=np.float32)

        embeddings = np.vstack(embeddings_list).astype(np.float32)
        return embeddings

    def add_document(self, text, metadata: dict):
        """
        Add a document (or list of chunks) to the FAISS index.

        `text` can be:
          - a single string (one embedding)
          - an iterable of strings (one embedding per chunk)
        """
        texts = self._normalize_text_input(text)
        embeddings = self._embed_texts(texts)
        if embeddings.size == 0:
            return  # nothing to index

        # Lazily initialize FAISS index with correct dimension
        if self.index is None:
            dim = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dim)  # L2 over normalized vectors ~ cosine ranking

        self.index.add(embeddings)
        # One metadata entry per vector
        self.metadata.extend([metadata] * embeddings.shape[0])

    def search(self, query: str, k: int = 5):
        """
        Semantic search over indexed documents.

        Returns a list of (metadata, distance) tuples.
        Lower distance = more similar (vectors are L2-normalized).
        """
        if self.index is None or self.index.ntotal == 0:
            return []

        query_vec = self._embed_texts([query])
        if query_vec.size == 0:
            return []

        k = min(k, self.index.ntotal)
        distances, indices = self.index.search(query_vec, k)

        results = []
        for rank, idx in enumerate(indices[0]):
            meta = self.metadata[idx]
            dist = float(distances[0][rank])
            results.append((meta, dist))
        return results

class PDFProcessor:
    """Handles PDF text extraction with OCR fallback"""
    
    def __init__(self, tesseract_cmd=r'/usr/bin/tesseract'):
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    def _extract_with_ocr(self, pdf_path, page_num):
        try:
            images = convert_from_path(pdf_path, first_page=page_num+1, last_page=page_num+1)
            return pytesseract.image_to_string(images[0])
        except Exception as e:
            print(f"OCR failed for {pdf_path} page {page_num}: {str(e)}")
            return ""

    def process_page(self, page, pdf_path, page_num):
        try:
            text = page.extract_text()
            if len(text) < 200:  # Heuristic for image-based page
                return self._extract_with_ocr(pdf_path, page_num)
            return text
        except Exception as e:
            return self._extract_with_ocr(pdf_path, page_num)

    def process_pdf(self, file_path):
        """Process a single PDF file"""
        doc_id = hashlib.md5(os.path.basename(file_path).encode()).hexdigest()[:8]
        contents = []
        
        with open(file_path, "rb") as f:
            reader = PdfReader(f)
            for page_num, page in enumerate(reader.pages):
                text = self.process_page(page, file_path, page_num)
                contents.append({
                    'text': text,
                    'metadata': {
                        'doc_id': doc_id,
                        'filename': os.path.basename(file_path),
                        'page': page_num + 1
                    }
                })
        return contents

class NotesGenerator:
    """Handles note generation using Gemini API"""    
    def __init__(self, api_key, all_topics):
        self.all_topics = all_topics
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.75,
                "top_p": 0.85,
                "top_k": 30,
                "max_output_tokens": 8192,   # ↓ half of 8192
            }
        )

        self.SYSTEM_PROMPT = f"""Act as an **expert note-taker and tutor**. Your task is to create **self-contained notes** from the provided source material and your own knowledge that:
1. **Teach core concepts**
2. **Give better understanding to the readers**
3. **Exam ready**
4. **Easy for humans to read (Well structured and other things to imporve readablity).

**Follow these rules:**  
1. **Structure the Notes**:  
   - As specified by the user.
   - Directly start off with the answer, no need to tell things lik "Ok i understand ..."s.
   - You do not need to include everything that is present in the context present to you. How much you include is up to you.


2. **Style**:  
   - Use bold for key terms and italics for examples.
   - Use tables, examples where necessarty.

4. **Answer Readiness**:  
   - If the source does not have complete information for the explaination, then you may use you own knowledge to fill the gaps and also to structure the notes."""  

    def _build_context(self, relevant_passages):
        context = "RELEVANT PASSAGES:\n"
        for (meta, score) in relevant_passages:
            context += f"\nDocument: {meta['filename']} (Page {meta['page']})\n"
            context += f"Content: {meta['doc_text']}\n"
            context += f"Relevance Score: {score:.2f}\n{'-'*40}"
        return context

    def generate_notes(self, vector_store, base_prompt, topics, max_retries: int = 3):
        """
        Generate notes for multiple topics, retrying if the LLM returns an empty response.
        """
        self.max_queries = 10
        queryBuilder = QueryBuilder()
        queries = queryBuilder.get_and_process_query("- " + "- ".join(topics), self.max_queries)

        # Build the overall context
        context = ""
        for query in queries[:self.max_queries]:
            relevant_passages = vector_store.search(query, k=(self.max_queries // len(queries)))
            context += self._build_context(relevant_passages)
        
        # Prepare the chat
        chat = self.model.start_chat(history=[])
        prompt = (
            f"{self.SYSTEM_PROMPT}\n\n"
            f"Topics:\n" + "\n".join(f"- {t}" for t in topics) + "\n\n"
            f"Context:\n{context}\n\n"
            f"Notes structure instructions:\n{base_prompt}"
        )

        # Retry loop
        for attempt in range(1, max_retries + 1):
            response = chat.send_message(prompt)
            try:
                return [response.text]
            except Exception as e:
                print("Error : (Processing.py[157])", e, sep = '\n')

        # All retries exhausted
        raise RuntimeError(
            f"LLM failed to return any content after {max_retries} attempts."
        )