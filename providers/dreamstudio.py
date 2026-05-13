import aiohttp, base64

NAME = "dreamstudio"

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"]["dreamstudio"]
    if not key:
        return {"provider": NAME, "error": "Clé DreamStudio manquante"}

    engine = "stable-diffusion-xl-1024-v1-0" if quality == "best" else "stable-diffusion-v1-6"
    payload = {
        "text_prompts": [{"text": prompt, "weight": 1}],
        "cfg_scale": 7,
        "height": cfg["defaults"]["height"],
        "width": cfg["defaults"]["width"],
        "steps": cfg["defaults"]["steps"],
        "samples": 1,
    }
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json", "Accept": "application/json"}
    url = f"https://api.stability.ai/v1/generation/{engine}/text-to-image"

    async with aiohttp.ClientSession() as s:
        async with s.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as r:
            data = await r.json()
            if r.status != 200:
                return {"provider": NAME, "error": data.get("message", str(data))}
            b64 = data["artifacts"][0]["base64"]
            return {"provider": NAME, "b64": b64, "model": engine}
