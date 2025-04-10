import Link from "next/link";
import fs from 'fs';
import path from 'path';
import NavBar from "@/components/nav-bar";

// Function to get all available newsletters
async function getNewsletters() {
  try {
    const dirPath = path.join(process.cwd(), '..', 'daily brief intelligence');
    const files = fs.readdirSync(dirPath);
    const newsletterFiles = files
      .filter(file => file.startsWith('newsletter_') && file.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)); // Sort in descending order
    
    const newsletters = await Promise.all(
      newsletterFiles.map(async file => {
        const slug = file.replace('newsletter_', '').replace('.md', '');
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract title
        const titleMatch = content.match(/^# THE DAILY BRIEF\s*\n### (.*?)(?:\n|$)/);
        const title = titleMatch ? titleMatch[1] : 'Daily Brief Intelligence Newsletter';
        
        // Calculate reading time
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        
        // Format date for display
        const dateParts = slug.split('-');
        if (dateParts.length === 3) {
          const [year, month, day] = dateParts;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
          
          return {
            slug,
            title,
            date: formattedDate,
            readingTime: `${readingTime} min read`
          };
        }
        
        return {
          slug,
          title,
          date: slug,
          readingTime: `${readingTime} min read`
        };
      })
    );
    
    return newsletters;
  } catch (error) {
    console.error('Error reading newsletters:', error);
    return [];
  }
}

export const metadata = {
  title: 'Newsletter Archive | Daily Brief Intelligence',
  description: 'Archive of all Daily Brief Intelligence newsletters',
};

export default async function ArchivePage() {
  const newsletters = await getNewsletters();
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      <NavBar />
      
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-10">All Briefs</h1>
        
        <div className="space-y-6">
          {newsletters.length > 0 ? (
            newsletters.map((newsletter) => (
              <div 
                key={newsletter.slug}
                className="border-b border-border pb-5 mb-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium">
                    {newsletter.title.split(": ")[1]?.replace(/"/g, '') || newsletter.title}
                  </h2>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <span>{newsletter.date}</span>
                  <span className="mx-2">•</span>
                  <span>{newsletter.readingTime}</span>
                </div>
                <div className="flex">
                  <Link 
                    href={`/newsletter/${newsletter.slug}`} 
                    className="text-sm hover:underline"
                  >
                    Read brief →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No newsletters available.</p>
          )}
        </div>
      </div>
    </main>
  );
} 