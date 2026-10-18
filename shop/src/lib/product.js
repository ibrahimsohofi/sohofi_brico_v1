/** Localised field with the roadmap fallback chain: name_ar → name_fr → name. */
export function productName(p, lang) {
  if (!p) return "";
  if (lang === "ar") return p.name_ar || p.name_fr || p.name;
  return p.name_fr || p.name;
}

/** Catalogue names are stored in SHOUTING CAPS: render them in a calmer title case. */
const KEEP_UPPER = /^(PVC|PPR|LED|HDF|MDF|STD|HDMI|USB|TV|N°|DN|PM|GM|MM|CM|ML|KG|XL|XXL|[A-Z]\d.*|\d.*)$/;
export function displayName(name) {
  if (!name) return "";
  if (name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .split(/(\s+|-|\/|\()/)
    .map((w) => {
      const up = w.toUpperCase();
      if (KEEP_UPPER.test(up)) return up;
      if (/^\d/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("")
    .replace(/\b(De|Du|Des|La|Le|Les|Et|Pour|Avec|Sans|En|Sur|A|À)\b/g, (m, _g, i) =>
      i === 0 ? m : m.toLowerCase(),
    );
}

/**
 * Stock status driven by remaining_stock vs min_stock_level (roadmap F2):
 *   in_stock  → "En stock"
 *   low_stock → "Stock limité"
 *   backorder → "Sur commande"
 */
export function stockStatus(p) {
  if (!p) return "backorder";
  if (p.stock_status) return p.stock_status;
  if (p.available_qty <= 0) return "backorder";
  if (p.available_qty <= Math.max(p.min_stock_level || 1, 2)) return "low_stock";
  return "in_stock";
}

/** Pulls the most "label-worthy" spec out of a product name: 5KG, 3/4", 250ml, 20x10, 10A… */
const SPEC_PATTERNS = [
  /\b(\d+(?:[.,]\d+)?)\s?(KG|G|L|ML|CL)\b/i,
  /\b(\d+(?:[.,]\d+)?)\s?(MM|CM|M)\b/i,
  /\b(\d+(?:[.,]\d+)?)\s?(A|W|V)\b/i,
  /\b(\d+\s?[*xX]\s?\d+(?:[.,]\d+)?(?:\s?[*xX]\s?\d+(?:[.,]\d+)?)?)\b/,
  /\b(\d\/\d|\d{1,2}\/\d{1,2})\b/,
  /\bN\s?°?\s?(\d+)\b/i,
];

export function extractSpec(name) {
  if (!name) return null;
  for (const rx of SPEC_PATTERNS) {
    const m = name.match(rx);
    if (m) {
      const raw = m[0].replace(/\s+/g, "").replace(/\*/g, "×").replace(/[xX](?=\d)/g, "×");
      if (/^\d\/\d|^\d{1,2}\/\d{1,2}$/.test(raw)) return `${raw}"`;
      return raw.toUpperCase().replace("ML", "ml").replace("CL", "cl");
    }
  }
  return null;
}

/** Deterministic 0..1 hash so placeholder visuals vary per product but never flicker. */
export function seeded(id, salt = 0) {
  let h = (Number(id) * 2654435761 + salt * 40503) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  return (h % 1000) / 1000;
}

export function productRef(p) {
  return p?.sku || `SB-${String(p?.id ?? 0).padStart(5, "0")}`;
}
