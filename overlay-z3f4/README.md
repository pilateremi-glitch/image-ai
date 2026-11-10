# Overlay Z3F4 — Le Rainté du TCG

Overlay OBS : un chapeau de paille et une Pokéball en pixel art, l'un après l'autre.
- **Pokéball** : elle tourne, tremble, s'ouvre et laisse apparaître le logo.
- **Chapeau de paille** : il tourne, se retourne, on voit l'intérieur et le logo en sort.
- **Horloge** affichée en permanence, avec un bandeau « Soirée Pokémon / One Piece ».

## Installation dans OBS
1. Sources → **+** → **Navigateur** → **décoche** Fichier local → URL : `file:///C:/chemin/overlay-z3f4/index.html?twitch=TaChaine`.
2. Largeur 1920, hauteur 1080 (ou plus petit pour un coin d'écran).
3. Coche **Actualiser le navigateur quand la scène devient active**.

## Whatnot / Voggt (mode recommandé) : thème par le nom de la scène OBS
Utilise l'URL **sans** `?twitch=` : `file:///C:/chemin/overlay-z3f4/index.html`
Dans les propriétés de la source, règle **Accès à la page : Accès en lecture aux informations de l'utilisateur**.

| Le nom de la scène OBS contient | Thème |
|---|---|
| `pokemon`, `poke`, `pkm` | Soirée Pokémon (Pokéball) |
| `one piece`, `op`, `luffy`, `pirate` | Soirée One Piece (chapeau) |
| autre chose (ex. « Pause ») | garde le thème actuel |

Crée par exemple deux scènes, `WHATNOT Pokémon` et `WHATNOT One Piece` (ou `VOGGT …`), et lance celle qui correspond au live.
Le thème change instantanément, sans Internet.

## Thème automatique (catégorie Twitch)
Ajoute le nom de ta chaîne à l'URL de la source :
`file:///C:/chemin/overlay-z3f4/index.html?twitch=TaChaine`

Toutes les 30 secondes, l'overlay lit la **catégorie** de ta chaîne (puis le **titre** si la catégorie ne suffit pas)
via le service public decapi.me. **Aucune clé API n'est nécessaire.**

| Catégorie ou titre contient | Thème | Animation |
|---|---|---|
| Pokémon (Trading Card Game, TCG Pocket…) | Soirée Pokémon (jaune) | Pokéball |
| One Piece (Card Game…), `OP09`, Luffy | Soirée One Piece (rouge) | Chapeau |
| autre chose (ex. Just Chatting) | garde le thème actuel | — |
| rien de reconnu depuis le démarrage | Z3F4 | les deux en alternance |

Astuce : règle la catégorie Twitch **avant** de lancer le live. L'overlay s'adapte même hors ligne, en 30 s maximum.
Si Internet coupe, l'overlay garde le dernier thème et réessaie tout seul.
Sans `?twitch=`, l'overlay utilise le nom de la scène OBS (ancien mode).

## Options (à ajouter à la fin de l'URL)
- `&poll=20` : intervalle de vérification Twitch en secondes (15 minimum)
- `?theme=pokemon` ou `?theme=onepiece` : force le thème
- `&hold=8` : nombre de secondes où le logo reste affiché (6 par défaut)
- `&scale=0.6` : taille de l'animation
- `&seconds=1` : affiche les secondes
- `&hud=0` : masque l'horloge
- `&preview=1` : fond sombre + panneau de diagnostic

## Check-list avant le live
1. Ouvre `index.html?twitch=TaChaine` dans Chrome. Le panneau en haut à gauche doit afficher `Logo : OK`, `FPS : 60`,
   `Twitch : … · OK` et la bonne catégorie.
2. Dans OBS, vérifie que le fond est **transparent** (pas de fond sombre).
3. Change la catégorie Twitch : dans les 30 s, le bandeau doit passer à Soirée Pokémon ou Soirée One Piece.
4. Vérifie que l'heure correspond à celle de ton PC.

## Mode séparateur PORTRAIT / OPENING (`?layout=split`)
Bande entre la caméra PORTRAIT et la caméra OPENING, avec le logo animé et l'heure.
S'adapte au format de la source : vertical → caméras haut/bas, horizontal → gauche/droite.
Options : `&split=0.4` (position de la bande, 0.2–0.8 ; 0.4 par défaut = 40 % PORTRAIT en haut, 60 % OPENING en bas), `&frames=0` (sans cadres), `&labels=0` (sans étiquettes),
`&zone1=MOI&zone2=CARTES` (textes des étiquettes), `&scale=0.8` (taille du logo).
