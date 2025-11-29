"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface KB {
  id: string;
  name: string;
}

interface KBSelectorProps {
  selectedKb: string;
  onChange: (kbId: string) => void;
  className?: string;
}

export function KBSelector({
  selectedKb,
  onChange,
  className,
}: KBSelectorProps) {
  const { data, error, isLoading } = useSWR("/kb", fetcher);

  const selectClassName = `mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${className}`;

  if (isLoading) {
    return (
      <select className={selectClassName} disabled>
        <option>Loading KBs...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select className={selectClassName} disabled>
        <option>Error loading KBs</option>
      </select>
    );
  }

  const knowledgeBases = data?.knowledge_bases || [];

  return (
    <select
      className={selectClassName}
      value={selectedKb}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select a Knowledge Base</option>
      {/* The "default" KB is often implicitly available, so we add it manually if not present */}
      {!knowledgeBases.some((kb: KB) => kb.id === "default") && (
        <option value="default">Default</option>
      )}
      {knowledgeBases.map((kb: KB) => (
        <option key={kb.id} value={kb.id}>
          {kb.name}
        </option>
      ))}
    </select>
  );
}
