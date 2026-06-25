import fs from 'fs';
import path from 'path';

// ====== Data ======
const newCategories = [
  { id: 'archive', name: 'Archive & Compression', description: 'Create and extract ZIP, RAR, 7z, TAR, GZ archives.', icon: 'FolderArchive', color: 'from-amber-600 to-yellow-700' },
  { id: 'network', name: 'Network & Browser', description: 'Check IP, parse user-agent, speed test, and URL tools.', icon: 'Globe', color: 'from-blue-600 to-sky-700' },
  { id: 'social', name: 'Social & Marketing', description: 'Meta tags, YouTube thumbnails, hashtags, email signatures, and QR/barcode scanning.', icon: 'Share2', color: 'from-indigo-600 to-violet-700' },
  { id: 'design', name: 'Design & Creative', description: 'Meme generator, image collage, splitter, favicon, whiteboard, and color palette from image.', icon: 'Paintbrush', color: 'from-pink-600 to-rose-700' },
  { id: 'productivity', name: 'Productivity & Office', description: 'OCR, handwriting generation, PDF to CSV, and Word document tools.', icon: 'Briefcase', color: 'from-teal-600 to-emerald-700' },
  { id: 'fun', name: 'Smart & Fun', description: 'Word clouds, readability scoring, character frequency, spin the wheel, random name picker, and pomodoro timer.', icon: 'Dices', color: 'from-orange-600 to-red-700' },
];

