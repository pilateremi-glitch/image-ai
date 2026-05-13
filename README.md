# image-ai

Génération d'images multi-providers en parallèle, comparaison photo et pipeline photo→3D.

## Fonctionnalités

- **`imagine.py`** — Lance plusieurs providers IA en parallèle et sauvegarde les résultats
- **`compare.py`** — Compare une image IA avec une photo réelle (SSIM, PSNR, couleur, hash perceptuel)
- **`scan3d.py`** — Pipeline photo → mesh 3D → animation (TripoSR local ou Meshy API)

## Providers supportés

| Provider | Gratuit | Clé requise |
|---|---|---|
| Pollinations | ✅ | Non |
| HuggingFace | ✅ | Optionnelle |
| Prodia | ✅ | Optionnelle |
| DALL-E | ❌ | OpenAI |
| DreamStudio | ❌ | Stability AI |
| Leonardo | ❌ | Leonardo AI |
| Ideogram | ❌ | Ideogram |
| Recraft | ❌ | Recraft |
| Clipdrop | ❌ | Clipdrop |
| getimg | ❌ | getimg.ai |
| FLUX | ❌ | Replicate |

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

Éditez `config.json` et ajoutez vos clés API :

```json
{
  "keys": {
    "openai": "sk-...",
    "dreamstudio": "...",
    ...
  }
}
```

## Usage

```bash
# Générer une image avec tous les providers actifs
python imagine.py "a futuristic city at sunset"

# Choisir des providers spécifiques
python imagine.py "portrait photo" --providers dalle flux

# Lister les providers configurés
python imagine.py --list

# Comparer une image IA avec une photo réelle
python compare.py image_ia.png photo_reelle.jpg

# Générer un modèle 3D depuis une photo
python scan3d.py photo.jpg --engine triposr
python scan3d.py photo.jpg --engine meshy
```

## Structure

```
image-ai/
├── imagine.py        # Génération multi-providers
├── compare.py        # Comparaison image IA vs réelle
├── scan3d.py         # Pipeline photo → 3D
├── config.json       # Clés API et paramètres
├── requirements.txt  # Dépendances Python
└── providers/        # Modules par provider
```
