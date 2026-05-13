import aiohttp, base64, os

NAME = "dalle"
MODELS = {"fast": "dall-e-2", "best": "dall-e-3"}

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"]["openai"]
    if not key:
        return {"provider": NAME, "error": "Clé OpenAI manquante"}

    model = MODELS.get(quality, MODELS["best"])
    payload = {
        "model": model,
        "prompt": prompt,
        "n": 1,
        "size": f"{cfg['defaults']['width']}x{cfg['defaults']['height']}",
        "response_format": "b64_json",
    }
    if model == "dall-e-3":
        payload["quality"] = "hd"

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    async with aiohttp.ClientSession() as s:
        async with s.post("https://api.openai.com/v1/images/generations",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as r:
            data = await r.json()
            if r.status != 200:
                return {"provider": NAME, "error": data.get("error", {}).get("message", str(data))}
            b64 = data["data"][0]["b64_json"]
            return {"provider": NAME, "b64": b64, "model": model}