const newTools = [
  // Archive (4)
  { id: 'create-zip', name: 'Create ZIP', path: '/tools/create-zip', category: 'archive', icon: 'FileArchive', keywords: 'zip create compress archive folder'.split(' '), metaTitle: 'Create ZIP Archive Online Free - Compress Files | ToolNest', metaDescription: 'Create ZIP archives from multiple files in your browser. Fast, free, and private.' },
  { id: 'extract-archive', name: 'Extract Archive', path: '/tools/extract-archive', category: 'archive', icon: 'FolderOpen', keywords: 'extract unzip rar 7z tar gz archive'.split(' '), metaTitle: 'Extract ZIP Archive Online Free | ToolNest', metaDescription: 'Extract ZIP archives in your browser. Download individual files or all at once.' },
  { id: 'compress-folder', name: 'Compress Folder to ZIP', path: '/tools/compress-folder', category: 'archive', icon: 'FolderInput', keywords: 'zip folder compress directory'.split(' '), metaTitle: 'Compress Folder to ZIP Online Free | ToolNest', metaDescription: 'Compress entire folders to ZIP archives directly in your browser. Free tool.' },
  { id: 'unzip-specific', name: 'Unzip Specific Files', path: '/tools/unzip-specific', category: 'archive', icon: 'Files', keywords: 'zip extract selective partial'.split(' '), metaTitle: 'Extract Specific Files from ZIP Online Free | ToolNest', metaDescription: 'Open ZIP archives and download only selected files. Client-side processing.' },
  // Network (4)
  { id: 'whats-my-ip', name: "What's My IP?", path: '/tools/whats-my-ip', category: 'network', icon: 'Globe', keywords: 'ip address location isp country'.split(' '), metaTitle: "What's My IP Address? - Find Public IP & Location | ToolNest", metaDescription: 'Find your public IP address, country, city, and ISP details instantly.' },
  { id: 'user-agent-parser', name: 'User-Agent Parser', path: '/tools/user-agent-parser', category: 'network', icon: 'Monitor', keywords: 'user agent browser os device'.split(' '), metaTitle: 'User-Agent Parser Online Free - Browser & OS Detector | ToolNest', metaDescription: 'Parse user-agent strings to detect browser, operating system, and device.' },
  { id: 'internet-speed-test', name: 'Internet Speed Test', path: '/tools/internet-speed-test', category: 'network', icon: 'Gauge', keywords: 'speed test bandwidth mbps download'.split(' '), metaTitle: 'Internet Speed Test Online Free - Check Download Speed | ToolNest', metaDescription: 'Test your internet download speed with a quick browser-based benchmark.' },
  { id: 'url-parser', name: 'URL Parser', path: '/tools/url-parser', category: 'network', icon: 'Link', keywords: 'url query parameters parse'.split(' '), metaTitle: 'URL Parser Online Free - Query & Parameter Breakdown | ToolNest', metaDescription: 'Parse URLs to extract protocol, host, path, query parameters, and more.' },
  // Social (6)
  { id: 'meta-tags-preview', name: 'Meta Tags / Open Graph Preview', path: '/tools/meta-tags-preview', category: 'social', icon: 'Tags', keywords: 'meta tags open graph facebook twitter'.split(' '), metaTitle: 'Meta Tags & Open Graph Preview Tool Online Free | ToolNest', metaDescription: 'Preview your meta tags and Open Graph cards for Facebook, Twitter, and LinkedIn.' },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail Downloader', path: '/tools/youtube-thumbnail', category: 'social', icon: 'Youtube', keywords: 'youtube thumbnail download video'.split(' '), metaTitle: 'YouTube Thumbnail Downloader Online Free | ToolNest', metaDescription: 'Download YouTube video thumbnails in HD, SD, and default qualities for free.' },
  { id: 'hashtag-generator', name: 'Hashtag Generator', path: '/tools/hashtag-generator', category: 'social', icon: 'Hash', keywords: 'hashtag social media marketing'.split(' '), metaTitle: 'Hashtag Generator Online Free - Social Media Tags | ToolNest', metaDescription: 'Generate social media hashtags from keywords. Boost your post visibility.' },
  { id: 'email-signature', name: 'Email Signature Generator', path: '/tools/email-signature', category: 'social', icon: 'Mail', keywords: 'email signature html generator'.split(' '), metaTitle: 'Email Signature Generator Online Free - HTML | ToolNest', metaDescription: 'Create professional HTML email signatures with contact info and branding.' },
  { id: 'qr-code-scanner', name: 'QR Code Scanner', path: '/tools/qr-code-scanner', category: 'social', icon: 'ScanLine', keywords: 'qr code scanner webcam image'.split(' '), metaTitle: 'QR Code Scanner Online Free - Camera & Image | ToolNest', metaDescription: 'Scan QR codes using your webcam or by uploading an image. Free online tool.' },
  { id: 'barcode-generator', name: 'Barcode Generator / Scanner', path: '/tools/barcode-generator', category: 'social', icon: 'Barcode', keywords: 'barcode generator scanner code128 ean'.split(' '), metaTitle: 'Barcode Generator & Scanner Online Free - Code128 / EAN | ToolNest', metaDescription: 'Generate Code128 and EAN barcodes or scan barcodes from images. Free tool.' },
  // Design (6)
  { id: 'meme-generator', name: 'Meme Generator', path: '/tools/meme-generator', category: 'design', icon: 'Laugh', keywords: 'meme generator image text overlay'.split(' '), metaTitle: 'Meme Generator Online Free - Add Text to Images | ToolNest', metaDescription: 'Create memes by uploading images and adding top and bottom text. Download as PNG.' },
  { id: 'image-collage', name: 'Image Collage Maker', path: '/tools/image-collage', category: 'design', icon: 'Grid3x3', keywords: 'collage image grid layout'.split(' '), metaTitle: 'Image Collage Maker Online Free - Grid Layouts | ToolNest', metaDescription: 'Create image collages with customizable grid layouts. Combine photos in your browser.' },
  { id: 'image-splitter', name: 'Image Splitter', path: '/tools/image-splitter', category: 'design', icon: 'Split', keywords: 'image split grid instagram tiles'.split(' '), metaTitle: 'Image Splitter Online Free - Grid & Tiles | ToolNest', metaDescription: 'Split images into grids and tiles. Perfect for Instagram carousel posts.' },
  { id: 'favicon-generator', name: 'Favicon Generator', path: '/tools/favicon-generator', category: 'design', icon: 'Square', keywords: 'favicon ico icon website'.split(' '), metaTitle: 'Favicon Generator Online Free - Multi-Size PNGs | ToolNest', metaDescription: 'Generate favicon images at 16x16 to 256x256 from a square image. Free tool.' },
  { id: 'whiteboard', name: 'Drawing / Whiteboard', path: '/tools/whiteboard', category: 'design', icon: 'Pencil', keywords: 'draw whiteboard sketch canvas'.split(' '), metaTitle: 'Online Whiteboard & Drawing Tool Free | ToolNest', metaDescription: 'Draw and sketch on an online whiteboard with multiple tools. Download as PNG.' },
  { id: 'palette-from-image', name: 'Color Palette from Image', path: '/tools/palette-from-image', category: 'design', icon: 'Palette', keywords: 'color palette image extract dominant'.split(' '), metaTitle: 'Color Palette from Image Online Free | ToolNest', metaDescription: 'Extract dominant colors from any image and copy hex codes. Free tool.' },
  // Productivity (5)
  { id: 'ocr-image', name: 'OCR Image to Text', path: '/tools/ocr-image', category: 'productivity', icon: 'Scan', keywords: 'ocr text recognition image extract'.split(' '), metaTitle: 'OCR Image to Text Online Free - Tesseract | ToolNest', metaDescription: 'Extract text from images and scanned documents using Tesseract OCR. Private & free.' },
  { id: 'handwriting-generator', name: 'Handwriting Text Generator', path: '/tools/handwriting-generator', category: 'productivity', icon: 'Pen', keywords: 'handwriting font text generator'.split(' '), metaTitle: 'Handwriting Text Generator Online Free | ToolNest', metaDescription: 'Convert typed text into handwriting-style images. Save as PNG.' },
  { id: 'pdf-to-excel', name: 'PDF to Excel / CSV', path: '/tools/pdf-to-excel', category: 'productivity', icon: 'FileSpreadsheet', keywords: 'pdf csv excel convert tables'.split(' '), metaTitle: 'PDF to Excel / CSV Converter Online Free | ToolNest', metaDescription: 'Convert PDF tables and text to CSV format directly in your browser. Free.' },
  { id: 'merge-word', name: 'Merge Word Documents', path: '/tools/merge-word', category: 'productivity', icon: 'FileMerge', keywords: 'word merge docx combine'.split(' '), metaTitle: 'Merge Word Documents Online Free - DOCX | ToolNest', metaDescription: 'Merge multiple Word documents into one. Simple text-only merge in browser.' },
  { id: 'split-word', name: 'Split Word Document', path: '/tools/split-word', category: 'productivity', icon: 'FileSplit', keywords: 'word split docx separate'.split(' '), metaTitle: 'Split Word Document Online Free - DOCX | ToolNest', metaDescription: 'Split Word documents into multiple files. Simple text extraction and splitting.' },
  // Fun (5)
  { id: 'word-cloud', name: 'Word Cloud Generator', path: '/tools/word-cloud', category: 'fun', icon: 'Cloud', keywords: 'word cloud frequency text visual'.split(' '), metaTitle: 'Word Cloud Generator Online Free - Text Visualization | ToolNest', metaDescription: 'Generate beautiful word clouds from any text. Customize colors and download as PNG.' },
  { id: 'readability-score', name: 'Readability Score', path: '/tools/readability-score', category: 'fun', icon: 'BookOpen', keywords: 'readability flesch kincaid grade level'.split(' '), metaTitle: 'Readability Score Calculator Online Free | ToolNest', metaDescription: 'Calculate Flesch Reading Ease and grade level for your text. Free online tool.' },
  { id: 'char-frequency', name: 'Character Frequency Counter', path: '/tools/char-frequency', category: 'fun', icon: 'BarChart3', keywords: 'character frequency chart letter'.split(' '), metaTitle: 'Character Frequency Counter Online Free - Text Stats | ToolNest', metaDescription: 'Count the frequency of each character in your text and visualize as a bar chart.' },
  { id: 'spin-wheel', name: 'Spin the Wheel', path: '/tools/spin-wheel', category: 'fun', icon: 'RotateCw', keywords: 'spin wheel random picker chance'.split(' '), metaTitle: 'Spin the Wheel Online Free - Random Picker | ToolNest', metaDescription: 'Spin a customizable wheel to randomly pick a winner. Fun and free online tool.' },
  { id: 'random-name-picker', name: 'Random Name Picker', path: '/tools/random-name-picker', category: 'fun', icon: 'Users', keywords: 'random name picker draw winner'.split(' '), metaTitle: 'Random Name Picker Online Free - Draw Winner | ToolNest', metaDescription: 'Enter names and randomly pick winners. Great for giveaways and raffles.' },
  // Extra Audio/Video (4)
  { id: 'screen-recorder', name: 'Screen Recorder', path: '/tools/screen-recorder', category: 'video', icon: 'Monitor', keywords: 'screen record capture desktop'.split(' '), metaTitle: 'Screen Recorder Online Free - Browser Capture | ToolNest', metaDescription: 'Record your screen directly in your browser. Download as WebM. No installation.' },
  { id: 'webcam-recorder', name: 'Webcam Recorder / Photo Booth', path: '/tools/webcam-recorder', category: 'video', icon: 'Camera', keywords: 'webcam record photo booth camera'.split(' '), metaTitle: 'Webcam Recorder & Photo Booth Online Free | ToolNest', metaDescription: 'Record from your webcam or take photos. Download images and videos. Free tool.' },
  { id: 'karaoke-recorder', name: 'Karaoke Recorder', path: '/tools/karaoke-recorder', category: 'audio', icon: 'Mic2', keywords: 'karaoke record sing audio mix'.split(' '), metaTitle: 'Karaoke Recorder Online Free - Sing & Record | ToolNest', metaDescription: 'Sing along to instrumental tracks and record your performance. Free browser tool.' },
];

