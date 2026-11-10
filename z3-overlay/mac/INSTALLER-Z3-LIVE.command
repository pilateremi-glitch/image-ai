#!/bin/bash
# ==========================================================================
#  Z3 LIVE — TEAM Z3F4 × LE RAINTÉ DU TCG — installation Mac + OBS
#  Double-clic pour lancer (1re fois : clic droit › Ouvrir).
#  1. copie / met à jour le dossier sur le Bureau : ~/Desktop/Z3-LIVE
#  2. active le serveur WebSocket d'OBS (mot de passe généré, ou celui déjà configuré)
#  3. ajoute la collection de scènes « Z3 LIVE Pokémon » à OBS
#  4. crée ~/Desktop/Z3-LIVE/MES-URL-OBS.txt et ouvre la page de prépa du live
# ==========================================================================
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/Desktop/Z3-LIVE"
OBSDIR="$HOME/Library/Application Support/obs-studio"
WS="$OBSDIR/plugin_config/obs-websocket/config.json"
echo ""
echo "  🔥 Z3 LIVE · TEAM Z3F4 × LE RAINTÉ DU TCG — installation"
echo "  ------------------------------------------------------"

# --- OBS doit être fermé (il réécrit ses réglages en quittant)
if pgrep -x "obs" >/dev/null 2>&1 || pgrep -f "OBS.app/Contents/MacOS" >/dev/null 2>&1; then
  echo "  ⚠️  OBS est ouvert. Ferme OBS puis appuie sur Entrée…"; read -r
  while pgrep -x "obs" >/dev/null 2>&1 || pgrep -f "OBS.app/Contents/MacOS" >/dev/null 2>&1; do sleep 1; done
fi

# --- 1. dossier sur le Bureau (mise à jour sans toucher à tes fonds/logo ajoutés)
if [ "$SRC" != "$DEST" ]; then
  mkdir -p "$DEST"
  rsync -a --exclude ".git" --exclude "tools/node_modules" --exclude "tools/.cache" "$SRC/" "$DEST/"
  echo "  ✔ Dossier à jour : $DEST"
else
  echo "  ✔ Dossier déjà sur le Bureau : $DEST"
fi
xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
chmod +x "$DEST/mac/"*.command 2>/dev/null || true

# --- 2. WebSocket OBS (garde le mot de passe existant s'il y en a un)
mkdir -p "$(dirname "$WS")"
PW=""
if [ -f "$WS" ]; then PW="$(sed -n 's/.*"server_password"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$WS" | head -1)"; cp "$WS" "$WS.avant-z3" ; fi
if [ -z "$PW" ]; then PW="z3$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 10)"; fi
cat > "$WS" <<JSON
{
  "alerts_enabled": false,
  "auth_required": true,
  "first_load": false,
  "server_enabled": true,
  "server_password": "$PW",
  "server_port": 4455
}
JSON
echo "  ✔ WebSocket OBS activé (port 4455, mot de passe : $PW)"

# --- 3. collection de scènes
BASE="file://$(printf '%s' "$DEST" | sed 's/ /%20/g')"
mkdir -p "$OBSDIR/basic/scenes"
[ -f "$OBSDIR/basic/scenes/Z3_LIVE_Pokemon.json" ] && cp "$OBSDIR/basic/scenes/Z3_LIVE_Pokemon.json" "$OBSDIR/basic/scenes/Z3_LIVE_Pokemon.json.avant-z3"
sed -e "s#__BASE__#$BASE#g" -e "s#__PW__#$PW#g" "$DEST/mac/obs-collection-template.json" > "$OBSDIR/basic/scenes/Z3_LIVE_Pokemon.json"
echo "  ✔ Collection de scènes « Z3 LIVE Pokémon » ajoutée à OBS"

# --- 4. URL + page de prépa
cat > "$DEST/MES-URL-OBS.txt" <<TXT
Z3 LIVE — tes adresses (générées le $(date '+%d/%m/%Y %H:%M'))
Mot de passe OBS WebSocket : $PW

OBS › Docks › Docks de navigateur personnalisés :
  Z3 Détecteur   $BASE/detecteur.html?game=pokemon&set=me06&obspass=$PW&obssrc=Cam%20cartes
  Z3 Master Set  $BASE/base.html

Sources navigateur (déjà dans la collection « Z3 LIVE Pokémon ») :
  Overlay complet   $BASE/overlay.html?duration=3h&obs&obspass=$PW
  Hits (invisible)  $BASE/overlay.html?hitonly&cam=1456,112,436,247&obs&obspass=$PW
  Bientôt           $BASE/scenes.html?mode=soon&in=10m&obs&obspass=$PW
  Pause             $BASE/scenes.html?mode=pause&in=5m&obs&obspass=$PW
  Fin du live       $BASE/scenes.html?mode=end&obs&obspass=$PW

Chrome :
  Vidéo récap auto  $BASE/recap-video.html?auto&obspass=$PW
  Extension acheteurs : chrome://extensions › Mode développeur › Charger l'extension non empaquetée › $DEST/extension-chrome
TXT
printf '%s' "$BASE/detecteur.html?game=pokemon&set=me06&obspass=$PW&obssrc=Cam%20cartes" | pbcopy
echo "  ✔ Adresses enregistrées dans : $DEST/MES-URL-OBS.txt"
echo "  📋 L'adresse du dock Détecteur est copiée dans le presse-papiers."
echo ""
printf "window.Z3CONF = { pw: \"%s\", base: \"%s\" };\n" "$PW" "$BASE" > "$DEST/mac/ma-config.js"
open "$DEST/mac/PREPA-LIVE-POKEMON.html"
echo "  👉 Suis la page « Prépa live Pokémon » qui vient de s'ouvrir."
echo ""
