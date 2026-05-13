#!/usr/bin/env python3
"""
scan3d.py — Pipeline complet : Photo → 3D Mesh → Animation
Étapes:
  1. Scan/segmentation de l'image (détection sujet)
  2. Génération mesh 3D (TripoSR local ou Meshy API)
  3. Animation du mesh (AnimateDiff ou SVD)
  4. Export final (GLB/OBJ + MP4)

Usage:
  python scan3d.py photo.jpg                        # pipeline complet auto
  python scan3d.py photo.jpg --engine triposr       # forcer TripoSR local
  python scan3d.py photo.jpg --engine meshy         # Meshy API (clé requise)
  python scan3d.py photo.jpg --animate walk         # animer avec motion "walk"
  python scan3d.py photo.jpg --video                # générer vidéo SVD
"""

import asyncio, argparse, json, os, sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

CONFIG_PATH = Path(__file__).parent / "config.json"

def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)

def preprocess_image(image_path: str, output_dir: str) -> str:
    """Redimensionne et isole le sujet pour optimiser la 3D."""
    try:
        from PIL import Image
        import numpy as np
    except ImportError:
        return image_path

    img = Image.open(image_path).convert("RGBA")
    # Resize à 1024x1024 max (optimal pour TripoSR)
    img.thumbnail((1024, 1024), Image.LANCZOS)
    out = Path(output_dir) / f"preprocessed_{Path(image_path).stem}.png"
    img.save(str(out), "PNG")
    return str(out)


async def run_pipeline(image_path: str, engine: str, animate: str, video: bool, cfg: dict):
    out_dir = str(Path(cfg["defaults"]["output_dir"]).expanduser() / "3d")
    anim_dir = str(Path(cfg["defaults"]["output_dir"]).expanduser() / "animations")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    print(f"\n📷 Image source  : {image_path}")
    print(f"⚙️  Moteur 3D     : {engine}")
    print(f"📁 Sortie        : {out_dir}\n")

    # ── Étape 1 : Prétraitement ──────────────────────────────────────────────
    print("1/3 Prétraitement de l'image...")
    processed = preprocess_image(image_path, out_dir)
    print(f"    → {Path(processed).name}")

    # ── Étape 2 : Génération 3D ──────────────────────────────────────────────
    print(f"\n2/3 Génération 3D ({engine})...")
    mesh_result = None

    if engine == "triposr":
        from providers.triposr import generate_3d
        mesh_result = await generate_3d(processed, out_dir)

    elif engine == "shape_e":
        from providers.shape_e import generate_3d_from_image
        mesh_result = await generate_3d_from_image(processed, out_dir)

    elif engine == "meshy":
        from providers.meshy3d import image_to_3d
        mesh_result = await image_to_3d(processed, out_dir, cfg)

    elif engine == "replicate_triposr":
        # TripoSR via Replicate (pas besoin d'install locale)
        from providers.flux import generate as flux_gen  # réutilise le client replicate
        key = cfg["keys"].get("replicate", "")
        if not key:
            mesh_result = {"error": "Clé Replicate manquante"}
        else:
            import aiohttp, base64 as b64
            with open(processed, "rb") as f:
                img_data = "data:image/png;base64," + b64.b64encode(f.read()).decode()
            headers = {"Authorization": f"Token {key}", "Content-Type": "application/json"}
            payload = {
                "version": "4e9e7b04c18ee28bcbdfe14ae8f0f44fc2cf7697f1f63eb4a6c2b614efb1e64c",
                "input": {"image": img_data}
            }
            async with aiohttp.ClientSession() as s:
                async with s.post("https://api.replicate.com/v1/predictions",
                                  json=payload, headers=headers,
                                  timeout=aiohttp.ClientTimeout(total=30)) as r:
                    data = await r.json()
                poll_url = data["urls"]["get"]
                for _ in range(40):
                    await asyncio.sleep(4)
                    async with s.get(poll_url, headers=headers) as r:
                        data = await r.json()
                        if data["status"] == "succeeded":
                            model_url = data["output"]
                            async with s.get(model_url) as dl:
                                raw = await dl.read()
                            out_path = Path(out_dir) / f"{Path(processed).stem}_triposr.glb"
                            Path(out_dir).mkdir(parents=True, exist_ok=True)
                            out_path.write_bytes(raw)
                            mesh_result = {"provider": "triposr_replicate",
                                           "mesh_path": str(out_path), "format": "glb"}
                            break
                        if data["status"] == "failed":
                            mesh_result = {"error": "TripoSR Replicate failed"}
                            break

    if not mesh_result:
        mesh_result = {"error": "Aucun moteur 3D disponible"}

    if "error" in mesh_result:
        print(f"    ✗ Erreur: {mesh_result['error']}")
    else:
        print(f"    ✓ Mesh généré : {Path(mesh_result['mesh_path']).name}")
        print(f"      Format      : {mesh_result['format'].upper()}")

    # ── Étape 3 : Animation ──────────────────────────────────────────────────
    anim_result = None
    if video and "error" not in mesh_result:
        print(f"\n3/3 Génération vidéo (SVD)...")
        from providers.svd import image_to_video
        anim_result = await image_to_video(processed, anim_dir, cfg,
                                           num_frames=25, fps=6, motion_strength=127)
        if "error" in anim_result:
            print(f"    ✗ {anim_result['error']}")
        else:
            print(f"    ✓ Vidéo : {Path(anim_result['video_path']).name}")

    elif animate and "error" not in mesh_result:
        print(f"\n3/3 Animation du mesh ({animate})...")
        from providers.animatediff import image_to_animation
        anim_result = await image_to_animation(processed, animate, anim_dir, cfg)
        if "error" in anim_result:
            print(f"    ✗ {anim_result['error']}")
        else:
            print(f"    ✓ Animation : {Path(anim_result['video_path']).name}")

    # ── Rapport final ────────────────────────────────────────────────────────
    report = {
        "timestamp": ts,
        "source_image": image_path,
        "engine": engine,
        "mesh": mesh_result,
        "animation": anim_result,
    }
    report_path = Path(out_dir) / f"{ts}_scan3d_report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))

    print("\n" + "=" * 50)
    print("✅ Pipeline terminé")
    if "error" not in mesh_result:
        print(f"   Mesh 3D  → {mesh_result.get('mesh_path', '')}")
    if anim_result and "error" not in anim_result:
        video_key = "video_path" if "video_path" in anim_result else "animation_url"
        print(f"   Animation→ {anim_result.get(video_key, '')}")
    print(f"   Rapport  → {report_path}")

    # Ouvrir le dossier
    os.system(f'open "{out_dir}"')


def main():
    parser = argparse.ArgumentParser(description="Scan image → 3D → Animation")
    parser.add_argument("image", help="Chemin vers la photo source")
    parser.add_argument("--engine", choices=["triposr", "shape_e", "meshy", "replicate_triposr"],
                        default="triposr", help="Moteur 3D à utiliser")
    parser.add_argument("--animate", metavar="MOTION",
                        help="Animer avec AnimateDiff (ex: 'walking', 'dancing')")
    parser.add_argument("--video", action="store_true",
                        help="Générer une vidéo réaliste avec SVD")
    args = parser.parse_args()

    if not Path(args.image).exists():
        print(f"❌ Fichier introuvable: {args.image}")
        sys.exit(1)

    cfg = json.load(open(CONFIG_PATH))
    cfg["defaults"]["output_dir"] = str(Path(cfg["defaults"]["output_dir"]).expanduser())

    asyncio.run(run_pipeline(args.image, args.engine, args.animate, args.video, cfg))


if __name__ == "__main__":
    main()
