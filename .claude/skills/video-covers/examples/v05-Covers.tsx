// V05 Petrov covers: the channel's cover style (src/covers) + one Cold-War variant built from the video's own alarm
// board, for YouTube's A/B test. Pictures: the 1952 H-bomb test (public domain) and the rotary phone (Pixabay).
import React from "react";
import { AbsoluteFill } from "remotion";
import { BoldPoster, MuseumPlate, PosterYouTube } from "../covers";
import { RUG_NAVY } from "../covers/palette";
import { FONT_BLACK, FONT_NUM, FONT_TEXT } from "../fonts";
import { Img, staticFile } from "remotion";
import { FootageTime } from "../footage/footage";
import { Frame } from "./Petrov";

// A · channel poster: golden fireball on the right, the one word that matters in gold
export const PetrovPosterYouTube: React.FC = () => (
  <PosterYouTube
    hero="v05/img/s08a-3.jpg" heroPos="50% 45%"
    relief="v05/img/s06a-4.jpg" reliefPos="40% 50%"
    kicker={["جنگ سرد", "۱۹۸۳", "یک تصمیم"]} badge="مستند"
    small="مردی که گفت" big="«نه»" bigSize={330}
    tagline={["۵ موشک اتمی روی صفحه", "و کمتر از نیم‌ساعت تا پایان دنیا"]}
  />
);

// B · the alarm board itself: the screen Petrov saw, five lamps lit, one question
const BOARD_T = 222.4; // line 40, just after «حمله‌ی موشکی» lights up
export const PetrovThumbBoard: React.FC = () => (
  <AbsoluteFill style={{ background: "#050404", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -115, top: -175, width: 1920, height: 1080, transform: "scale(1.12)", transformOrigin: "0 0" }}>
      <FootageTime.Provider value={BOARD_T}>
        <Frame t={BOARD_T} preview captions={false} />
      </FootageTime.Provider>
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,4,4,0) 66%, rgba(5,4,4,.9) 80%, #050404 100%)" }} />
    <div style={{ position: "absolute", left: 70, bottom: 70, direction: "rtl", textAlign: "left" }}>
      <div style={{ display: "inline-block", fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 46, color: "#111", background: "#FFC83D", padding: "6px 26px 12px", borderRadius: 10 }}>۲۶ سپتامبر ۱۹۸۳</div>
      <div style={{ fontFamily: FONT_BLACK, fontSize: 190, lineHeight: 1.05, color: "#fff", textShadow: "0 10px 40px rgba(0,0,0,.9)", whiteSpace: "nowrap" }}>
        <span style={{ color: "#ff3b2f" }}>۵</span> موشک اتمی
      </div>
    </div>
  </AbsoluteFill>
);

// Reel / Shorts · bold poster: the mushroom cloud (1952 test) rising in front of the word that stopped it
export const PetrovPosterReel: React.FC = () => (
  <BoldPoster
    cornerLeft={["جنگ سرد", "۱۹۸۳"]}
    cornerCenter={["پنج موشک", "یک تصمیم"]}
    cornerRight={["کمتر از", "نیم‌ساعت"]}
    title="«نه»" titleSize={430}
    hero="covers/p05m-duo.png" cutout="covers/p05m-cut-duo.png"
    img={{ left: -546, top: 175, width: 1933, height: 1300 }}
    tint={RUG_NAVY} issue="۰۵" year="۱۹۸۳"
    sideTop={["مردی که", "دنیا را نجات داد"]}
    sideBottom={["و به‌جای مدال", "تنبیه شد"]}
  />
);

// Reel A/B · museum plate with the fireball
export const PetrovPosterReelAlt: React.FC = () => (
  <MuseumPlate
    title="پتروف" subtitle="شبی که دنیا تا لبه‌ی پایان رفت | ۱۹۸۳"
    hero="v05/img/s08a-3.jpg" heroPos="50% 45%"
    caption={["پنج موشک اتمی روی صفحه، و فقط یک نفر که باید تصمیم می‌گرفت.", "او به سیستم اعتماد نکرد."]}
    dateRight="۱۹۸۳" labelRight="هشدار"
    dateLeft="۱۹۹۸" labelLeft="افشا"
    signature="تاریخ جاوید" note="پرونده‌ی شماره‌ی ۰۵"
  />
);

// Reel / Shorts · high-CTR poster: one number against one man. Everything that must be read sits in the feed's safe
// area (y 270–1250) and inside the 3:4 grid crop; the bottom third only carries the series line and the logo.
const RED = "#ff3b2f", GOLD = "#FFC83D";
export const PetrovReelPoster: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b0303", overflow: "hidden", direction: "rtl" }}>
    {/* the real cloud, red-hot duotone, filling the upper two thirds */}
    <Img src={staticFile("covers/p05m-red.png")} style={{ position: "absolute", left: -560, top: 120, width: 2200, height: 1480, objectFit: "cover", maxWidth: "none" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 45% at 50% 34%, rgba(11,3,3,0) 0%, rgba(11,3,3,.55) 60%, #0b0303 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0b0303 0%, rgba(11,3,3,0) 16%, rgba(11,3,3,0) 40%, rgba(11,3,3,.9) 62%, #0b0303 78%)" }} />
    {/* scan lines, like the bunker screens */}
    <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, rgba(0,0,0,0) 2px 5px)" }} />

    {/* date chip */}
    <div style={{ position: "absolute", top: 290, left: 0, right: 0, textAlign: "center" }}>
      <span style={{ fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 44, color: "#111", background: GOLD, padding: "6px 28px 12px", borderRadius: 10 }}>۲۶ سپتامبر ۱۹۸۳ | نیمه‌شب</span>
    </div>

    {/* the headline: five missiles… */}
    <div style={{ position: "absolute", top: 790, left: 0, right: 0, textAlign: "center", fontFamily: FONT_BLACK, lineHeight: 1, textShadow: "0 12px 50px rgba(0,0,0,.95)" }}>
      <div style={{ fontSize: 172, color: "#fff", whiteSpace: "nowrap" }}><span style={{ color: RED }}>۵</span> موشک اتمی</div>
    </div>
    {/* the five lamps of the alarm board */}
    <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18, direction: "ltr" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ width: 120, height: 78, borderRadius: 10, border: "3px solid #ff6a55", background: "rgba(255,50,34,.9)", boxShadow: "0 0 40px rgba(255,50,34,.8)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "V05Oswald, Oswald, sans-serif", fontWeight: 700, fontSize: 50, color: "#fff" }}>{i}</div>
      ))}
    </div>
    {/* …and one word */}
    <div style={{ position: "absolute", top: 1120, left: 0, right: 0, textAlign: "center", fontFamily: FONT_BLACK, fontSize: 104, lineHeight: 1.1, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,.9)" }}>
      و یک <span style={{ color: GOLD }}>«نه»</span>
    </div>

    {/* below the feed's safe area: grid view and the reel page */}
    <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center", fontFamily: FONT_NUM, fontSize: 64, color: "#f1e3d3" }}>مردی که دنیا را نجات داد</div>
    <div style={{ position: "absolute", top: 1440, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
      <Img src={staticFile("covers/channel-logo.png")} style={{ width: 84, height: 84, borderRadius: 42 }} />
      <span style={{ fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 38, color: GOLD }}>تاریخ جاوید</span>
    </div>
  </AbsoluteFill>
);
