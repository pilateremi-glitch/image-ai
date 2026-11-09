#!/usr/bin/env node
/* Intègre les fonds (preview/fond-*) dans data/fonds.js en images JPEG embarquées.
   Nécessaire pour la vidéo récap : un canvas qui dessine des fichiers locaux ne peut pas être enregistré.
   Usage : cd z3-overlay/tools && node build-fonds.mjs   (relancer après avoir ajouté/changé un fond) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'preview'), out = {};
for (const f of fs.readdirSync(dir).filter((f) => /^fond-.*\.(png|jpe?g|webp)$/i.test(f)).sort()) {
  const buf = await sharp(path.join(dir, f)).resize(720, 1280, { fit: 'cover', position: 'top' }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  out[f] = 'data:image/jpeg;base64,' + buf.toString('base64');
  console.log(f, Math.round(buf.length / 1024) + ' Ko');
}
fs.writeFileSync(path.join(ROOT, 'data', 'fonds.js'), '/* Fonds intégrés — générés par tools/build-fonds.mjs */\nwindow.Z3FONDS=' + JSON.stringify(out) + ';\n');
