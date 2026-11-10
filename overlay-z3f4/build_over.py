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
  ('03 - Overlay AUTO (theme selon la scene OBS)', None,
   "Thème automatique : Pokémon ou One Piece selon le NOM de la scène OBS (idéal Whatnot / Voggt).\n"
   "Scène contenant « pokemon » -> Pokéball. Scène contenant « one piece » ou « op » -> Chapeau.\n"
   "Une scène neutre (ex. « Pause ») garde le thème actuel. Sinon les deux alternent.\n"
   "IMPORTANT : dans les propriétés de la source, mets « Accès à la page » sur\n"
   "« Accès en lecture aux informations de l'utilisateur »."),
]
COMMON = """
INSTALLATION DANS OBS (2 minutes)
1. Sources -> + -> Navigateur -> nomme-la « Overlay Z3F4 ».
2. Coche « Fichier local » -> Parcourir -> choisis le fichier index.html de CE dossier.
3. Largeur 1920, Hauteur 1080.
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
for name, theme, desc in VARIANTS:
    d = OUT / name; d.mkdir(parents=True)
    page = html
    if theme:
        page = page.replace('<script>\n(() => {', f"<script>window.OVERLAY_THEME = '{theme}';</script>\n<script>\n(() => {{", 1)
        assert "OVERLAY_THEME = '" in page
    (d / 'index.html').write_text(page, encoding='utf-8')
    shutil.copy(SRC / 'logo.png', d / 'logo.png')
    (d / 'LISEZ-MOI.txt').write_text(desc + '\n' + COMMON, encoding='utf-8')
(OUT / 'LISEZ-MOI EN PREMIER.txt').write_text(
"DOSSIER OVER - Overlays Z3F4 « Le Rainté du TCG »\n\n"
"01 -> Live Pokémon uniquement\n02 -> Live One Piece uniquement\n"
"03 -> Un seul overlay qui change tout seul selon la scène OBS (recommandé)\n\n"
"Ouvre le LISEZ-MOI.txt du dossier choisi pour l'installation dans OBS.\n", encoding='utf-8')
z = ROOT / 'OVER.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(OUT.rglob('*')):
        if f.is_file(): zf.write(f, f.relative_to(ROOT))
print('OK', z, z.stat().st_size)
