#!/usr/bin/env python3
"""
manga.py — Transforme des photos en style manga
Deux moteurs :
  local : filtre instantané, gratuit, hors-ligne (encrage + trames noir & blanc)
  ai    : vraie réinterprétation manga via FLUX Kontext (clé Replicate requise)

Usage:
  python manga.py photo.jpg                       # filtre local instantané
  python manga.py photos/                         # tout un dossier (en parallèle)
  python manga.py photo.jpg --engine ai           # rendu IA manga N&B
  python manga.py photo.jpg --engine ai --color   # rendu IA anime couleur
  python manga.py photo.jpg --engine both         # les deux
"""

import asyncio, argparse, base64, json, os, sys, time
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

CONFIG_PATH = Path(__file__).parent / "config.json"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

AI_MODEL = "black-forest-labs/flux-kontext-pro"
AI_PROMPTS = {
    "bw": ("Convert this photo into a black and white Japanese manga panel: clean bold ink "
           "lineart, screentone shading, high contrast, expressive manga eyes, detailed hair "
           "strands, keep the same composition, pose and identity"),
    "color": ("Convert this photo into a vibrant anime illustration: clean cel shading, bold "
              "lineart, anime style eyes and hair, keep the same composition, pose and identity"),
}


def load_config() -> dict:
    with open(CONFIG_PATH) as f:
        cfg = json.load(f)
    cfg["defaults"]["output_dir"] = str(Path(cfg["defaults"]["output_dir"]).expanduser())
    return cfg


def collect_images(paths: list[str]) -> list[Path]:
    found = []
    for p in map(Path, paths):
        if p.is_dir():
            found += sorted(f for f in p.rglob("*") if f.suffix.lower() in IMAGE_EXTS)
        elif p.suffix.lower() in IMAGE_EXTS and p.exists():
            found.append(p)
        else:
            print(f"⚠️  Ignoré : {p}")
    return found


# ── Moteur local ──────────────────────────────────────────────────────────────

def _blur(a: np.ndarray, sigma: float) -> np.ndarray:
    img = Image.fromarray((a * 255).clip(0, 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(sigma)), dtype=np.float32) / 255


def _screentone(shape: tuple, cell: int, radius: float) -> np.ndarray:
    """Trame de points à 45° ; renvoie True là où il y a de l'encre."""
    h, w = shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u, v = (x + y) / np.sqrt(2), (x - y) / np.sqrt(2)
    du = (u % cell) - cell / 2
    dv = (v % cell) - cell / 2
    return np.hypot(du, dv) < radius * cell


def manga_filter(src: Path, max_side: int = 1600, detail: float = 1.0) -> Image.Image:
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    scale = max_side / max(img.size)
    if scale < 1 or max(img.size) < 1200:  # agrandit les petites photos pour des traits nets
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    gray = ImageOps.autocontrast(img.convert("L"), cutoff=1)
    # Lissage qui préserve les bords (aplats façon manga)
    gray = gray.filter(ImageFilter.MedianFilter(5))
    g = np.asarray(gray, dtype=np.float32) / 255

    # Encrage : XDoG (Difference of Gaussians étendue)
    s = max(0.6, min(g.shape) / 900) / detail
    dog = _blur(g, s) - 0.98 * _blur(g, s * 1.6)
    ink = np.where(dog >= 0.01, 1.0, 1.0 + np.tanh(60 * (dog - 0.01))) < 0.5

    # Tons : blanc / trame claire / trame dense / noir
    t = _blur(g, s * 1.5)
    cell = max(4, round(min(g.shape) / 180))
    out = np.ones_like(g, dtype=bool)                      # True = papier blanc
    out[t < 0.72] = ~_screentone(g.shape, cell, 0.28)[t < 0.72]
    out[t < 0.48] = ~_screentone(g.shape, cell, 0.45)[t < 0.48]
    out[t < 0.22] = False
    out &= ~ink
    return Image.fromarray((out * 255).astype(np.uint8), "L")


def run_local(src: Path, out_dir: Path, detail: float) -> str:
    dst = out_dir / f"{src.stem}_manga.png"
    manga_filter(src, detail=detail).save(dst, optimize=True)
    return str(dst)


# ── Moteur IA (Replicate / FLUX Kontext) ──────────────────────────────────────

