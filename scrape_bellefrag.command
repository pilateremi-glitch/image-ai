#!/bin/bash
# Double-cliquer sur ce fichier pour lancer le scraper sur Mac

cd "$(dirname "$0")"

echo "================================"
echo "  Extracteur d'images Volt-Corp"
echo "================================"
echo ""

# Vérifier Python3
if ! command -v python3 &>/dev/null; then
    echo "❌ Python3 non trouvé. Installe-le depuis https://python.org"
    read -p "Appuie sur Entrée pour fermer..."
    exit 1
fi

echo "✅ Python3 détecté : $(python3 --version)"
echo ""

# Installer les dépendances si besoin
echo "📦 Vérification des dépendances..."
python3 -m pip install -q requests beautifulsoup4
echo "✅ Dépendances prêtes"
echo ""

# Lancer le script
python3 scrape_images.py

echo ""
read -p "Appuie sur Entrée pour fermer..."
