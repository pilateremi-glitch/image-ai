"""TripoSR — open source local (Stability AI + Tripo). Image → mesh 3D en 0.5s.
Prérequis: pip install tsr torch torchvision Pillow trimesh
"""
import asyncio, base64, os
from pathlib import Path

NAME = "triposr"

async def generate_3d(image_path: str, output_dir: str) -> dict:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    stem = Path(image_path).stem
    obj_path = out / f"{stem}_triposr.obj"

    # Lancer TripoSR en subprocess pour ne pas bloquer asyncio
    script = f"""
import sys, torch
from PIL import Image
try:
    from tsr.system import TSR
    from tsr.utils import remove_background, resize_foreground
except ImportError:
    print("ERROR:TripoSR non installé. Lance: pip install git+https://github.com/VAST-AI-Research/TripoSR.git")
    sys.exit(1)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = TSR.from_pretrained("stabilityai/TripoSR", config_name="config.yaml", weight_name="model.ckpt")
model.renderer.set_chunk_size(8192)
model.to(device)

img = Image.open("{image_path}").convert("RGBA")
img = remove_background(img)
img = resize_foreground(img, 0.85)

with torch.no_grad():
    scene_codes = model([img], device=device)

exporter = model.set_marching_cubes_resolution(256)
meshes = model.extract_mesh(scene_codes, True, resolution=256)
meshes[0].export("{obj_path}")
print("OK:{obj_path}")
"""
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c", script,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)
    out_txt = stdout.decode().strip()

    if "OK:" in out_txt and obj_path.exists():
        return {"provider": NAME, "mesh_path": str(obj_path), "format": "obj"}
    err = stderr.decode()[-500:] if stderr else out_txt
    return {"provider": NAME, "error": err or "TripoSR failed"}


async def install_check() -> bool:
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c", "from tsr.system import TSR; print('ok')",
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    out, _ = await proc.communicate()
    return b"ok" in out
