"""Shap-E (OpenAI open source) — texte ou image → mesh 3D local gratuit.
Prérequis: pip install git+https://github.com/openai/shap-e.git
"""
import asyncio
from pathlib import Path

NAME = "shape_e"

async def generate_3d_from_text(prompt: str, output_dir: str) -> dict:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    slug = prompt[:30].replace(" ", "_")
    ply_path = out / f"{slug}_shape_e.ply"

    script = f"""
import sys, torch
try:
    from shap_e.diffusion.sample import sample_latents
    from shap_e.diffusion.gaussian_diffusion import diffusion_from_config
    from shap_e.models.download import load_model, load_config
    from shap_e.util.notebooks import decode_latent_mesh
except ImportError:
    print("ERROR:Shap-E non installé. Lance: pip install git+https://github.com/openai/shap-e.git")
    sys.exit(1)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
xm = load_model("transmitter", device=device)
model = load_model("text300M", device=device)
diffusion = diffusion_from_config(load_config("diffusion"))

batch_size = 1
guidance_scale = 15.0
latents = sample_latents(
    batch_size=batch_size, model=model, diffusion=diffusion,
    guidance_scale=guidance_scale, model_kwargs=dict(texts=["{prompt}"] * batch_size),
    progress=True, clip_denoised=True, use_karras=True,
    karras_steps=64, sigma_min=1e-3, sigma_max=160, s_churn=0,
)
mesh = decode_latent_mesh(xm, latents[0]).tri_mesh()
with open("{ply_path}", "wb") as f:
    mesh.write_ply(f)
print("OK:{ply_path}")
"""
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c", script,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=300)
    out_txt = stdout.decode().strip()

    if "OK:" in out_txt and ply_path.exists():
        return {"provider": NAME, "mesh_path": str(ply_path), "format": "ply"}
    return {"provider": NAME, "error": stderr.decode()[-500:] or "Shap-E failed"}


async def generate_3d_from_image(image_path: str, output_dir: str) -> dict:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    stem = Path(image_path).stem
    ply_path = out / f"{stem}_shape_e.ply"

    script = f"""
import sys, torch
from PIL import Image
try:
    from shap_e.diffusion.sample import sample_latents
    from shap_e.diffusion.gaussian_diffusion import diffusion_from_config
    from shap_e.models.download import load_model, load_config
    from shap_e.util.image_util import load_image
    from shap_e.util.notebooks import decode_latent_mesh
except ImportError:
    print("ERROR:Shap-E non installé.")
    sys.exit(1)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
xm = load_model("transmitter", device=device)
model = load_model("image300M", device=device)
diffusion = diffusion_from_config(load_config("diffusion"))

image = load_image("{image_path}")
latents = sample_latents(
    batch_size=1, model=model, diffusion=diffusion,
    guidance_scale=3.0, model_kwargs=dict(images=[image]),
    progress=True, clip_denoised=True, use_karras=True,
    karras_steps=64, sigma_min=1e-3, sigma_max=160, s_churn=0,
)
mesh = decode_latent_mesh(xm, latents[0]).tri_mesh()
with open("{ply_path}", "wb") as f:
    mesh.write_ply(f)
print("OK:{ply_path}")
"""
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c", script,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=300)
    out_txt = stdout.decode().strip()

    if "OK:" in out_txt and ply_path.exists():
        return {"provider": NAME, "mesh_path": str(ply_path), "format": "ply"}
    return {"provider": NAME, "error": stderr.decode()[-500:] or "Shap-E failed"}
