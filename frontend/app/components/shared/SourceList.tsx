interface Source {
  document_id: string;
  kb_id: string;
  filename: string;
  snippet: string;
  page: number;
  score: number;
}

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Sources</h3>
      <div className="space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="bg-gray-100 p-2 rounded-md">
            <p className="text-sm font-semibold">
              <a
                href={`/documents/${source.document_id}`}
                className="text-indigo-600 hover:text-indigo-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.filename} (Page: {source.page})
              </a>
            </p>
            <p className="text-sm italic">...{source.snippet}...</p>
            <p className="text-xs text-gray-500">
              KB: {source.kb_id}, Score: {source.score.toFixed(4)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
