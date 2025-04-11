import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import Link from 'next/link';

// Helper function to convert markdown to HTML
function markdownToHtml(markdown: string): string {
  // Process headings
  let html = markdown
    .replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-semibold mb-4">$1</h3>')
    .replace(/^#### (.*?)$/gm, '<h4 class="text-lg font-semibold mb-3">$1</h4>')
    .replace(/^##### (.*?)$/gm, '<h5 class="text-base font-semibold mb-2">$1</h5>');

  // Process paragraphs (ensure they're wrapped)
  html = html.replace(/^(?!(#|<h|<ul|<ol|<li|<blockquote|<pre|<code|$))(.+)$/gm, '<p class="mb-4">$2</p>');

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

  // Process horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-muted" />');

  // Process bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Process italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Process links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:opacity-80">$1</a>');

  return html;
}

// Get newsletter data
async function getNewsletter(slug: string) {
  try {
    const dirPath = path.join(process.cwd(), '..', 'daily brief intelligence');
    const filePath = path.join(dirPath, `newsletter_${slug}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract title
    const titleMatch = content.match(/^# THE DAILY BRIEF\s*\n### (.*?)(?:\n|$)/);
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
      title: title.split(": ")[1]?.replace(/"/g, '') || title,
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
          className="prose prose-stone dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: newsletter.content }} 
        />
      </div>
    </main>
  );
} 