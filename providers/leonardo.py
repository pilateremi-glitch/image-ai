import aiohttp, asyncio, base64

NAME = "leonardo"
MODELS = {
    "best": "aa77f04e-3eec-4034-9c07-d0f619684628",   # Leonardo Kino XL
    "fast": "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",   # Leonardo Diffusion XL
}

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    key = cfg["keys"]["leonardo"]
    if not key:
        return {"provider": NAME, "error": "Clé Leonardo manquante"}

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {
        "prompt": prompt,
        "modelId": MODELS.get(quality, MODELS["best"]),
        "width": cfg["defaults"]["width"],
        "height": cfg["defaults"]["height"],
        "num_images": 1,
        "guidance_scale": 7,
    }

    async with aiohttp.ClientSession() as s:
        async with s.post("https://cloud.leonardo.ai/api/rest/v1/generations",
                          json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as r:
            data = await r.json()
            if r.status != 200:
                return {"provider": NAME, "error": str(data)}
            gen_id = data["sdGenerationJob"]["generationId"]

        # Poll until done
        for _ in range(30):
            await asyncio.sleep(4)
            async with s.get(f"https://cloud.leonardo.ai/api/rest/v1/generations/{gen_id}",
                             headers=headers) as r:
                data = await r.json()
                imgs = data.get("generations_by_pk", {}).get("generated_images", [])
                if imgs:
                    url = imgs[0]["url"]
                    async with s.get(url) as img_r:
                        raw = await img_r.read()
                    return {"provider": NAME, "b64": base64.b64encode(raw).decode(), "model": MODELS[quality]}

    return {"provider": NAME, "error": "Timeout Leonardo"}
