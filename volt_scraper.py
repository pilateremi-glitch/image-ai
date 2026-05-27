import requests, os, re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

url = "https://www.volt-corp.com/"
headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}

print("Connexion a", url)
resp = requests.get(url, headers=headers, timeout=15)
print("Status:", resp.status_code)

soup = BeautifulSoup(resp.text, "html.parser")
out = os.path.expanduser("~/Desktop/images_volt_corp")
os.makedirs(out, exist_ok=True)

seen = set()
found = []

# 1. Balises <img>
for tag in soup.find_all("img"):
    for attr in ["src", "data-src", "data-lazy-src", "data-original"]:
        src = tag.get(attr, "")
        if src and "data:image" not in src:
            found.append(urljoin(url, src).split("?")[0])

# 2. Balises <source> (picture/video)
for tag in soup.find_all("source"):
    src = tag.get("srcset", "").split()[0] or tag.get("src", "")
    if src:
        found.append(urljoin(url, src).split("?")[0])

# 3. CSS background-image inline
for tag in soup.find_all(style=True):
    for m in re.findall(r'url\(["\']?(https?://[^"\')\s]+)["\']?\)', tag["style"]):
        found.append(m.split("?")[0])

# 4. Balises <style>
for tag in soup.find_all("style"):
    for m in re.findall(r'url\(["\']?(https?://[^"\')\s]+)["\']?\)', tag.string or ""):
        found.append(m.split("?")[0])

# 5. Recherche dans tout le JS/HTML brut — URLs d'images
for m in re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|gif|webp|avif|svg)[^"\'<>\s]*', resp.text, re.IGNORECASE):
    found.append(m.split("?")[0])

# Dedupliquer et filtrer
exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"}
for src in found:
    if src in seen:
        continue
    seen.add(src)

print(f"\n{len(seen)} image(s) trouvee(s)\n")

i = 0
for src in seen:
    i += 1
    ext = os.path.splitext(urlparse(src).path)[-1].lower() or ".jpg"
    try:
        r = requests.get(src, headers=headers, timeout=10)
        with open(f"{out}/{i:03d}{ext}", "wb") as f:
            f.write(r.content)
        print(f"[{i:03d}] OK  {src}")
    except Exception as e:
        print(f"[{i:03d}] ERR {src} — {e}")

print(f"\nTermine : {i} images dans ~/Desktop/images_volt_corp/")
import subprocess; subprocess.run(["open", out])
