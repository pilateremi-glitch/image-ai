"""Pollinations.ai — 100% gratuit, aucune clé API requise."""
import aiohttp, base64, urllib.parse

NAME = "pollinations"
MODELS = {
    "best": "flux",
    "fast": "flux",
    "photo": "flux-realism",
    "anime": "niji-journey",
}

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    model = MODELS.get(quality, MODELS["best"])
    w = cfg["defaults"]["width"]
    h = cfg["defaults"]["height"]
    encoded = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded}?model={model}&width={w}&height={h}&nologo=true&enhance=true"

    async with aiohttp.ClientSession() as s:
        async with s.get(url, timeout=aiohttp.ClientTimeout(total=120)) as r:
            if r.status != 200:
                return {"provider": NAME, "error": f"HTTP {r.status}"}
            raw = await r.read()
            return {"provider": NAME, "b64": base64.b64encode(raw).decode(), "model": model}
