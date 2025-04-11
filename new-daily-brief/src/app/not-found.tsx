import Link from "next/link";
import NavBar from "@/components/nav-bar";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <h2 className="text-2xl font-medium mb-8">Page Not Found</h2>
        <p className="mb-8">The page you are looking for does not exist or has been moved.</p>
        <Link 
          href="/" 
          className="font-mono text-sm px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
} 