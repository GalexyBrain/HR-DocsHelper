import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold">
          Knowledge Base Agent
        </Link>
      </div>
      <nav className="flex items-center space-x-4">
        <Link href="/upload">Upload</Link>
        <Link href="/documents">Documents</Link>
        <Link href="/kb">Knowledge Bases</Link>
        <Link href="/ask">Ask</Link>
      </nav>
    </header>
  );
}
