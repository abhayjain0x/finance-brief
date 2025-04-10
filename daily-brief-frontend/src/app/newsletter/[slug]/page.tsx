import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from 'fs';
import path from 'path';
import NavBar from "@/components/nav-bar";
import ProgressBar from "@/components/progress-bar";

// Function to get the newsletter content from the file system
async function getNewsletterContent(slug: string) {
  try {
    const filePath = path.join(process.cwd(), '..', 'daily brief intelligence', `newsletter_${slug}.md`);
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading newsletter file:', error);
    return null;
  }
}

// Function to get available newsletters
async function getAvailableNewsletters() {
  try {
    const dirPath = path.join(process.cwd(), '..', 'daily brief intelligence');
    const files = fs.readdirSync(dirPath);
    const newsletterFiles = files.filter(file => file.startsWith('newsletter_') && file.endsWith('.md'));
    
    return newsletterFiles.map(file => {
      const slug = file.replace('newsletter_', '').replace('.md', '');
      return slug;
    });
  } catch (error) {
    console.error('Error reading newsletter directory:', error);
    return [];
  }
}

// Parse newsletter title from content
function parseNewsletterTitle(content: string): string {
  const titleMatch = content.match(/^# THE DAILY BRIEF\s*\n### (.*?)(?:\n|$)/);
  return titleMatch ? titleMatch[1].split(": ")[1]?.replace(/"/g, '') || titleMatch[1] : 'Daily Brief Intelligence Newsletter';
}

// Calculate estimated reading time
function getReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
}

// Extract headings from the content but without using them in a sidebar
function extractHeadings(content: string): { id: string, title: string, type: 'main' | 'sub' }[] {
  const headings: { id: string, title: string, type: 'main' | 'sub' }[] = [];
  let headingCount = 0;
  
  // Extract main section headings (## HEADINGS)
  const mainHeadingMatches = content.matchAll(/^## (.+?)$/gm);
  for (const match of mainHeadingMatches) {
    const title = match[1].trim();
    const id = `heading-${headingCount}`;
    headings.push({ id, title, type: 'main' as const });
    headingCount++;
  }
  
  // Extract underlined titles (<u>**Title**</u>)
  const subHeadingMatches = content.matchAll(/<u>\*\*(.+?)\*\*<\/u>/g);
  for (const match of subHeadingMatches) {
    const title = match[1].trim();
    const id = `heading-${headingCount}`;
    headings.push({ id, title, type: 'sub' as const });
    headingCount++;
  }
  
  return headings;
}

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Await params if it might be a Promise
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug || '';
    const content = await getNewsletterContent(slug);
    
    if (!content) {
      return {
        title: "Newsletter Not Found",
      };
    }
    
    const title = parseNewsletterTitle(content);
    
    return {
      title: title,
      description: "Daily Brief Intelligence newsletter",
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Error Loading Newsletter",
      description: "An error occurred while loading the newsletter"
    };
  }
}

export default async function NewsletterPage({ params }: Props) {
  try {
    // Await params if it might be a Promise
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug || '';
    const content = await getNewsletterContent(slug);
    
    if (!content) {
      notFound();
    }
    
    const title = parseNewsletterTitle(content);
    const readingTime = getReadingTime(content);
    const headings = extractHeadings(content);
    
    // Format date
    const dateParts = slug.split('-');
    let formattedDate = slug;
    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    // Process content and add IDs to headings for navigation
    const processContentWithIds = (content: string, headings: { id: string, title: string, type: 'main' | 'sub' }[]): string => {
      let processedContent = content;
      
      // Remove THE DAILY BRIEF and the subtitle
      processedContent = processedContent.replace(/^# THE DAILY BRIEF\s*\n### .*?\n/m, '');
      
      // Add IDs to main headings (## HEADINGS)
      const mainHeadings = headings.filter(h => h.type === 'main');
      for (let i = 0; i < mainHeadings.length; i++) {
        const heading = mainHeadings[i];
        const regex = new RegExp(`^## ${heading.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm');
        processedContent = processedContent.replace(regex, `<h2 id="${heading.id}">${heading.title}</h2>`);
      }
      
      // Add IDs to underlined headings (<u>**Title**</u>)
      const subHeadings = headings.filter(h => h.type === 'sub');
      for (let i = 0; i < subHeadings.length; i++) {
        const heading = subHeadings[i];
        const regex = new RegExp(`<u>\\*\\*${heading.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*</u>`, 'g');
        processedContent = processedContent.replace(regex, `<h3 id="${heading.id}" class="underline"><strong>${heading.title}</strong></h3>`);
      }
      
      // Process other markdown elements
      processedContent = processedContent.replace(/^# (.*$)/gm, ''); // Remove any remaining H1s
      processedContent = processedContent.replace(/^### (.*$)/gm, '<h3>$1</h3>');
      
      // Process paragraphs
      processedContent = processedContent.replace(/(?:^|\n)([^\n#<].+)(?:\n|$)/g, (match, p1) => {
        if (p1.trim() === '---') {
          return '<hr />';
        }
        return `<p>${p1}</p>`;
      });
      
      // Process bold
      processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Process italic
      processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return processedContent;
    };
    
    const htmlContent = processContentWithIds(content, headings);
    
    return (
      <main className="min-h-screen bg-background text-foreground">
        <NavBar />
        
        {/* Use the proper client component for the progress bar */}
        <ProgressBar />
        
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold mb-2">
              {title}
            </h1>
            <div className="text-sm text-muted-foreground mb-6 font-mono">
              {formattedDate.toLowerCase()}
            </div>
          </div>
          
          <div 
            className="newsletter-content mono max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex justify-between items-center">
              <div></div>
              <Link href="/" className="text-sm hover:underline text-muted-foreground">
                view all briefs
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading newsletter:', error);
    notFound();
  }
} 