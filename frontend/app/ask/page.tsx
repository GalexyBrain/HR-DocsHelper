"use client";

import { useState } from "react";
import { ChatWindow } from "../components/ask/ChatWindow";
import { PageHeader } from "../components/shared/PageHeader";
import { KBSelector } from "../components/shared/KBSelector";

export default function AskPage() {
  const [selectedKb, setSelectedKb] = useState("default");

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-120px)]">
      <div className="bg-white p-8 rounded-lg shadow-md h-full flex flex-col">
        <PageHeader
          title="Ask the Knowledge Base"
          subtitle="Provide the core Q&A experience over selected Knowledge Bases."
          actions={
            <div className="flex items-center space-x-4">
              <KBSelector
                selectedKb={selectedKb}
                onChange={setSelectedKb}
              />
              <button className="bg-blue-500 text-white px-6 py-3 rounded-md">
                New Conversation
              </button>
            </div>
          }
        />

        <div className="flex-grow">
          <ChatWindow selectedKb={selectedKb} />
        </div>
      </div>
    </div>
  );
}
