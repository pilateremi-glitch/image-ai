# 🔥 Z3 LIVE — TEAM Z3F4 × LE RAINTÉ DU TCG — Overlay OBS 1920×1080

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


### Décors animés & interactifs (`src/fx.js`)

| Paramètre | Effet |
|---|---|
| `&fx` | Pétales de sakura, étincelles d'énergie, éclairs néon, réactions aux niveaux — **sur fond transparent**, utilisable en live |
| `&scene=mix` | Version MIX : les 5 fonds (`preview/fond-*`) s'enchaînent avec un coup de sabre lumineux + zoom lent + parallaxe (active aussi les décors) |
| `&scene=fond-2-z3-violet.png` | Un seul fond animé |
| `&slide=7` | Durée de chaque fond en secondes (mode MIX) |

Réactions automatiques : à chaque bouchée → tremblement d'écran, flash, miettes qui volent, onde de choc. Dernières minutes → vignette rouge qui pulse.

Interactif (clic droit sur la source → **Interagir**) : la souris fait bouger les fonds (parallaxe) et écarte les pétales, **clic** = explosion d'énergie, `B` = fond suivant, `F` = décors on/off.

Exemple scène d'attente / pause : `overlay.html?scene=mix&duration=3h`
Exemple live par-dessus la cam : `overlay.html?fx&duration=3h`


### Thèmes de couleur

`&theme=violet | rouge | cyan | rose | or` change la couleur de toute l'interface (le sandwich et la boisson gardent leurs vraies couleurs).
En mode `scene=…` le thème suit automatiquement le fond : fond 1 → rouge, 2 → violet, 3 → cyan, 4 → rose, 5 → or.

### Alertes en direct (`src/events.js`)

Chaque événement affiche un grand bandeau manga (nom + montant), une explosion de pétales/énergie, met à jour les widgets
(dernier follow, dernier acheteur, top supporter calculé automatiquement) et le fil de la zone Alertes.

| Paramètre | Effet |
|---|---|
| `&se=<JWT>` | Connexion **StreamElements** (Dashboard › Mon compte › Canaux › JWT) |
| `&sl=<token>` | Connexion **Streamlabs** (Paramètres › Clés API › Socket API Token) |
| `&addtime` | Façon subathon : chaque événement **rajoute du temps** (et donc du sandwich) |
| `&t_follow=60&t_sub=300&t_don=60&t_achat=120&t_raid=300&t_bits=60` | Secondes ajoutées (don : par €, bits : par 100) |
| `&demoevents` | Événements de démonstration automatiques |

Tests dans **Interagir** : `1` follow · `2` achat · `3` don · `4` sub · `5` raid. Depuis un script : `Z3.event({ type: 'achat', name: 'Sacha', amount: 49.9 })`.
⚠️ Le jeton StreamElements/Streamlabs est secret : ne partage jamais l'URL complète de la source.


### Alertes spéciales TCG pendant les ouvertures (`src/hits.js`)

Dans **Interagir**, pendant l'ouverture d'un booster :

| Touche | Alerte | Effet |
|---|---|---|
| `6` | **CARTE RARE !** (レア) | carte argentée qui se retourne, 1 étoile |
| `7` | **HIT !!** (当たり) | carte dorée, lignes de vitesse manga, explosions dorées |
| `8` | **SECRÈTE !!!** (シークレット) | carte holo arc-en-ciel animée |
| `9` | **GOD PACK !!!!** (神引き) | tout en même temps, plus long, plusieurs secousses |
| `0` | **FLOP…** (爆死) | carte grise qui tombe, pluie triste |

- `&hitname` : demande le nom de la carte avant l'alerte (ex. « Dracaufeu ex »), affiché sur la carte et sous le titre.
- Compteur **HITS DU LIVE** affiché à l'écran + ajout dans le fil Alertes.
- Script / dock : `Z3.hit('god', 'Luffy Gear 5')`. Démo : `&demohits`.


## 🤖 Détection AUTOMATIQUE des hits (`detecteur.html`)

