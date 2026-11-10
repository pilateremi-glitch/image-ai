"""Génère le dossier OVER/ (un dossier par overlay, prêt pour OBS) et OVER.zip."""
import pathlib, shutil, zipfile
SRC = pathlib.Path(__file__).parent
ROOT = SRC.parent
OUT = ROOT / 'OVER'
html = (SRC / 'index.html').read_text(encoding='utf-8')
VARIANTS = [
  ('OVERLAY POKEMON', 'pokemonplus',
   "Overlay des soirées POKÉMON.\n"
   "À chaque passage, une balle différente tourne, s'ouvre et laisse apparaître le logo :\n"
   "  Poké Ball -> Super Ball -> Hyper Ball -> Master Ball -> Honor Ball, puis on recommence.\n"
   "Le couvercle s'ouvre d'avant en arrière et le nom de la balle s'affiche dans la bande.\n"
   "Bande PORTRAIT (haut, 40 %) / OPENING (bas, 60 %), heure, badge « ● LIVE ».\n"
   "S'adapte au format de ta scène OBS (vertical ou horizontal).", 'split'),
  ('OVERLAY ONE PIECE', 'onepieceplus',
   "Overlay des soirées ONE PIECE.\n"
   "À chaque passage, l'objet emblématique d'un personnage tourne, se retourne et le logo sort de l'intérieur.\n"
   "Le nom du personnage s'affiche dans la bande. Ordre (bons / méchants / Marine mélangés) :\n"
   "  LUFFY (chapeau de paille) - BARBE NOIRE (tricorne tête de mort) - MARINE (casquette à ancre)\n"
   "  ZORO (bandana + 3 sabres) - DOFLAMINGO (lunettes roses) - CHOPPER (chapeau rose à croix + bois de renne)\n"
   "  SANJI (jambe en feu) - MIHAWK (chapeau à plume) - ROBIN (fleur de mains)\n"
   "  ACE (chapeau de cow-boy à badges) - KUMA (bonnet à oreilles d'ours)\n"
   "  BROOK (haut-de-forme + afro) - LAW (bonnet en fourrure tachetée) - SABO (haut-de-forme bleu à lunettes)\n"
   "Bande PORTRAIT (haut, 40 %) / OPENING (bas, 60 %), heure, badge « ● LIVE ».\n"
   "S'adapte au format de ta scène OBS (vertical ou horizontal).", 'split'),
  ('FIN DE LIVE ONE PIECE', 'onepieceplus',
   "Écran de FIN DE LIVE One Piece (plein écran, pas transparent) :\n"
   "« FIN DU LIVE », logo animé, « MERCI D'ETRE VENU ! / RENDEZ-VOUS AU PROCHAIN LIVE »,\n"
   "défilé des 14 personnages et heure. Vidéo prête : fin-de-live.mp4 (1080x1920).\n"
   "Messages modifiables : ajoute ?msg1=...&msg2=... à l'adresse de la source.", 'end'),
  ('FIN DE LIVE POKEMON', 'pokemonplus',
   "Écran de FIN DE LIVE Pokémon (plein écran, pas transparent) :\n"
   "« FIN DU LIVE », logo animé, messages, défilé des 5 balles et heure. Vidéo prête : fin-de-live.mp4 (1080x1920).", 'end'),
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
    common = COMMON
    if layout and layout[0] == 'end':
        common = common.replace("5. OK. Le fond est transparent, l'heure s'affiche en bas.", "5. OK. C'est un écran plein (pas transparent) : il recouvre les caméras.").replace("[ ] Dans OBS : fond transparent (pas de fond bleu foncé).\n", "").replace("[ ] Le bandeau affiche le bon thème (Soirée Pokémon / Soirée One Piece).", "[ ] « FIN DU LIVE » et le défilé s'affichent.")
    (d / 'LISEZ-MOI.txt').write_text(desc + '\n' + common, encoding='utf-8')
(OUT / 'LISEZ-MOI EN PREMIER.txt').write_text(
"DOSSIER OVER - Overlays Z3F4 « Le Rainté du TCG »\n\n"
"OVERLAY POKEMON   -> soirées Pokémon : Poké / Super / Hyper / Master / Honor Ball qui s'ouvrent sur le logo\n"
"OVERLAY ONE PIECE -> soirées One Piece : 14 personnages (Luffy, Zoro, Sanji, Robin, Ace, Law, Barbe Noire, Marine...)\n"
"FIN DE LIVE ONE PIECE / FIN DE LIVE POKEMON -> écran de fin (page animée + vidéo fin-de-live.mp4)\n\n"
"INSTALLER DANS OBS (double-clic) -> ajoute les 2 overlays dans ta scène OBS,\n"
"avec des boutons pour afficher / masquer chacun.\n", encoding='utf-8')
# Installateur OBS (WebSocket) : ajoute 04 et 05 dans une scène, avec boutons afficher / masquer
import json, re
inst = (SRC / 'installer-obs.html').read_text(encoding='utf-8')
ovs = [{'name': 'Z3F4 Pokemon', 'dir': 'OVERLAY POKEMON', 'theme': 'pk', 'role': 'live', 'visible': True},
       {'name': 'Z3F4 One Piece', 'dir': 'OVERLAY ONE PIECE', 'theme': 'op', 'role': 'live', 'visible': False},
       {'name': 'Z3F4 Fin de live One Piece', 'dir': 'FIN DE LIVE ONE PIECE', 'theme': 'op', 'role': 'end', 'visible': False},
       {'name': 'Z3F4 Fin de live Pokemon', 'dir': 'FIN DE LIVE POKEMON', 'theme': 'pk', 'role': 'end', 'visible': False}]
for f in ('FIN DE LIVE ONE PIECE', 'FIN DE LIVE POKEMON'):
    v = SRC / 'videos' / (f.replace(' ', '-').lower() + '.mp4')
    if v.exists(): shutil.copy(v, OUT / f / 'fin-de-live.mp4')
inst, n = re.subn(r'/\*OVERLAYS\*/.*?/\*END\*/', lambda m: json.dumps(ovs, ensure_ascii=False), inst, flags=re.S)
assert n == 1
(OUT / 'INSTALLER DANS OBS (double-clic).html').write_text(inst, encoding='utf-8')
z = ROOT / 'OVER.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(OUT.rglob('*')):
        if f.is_file(): zf.write(f, f.relative_to(ROOT))
print('OK', z, z.stat().st_size)
