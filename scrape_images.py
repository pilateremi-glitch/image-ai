"""
Extrait toutes les images d'une collection Shopify.
Usage : python3 scrape_images.py
"""

import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

TARGET_URL = "https://bellefrag.com/collections/nos-elixirs-prestige"
OUTPUT_DIR = "images_bellefrag"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


def fetch_images_via_api(base_url: str) -> list[dict]:
    """Tente d'abord l'API JSON publique Shopify (plus fiable)."""
    collection_handle = base_url.rstrip("/").split("/collections/")[-1]
    api_url = f"https://bellefrag.com/collections/{collection_handle}/products.json?limit=250"
    resp = requests.get(api_url, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        return []

    images = []
    for product in resp.json().get("products", []):
        for img in product.get("images", []):
            src = img.get("src", "").split("?")[0]
            images.append({"product": product["title"], "url": src})
    return images


def fetch_images_via_html(url: str) -> list[dict]:
    """Fallback : parse le HTML de la page."""
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    images = []
    for tag in soup.find_all("img"):
        src = (
            tag.get("src")
            or tag.get("data-src")
            or tag.get("data-srcset", "").split()[0]
        )
        if not src:
            continue
        src = src.lstrip("/")
        if not src.startswith("http"):
            src = "https://" + src
        src = src.split("?")[0]
        alt = tag.get("alt", "").strip() or "image"
        images.append({"product": alt, "url": src})
    return images


def sanitize_filename(name: str) -> str:
    return re.sub(r'[\\/*?:"<>|]', "_", name)[:80]


def download_images(images: list[dict], output_dir: str) -> None:
    os.makedirs(output_dir, exist_ok=True)
    print(f"\n{len(images)} image(s) trouvée(s). Téléchargement dans '{output_dir}/'...\n")

    for i, img in enumerate(images, 1):
        url = img["url"]
        ext = os.path.splitext(urlparse(url).path)[-1] or ".jpg"
        filename = f"{i:03d}_{sanitize_filename(img['product'])}{ext}"
        filepath = os.path.join(output_dir, filename)

        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            with open(filepath, "wb") as f:
                f.write(r.content)
            print(f"  [{i:03d}] {filename}")
        except Exception as e:
            print(f"  [{i:03d}] ERREUR {url} — {e}")

    print(f"\nTerminé. Images sauvegardées dans '{output_dir}/'")


def main() -> None:
    print(f"Cible : {TARGET_URL}\n")

    print("Tentative via l'API Shopify JSON...")
    images = fetch_images_via_api(TARGET_URL)

    if not images:
        print("API bloquée, fallback sur le HTML...")
        images = fetch_images_via_html(TARGET_URL)

    if not images:
        print("Aucune image trouvée. Le site bloque peut-être les requêtes automatisées.")
        return

    # Afficher la liste
    for img in images:
        print(f"  {img['product']} → {img['url']}")

    answer = input("\nTélécharger ces images ? (o/n) : ").strip().lower()
    if answer == "o":
        download_images(images, OUTPUT_DIR)


if __name__ == "__main__":
    main()