Le détecteur regarde la **caméra qui filme les cartes**, repère chaque nouvelle carte posée, l'analyse et déclenche **seul** l'alerte RARE / HIT / SECRÈTE / GOD PACK (et FLOP en option) sur l'overlay. Les cartes communes sont ignorées.

### Installation (une fois)

1. **OBS › Outils › Paramètres du serveur WebSocket** : coche « Activer », note le mot de passe (port 4455).
2. **OBS › Docks › Docks de navigateur personnalisés** : nom `Z3 Détecteur`, URL `file:///C:/chemin/vers/z3-overlay/detecteur.html`.
   (Ça marche aussi dans un onglet Chrome sur le même PC.)
3. Dans le dock : mot de passe → **Connecter** → choisis la source qui filme les cartes.
4. **Glisse sur l'aperçu** pour encadrer l'endroit où tu montres les cartes.
5. Calibrage : **A** avec la zone vide, puis **B** avec une carte commune posée dans le cadre.
6. **▶ DÉMARRER LA DÉTECTION**. Montre les cartes une par une, environ 1 seconde immobiles dans le cadre.

L'overlay reçoit les alertes tout seul (dock et sources dans le même OBS). Si besoin, ajoute `&obs&obspass=MOTDEPASSE` à l'URL de l'overlay pour passer par OBS WebSocket.

### Les 3 modes

| Mode | Comment ça décide | Coût |
|---|---|---|
| **Locale** | Analyse d'image : or/gold, holo arc-en-ciel, reflets du foil, illustration pleine carte, comparés à ta carte commune | Gratuit, hors ligne |
| **Hybride** (recommandé) | L'analyse locale filtre ; dès qu'une carte brille, **Claude lit la carte** (nom, symbole de rareté, numéro hors set…) et tranche | Quelques appels par booster |
| **IA seule** | Claude analyse chaque carte posée | 1 appel par carte |

Le mode IA utilise le SDK officiel Anthropic (embarqué dans `vendor/`, aucune connexion CDN) et ta clé API, enregistrée uniquement sur ce PC.
Modèle par défaut : Claude Opus 5.5 (le plus précis) ; Haiku 5.5 disponible pour réduire le coût.

- **GOD PACK auto** : 3 hits dans le même booster → l'alerte GOD PACK remplace la 3ᵉ.
- **FLOP auto** : un booster d'au moins 5 cartes sans hit (pause de 12 s = booster terminé) → alerte FLOP.
- **Sensibilité** : à monter si des hits passent inaperçus, à baisser si des communes déclenchent.
- Le dock sert aussi de **télécommande** : boutons RARE/HIT/SECRÈTE/GOD/FLOP (+ nom de carte), +5 min, −5 min, pause, fond suivant.
- `detecteur.html?simu` : démonstration sans caméra (cartes simulées).


## 📚 Base « master set » interne (`data/`, `base.html`)

Une base complète, embarquée et **hors ligne**, de toutes les extensions :

| Jeu | Contenu | Source |
|---|---|---|
| Pokémon international (FR/EN) | 202 extensions, de Set de Base à Règne Delta (nov. 2026) | TCGdex (MIT) |
| Pokémon japonais | 176 extensions | TCGdex (MIT) |
| One Piece Card Game (FR/EN) | 99 boosters / decks, parallèles et alt arts inclus | Punk Records (site officiel Bandai) |

Pour chaque carte : extension, numéro, nom FR/EN (ou JP), rareté officielle, et **niveau d'alerte** (commune / RARE / HIT / SECRÈTE).
Les numéros hors set (ex. 238/191), les ex / V / VMAX / VSTAR, les illustrations spéciales, gold, SEC, SP, Treasure, et les parallèles One Piece sont classés automatiquement.

**Dans le détecteur** (modes IA et hybride), Claude lit le **code d'extension et le numéro** imprimés sur la carte. La carte est ensuite retrouvée dans la base, qui fait foi : rareté officielle, nom français, et ajout à ta collection.
Le menu « extension ouverte » du dock aide l'identification quand le code est illisible.

