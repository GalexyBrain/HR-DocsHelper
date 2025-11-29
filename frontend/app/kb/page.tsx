"use client";

import { KbCards } from "../components/kb/KbCards";
import { PageHeader } from "../components/shared/PageHeader";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

export default function KnowledgeBasesPage() {
  const { data, error, isLoading } = useSWR("/kb", fetcher);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <PageHeader
          title="Knowledge Bases"
          subtitle="Let users see and manage all Knowledge Bases."
          actions={
            <button className="bg-blue-500 text-white px-6 py-3 rounded-md">
              Create Knowledge Base
            </button>
          }
        />

        {isLoading && (
          <div className="text-center text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="text-center text-red-500">
            Failed to load knowledge bases.
          </div>
        )}
        {data && <KbCards kbs={data.knowledge_bases} />}
      </div>
    </div>
  );
}
