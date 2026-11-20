import fs from "fs";
const vo = JSON.parse(fs.readFileSync("src/v05/vo.json", "utf8"));
const clean = (s) => s.replace(/[‌]/g, "").replace(/[،؛؟!?.,:;«»"'()\-–—…]/g, "").trim();
const L = (n) => { const ws = vo.words.filter((w) => w.line === n); return { start: ws[0].s, end: ws[ws.length - 1].e }; };
const Wd = (n, w, occ = 1) => { const ws = vo.words.filter((x) => x.line === n); const h = ws.filter((x) => clean(x.w) === clean(w)); const l = h.length ? h : ws.filter((x) => clean(x.w).startsWith(clean(w))); return l[occ - 1].s; };
const CUTS = [{ n: 3 }, { n: 4 }, { n: 38, m: 40 }, { n: 47 }, { n: 51 }, { n: 53 }, { n: 57 }, { n: 63 }];
let at = 0.15; const GAP = 0.22;
const cuts = CUTS.map((c) => { const a = L(c.n).start - 0.06, b = L(c.m ?? c.n).end + 0.18; const r = { ...c, a, b, at }; at += b - a + GAP; return r; });
const last = cuts[cuts.length - 1]; const voiceEnd = last.at + (last.b - last.a); const cta = voiceEnd + 0.1; const END = cta + 4.6;
const map = (src) => { const c = cuts.find((c) => src >= c.a && src <= c.b); return c ? src - c.a + c.at : null; };
// voice: the cuts laid on a silent track
const parts = cuts.map((c, i) => `[0:a]atrim=${c.a.toFixed(3)}:${c.b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(c.b - c.a - 0.05).toFixed(3)}:d=0.05,adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)}[v${i}]`);
fs.writeFileSync("out/mix/reel-voice.filter", parts.join(";") + ";" + cuts.map((_, i) => `[v${i}]`).join("") + `amix=inputs=${cuts.length}:normalize=0,apad=whole_dur=${END.toFixed(3)}[out]`);
const sfx = []; const add = (id, t, vol = 0.4) => t != null && sfx.push({ id, at: +t.toFixed(2), vol });
add("sfx/impact/cinematic-heavy", 0.18, 0.55);
add("sfx/glitch/static", 0.2, 0.35);
for (const c of cuts.slice(1)) add("sfx/whoosh/soft-short", c.at, 0.25);
for (const w of [[38, "دوم"], [39, "سوم"], [39, "چهارم"], [39, "پنجم"]]) add("sfx/impact/punchy-short", map(Wd(w[0], w[1])), 0.45);
add("sfx/impact/classic-stamp", map(Wd(53, "هشدار") + 0.1), 0.5);
add("sfx/impact/subdrop-punch", map(Wd(53, "هشدار") + 0.1), 0.4);
add("sfx/impact/cinematic-heavy", cta + 0.05, 0.5);
add("sfx/riser/downlifter-dark", cta + 0.1, 0.35);
const beds = [
  { file: "public/audio/v05-klaxon.wav", from: 0, to: cuts[1].at, vol: 0.22 },
  { id: "sfx/mechanical/clock-tick-tock", from: cuts[1].at, to: cuts[2].at, vol: 0.28 },
  { id: "sfx/body/heartbeat-fast", from: cuts[6].at, to: cta, vol: 0.4 },
];
const music = [{ id: "music/horror/tragedy-waiting-to-happen", at: 0, to: cta + 0.4, gain: 0.22, fadeIn: 0.05, fadeOut: 1.2 }, { id: "music/sad/mixed-signals", at: cta, to: END, gain: 0.3, fadeIn: 0.4, fadeOut: 1.2 }];
fs.writeFileSync("out/mix/reel.json", JSON.stringify({ length: +END.toFixed(3), voice: "out/mix/reel-voice.wav", music, sfx, beds }, null, 1));
console.log("reel", END.toFixed(2), "frames", Math.round(END * 30), cuts.map((c) => c.at.toFixed(2)).join(" "));
