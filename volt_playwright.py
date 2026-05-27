import os, re, requests
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

BASE_URL = "https://www.volt-corp.com/shop/category/trottinettes-electriques-12"
OUTPUT_DIR = os.path.expanduser("~/Desktop/images_volt_corp")
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"}


def is_image(url):
    return os.path.splitext(urlparse(url).path)[-1].lower() in IMAGE_EXTS


def collect_images(page, url):
    print(f"  Chargement : {url}")
    try:
        page.goto(url, timeout=20000)
    except Exception:
        pass
    page.wait_for_timeout(3000)

    # Scroll pour lazy loading
    for _ in range(6):
        page.evaluate("window.scrollBy(0, 600)")
        page.wait_for_timeout(500)

    html = page.content()
    found = set()

    # <img> tags
    for tag in page.query_selector_all("img"):
        for attr in ["src", "data-src", "data-lazy", "data-original"]:
            val = tag.get_attribute(attr)
            if val and "data:image" not in val:
                found.add(urljoin(url, val).split("?")[0])
        srcset = tag.get_attribute("srcset") or ""
        for part in srcset.split(","):
            parts = part.strip().split()
            if parts:
                found.add(urljoin(url, parts[0]).split("?")[0])

    # Regex sur tout le HTML (images dans JS/CSS)
    for m in re.findall(
        r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|gif|webp|avif|svg)[^"\'<>\s]*',
        html, re.IGNORECASE
    ):
        found.add(m.split("?")[0])

    images = {u for u in found if is_image(u)}
    print(f"    => {len(images)} images")
    return images


def get_product_links(page):
    links = set()
    for a in page.query_selector_all("a[href]"):
        href = a.get_attribute("href") or ""
        full = urljoin(BASE_URL, href).split("?")[0]
        if "volt-corp.com/shop" in full and full != BASE_URL and "/category/" not in full:
            links.add(full)
    return links


def download(url, filepath):
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        with open(filepath, "wb") as f:
            f.write(r.content)
        return True
    except Exception as e:
        print(f"    ERR {e}")
        return False


os.makedirs(OUTPUT_DIR, exist_ok=True)
all_images = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_extra_http_headers(HEADERS)

    print("\n[1/3] Page categorie...")
    for img in collect_images(page, BASE_URL):
        all_images[img] = "categorie"

    print("\n[2/3] Liens produits...")
    product_links = get_product_links(page)
    print(f"  {len(product_links)} produit(s) trouve(s)")

    for i, link in enumerate(product_links, 1):
        print(f"\n  Produit {i}/{len(product_links)}")
        for img in collect_images(page, link):
            if img not in all_images:
                all_images[img] = link

    browser.close()

print(f"\n[3/3] Telechargement de {len(all_images)} images...\n")
ok = 0
for i, (url, _) in enumerate(all_images.items(), 1):
    ext = os.path.splitext(urlparse(url).path)[-1].lower() or ".jpg"
    path = os.path.join(OUTPUT_DIR, f"{i:04d}{ext}")
    if download(url, path):
        print(f"  [{i:04d}] {url}")
        ok += 1

print(f"\n{'='*50}")
print(f"  Termine : {ok} images dans {OUTPUT_DIR}")
print(f"{'='*50}\n")

import subprocess
subprocess.run(["open", OUTPUT_DIR])