// ====== Update tools.ts ======
const toolsPath = path.join(process.cwd(), 'src', 'data', 'tools.ts');
let toolsContent = fs.readFileSync(toolsPath, 'utf8');

// Insert new categories
const catInsertPoint = toolsContent.indexOf('];', toolsContent.indexOf('export const categories'));
const categoriesContent = newCategories.map(c => `  {
    id: '${c.id}',
    name: '${c.name}',
    description: '${c.description}',
    icon: '${c.icon}',
    color: '${c.color}',
  },`).join('\n');

if (!toolsContent.includes("id: 'archive'")) {
  toolsContent = toolsContent.slice(0, catInsertPoint) + categoriesContent + '\n' + toolsContent.slice(catInsertPoint);
}

// Insert new tools (before the closing ]; of the tools array)
const toolsEndIdx = toolsContent.lastIndexOf('];', toolsContent.indexOf('export const popularTools'));
const toolsContentStr = newTools.map(t => `  {
    id: '${t.id}',
    name: '${t.name}',
    description: '${t.metaDescription.replace(/'/g, "\\'")}',
    category: '${t.category}',
    path: '${t.path}',
    icon: '${t.icon}',
    keywords: [${t.keywords.map(k => `'${k}'`).join(', ')}],
    metaTitle: '${t.metaTitle.replace(/'/g, "\\'")}',
    metaDescription: '${t.metaDescription.replace(/'/g, "\\'")}',
  },`).join('\n');

if (!toolsContent.includes("id: 'create-zip'")) {
  toolsContent = toolsContent.slice(0, toolsEndIdx) + '\n' + toolsContent.slice(toolsEndIdx);
  // After inserting newline, the array end moved, find it again and insert tools
  const newEndIdx = toolsContent.lastIndexOf('];', toolsContent.indexOf('export const popularTools'));
  toolsContent = toolsContent.slice(0, newEndIdx) + toolsContentStr + '\n' + toolsContent.slice(newEndIdx);
}

fs.writeFileSync(toolsPath, toolsContent, 'utf8');
console.log('Updated src/data/tools.ts');
