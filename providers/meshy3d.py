"""Meshy AI — Image/Text → 3D mesh + 500+ animations. API payante (clé requise)."""
import aiohttp, asyncio, base64
from pathlib import Path

NAME = "meshy"

async def image_to_3d(image_path: str, output_dir: str, cfg: dict) -> dict:
    key = cfg["keys"].get("meshy", "")
    if not key:
        return {"provider": NAME, "error": "Clé Meshy manquante (meshy.ai → API)"}

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()
    ext = Path(image_path).suffix.lstrip(".")
    data_url = f"data:image/{ext};base64,{img_b64}"

    payload = {"image_url": data_url, "enable_pbr": True, "should_remesh": True}
    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.meshy.ai/openapi/v1/image-to-3d",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as r:
            data = await r.json()
            if r.status not in (200, 201):
                return {"provider": NAME, "error": str(data)}
            task_id = data["result"]

        for _ in range(120):
            await asyncio.sleep(5)
            async with s.get(f"https://api.meshy.ai/openapi/v1/image-to-3d/{task_id}",
                             headers=headers) as r:
                data = await r.json()
                status = data.get("status")
                if status == "SUCCEEDED":
                    model_url = data["model_urls"].get("glb") or data["model_urls"].get("obj")
                    async with s.get(model_url) as dl:
                        raw = await dl.read()
                    out = Path(output_dir)
                    out.mkdir(parents=True, exist_ok=True)
                    ext = "glb" if "glb" in model_url else "obj"
                    out_path = out / f"{Path(image_path).stem}_meshy.{ext}"
                    out_path.write_bytes(raw)
                    return {"provider": NAME, "mesh_path": str(out_path), "format": ext,
                            "thumbnail": data.get("thumbnail_url", "")}
                if status == "FAILED":
                    return {"provider": NAME, "error": data.get("task_error", {}).get("message", "Failed")}

    return {"provider": NAME, "error": "Timeout Meshy"}


async def animate_3d(model_url: str, animation: str, cfg: dict) -> dict:
    """Applique une animation depuis la librairie Meshy (500+ motions)."""
    key = cfg["keys"].get("meshy", "")
    if not key:
        return {"provider": NAME, "error": "Clé Meshy manquante"}

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"model_url": model_url, "motion": animation}

    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.meshy.ai/openapi/v1/animations",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as r:
            data = await r.json()
            if r.status not in (200, 201):
                return {"provider": NAME, "error": str(data)}
            return {"provider": NAME, "animation_url": data.get("result", {}).get("url", ""), "motion": animation}
