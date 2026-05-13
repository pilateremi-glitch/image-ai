import aiohttp, base64

NAME = "ideogram"

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"]["ideogram"]
    if not key:
        return {"provider": NAME, "error": "Clé Ideogram manquante"}

    model = "V_2" if quality == "best" else "V_1"
    payload = {
        "image_request": {
            "prompt": prompt,
            "model": model,
            "magic_prompt_option": "AUTO",
            "aspect_ratio": "ASPECT_1_1",
        }
    }
    headers = {"Api-Key": key, "Content-Type": "application/json"}

    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.ideogram.ai/generate",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as r:
            data = await r.json()
            if r.status != 200:
                return {"provider": NAME, "error": str(data)}
            url = data["data"][0]["url"]
            async with s.get(url) as img_r:
                raw = await img_r.read()
            return {"provider": NAME, "b64": base64.b64encode(raw).decode(), "model": model}
