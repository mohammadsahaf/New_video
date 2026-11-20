// V06 · the Near East around 600 AD: a dark parchment map with the two empires, rivers, cities, animated routes,
// battles and dates. Every scene is data (SCENES below); progress p (0–1) through the scene drives what appears.
import React from "react";
import { Img, staticFile } from "remotion";
import landRaw from "../lib/geo/land.json";
import { FONT_NUM, FONT_TEXT } from "../fonts";

export type LL = [number, number]; // [lon, lat]
const W = 1920, H = 1080;
const LAT0 = 34, K = 26; // px per degree at zoom 1
const KX = K * Math.cos((LAT0 * Math.PI) / 180);
const P = ([lon, lat]: LL): [number, number] => [lon * KX, -lat * K];

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const io = (x: number) => { const c = clamp(x); return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const FA = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);

// colours: one family (charcoal, parchment, gold) + the two empires
const SEA = "#0b0e10", LAND_EDGE = "#6b5a3e", GOLD = "#d8b25a", INK = "#efe3c4";
const ROME = "#7d4fb0", PERSIA = "#a3262a", ARAB = "#c9a24a";

const pathOf = (pts: LL[], close = false) => pts.map((p, i) => { const [x, y] = P(p); return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join("") + (close ? "Z" : "");

const land = landRaw as { coordinates: number[][][][] };
const LAND_PATH = land.coordinates
  .map((poly) => poly
    .filter((ring) => ring.some((p) => p[0] > -15 && p[0] < 95 && p[1] > -5 && p[1] < 65))
    .map((ring) => pathOf(ring as unknown as LL[], true)).join(""))
  .join("");

// ── regions (rough, clipped to land) ──
const ROM600: LL[] = [[16, 47], [29, 45.5], [30, 44], [28.5, 42.5], [33, 42.2], [36, 42], [39, 41.3], [41.8, 41.8], [42.6, 41], [41.5, 39.8], [42.5, 38.6], [41.2, 37.2], [40.2, 36.7], [39.5, 35.8], [38.8, 34.6], [37.6, 33], [36.8, 31.5], [35.5, 29.6], [34.8, 28.5], [33.9, 25], [33, 22], [29, 22], [25, 24], [24.5, 29], [25, 31.6], [20, 32.5], [9, 32], [9, 37.8], [16, 40]];
const SAS600: LL[] = [[42.6, 41], [44, 42.2], [47, 42.5], [49.5, 41.5], [53, 38.5], [56, 38.3], [60, 37.5], [62, 37.2], [66, 38.5], [70, 36.5], [72, 33], [67, 29], [66, 25], [61, 25], [57, 25.5], [56.5, 24], [54, 24], [51, 24.5], [50, 26], [48, 28.5], [47.5, 30], [45, 30.5], [42, 32], [41, 34.5], [40.2, 36.7], [41.2, 37.2], [42.5, 38.6], [41.5, 39.8]];
const OCC619: LL[] = [[42.5, 38.6], [41.2, 37.2], [40.2, 36.7], [39.5, 35.8], [38.8, 34.6], [37.6, 33], [36.8, 31.5], [35.5, 29.6], [34.8, 28.5], [33.9, 25], [33, 22], [29, 22], [25, 24], [24.5, 29], [25, 31.6], [30, 31.6], [34.2, 31.4], [35, 33], [35.8, 35], [36.2, 36.8], [38, 38.5], [40, 39.6], [41.5, 39.8]];
const ARAB651: LL[] = [[25, 31.6], [24.5, 29], [25, 24], [33, 22], [36, 16], [43, 12.5], [52, 16], [57, 18.5], [59.8, 22.5], [57, 25.5], [61, 25], [66, 25], [67, 29], [70, 33], [66, 38.5], [62, 37.2], [60, 37.5], [56, 38.3], [53, 38.5], [49.5, 41.5], [47, 42], [44, 40.5], [42.5, 38.6], [40.2, 36.7], [38, 37.5], [36.2, 36.8], [35.8, 35], [35, 33], [34.2, 31.4], [30, 31.6]];
const REGIONS = { rom600: { pts: ROM600, color: ROME }, sas600: { pts: SAS600, color: PERSIA }, occ619: { pts: OCC619, color: PERSIA }, arab651: { pts: ARAB651, color: ARAB } };
type RegionId = keyof typeof REGIONS;


export const C: Record<string, { ll: LL; fa: string }> = {
  ctesiphon: { ll: [44.58, 33.09], fa: "تیسفون" },
  constantinople: { ll: [28.98, 41.01], fa: "قسطنطنیه" },
  chalcedon: { ll: [29.2, 40.8], fa: "خلقدون" },
  jerusalem: { ll: [35.23, 31.78], fa: "اورشلیم" },
  antioch: { ll: [36.16, 36.2], fa: "آنتاکیه" },
  damascus: { ll: [36.29, 33.51], fa: "دمشق" },
  alexandria: { ll: [29.92, 31.2], fa: "اسکندریه" },
  edessa: { ll: [38.79, 37.16], fa: "ادسا" },
  dara: { ll: [40.95, 37.18], fa: "دارا" },
  amida: { ll: [40.23, 37.91], fa: "آمید" },
  caesarea: { ll: [34.89, 32.5], fa: "قیصریه" },
  ganzak: { ll: [47.23, 36.6], fa: "گنزک" },
  nineveh: { ll: [43.15, 36.36], fa: "نینوا" },
  dastagerd: { ll: [45.0, 33.95], fa: "دستگرد" },
  yarmouk: { ll: [35.95, 32.75], fa: "یرموک" },
  qadisiyyah: { ll: [44.4, 31.75], fa: "قادسیه" },
  nahavand: { ll: [48.37, 34.19], fa: "نهاوند" },
  merv: { ll: [61.83, 37.66], fa: "مرو" },
  medina: { ll: [39.61, 24.47], fa: "مدینه" },
  circesium: { ll: [40.45, 35.16], fa: "قرقیسیا" },
  rey: { ll: [51.4, 35.6], fa: "ری" },
  dvin: { ll: [44.57, 40.0], fa: "دوین" },
  sarus: { ll: [35.3, 37.0], fa: "رود ساروس" },
};

type Route = { pts: LL[]; color: string; a: number; b: number; dash?: boolean; label?: string; at?: LL; width?: number };
type Mark = { city: string; a: number; kind?: "dot" | "battle" | "fire" | "cross" | "camp"; label?: string; sub?: string; dx?: number; dy?: number };
type Scene = {
  sea?: SeaId;
  cam0: [number, number, number]; cam1: [number, number, number];
  regions?: { id: RegionId; a: number; b?: number; o?: number; hatch?: boolean }[];
  labels?: { at: LL; text: string; a: number; color?: string; size?: number }[];
  routes?: Route[];
  marks?: Mark[];
  date?: string; title?: string;
  water?: LL[][];
};

const R = (...names: string[]): LL[] => names.map((n) => C[n].ll);

export const SCENES: Record<string, Scene> = {
  M1: { cam0: [44.2, 35.2, 2.6], cam1: [44.6, 34.2, 3.4], regions: [{ id: "sas600", a: 0, o: 0.32 }], date: "دسامبر ۶۲۷", title: "امپراتور روم در قلب ایران",
    routes: [{ pts: [[44.4, 38.6], [43.6, 37.3], ...R("nineveh", "dastagerd")], color: ROME, a: 0.15, b: 0.75, width: 5 }],
    marks: [{ city: "ctesiphon", a: 0.05, kind: "dot" }, { city: "nineveh", a: 0.4, kind: "battle" }, { city: "dastagerd", a: 0.7, kind: "dot" }] },
  M2: { cam0: [40, 36, 1.0], cam1: [41.5, 35.5, 1.12], regions: [{ id: "rom600", a: 0.05 }, { id: "sas600", a: 0.25 }], date: "۲۲۴ تا ۶۰۲ میلادی", title: "دو غول، یک مرز",
    labels: [{ at: [32, 39], text: "روم شرقی", a: 0.15, color: "#cfb4ef", size: 54 }, { at: [53, 33], text: "ایران ساسانی", a: 0.35, color: "#f0a2a0", size: 54 }],
    marks: [{ city: "constantinople", a: 0.2 }, { city: "ctesiphon", a: 0.4 }] },
  M2s: { cam0: [48, 36, 0.78], cam1: [46, 36, 0.86], regions: [{ id: "rom600", a: 0, o: 0.3 }, { id: "sas600", a: 0, o: 0.3 }], title: "جاده‌ی ابریشم",
    routes: [{ pts: [[76, 39.5], [69, 39.6], ...R("merv", "rey", "ctesiphon", "antioch", "constantinople")], color: GOLD, a: 0.05, b: 0.85, dash: true, width: 5 }],
    labels: [{ at: [66, 42], text: "از چین ←", a: 0.1, color: GOLD, size: 40 }],
    marks: [{ city: "merv", a: 0.25 }, { city: "ctesiphon", a: 0.5 }, { city: "constantinople", a: 0.8 }] },
  M3: { cam0: [42.6, 34.2, 3.8], cam1: [42.3, 34.3, 4.2], regions: [{ id: "rom600", a: 0, o: 0.45 }, { id: "sas600", a: 0, o: 0.45 }], date: "۵۹۰", title: "فرار خسرو به خاک روم",
    routes: [{ pts: [...R("ctesiphon"), [42.5, 34.3], ...R("circesium")], color: PERSIA, a: 0.1, b: 0.8, width: 5, label: "فرار", at: [42.9, 33.4] }],
    marks: [{ city: "ctesiphon", a: 0.02 }, { city: "circesium", a: 0.75 }] },
  M3b: { cam0: [42.3, 34.4, 4.0], cam1: [42.8, 34.0, 3.7], regions: [{ id: "rom600", a: 0, o: 0.45 }, { id: "sas600", a: 0, o: 0.45 }], date: "۵۹۱", title: "بازگشت با ارتش روم",
    routes: [{ pts: [...R("circesium"), [42.4, 34.6], ...R("ctesiphon")], color: ROME, a: 0.08, b: 0.85, width: 6 }],
    marks: [{ city: "circesium", a: 0.02 }, { city: "ctesiphon", a: 0.85, kind: "camp", sub: "تاج دوباره" }] },
  M3c: { cam0: [40.4, 37.6, 3.8], cam1: [40.6, 37.5, 4.3], regions: [{ id: "rom600", a: 0, o: 0.5 }, { id: "sas600", a: 0, o: 0.5 }], date: "۵۹۱", title: "شهرهای مرزی به روم بخشیده شد",
    marks: [{ city: "dara", a: 0.2, kind: "cross", sub: "به روم" }, { city: "amida", a: 0.45, kind: "dot" }] },
  M4: { cam0: [39.8, 37.2, 3.6], cam1: [40.2, 37.3, 4.1], regions: [{ id: "rom600", a: 0, o: 0.5 }, { id: "sas600", a: 0, o: 0.5 }], date: "۶۰۲ تا ۶۱۰", title: "شهرهای مرزی می‌افتند",
    marks: [{ city: "dara", a: 0.15, kind: "battle" }, { city: "amida", a: 0.4, kind: "battle" }, { city: "edessa", a: 0.65, kind: "battle" }] },
  M5: { cam0: [37, 34, 2.0], cam1: [36.6, 33.4, 2.3], regions: [{ id: "rom600", a: 0, o: 0.55 }, { id: "sas600", a: 0 }, { id: "occ619", a: 0.2, b: 0.9, o: 0.4, hatch: true }], date: "۶۱۱ تا ۶۱۴", title: "پیشروی ایران",
    marks: [{ city: "antioch", a: 0.15, kind: "battle", sub: "۶۱۱" }, { city: "damascus", a: 0.45, kind: "battle", sub: "۶۱۳" }, { city: "jerusalem", a: 0.75, kind: "battle", sub: "۶۱۴" }] },
  M5e: { cam0: [37, 33, 1.15], cam1: [38.5, 34, 1.0], regions: [{ id: "rom600", a: 0, o: 0.5 }, { id: "sas600", a: 0 }, { id: "occ619", a: 0.1, b: 0.6, hatch: true }], date: "۶۱۸ تا ۶۱۹", title: "از قفقاز تا نیل",
    marks: [{ city: "alexandria", a: 0.3, kind: "battle", sub: "۶۱۹" }, { city: "jerusalem", a: 0.05 }, { city: "antioch", a: 0.05 }, { city: "constantinople", a: 0.7 }] },
  M6: { sea: "levant", cam0: [35.1, 32.3, 5.2], cam1: [35.2, 32.0, 6.4], regions: [{ id: "occ619", a: 0, o: 0.3 }], date: "بهار ۶۱۴", title: "شهربراز به سوی اورشلیم",
    routes: [{ pts: [[36.3, 33.5], [35.6, 33.0], ...R("caesarea", "jerusalem")], color: PERSIA, a: 0.1, b: 0.6, width: 6 }],
    marks: [{ city: "caesarea", a: 0.3, kind: "battle" }, { city: "jerusalem", a: 0.65, kind: "camp", sub: "محاصره · حدود ۳ هفته" }] },
  M6b: { cam0: [38.5, 33, 2.4], cam1: [40, 32.8, 2.1], regions: [{ id: "sas600", a: 0 }, { id: "occ619", a: 0, o: 0.35, hatch: true }], date: "۶۱۴", title: "صلیب مقدس به تیسفون",
    routes: [{ pts: [...R("jerusalem", "damascus"), [38.5, 34.6], [41.1, 34.4], [43.4, 33.4], ...R("ctesiphon")], color: GOLD, a: 0.1, b: 0.85, width: 5, dash: true }],
    marks: [{ city: "jerusalem", a: 0.02, kind: "cross" }, { city: "ctesiphon", a: 0.85, kind: "cross" }] },
  M7: { cam0: [37, 39, 1.7], cam1: [41, 38.4, 1.9], regions: [{ id: "rom600", a: 0, o: 0.45 }, { id: "sas600", a: 0, o: 0.6 }, { id: "occ619", a: 0, o: 0.35, hatch: true }], date: "۶۲۲ تا ۶۲۴", title: "قمار هراکلیوس",
    routes: [{ pts: [...R("constantinople"), [31.5, 40.5], [33, 39.9], [35.5, 38.7], [38.5, 39.6], [41.5, 40.2], ...R("dvin", "ganzak")], color: ROME, a: 0.08, b: 0.8, width: 6 }],
    marks: [{ city: "constantinople", a: 0.02 }, { city: "dvin", a: 0.6 }, { city: "ganzak", a: 0.8, kind: "fire", sub: "آتشکده‌ی آذرگشنسب" }] },
  M7f: { cam0: [40, 39.5, 1.8], cam1: [40.8, 39.2, 2.0], regions: [{ id: "rom600", a: 0, o: 0.45 }, { id: "sas600", a: 0, o: 0.6 }, { id: "occ619", a: 0, o: 0.35, hatch: true }], date: "۶۲۲ تا ۶۲۶", title: "سه سال کوه و بیابان",
    routes: [{ pts: [...R("constantinople"), [31.5, 40.5], [33, 39.9], [35.5, 38.7], [38.5, 39.6], [41.5, 40.2], ...R("dvin", "ganzak"), [47.5, 39.5], [47.2, 41.2], [44.5, 41.6], [41.5, 40.5], [38.5, 38.2], ...R("sarus")], color: ROME, a: 0.05, b: 0.9, width: 5 }],
    marks: [{ city: "ganzak", a: 0.35, kind: "fire" }, { city: "sarus", a: 0.9, kind: "battle", sub: "۶۲۵" }] },
  M7t: { cam0: [43, 39.5, 2.3], cam1: [43.4, 39.6, 2.6], regions: [{ id: "sas600", a: 0, o: 0.5 }], date: "۶۲۵", title: "سه ارتش ایرانی",
    routes: [{ pts: [[49.5, 37], [46.5, 38.8], [44.6, 39.6]], color: PERSIA, a: 0.1, b: 0.45, width: 7 }, { pts: [[38.5, 38], [41.5, 39], [43.6, 39.7]], color: PERSIA, a: 0.25, b: 0.6, width: 7 }, { pts: [[44.5, 42.8], [44.2, 41.3], [44.1, 40.4]], color: PERSIA, a: 0.4, b: 0.75, width: 7 }],
    marks: [{ city: "dvin", a: 0.05, kind: "camp", label: "هراکلیوس" }] },
  M8: { sea: "bosphorus", cam0: [29.6, 40.95, 6.6], cam1: [29.4, 40.95, 7.6], regions: [{ id: "rom600", a: 0, o: 0.16 }], labels: [{ at: [26.9, 41.3], text: "اروپا · آوارها", a: 0.1, color: "#cfb4ef", size: 44 }, { at: [31.6, 40.15], text: "آسیا · ایران", a: 0.3, color: "#f0a2a0", size: 44 }], date: "تابستان ۶۲۶", title: "محاصره‌ی قسطنطنیه",
    water: [[[29.12, 41.3], [29.06, 41.15], [29.02, 41.07], [29.0, 41.02], [28.99, 40.98], [29.0, 40.9]]],
    routes: [{ pts: [[27.6, 41.6], [28.4, 41.2], [28.85, 41.04]], color: "#b9a37a", a: 0.15, b: 0.45, width: 7, label: "آوارها", at: [27.9, 41.42] }, { pts: [[30.6, 40.6], [29.7, 40.75], [29.2, 40.85]], color: "#e24b4b", a: 0.35, b: 0.65, width: 7, label: "شهربراز", at: [30.4, 40.45] }],
    marks: [{ city: "constantinople", a: 0.05, kind: "camp" }, { city: "chalcedon", a: 0.65, kind: "camp" }] },
  M9: { cam0: [44.6, 36.0, 2.8], cam1: [44.6, 34.6, 3.2], regions: [{ id: "sas600", a: 0, o: 0.32 }], date: "پاییز ۶۲۷", title: "از زاگرس تا نینوا",
    routes: [{ pts: [[44.5, 39.4], [45.4, 37.8], [44.6, 36.9], ...R("nineveh"), [43.9, 35.0], ...R("dastagerd"), [44.75, 33.5]], color: ROME, a: 0.05, b: 0.85, width: 6 }],
    marks: [{ city: "nineveh", a: 0.4, kind: "battle", sub: "۱۲ دسامبر" }, { city: "dastagerd", a: 0.75, kind: "fire" }, { city: "ctesiphon", a: 0.85 }] },
  M9b: { cam0: [44.2, 35.4, 3.2], cam1: [44.7, 33.8, 3.8], regions: [{ id: "sas600", a: 0, o: 0.32 }], date: "دی ۶۲۷", title: "راه تیسفون باز شد",
    routes: [{ pts: [...R("nineveh"), [43.9, 35.0], ...R("dastagerd"), [44.75, 33.5]], color: ROME, a: 0.05, b: 0.8, width: 6 }],
    marks: [{ city: "nineveh", a: 0.02, kind: "battle" }, { city: "dastagerd", a: 0.5, kind: "fire", sub: "غارت" }, { city: "ctesiphon", a: 0.8 }] },
  M10a: { cam0: [39, 29, 1.15], cam1: [40.5, 30.5, 1.25], regions: [{ id: "rom600", a: 0, o: 0.45 }, { id: "sas600", a: 0, o: 0.5 }], date: "۶۳۴ تا ۶۳۶", title: "سواره‌های صحرا",
    routes: [{ pts: [...R("medina"), [37.5, 28], [36.5, 31], ...R("yarmouk")], color: ARAB, a: 0.1, b: 0.55, width: 7 }, { pts: [...R("medina"), [42.5, 27.5], [44, 30.5], ...R("qadisiyyah")], color: ARAB, a: 0.3, b: 0.75, width: 7 }],
    marks: [{ city: "medina", a: 0.05 }, { city: "yarmouk", a: 0.55, kind: "battle", sub: "۶۳۶" }, { city: "qadisiyyah", a: 0.75, kind: "battle", sub: "۶۳۶" }] },
  M10b: { cam0: [45.5, 33, 2.2], cam1: [46.2, 33.6, 2.5], regions: [{ id: "sas600", a: 0, o: 0.32 }], date: "۶۳۷ تا ۶۴۲", title: "فتح الفتوح",
    routes: [{ pts: [...R("qadisiyyah", "ctesiphon"), [46.5, 33.8], ...R("nahavand")], color: ARAB, a: 0.08, b: 0.7, width: 7 }],
    marks: [{ city: "ctesiphon", a: 0.35, kind: "battle", sub: "۶۳۷" }, { city: "nahavand", a: 0.7, kind: "battle", sub: "۶۴۲" }] },
  M10c: { cam0: [52, 34, 1.15], cam1: [54, 35, 1.3], regions: [{ id: "arab651", a: 0.1, b: 0.8, o: 0.4 }], date: "۶۵۱", title: "آخرین شاه ساسانی",
    routes: [{ pts: [...R("nahavand", "rey"), [56, 36.5], ...R("merv")], color: ARAB, a: 0.1, b: 0.7, width: 6, dash: true }],
    marks: [{ city: "merv", a: 0.72, kind: "cross", sub: "یزدگرد سوم" }] },
  M11: { cam0: [44, 32.5, 0.9], cam1: [45, 32, 0.95], regions: [{ id: "sas600", a: 0, b: 0.5 }, { id: "occ619", a: 0, b: 0.5, hatch: true }, { id: "arab651", a: 0.55 }], date: "۶۱۹ ← ۶۵۱", title: "سی سال بعد",
    labels: [{ at: [47, 37], text: "اوج ایران · ۶۱۹", a: 0.05, color: "#f0a2a0", size: 50 }, { at: [44, 27], text: "خلافت · ۶۵۱", a: 0.6, color: ARAB, size: 50 }] },
};

// ── the coastline as a picture: sea opaque, land transparent, rendered once (V06-Sea-*) to public/v06/map/ ──
export const SEA_RASTERS = {
  world: { lon: [5, 80] as [number, number], lat: [8, 52] as [number, number], f: 2.5, file: "v06/map/sea-world.png" },
  levant: { lon: [32.5, 37.5] as [number, number], lat: [30, 34] as [number, number], f: 24, file: "v06/map/sea-levant.png" },
  bosphorus: { lon: [26.5, 32] as [number, number], lat: [39.5, 42.5] as [number, number], f: 24, file: "v06/map/sea-bosphorus.png" },
};
export type SeaId = keyof typeof SEA_RASTERS;
export const seaSize = (id: SeaId) => { const r = SEA_RASTERS[id]; return { w: Math.round((r.lon[1] - r.lon[0]) * KX * r.f), h: Math.round((r.lat[1] - r.lat[0]) * K * r.f) }; };
export const SeaMask: React.FC<{ id: SeaId }> = ({ id }) => {
  const r = SEA_RASTERS[id]; const { w, h } = seaSize(id);
  const tf = `scale(${r.f}) translate(${-r.lon[0] * KX} ${r.lat[1] * K})`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0, background: "transparent" }}>
      <defs><mask id="sea"><rect width={w} height={h} fill="#fff" /><path d={LAND_PATH} transform={tf} fill="#000" /></mask>
        <radialGradient id="seag" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#14191c" /><stop offset="1" stopColor="#07090a" /></radialGradient></defs>
      <rect width={w} height={h} fill="url(#seag)" mask="url(#sea)" />
      <path d={LAND_PATH} transform={tf} fill="none" stroke={LAND_EDGE} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const shown = (p: number, a: number, b = 2, f = 0.07) => clamp((p - a) / f) * clamp((b - p) / f);

const GRID = { F: 3, lon0: 0, lat0: 56, W: 6208, H: 3900 };
const BaseImg: React.FC<{ cx: number; cy: number; z: number; file?: string; o?: number }> = ({ cx, cy, z, file = "v06/map/base.jpg", o = 1 }) => {
  if (o <= 0.003) return null;
  const x0 = GRID.lon0 * KX, y0 = -GRID.lat0 * K;
  return <Img src={staticFile(file)} style={{ position: "absolute", left: 0, top: 0, width: GRID.W, height: GRID.H, maxWidth: "none", opacity: o, transformOrigin: "0 0", transform: `translate(${W / 2 + (x0 - cx) * z}px, ${H / 2 + (y0 - cy) * z}px) scale(${z / GRID.F})` }} />;
};
const SeaImg: React.FC<{ sea: SeaId; cx: number; cy: number; z: number }> = ({ sea, cx, cy, z }) => {
  const r = SEA_RASTERS[sea]; const { w, h } = seaSize(sea);
  const x0 = r.lon[0] * KX, y0 = -r.lat[1] * K;
  return (
    <>
      {sea !== "world" && <SeaImg sea="world" cx={cx} cy={cy} z={z} />}
      <Img src={staticFile(r.file)} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, maxWidth: "none", transformOrigin: "0 0", transform: `translate(${W / 2 + (x0 - cx) * z}px, ${H / 2 + (y0 - cy) * z}px) scale(${z / r.f})` }} />
    </>
  );
};

