"use client";

import { useState } from "react";
import { DocumentsTable } from "../components/documents/DocumentsTable";
import { PageHeader } from "../components/shared/PageHeader";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

export default function DocumentsPage() {
  const { data, error, isLoading } = useSWR("/documents", fetcher);
  const [filter, setFilter] = useState("");

  const filteredDocuments = data?.documents?.filter((doc: any) =>
    doc.filename.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <PageHeader
          title="Documents"
          subtitle="Manage and view all documents accessible to you."
          actions={
            <button className="bg-blue-500 text-white px-6 py-3 rounded-md">
              Create New
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option>Filter by Knowledge Base</option>
            {/* Dynamic options can be added here */}
          </select>
          <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option>Filter by Status</option>
            <option>Ready</option>
            <option>Processing</option>
            <option>Failed</option>
          </select>
          <input
            type="text"
            placeholder="Search by name"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {isLoading && (
          <div className="text-center text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="text-center text-red-500">
            Failed to load documents.
          </div>
        )}
        {filteredDocuments && <DocumentsTable documents={filteredDocuments} />}

        <div className="mt-8 flex justify-end">
          {/* Pagination component can be added here */}
        </div>
      </div>
    </div>
  );
}
