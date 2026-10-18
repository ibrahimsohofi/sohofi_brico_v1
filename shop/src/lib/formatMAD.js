/**
 * Format a price in Moroccan Dirham.
 *   FR → "1 250,00 DH"
 *   AR → "1250,00 د.م." (Latin digits: what Moroccan shops actually print on labels)
 *
 * Pass { arabicDigits: true } to get Eastern Arabic numerals (١٢٥٠٫٠٠ د.م.).
 */
const cache = new Map();

function formatter(locale, decimals) {
  const key = `${locale}:${decimals}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: true,
      }),
    );
  }
  return cache.get(key);
}

export function formatNumber(value, lang = "fr", { decimals = 2, arabicDigits = false } = {}) {
  const n = Number.isFinite(Number(value)) ? Number(value) : 0;
  const locale = lang === "ar" ? (arabicDigits ? "ar-EG" : "ar-MA-u-nu-latn") : "fr-MA";
  // Normalise narrow no-break spaces so the output is stable across engines.
  return formatter(locale, decimals)
    .format(n)
    .replace(/\u202f|\u00a0/g, "\u00a0");
}

export function formatMAD(value, lang = "fr", options = {}) {
  const amount = formatNumber(value, lang, options);
  return lang === "ar" ? `${amount}\u00a0د.م.` : `${amount}\u00a0DH`;
}

/** Splits a price into parts for typographic rendering: { int, dec, currency }. */
export function priceParts(value, lang = "fr") {
  const full = formatNumber(value, lang);
  const sep = full.includes(",") ? "," : full.includes("٫") ? "٫" : ".";
  const idx = full.lastIndexOf(sep);
  return {
    int: idx >= 0 ? full.slice(0, idx) : full,
    dec: idx >= 0 ? full.slice(idx + 1) : "00",
    sep,
    currency: lang === "ar" ? "د.م." : "DH",
  };
}
