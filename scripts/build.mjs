// Dependency-free staging: only public assets reach Cloudflare's static output.
import { readdir, mkdir, rm, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const excluded = new Set(['dist', 'content', 'functions', 'scripts', 'tests', 'node_modules']);
const extensions = new Set(['.html', '.css', '.map', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico', '.mp4', '.webm', '.mov', '.woff', '.woff2', '.ttf', '.otf', '.pdf', '.mp3', '.wav']);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
async function copyDirectory(relative = '') {
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    if (entry.name.startsWith('.') || excluded.has(entry.name)) continue;
    const name = path.join(relative, entry.name);
    if (entry.isDirectory()) await copyDirectory(name);
    else if (entry.isFile() && (extensions.has(path.extname(entry.name).toLowerCase()) || entry.name === '_headers' || entry.name === '_redirects')) {
      await mkdir(path.dirname(path.join(output, name)), { recursive: true });
      await copyFile(path.join(root, name), path.join(output, name));
    }
  }
}
await copyDirectory();
console.log('Static files staged in dist; content and server functions excluded.');
