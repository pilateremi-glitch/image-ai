#!/bin/bash
# Prépare OBS (macOS) pour les lives Z3F4 : profil « Z3F4 Whatnot » (1080x1920) + collection « Z3F4 Live »
cd "$(dirname "$0")" || exit 1
OVER="$(pwd)"
echo ""
echo "  Z3F4 - Préparation d'OBS (Mac)"
echo "  Dossier OVER : $OVER"
echo ""
fin() { echo ""; read -r -n 1 -p "  Appuie sur une touche pour fermer..." _; echo ""; exit "$1"; }
if pgrep -x OBS >/dev/null 2>&1 || pgrep -f "OBS.app/Contents/MacOS" >/dev/null 2>&1; then
  echo "  OBS est ouvert : quitte-le complètement (Cmd+Q), puis relance ce fichier."; fin 1
fi
CFG="$HOME/Library/Application Support/obs-studio"
mkdir -p "$CFG/basic/scenes" "$CFG/basic/profiles/Z3F4_Whatnot" || { echo "  ERREUR : impossible de créer $CFG"; fin 1; }
STAMP=$(date +%Y%m%d-%H%M%S)
DST="$CFG/basic/scenes/Z3F4_Live.json"
[ -f "$DST" ] && cp "$DST" "$DST.sauvegarde-$STAMP"
OVERJ="${OVER//\\/\\\\}"; OVERJ="${OVERJ//\"/\\\"}"
OVERJ="$OVERJ" perl -pe 's/__OVER__/$ENV{OVERJ}/g' "outils/Z3F4_Live_mac.json" > "$DST" || { echo "  ERREUR : écriture de la collection"; fin 1; }
echo "  [OK] Collection de scènes « Z3F4 Live » (4 scènes)"
INI="$CFG/basic/profiles/Z3F4_Whatnot/basic.ini"
[ -f "$INI" ] && cp "$INI" "$INI.sauvegarde-$STAMP"
cp "outils/basic_mac.ini" "$INI" || { echo "  ERREUR : écriture du profil"; fin 1; }
echo "  [OK] Profil « Z3F4 Whatnot » (1080 x 1920, 30 i/s)"
echo ""
if open -a OBS --args --profile "Z3F4 Whatnot" --collection "Z3F4 Live" --scene "LIVE ONE PIECE" 2>/dev/null; then
  echo "  [OK] OBS se lance sur la scène LIVE ONE PIECE."
else
  echo "  OBS introuvable automatiquement. Ouvre OBS, puis :"
  echo "    menu Profil -> Z3F4 Whatnot"
  echo "    menu Collection de scènes -> Z3F4 Live"
fi
echo ""
echo "  Il reste 2 choses à faire dans OBS :"
echo "    1. Double-clic sur « Caméra PORTRAIT » -> choisis ta caméra -> OK"
echo "    2. Double-clic sur « Caméra OPENING »  -> choisis la caméra des cartes -> OK"
echo "  Si l'image reste noire : Réglages Système -> Confidentialité et sécurité -> Caméra -> autorise OBS."
fin 0
