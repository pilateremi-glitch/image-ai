#!/usr/bin/env python3
"""Construit data/seed-cards.js à partir d'un clone local de Punk Records.

Usage :
    git clone --depth 1 https://github.com/buhbbl/punk-records.git
    python3 tools/build_seed.py /chemin/vers/punk-records [english japanese ...]

La logique de conversion est la même que celle de js/sync.js (adaptateur
« Punk Records ») afin que la base initiale et les synchronisations
produisent exactement les mêmes identifiants.
"""
import glob
import html
import json
import os
import re
import sys
import time

LANGS = {"english": "en", "japanese": "jp", "french": "fr", "english-asia": "en-asia",
         "chinese-hongkong": "zh-hk", "chinese-taiwan": "zh-tw", "thai": "th"}
TYPES = {"Leader": "Leader", "Character": "Character", "Event": "Event", "Stage": "Stage", "Don": "DON!!"}
RARITIES = {"Common": "C", "Uncommon": "UC", "Rare": "R", "SuperRare": "SR", "SecretRare": "SEC",
            "Leader": "L", "Special": "SP", "TreasureRare": "TR", "Promo": "P"}


def pack_code(pack_id, label):
    """Code produit lisible à partir de l'identifiant numérique du site officiel."""
    if label:
        return label
    tail = pack_id[-3:]
    family = pack_id[-3]
    n = int(pack_id[-2:])
    return {"0": f"ST-{n:02d}", "1": f"OP-{n:02d}", "2": f"EB-{n:02d}", "3": f"PRB-{n:02d}",
            "8": "OTHER", "9": "PROMO"}.get(family, f"PACK-{tail}")


def product_for(product, set_code):
    """Les pages combinées du site (ex. « OP14-EB04 ») sont ramenées à l'extension d'origine de la carte
    quand elle en fait partie ; sinon on garde le libellé combiné (carte rééditée dans ce produit)."""
    m = re.fullmatch(r"([A-Z]+)(\d+)-([A-Z]+)(\d+)", product)
    if m:
        parts = {f"{m.group(1)}-{m.group(2)}", f"{m.group(3)}-{m.group(4)}"}
        if set_code in parts:
            return set_code
    return product


def origin_set(card_id):
    m = re.match(r"^(OP|ST|EB|PRB)(\d+)-(\d+)", card_id)
    if m:
        return f"{m.group(1)}-{m.group(2)}", m.group(3)
    m = re.match(r"^P-(\d+)", card_id)
    if m:
        return "PROMO", m.group(1)
    return "OTHER", ""


def variant_of(print_id):
    m = re.search(r"_(p|r)(\d+)$", print_id)
    if not m:
        return "Normale"
    return f"Parallèle / Alt-art {m.group(2)}" if m.group(1) == "p" else f"Réimpression {m.group(2)}"


def main():
    root = sys.argv[1]
    folders = sys.argv[2:] or ["english", "japanese"]
    # Noms des extensions : on prend l'anglais comme référence pour toutes les langues
    set_names = {"PROMO": "Promotion card", "OTHER": "Other Product Card"}
    en_packs = json.load(open(os.path.join(root, "english", "packs.json"), encoding="utf-8"))
    for p in en_packs.values():
        lab = p["title_parts"].get("label") or ""
        title = html.unescape(p["title_parts"].get("title") or "")
        if re.fullmatch(r"(OP|ST|EB|PRB)-\d+", lab) and title:
            set_names[lab] = title
    out = {}
    for folder in folders:
        lang = LANGS[folder]
        packs = {}
        try:
            for pid, p in json.load(open(os.path.join(root, folder, "packs.json"), encoding="utf-8")).items():
                packs[pid] = pack_code(pid, p["title_parts"].get("label"))
        except (OSError, ValueError):
            pass
        for f in sorted(glob.glob(os.path.join(root, folder, "data", "*.json"))):
            pid = os.path.splitext(os.path.basename(f))[0]
            pack_product = packs.get(pid) or pack_code(pid, None)
            for c in json.load(open(f, encoding="utf-8")):
                print_id = c["id"]
                card_id = re.sub(r"_[a-z]+\d*$", "", print_id)
                sc, num = origin_set(card_id)
                uid = f"{lang}:{print_id}"
                product = product_for(pack_product, sc)
                if uid in out:
                    if product not in out[uid]["products"]:
                        out[uid]["products"].append(product)
                    continue
                card = {
                    "uid": uid, "card_id": card_id, "print_id": print_id,
                    "name": html.unescape(c.get("name") or ""),
                    "set_code": sc, "set_name": set_names.get(sc, sc), "number": num,
                    "rarity": RARITIES.get(c.get("rarity"), c.get("rarity") or ""),
                    "type": TYPES.get(c.get("category"), c.get("category") or ""),
                    "colors": c.get("colors") or [],
                    "affiliation": [html.unescape(t) for t in (c.get("types") or [])],
                    "variant": variant_of(print_id),
                    "image_url": c.get("img_full_url") or "",
                    "release_date": "", "status": "published", "language": lang,
                    "products": [product],
                    "cost": c.get("cost"), "power": c.get("power"), "counter": c.get("counter"),
                    "source": "punk-records",
                }
                out[uid] = {k: v for k, v in card.items() if v is not None}
    cards = sorted(out.values(), key=lambda c: (c["language"], c["print_id"]))
    payload = {"generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": "Punk Records (github.com/buhbbl/punk-records)", "cards": cards}
    dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "seed-cards.js")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write("window.OPTCG_SEED=")
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))
        fh.write(";\n")
    print(f"{len(cards)} cartes écrites dans {os.path.normpath(dest)}")


if __name__ == "__main__":
    main()
