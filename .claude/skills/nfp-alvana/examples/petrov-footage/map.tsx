// V05 · the polar map: the world seen from above the North Pole, the way a missile flies it.
// Montana sits on the left, the USSR on the right, and the shortest way between them goes over the Arctic.
import React from "react";
import landRaw from "../lib/geo/land.json";

const LON0 = -37; // the meridian that points down the screen: North America left, USSR right
const DEG = 9; // px per degree of latitude at scale 1
const rad = (d: number) => (d * Math.PI) / 180;

export type LL = [number, number]; // [lon, lat]
export const proj = ([lon, lat]: LL): [number, number] => {
  const r = (90 - Math.max(lat, -25)) * DEG;
  const a = rad(lon - LON0);
  return [r * Math.sin(a), r * Math.cos(a)];
};

const land = landRaw as { coordinates: number[][][][] };
export const LAND_PATH = land.coordinates
  .map((poly) =>
    poly
      .map((ring) => {
        if (!ring.some((p) => p[1] > -10)) return "";
        return ring.map((p, i) => { const [x, y] = proj([p[0], p[1]]); return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join("") + "Z";
      })
      .join(""),
  )
  .join("");

/** points of the great circle from a to b (n+1 of them) */
export const arc = (a: LL, b: LL, n = 64): [number, number][] => {
  const v = ([lon, lat]: LL) => [Math.cos(rad(lat)) * Math.cos(rad(lon)), Math.cos(rad(lat)) * Math.sin(rad(lon)), Math.sin(rad(lat))];
  const A = v(a), B = v(b);
  const w = Math.acos(Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])));
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ka = Math.sin((1 - t) * w) / Math.sin(w), kb = Math.sin(t * w) / Math.sin(w);
    const p = [ka * A[0] + kb * B[0], ka * A[1] + kb * B[1], ka * A[2] + kb * B[2]];
    out.push(proj([(Math.atan2(p[1], p[0]) * 180) / Math.PI, (Math.asin(p[2]) * 180) / Math.PI]));
  }
  return out;
};

const GREEN = "#5dffb0";
const GRAT = [15, 30, 45, 60, 75];

/** the map itself (land, graticule, a slow radar sweep); children are drawn in map coordinates */
export const PolarMap: React.FC<{ t: number; cx: number; cy: number; scale: number; rot?: number; w?: number; h?: number; children?: React.ReactNode }> = ({ t, cx, cy, scale, rot = 0, w = 1920, h = 1080, children }) => {
  const sweep = (t * 22) % 360;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="v05bg" cx="50%" cy="46%" r="75%">
          <stop offset="0" stopColor="#0a1c18" />
          <stop offset="0.6" stopColor="#05100e" />
          <stop offset="1" stopColor="#010303" />
        </radialGradient>
        <linearGradient id="v05sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={GREEN} stopOpacity="0" />
          <stop offset="1" stopColor={GREEN} stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#v05bg)" />
      <g transform={`translate(${w / 2} ${h / 2}) rotate(${rot}) scale(${scale}) translate(${-cx} ${-cy})`}>
        {GRAT.map((lat) => <circle key={lat} r={(90 - lat) * DEG} fill="none" stroke={GREEN} strokeOpacity={0.1} strokeWidth={1 / scale} />)}
        {Array.from({ length: 12 }, (_, i) => {
          const a = rad(i * 30);
          return <line key={i} x1={0} y1={0} x2={Math.sin(a) * 90 * DEG} y2={Math.cos(a) * 90 * DEG} stroke={GREEN} strokeOpacity={0.07} strokeWidth={1 / scale} />;
        })}
        {/* outline without a stroke (a stroke on this path costs ~1 s a frame on a CPU render): the land in the edge
            colour, nudged a pixel each way, then the land on top */}
        {[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy], i) => <path key={i} d={LAND_PATH} fill="#3aa883" transform={`translate(${(dx * 1.1) / scale} ${(dy * 1.1) / scale})`} />)}
        <path d={LAND_PATH} fill="#0f2e25" />
        <g transform={`rotate(${sweep})`}>
          <path d={`M0 0 L${90 * DEG} 0 A${90 * DEG} ${90 * DEG} 0 0 0 ${Math.cos(rad(-26)) * 90 * DEG} ${Math.sin(rad(-26)) * 90 * DEG} Z`} fill="url(#v05sweep)" />
        </g>
        {children}
      </g>
    </svg>
  );
};

/** a flight path drawn up to `p` (0–1) with a glowing head; `s` = the map scale, so strokes keep their width on screen */
export const Flight: React.FC<{ pts: [number, number][]; p: number; s: number; color?: string; width?: number; head?: boolean; dim?: number; glow?: boolean }> = ({ pts, p, s, color = "#ff4a3d", width = 3, head = true, dim = 1, glow = true }) => {
  if (p <= 0) return null;
  const n = pts.length - 1;
  const f = Math.min(1, p) * n;
  const k = Math.floor(f);
  const seg = pts.slice(0, k + 1);
  const last = pts[Math.min(n, k + 1)], cur = pts[k];
  const hx = cur[0] + (last[0] - cur[0]) * (f - k), hy = cur[1] + (last[1] - cur[1]) * (f - k);
  const d = seg.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("") + `L${hx.toFixed(1)} ${hy.toFixed(1)}`;
  return (
    <g opacity={dim}>
      {glow && <path d={d} fill="none" stroke={color} strokeOpacity={0.28} strokeWidth={(width * 3.2) / s} strokeLinecap="round" />}
      <path d={d} fill="none" stroke={color} strokeWidth={width / s} strokeLinecap="round" />
      {head && p < 1 && (
        <>
          {glow && <circle cx={hx} cy={hy} r={(width * 4.5) / s} fill={color} opacity={0.3} />}
          <circle cx={hx} cy={hy} r={(width * 1.7) / s} fill="#fff" />
        </>
      )}
    </g>
  );
};

/** a place: pulsing ring + dot */
export const Pin: React.FC<{ at: LL; t: number; s: number; color?: string; size?: number }> = ({ at, t, s, color = GREEN, size = 9 }) => {
  const [x, y] = proj(at);
  const pulse = (t * 0.8) % 1;
  return (
    <g>
      <circle cx={x} cy={y} r={(size * (1 + pulse * 3)) / s} fill="none" stroke={color} strokeWidth={2 / s} opacity={1 - pulse} />
      <circle cx={x} cy={y} r={size / s} fill={color} />
      <circle cx={x} cy={y} r={(size * 0.42) / s} fill="#fff" />
    </g>
  );
};

export const PLACES = {
  malmstrom: [-111.19, 47.5] as LL,
  moscow: [37.62, 55.75] as LL,
  serpukhov15: [37.04, 55.07] as LL,
  pole: [0, 90] as LL,
};

export type Cam = { cx: number; cy: number; scale: number; rot?: number };
/** where a place lands on the screen for a camera */
export const screenOf = (at: LL, cam: Cam, w = 1920, h = 1080): [number, number] => {
  const [x, y] = proj(at);
  const dx = (x - cam.cx) * cam.scale, dy = (y - cam.cy) * cam.scale, r = rad(cam.rot ?? 0);
  return [w / 2 + dx * Math.cos(r) - dy * Math.sin(r), h / 2 + dx * Math.sin(r) + dy * Math.cos(r)];
};
/** the rotation that puts north up at this longitude */
export const northUp = (lon: number) => lon - LON0;
/** a route through way-points, as one list of map points */
export const route = (pts: LL[], n = 10): [number, number][] => pts.slice(1).flatMap((b, i) => arc(pts[i], b, n).slice(i ? 1 : 0));