**`base.html` — suivi du master set** : progression par extension, filtres Hits & secrètes / Manquantes / Possédées, recherche dans toute la base, compteurs +/−, export/import JSON.
Les cartes identifiées pendant le live y sont ajoutées automatiquement.
Ouvre-la comme dock OBS pour partager la collection avec le détecteur : chaque navigateur garde sa propre copie.

**Mettre la base à jour** (nouvelle extension) :
```bash
cd z3-overlay/tools && npm install && node build-db.mjs
```
Le script lit les fichiers de données comme du texte (sans exécuter de code) et régénère `data/db-pokemon.js` et `data/db-onepiece.js`.


### 👁️ Reconnaissance visuelle locale (sans IA, gratuite)

Le détecteur peut reconnaître **la carte exacte** juste avec la caméra, en comparant son **empreinte visuelle** à celles des images officielles.

1. Sur ton PC (une fois, puis à chaque nouvelle extension) :
   ```bash
   cd z3-overlay/tools && npm install
   node build-prints.mjs                     # Pokémon FR/EN depuis 2023 + tout One Piece
   node build-prints.mjs --sets sv08,me05    # ou seulement les extensions que tu ouvres
   ```
   Le script télécharge les images officielles (TCGdex, site One Piece) et crée `data/print-pokemon.js` et `data/print-onepiece.js`.
   Il reprend là où il s'est arrêté. Compte plusieurs dizaines de minutes pour tout.
2. Dans le dock : refais le calibrage **A (zone vide)**. Il sert à découper précisément la carte.
3. **Choisis l'extension que tu ouvres** dans le menu : la reconnaissance compare alors à ~250 cartes au lieu de milliers, elle est beaucoup plus fiable.

Ordre de décision pour chaque carte : **empreinte reconnue** → rareté officielle de la base (gratuit). Sinon, en mode hybride ou IA : **Claude lit la carte** → base. Sinon : **analyse de brillance**.

### 🖼️ Image de la carte dans l'alerte

L'alerte affiche l'**image officielle** de la carte reconnue. Sans Internet, c'est la **photo de la caméra** qui s'affiche, et en dernier recours la carte Z3.

### 🏆 Récap de fin de live

Pendant le live, l'overlay garde le compte : cartes identifiées, nouvelles cartes du master set, RARE / HIT / SECRÈTE / GOD PACK, et images des hits.
La scène **`scenes.html?mode=end`** affiche ce récap automatiquement (chiffres et galerie des meilleurs hits).
Le récap repart à zéro quand l'overlay est lancé avec `&reset` ou `&newlive`. Aperçu : `scenes.html?mode=end&demo`.


## 🎬 Vidéo récap 9:16 automatique (`recap-video.html`)

À la fin du live, une vidéo verticale **1080×1920** prête pour TikTok, Reels et Shorts, générée directement dans le navigateur.
Elle contient : intro « Récap du live », les chiffres (cartes, nouvelles au master set, hits, secrètes, god pack), les meilleurs hits (image de la carte, nom, « booster de @… »), le podium **Top tireurs** et un outro avec le partenaire.

- Ouvre `recap-video.html` dans **Chrome** et récupère le récap depuis OBS : mot de passe WebSocket, overlay lancé avec `&obs&obspass=…`. Clique ensuite sur **🎬 Générer la vidéo** : le fichier MP4 se télécharge tout seul.
- **Automatique :** `recap-video.html?auto&obspass=MOTDEPASSE` laissé ouvert attend que le chrono arrive à zéro, puis génère et télécharge la vidéo.
- **Musique** : un morceau original **épique façon opening de shōnen** (160 BPM, ré mineur, guitare saturée, taiko, chœurs, cuivres), composé par synthèse avec `tools/build-music.mjs` (aucun extrait, **libre de droits**) et calé sur la vidéo : intro, montée, drop au moment des hits, puis fondu de sortie.
  Il est intégré automatiquement à la vidéo générée. `?nomusic` le désactive. Pour le modifier, édite le script puis lance `node tools/build-music.mjs`, encode en Opus et régénère `data/musique-recap.js` (commandes dans le script).
