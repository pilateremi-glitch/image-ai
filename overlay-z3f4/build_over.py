"""Génère le dossier OVER/ (un dossier par overlay, prêt pour OBS) et OVER.zip."""
import pathlib, shutil, zipfile
SRC = pathlib.Path(__file__).parent
ROOT = SRC.parent
OUT = ROOT / 'OVER'
html = (SRC / 'index.html').read_text(encoding='utf-8')
VARIANTS = [
  ('01 - Overlay POKEMON (Pokeball qui s ouvre)', 'pokemon',
   "Thème Pokémon fixe : la Pokéball tourne, s'ouvre et laisse apparaître le logo Z3F4."),
  ('02 - Overlay ONE PIECE (Chapeau de paille qui se retourne)', 'onepiece',
   "Thème One Piece fixe : le chapeau de paille tourne, se retourne et le logo sort de l'intérieur."),
  ('03 - SEPARATEUR Portrait + Opening (theme auto selon la scene OBS)', None,
   "Bande qui SÉPARE les 2 caméras : PORTRAIT (toi) et OPENING (les cartes).\n"
   "Elle s'adapte toute seule au format de ta scène OBS :\n"
   "  - scène verticale (1080x1920, Whatnot / Voggt) -> PORTRAIT en haut (40 %), OPENING en bas (60 %, plus de place pour les cartes)\n"
   "  - scène horizontale (1920x1080) -> PORTRAIT à gauche, OPENING à droite, bande verticale au milieu\n"
   "Le logo animé (Pokéball / chapeau) et l'heure sont dans la bande. Badge « ● LIVE » en haut à droite.\n\n"
   "PLACEMENT DES CAMÉRAS : mets la source Navigateur AU-DESSUS des 2 caméras,\n"
   "puis cale la caméra PORTRAIT au-dessus de la bande et la caméra OPENING en dessous.\n"
   "IMPORTANT : la taille de la source Navigateur = la taille de ta scène OBS\n"
   "(Paramètres -> Vidéo -> Résolution de base), par ex. 1080 x 1920 en vertical.\n\n"
   "Thème automatique selon le NOM de la scène OBS : « pokemon » -> Pokéball, « one piece » / « op » -> chapeau.\n"
   "Dans les propriétés de la source, mets « Accès à la page » sur\n"
   "« Accès en lecture aux informations de l'utilisateur ».", 'split'),
  ('04 - SEPARATEUR POKEMON (Poke Ball, Super Ball, Hyper Ball, Master Ball, Honor Ball)', 'pokemonplus',
   "Copie du séparateur 03, version 100 % POKÉMON.\n"
   "À chaque passage, une balle différente tourne, s'ouvre et laisse apparaître le logo :\n"
   "  Poké Ball -> Super Ball -> Hyper Ball -> Master Ball -> Honor Ball, puis on recommence.\n"
   "Bande PORTRAIT (haut, 40 %) / OPENING (bas, 60 %), heure, badge « ● LIVE ».\n"
   "S'adapte au format de ta scène OBS (vertical ou horizontal).", 'split'),
  ('05 - SEPARATEUR ONE PIECE (Pirate, Mechant, Marine)', 'onepieceplus',
   "Copie du séparateur 03, version 100 % ONE PIECE.\n"
   "À chaque passage, un chapeau différent représente un camp, se retourne et le logo sort de l'intérieur :\n"
   "  PIRATE (chapeau de paille) -> MÉCHANT (tricorne noir de capitaine à tête de mort) -> MARINE (casquette blanche et bleue à ancre).\n"
   "Bande PORTRAIT (haut, 40 %) / OPENING (bas, 60 %), heure, badge « ● LIVE ».\n"
   "S'adapte au format de ta scène OBS (vertical ou horizontal).", 'split'),
]
COMMON = """
INSTALLATION DANS OBS (2 minutes)
1. Sources -> + -> Navigateur -> nomme-la « Overlay Z3F4 ».
2. Coche « Fichier local » -> Parcourir -> choisis le fichier index.html de CE dossier.
3. Largeur / Hauteur = la résolution de ta scène OBS (ex. 1920x1080 ou 1080x1920).
4. Coche « Actualiser le navigateur quand la scène devient active ».
5. OK. Le fond est transparent, l'heure s'affiche en bas.

CHECK-LIST AVANT LE LIVE
[ ] Double-clic sur index.html : en haut à gauche -> « Logo : OK » et « FPS : 60 ».
[ ] Dans OBS : fond transparent (pas de fond bleu foncé).
[ ] L'heure affichée = l'heure de ton PC.
[ ] Le bandeau affiche le bon thème (Soirée Pokémon / Soirée One Piece).

NE PAS séparer index.html et logo.png : ils doivent rester dans le même dossier.
"""
if OUT.exists(): shutil.rmtree(OUT)
for name, theme, desc, *layout in VARIANTS:
    d = OUT / name; d.mkdir(parents=True)
    page = html
    pre = (f"window.OVERLAY_THEME = '{theme}';" if theme else '') + (f"window.OVERLAY_LAYOUT = '{layout[0]}';" if layout else '')
    if pre:
        page = page.replace('<script>\n(() => {', f"<script>{pre}</script>\n<script>\n(() => {{", 1)
        assert pre in page
    (d / 'index.html').write_text(page, encoding='utf-8')
    shutil.copy(SRC / 'logo.png', d / 'logo.png')
    (d / 'LISEZ-MOI.txt').write_text(desc + '\n' + COMMON, encoding='utf-8')
(OUT / 'LISEZ-MOI EN PREMIER.txt').write_text(
"DOSSIER OVER - Overlays Z3F4 « Le Rainté du TCG »\n\n"
"01 -> Live Pokémon uniquement\n02 -> Live One Piece uniquement\n"
"03 -> Bande de séparation PORTRAIT / OPENING, s'adapte au format vertical ou horizontal de la scène OBS\n"
"04 -> Même séparateur, version POKÉMON avec Poké / Super / Hyper / Master / Honor Ball\n"
"05 -> Même séparateur, version ONE PIECE avec Pirate / Méchant / Marine\n\n"
"Ouvre le LISEZ-MOI.txt du dossier choisi pour l'installation dans OBS.\n", encoding='utf-8')
z = ROOT / 'OVER.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(OUT.rglob('*')):
        if f.is_file(): zf.write(f, f.relative_to(ROOT))
print('OK', z, z.stat().st_size)
