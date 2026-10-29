# ☠ Grand Line Live — Roue des lives One Piece Card Game

Application web pour animer des lives de vente / ouverture de boosters One Piece TCG :
le viewer paie sa participation (hors application), vous saisissez son pseudo, la roue tire un
**objectif verrouillé** (équipage, peuple, personnage, organisation, rareté, carte précise), vous ouvrez
les boosters et l'application valide le résultat.

Tout fonctionne **dans le navigateur, sans serveur ni connexion** (la base est stockée localement dans
IndexedDB). Internet n'est nécessaire que pour la synchronisation et l'affichage des images officielles.

## Lancer l'application

Le plus simple : ouvrir `index.html` dans Chrome / Edge / Firefox.
Recommandé (évite les restrictions de certains navigateurs sur les fichiers locaux) :

```bash
cd onepiece-live
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

Au premier lancement, la base fournie est installée automatiquement : **9 897 impressions**
(4 910 en anglais, 4 987 en japonais), tous les OP-01 → OP-17, EB-01 → EB-05, PRB-01/02, ST-01 → ST-36,
promos, cartes « Other Product », parallèles / alt-arts et réimpressions.

> OP-18, OP-19 et EB-06 ne figurent pas encore dans la source à la date de génération : **aucune liste
> n'a été inventée**. Importez-les ou synchronisez-les quand leurs données seront publiées — les jeux
> s'adaptent automatiquement.

## En live (onglet 🎡 Live)

1. **Choisissez la série du soir** dans la grille en haut (Boosters OP, Extra EB, Premium PRB, Starter ST,
   promos — ou recherche « OP-17 »). L'application règle **automatiquement** le jeu et ses règles :
   - booster principal OP → Jeu A Équipages (ou un autre si la série n'a pas assez d'équipages) ;
   - Extra Booster EB → Jeu D Organisations & arcs ;
   - Premium Booster PRB → Jeu E Raretés, réimpressions autorisées (le produit n'en contient que) ;
   - Starter Deck / promo → avertissement : contenu fixe ou non documenté.

   Elle affiche aussi **les familles réellement présentes dans la série** avec leur nombre de cartes ;
   les familles absentes sont exclues automatiquement (case « Afficher les familles absentes » pour les voir).
   Si vous changez le jeu ou un réglage, ces règles sont **mémorisées pour cette série** (★) et reprises
   la prochaine fois ; « Revenir aux règles automatiques » annule.
2. **Ajuster (optionnel)** : type de jeu (A Équipages · B Peuples · C Personnages · D Organisations & arcs ·
   E Raretés · F Roue ultime · G Carte précise), langue, objectifs à activer / désactiver.
3. **Pseudo** + réglages du tour (boosters, validation manuelle ou automatique, parallèles, réimpressions,
   une ou plusieurs réussites) → **LANCER LA ROUE**. Le tour est verrouillé *avant* l'animation : critères
   et règles ne peuvent plus changer.
4. **Validation** : manuelle (🏆 Gagné / ❌ Perdu) ou automatique (vous saisissez les cartes sorties, chaque
   carte qui correspond exactement à l'objectif est marquée ✅). Annulation possible avec motif.
5. **🖥 Fenêtre écran (OBS)** : ouvre une fenêtre propre (roue, participant, objectif, statut, résumé des
   règles) synchronisée en direct, à capturer dans OBS.

Le tirage est équitable (générateur cryptographique) entre tous les objectifs actifs. Si la roue affiche
24 segments sur plus d'objectifs, le tirage se fait quand même parmi **tous** (c'est indiqué à l'écran).
Des probabilités personnalisées sont possibles (« Probabilités personnalisées ») : elles sont alors
affichées en %.

## Règles du jeu (onglet 📜)

Pour chaque jeu : nom, description, critères de réussite, catégories autorisées, boosters par participation,
doublons, parallèles, réimpressions, extensions compatibles, conditions d'annulation. Le résumé est affiché
aux viewers avant chaque tour.

**Familles** : une carte appartient à une famille *uniquement* si l'un de ses **traits officiels** figure
dans la liste de la famille (ex. Marine = `Navy`). Jamais d'après le nom. Les cartes japonaises reprennent
les traits de la même impression anglaise (même identifiant officiel). La liste est modifiable et
extensible, et la liste de tous les traits présents dans la base est affichée.

## Administration (onglet ⚓)

| Fonction | Où |
|---|---|
| Rechercher, filtrer, ajouter, modifier, supprimer (avec confirmation) | Base de cartes |
| Appliquer une date de sortie / un statut / un nom de série à toute une extension | Base de cartes |
| Importer CSV / JSON avec prévisualisation, détection des doublons et rapport | IMPORTER DES CARTES |
| Import d'une liste complète, d'une seule extension, ou fusion | IMPORTER DES CARTES |
| Synchronisation manuelle avec une source externe | SYNCHRONISER |
| Export CSV / JSON, sauvegarde complète, restauration, sauvegardes auto | Export & sauvegarde |
| Historique de toutes les mises à jour (y compris les synchronisations échouées) | Historique |

### Format des cartes

Colonnes (CSV `,` ou `;`, listes séparées par `|`) — un modèle est téléchargeable dans l'onglet import :

`uid, card_id, print_id, name, set_code, set_name, number, rarity, type, colors, affiliation, variant,
image_url, release_date, status, language, products, cost, power, counter, source`

Les en-têtes français sont aussi reconnus (`Nom`, `Identifiant`, `Extension`, `Rareté`, `Couleur`,
`Équipage`, `Version`, `Statut`, `Langue`, `Produits`…).

- **Clé unique** = `langue:identifiant d'impression` (ex. `en:OP11-058_p1`). Une même impression présente
  dans plusieurs produits (réimpression) est **une seule fiche** avec plusieurs `products`.
