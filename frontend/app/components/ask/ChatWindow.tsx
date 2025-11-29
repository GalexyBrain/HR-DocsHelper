"use client";

import { useState } from "react";
import { SourceList } from "../shared/SourceList";
import { askQuestion } from "@/lib/api";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources: any[];
}

interface ChatWindowProps {
  selectedKb: string;
}

export function ChatWindow({ selectedKb }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today?",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const newMessages: Message[] = [
        ...messages,
        { role: "user", content: input, sources: [] },
      ];
      setMessages(newMessages);

      const question = input;
      setInput("");
      setIsLoading(true);

      try {
        const kbIds: string[] = selectedKb ? [selectedKb] : [];

        const data = await askQuestion(question, kbIds, conversationId);

        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources || [],
          },
        ]);
        setConversationId(data.conversation_id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        toast.error(errorMessage);
        // Revert to previous messages if the API call fails
        setMessages(messages);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex mb-4 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-4 rounded-lg max-w-2xl ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 text-sm">
                  <SourceList sources={msg.sources} />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="p-4 rounded-lg bg-gray-200 text-gray-800">
              ...
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l-md"
            placeholder="Ask a question about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button
            className="p-2 bg-blue-500 text-white rounded-r-md disabled:bg-gray-400"
            onClick={handleSend}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
