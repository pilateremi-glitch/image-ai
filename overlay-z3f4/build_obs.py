"""Génère OVER/outils/* et « PREPARER OBS (double-clic).bat » :
profil OBS « Z3F4 Whatnot » (1080x1920) + collection de scènes « Z3F4 Live » prête à l'emploi."""
import json, pathlib, uuid

W, H = 1080, 1920
SPLIT, BAND = 0.35, max(H * 0.1, min(W, H) * 0.14)        # mêmes valeurs que l'overlay (index.html)
BAND_TOP, BAND_BOT = round(H * SPLIT - BAND / 2), round(H * SPLIT + BAND / 2)
NS = uuid.UUID('6f1d1c2e-3b7a-4c5e-9a10-5a3f4e0d2b11')
uid = lambda name: str(uuid.uuid5(NS, name))


def source(sid, name, settings):
    return {'id': sid, 'versioned_id': sid, 'name': name, 'uuid': uid(name), 'settings': settings,
            'enabled': True, 'flags': 0, 'volume': 1.0, 'muted': False, 'hotkeys': {}, 'private_settings': {}}


def item(name, iid, pos, bounds=None, visible=True):
    it = {'name': name, 'source_uuid': uid(name), 'visible': visible, 'locked': False, 'rot': 0.0,
          'pos': {'x': pos[0], 'y': pos[1]}, 'scale': {'x': 1.0, 'y': 1.0}, 'align': 5,
          'bounds_type': 0, 'bounds_align': 0, 'bounds': {'x': 0.0, 'y': 0.0},
          'crop_left': 0, 'crop_top': 0, 'crop_right': 0, 'crop_bottom': 0, 'id': iid,
          'group_item_backup': False, 'scale_filter': 'disable', 'blend_method': 'default', 'blend_type': 'normal',
          'show_transition': {'duration': 0}, 'hide_transition': {'duration': 0}, 'private_settings': {}}
    if bounds:  # 3 = « mettre à l'échelle pour remplir » (la caméra couvre toute sa zone)
        it.update(bounds_type=3, bounds={'x': float(bounds[0]), 'y': float(bounds[1])})
    return it


def browser(name, folder):
    return source('browser_source', name, {'is_local_file': True, 'local_file': f'__OVER__/{folder}/index.html',
                                           'width': W, 'height': H, 'restart_when_active': True, 'shutdown': False,
                                           'reroute_audio': False, 'fps_custom': False})


def scene(name, items):
    return source('scene', name, {'id_counter': len(items), 'custom_size': False, 'items': items})


CAM_P, CAM_O = 'Caméra PORTRAIT', 'Caméra OPENING'
cams = [item(CAM_O, 1, (0, BAND_BOT), (W, H - BAND_BOT)), item(CAM_P, 2, (0, 0), (W, BAND_TOP))]
SCENES = [
    ('LIVE ONE PIECE', cams + [item('Z3F4 One Piece', 3, (0, 0))]),
    ('LIVE POKEMON', cams + [item('Z3F4 Pokemon', 3, (0, 0))]),
    ('FIN DE LIVE ONE PIECE', [item('Z3F4 Fin de live One Piece', 1, (0, 0))]),
    ('FIN DE LIVE POKEMON', [item('Z3F4 Fin de live Pokemon', 1, (0, 0))]),
]
collection = {
    'name': 'Z3F4 Live',
    'current_scene': 'LIVE ONE PIECE', 'current_program_scene': 'LIVE ONE PIECE',
    'scene_order': [{'name': n} for n, _ in SCENES],
    'sources': [
        source('dshow_input', CAM_P, {}), source('dshow_input', CAM_O, {}),
        browser('Z3F4 One Piece', 'OVERLAY ONE PIECE'), browser('Z3F4 Pokemon', 'OVERLAY POKEMON'),
        browser('Z3F4 Fin de live One Piece', 'FIN DE LIVE ONE PIECE'), browser('Z3F4 Fin de live Pokemon', 'FIN DE LIVE POKEMON'),
    ] + [scene(n, its) for n, its in SCENES],
    'groups': [], 'quick_transitions': [], 'transitions': [], 'saved_projectors': [],
    'preview_locked': False, 'scaling_enabled': False, 'modules': {},
}

PROFILE = f"""[General]
Name=Z3F4 Whatnot

[Video]
BaseCX={W}
BaseCY={H}
OutputCX={W}
OutputCY={H}
FPSType=0
FPSCommon=30
ScaleType=bicubic

[Output]
Mode=Simple

[SimpleOutput]
VBitrate=4500
ABitrate=160
"""

