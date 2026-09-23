#!/usr/bin/env node
/* Export PNG transparents 1920×1080 de tous les éléments de l'overlay.
   Usage : node render.js            (nécessite Playwright + Chromium) */
'use strict';
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = __dirname;
const OUT = path.join(ROOT, 'export');
const url = (q) => 'file://' + path.join(ROOT, 'overlay.html') + '?static=1&' + q;
const pad = (n) => String(n).padStart(2, '0');
const SW = { x: 20, y: 958, width: 1600, height: 112 };   // doit correspondre à overlay.css
const DK = { x: 1680, y: 846, width: 200, height: 220 };
const PCT = (l) => Math.round(((14 - l) / 14) * 100);

const LAYERS = [
  ['01_decor_energie', 'decor'],
  ['02_branding_z3_team_z3f4', 'brand'],
  ['03_cadre_webcam', 'webcam'],
  ['04_viewers', 'viewers'],
  ['05_widgets_acheteur_follow_supporter', 'widgets'],
  ['06_partenaire_la_maison_du_tcg', 'partner'],
  ['07_objectif_du_live', 'goal'],
  ['08_zone_alertes', 'alerts'],
  ['09_jauge_rail', 'gauge'],
  ['10_chrono_cadre', 'timer'],
];

(async () => {
  for (const d of ['calques', 'sandwich', 'sandwich/recadre', 'boisson', 'boisson/recadre', 'apercus']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  const shot = async (q, file, clip) => {
    await page.goto(url(q));
    await page.waitForSelector('body[data-ready]');
    await page.screenshot({ path: path.join(OUT, file), omitBackground: true, clip });
    console.log('✔', file);
  };

  for (const [name, id] of LAYERS) await shot('only=' + id, `calques/${name}.png`);
  await shot('only=timer&digits=1&time=00:00:00', 'calques/10b_chrono_exemple_00-00-00.png');

  for (let l = 0; l < 15; l++) {
    const tag = `${pad(l + 1)}_${pad(PCT(l)).padStart(3, '0')}pct`;
    await shot(`only=sandwich&level=${l}`, `sandwich/sandwich_${tag}.png`);
    await shot(`only=sandwich&level=${l}`, `sandwich/recadre/sandwich_${tag}.png`, SW);
    await shot(`only=drink&level=${l}`, `boisson/boisson_${tag}.png`);
    await shot(`only=drink&level=${l}`, `boisson/recadre/boisson_${tag}.png`, DK);
  }

  await shot('level=0', 'overlay_complet_1920x1080.png');
  await shot('level=0&only=decor,brand,webcam,viewers,widgets,partner,goal,alerts,gauge,timer', 'overlay_sans_sandwich_ni_boisson.png');
  for (const [l, t] of [[0, '03:00:00'], [7, '01:30:00'], [11, '00:38:34'], [14, '00:00:00']]) {
    await shot(`level=${l}&demo=1&digits=1&time=${t}&previewbg=1`, `apercus/apercu_niveau_${pad(l + 1)}.png`);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
