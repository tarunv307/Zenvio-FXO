import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const BASE_URL = 'https://zenvio-fxo.vercel.app';
const TODAY = new Date().toISOString().split('T')[0];

// 1. Read tools.ts
const toolsFilePath = path.join(projectRoot, 'src', 'data', 'tools.ts');
const toolsContent = fs.readFileSync(toolsFilePath, 'utf8');

// Extract category IDs
const categoryMatches = toolsContent.matchAll(/id:\s*'([a-z0-9_-]+)'/g);
const categories = [];
for (const match of categoryMatches) {
  const id = match[1];
  if (['imagekit', 'pdfkit', 'dockit', 'studentkit', 'careerkit', 'devkit', 'mediakit', 'privacykit', 'qrkit', 'aikit'].includes(id)) {
    if (!categories.includes(id)) {
      categories.push(id);
    }
  }
}

// Extract live tool slugs
const slugMatches = toolsContent.matchAll(/slug:\s*'([a-z0-9_-]+)'/g);
const toolSlugs = [];
for (const match of slugMatches) {
  const slug = match[1];
  if (!toolSlugs.includes(slug)) {
    toolSlugs.push(slug);
  }
}

// 2. Read Government Jobs data
const jobsFilePath = path.join(projectRoot, 'src', 'data', 'jobs', 'curatedJobs.ts');
let jobSlugs = [];
if (fs.existsSync(jobsFilePath)) {
  const jobsContent = fs.readFileSync(jobsFilePath, 'utf8');
  const jobSlugMatches = jobsContent.matchAll(/slug:\s*'([a-z0-9_-]+)'/g);
  for (const match of jobSlugMatches) {
    const slug = match[1];
    if (!jobSlugs.includes(slug)) {
      jobSlugs.push(slug);
    }
  }
}

const govtJobCategories = [
  'central-government',
  'tamil-nadu',
  'railway',
  'ssc',
  'upsc',
  'banking',
  'defence',
  'admit-cards',
  'results',
];

const urls = [
  // Homepage
  { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
  // Tools index
  { loc: `${BASE_URL}/tools`, priority: '0.9', changefreq: 'daily' },
  // Government Jobs Portal Home
  { loc: `${BASE_URL}/jobs`, priority: '0.9', changefreq: 'daily' },
  // Static informative pages
  { loc: `${BASE_URL}/about`, priority: '0.6', changefreq: 'monthly' },
  { loc: `${BASE_URL}/faq`, priority: '0.6', changefreq: 'weekly' },
  { loc: `${BASE_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${BASE_URL}/terms`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${BASE_URL}/contact`, priority: '0.5', changefreq: 'monthly' },
];

// Add tool category pages
for (const cat of categories) {
  urls.push({
    loc: `${BASE_URL}/category/${cat}`,
    priority: '0.8',
    changefreq: 'weekly',
  });
}

// Add Government Jobs category pages
for (const jobCat of govtJobCategories) {
  urls.push({
    loc: `${BASE_URL}/jobs/${jobCat}`,
    priority: '0.8',
    changefreq: 'daily',
  });
}

// Add tool pages
for (const slug of toolSlugs) {
  urls.push({
    loc: `${BASE_URL}/tools/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  });
}

// Add individual Government Job pages
for (const slug of jobSlugs) {
  urls.push({
    loc: `${BASE_URL}/jobs/${slug}`,
    priority: '0.8',
    changefreq: 'daily',
  });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const outputPath = path.join(projectRoot, 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, xml, 'utf8');

console.log(`Successfully generated sitemap.xml with ${urls.length} verified URLs at ${outputPath}`);
