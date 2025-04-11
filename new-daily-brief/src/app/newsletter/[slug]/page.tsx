import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import Link from 'next/link';

// Helper function to convert markdown to HTML
function markdownToHtml(markdown: string): string {
  // Remove "THE DAILY BRIEF" header
  const withoutHeader = markdown.replace(/^# THE DAILY BRIEF\s*\n/, '');
  
  // Extract title and date - we'll handle these separately
  const titleMatch = withoutHeader.match(/^### (.*?)(?:\n|$)/);
  const withoutTitle = titleMatch ? withoutHeader.replace(titleMatch[0], '') : withoutHeader;
  
  // Process horizontal rules - ensure they're rendered as proper <hr> elements
  let html = withoutTitle.replace(/^\s*---\s*$/gm, '<hr class="my-8 border-border" />');
  
  // Process headings
  html = html
    .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-semibold mb-4">$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-semibold mb-4">$1</h3>')
    .replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
    .replace(/^#### (.*?)$/gm, '<h4 class="text-lg font-semibold mb-3">$1</h4>')
    .replace(/^##### (.*?)$/gm, '<h5 class="text-base font-semibold mb-2">$1</h5>');

  // Process paragraphs (ensure they're wrapped)
  html = html.replace(/^(?!(#|<h|<ul|<ol|<li|<blockquote|<pre|<code|$|<hr))(.+)$/gm, '<p class="mb-4">$2</p>');

  // Process lists
  html = html.replace(/^(\s*)-\s*(.*?)$/gm, '<li class="ml-6 mb-1 list-disc">$2</li>');
  
  // Wrap lists (without using s flag)
  const lines = html.split('\n');
  let inList = false;
  let listBuffer: string[] = [];
  let result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('<li')) {
      if (!inList) {
        inList = true;
        listBuffer = ['<ul class="mb-4">'];
      }
      listBuffer.push(line);
    } else {
      if (inList) {
        inList = false;
        listBuffer.push('</ul>');
        result.push(listBuffer.join('\n'));
        listBuffer = [];
      }
      result.push(line);
    }
  }
  
  if (inList) {
    listBuffer.push('</ul>');
    result.push(listBuffer.join('\n'));
  }
  
  html = result.join('\n');

  // Process underline tags
  html = html.replace(/<u>(.*?)<\/u>/g, '<span class="underline">$1</span>');

  // Process bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Process italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Process links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:opacity-80">$1</a>');

  return html;
}

// Find newsletter path
function findNewsletterPath(slug: string): string | null {
  // Try intelligence folder first (development)
  let intelligenceDir = path.join(process.cwd(), '..', 'daily brief intelligence');
  let intelligencePath = path.join(intelligenceDir, `newsletter_${slug}.md`);
  
  if (fs.existsSync(intelligencePath)) {
    return intelligencePath;
  }
  
  // Try public data folder (production)
  let publicDataPath = path.join(process.cwd(), 'public', 'data', `newsletter_${slug}.md`);
  if (fs.existsSync(publicDataPath)) {
    return publicDataPath;
  }
  
  return null;
}

// Get all available newsletter slugs
export async function generateStaticParams() {
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
    
    return files
      .filter(file => file.startsWith('newsletter_') && file.endsWith('.md'))
      .map(file => ({
        slug: file.replace('newsletter_', '').replace('.md', '')
      }));
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

// Get newsletter data
async function getNewsletter(slug: string) {
  try {
    // Find the newsletter file
    const filePath = findNewsletterPath(slug);
    
    if (!filePath) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract title - look for the first ### line after removing "THE DAILY BRIEF"
    const contentWithoutHeader = content.replace(/^# THE DAILY BRIEF\s*\n/, '');
    const titleMatch = contentWithoutHeader.match(/^### (.*?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1] : 'Daily Brief Intelligence Newsletter';
    
    // Format date for display
    const dateParts = slug.split('-');
    let formattedDate = slug;
    
    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).toLowerCase();
    }
    
    // Convert markdown to HTML
    const htmlContent = markdownToHtml(content);
    
    return {
      slug,
      title: title.includes(": ") ? title.split(": ")[1].replace(/"/g, '') : title,
      date: formattedDate,
      content: htmlContent
    };
  } catch (error) {
    console.error('Error reading newsletter:', error);
    return null;
  }
}

type Params = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Params) {
  const newsletter = await getNewsletter(params.slug);
  
  if (!newsletter) {
    return {
      title: 'Newsletter Not Found',
      description: 'The requested newsletter could not be found.'
    };
  }
  
  return {
    title: newsletter.title,
    description: `Daily Brief Intelligence - ${newsletter.date}`
  };
}

export default async function NewsletterPage({ params }: Params) {
  const newsletter = await getNewsletter(params.slug);
  
  if (!newsletter) {
    notFound();
  }
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="inline-block mb-8 font-mono text-sm text-foreground hover:opacity-80 transition-opacity">
          ← back to home
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">{newsletter.title}</h1>
        <p className="text-sm text-muted-foreground mb-8 date-text">{newsletter.date}</p>
        
        <div 
          className="prose prose-stone dark:prose-invert max-w-none font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: newsletter.content }} 
        />
      </div>
    </main>
  );
} 