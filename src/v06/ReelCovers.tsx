// V06 reel covers (series of 3): museum plate (A) and bold poster (B) for each part, in the channel's cover style.
import React from "react";
import { BoldPoster, MuseumPlate } from "../covers";
import { RUG_NAVY } from "../covers/palette";

const P = [
  { n: "۱", title: "اورشلیم", sub: "صلیب مسیح کجا رفت؟ | ۶۱۴ میلادی", hero: "v06/img/03.jpg", pos: "50% 45%", duo: "covers/v06r1-duo.png",
    cap: ["ارتش ایران پشت دیوارهای مقدس‌ترین شهر جهان رسید.", "و دیوار… شکست."], dl: "۶۱۴", ll: "سقوط اورشلیم", dr: "۶۳۰", lr: "بازگشت صلیب",
    c: [["جنگ ایران و روم", "قسمت ۱"], ["صلیب مسیح", "اسیر شد"], ["۶۱۴", "میلادی"]] as [string, string][], big: "اورشلیم", side: [["صلیب مسیح", "به تیسفون رفت!"], ["و روم", "زانو زد"]] as [string, string][] },
  { n: "۲", title: "نامه‌ی مرگ", sub: "در این نامه چه بود؟ | ۶۲۶", hero: "v06/img/N67.jpg", pos: "50% 50%", duo: "covers/v06r2-duo.png",
    cap: ["خسرو نوشت: «او را بکش.»", "نامه به دست دشمن افتاد."], dl: "۶۲۶", ll: "نامه", dr: "۶۲۸", lr: "مرگ خسرو",
    c: [["جنگ ایران و روم", "قسمت ۲"], ["یک نامه", "یک خیانت"], ["۶۲۶", "میلادی"]] as [string, string][], big: "نامه", side: [["سردار نامه را خواند", "و شاه را رها کرد"], ["چه چیزی", "در نامه بود؟"]] as [string, string][] },
  { n: "۳", title: "نینوا", sub: "شاهنشاه فرار کرد؟! | ۶۲۷", hero: "v06/img/13.jpg", pos: "50% 45%", duo: "covers/v06r3-duo.png",
    cap: ["دو فرمانده، وسط برف، رودررو.", "و تیسفون بی‌دفاع ماند."], dl: "۶۲۷", ll: "نبرد نینوا", dr: "۶۲۸", lr: "کودتا",
    c: [["جنگ ایران و روم", "قسمت ۳"], ["رودررو", "در برف"], ["۱۲ دسامبر", "۶۲۷"]] as [string, string][], big: "نینوا", side: [["شبی که", "شاه گریخت"], ["و خطر اصلی", "در کاخ بود"]] as [string, string][] },
];

const M = (i: number): React.FC => () => (
  <MuseumPlate title={P[i].title} subtitle={P[i].sub} hero={P[i].hero} heroPos={P[i].pos} caption={P[i].cap}
    dateLeft={P[i].dl} labelLeft={P[i].ll} dateRight={P[i].dr} labelRight={P[i].lr} signature="تاریخ جاوید" note={`قسمت ${P[i].n} از ۳`} />
);
const B = (i: number): React.FC => () => (
  <BoldPoster cornerLeft={P[i].c[0]} cornerCenter={P[i].c[1]} cornerRight={P[i].c[2]} title={P[i].big} titleSize={i === 1 ? 300 : 340}
    hero={P[i].duo} heroPos={P[i].pos} img={{ left: -700, top: 420, width: 2560, height: 1500 }} tint={RUG_NAVY} issue={`۰${P[i].n}`} year="۶۰۲–۶۲۸"
    sideTop={P[i].side[0]} sideBottom={P[i].side[1]} />
);
export const CoverM1 = M(0), CoverM2 = M(1), CoverM3 = M(2), CoverB1 = B(0), CoverB2 = B(1), CoverB3 = B(2);
