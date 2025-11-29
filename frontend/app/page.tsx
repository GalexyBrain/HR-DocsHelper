import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white text-center py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">
              Ask questions directly from your company documents.
            </h1>
            <p className="text-lg mb-8">
              Get grounded answers with citations pointing back to the original
              documents.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/upload"
                className="bg-blue-500 text-white px-6 py-3 rounded-md"
              >
                Upload Documents
              </Link>
              <Link
                href="/ask"
                className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-2">Upload Documents</h3>
                <p>
                  Upload your company documents (PDF, DOCX, TXT, etc.) to a
                  secure location.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-2">
                  Build Knowledge Bases
                </h3>
                <p>
                  Organize your documents into logical knowledge bases for
                  targeted Q&A.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-2">
                  Ask Questions with Citations
                </h3>
                <p>
                  Get answers to your questions with direct citations from the
                  source documents.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <Link href="#">Docs</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Contact</Link>
            <Link href="#">GitHub repo</Link>
          </div>
          <p>&copy; 2025 Knowledge Base Agent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
