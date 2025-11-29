"use client";

import { useState } from "react";
import { UploadDropzone } from "../components/upload/UploadDropzone";
import { KBSelector } from "../components/shared/KBSelector";
import { uploadFiles } from "@/lib/api";
import toast from "react-hot-toast";

export default function UploadPage() {
  const [selectedKb, setSelectedKb] = useState("default");
  const [tags, setTags] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload.");
      return;
    }
    if (!selectedKb) {
      toast.error("Please select a Knowledge Base.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} file(s)...`);

    try {
      const result = await uploadFiles(files, selectedKb, tags);
      toast.success(result.message || "Upload successful!", { id: toastId });
      setFiles([]);
      setTags("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Document Upload</h1>
        <p className="text-gray-600 mb-8">
          Enable users to upload new documents and kick off ingestion &
          embedding.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Panel</h2>
            <UploadDropzone onFilesSelected={setFiles} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Metadata Form</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="knowledge-base"
                  className="block text-sm font-medium text-gray-700"
                >
                  Knowledge Base
                </label>
                <KBSelector
                  selectedKb={selectedKb}
                  onChange={setSelectedKb}
                />
              </div>
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Q4-2025, marketing-brief"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <button
                onClick={handleUpload}
                className="bg-blue-500 text-white px-6 py-3 rounded-md disabled:bg-gray-400"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
