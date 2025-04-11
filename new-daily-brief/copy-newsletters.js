// Script to copy newsletters from intelligence folder to public data
const fs = require('fs');
const path = require('path');

// Paths
const intelligenceDir = path.join(__dirname, '..', 'daily brief intelligence');
const publicDataDir = path.join(__dirname, 'public', 'data');

// Ensure public data directory exists
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
  console.log(`Created directory: ${publicDataDir}`);
}

// Check if intelligence directory exists
if (!fs.existsSync(intelligenceDir)) {
  console.log(`Intelligence directory not found: ${intelligenceDir}`);
  process.exit(0);
}

// Copy newsletter files
try {
  const files = fs.readdirSync(intelligenceDir);
  const newsletterFiles = files.filter(file => file.startsWith('newsletter_') && file.endsWith('.md'));
  
  console.log(`Found ${newsletterFiles.length} newsletters to copy`);
  
  newsletterFiles.forEach(file => {
    const sourcePath = path.join(intelligenceDir, file);
    const destPath = path.join(publicDataDir, file);
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied: ${file}`);
  });
  
  console.log('Newsletter copy complete!');
} catch (error) {
  console.error('Error copying newsletters:', error);
  process.exit(1);
} 