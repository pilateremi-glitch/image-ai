import aiohttp, base64

NAME = "recraft"

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"]["recraft"]
    if not key:
        return {"provider": NAME, "error": "Clé Recraft manquante"}

    model = "recraftv3" if quality == "best" else "recraft20b"
    payload = {
        "prompt": prompt,
        "model": model,
        "size": f"{cfg['defaults']['width']}x{cfg['defaults']['height']}",
        "style": "realistic_image",
        "n": 1,
    }
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}

    async with aiohttp.ClientSession() as s:
        async with s.post("https://external.api.recraft.ai/v1/images/generations",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as r:
            data = await r.json()
            if r.status != 200:
                return {"provider": NAME, "error": str(data)}
            url = data["data"][0]["url"]
            async with s.get(url) as img_r:
                raw = await img_r.read()
            return {"provider": NAME, "b64": base64.b64encode(raw).decode(), "model": model}
