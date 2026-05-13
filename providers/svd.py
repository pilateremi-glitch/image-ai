"""Stable Video Diffusion (SVD-XT) — Image → vidéo réaliste via Replicate."""
import aiohttp, asyncio, base64
from pathlib import Path

NAME = "svd"
MODEL = "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438"

async def image_to_video(image_path: str, output_dir: str, cfg: dict,
                          num_frames: int = 25, fps: int = 6, motion_strength: int = 127) -> dict:
    key = cfg["keys"].get("replicate", "")
    if not key:
        return {"provider": NAME, "error": "Clé Replicate manquante"}

    with open(image_path, "rb") as f:
        img_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode()

    headers = {"Authorization": f"Token {key}", "Content-Type": "application/json"}
    payload = {
        "version": MODEL.split(":")[1],
        "input": {
            "input_image": img_b64,
            "num_frames": num_frames,
            "fps_id": fps,
            "motion_bucket_id": motion_strength,
            "cond_aug": 0.02,
            "decoding_t": 7,
        }
    }
    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.replicate.com/v1/predictions",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as r:
            data = await r.json()
            if r.status not in (200, 201):
                return {"provider": NAME, "error": str(data)}
            poll_url = data["urls"]["get"]

        for _ in range(80):
            await asyncio.sleep(5)
            async with s.get(poll_url, headers=headers) as r:
                data = await r.json()
                if data["status"] == "succeeded":
                    vid_url = data["output"]
                    async with s.get(vid_url) as vr:
                        raw = await vr.read()
                    out = Path(output_dir)
                    out.mkdir(parents=True, exist_ok=True)
                    out_path = out / f"{Path(image_path).stem}_svd.mp4"
                    out_path.write_bytes(raw)
                    return {"provider": NAME, "video_path": str(out_path),
                            "frames": num_frames, "fps": fps}
                if data["status"] == "failed":
                    return {"provider": NAME, "error": data.get("error", "SVD failed")}

    return {"provider": NAME, "error": "Timeout SVD"}
