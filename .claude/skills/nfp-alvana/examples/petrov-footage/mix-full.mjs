import fs from "fs";
const vo = JSON.parse(fs.readFileSync("src/v05/vo.json", "utf8"));
const clean = (s) => s.replace(/[‌]/g, "").replace(/[،؛؟!?.,:;«»"'()\-–—…]/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک").trim();
const L = (n) => { const ws = vo.words.filter((w) => w.line === n); return { start: ws[0].s, end: ws[ws.length - 1].e }; };
const Wd = (n, w, occ = 1) => { const ws = vo.words.filter((x) => x.line === n); const h = ws.filter((x) => clean(x.w) === clean(w)); const l = h.length ? h : ws.filter((x) => clean(x.w).startsWith(clean(w))); if (!l[occ - 1]) throw new Error(n + " " + w); return l[occ - 1].s; };
const END = vo.total + 1.2;
const music = [
  { id: "music/horror/between-life-and-death", at: 0, to: L(11).start + 0.6, gain: 0.19, fadeIn: 1.5, fadeOut: 1.5 },
  { id: "music/horror/strange-brew", at: L(11).start, to: L(25).start, gain: 0.18, fadeIn: 1.5, fadeOut: 0.8 },
  { id: "music/horror/tragedy-waiting-to-happen", at: L(25).start - 0.2, to: L(43).start, gain: 0.19, fadeIn: 0.2, fadeOut: 0.6 },
  { id: "music/sad/mixed-signals", at: L(61).start - 0.5, to: L(68).start + 0.5, gain: 0.2, fadeIn: 2, fadeOut: 2 },
  { id: "music/intro/beginning-3-v-2", at: L(68).start, to: END, gain: 0.2, fadeIn: 2, fadeOut: 3.5 },
];
const sfx = [];
const add = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(2), vol });
add("sfx/impact/cinematic-heavy", Wd(2, "ناگهان") + 0.1, 0.5);
add("sfx/glitch/static", Wd(2, "ناگهان") + 0.12, 0.35);
add("sfx/impact/distant-boom", L(8).start + 0.3, 0.45);
add("sfx/whoosh/soft-short", Wd(11, "سپتامبر") - 0.05, 0.35);
add("sfx/impact/distant-boom", Wd(13, "هدف"), 0.4);
add("sfx/impact/subdrop-punch", Wd(14, "۲۶۹") - 0.1, 0.45);
add("sfx/whoosh/soft-short", Wd(19, "«استانیسلاو"), 0.3);
add("sfx/impact/cinematic-heavy", L(27).start + 0.1, 0.45);
add("sfx/whoosh/soft-short", Wd(28, "مونتانا") + 0.5, 0.3);
add("sfx/ui/beep-07", L(33).start + 0.3, 0.3);
for (const w of [["38", "دوم"], ["39", "سوم"], ["39", "چهارم"], ["39", "پنجم"]]) add("sfx/impact/punchy-short", Wd(+w[0], w[1]), 0.4);
add("sfx/glitch/static", Wd(40, "نوشته") + 0.3, 0.35);
add("sfx/impact/cinematic-heavy", L(43).start + 0.1, 0.35);
add("sfx/ui/beep-07", L(32).start + 1.3, 0.3);
add("sfx/whoosh/soft-short", L(51).start + 0.1, 0.3);
add("sfx/impact/classic-stamp", Wd(53, "هشدار") + 0.1, 0.5);
add("sfx/impact/subdrop-punch", Wd(53, "هشدار") + 0.1, 0.4);
add("sfx/riser/downlifter-dark", L(60).start + 1.1, 0.35);
add("sfx/impact/classic-stamp", L(66).start + 0.3, 0.5);
add("sfx/impact/cinematic-heavy", Wd(75, "نه", 2), 0.55);
const beds = [
  { file: "public/audio/v05-klaxon.wav", from: L(25).start, to: L(27).start + 0.3, vol: 0.28 },
  { id: "sfx/mechanical/clock-tick-tock", from: L(4).start, to: L(5).start, vol: 0.25 },
  { id: "sfx/body/heartbeat", from: L(49).start, to: L(53).start, vol: 0.4 },
  { id: "sfx/mechanical/clock-tick-tock", from: L(54).start, to: L(58).end, vol: 0.3 },
  { id: "sfx/body/heartbeat-fast", from: L(56).start, to: L(58).end, vol: 0.35 },
];
fs.writeFileSync("out/mix/full.json", JSON.stringify({ length: +END.toFixed(3), voice: "out/vo/full.mp3", music, sfx, beds }, null, 1));
console.log("ok", sfx.length, END.toFixed(2));
