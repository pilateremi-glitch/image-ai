# Prépare OBS pour les lives Z3F4 : profil « Z3F4 Whatnot » (1080x1920) + collection « Z3F4 Live »
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