- Les illustrations différentes (`_p1`, `_p2`, Manga Rare…) restent des fiches distinctes.
- Statuts : `published` (publiée), `announced` (annoncée), `pending` (à vérifier). Les objectifs dont les
  cartes ne sont pas publiées sont signalés « non confirmé ».

### Doublons détectés à l'import

- même clé deux fois dans le fichier → fusion des produits, ligne ignorée ;
- même clé que la base → « identique » (ignorée) ou « modifiée » (mise à jour si vous le confirmez) ;
- même carte + même image sous une autre clé → « doublon probable » (non importé sauf si vous cochez).

## Sources de données

- **Punk Records** (`github.com/buhbbl/punk-records`) — source par défaut de la base et de la
  synchronisation : JSON généré à partir de la liste officielle (en / jp / fr / Asie / chinois / thaï).
  Les données et images restent © Eiichiro Oda / Shueisha, Toei Animation, Bandai.
- **Liste officielle** (onepiece-cardgame.com) : référence pour vérifier une carte.
- **Koala Kollect / OPTCG Deck Explorer / autre** : utilisables via la source « URL personnalisée »
  (JSON ou CSV au format ci-dessus) ou en ajoutant un adaptateur dans `js/sync.js` (objet
  `{ id, label, fetch() }` dans `SOURCES`). Vérifiez licence et conditions d'accès avant d'en faire
  une source permanente.

Régénérer la base fournie depuis un clone de Punk Records :

```bash
git clone --depth 1 https://github.com/buhbbl/punk-records.git /tmp/punk-records
python3 tools/build_seed.py /tmp/punk-records english japanese
```

## Fichiers

```
index.html        application (Live, Règles, Administration)
screen.html       fenêtre d'affichage pour OBS
css/style.css     identité visuelle
js/db.js          stockage IndexedDB (cartes, historique, sauvegardes)
js/cards.js       schéma, normalisation, CSV, doublons
js/games.js       familles, analyse par produit, objectifs, tirage, validation
js/sync.js        sources de synchronisation (adaptateurs)
js/wheel.js       roue animée
js/live.js | rules.js | admin.js   écrans
data/seed-cards.js   base initiale
tools/build_seed.py  génération de la base initiale
```
