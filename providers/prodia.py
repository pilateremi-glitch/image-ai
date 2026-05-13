"""Prodia — API gratuite, clé optionnelle."""
import aiohttp, asyncio, base64

NAME = "prodia"
MODELS = {
    "best": "sdxl",
    "fast": "sd15",
    "anime": "anythingV5_PrtRE.safetensors [893e49b9]",
}

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"].get("prodia", "")
    headers = {"Content-Type": "application/json", "accept": "application/json"}
    if key:
        headers["X-Prodia-Key"] = key

    model = MODELS.get(quality, MODELS["best"])
    payload = {"prompt": prompt, "model": model, "width": cfg["defaults"]["width"], "height": cfg["defaults"]["height"]}

    async with aiohttp.ClientSession() as s:
        async with s.get("https://api.prodia.com/v1/job",
                         json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as r:
            if r.status != 200:
                return {"provider": NAME, "error": f"HTTP {r.status}"}
            data = await r.json()
            job_id = data.get("job")
            if not job_id:
                return {"provider": NAME, "error": str(data)}

        for _ in range(40):
            await asyncio.sleep(3)
            async with s.get(f"https://api.prodia.com/v1/job/{job_id}", headers=headers) as r:
                data = await r.json()
                if data.get("status") == "succeeded":
                    img_url = data["imageUrl"]
                    async with s.get(img_url) as img_r:
                        raw = await img_r.read()
                    return {"provider": NAME, "b64": base64.b64encode(raw).decode(), "model": model}
                if data.get("status") == "failed":
                    return {"provider": NAME, "error": "Job failed"}

    return {"provider": NAME, "error": "Timeout Prodia"}