/** the map under scene id at progress p (0–1) and absolute time t (for little pulses) */
export const MapScene: React.FC<{ id: string; p: number; t: number; bare?: boolean }> = ({ id, p, t, bare }) => {
  const s = SCENES[id];
  if (!s) return null;
  const k = io(p);
  const cam = [lerp(s.cam0[0], s.cam1[0], k), lerp(s.cam0[1], s.cam1[1], k), lerp(s.cam0[2], s.cam1[2], k)];
  const [cx, cy] = P([cam[0], cam[1]]);
  const z = cam[2];
  const scr = (ll: LL) => { const [x, y] = P(ll); return [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z]; };
  const tf = `translate(${W / 2} ${H / 2}) scale(${z}) translate(${-cx} ${-cy})`;
  return (
    <div style={{ position: "absolute", inset: 0, background: SEA }}>
      <BaseImg cx={cx} cy={cy} z={z} />
      {(s.regions ?? []).map((r, i) => (
        <BaseImg key={i} cx={cx} cy={cy} z={z} file={`v06/map/wash-${r.id}.png`} o={shown(p, r.a, r.b ?? 2, 0.12) * Math.min(1, (r.o ?? 0.55) / 0.5)} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 900, height: 420, background: "radial-gradient(ellipse at 0% 0%, rgba(0,0,0,0.7), rgba(0,0,0,0) 70%)" }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* rivers and extra water */}
        <g transform={tf}>
          {(s.water ?? []).map((r, i) => <path key={`w${i}`} d={pathOf(r)} stroke={SEA} strokeWidth={0.06} fill="none" strokeLinecap="round" />)}
        </g>
        {/* routes */}
        {(s.routes ?? []).map((r, i) => {
          const q = clamp((p - r.a) / (r.b - r.a));
          if (q <= 0) return null;
          const pts = r.pts.map(scr);
          let len = 0; for (let j = 1; j < pts.length; j++) len += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
          // the drawn part: the polyline cut at q of its length
          let rem = q * len, ang = 0;
          const cut: number[][] = [pts[0]];
          for (let j = 1; j < pts.length; j++) {
            const sl = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
            ang = Math.atan2(pts[j][1] - pts[j - 1][1], pts[j][0] - pts[j - 1][0]);
            if (rem <= sl) { cut.push([pts[j - 1][0] + ((pts[j][0] - pts[j - 1][0]) * rem) / Math.max(sl, 1e-6), pts[j - 1][1] + ((pts[j][1] - pts[j - 1][1]) * rem) / Math.max(sl, 1e-6)]); break; }
            rem -= sl; cut.push(pts[j]);
          }
          const [hx, hy] = cut[cut.length - 1];
          const d = cut.map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
          const w = r.width ?? 5;
          const lab = r.label && r.at ? scr(r.at) : null;
          return (
            <g key={i}>
              <path d={d} stroke={r.color} strokeWidth={w * 2.6} strokeOpacity={0.28} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} stroke={r.color} strokeWidth={w} fill="none" strokeLinecap={r.dash ? "butt" : "round"} strokeLinejoin="round" strokeDasharray={r.dash ? `${w * 3} ${w * 2.2}` : undefined} />
              <polygon points="-18,-13 12,0 -18,13" fill={r.color} stroke="#000" strokeWidth={1.5} transform={`translate(${hx} ${hy}) rotate(${(ang * 180) / Math.PI})`} />
              {lab && <text x={lab[0]} y={lab[1]} fill={r.color} fontFamily={FONT_TEXT} fontSize={38} textAnchor="middle" direction="rtl" opacity={clamp(q * 3)} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 6 }}>{r.label}</text>}
            </g>
          );
        })}
        {/* marks */}
        {(s.marks ?? []).map((m, i) => {
          const o = shown(p, m.a, 2, 0.05);
          if (o <= 0) return null;
          const [x, y] = scr(C[m.city].ll);
          const pop = 1 + 0.6 * Math.max(0, 1 - (p - m.a) / 0.05);
          const pulse = 1 + 0.12 * Math.sin(t * 4 + i);
          const kind = m.kind ?? "dot";
          return (
            <g key={i} opacity={o} transform={`translate(${x} ${y})`}>
              {kind === "dot" && <><circle r={22 * pulse} fill={GOLD} opacity={0.18} /><circle r={9 * pop} fill={GOLD} stroke="#000" strokeWidth={2} /></>}
              {kind === "camp" && <><circle r={30 * pulse} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.6} /><circle r={10 * pop} fill={GOLD} stroke="#000" strokeWidth={2} /></>}
              {kind === "battle" && <g transform={`scale(${pop})`}><circle r={30} fill="#000" opacity={0.55} /><path d="M-15,-15 L15,15 M15,-15 L-15,15" stroke={INK} strokeWidth={5} strokeLinecap="round" /><circle r={30} fill="none" stroke={PERSIA} strokeWidth={3} /></g>}
              {kind === "fire" && <g transform={`scale(${pop * pulse})`}><path d="M0,-30 C14,-12 18,0 10,12 C6,20 -6,20 -10,12 C-18,0 -12,-14 0,-30 Z" fill="#e8762a" /><path d="M0,-12 C6,-4 8,4 3,10 C1,13 -3,13 -5,9 C-8,2 -5,-5 0,-12 Z" fill="#ffd27a" /></g>}
              {kind === "cross" && <g transform={`scale(${pop})`}><circle r={28} fill="#000" opacity={0.55} /><path d="M0,-20 L0,20 M-12,-6 L12,-6" stroke={GOLD} strokeWidth={6} strokeLinecap="round" /></g>}
              <text x={(m.dx ?? 0)} y={(m.dy ?? -42)} fill={INK} fontFamily={FONT_TEXT} fontSize={36} textAnchor="middle" direction="rtl" style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 7 }}>{m.label ?? C[m.city].fa}</text>
              {m.sub && <text x={m.dx ?? 0} y={(m.dy ?? -42) + 86} fill={GOLD} fontFamily={FONT_NUM} fontSize={34} textAnchor="middle" direction="rtl" style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 6 }}>{m.sub}</text>}
            </g>
          );
        })}
        {/* region labels */}
        {(s.labels ?? []).map((l, i) => {
          const [x, y] = scr(l.at);
          return <text key={i} x={x} y={y} fill={l.color ?? INK} fontFamily={FONT_NUM} fontSize={l.size ?? 46} textAnchor="middle" direction="rtl" opacity={shown(p, l.a, 2, 0.08)} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 8, letterSpacing: 1 }}>{l.text}</text>;
        })}
      </svg>
      {/* frame: date top-right, title bottom-right, gold rules */}
      <div style={{ position: "absolute", inset: 28, border: `1.5px solid ${GOLD}55`, pointerEvents: "none" }} />
      {!bare && s.date && <div style={{ position: "absolute", left: 70, top: 56, direction: "rtl", font: `86px ${FONT_NUM}`, color: GOLD, textShadow: "0 4px 20px #000", opacity: clamp(p / 0.06) }}>{s.date}</div>}
      {!bare && s.title && <div style={{ position: "absolute", left: 72, top: 160, direction: "rtl", font: `42px ${FONT_TEXT}`, color: INK, textShadow: "0 3px 14px #000", opacity: clamp((p - 0.03) / 0.06) }}>{s.title}</div>}
      <div style={{ position: "absolute", left: 70, bottom: 54, direction: "rtl", font: `22px ${FONT_TEXT}`, color: `${INK}99` }}>نقشه‌ی تقریبی · مرزها ساده شده‌اند</div>
    </div>
  );
};
