"""AnimateDiff — Image ou texte → vidéo animée via Replicate (gratuit avec clé Replicate)."""
import aiohttp, asyncio, base64
from pathlib import Path

NAME = "animatediff"
MODEL = "lucataco/animate-diff:beecf59c4c4f4491e5af15d7a6fef64e3c0dfa27ddc8dd5eff1be1d5ebb82f36"

async def image_to_animation(image_path: str, prompt: str, output_dir: str, cfg: dict,
                              num_frames: int = 16, fps: int = 8) -> dict:
    key = cfg["keys"].get("replicate", "")
    if not key:
        return {"provider": NAME, "error": "Clé Replicate manquante"}

    with open(image_path, "rb") as f:
        img_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode()

    headers = {"Authorization": f"Token {key}", "Content-Type": "application/json"}
    payload = {
        "version": MODEL.split(":")[1],
        "input": {
            "image": img_b64,
            "prompt": prompt,
            "num_frames": num_frames,
            "fps": fps,
            "motion_bucket_id": 127,
        }
    }
    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.replicate.com/v1/predictions",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as r:
            data = await r.json()
            if r.status not in (200, 201):
                return {"provider": NAME, "error": str(data)}
            poll_url = data["urls"]["get"]

        for _ in range(60):
            await asyncio.sleep(5)
            async with s.get(poll_url, headers=headers) as r:
                data = await r.json()
                if data["status"] == "succeeded":
                    vid_url = data["output"]
                    async with s.get(vid_url) as vr:
                        raw = await vr.read()
                    out = Path(output_dir)
                    out.mkdir(parents=True, exist_ok=True)
                    out_path = out / f"{Path(image_path).stem}_animatediff.mp4"
                    out_path.write_bytes(raw)
                    return {"provider": NAME, "video_path": str(out_path), "frames": num_frames, "fps": fps}
                if data["status"] == "failed":
                    return {"provider": NAME, "error": data.get("error", "Failed")}

    return {"provider": NAME, "error": "Timeout AnimateDiff"}


async def text_to_animation(prompt: str, output_dir: str, cfg: dict, num_frames: int = 16) -> dict:
    key = cfg["keys"].get("replicate", "")
    if not key:
        return {"provider": NAME, "error": "Clé Replicate manquante"}

    MODEL_TEXT = "lucataco/animate-diff:beecf59c4c4f4491e5af15d7a6fef64e3c0dfa27ddc8dd5eff1be1d5ebb82f36"
    headers = {"Authorization": f"Token {key}", "Content-Type": "application/json"}
    payload = {"version": MODEL_TEXT.split(":")[1], "input": {"prompt": prompt, "num_frames": num_frames}}

    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.replicate.com/v1/predictions",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as r:
            data = await r.json()
            if r.status not in (200, 201):
                return {"provider": NAME, "error": str(data)}
            poll_url = data["urls"]["get"]

        for _ in range(60):
            await asyncio.sleep(5)
            async with s.get(poll_url, headers=headers) as r:
                data = await r.json()
                if data["status"] == "succeeded":
                    vid_url = data["output"]
                    async with s.get(vid_url) as vr:
                        raw = await vr.read()
                    out = Path(output_dir)
                    out.mkdir(parents=True, exist_ok=True)
                    slug = prompt[:30].replace(" ", "_")
                    out_path = out / f"{slug}_animatediff.mp4"
                    out_path.write_bytes(raw)
                    return {"provider": NAME, "video_path": str(out_path)}
                if data["status"] == "failed":
                    return {"provider": NAME, "error": data.get("error", "Failed")}

    return {"provider": NAME, "error": "Timeout"}