async def run_ai(session, src: Path, out_dir: Path, key: str, color: bool) -> str:
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    img.thumbnail((1536, 1536), Image.LANCZOS)
    tmp = out_dir / f".{src.stem}_in.jpg"
    img.save(tmp, quality=92)
    data_uri = "data:image/jpeg;base64," + base64.b64encode(tmp.read_bytes()).decode()
    tmp.unlink()

    headers = {"Authorization": f"Token {key}", "Content-Type": "application/json",
               "Prefer": "wait=60"}
    payload = {"input": {"prompt": AI_PROMPTS["color" if color else "bw"],
                         "input_image": data_uri, "aspect_ratio": "match_input_image",
                         "output_format": "png"}}
    async with session.post(f"https://api.replicate.com/v1/models/{AI_MODEL}/predictions",
                            json=payload, headers=headers) as r:
        data = await r.json()
        if r.status not in (200, 201):
            raise RuntimeError(str(data)[:200])

    for _ in range(100):
        if data["status"] == "succeeded":
            break
        if data["status"] in ("failed", "canceled"):
            raise RuntimeError(data.get("error") or data["status"])
        await asyncio.sleep(2)
        async with session.get(data["urls"]["get"], headers=headers) as r:
            data = await r.json()
    else:
        raise RuntimeError("Timeout FLUX Kontext")

    url = data["output"][0] if isinstance(data["output"], list) else data["output"]
    async with session.get(url) as r:
        raw = await r.read()
    dst = out_dir / f"{src.stem}_manga_ai{'_color' if color else ''}.png"
    dst.write_bytes(raw)
    return str(dst)


# ── Main ──────────────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(description="Photos → style manga")
    parser.add_argument("inputs", nargs="+", help="Photos ou dossiers")
    parser.add_argument("--engine", choices=["local", "ai", "both"], default="local")
    parser.add_argument("--color", action="store_true", help="IA : anime couleur au lieu de N&B")
    parser.add_argument("--detail", type=float, default=1.0, help="Local : finesse des traits (0.5–2)")
    parser.add_argument("--out", help="Dossier de sortie (défaut : output_dir/manga)")
    args = parser.parse_args()

    cfg = load_config()
    out_dir = Path(args.out or Path(cfg["defaults"]["output_dir"]) / "manga").expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)

    images = collect_images(args.inputs)
    if not images:
        print("❌ Aucune image trouvée")
        return

    key = (os.environ.get("REPLICATE_API_TOKEN") or cfg["keys"].get("replicate", "")).strip()
    use_ai = args.engine in ("ai", "both")
    if use_ai and not key:
        print("⚠️  Clé Replicate manquante dans config.json → moteur IA désactivé")
        use_ai = False
    use_local = args.engine in ("local", "both") or not use_ai

    print(f"\n🖌️  {len(images)} photo(s) → manga "
          f"[{' + '.join(n for n, on in (('local', use_local), ('ia', use_ai)) if on)}]\n")
    t0 = time.time()
    ok, fail = 0, 0
    loop = asyncio.get_running_loop()

    async def local_jobs():
        nonlocal ok, fail
        with ProcessPoolExecutor() as pool:
            futs = [loop.run_in_executor(pool, run_local, p, out_dir, args.detail) for p in images]
            for p, res in zip(images, await asyncio.gather(*futs, return_exceptions=True)):
                if isinstance(res, Exception):
                    fail += 1
                    print(f"  ✗ local {p.name} — {res}")
                else:
                    ok += 1
                    print(f"  ✓ local {p.name} → {Path(res).name}")

    async def ai_jobs():
        nonlocal ok, fail
        import aiohttp
        sem = asyncio.Semaphore(4)
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=300)) as s:
            async def one(p):
                async with sem:
                    return await run_ai(s, p, out_dir, key, args.color)
            results = await asyncio.gather(*(one(p) for p in images), return_exceptions=True)
        for p, res in zip(images, results):
            if isinstance(res, Exception):
                fail += 1
                print(f"  ✗ ia    {p.name} — {res}")
            else:
                ok += 1
                print(f"  ✓ ia    {p.name} → {Path(res).name}")

    await asyncio.gather(*([local_jobs()] if use_local else []), *([ai_jobs()] if use_ai else []))
    print(f"\n✅ {ok} image(s) générée(s), {fail} erreur(s) en {time.time() - t0:.1f}s")
    print(f"📁 {out_dir}")


if __name__ == "__main__":
    asyncio.run(main())
