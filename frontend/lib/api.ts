import { ChangeEvent } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined. Please check your environment variables."
  );
}

// Generic fetcher function for SWR
export const fetcher = (url: string) =>
  fetch(`${API_BASE_URL}${url}`).then((res) => {
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }
    return res.json();
  });

// --- Types for API responses ---

export interface AskResponse {
  answer: string;
  sources: any[];
  conversation_id: string;
}

// --- ASK / KB Q&A ---

export const askQuestion = async (
  question: string,
  kb_ids: string[],
  conversation_id?: string
): Promise<AskResponse> => {
  // Build payload exactly as Flask expects
  const payload: any = {
    question,        // <-- Flask reads this as data["question"]
    kb_ids,          // <-- validated against knowledge_bases keys
    top_k: 5,        // optional, but nice to be explicit
  };

  if (conversation_id) {
    payload.conversation_id = conversation_id;
  }

  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    // If backend ever returns non-JSON (rare with Flask/jsonify), handle gracefully
    throw new Error("Invalid response from server.");
  }

  if (!response.ok) {
    // Use backend error if present (e.g. "Field 'question' is required",
    // "No documents indexed yet", "Unknown KB IDs: [...]")
    const message =
      data?.error || `Failed to get an answer (status ${response.status}).`;
    throw new Error(message);
  }

  return data as AskResponse;
};

// --- UPLOAD / documents ---

export const uploadFiles = async (
  files: File[],
  kb_id: string,
  tags: string
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("kb_id", kb_id);
  formData.append("tags", tags);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server during upload.");
  }

  if (!response.ok) {
    throw new Error(data?.error || "File upload failed.");
  }

  return data;
};
