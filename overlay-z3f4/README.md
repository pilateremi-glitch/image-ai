# Overlay Z3F4 — Le Rainté du TCG

Overlay OBS : un chapeau de paille et une Pokéball en pixel art, l'un après l'autre.
- **Pokéball** : elle tourne, tremble, s'ouvre et laisse apparaître le logo.
- **Chapeau de paille** : il tourne, se retourne, on voit l'intérieur et le logo en sort.
- **Horloge** affichée en permanence, avec un bandeau « Soirée Pokémon / One Piece ».

## Installation dans OBS
1. Sources → **+** → **Navigateur** → coche **Fichier local** → choisis `overlay-z3f4/index.html`.
2. Largeur 1920, hauteur 1080 (ou plus petit pour un coin d'écran).
3. Propriétés de la source → **Accès à la page : Accès en lecture aux informations de l'utilisateur**
   (nécessaire pour que l'overlay lise le nom de la scène au démarrage).
4. Coche **Actualiser le navigateur quand la scène devient active**.

## Thème automatique
Le thème suit le **nom de la scène OBS** :
| Le nom de la scène contient | Thème | Animation |
|---|---|---|
| `pokemon`, `poke`, `pkm` | Soirée Pokémon (jaune) | Pokéball |
| `one piece`, `op`, `luffy`, `pirate` | Soirée One Piece (rouge) | Chapeau |
| autre chose (ex. « Pause ») | garde le thème actuel | — |
| aucune scène reconnue | Z3F4 | les deux en alternance |

Exemples : `LIVE Pokémon`, `Starting OP`, `One Piece - Ouverture`.

## Options (à ajouter à la fin de l'URL)
- `?theme=pokemon` ou `?theme=onepiece` : force le thème
- `&hold=8` : nombre de secondes où le logo reste affiché (6 par défaut)
- `&scale=0.6` : taille de l'animation
- `&seconds=1` : affiche les secondes
- `&hud=0` : masque l'horloge
- `&preview=1` : fond sombre + panneau de diagnostic

## Check-list avant le live
1. Ouvre `index.html` dans Chrome : le panneau en haut à gauche doit afficher `Logo : OK` et `FPS : 60`.
2. Dans OBS, vérifie que le fond est **transparent** (pas de fond sombre).
3. Change de scène : le bandeau doit passer à Soirée Pokémon ou Soirée One Piece.
4. Vérifie que l'heure correspond à celle de ton PC.
