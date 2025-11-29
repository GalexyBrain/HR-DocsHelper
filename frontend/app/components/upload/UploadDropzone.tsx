"use client";

import { useState, useCallback } from "react";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export function UploadDropzone({ onFilesSelected }: UploadDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (files) {
        const fileArray = Array.from(files);
        setSelectedFiles(fileArray);
        onFilesSelected(fileArray);
      }
    },
    [onFilesSelected]
  );

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOCX, TXT
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          multiple
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </label>
      {selectedFiles.length > 0 && (
        <div className="w-full mt-4">
          <h3 className="text-lg font-semibold">Selected Files:</h3>
          <ul>
            {selectedFiles.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
