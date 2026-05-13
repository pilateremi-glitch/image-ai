import aiohttp, base64

NAME = "clipdrop"

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"]["clipdrop"]
    if not key:
        return {"provider": NAME, "error": "Clé Clipdrop manquante"}

    data = aiohttp.FormData()
    data.add_field("prompt", prompt)
    headers = {"x-api-key": key}

    async with aiohttp.ClientSession() as s:
        async with s.post("https://clipdrop-api.co/text-to-image/v1",
                          data=data, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as r:
            if r.status != 200:
                txt = await r.text()
                return {"provider": NAME, "error": txt}
            raw = await r.read()
            return {"provider": NAME, "b64": base64.b64encode(raw).decode(), "model": "clipdrop-v1"}
