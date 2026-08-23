'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const homepage = path.join(root, 'index.html');
let html = fs.readFileSync(homepage, 'utf8');

const origin = 'https://ai4businesses.org/';
const title = 'AI Automation for Business | AI4 Businesses';
const description = 'Explore practical AI automation for business calls, lead capture, customer intake, routing, response management, follow-up, and operating workflows through AI4 Businesses.';

function upsert(re, tag) {
  html = re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `${tag}\n</head>`);
}

upsert(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
upsert(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}">`);
upsert(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">');
upsert(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${origin}">`);
upsert(/<meta\s+property=["']og:type["'][^>]*>/i, '<meta property="og:type" content="website">');
upsert(/<meta\s+property=["']og:site_name["'][^>]*>/i, '<meta property="og:site_name" content="AI4 Businesses">');
upsert(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}">`);
upsert(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}">`);
upsert(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${origin}">`);
upsert(/<meta\s+name=["']twitter:card["'][^>]*>/i, '<meta name="twitter:card" content="summary">');
upsert(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}">`);
upsert(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${description}">`);

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://aproposgroupllc.com/#organization',
      name: 'APROPOS Group LLC',
      url: 'https://aproposgroupllc.com/'
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ai4businesses.org/#website',
      url: origin,
      name: 'AI4 Businesses',
      publisher: { '@id': 'https://aproposgroupllc.com/#organization' }
    },
    {
      '@type': 'Service',
      '@id': 'https://ai4businesses.org/#service',
      name: 'AI4 Businesses',
      url: origin,
      provider: { '@id': 'https://aproposgroupllc.com/#organization' },
      description,
      serviceType: 'Business process automation and AI workflow systems'
    }
  ]
};
const schemaTag = `<script id="ai4businesses-seo-entity" type="application/ld+json">${JSON.stringify(schema)}</script>`;
if (/<script id=["']ai4businesses-seo-entity["'][\s\S]*?<\/script>/i.test(html)) {
  html = html.replace(/<script id=["']ai4businesses-seo-entity["'][\s\S]*?<\/script>/i, schemaTag);
} else {
  html = html.replace(/<\/head>/i, `${schemaTag}\n</head>`);
}
fs.writeFileSync(homepage, html, 'utf8');

function htmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', '.netlify', 'node_modules', 'netlify'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const urls = new Set();
for (const file of htmlFiles(root)) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)
    || source.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i);
  if (!match) continue;
  try {
    const u = new URL(match[1]);
    if (u.protocol === 'https:' && u.hostname === 'ai4businesses.org') urls.add(u.href);
  } catch (_) {}
}
urls.add(origin);

const ordered = [...urls].sort((a, b) => a === origin ? -1 : b === origin ? 1 : a.localeCompare(b));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ordered.map(url => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /.netlify/\n\nSitemap: https://ai4businesses.org/sitemap.xml\n`, 'utf8');

for (const required of [origin, description, 'ai4businesses-seo-entity']) {
  if (!html.includes(required)) throw new Error(`[ai4businesses-seo] homepage missing ${required}`);
}
if (!ordered.length || !sitemap.includes(origin)) throw new Error('[ai4businesses-seo] sitemap missing homepage');
console.log(`[ai4businesses-seo] PASS — homepage metadata/entity graph and crawl files generated for ${ordered.length} canonical URLs`);
