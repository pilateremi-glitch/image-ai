# 🔥 Z3 LIVE — TEAM Z3F4 × LA MAISON DU TCG — Overlay OBS 1920×1080

Overlay anime / TCG / néon nocturne (noir, violet électrique, fuchsia, blanc) avec la **jauge sandwich + boisson** comme mécanique signature du live :
**« LE LIVE SE TERMINE QUAND IL NE RESTE PLUS RIEN 😈 »**

Tout est vectoriel (SVG), donc net à n'importe quelle taille. Chaque élément existe en PNG transparent 1920×1080 séparé.

---

## Option A — Overlay LIVE automatique (recommandé)

Une seule source navigateur qui gère tout : chrono, sandwich (15 niveaux) et boisson (15 niveaux) qui se remplacent automatiquement, avec fondu et onomatopées manga (« CROC ! », « SLURP ! »).

1. OBS → **Sources → + → Navigateur**
2. Cocher **Fichier local** → choisir `z3-overlay/overlay.html`
3. Largeur **1920**, hauteur **1080**
4. Pour régler la durée du live, décocher « Fichier local » et mettre l'URL :
   `file:///C:/chemin/vers/z3-overlay/overlay.html?duration=3h`

### Paramètres d'URL

| Paramètre | Exemple | Effet |
|---|---|---|
| `duration` | `3h`, `2h30m`, `90m`, `03:00:00` | Durée totale du live (par défaut 3h) |
| `reset` | `&reset` | Relance le chrono depuis le début |
| `paused` | `&paused` | Démarre en pause |
| `only` | `&only=sandwich,drink,timer` | N'affiche que certains calques |
| `buyer`, `follow`, `top`, `viewers`, `goal`, `goalpct` | `&goal=DISPLAY 151&goalpct=40` | Textes fixes des widgets |

Calques pour `only` : `decor, brand, webcam, viewers, widgets, partner, goal, alerts, gauge, timer, sandwich, drink`.

Le chrono est **sauvegardé** : si OBS redémarre ou que la source est rafraîchie, le temps continue (sauf avec `&reset`).

### Contrôles pendant le live
Clic droit sur la source → **Interagir**, puis :

| Touche | Action |
|---|---|
| `Espace` | Pause / reprise |
| `↑` ou `+` | +5 minutes |
| `↓` ou `-` | −5 minutes |
| `→` / `←` | +1 / −1 minute |
| `R` | Remise à zéro |

Les 5 dernières minutes, le chrono clignote en rouge.

Pour **Dernier acheteur / Dernier follow / Top supporter / Viewers / Alertes** : place tes widgets StreamElements ou Streamlabs (ou des sources Texte OBS) par-dessus les emplacements prévus. Si tu veux les données en direct, ajoute l'overlay avec `&only=decor,brand,webcam,partner,gauge,timer,sandwich,drink` et tes propres widgets au-dessus.

---

## Option B — PNG séparés (`export/`)

Tous les fichiers sont en **PNG RGBA transparent**, sans ombre de fond ni décor opaque.

```
export/
├─ overlay_complet_1920x1080.png          ← tout en un (sandwich plein)
├─ overlay_sans_sandwich_ni_boisson.png   ← base fixe à combiner avec les frames
├─ calques/                               ← 1920×1080, un élément par fichier
│   01_decor_energie · 02_branding_z3_team_z3f4 · 03_cadre_webcam · 04_viewers
│   05_widgets_acheteur_follow_supporter · 06_partenaire_la_maison_du_tcg
│   07_objectif_du_live · 08_zone_alertes · 09_jauge_rail
│   10_chrono_cadre · 10b_chrono_exemple_00-00-00
├─ sandwich/  sandwich_01_100pct.png … sandwich_15_000pct.png   (1920×1080, position finale)
│   └─ recadre/  mêmes 15 niveaux recadrés 1600×112
├─ boisson/   boisson_01_100pct.png … boisson_15_000pct.png     (1920×1080, position finale)
│   └─ recadre/  mêmes 15 niveaux recadrés 200×220
└─ apercus/   maquettes sur fond de stream (niveaux 1, 8, 12, 15)
```

Les 15 frames du sandwich et de la boisson ont **exactement la même position, taille, perspective et éclairage** : en 1920×1080, tu les poses toutes à (0,0) et tu n'as qu'à changer d'image.

| Niveau | Sandwich | Boisson |
|---|---|---|
| 01 | 100 % entier | pleine, 4 glaçons |
| 04–05 | ~75 % | ~75 % |
| 08 | 50 % | 50 % |
| 11–12 | ~25 % | ~25 %, glaçons fondus |
| 14 | petit bout | quelques gouttes |
| 15 | que des miettes | vide |

Placement des versions recadrées : sandwich en **x=20, y=958**, boisson en **x=1680, y=846**.

### Zones prévues (pour caler tes sources)

| Zone | Position (x, y, largeur × hauteur) |
|---|---|
| Webcam (intérieur du cadre) | 1456, 112, 436 × 247 |
| Objectif du live | 20, 184, 340 × 150 |
| Alertes | 36, 410, 308 × 198 |
| Dernier acheteur / follow / top supporter (texte) | 1538, 421 / 509 / 597 |
| Viewers (texte) | 1757, 50 |
| Chrono (texte) | centré sur 960, 906 |
| **Zone centrale propre** | ~380 → 1430 en x, 160 → 840 en y |

---

## Régénérer les PNG

```bash
cd z3-overlay
npm i -D playwright      # si Playwright n'est pas déjà installé
node render.js
```

Le dessin est dans `src/art.js` (sandwich, boisson, emblème Maison du TCG), la mise en page dans `src/overlay.css` et `src/overlay.js`.
