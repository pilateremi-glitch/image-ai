import asyncio, os, re, requests
from urllib.parse import urljoin, urlparse
from playwright.async_api import async_playwright

BASE_URL = "https://www.volt-corp.com/shop/category/trottinettes-electriques-12"
OUTPUT_DIR = os.path.expanduser("~/Desktop/images_volt_corp")
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"}


def is_image_url(url):
    ext = os.path.splitext(urlparse(url).path)[-1].lower()
    return ext in IMAGE_EXTS


def download_image(url, filepath):
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        with open(filepath, "wb") as f:
            f.write(r.content)
        return True
    except Exception as e:
        print(f"  ERR {url} — {e}")
        return False


async def get_images_from_page(page, url):
    """Charge une page, scroll jusqu'en bas, retourne toutes les URLs d'images."""
    try:
        await page.goto(url, wait_until="load", timeout=20000)
    except Exception:
        pass  # continuer même si timeout, la page est probablement chargée
    await asyncio.sleep(2)

    # Scroll pour déclencher le lazy loading
    for _ in range(5):
        await page.evaluate("window.scrollBy(0, window.innerHeight)")
        await asyncio.sleep(0.8)
    await page.evaluate("window.scrollTo(0, 0)")
    await asyncio.sleep(1)

    html = await page.content()

    images = set()

    # Tous les <img>
    tags = await page.query_selector_all("img")
    for tag in tags:
        for attr in ["src", "data-src", "data-lazy", "data-original"]:
            val = await tag.get_attribute(attr)
            if val and "data:image" not in val:
                images.add(urljoin(url, val).split("?")[0])

    # srcset
    for tag in tags:
        srcset = await tag.get_attribute("srcset") or ""
        for part in srcset.split(","):
            parts = part.strip().split()
            if parts:
                images.add(urljoin(url, parts[0]).split("?")[0])

    # CSS background-image via regex dans le HTML
    for m in re.findall(
        r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|gif|webp|avif|svg)[^"\'<>\s]*',
        html, re.IGNORECASE
    ):
        images.add(m.split("?")[0])

    return {u for u in images if is_image_url(u)}


async def get_product_links(page):
    """Récupère les liens vers les pages produits de la catégorie."""
    links = set()
    anchors = await page.query_selector_all("a[href]")
    for a in anchors:
        href = await a.get_attribute("href")
        if href:
            full = urljoin(BASE_URL, href)
            # Garder uniquement les pages produit du même domaine
            if "volt-corp.com/shop" in full and full != BASE_URL:
                links.add(full.split("?")[0])
    return links


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_images = {}  # url -> source_page

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_extra_http_headers(HEADERS)

        # 1. Page catégorie
        print(f"\n Chargement de la categorie...")
        cat_images = await get_images_from_page(page, BASE_URL)
        for img in cat_images:
            all_images[img] = "categorie"
        print(f"   {len(cat_images)} images trouvees sur la page categorie")

        # 2. Pages produits
        product_links = await get_product_links(page)
        print(f"\n {len(product_links)} produit(s) trouve(s), chargement des sous-images...\n")

        for i, link in enumerate(product_links, 1):
            print(f"  [{i}/{len(product_links)}] {link}")
            try:
                prod_images = await get_images_from_page(page, link)
                new = 0
                for img in prod_images:
                    if img not in all_images:
                        all_images[img] = link
                        new += 1
                print(f"    +{new} nouvelles images")
            except Exception as e:
                print(f"    ERR : {e}")

        await browser.close()

    # 3. Téléchargement
    print(f"\n{'='*50}")
    print(f" {len(all_images)} images au total — telechargement...")
    print(f"{'='*50}\n")

    ok = 0
    for i, (img_url, source) in enumerate(all_images.items(), 1):
        ext = os.path.splitext(urlparse(img_url).path)[-1].lower() or ".jpg"
        filename = f"{i:04d}{ext}"
        filepath = os.path.join(OUTPUT_DIR, filename)
        if download_image(img_url, filepath):
            print(f"  [{i:04d}] OK  {img_url}")
            ok += 1

    print(f"\n{'='*50}")
    print(f" Termine : {ok}/{len(all_images)} images")
    print(f" Dossier : {OUTPUT_DIR}")
    print(f"{'='*50}\n")

    import subprocess
    subprocess.run(["open", OUTPUT_DIR])


asyncio.run(main())
