#!/usr/bin/env python3
"""
compare.py — Compare des images IA avec des photos réelles
Métriques: SSIM, PSNR, histogramme couleur, hash perceptuel
Usage: python compare.py image_ia.png photo_reelle.jpg [--dir dossier/]
"""

import argparse, json, os, sys
from pathlib import Path
from datetime import datetime

def check_deps():
    missing = []
    for pkg in ["PIL", "numpy", "skimage"]:
        try:
            __import__(pkg if pkg != "PIL" else "PIL.Image")
        except ImportError:
            missing.append(pkg.replace("PIL", "Pillow").replace("skimage", "scikit-image"))
    return missing

def ssim_score(img1, img2):
    from skimage.metrics import structural_similarity as ssim
    import numpy as np
    from PIL import Image
    size = (512, 512)
    a = np.array(Image.open(img1).convert("RGB").resize(size))
    b = np.array(Image.open(img2).convert("RGB").resize(size))
    score, _ = ssim(a, b, channel_axis=2, full=True, data_range=255)
    return round(float(score), 4)

def psnr_score(img1, img2):
    from skimage.metrics import peak_signal_noise_ratio as psnr
    import numpy as np
    from PIL import Image
    size = (512, 512)
    a = np.array(Image.open(img1).convert("RGB").resize(size))
    b = np.array(Image.open(img2).convert("RGB").resize(size))
    return round(float(psnr(a, b, data_range=255)), 2)

def color_histogram_similarity(img1, img2):
    import numpy as np
    from PIL import Image
    size = (256, 256)
    a = np.array(Image.open(img1).convert("RGB").resize(size))
    b = np.array(Image.open(img2).convert("RGB").resize(size))
    scores = []
    for ch in range(3):
        ha, _ = np.histogram(a[:,:,ch], bins=64, range=(0,255))
        hb, _ = np.histogram(b[:,:,ch], bins=64, range=(0,255))
        ha = ha / ha.sum()
        hb = hb / hb.sum()
        score = 1 - 0.5 * np.sum(np.abs(ha - hb))
        scores.append(score)
    return round(float(np.mean(scores)), 4)

def phash_distance(img1, img2):
    """Hash perceptuel — distance 0 = identique, 64 = très différent."""
    from PIL import Image
    import numpy as np
    size = (32, 32)
    def phash(path):
        img = Image.open(path).convert("L").resize(size)
        arr = np.array(img, dtype=float)
        mean = arr.mean()
        return (arr > mean).flatten()
    h1 = phash(img1)
    h2 = phash(img2)
    dist = int(np.sum(h1 != h2))
    similarity = round(1 - dist / len(h1), 4)
    return {"distance": dist, "similarity": similarity}

def score_label(ssim: float) -> str:
    if ssim > 0.9:  return "Quasi-identique"
    if ssim > 0.7:  return "Très similaire"
    if ssim > 0.5:  return "Similaire"
    if ssim > 0.3:  return "Partiellement similaire"
    return "Différent"

def compare_pair(ai_img: str, real_img: str, output_dir: str) -> dict:
    print(f"\n🔍 Comparaison:")
    print(f"   IA    : {Path(ai_img).name}")
    print(f"   Réel  : {Path(real_img).name}")

    result = {
        "ai_image": ai_img,
        "real_image": real_img,
        "timestamp": datetime.now().isoformat(),
    }

    try:
        s = ssim_score(ai_img, real_img)
        p = psnr_score(ai_img, real_img)
        c = color_histogram_similarity(ai_img, real_img)
        ph = phash_distance(ai_img, real_img)

        result.update({
            "ssim": s,
            "psnr_db": p,
            "color_similarity": c,
            "phash_similarity": ph["similarity"],
            "phash_distance": ph["distance"],
            "overall_score": round((s + c + ph["similarity"]) / 3, 4),
            "label": score_label(s),
        })

        print(f"\n   {'SSIM (structure)':25} {s:.4f}  {'★' * int(s*5)}")
        print(f"   {'PSNR (qualité)':25} {p:.1f} dB")
        print(f"   {'Couleurs':25} {c:.4f}  {'★' * int(c*5)}")
        print(f"   {'Hash perceptuel':25} {ph['similarity']:.4f}  (dist: {ph['distance']}/1024)")
        print(f"\n   Score global    : {result['overall_score']:.4f}")
        print(f"   Verdict         : {result['label']}")

    except Exception as e:
        result["error"] = str(e)
        print(f"   Erreur: {e}")

    # Sauvegarde JSON
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = Path(output_dir) / f"{ts}_comparison.json"
    report_path.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\n   Rapport → {report_path}")
    return result


def compare_folder(ai_dir: str, real_img: str, output_dir: str):
    """Compare toutes les images d'un dossier (résultats multi-providers) avec une photo réelle."""
    imgs = sorted(Path(ai_dir).glob("*.png")) + sorted(Path(ai_dir).glob("*.jpg"))
    if not imgs:
        print(f"Aucune image trouvée dans {ai_dir}")
        return

    results = []
    for img in imgs:
        r = compare_pair(str(img), real_img, output_dir)
        results.append(r)

    # Classement
    results.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
    print("\n" + "=" * 60)
    print("🏆 CLASSEMENT (meilleur → moins bon)")
    print("=" * 60)
    for i, r in enumerate(results, 1):
        if "error" not in r:
            name = Path(r["ai_image"]).name
            print(f"  {i}. {name:40} score={r['overall_score']:.4f}  {r['label']}")


def main():
    missing = check_deps()
    if missing:
        print(f"❌ Dépendances manquantes: pip install {' '.join(missing)}")
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Compare images IA vs photos réelles")
    parser.add_argument("ai_image", help="Image IA (ou dossier avec --dir)")
    parser.add_argument("real_image", help="Photo réelle de référence")
    parser.add_argument("--dir", action="store_true", help="ai_image est un dossier")
    parser.add_argument("--output", default="~/image-ai/output/comparisons")
    args = parser.parse_args()

    out = str(Path(args.output).expanduser())

    if args.dir:
        compare_folder(args.ai_image, args.real_image, out)
    else:
        compare_pair(args.ai_image, args.real_image, out)


if __name__ == "__main__":
    main()
