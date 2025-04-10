import Link from "next/link";

export const metadata = {
  title: 'About | Daily Brief Intelligence',
  description: 'Learn more about the Daily Brief Intelligence newsletter',
};

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container py-6">
          <Link href="/" className="text-lg font-bold hover:underline">
            daily brief intelligence
          </Link>
        </div>
      </header>
      
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">About</h1>
          
          <div className="space-y-6 mb-8">
            <p>
              Daily Brief Intelligence is a personalized finance intelligence brief that
              delivers in-depth analysis on market movements, economic trends, and financial
              developments. Each edition is carefully crafted to provide actionable insights
              in a concise, readable format.
            </p>
            
            <p>
              Unlike traditional financial news, DBI goes beyond headlines to connect the dots
              between seemingly unrelated events, identifying patterns that others might miss.
              We value informed, analytical takes grounded in facts, while avoiding generic
              hedging or political biases.
            </p>
            
            <p>
              Each brief is organized into themes, synthesizing multiple sources to provide a
              comprehensive view of what's happening in the markets and why it matters. Our
              goal is to deliver intelligence that helps you navigate the complex financial
              landscape with clarity and confidence.
            </p>
          </div>
          
          <div className="bg-white p-6 border border-border rounded-sm mb-8">
            <h2 className="text-xl font-bold mb-4">What to expect</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Concise, thoughtful analysis delivered regularly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Focus on significance and implications, not just events</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Cross-domain connections that mainstream coverage misses</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>A clear, analytical voice without unnecessary qualifications</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-12">
            <Link href="/" className="text-sm mono hover:underline">
              ← back to home
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="border-t border-border mt-auto">
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