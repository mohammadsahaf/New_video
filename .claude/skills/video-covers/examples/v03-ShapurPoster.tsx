// Shapur covers — thin wrappers over the channel cover style in src/covers.
import React from "react";
import { PosterYouTube, MuseumPlate } from "../covers";

export const ShapurPosterYouTube: React.FC = () => (
  <PosterYouTube
    hero="v03/img/s13.png" heroPos="50% 25%"
    relief="v03/img/s11.png" reliefPos="50% 30%"
    kicker={["تاج", "کودکی", "تاریخ"]} badge="مستند"
    small="شاهی که قبل از تولد" big="شاپور" bigSize={230}
    tagline={["تاج ایران را روی شکم یک زن گذاشتند.", "۷۰ سال سلطنت، از یک پل ساده شروع شد."]}
  />
);

// Reel / Shorts cover — "museum plate" template (framed painting + emblem, ref: Sasanian gallery plate).
export const ShapurPosterReel: React.FC = () => (
  <MuseumPlate
    title="ساسانیان" subtitle="شاپور دوم · شاهنشاه ایران"
    hero="v03/img/s13.png" heroPos="50% 20%"
    caption={[
      "تاج پادشاهی ایران را روی شکم یک زن باردار گذاشتند؛",
      "شاپور دوم، قبل از به‌دنیا آمدن، شاه شد و هفتاد سال حکومت کرد.",
    ]}
    dateRight="۳۰۹" labelRight="تولد"
    dateLeft="۳۷۹" labelLeft="پایان"
    signature="تاریخ جاوید" note="پرونده‌ی شماره‌ی ۰۳"
  />
);

// Alt A/B variant — "bold poster" template, same photos.
import { BoldPoster } from "../covers";
import { RUG_TEAL } from "../covers/palette";
export const ShapurPosterReelAlt: React.FC = () => (
  <BoldPoster
    cornerLeft={["تاج", "کودکی"]}
    cornerCenter={["شاهی که", "ساخته شد"]}
    cornerRight={["۷۰ سال", "پادشاهی"]}
    title="شاپور" titleSize={250}
    hero="covers/s13-duo.png" cutout="covers/s13-cut-duo.png"
    img={{ left: -60, top: 215, width: 1294, height: 2300 }}
    tint={RUG_TEAL} issue="۰۳" year="۳۰۹ م"
    sideTop={["تاج روی شکم", "یک زن باردار"]}
    sideBottom={["شاهی که قبل از", "تولد تاجگذاری کرد"]}
  />
);
