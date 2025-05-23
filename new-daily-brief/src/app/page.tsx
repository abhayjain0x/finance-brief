import Link from "next/link";
import fs from 'fs';
import path from 'path';
import NavBar from "@/components/nav-bar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "All you need to know about today",
};

// Function to get all available newsletters
async function getNewsletters() {
  try {
    // First try to read from the intelligence folder (dev environment)
    let dirPath = path.join(process.cwd(), '..', 'daily brief intelligence');
    
    // Check if the intelligence folder exists
    if (!fs.existsSync(dirPath)) {
      // Fall back to public data (production build)
      dirPath = path.join(process.cwd(), 'public', 'data');
    }
    
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    const files = fs.readdirSync(dirPath);
    const newsletterFiles = files
      .filter(file => file.startsWith('newsletter_') && file.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)); // Sort in descending order
    
    const newsletters = await Promise.all(
      newsletterFiles.map(async file => {
        const slug = file.replace('newsletter_', '').replace('.md', '');
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract title - look for the first ### line after removing "THE DAILY BRIEF"
        const contentWithoutHeader = content.replace(/^# THE DAILY BRIEF\s*\n/, '');
        const titleMatch = contentWithoutHeader.match(/^### (.*?)(?:\n|$)/);
        const title = titleMatch ? titleMatch[1] : 'Daily Brief Intelligence Newsletter';
        
        // Format date for display
        const dateParts = slug.split('-');
        if (dateParts.length === 3) {
          const [year, month, day] = dateParts;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }).toLowerCase();
          
          return {
            slug,
            title: title.includes(": ") ? title.split(": ")[1].replace(/"/g, '') : title,
            date: formattedDate
          };
        }
        
        return {
          slug,
          title: title.includes(": ") ? title.split(": ")[1].replace(/"/g, '') : title,
          date: slug.toLowerCase()
        };
      })
    );
    
    return newsletters;
  } catch (error) {
    console.error('Error reading newsletters:', error);
    return [];
  }
}

export default async function Home() {
  const newsletters = await getNewsletters();
  
  return (
    <main className="min-h-screen bg-background text-foreground relative">
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {newsletters.length > 0 ? (
          <div className="space-y-12">
            {newsletters.map((newsletter) => (
              <div key={newsletter.slug} className="mb-12 headline-container">
                <Link 
                  href={`/newsletter/${newsletter.slug}`} 
                  className="text-2xl font-semibold squiggly-underline"
                >
                  {newsletter.title}
                </Link>
                <div className="relative">
                  <span className="text-sm text-muted-foreground relative date-text">{newsletter.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No newsletters available.</p>
        )}
      </div>
      
      {/* Credit link at bottom right */}
      <div className="absolute bottom-4 right-4">
        <a 
          href="https://github.com/iliane5/meridian" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          credit
        </a>
      </div>
    </main>
  );
} 