PS1 = r"""# Prépare OBS pour les lives Z3F4 : profil « Z3F4 Whatnot » (1080x1920) + collection « Z3F4 Live »
$ErrorActionPreference = 'Stop'
try {
  $over = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
  Write-Host ''
  Write-Host '  Z3F4 - Préparation d''OBS' -ForegroundColor Yellow
  Write-Host "  Dossier OVER : $over"
  Write-Host ''
  if (Get-Process -Name obs64, obs32, obs -ErrorAction SilentlyContinue) {
    Write-Host '  OBS est ouvert : ferme-le complètement, puis relance ce fichier.' -ForegroundColor Red
    exit 1
  }
  $cfg = Join-Path $env:APPDATA 'obs-studio'
  $scenes = Join-Path $cfg 'basic\scenes'
  $prof = Join-Path $cfg 'basic\profiles\Z3F4_Whatnot'
  New-Item -ItemType Directory -Force -Path $scenes, $prof | Out-Null
  $utf8 = New-Object System.Text.UTF8Encoding $false
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

  # 1. Collection de scènes (chemins du dossier OVER insérés)
  $overJson = ($over -replace '\\', '/') -replace '"', '\"'
  $json = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'Z3F4_Live.json'), [Text.Encoding]::UTF8).Replace('__OVER__', $overJson)
  $dst = Join-Path $scenes 'Z3F4_Live.json'
  if (Test-Path $dst) { Copy-Item $dst "$dst.sauvegarde-$stamp" }
  [IO.File]::WriteAllText($dst, $json, $utf8)
  Write-Host '  [OK] Collection de scènes « Z3F4 Live » (4 scènes)' -ForegroundColor Green

  # 2. Profil 1080x1920
  $ini = Join-Path $prof 'basic.ini'
  if (Test-Path $ini) { Copy-Item $ini "$ini.sauvegarde-$stamp" }
  [IO.File]::WriteAllText($ini, [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'basic.ini'), [Text.Encoding]::UTF8), $utf8)
  Write-Host '  [OK] Profil « Z3F4 Whatnot » (1080 x 1920, 30 i/s)' -ForegroundColor Green

  # 3. Lancer OBS directement sur LIVE ONE PIECE
  $exe = @("$env:ProgramFiles\obs-studio\bin\64bit\obs64.exe",
           "${env:ProgramFiles(x86)}\obs-studio\bin\64bit\obs64.exe",
           "${env:ProgramFiles(x86)}\Steam\steamapps\common\OBS Studio\bin\64bit\obs64.exe") |
         Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
  Write-Host ''
  if ($exe) {
    Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe) -ArgumentList '--profile "Z3F4 Whatnot" --collection "Z3F4 Live" --scene "LIVE ONE PIECE"'
    Write-Host '  [OK] OBS se lance sur la scène LIVE ONE PIECE.' -ForegroundColor Green
  } else {
    Write-Host '  OBS introuvable automatiquement. Ouvre OBS, puis :' -ForegroundColor Yellow
    Write-Host '    menu Profil -> Z3F4 Whatnot'
    Write-Host '    menu Collection de scènes -> Z3F4 Live'
  }
  Write-Host ''
  Write-Host '  Il reste 2 choses à faire dans OBS :' -ForegroundColor Yellow
  Write-Host '    1. Double-clic sur « Caméra PORTRAIT » -> choisis ta webcam -> OK'
  Write-Host '    2. Double-clic sur « Caméra OPENING »  -> choisis la caméra des cartes -> OK'
  Write-Host '  (et ta clé de stream Whatnot / Voggt dans Paramètres -> Stream, si ce n''est pas déjà fait)'
} catch {
  Write-Host "  ERREUR : $($_.Exception.Message)" -ForegroundColor Red
  Write-Host '  Fais une capture de cette fenêtre et envoie-la.'
  exit 1
}
"""

SH = r'''#!/bin/bash
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
'''

BAT = '@echo off\r\nchcp 65001 >nul\r\npowershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0outils\\preparer-obs.ps1"\r\necho.\r\npause\r\n'


def build(out: pathlib.Path):
    tools = out / 'outils'
    tools.mkdir(exist_ok=True)
    (tools / 'Z3F4_Live.json').write_text(json.dumps(collection, ensure_ascii=False, indent=2), encoding='utf-8')
    (tools / 'basic.ini').write_text(PROFILE.replace('\n', '\r\n'), encoding='utf-8')
    (tools / 'preparer-obs.ps1').write_text('﻿' + PS1.replace('\r\n', '\n').replace('\n', '\r\n'), encoding='utf-8')  # BOM pour PowerShell 5
    (out / 'PREPARER OBS (double-clic).bat').write_bytes(BAT.encode('ascii'))
    # Version Mac : caméras « av_capture_input », profil en fins de ligne Unix, script .command exécutable
    mac = json.loads(json.dumps(collection))
    for src in mac['sources']:
        if src['id'] == 'dshow_input': src['id'] = src['versioned_id'] = 'av_capture_input'
    (tools / 'Z3F4_Live_mac.json').write_text(json.dumps(mac, ensure_ascii=False, indent=2), encoding='utf-8')
    (tools / 'basic_mac.ini').write_text(PROFILE, encoding='utf-8')
    cmd = out / 'PREPARER OBS - MAC (double-clic).command'
    cmd.write_text(SH, encoding='utf-8'); cmd.chmod(0o755)


if __name__ == '__main__':
    print(json.dumps(collection, ensure_ascii=False, indent=1)[:600])
    print('bande', BAND_TOP, BAND_BOT)
