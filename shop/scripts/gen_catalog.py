"""
Generate shop/public/mock/catalog.json from databases/products_manager.sql.

This is a stand-in for the Phase B2 catalogue API until shop_api + MySQL are wired.
It applies the roadmap's publish rules (active, real price) and normalises brands
from product names, mirroring scripts planned for Phase B1.
purchase_price is NEVER exported.

Usage:  python3 shop/scripts/gen_catalog.py
"""

import collections
import json
import os
import re
import unicodedata

from parse_dump import load_products, parse_values

HERE = os.path.dirname(os.path.abspath(__file__))
DUMP = os.path.join(HERE, "..", "..", "databases", "products_manager.sql")
OUT = os.path.join(HERE, "..", "public", "mock", "catalog.json")

BRANDS = [
    "INGELEC", "ATLAS", "CLEMED", "LAP", "SPAX", "GALAXY", "TIEMME", "DINGQI", "PARKER",
    "MUSIK", "MAESTRO", "TUMAG", "INGCO", "COPRAX", "ASBO", "JIMTEN", "BORRAS", "VALTEMO",
    "HIND", "KAPCI", "LEADER", "VACHETTE", "COESTHERM", "CLEDOR", "IDOPLAST", "ZENTEK",
    "SOLARIS", "TICHKA", "IBERGRIF", "KORTAS", "FERROPLAST", "ITIMAT", "BARDAHL", "BELLOTA",
    "SINTOFER", "MTH", "ROCA", "BOSCH", "KRIT", "FACOP", "MUTLUSAN", "VALERA", "TOUPRET",
    "FAYROUZ", "HILAC", "DORLOCK", "LA GALIOTE", "ISOGRIS",
]
BRAND_RE = [(b, re.compile(r"(?<![A-Z])" + re.escape(b) + r"(?![A-Z])")) for b in BRANDS]


def slugify(text):
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t or "produit"


def brand_of(name):
    up = name.upper()
    for b, rx in BRAND_RE:
        if rx.search(up):
            return b.title() if len(b) > 4 else b
    return None


def load_sales(path):
    txt = open(path, encoding="utf-8").read()
    sold = collections.Counter()
    marker = "INSERT INTO `sales` ("
    pos = 0
    while True:
        k = txt.find(marker, pos)
        if k < 0:
            break
        ce = txt.index(")", k + len(marker))
        cols = [c.strip(" `") for c in txt[k + len(marker) : ce].split(",")]
        vi = txt.index("VALUES", ce) + len("VALUES")
        for r in parse_values(txt, vi):
            row = dict(zip(cols, r))
            try:
                sold[row["productName"].strip().upper()] += int(row["quantity"])
            except (TypeError, ValueError):
                pass
        pos = txt.index(";\n", vi)
    return sold


def main():
    rows = load_products(DUMP)
    sold = load_sales(DUMP)
    seen = collections.Counter()
    out = []
    for r in rows:
        price = float(r["selling_price"] or 0)
        stock = int(r["remaining_stock"] or 0)
        if r["is_active"] != "1" or price < 5:
            continue
        # Keep every in-stock product plus a slice of out-of-stock ones ("Sur commande")
        if stock <= 0 and int(r["id"]) % 6 != 0:
            continue
        name = re.sub(r"\s+", " ", r["name"]).strip()
        base = slugify(name)
        seen[base] += 1
        slug = base if seen[base] == 1 else f"{base}-{seen[base]}"
        out.append(
            {
                "id": int(r["id"]),
                "slug": slug,
                "name": name,
                "name_ar": r["name_ar"] or None,
                "cat": int(r["category_id"] or 8),
                "price": round(price, 2),
                "stock": max(stock, 0),
                "min": int(r["min_stock_level"] or 1),
                "unit": r["unit"] or "piece",
                "brand": brand_of(name),
                "created": (r["created_at"] or "")[:10],
                "updated": (r["updated_at"] or "")[:10],
                "sold": sold.get(name.upper(), 0),
            }
        )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    by_cat = collections.Counter(p["cat"] for p in out)
    print(f"wrote {len(out)} products -> {OUT}")
    print("by category:", dict(sorted(by_cat.items())))
    print("with brand:", sum(1 for p in out if p["brand"]), " with sales:", sum(1 for p in out if p["sold"]))


if __name__ == "__main__":
    main()
