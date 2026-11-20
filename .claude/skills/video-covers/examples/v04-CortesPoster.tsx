// Cortes covers — thin wrappers over the channel cover style in src/covers.
import React from "react";
import { PosterYouTube, BoldPoster } from "../covers";
import { RUG_NAVY } from "../covers/palette";

export const CortesPosterYouTube: React.FC = () => (
  <PosterYouTube
    hero="v04/img/c15.jpg" heroPos="50% 30%"
    relief="v04/img/c04.jpg" reliefPos="50% 40%"
    kicker={["خیانت", "آتش", "فتح"]} badge="مستند"
    small="کشتی‌های" big="کورتس" bigSize={260}
    tagline={["کشتی‌ها را آتش نزد؛ کاری زیرکانه‌تر کرد.", "دروغ بزرگ کتاب‌های انگیزشی"]}
  />
);

// Reel / Shorts cover — "bold poster" template (color-blocked magazine poster, ref: Perspolis poster).
export const CortesPosterReel: React.FC = () => (
  <BoldPoster
    cornerLeft={["فتح", "مکزیک"]}
    cornerCenter={["نماد خیانت", "و زیرکی"]}
    cornerRight={["راهی که", "بسته شد"]}
    title="کورتس" titleSize={250}
    hero="covers/c15-duo.png" cutout="covers/c15-cut-duo.png"
    img={{ left: -365, top: -390, width: 1616, height: 2895 }}
    tint={RUG_NAVY} issue="۰۴" year="۱۵۱۹"
    sideTop={["۵۰۰ سرباز،", "یک قاره‌ی ناشناخته"]}
    sideBottom={["کشتی‌ها را", "آتش نزد"]}
  />
);

// Alt A/B variant — "museum plate" template, same photos.
import { MuseumPlate } from "../covers";
export const CortesPosterReelAlt: React.FC = () => (
  <MuseumPlate
    title="کورتس" subtitle="فاتح مکزیک · ۱۵۱۹ تا ۱۵۲۱"
    hero="v04/img/c15.jpg" heroPos="50% 15%"
    caption={[
      "می‌گن کورتس کشتی‌هاش رو آتیش زد؛ حقیقتش عجیب‌تره.",
      "راه برگشت رو ببند… ولی ابزارت رو نگه دار.",
    ]}
    dateRight="۱۵۱۹" labelRight="ورود"
    dateLeft="۱۵۲۱" labelLeft="فتح"
    signature="تاریخ جاوید" note="پرونده‌ی شماره‌ی ۰۴"
  />
);
