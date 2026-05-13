import aiohttp, base64

NAME = "getimg"

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"]["getimg"]
    if not key:
        return {"provider": NAME, "error": "Clé getimg.ai manquante"}

    model = "stable-diffusion-xl-base-1.0" if quality == "best" else "stable-diffusion-v1-5"
    payload = {
        "model": model,
        "prompt": prompt,
        "width": cfg["defaults"]["width"],
        "height": cfg["defaults"]["height"],
        "steps": cfg["defaults"]["steps"],
        "output_format": "jpeg",
    }
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}

    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.getimg.ai/v1/stable-diffusion-xl/text-to-image",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as r:
            data = await r.json()
            if r.status != 200:
                return {"provider": NAME, "error": str(data)}
            return {"provider": NAME, "b64": data["image"], "model": model}
