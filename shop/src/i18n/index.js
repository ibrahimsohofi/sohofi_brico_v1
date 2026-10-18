import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import ar from "./ar.json";
import fr from "./fr.json";

export const LANGS = ["fr", "ar"];
export const STORAGE_KEY = "sb-lang";

/** Keeps <html lang dir> in sync. The pre-paint script in index.html does the first pass. */
export function applyDocumentLang(lang) {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { fr: { translation: fr }, ar: { translation: ar } },
    fallbackLng: "fr",
    supportedLngs: LANGS,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      // French is the default: only an explicit choice (or ?lang=ar) switches to Arabic.
      order: ["querystring", "localStorage", "htmlTag"],
      lookupQuerystring: "lang",
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    returnNull: false,
  });

applyDocumentLang(i18n.resolvedLanguage || "fr");
i18n.on("languageChanged", (lng) => {
  const lang = LANGS.includes(lng) ? lng : "fr";
  applyDocumentLang(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode */
  }
});

export default i18n;
