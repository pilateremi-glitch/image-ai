"""Détoure le personnage d'une illustration pour en faire le lanceur de roue (assets/spinner.webp).

Usage :
    pip install onnxruntime numpy pillow
    curl -L -o isnet-anime.onnx https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-anime.onnx
    python3 tools/make_spinner.py assets/theme.webp isnet-anime.onnx assets/spinner.webp
"""
import sys, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter
src, model, out = sys.argv[1:4]
img = Image.open(src).convert('RGB')
x = np.asarray(img.resize((1024, 1024), Image.LANCZOS)).astype(np.float32) / 255.0
x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / 1.0
x = x.transpose(2, 0, 1)[None]
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
pred = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
mask = Image.fromarray((pred * 255).astype(np.uint8)).resize(img.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.8))
rgba = img.copy(); rgba.putalpha(mask)
bbox = mask.point(lambda v: 255 if v > 40 else 0).getbbox()
rgba = rgba.crop(bbox)
rgba.thumbnail((720, 720), Image.LANCZOS)
rgba.save(out, 'WEBP', quality=88, method=6)
print(bbox, rgba.size)