- Les fonds viennent de `data/fonds.js`. Si tu ajoutes ou changes une image `preview/fond-*`, relance `node tools/build-fonds.mjs`.

## 🏅 Top tireurs du chat (`src/tireurs.js`)

Chaque booster acheté par un viewer lui est attribué, et les hits de **son** booster lui rapportent des points : **RARE 1 · HIT 3 · SECRÈTE 6 · GOD PACK 10**.

- **File d'attente :** chaque achat StreamElements/Streamlabs ajoute un booster au nom de l'acheteur. Option `&boosterprice=6` pour compter `montant ÷ prix`. Tu peux aussi ajouter des boosters à la main dans le dock (pseudo + nombre).
- **Dans le dock :** « ⏭ BOOSTER SUIVANT » passe au prochain booster de la file, « Ouvrir pour » ouvre directement pour un pseudo. Le booster en cours et le classement s'affichent dans le dock.
- **Sur l'overlay :** panneau **TOP TIREURS** (top 5, « BOOSTER DE @… », file d'attente), avec la mention « BOOSTER DE @… » dans chaque alerte de hit. Touche `N` = booster suivant. `&notireurs` masque le panneau.
- **Fin de live :** podium sur la scène « Merci » et dans la vidéo récap.


## 🛒 Acheteurs Voggt / Whatnot → file des boosters (`extension-chrome/`)

Une extension Chrome lit ta **page vendeur** pendant le live. À chaque nouvel achat, le **pseudo** et la **quantité** sont envoyés à l'overlay via OBS WebSocket.
Ça déclenche l'alerte « NOUVEL ACHAT » et ajoute les boosters à la file **Top tireurs**. Ensuite, « Booster suivant » dans le dock ouvre pour le bon viewer.

**Installation (une fois)**
1. Chrome › `chrome://extensions` › active le **Mode développeur** › **Charger l'extension non empaquetée** › choisis le dossier `z3-overlay/extension-chrome`.
2. Clique sur l'icône de l'extension › mot de passe OBS WebSocket › **Enregistrer & tester** (doit afficher « ✔ connecté »).
3. L'overlay doit avoir `&obs&obspass=MOTDEPASSE` dans son URL.

**Réglage par site (une fois par plateforme)**
1. Ouvre ta page vendeur Voggt ou Whatnot avec au moins un achat visible.
2. Extension › **🎯 Apprendre** › clique sur le **pseudo d'un acheteur** dans la liste des ventes.
3. (Optionnel) **🎯 Quantité** › clique sur l'article/quantité d'un achat. « x3 », « 3x », « Qté : 3 » sont reconnus, sinon 1 booster.
4. C'est tout : l'extension mémorise le réglage pour ce site. Les achats déjà affichés au moment du réglage ne sont pas comptés, seulement les nouveaux.

Le popup affiche les derniers acheteurs lus et un journal des envois. Le bouton « Envoyer un achat test » permet de tester.
L'extension ne fait que **lire** la page : aucun clic, aucune modification, rien n'est envoyé ailleurs qu'à ton OBS.
Elle tourne d'office sur voggt.com et whatnot.com. Sur un autre site, le bouton « Apprendre » l'active pour cet onglet.


## 👻 Overlay « hits seulement » (invisible, ne s'active qu'en cas de hit)

