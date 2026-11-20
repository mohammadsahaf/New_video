// Shared vector ornaments for the reel cover templates (palette: ./palette).
import React from "react";
import { RUG_WINE, RUG_TAN, RUG_NAVY, RUG_TEAL, RUG_GREEN, RUG_GOLD } from "./palette";

// Paper / print texture: fine grain + low-frequency stains + burnt edges.
export const PaperTexture: React.FC<{ id: string; grain?: number; stain?: number }> = ({ id, grain = 0.22, stain = 0.28 }) => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    <filter id={`${id}-g`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <filter id={`${id}-s`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="4" seed="8" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.12  0 0 0 0 0.05  0 0 0 -1.6 1.05" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id}-s)`} opacity={stain} style={{ mixBlendMode: "multiply" }} />
    <rect width="100%" height="100%" filter={`url(#${id}-g)`} opacity={grain} style={{ mixBlendMode: "multiply" }} />
  </svg>
);

// Grunge print texture for the bold poster: speckle + scratches.
export const GrungeTexture: React.FC<{ id: string }> = ({ id }) => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    <filter id={`${id}-sp`}>
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="5" />
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 4.4" />
    </filter>
    <filter id={`${id}-sc`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.002 0.35" numOctaves="2" seed="11" />
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -14 6.2" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id}-sp)`} opacity={0.22} />
  </svg>
);

// Square rug medallion icon (8-point star) — replaces the plain diamond.
export const RugMedallion: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <rect x="2" y="2" width="96" height="96" fill={RUG_TAN} stroke={RUG_WINE} strokeWidth="2.5" />
    <rect x="7" y="7" width="86" height="86" fill={RUG_WINE} />
    {Array.from({ length: 16 }).map((_, i) => (
      <rect key={i} x={9 + i * 5.2} y="9" width="2.6" height="2.6" fill={RUG_GOLD} opacity={0.9} />
    ))}
    {Array.from({ length: 16 }).map((_, i) => (
      <rect key={"b" + i} x={9 + i * 5.2} y="88.4" width="2.6" height="2.6" fill={RUG_GOLD} opacity={0.9} />
    ))}
    <rect x="15" y="15" width="70" height="70" fill={RUG_NAVY} />
    <g transform="translate(50 50)">
      <rect x="-24" y="-24" width="48" height="48" fill={RUG_TAN} transform="rotate(45)" />
      <rect x="-24" y="-24" width="48" height="48" fill={RUG_TAN} />
      <rect x="-17" y="-17" width="34" height="34" fill={RUG_WINE} transform="rotate(45)" />
      <rect x="-17" y="-17" width="34" height="34" fill={RUG_WINE} />
      <circle r="10" fill={RUG_GOLD} stroke={RUG_NAVY} strokeWidth="2" />
      <circle r="3.5" fill={RUG_NAVY} />
    </g>
  </svg>
);

// Winged disc with a Sasanian korymbos crown (centre emblem of the date row).
export const WingedCrown: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.62} viewBox="0 0 200 124">
    <g fill={RUG_GOLD} stroke={RUG_WINE} strokeWidth="1.2">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={"l" + i} d={`M86 ${62 + i * 6} C ${60 - i * 6} ${40 + i * 10}, ${26 + i * 4} ${30 + i * 12}, ${6 + i * 12} ${34 + i * 13} C ${34 + i * 6} ${50 + i * 9}, ${62} ${64 + i * 6}, 86 ${70 + i * 6} Z`} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={"r" + i} d={`M114 ${62 + i * 6} C ${140 + i * 6} ${40 + i * 10}, ${174 - i * 4} ${30 + i * 12}, ${194 - i * 12} ${34 + i * 13} C ${166 - i * 6} ${50 + i * 9}, ${138} ${64 + i * 6}, 114 ${70 + i * 6} Z`} />
      ))}
    </g>
    {/* crown body */}
    <path d="M78 104 L80 70 L92 80 L100 64 L108 80 L120 70 L122 104 Z" fill={RUG_WINE} stroke={RUG_GOLD} strokeWidth="2" />
    <rect x="76" y="100" width="48" height="10" fill={RUG_GOLD} />
    {/* korymbos globe */}
    <circle cx="100" cy="38" r="22" fill={RUG_NAVY} stroke={RUG_GOLD} strokeWidth="3" />
    <path d="M82 38 Q100 26 118 38" stroke={RUG_GOLD} strokeWidth="1.6" fill="none" />
    <path d="M100 16 L100 60" stroke={RUG_GOLD} strokeWidth="1.2" opacity={0.6} />
    <path d="M70 62 Q100 48 130 62" stroke={RUG_GOLD} strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

// Repeating rug border band (boteh/rhombus chain), horizontal strip of given width.
export const RugBand: React.FC<{ w: number; h?: number; flip?: boolean }> = ({ w, h = 26 }) => {
  const n = Math.floor(w / h);
  const step = w / n;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect width={w} height={h} fill={RUG_WINE} />
      <rect y={2} width={w} height={1.5} fill={RUG_GOLD} />
      <rect y={h - 3.5} width={w} height={1.5} fill={RUG_GOLD} />
      {Array.from({ length: n }).map((_, i) => {
        const cx = step * i + step / 2;
        return (
          <g key={i} transform={`translate(${cx} ${h / 2})`}>
            <path d={`M0 ${-h * 0.32} L${h * 0.32} 0 L0 ${h * 0.32} L${-h * 0.32} 0 Z`} fill={i % 2 ? RUG_TEAL : RUG_TAN} />
            <circle r={h * 0.09} fill={RUG_GOLD} />
          </g>
        );
      })}
    </svg>
  );
};

// Small flourish divider (line — diamond — line).
export const Flourish: React.FC<{ w: number; color?: string }> = ({ w, color = RUG_WINE }) => (
  <svg width={w} height={22} viewBox={`0 0 ${w} 22`}>
    <path d={`M8 11 H${w / 2 - 28} M${w / 2 + 28} 11 H${w - 8}`} stroke={color} strokeWidth="1.6" />
    <path d={`M${w / 2} 2 L${w / 2 + 9} 11 L${w / 2} 20 L${w / 2 - 9} 11 Z`} fill={color} />
    <circle cx={w / 2 - 18} cy={11} r={3} fill={color} />
    <circle cx={w / 2 + 18} cy={11} r={3} fill={color} />
  </svg>
);

// SVG duotone gradient-map filter (dark -> c1, light -> c2). Reference it with filter: url(#id).
export const DuotoneDefs: React.FC<{ id: string; dark: string; light: string }> = ({ id, dark, light }) => {
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const [d, l] = [hex(dark), hex(light)];
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues={`${d[0]} ${l[0]}`} />
          <feFuncG type="table" tableValues={`${d[1]} ${l[1]}`} />
          <feFuncB type="table" tableValues={`${d[2]} ${l[2]}`} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
};

export { RUG_GREEN };
