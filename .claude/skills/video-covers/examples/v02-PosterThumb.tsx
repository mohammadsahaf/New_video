// Cambyses covers — thin wrappers over the channel cover style in src/covers.
import React from "react";
import { PosterYouTube, PosterVertical } from "../covers";
import { PF } from "../styles/photocopy-story";

type P = [number, number];
const pj = (lon: number, lat: number): P => [40 + (lon - 24.5) * 92, 120 + (31.8 - lat) * 92];
const path = (pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"}${pj(...p).join(",")}`).join(" ");
const COAST: P[] = [[24.5, 31.7], [26, 31.5], [28, 31.1], [29.9, 31.2], [31, 31.55], [32.3, 31.25], [33.5, 31.1]];
const NILE: P[] = [[32.9, 23.5], [32.7, 25.0], [32.65, 25.7], [31.8, 26.5], [31.2, 27.2], [30.8, 28.1], [30.9, 29.0], [31.25, 29.9], [30.4, 31.45]];
const CITIES: [string, P][] = [["سیوه", [25.52, 29.2]], ["فرافره", [27.97, 27.06]], ["داخله", [29.0, 25.5]], ["خارگه", [30.55, 25.45]], ["تِبس", [32.65, 25.7]], ["ممفیس", [31.25, 29.85]]];
const ROUTE: P[] = [[32.65, 25.7], [30.55, 25.45], [29.0, 25.5], [27.97, 27.06], [25.52, 29.2]];

const EgyptMap = <>
      <path d={path(COAST)} fill="none" stroke="#c9a65e" strokeWidth={2} />
      <path d={path(NILE)} fill="none" stroke="#c9a65e" strokeWidth={2.5} />
      <path d={path(ROUTE)} fill="none" stroke="#e0b860" strokeWidth={2.5} strokeDasharray="10 8" />
      {CITIES.map(([n, p]) => { const [x, y] = pj(...p); return (<g key={n}><circle cx={x} cy={y} r={5} fill="#e0b860" /><text x={x} y={y - 14} fill="#d9bd7c" fontSize={26} fontFamily={PF.naskh} textAnchor="middle">{n}</text></g>); })}
      <text x={pj(28, 31.4)[0]} y={pj(28, 31.4)[1] - 14} fill="#d9bd7c" fontSize={24} fontFamily={PF.naskh} textAnchor="middle" fontStyle="italic">دریای مدیترانه</text>
      <text x={pj(32.3, 27.5)[0] + 40} y={pj(32.3, 27.5)[1]} fill="#d9bd7c" fontSize={24} fontFamily={PF.naskh} textAnchor="middle">رود نیل</text>
    </>;

export const CambysesPoster: React.FC<{ hero?: string; pos?: string }> = ({ hero = "v02/img/s02.jpg", pos = "50% 40%" }) => (
  <PosterYouTube hero={hero} heroPos={pos} relief="v01/img/s06.jpg" map={EgyptMap} kicker={["صحرا", "راز", "تاریخ"]} badge="مستند"
    small="ارتشِ گمشده‌ی" big="کمبوجیه" tagline={["پنجاه هزار سرباز، یک صحرا.", "رازی که دو هزار و پانصد سال پنهان ماند."]} />
);

export const CambysesPosterReel: React.FC = () => (
  <PosterVertical hero="v02/img/s12.jpg" heroPos="38% 30%" title="کمبوجیه" subtitle="ارتشی که صحرا بلعید"
    poem={["پنجاه هزار سرباز،", "یک صحرای بی‌پایان،", "و رازی که هنوز زیر شن است."]}
    profile="v01/img/s06.jpg" profilePos="78% 40%" tablet="v02/img/s39.jpg" tabletPos="35% 50%"
    panelKicker="قدرت. راز. صحرا." panelTitle="۵۲۴ پیش از میلاد"
    frameLeft="v02/img/s36.jpg" strip="v02/img/s02.jpg" stripPos="30% 60%" />
);

// Reel / Shorts cover in the channel's "museum plate" style (Nov 2026)
import { MuseumPlate } from "../covers";
export const CambysesPosterReelMuseum: React.FC = () => (
  <MuseumPlate
    title="کمبوجیه" subtitle="ارتشی که صحرا بلعید | ۵۲۴ پیش از میلاد"
    hero="v02/img/s06.jpg" heroPos="50% 45%"
    caption={["پنجاه هزار سرباز وارد صحرا شدند و دیگر هیچ‌کس آن‌ها را ندید.", "طوفان شن نبود… پس چه شد؟"]}
    dateRight="۵۲۴" labelRight="ناپدید شدن (پ.م)"
    dateLeft="۲۰۰۹" labelLeft="ادعای کشف"
    signature="تاریخ جاوید" note="پرونده‌ی شماره‌ی ۰۲"
  />
);
