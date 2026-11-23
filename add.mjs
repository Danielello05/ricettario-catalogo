// Aggiunge o aggiorna un ingrediente nel catalogo.
// Uso:  node add.mjs "Mascarpone" [foto.jpg] [emoji]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(dir, 'catalog.json');
const [name, photo, emoji] = process.argv.slice(2);
if (!name) { console.log('Uso: node add.mjs "Nome" [foto.jpg] [emoji]'); process.exit(1); }

export const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const clean = name.replace(/\s+/g, ' ').trim();
const key = slug(clean);
const cat = JSON.parse(fs.readFileSync(file, 'utf8'));
let e = cat.ingredients.find((i) => i.key === key);
if (!e) { e = { key, name: clean.charAt(0).toUpperCase() + clean.slice(1) }; cat.ingredients.push(e); }
if (emoji) e.emoji = emoji;
if (photo) {
  const ext = path.extname(photo).toLowerCase() || '.jpg';
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  fs.copyFileSync(photo, path.join(dir, 'images', key + ext));
  e.image = `images/${key}${ext}?v=${Date.now()}`; // il ?v= fa riscaricare la foto a tutti
}
cat.ingredients.sort((a, b) => a.name.localeCompare(b.name, 'it'));
cat.version = (cat.version || 0) + 1;
fs.writeFileSync(file, JSON.stringify(cat, null, 1) + '\n');
console.log(`OK: «${e.name}» ${e.image ? 'con foto' : e.emoji ? 'con emoji' : 'senza foto'}. Ora fai commit e push.`);
