// V07 · Elam maps: dark vector map of the Near East (Natural Earth coastline from lib/geo/land.json) with soft territory
// washes, rivers, cities, animated routes and dates. Every scene is data (SCENES); progress p (0–1) through the scene
// drives what appears. Eighteen scenes M1…M17 (+M2r), keyed by plan.py.
import React from "react";
import { Img, staticFile } from "remotion";
import riversRaw from "./rivers.json";
import landRaw from "../lib/geo/land.json";
import { FONT_NUM, FONT_TEXT } from "../fonts";

export type LL = [number, number]; // [lon, lat]
const W = 1920, H = 1080;
const LAT0 = 32, K = 26; // px per degree at zoom 1
const KX = K * Math.cos((LAT0 * Math.PI) / 180);
const P = ([lon, lat]: LL): [number, number] => [lon * KX, -lat * K];
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const io = (x: number) => { const c = clamp(x); return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const FA = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);

const SEA = "#080b0d", GOLD = "#d8b25a", INK = "#efe3c4", RIVER = "#5f9bbd";
const ELAM = "#2fb3ad", MESO = "#c2412f", ASSYR = "#8a5cc4", MEDE = "#5aa860", ACHAEM = "#d8b25a", BABYL = "#c9783a";

const pathOf = (pts: LL[], close = false) => pts.map((p, i) => { const [x, y] = P(p); return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join("") + (close ? "Z" : "");
const land = landRaw as { coordinates: number[][][][] };
const LAND_PATH = land.coordinates
  .map((poly) => poly.filter((ring) => ring.some((p) => p[0] > 10 && p[0] < 85 && p[1] > 5 && p[1] < 58)).map((ring) => pathOf(ring as unknown as LL[], true)).join(""))
  .join("");

// ── rivers: real courses from Natural Earth (Tigris, Euphrates, Karkheh); Karun and Dez (not in the dataset) hand-traced with meanders ──
const NE = riversRaw as { n: string; p: LL[] }[];
// faint background river network: only the Near East, every 4th point (the full set made each map frame ~5x slower)
const NE_PATH = NE.filter((r) => !/Canal|Channel|Branch/.test(r.n) && r.p.some(([x, y]) => x > 26 && x < 66 && y > 22 && y < 44))
  .map((r) => pathOf(r.p.filter((_, i) => i % 4 === 0 || i === r.p.length - 1))).join("");
const chain = (...names: string[]): LL[] => {
  const segs = NE.filter((r) => names.includes(r.n) && r.p.length > 8).sort((a, b) => b.p[0][1] - a.p[0][1]);
  return segs.flatMap((r) => r.p);
};
const meander = (pts: LL[], amp = 0.05): LL[] => {
  const out: LL[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.04));
    const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
    for (let j = 0; j < n; j++) {
      const u = j / n, k = i * 17 + j, w = Math.sin(k * 0.9) * 0.6 + Math.sin(k * 0.37 + 1) * 0.4;
      out.push([a[0] + (b[0] - a[0]) * u + (nx / l) * amp * w, a[1] + (b[1] - a[1]) * u + (ny / l) * amp * w]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
const RIVERS: Record<string, LL[]> = {
  euphrates: chain("Euphrates", "Firat"),
  tigris: chain("Tigris", "Dicle"),
  karkheh: chain("Karkheh"),
  karun: meander([[50.6, 32.0], [50.0, 32.3], [49.5, 32.2], [49.0, 32.1], [48.85, 32.05], [48.7, 31.6], [48.67, 31.32], [48.45, 30.9], [48.18, 30.44]], 0.05),
  dez: meander([[49.0, 33.6], [48.7, 33.0], [48.4, 32.7], [48.4, 32.38], [48.6, 32.1], [48.82, 31.95]], 0.05),
};

// ── regions (rough) ──
type Region = { pts: LL[]; color: string };
const REGIONS: Record<string, Region> = {
  elam: { color: ELAM, pts: [[47.4, 33.3], [48.8, 33.8], [50.5, 33.0], [52.2, 31.9], [54, 30.6], [54.2, 29.2], [52.2, 28.4], [50.2, 29.4], [49.0, 30.2], [47.8, 31.2]] },
  khuz: { color: ELAM, pts: [[47.4, 33.3], [48.8, 33.8], [50.0, 32.6], [49.4, 31.2], [48.8, 30.2], [47.8, 31.2]] },
  fars: { color: "#e0b341", pts: [[50.2, 31.6], [52.5, 32.0], [54.3, 30.8], [54.2, 29.2], [52.2, 28.4], [50.2, 29.4]] },
  media: { color: MEDE, pts: [[46.0, 36.8], [49, 37.4], [51, 35.6], [49.2, 34], [46.6, 34.4]] },
  akkad: { color: MESO, pts: [[41.5, 37.0], [46.0, 36.8], [48.6, 32.6], [47.4, 30.6], [44.0, 30.8], [41.5, 33.5]] },
  ur3: { color: MESO, pts: [[44.0, 34.6], [47.8, 33.6], [48.8, 31.6], [46.2, 30.2], [43.8, 31.8]] },
  assyria0: { color: ASSYR, pts: [[41.6, 37.4], [44.6, 37.2], [44.0, 35.2], [42.0, 35.0]] },
  assyria1: { color: ASSYR, pts: [[38.5, 37.8], [44.8, 37.6], [45.6, 35.0], [44.2, 33.6], [41, 34.0], [38.5, 35.5]] },
  assyria2: { color: ASSYR, pts: [[38.5, 37.8], [44.8, 37.6], [45.2, 35.0], [44.2, 33.4], [42, 33.0], [38.8, 32.4], [36.0, 31.0], [33.5, 31.4], [31.0, 31.4], [31.0, 29.0], [34.6, 28.2], [37, 30.6], [40, 32.6], [38.2, 34.8]] },
  achaem: { color: ACHAEM, pts: [[22, 40], [28, 41.5], [38, 41.5], [48, 42], [56, 40], [68, 40], [72, 35], [68, 26], [60, 24], [57, 26], [50, 28], [48, 30], [37, 29], [34, 22.5], [25, 24], [25, 31.5], [20, 32], [22, 36]] },
};
const wobble = (pts: LL[]): LL[] => {
  const out: LL[] = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    out.push(a);
    for (let j = 1; j < 4; j++) { const u = j / 4, w = Math.sin(i * 5.1 + j * 2.3) * 0.5 + Math.sin(i * 1.7 + j) * 0.5; out.push([a[0] + (b[0] - a[0]) * u - ((b[1] - a[1]) / l) * w * 0.12 * Math.min(l, 3), a[1] + (b[1] - a[1]) * u + ((b[0] - a[0]) / l) * w * 0.12 * Math.min(l, 3)]); }
  });
  return out;
};
const chaikin = (pts: LL[], n = 2): LL[] => {
  let p = pts;
  for (let k = 0; k < n; k++) {
    const q: LL[] = [];
    for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
    p = q;
  }
  return p;
};
const REG_D: Record<string, string> = {};
const regD = (id: string) => (REG_D[id] ??= pathOf(chaikin(wobble(REGIONS[id].pts), 2), true));

// context names (seas, ranges): drawn dim at a fixed screen size, only when in frame
const CONTEXT: { at: LL; text: string; maxZ: number; minZ?: number; rot?: number }[] = [
  { at: [51.6, 26.9], text: "خلیج فارس", maxZ: 6, rot: 24 }, { at: [33.5, 34.2], text: "دریای مدیترانه", maxZ: 3 }, { at: [50.6, 40.3], text: "دریای خزر", maxZ: 3.2 },
  { at: [35.0, 43.0], text: "دریای سیاه", maxZ: 2.2 }, { at: [49.9, 34.7], text: "کوه‌های زاگرس", maxZ: 4.2, minZ: 1.9, rot: 35 }, { at: [44.9, 31.1], text: "بین‌النهرین", maxZ: 3.6, minZ: 1.9 },
];
export const C: Record<string, { ll: LL; fa: string }> = {
  susa: { ll: [48.26, 32.19], fa: "شوش" },
  anshan: { ll: [52.4, 30.0], fa: "اَنشان" },
  ur: { ll: [46.1, 30.96], fa: "اور" },
  babylon: { ll: [44.42, 32.54], fa: "بابل" },
  nineveh: { ll: [43.15, 36.36], fa: "نینوا" },
  sippar: { ll: [44.25, 33.06], fa: "سیپار" },
  eshnunna: { ll: [44.72, 33.53], fa: "اِشنونا" },
  akkad: { ll: [44.0, 33.4], fa: "اَکَد" },
  chogha: { ll: [48.52, 32.0], fa: "چُغازَنبیل" },
  ulai: { ll: [47.95, 32.35], fa: "رود اولای" },
  persepolis: { ll: [52.89, 29.93], fa: "تخت جمشید" },
  egypt: { ll: [31.2, 30.0], fa: "مصر" },
  ekbatana: { ll: [48.5, 34.8], fa: "هگمتانه" },
};

type Route = { pts: LL[]; color: string; a: number; b: number; dash?: boolean; label?: string; at?: LL; width?: number };
type Mark = { city: string; a: number; kind?: "dot" | "battle" | "camp"; label?: string; sub?: string; dx?: number; dy?: number };
type Scene = {
  cam0: [number, number, number]; cam1: [number, number, number];
  regions?: { id: string; a: number; b?: number; o?: number }[];
  rivers?: { id: string; a: number }[];
  labels?: { at: LL; text: string; a: number; b?: number; color?: string; size?: number }[];
  routes?: Route[]; marks?: Mark[]; date?: string; title?: string;
};
const R = (...names: string[]): LL[] => names.map((n) => C[n].ll);

export const SCENES: Record<string, Scene> = {
  M1: { cam0: [62, 28, 0.9], cam1: [49.5, 31.2, 4.4], regions: [{ id: "elam", a: 0.55, o: 0.3 }], date: "۴۰۰۰ پیش از میلاد", title: "از آسمان، روی خاکِ ایلام",
    marks: [{ city: "susa", a: 0.6, kind: "camp" }] },
  M2: { cam0: [50.2, 32.4, 3.4], cam1: [50.4, 31.8, 4.0], regions: [{ id: "media", a: 0.05, b: 0.35, o: 0.3 }, { id: "fars", a: 0.05, b: 0.35, o: 0.3 }, { id: "elam", a: 0.4, o: 0.38 }],
    labels: [{ at: [48.2, 36.1], text: "ماد", a: 0.08, b: 0.35, color: "#a7dca9", size: 54 }, { at: [52.7, 30.9], text: "پارس", a: 0.08, b: 0.35, color: "#f0d78a", size: 54 }, { at: [50.4, 31.6], text: "ایلام", a: 0.45, color: "#9ee8e4", size: 96 }],
    title: "پیش از ماد و پارس" },
  M2r: { cam0: [48.6, 32.2, 5.4], cam1: [48.8, 32.3, 6.0], regions: [{ id: "khuz", a: 0, o: 0.25 }], rivers: [{ id: "karkheh", a: 0.1 }, { id: "dez", a: 0.3 }, { id: "karun", a: 0.5 }],
    labels: [{ at: [47.2, 32.9], text: "کرخه", a: 0.2, color: RIVER, size: 44 }, { at: [49.4, 33.1], text: "دز", a: 0.4, color: RIVER, size: 44 }, { at: [49.9, 31.9], text: "کارون", a: 0.6, color: RIVER, size: 44 }], title: "رودهایی که خاک را طلا می‌کردند" },
  M3: { cam0: [50.4, 31.3, 4.4], cam1: [50.3, 31.1, 4.8], regions: [{ id: "elam", a: 0, o: 0.3 }], rivers: [{ id: "karun", a: 0 }],
    routes: [{ pts: R("susa", "anshan"), color: GOLD, a: 0.25, b: 0.85, dash: true, width: 5 }],
    marks: [{ city: "susa", a: 0.1, kind: "camp" }, { city: "anshan", a: 0.85, kind: "camp", sub: "نزدیک شیرازِ امروز" }], title: "شاهِ اَنشان و شوش" },
  M4: { cam0: [47.6, 32.6, 3.5], cam1: [47.4, 32.6, 3.9], regions: [{ id: "elam", a: 0, o: 0.25 }, { id: "ur3", a: 0, o: 0.18 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    routes: [{ pts: [[50.5, 32.6], [47.8, 32.4], [45.2, 32.5]], color: GOLD, a: 0.1, b: 0.6, width: 6, label: "چوب · سنگ", at: [49.6, 33.25] }, { pts: [[50.8, 31.2], [48.2, 31.5], [45.2, 31.9]], color: GOLD, a: 0.3, b: 0.8, width: 6, label: "فلز · سنگ‌های قیمتی", at: [48.3, 30.7] }],
    marks: [{ city: "babylon", a: 0.5 }, { city: "susa", a: 0.05, dy: 66 }], title: "ایلام، دروازه‌ی ثروتِ فلات" },
  M5: { cam0: [46.4, 32.8, 3.8], cam1: [46.6, 32.8, 4.0], regions: [{ id: "elam", a: 0, o: 0.22 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    routes: [{ pts: [[44.2, 32.8], [46.2, 32.5], [48.0, 32.3]], color: MESO, a: 0.05, b: 0.45, width: 8 }, { pts: [[48.2, 32.0], [46.2, 32.2], [44.4, 32.5]], color: ELAM, a: 0.5, b: 0.92, width: 8 }],
    marks: [{ city: "babylon", a: 0.02 }, { city: "susa", a: 0.02 }], title: "مثل یک آونگ" },
  M6: { cam0: [46.4, 33.2, 3.2], cam1: [46.8, 32.8, 3.8], regions: [{ id: "elam", a: 0, o: 0.3 }, { id: "akkad", a: 0.2, o: 0.34 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    labels: [{ at: [44.2, 35.0], text: "اَکَد", a: 0.25, color: "#f3a08f", size: 70 }],
    marks: [{ city: "susa", a: 0.1 }], date: "حدود ۲۳۰۰ پیش از میلاد", title: "سارگُن اَکَدی؛ ایلام زیرِ پا" },
  M7: { cam0: [46.4, 32.6, 3.4], cam1: [46.8, 32.4, 3.9], regions: [{ id: "elam", a: 0, o: 0.25 }, { id: "ur3", a: 0.2, o: 0.4 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    labels: [{ at: [45.4, 33.6], text: "سلسله‌ی سومِ اور", a: 0.3, color: "#f3a08f", size: 52 }],
    marks: [{ city: "ur", a: 0.15, kind: "camp" }, { city: "susa", a: 0.55, kind: "battle" }], date: "حدود ۲۱۰۰ پیش از میلاد", title: "اور، پیشی می‌گیرد" },
  M8: { cam0: [46.2, 33.0, 3.8], cam1: [46.0, 33.0, 4.1], regions: [{ id: "elam", a: 0, o: 0.25 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    routes: [{ pts: [[48.2, 32.3], [46.5, 33.2], [44.72, 33.53]], color: ELAM, a: 0.08, b: 0.38, width: 7 }, { pts: [[44.72, 33.53], [44.5, 33.0], [44.42, 32.54]], color: ELAM, a: 0.4, b: 0.58, width: 7 }, { pts: [[44.42, 32.54], [46.0, 32.6], [47.8, 32.3]], color: BABYL, a: 0.64, b: 0.96, width: 8, label: "حمورابی", at: [46.2, 31.9] }],
    marks: [{ city: "susa", a: 0.02 }, { city: "eshnunna", a: 0.38, kind: "battle" }, { city: "babylon", a: 0.6, kind: "camp" }], title: "حمورابی ایلام را پس می‌زند" },
  M9: { cam0: [46.2, 33.0, 3.8], cam1: [46.0, 33.2, 4.2], regions: [{ id: "elam", a: 0, o: 0.3 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    routes: [{ pts: [[48.2, 32.3], [46.4, 33.3], [44.25, 33.06]], color: ELAM, a: 0.1, b: 0.5, width: 8 }, { pts: [[44.25, 33.06], [44.38, 32.8], [44.42, 32.54]], color: ELAM, a: 0.55, b: 0.8, width: 8 }],
    marks: [{ city: "susa", a: 0.02 }, { city: "sippar", a: 0.5, kind: "battle" }, { city: "babylon", a: 0.78, kind: "battle" }], date: "حدود ۱۱۶۰ پیش از میلاد", title: "شوتروک ناهونْتِه به بابل می‌رسد" },
  M10: { cam0: [46.2, 32.6, 4.2], cam1: [46.6, 32.5, 4.6], regions: [{ id: "elam", a: 0, o: 0.25 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }, { id: "karkheh", a: 0 }],
    routes: [{ pts: [[44.42, 32.54], [45.8, 32.2], [47.6, 32.3]], color: BABYL, a: 0.1, b: 0.7, width: 9 }],
    marks: [{ city: "babylon", a: 0.02, kind: "camp" }, { city: "ulai", a: 0.7, kind: "battle" }, { city: "susa", a: 0.8 }], date: "حدود ۱۱۰۰ پیش از میلاد", title: "نبوکدنصر؛ کنارِ رودِ اولای" },
  M11: { cam0: [43.0, 35.6, 3.0], cam1: [42.0, 35.2, 2.5], regions: [{ id: "assyria0", a: 0, b: 0.45, o: 0.35 }, { id: "assyria1", a: 0.45, o: 0.4 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    labels: [{ at: [41.8, 36.0], text: "آشور", a: 0.1, color: "#c9a6f0", size: 70 }], marks: [{ city: "nineveh", a: 0.05, kind: "camp" }, { city: "susa", a: 0.1 }], date: "سه قرن بعد", title: "آشور بزرگ می‌شود" },
  M12: { cam0: [38.0, 33.4, 2.4], cam1: [38.2, 33.4, 2.1], regions: [{ id: "assyria1", a: 0, b: 0.3, o: 0.3 }, { id: "assyria2", a: 0.25, o: 0.4 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    routes: [{ pts: [R("nineveh")[0], [40, 34.4], [36, 32.4], R("egypt")[0]], color: ASSYR, a: 0.25, b: 0.85, width: 8 }],
    marks: [{ city: "nineveh", a: 0.02, kind: "camp" }, { city: "egypt", a: 0.85 }, { city: "susa", a: 0.05 }], title: "از نینوا تا مصر" },
  M13: { cam0: [46.0, 34.0, 3.0], cam1: [46.4, 33.8, 3.5], regions: [{ id: "assyria1", a: 0, o: 0.25 }, { id: "elam", a: 0, o: 0.2 }], rivers: [{ id: "tigris", a: 0 }],
    routes: [{ pts: [R("nineveh")[0], [44.2, 35.2], [46.2, 33.7], R("susa")[0]], color: "#e03a2a", a: 0.1, b: 0.95, width: 12 }],
    marks: [{ city: "nineveh", a: 0.02, kind: "camp" }, { city: "susa", a: 0.9, kind: "battle" }], title: "حسابِ آخر" },
  M14: { cam0: [45.6, 35.4, 3.2], cam1: [45.0, 35.2, 3.8], regions: [{ id: "assyria1", a: 0, o: 0.25 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    routes: [{ pts: [R("ekbatana")[0], [46.2, 36.0], R("nineveh")[0]], color: MEDE, a: 0.1, b: 0.75, width: 9, label: "مادها", at: [46.4, 36.8] }, { pts: [R("babylon")[0], [43.9, 34.6], R("nineveh")[0]], color: BABYL, a: 0.1, b: 0.75, width: 9, label: "بابلی‌ها", at: [42.6, 34.8] }],
    marks: [{ city: "nineveh", a: 0.7, kind: "battle" }], title: "نینوا، با خاک یکسان" },
  M15: { cam0: [41.0, 35.0, 2.6], cam1: [41.0, 35.0, 2.8], regions: [{ id: "assyria2", a: 0, b: 0.6, o: 0.4 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    labels: [{ at: [41.2, 35.5], text: "آشور", a: 0.0, b: 0.55, color: "#c9a6f0", size: 80 }], marks: [{ city: "nineveh", a: 0.02, kind: "battle" }, { city: "susa", a: 0.02 }], title: "امپراتوری‌ای که از نقشه پاک شد" },
  M16: { cam0: [51.5, 30.9, 4.2], cam1: [51.8, 30.5, 4.9], regions: [{ id: "elam", a: 0, o: 0.3 }, { id: "fars", a: 0.5, o: 0.3 }], rivers: [{ id: "karun", a: 0 }],
    marks: [{ city: "anshan", a: 0.15, kind: "camp", sub: "شهری ایلامی", dx: -85, dy: -48 }, { city: "persepolis", a: 0.6, dx: 105, dy: 12 }, { city: "susa", a: 0.05 }], title: "شاهِ اَنشان، نه شاهِ پارس" },
  M17: { cam0: [49.0, 32.2, 3.0], cam1: [44.0, 33.0, 1.15], regions: [{ id: "elam", a: 0, o: 0.45 }, { id: "achaem", a: 0.3, o: 0.34 }], rivers: [{ id: "tigris", a: 0 }, { id: "euphrates", a: 0 }],
    labels: [{ at: [50.4, 31.0], text: "ایلام", a: 0.05, color: "#9ee8e4", size: 80 }, { at: [46, 38], text: "امپراتوری هخامنشی", a: 0.55, color: GOLD, size: 70 }], marks: [{ city: "susa", a: 0.1, kind: "camp" }], title: "از دلِ ایلام" },
};

const WIDE = { lon0: 10, lon1: 80, lat0: 10, lat1: 50, f: "v07/terrain/wide.jpg" };
const NEAR = { lon0: 30, lon1: 64, lat0: 24, lat1: 43, f: "v07/terrain/near.jpg" };
const shown = (p: number, a: number, b = 2, f = 0.07) => clamp((p - a) / f) * clamp((b - p) / f);

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
  // two relief images of the same elevation data: wide (whole empire) always, near (Mesopotamia + Iran, sharper) once the view fits inside it
  const halfW = W / 2 / (KX * z), halfH = H / 2 / (K * z);
  const nearOk = cam[0] - halfW >= NEAR.lon0 && cam[0] + halfW <= NEAR.lon1 && cam[1] - halfH >= NEAR.lat0 && cam[1] + halfH <= NEAR.lat1;
  const relief = (T: typeof NEAR) => { const [x, y] = scr([T.lon0, T.lat1]); return <Img src={staticFile(T.f)} style={{ position: "absolute", left: x, top: y, width: (T.lon1 - T.lon0) * KX * z, height: (T.lat1 - T.lat0) * K * z, maxWidth: "none" }} />; };
  return (
    <div style={{ position: "absolute", inset: 0, background: SEA }}>
      {relief(WIDE)}
      {nearOk && relief(NEAR)}
      <div style={{ position: "absolute", inset: 0, background: "rgba(14,10,5,0.16)" }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="landg" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#3a3022" /><stop offset="1" stopColor="#1d1810" /></radialGradient>
          <clipPath id="landclip"><path d={LAND_PATH} /></clipPath>
        </defs>
        <g transform={tf}>
          <path d={NE_PATH} fill="none" stroke={RIVER} strokeWidth={1.5} vectorEffect="non-scaling-stroke" opacity={0.5} strokeLinejoin="round" />
          <g clipPath="url(#landclip)" style={{ mixBlendMode: "normal" }}>
            {(s.regions ?? []).map((r, i) => {
              const o = shown(p, r.a, r.b ?? 2, 0.12) * (r.o ?? 0.4);
              return <g key={i}><path d={regD(r.id)} fill={REGIONS[r.id].color} opacity={o} /><path d={regD(r.id)} fill="none" stroke={REGIONS[r.id].color} strokeWidth={2.4} vectorEffect="non-scaling-stroke" opacity={Math.min(1, o * 2.2)} strokeLinejoin="round" /></g>;
            })}
          </g>
          {(s.rivers ?? []).map((r, i) => (
            <path key={i} d={pathOf(RIVERS[r.id])} fill="none" stroke="#7cc3e6" strokeWidth={3.4} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp((p - r.a) / 0.2)} opacity={0.95} />
          ))}
        </g>
        {/* routes */}
        {(s.routes ?? []).map((r, i) => {
          const q = clamp((p - r.a) / (r.b - r.a));
          if (q <= 0) return null;
          const pts = r.pts.map(scr);
          let len = 0; for (let j = 1; j < pts.length; j++) len += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
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
              {lab && <text x={lab[0]} y={lab[1]} fill={r.color} fontFamily={FONT_TEXT} fontSize={46} textAnchor="middle" direction="rtl" opacity={clamp(q * 3)} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 6 }}>{r.label}</text>}
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
              {kind === "battle" && <g transform={`scale(${pop})`}><circle r={30} fill="#000" opacity={0.55} /><path d="M-15,-15 L15,15 M15,-15 L-15,15" stroke={INK} strokeWidth={5} strokeLinecap="round" /><circle r={30} fill="none" stroke="#e03a2a" strokeWidth={3} /></g>}
              <text x={m.dx ?? 0} y={m.dy ?? -42} fill={INK} fontFamily={FONT_TEXT} fontSize={44} textAnchor="middle" direction="rtl" style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 8 }}>{m.label ?? C[m.city].fa}</text>
              {m.sub && <text x={m.dx ?? 0} y={(m.dy ?? -42) + 86} fill={GOLD} fontFamily={FONT_NUM} fontSize={38} textAnchor="middle" direction="rtl" style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 7 }}>{m.sub}</text>}
            </g>
          );
        })}
        {CONTEXT.filter((c) => z <= c.maxZ && z >= (c.minZ ?? 0)).map((c, i) => {
          const [x, y] = scr(c.at);
          if (x < 120 || x > W - 120 || y < 110 || y > H - 230 || (x > 1250 && y < 300)) return null; // keep clear of the chapter title (top right) and the subtitles (bottom)
          return <text key={i} x={x} y={y} fill={INK} fontFamily={FONT_TEXT} fontSize={36} textAnchor="middle" direction="rtl" opacity={0.62} transform={`rotate(${c.rot ? -c.rot / 3 : 0} ${x} ${y})`} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 6, letterSpacing: 4 }}>{c.text}</text>;
        })}
        {/* region labels */}
        {(s.labels ?? []).map((l, i) => {
          const [x, y] = scr(l.at);
          return <text key={i} x={x} y={y} fill={l.color ?? INK} fontFamily={FONT_NUM} fontSize={l.size ?? 46} textAnchor="middle" direction="rtl" opacity={shown(p, l.a, l.b ?? 2, 0.08)} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 8, letterSpacing: 1 }}>{l.text}</text>;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 900, height: 420, background: "radial-gradient(ellipse at 0% 0%, rgba(0,0,0,0.7), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", inset: 28, border: `1.5px solid ${GOLD}55`, pointerEvents: "none" }} />
      {!bare && s.date && <div style={{ position: "absolute", left: 70, top: 56, direction: "rtl", font: `80px ${FONT_NUM}`, color: GOLD, textShadow: "0 4px 20px #000", opacity: clamp(p / 0.06) }}>{s.date}</div>}
      {!bare && s.title && <div style={{ position: "absolute", left: 72, top: s.date ? 160 : 70, direction: "rtl", font: `42px ${FONT_TEXT}`, color: INK, textShadow: "0 3px 14px #000", opacity: clamp((p - 0.03) / 0.06) }}>{s.title}</div>}
      <div style={{ position: "absolute", left: 70, bottom: 54, direction: "rtl", font: `22px ${FONT_TEXT}`, color: `${INK}99` }}>نقشه‌ی تقریبی · مرزها ساده شده‌اند</div>
    </div>
  );
};
