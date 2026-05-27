"""
Extrait et télécharge toutes les images d'une collection Shopify.
Usage : python3 scrape_images.py
        ou double-cliquer sur scrape_bellefrag.command (Mac)
"""

import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

TARGET_URL = "https://bellefrag.com/collections/nos-elixirs-prestige"
OUTPUT_DIR = os.path.join(os.path.expanduser("~"), "Desktop", "images_bellefrag")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8",
}


def fetch_via_api() -> list[dict]:
    """Utilise l'API JSON publique Shopify."""
    handle = TARGET_URL.rstrip("/").split("/collections/")[-1]
    url = f"https://bellefrag.com/collections/{handle}/products.json?limit=250"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        return []

    images = []
    for product in resp.json().get("products", []):
        for img in product.get("images", []):
            src = img.get("src", "").split("?")[0]
            images.append({"product": product["title"], "url": src})
    return images


def fetch_via_html() -> list[dict]:
    """Fallback : parse le HTML de la page."""
    resp = requests.get(TARGET_URL, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    images = []
    for tag in soup.find_all("img"):
        src = (
            tag.get("src")
            or tag.get("data-src")
            or tag.get("data-srcset", "").split()[0]
        )
        if not src or "data:image" in src:
            continue
        src = src.lstrip("/")
        if not src.startswith("http"):
            src = "https://" + src
        src = src.split("?")[0]
        alt = tag.get("alt", "").strip() or "image"
        images.append({"product": alt, "url": src})
    return images


def sanitize(name: str) -> str:
    return re.sub(r'[\\/*?:"<>|]', "_", name)[:80]


def download(images: list[dict]) -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\n📥 Téléchargement de {len(images)} image(s) vers :\n   {OUTPUT_DIR}\n")

    ok, fail = 0, 0
    for i, img in enumerate(images, 1):
        url = img["url"]
        ext = os.path.splitext(urlparse(url).path)[-1] or ".jpg"
        filename = f"{i:03d}_{sanitize(img['product'])}{ext}"
        filepath = os.path.join(OUTPUT_DIR, filename)

        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            with open(filepath, "wb") as f:
                f.write(r.content)
            print(f"  ✅ [{i:03d}] {filename}")
            ok += 1
        except Exception as e:
            print(f"  ❌ [{i:03d}] Erreur : {e}")
            fail += 1

    print(f"\n{'='*45}")
    print(f"  Terminé : {ok} téléchargée(s), {fail} erreur(s)")
    print(f"  Dossier : {OUTPUT_DIR}")
    print(f"{'='*45}")

    # Ouvrir le dossier automatiquement sur Mac
    if ok > 0:
        os.system(f'open "{OUTPUT_DIR}"')


def main() -> None:
    print(f"🔍 Cible : {TARGET_URL}\n")

    print("  → Tentative via l'API Shopify JSON...")
    images = fetch_via_api()

    if not images:
        print("  → Fallback HTML...")
        try:
            images = fetch_via_html()
        except Exception as e:
            print(f"  ❌ Impossible de récupérer la page : {e}")
            print("\n⚠️  Le site bloque les requêtes automatisées depuis cette IP.")
            return

    if not images:
        print("❌ Aucune image trouvée.")
        return

    print(f"\n✅ {len(images)} image(s) trouvée(s) :\n")
    for img in images:
        print(f"  • {img['product']}")
        print(f"    {img['url']}")

    print()
    answer = input("Télécharger toutes ces images ? (o/n) : ").strip().lower()
    if answer in ("o", "oui", "y", "yes"):
        download(images)
    else:
        print("Annulé.")


if __name__ == "__main__":
    main()
