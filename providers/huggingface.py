"""HuggingFace Inference API — tier gratuit (clé optionnelle pour +de quotas)."""
import aiohttp, base64

NAME = "huggingface"
MODELS = {
    "best": "stabilityai/stable-diffusion-xl-base-1.0",
    "fast": "runwayml/stable-diffusion-v1-5",
    "anime": "hakurei/waifu-diffusion",
}

async def generate(prompt: str, cfg: dict, quality: str = "best") -> dict:
    model = MODELS.get(quality, MODELS["best"])
    headers = {"Content-Type": "application/json"}
    key = cfg["keys"].get("huggingface", "")
    if key:
        headers["Authorization"] = f"Bearer {key}"

    payload = {
        "inputs": prompt,
        "parameters": {
            "width": cfg["defaults"]["width"],
            "height": cfg["defaults"]["height"],
            "num_inference_steps": cfg["defaults"]["steps"],
        }
    }
    url = f"https://api-inference.huggingface.co/models/{model}"

    async with aiohttp.ClientSession() as s:
        async with s.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=120)) as r:
            if r.status != 200:
                txt = await r.text()
                return {"provider": NAME, "error": f"HTTP {r.status}: {txt[:200]}"}
            raw = await r.read()
            return {"provider": NAME, "b64": base64.b64encode(raw).decode(), "model": model}
