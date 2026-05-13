#!/usr/bin/env python3
"""
imagine.py — Génération d'images multi-providers en parallèle
Usage: python imagine.py "ton prompt" [--providers dalle flux ideogram] [--quality best|fast] [--all]
"""

import asyncio, argparse, base64, json, os, sys, time
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))
from providers import dalle, dreamstudio, leonardo, ideogram, recraft, clipdrop, getimg, flux
from providers import pollinations, huggingface, prodia

ALL_PROVIDERS = {
    # ── Gratuits (aucune clé requise) ─────────────────────────────────────
    "pollinations": pollinations,   # 100% gratuit, no key
    "huggingface":  huggingface,    # gratuit (clé optionnelle pour +quotas)
    "prodia":       prodia,         # gratuit (clé optionnelle)
    # ── Payants (clé API requise) ──────────────────────────────────────────
    "dalle":        dalle,
    "dreamstudio":  dreamstudio,
    "leonardo":     leonardo,
    "ideogram":     ideogram,
    "recraft":      recraft,
    "clipdrop":     clipdrop,
    "getimg":       getimg,
    "flux":         flux,
}
FREE_PROVIDERS = {"pollinations", "huggingface", "prodia"}

CONFIG_PATH = Path(__file__).parent / "config.json"


def load_config() -> dict:
    with open(CONFIG_PATH) as f:
        cfg = json.load(f)
    cfg["defaults"]["output_dir"] = str(Path(cfg["defaults"]["output_dir"]).expanduser())
    return cfg


def active_providers(cfg: dict) -> list[str]:
    active = list(FREE_PROVIDERS)  # toujours actifs
    for name, key in cfg["keys"].items():
        if key.strip() and name in ALL_PROVIDERS and name not in FREE_PROVIDERS:
            active.append(name)
    return [p for p in ALL_PROVIDERS if p in active]


def save_image(b64: str, provider: str, prompt: str, out_dir: str) -> str:
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    slug = prompt[:40].replace(" ", "_").replace("/", "-")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    ext = "jpg" if b64[:4] == "/9j/" or b64.startswith("iVBORw0K") else "png"
    # detect jpeg vs png from header bytes
    raw = base64.b64decode(b64)
    ext = "jpg" if raw[:2] == b'\xff\xd8' else "png"
    path = Path(out_dir) / f"{ts}_{provider}_{slug}.{ext}"
    path.write_bytes(raw)
    return str(path)


async def run_provider(name: str, prompt: str, cfg: dict, quality: str) -> dict:
    mod = ALL_PROVIDERS[name]
    t0 = time.time()
    try:
        result = await asyncio.wait_for(mod.generate(prompt, cfg, quality), timeout=180)
    except asyncio.TimeoutError:
        result = {"provider": name, "error": "Timeout global (180s)"}
    except Exception as e:
        result = {"provider": name, "error": str(e)}
    result["elapsed"] = round(time.time() - t0, 1)
    return result


async def main():
    parser = argparse.ArgumentParser(description="Génération d'images multi-providers en parallèle")
    parser.add_argument("prompt", nargs="?", help="Prompt de génération")
    parser.add_argument("--providers", nargs="+", choices=list(ALL_PROVIDERS), help="Providers à utiliser")
    parser.add_argument("--quality", choices=["best", "fast"], default="best")
    parser.add_argument("--all", action="store_true", help="Utiliser tous les providers configurés")
    parser.add_argument("--list", action="store_true", help="Lister les providers configurés")
    args = parser.parse_args()

    cfg = load_config()
    active = active_providers(cfg)

    if args.list:
        print("\n=== Providers image ===")
        for name in ALL_PROVIDERS:
            if name in FREE_PROVIDERS:
                status = "✓ Actif (gratuit, no key)"
            elif name in active:
                status = "✓ Actif (clé configurée)"
            else:
                status = "✗ Clé manquante"
            print(f"  {name:15} {status}")
        print(f"\n=== Outils 3D & Animation ===")
        print(f"  triposr         local (pip install requis)")
        print(f"  shape_e         local (pip install requis)")
        print(f"  meshy           API (clé meshy requise)")
        print(f"  animatediff     via Replicate (clé replicate)")
        print(f"  svd             via Replicate (clé replicate)")
        print(f"\nConfig : {CONFIG_PATH}")
        print(f"3D     : python scan3d.py photo.jpg --engine triposr")
        print(f"Compare: python compare.py image_ia.jpg photo_reelle.jpg")
        return

    if not args.prompt:
        parser.print_help()
        return

    if args.all:
        selected = active
    elif args.providers:
        selected = [p for p in args.providers if p in active]
        missing_keys = [p for p in args.providers if p not in active]
        if missing_keys:
            print(f"⚠️  Clés manquantes pour : {', '.join(missing_keys)}")
    else:
        selected = active

    if not selected:
        print("❌ Aucun provider actif. Configure tes clés dans config.json")
        print(f"   → {CONFIG_PATH}")
        return

    print(f"\n🎨 Prompt : {args.prompt}")
    print(f"⚡ Providers ({len(selected)}) : {', '.join(selected)}")
    print(f"🔧 Qualité : {args.quality}\n")

    t_start = time.time()
    tasks = [run_provider(name, args.prompt, cfg, args.quality) for name in selected]
    results = await asyncio.gather(*tasks)

    out_dir = cfg["defaults"]["output_dir"]
    print("=" * 60)
    saved = []
    errors = []

    for res in results:
        name = res["provider"]
        elapsed = res.get("elapsed", "?")
        if "error" in res:
            errors.append(res)
            print(f"  ✗ {name:15} [{elapsed}s] — Erreur : {res['error']}")
        else:
            path = save_image(res["b64"], name, args.prompt, out_dir)
            saved.append({"provider": name, "path": path, "model": res.get("model", "")})
            print(f"  ✓ {name:15} [{elapsed}s] — {Path(path).name}")

    total = round(time.time() - t_start, 1)
    print("=" * 60)
    print(f"\n✅ {len(saved)}/{len(selected)} images générées en {total}s (parallèle)")

    if saved:
        print(f"\n📁 Dossier : {out_dir}")
        # Ouvrir le dossier sur macOS
        os.system(f'open "{out_dir}"')

    if errors:
        print(f"\n⚠️  {len(errors)} erreur(s) — vérifie config.json pour les clés API")


if __name__ == "__main__":
    asyncio.run(main())
