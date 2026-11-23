// Scarica da Wikipedia una foto reale per ogni ingrediente del catalogo che non ce l'ha ancora.
// Uso:  node fetch-photos.mjs          (solo quelli senza foto)
//       node fetch-photos.mjs --all    (rifà tutte)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, 'catalog.json');
const TITLES = JSON.parse(fs.readFileSync(path.join(dir, 'photoTitles.json'), 'utf8'));
const UA = 'Ricettario/1.1 (app personale di ricette; script catalogo)';
const API = 'https://it.wikipedia.org/w/api.php';
const all = process.argv.includes('--all');

function candidates(name) {
  if (TITLES[name]) return TITLES[name];
  const list = [name]; const low = name.toLowerCase();
  if (/[ie]$/.test(low)) list.push(name.slice(0, -1) + (low.endsWith('i') ? 'o' : 'a'));
  if (/i$/.test(low)) list.push(name.slice(0, -1) + 'e');
  return list;
}
async function thumb(title) {
  const url = `${API}?action=query&format=json&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error('Wikipedia HTTP ' + res.status);
  const pages = (await res.json())?.query?.pages || {};
  return Object.values(pages).find((p) => p.thumbnail?.source)?.thumbnail.source || null;
}

const cat = JSON.parse(fs.readFileSync(file, 'utf8'));
fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
let ok = 0; const missing = [];
for (const e of cat.ingredients) {
  if (e.image && !all) continue;
  let src = null;
  try { for (const t of candidates(e.name)) { src = await thumb(t); if (src) break; } } catch (err) { console.log('!', e.name, err.message); }
  if (!src) { missing.push(e.name); continue; }
  const res = await fetch(src, { headers: { 'User-Agent': UA } });
  if (!res.ok) { missing.push(e.name); continue; }
  const type = res.headers.get('content-type') || '';
  const ext = type.includes('png') ? '.png' : type.includes('webp') ? '.webp' : '.jpg';
  fs.writeFileSync(path.join(dir, 'images', e.key + ext), Buffer.from(await res.arrayBuffer()));
  e.image = `images/${e.key}${ext}?v=${Date.now()}`;
  ok++; console.log('✓', e.name);
  await new Promise((r) => setTimeout(r, 300)); // con calma, per non farsi bloccare
}
cat.version = (cat.version || 0) + 1;
fs.writeFileSync(file, JSON.stringify(cat, null, 1) + '\n');
console.log(`\nFatto: ${ok} foto scaricate.` + (missing.length ? `\nSenza foto (mettile a mano con add.mjs): ${missing.join(', ')}` : ''));