Deux sources navigateur dans OBS :
1. **Overlay complet** (scène d'attente / habillage) : `overlay.html?duration=3h&obs&obspass=…`
2. **Overlay hits seulement**, placé **au-dessus de tout** dans tes scènes de live : `overlay.html?hitonly&obs&obspass=…`
   Il est **100 % transparent** en temps normal. À chaque hit, il affiche l'alerte (RARE / HIT / SECRÈTE / GOD PACK) et **la carte remplace l'image de ta caméra** pendant l'alerte.
   - Position de ta caméra : `&cam=x,y,largeur,hauteur` en pixels sur 1920×1080, par exemple pour une cam portrait à droite `&cam=1500,80,400,700`.
     Par défaut : `1456,112,436,247` (cadre cam de l'overlay).
   - `&camonly` : seulement la carte sur la cam, sans l'animation plein écran. `&nocam` : sans remplacement de la cam.
   - Animation : la balle **roule sur le contour de la carte et le dessine**, puis la carte apparaît, centrée, sur fond transparent. Dessous s'affiche une fiche bien lisible : **numéro, rareté, série**. Le dock les remplit automatiquement à partir de la base master set.
   - **Cadre selon la rareté** : néon violet pour HIT, **doré brillant** (reflet qui court et étincelles aux coins) pour SECRÈTE et GOD PACK.
   - **Balle selon la rareté** : Poké Ball (RARE), Super Ball (HIT), Hyper Ball (SECRÈTE). Pour un **GOD PACK**, c'est un **train des 4 balles** : la Master Ball trace le contour doré, suivie de l'Hyper, de la Super et de la Poké Ball, puis les 4 sautent ensemble avant le feu d'artifice.
   - **Son de capture** synthétisé, sans fichier : roulement, puis « clic » et 3 secousses, puis jingle, plus épique selon la rareté.
     `&volume=0.5` règle le volume, `&nosound` coupe le son. Dans OBS, coche « Contrôler l'audio via OBS » dans les propriétés de la source.
   - Seuls les **vrais hits** s'affichent sur la cam : HIT, SECRÈTE, GOD PACK. Une simple RARE ne déclenche rien. Pour changer : `&camtiers=rare,ultra,secret,god`.

L'overlay « hits seulement » ne tient ni récap ni classement (pas de double comptage) : c'est l'overlay complet qui les gère.

## 📦 Produits ouverts & cartes par rareté

- Dans le dock, section **PRODUITS OUVERTS** : clique sur ce que tu ouvres (Booster, Tripack, Coffret, ETB, UPC, Display). Chaque clic compte le produit **et ses boosters**. La liste se modifie dans le champ (`ETB=9, UPC=16…`) et ↶ annule le dernier clic.
- Chaque carte vue par le détecteur est comptée par **rareté officielle** (commune → peu commune → rare → … → hyper rare / gold).
- La **vidéo récap** et la scène « Merci » affichent : produits ouverts (ex. 2 × ETB, 1 × UPC, 3 × Tripack), **total de boosters**, total de cartes et **répartition par rareté de la commune à la gold**. Les points ne sont plus affichés.

## Scènes « Bientôt / Pause / Fin » (`scenes.html`)

| URL | Scène |
|---|---|
| `scenes.html?mode=soon&in=10m` ou `&at=20:30` | Le live commence bientôt + compte à rebours |
| `scenes.html?mode=pause&in=5m` | Petite pause (le sandwich affiche l'avancée réelle du live) |
| `scenes.html?mode=end` | Merci pour le live (miettes + verre vide) |
| `&bg=fond-2-z3-violet.png` | Un seul fond au lieu du MIX |

Logo du partenaire : `preview/logo-rainte.png`, affiché en haut à droite de la scène. Pour le remplacer, détoure la nouvelle image avec `node tools/cutout-logo.mjs image.png preview/logo-rainte.png`.

---

## Option B — PNG séparés (`export/`)

Tous les fichiers sont en **PNG RGBA transparent**, sans ombre de fond ni décor opaque.

```
export/
├─ overlay_complet_1920x1080.png          ← tout en un (sandwich plein)
├─ overlay_sans_sandwich_ni_boisson.png   ← base fixe à combiner avec les frames
├─ calques/                               ← 1920×1080, un élément par fichier
│   01_decor_energie · 02_branding_z3_team_z3f4 · 03_cadre_webcam · 04_viewers
│   05_widgets_acheteur_follow_supporter · 06_partenaire_le_rainte_du_tcg
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

Le dessin est dans `src/art.js` (sandwich, boisson, emblème Rainté du TCG), la mise en page dans `src/overlay.css` et `src/overlay.js`.
