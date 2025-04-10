import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container py-6">
          <Link href="/" className="text-lg font-bold hover:underline">
            daily brief intelligence
          </Link>
        </div>
      </header>
      
      <div className="container py-24 flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-medium mb-6">Page not found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center mono text-sm hover:underline"
          >
            ← return home
          </Link>
        </div>
      </div>
      
      <footer className="border-t border-border">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © 2025 Daily Brief Intelligence. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/subscribe" className="text-xs hover:underline">
                Subscribe
              </Link>
              <Link href="/privacy" className="text-xs hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs hover:underline">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
