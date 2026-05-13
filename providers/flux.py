import aiohttp, asyncio, base64

NAME = "flux"
MODELS = {
    "best": "black-forest-labs/flux-1.1-pro",
    "fast": "black-forest-labs/flux-schnell",
}

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"]["replicate"]
    if not key:
        return {"provider": NAME, "error": "Clé Replicate manquante"}

    model = MODELS.get(quality, MODELS["best"])
    payload = {"input": {"prompt": prompt, "width": cfg["defaults"]["width"], "height": cfg["defaults"]["height"]}}
    headers = {"Authorization": f"Token {key}", "Content-Type": "application/json"}

    async with aiohttp.ClientSession() as s:
        async with s.post(f"https://api.replicate.com/v1/models/{model}/predictions",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as r:
            data = await r.json()
            if r.status not in (200, 201):
                return {"provider": NAME, "error": str(data)}
            pred_id = data["id"]
            poll_url = data["urls"]["get"]

        for _ in range(60):
            await asyncio.sleep(3)
            async with s.get(poll_url, headers=headers) as r:
                data = await r.json()
                if data["status"] == "succeeded":
                    url = data["output"][0] if isinstance(data["output"], list) else data["output"]
                    async with s.get(url) as img_r:
                        raw = await img_r.read()
                    return {"provider": NAME, "b64": base64.b64encode(raw).decode(), "model": model}
                if data["status"] == "failed":
                    return {"provider": NAME, "error": data.get("error", "Failed")}

    return {"provider": NAME, "error": "Timeout FLUX"}
