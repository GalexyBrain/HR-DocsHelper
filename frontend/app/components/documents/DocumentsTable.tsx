"use client";

import Link from "next/link";
import { StatusBadge } from "../shared/StatusBadge";

interface Document {
  id: string;
  filename: string;
  kb_id: string;
  file_type: string;
  status: string;
  created_at: string;
}

interface DocumentsTableProps {
  documents: Document[];
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center text-gray-500">No documents found.</div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Knowledge Base
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap">{doc.filename}</td>
              <td className="px-6 py-4 whitespace-nowrap">{doc.kb_id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{doc.file_type}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge
                  status={
                    doc.status as "Ready" | "Processing" | "Failed"
                  }
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(doc.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/documents/${doc.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View
                </Link>
                <button className="text-red-600 hover:text-red-900 ml-4">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
