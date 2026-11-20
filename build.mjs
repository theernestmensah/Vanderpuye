import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const origin = new URL(process.env.SITE_URL || process.env.URL);
if (origin.protocol !== 'https:') throw new Error('Set SITE_URL to the public HTTPS origin.');
const preview = Boolean(process.env.CONTEXT && process.env.CONTEXT !== 'production');
const output = process.env.BUILD_OUTPUT || 'dist';
await mkdir(output, { recursive: true });
for (const file of ['img', 'assets', '404.html', 'thanks.html', 'apple-touch-icon.png', 'favicon.ico', 'favicon-32.png', 'launch.ics']) {
  await cp(file, output + '/' + file, { recursive: true, filter: source => !source.endsWith('index-Dlv8k-Qb.js') });
}
const urls = [];
for (const [file, path] of [['index.html', '/'], ['privacy.html', '/privacy']]) {
  const html = await readFile(file, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
  const url = new URL(path, origin.origin).href;
  const image = new URL('/img/lion-badge-512.png', origin.origin).href;
  const tags = [
    '<link rel="canonical" href="' + url + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:url" content="' + url + '">',
    '<meta property="og:title" content="' + title + '">',
    '<meta property="og:description" content="' + description + '">',
    '<meta property="og:image" content="' + image + '">',
    '<meta property="og:image:alt" content="Vanderpuye campaign lion badge">',
    '<meta name="twitter:card" content="summary">',
    '<meta name="twitter:image" content="' + image + '">',
    '<meta name="twitter:image:alt" content="Vanderpuye campaign lion badge">'
  ];
  if (preview) tags.push('<meta name="robots" content="noindex">');
  await writeFile(output + '/' + file, html.replace(/<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>\s*/g, '').replace('</head>', tags.join('\n') + '\n</head>'));
  urls.push(url);
}
await writeFile(output + '/robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + origin.origin + '/sitemap.xml\n');
await writeFile(output + '/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => '  <url><loc>' + url + '</loc></url>').join('\n') + '\n</urlset>\n');
