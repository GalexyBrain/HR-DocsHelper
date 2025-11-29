"use client";

import Link from "next/link";

interface Kb {
  id: string;
  name: string;
  description: string;
  document_ids: string[];
  visibility: string;
  created_at: string;
}

interface KbCardsProps {
  kbs: Kb[];
}

export function KbCards({ kbs }: KbCardsProps) {
  if (!kbs || kbs.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No knowledge bases found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {kbs.map((kb) => (
        <div key={kb.id} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">{kb.name}</h2>
          <p className="text-gray-600 mb-4">{kb.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{kb.document_ids.length} documents</span>
            <span>{kb.visibility}</span>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Created: {new Date(kb.created_at).toLocaleDateString()}
            </span>
            <div className="space-x-2">
              <Link
                href={`/kb/${kb.id}`}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Open
              </Link>
              <button className="text-gray-600 hover:text-gray-900">
                Edit
              </button>
              <button className="text-red-600 hover:text-red-900">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
