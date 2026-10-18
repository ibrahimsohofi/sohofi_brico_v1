import {
  Bolt,
  FlaskConical,
  Hammer,
  LockKeyhole,
  Package,
  PaintRoller,
  ShowerHead,
  Zap,
} from "lucide-react";

/**
 * Mirrors `products_manager.categories` (ids, FR/AR names, colours).
 * Visserie had no colour in the dump: stone-600 was chosen as a neutral "steel".
 * `aisle` is the shelf number shown on the storefront signage.
 */
export const CATEGORIES = [
  {
    id: 1,
    slug: "droguerie",
    aisle: "01",
    name_fr: "Droguerie",
    name_ar: "مواد كيميائية",
    description_fr: "Produits chimiques, adhésifs, mastics et composés spécialisés",
    description_ar: "المواد الكيميائية والمواد اللاصقة والمركبات المتخصصة",
    color: "#0f766e",
    Icon: FlaskConical,
  },
  {
    id: 2,
    slug: "sanitaire",
    aisle: "02",
    name_fr: "Sanitaire",
    name_ar: "صحي",
    description_fr: "Plomberie, tuyaux, robinets, chauffe-eau, accessoires de salle de bain",
    description_ar: "تجهيزات السباكة والأنابيب والحنفيات وسخانات المياه وإكسسوارات الحمام",
    color: "#3b82f6",
    Icon: ShowerHead,
  },
  {
    id: 3,
    slug: "peinture",
    aisle: "03",
    name_fr: "Peinture",
    name_ar: "دهان",
    description_fr: "Peintures, apprêts, pinceaux, rouleaux, accessoires et outils de peinture",
    description_ar: "الدهانات والبرايمر والفرش والأسطوانات وأدوات الطلاء",
    color: "#ea580c",
    Icon: PaintRoller,
  },
  {
    id: 4,
    slug: "quincaillerie",
    aisle: "04",
    name_fr: "Quincaillerie",
    name_ar: "أدوات معدنية",
    description_fr: "Fixations, charnières, serrures, poignées et composants métalliques",
    description_ar: "مثبتات الأجهزة والمسامير والصواميل والمفصلات والأقفال والمكونات المعدنية",
    color: "#f59e0b",
    Icon: LockKeyhole,
  },
  {
    id: 5,
    slug: "outillage",
    aisle: "05",
    name_fr: "Outillage",
    name_ar: "أدوات",
    description_fr: "Outils à main, outils électriques, mesure et équipements de sécurité",
    description_ar: "الأدوات اليدوية والكهربائية ومعدات القياس ومعدات السلامة وأدوات الورشة",
    color: "#dc2626",
    Icon: Hammer,
  },
  {
    id: 6,
    slug: "electricite",
    aisle: "06",
    name_fr: "Électricité",
    name_ar: "كهرباء",
    description_fr: "Câblage, interrupteurs, prises, disjoncteurs et éclairage",
    description_ar: "المكونات الكهربائية والأسلاك والمفاتيح والمقابس وتركيبات الإضاءة",
    color: "#eab308",
    Icon: Zap,
  },
  {
    id: 7,
    slug: "visserie-boulonnerie",
    aisle: "07",
    name_fr: "Visserie et boulonnerie",
    name_ar: "مسامير وصواميل",
    description_fr: "Vis, boulons, écrous et accessoires de fixation",
    description_ar: "البراغي والصواميل والمستلزمات الأخرى للتثبيت",
    color: "#57534e",
    Icon: Bolt,
  },
  {
    id: 8,
    slug: "autres",
    aisle: "08",
    name_fr: "Autres",
    name_ar: "أخرى",
    description_fr: "Tout le reste du magasin",
    description_ar: "باقي منتجات المتجر",
    color: "#0f766e",
    Icon: Package,
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export function categoryName(cat, lang) {
  if (!cat) return "";
  return (lang === "ar" ? cat.name_ar : cat.name_fr) || cat.name_fr;
}

export function categoryDescription(cat, lang) {
  if (!cat) return "";
  return (lang === "ar" ? cat.description_ar : cat.description_fr) || cat.description_fr;
}
