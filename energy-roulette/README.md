# Pokémon Energy Roulette

Jeu de roue pour les lives TCG (Twitch / TikTok / YouTube). Il tient dans un seul fichier, `index.html`, sans installation, sans serveur et sans compte.

## Lancer le jeu

Double-cliquez sur `index.html` : il s'ouvre dans Chrome, Edge ou Firefox. Le jeu fonctionne aussi hors ligne. Sans connexion, seules les polices de secours remplacent les polices Google.

## Vos visuels

Déposez vos images dans le dossier `visuels/` avec ces noms (la liste est aussi dans `visuels/LISEZMOI.txt`) :
`fond.jpg`, `logo.png`, `pikachu.png`, `mascotte1.png` à `mascotte4.png`, `carte1.png` à `carte8.png`.
Un fichier absent est ignoré, et le décor par défaut reste en place. Pour régler les positions et les tailles, modifiez le bloc `VISUELS` en haut du script de `index.html`.

## Viewer + Pikachu

Avant de lancer la roue, tapez le pseudo du viewer dans la case **Pseudo du viewer…** puis appuyez sur `Entrée`. Le champ passe au vert et la case en haut à gauche affiche « PSEUDO REÇU ». Le pseudo n'est pas encore écrit.

Après la révélation, le Pokémon de l'énergie tirée arrive et écrit le pseudo dans le style de son énergie : flammes, eau, éclairs, feuilles, etc. Pour **Dresseur**, c'est Sacha qui le tague à la bombe de peinture. Pour **Objet**, une Potion se renverse et le liquide forme le pseudo. L'énergie s'affiche ensuite dans la case, et le pseudo est ajouté à l'historique, à la carte de révélation et à l'écran de fin.

## Illustrations des cartes

La révélation et l'écran de fin affichent vos 12 cartes (Pokémon, dresseur, objet et attaque), rangées dans `visuels/cartes/<énergie>.webp` et intégrées au fichier. Le pseudo du viewer s'écrit dans la barre prévue en bas de la carte. Sacha (`visuels/sacha.webp`) a été découpé depuis votre première planche.

## Pokémon et attaques

Chaque catégorie a le Pokémon et l'attaque de sa carte : Bulbizarre « Vampigraine », Carapuce « Pistolet à O », Salamèche « Lance-Flammes », Pikachu « Éclair », Mew « Psyko », Noctali « Tranche-Nuit », Dracolosse « Draco-Météore », Métagross « Tête de Fer », Lucario « Close Combat », Évoli « Éclat Magique », Mewtwo « Capture Ultime » (Objet), et Sacha, Pierre et Ondine « Lien d'Amitié » (Dresseur). Le Pokémon entre en scène et lance son attaque juste avant la révélation de la carte. Les images viennent de `visuels/pokemon/<n° Pokédex>.png` si vous les fournissez, sinon de l'illustration officielle en ligne. Pour désactiver le chargement en ligne, mettez `pokemonEnLigne: false`.

## Fluidité

Seul le disque de la roue tourne, et c'est la carte graphique qui gère cette rotation. Le jeu mesure aussi la fluidité au démarrage : si l'ordinateur est trop lent, il coupe de lui-même les effets de fond les plus lourds. Pour forcer un mode, ajoutez `?lite` (mode léger) ou `?hq` (qualité maximale) à la fin de l'adresse.

## Commandes

| Bouton | Raccourci | Action |
|---|---|---|
| LANCER LA ROUE (ou le centre de la roue) | `Espace` / `Entrée` | Tire une énergie parmi celles qui restent |
| TOUT RÉINITIALISER | `R` | Remet les 12 énergies en un clic, à tout moment |
| SON ON / OFF | `M` | Coupe ou réactive les effets sonores |
| PLEIN ÉCRAN | `F` | Passe en plein écran pour le partage de fenêtre |

Pendant la révélation, un clic ou `Espace` passe à la suite. Sinon, la suite arrive seule au bout de 5 secondes.

## Intégration OBS

**Source Navigateur (recommandé)**
1. Sources → `+` → **Navigateur**.
2. Cochez **Fichier local** et choisissez `index.html`.
3. Largeur `1920`, hauteur `1080`.
4. Pour cliquer dans le jeu depuis OBS : clic droit sur la source → **Interagir**.
5. Pour avoir le son dans OBS, cochez **Contrôler l'audio via OBS**.

**Fond transparent (overlay sur votre caméra)** : ajoutez `?obs` à la fin de l'URL de la source, par exemple `file:///C:/…/index.html?obs`. Le décor disparaît, et il reste la roue, les panneaux et les effets.

**Partage de fenêtre (TikTok Live Studio, Discord…)** : ouvrez le fichier dans le navigateur, appuyez sur `F` pour le plein écran, puis partagez la fenêtre.

## Équité du tirage

- Le tirage utilise `crypto.getRandomValues` avec un échantillonnage par rejet. Chaque énergie restante a exactement la même probabilité de sortir.
- Le tirage a lieu d'abord. La roue calcule ensuite l'angle exact pour amener la case tirée sous la flèche, à une position aléatoire à l'intérieur de la case. L'animation correspond donc toujours au résultat.
- L'énergie tirée est retirée des données du jeu, pas seulement masquée. La roue se redessine avec les cases restantes, et une énergie sortie ne peut pas ressortir avant la réinitialisation.
