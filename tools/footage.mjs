// Footage for NFP videos: free-licence video clips and photos from 11 sites, picked shot by shot to match the
// narration, downloaded, cut, cleaned and logged with their credits. Claude runs it (FOOTAGE.md has the workflow).
//
//   node tools/footage.mjs sources                                  which sites answer from here, which need a key
//   node tools/footage.mjs search "<english words>" [--kind video|image] [--modern|--archive] [--min 1080] [--src nasa,commons] [--allow free,credit,careful] [--n 18]
//   node tools/footage.mjs plan <NN> [--vo src/vNN/vo.json | --text script.txt] [--horizontal]
//   node tools/footage.mjs find <NN> [shot ids…] [--modern|--archive] [--min px] [--src …] [--n 18] [--allow …]
//   node tools/footage.mjs look <NN> <shot>:<i> [--file k]          timed contact sheet of a video / big view of a photo
//   node tools/footage.mjs get  <NN> <shot>:<i> [--in s] [--out s] [--as name] [--shot sNN] [--file k] [--audio] [--crop auto|none|w:h:x:y]
//   node tools/footage.mjs qc   <NN> [--tame] [--refocus]           brightness, cuts inside a clip, length vs the shot, focus
//   node tools/footage.mjs credits <NN>                             caption / description credit lines
// A reference is <shot>:<i> (a row of cands/<shot>.json) or @<search-slug>:<i> (a row of an ad-hoc search; give it
// --shot sNN so the video knows where it goes). Clips of one shot play in name order: s04a, s04b…
//
// Files: videos/NN/footage/   shots.json, cands/, looks/, cache/ (downloads; never inside public/), CREDITS.md
//        public/vNN/footage/  the cut clips and stills (what Remotion renders)    src/vNN/footage.json  the manifest
// Keys (optional, in .env): PEXELS_API_KEY, PIXABAY_API_KEY, UNSPLASH_ACCESS_KEY, EUROPEANA_API_KEY.
// Network: honours HTTPS_PROXY (set NODE_USE_ENV_PROXY=1 too on your own computer; cloud sessions need nothing).
import "./lib/net.mjs";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CWD = process.cwd();
// the shared search code: tools/lib/ in the kit, the NFP Archive app's src/ in the author's project
const lib = (kit, dev) => [path.join(HERE, "lib", kit), path.join(HERE, "../../apps/nfp-archive/src", dev)].find((p) => fs.existsSync(p));
for (const [k, d] of [["nfp-core.js", "core.js"], ["nfp-sources.js", "sources.js"]]) {
  const f = lib(k, d);
  if (!f) throw new Error(`missing tools/lib/${k}`);
  vm.runInThisContext(fs.readFileSync(f, "utf8"), { filename: f });
}
const { NA, NF } = globalThis;

// ------------------------------------------------------------------ args, env
const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = {}, pos = [];
for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    const [k, v] = a.slice(2).split("=");
    if (v !== undefined) flags[k] = v;
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") && !["audio", "tame", "horizontal", "vertical", "force", "modern", "archive", "refocus"].includes(k)) flags[k] = argv[++i];
    else flags[k] = true;
  } else pos.push(a);
}
// .env keys (only the footage ones; never printed)
try {
  for (const l of fs.readFileSync(path.join(CWD, ".env"), "utf8").split(/\r?\n/)) {
    const m = /^\s*(PEXELS_API_KEY|PIXABAY_API_KEY|UNSPLASH_ACCESS_KEY|EUROPEANA_API_KEY)\s*=\s*"?([^"#\s]+)"?/.exec(l);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}
for (const k of ["PEXELS_API_KEY", "PIXABAY_API_KEY", "UNSPLASH_ACCESS_KEY", "EUROPEANA_API_KEY"]) if (process.env[k]) NF.keys[k] = process.env[k];
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || "";

// ------------------------------------------------------------------ helpers
const die = (m) => { console.error("✗ " + m); process.exit(1); };
const rd = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const wr = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, typeof o === "string" ? o : JSON.stringify(o, null, 1)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "q";
const ascii = (s) => String(s || "").normalize("NFKD").replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ").trim();
const fmtT = (s) => { s = Math.round(s || 0); return s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : ""; };
const mb = (b) => (b ? (b / 1048576).toFixed(b > 104857600 ? 0 : 1) + " MB" : "");
const rel = (p) => path.relative(CWD, p).replace(/\\/g, "/");
const TAG = { free: "FREE", credit: "CC-BY", careful: "CHECK", blocked: "NO" };
const SRC3 = { archive: "ARCHIVE", commons: "COMMONS", nasa: "NASA", coverr: "COVERR", mixkit: "MIXKIT", cleveland: "CLEVELAND", wellcome: "WELLCOME", europeana: "EUROPEANA", pexels: "PEXELS", pixabay: "PIXABAY", unsplash: "UNSPLASH" };
const allowOf = () => String(flags.allow || "free,credit").split(",").map((s) => s.trim()).filter(Boolean);
const srcOf = () => (flags.src ? String(flags.src).split(",").map((s) => s.trim()).filter(Boolean) : null);

function vid(nn) {
  if (!nn) die("which video? e.g. node tools/footage.mjs find 07");
  const n = String(nn).replace(/^v/i, "");
  const id = /^\d$/.test(n) ? "0" + n : n;
  const pub = path.resolve(CWD, flags.public || "public");
  return {
    id, work: path.join(CWD, "videos", id, "footage"), pub: path.join(pub, `v${id}`, "footage"), pubRoot: pub,
    manifest: path.join(CWD, "src", `v${id}`, "footage.json"), src: path.join(CWD, "src", `v${id}`),
  };
}

// ------------------------------------------------------------------ ffmpeg
const FF = process.env.FFMPEG || "ffmpeg", FP = process.env.FFPROBE || "ffprobe";
function haveFf() { return spawnSync(FF, ["-version"], { encoding: "utf8" }).status === 0; }
let drawtext = null;
function canDraw() {
  if (drawtext === null) drawtext = /drawtext/.test(spawnSync(FF, ["-hide_banner", "-filters"], { encoding: "utf8" }).stdout || "");
  return drawtext;
}
// a font the labels can use: the kit's own (relative path: no drive-letter escaping), else the system's
const FONT = [path.join(CWD, "public/fonts/VazirCode.ttf"), "C:/Windows/Fonts/consola.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", "/System/Library/Fonts/Menlo.ttc", "/Library/Fonts/Arial.ttf"].find((p) => fs.existsSync(p));
const fxPath = (p) => { const r = path.relative(CWD, p); const q = !r.startsWith("..") && !path.isAbsolute(r) ? r : p; return q.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'"); };
const ff = (args, opt = {}) => {
  const r = spawnSync(FF, ["-hide_banner", "-nostdin", "-y", "-v", "error", ...args], { encoding: "utf8", maxBuffer: 1 << 26, env: PROXY ? { ...process.env, http_proxy: PROXY } : process.env, ...opt });
  if (r.status !== 0) throw new Error((r.stderr || "ffmpeg failed").trim().split(/\r?\n/).slice(-2).join(" | ").slice(0, 400));
  return r;
};
function probe(f) {
  const r = spawnSync(FP, ["-v", "error", ...(/^https?:/.test(f) ? ["-user_agent", NF.UA] : []), "-show_entries", "stream=codec_type,width,height,r_frame_rate,sample_aspect_ratio,field_order:format=duration,start_time", "-of", "json", f], { encoding: "utf8", maxBuffer: 1 << 24, env: PROXY ? { ...process.env, http_proxy: PROXY } : process.env });
  if (r.status !== 0) throw new Error("ffprobe: " + (r.stderr || "").trim().slice(0, 200));
  const j = JSON.parse(r.stdout);
  const v = (j.streams || []).find((s) => s.codec_type === "video") || {};
  const fr = String(v.r_frame_rate || "0/1").split("/").map(Number);
  return { w: v.width || 0, h: v.height || 0, fps: fr[1] ? fr[0] / fr[1] : 0, sar: v.sample_aspect_ratio, field: v.field_order, dur: Number(j.format?.duration) || 0, start: Number(j.format?.start_time) || 0, audio: (j.streams || []).some((s) => s.codec_type === "audio") };
}

// Where the interest sits in a clip or photo — what moves first, then objects that stand out — so cropping horizontal
// footage for a vertical reel keeps the subject. x = centre of the best 9:16 window, y = centre of the best 16:9
// window (0–1). Objects = a small blur against a wide one (fine texture like grass or gravel cancels out); a camera pan
// moves everything, so only motion above the frame's typical change counts; flat pictures stay centred.
function focusOf(file, w, h, still = false) {
  if (!w || !h) return null;
  const GW = 96, GH = Math.max(8, Math.round((96 * h) / w));
  const r = spawnSync(FF, ["-hide_banner", "-v", "error", "-i", file, "-vf", `${still ? "" : "fps=6,"}scale=${GW}:${GH},format=gray`, ...(still ? ["-frames:v", "1"] : []), "-f", "rawvideo", "-"], { maxBuffer: 1 << 28 });
  const buf = r.stdout;
  if (r.status !== 0 || !buf || !buf.length) return null;
  const N = GW * GH, n = Math.floor(buf.length / N);
  const E = new Float64Array(N);
  const diff = new Float64Array(N);
  const I = new Float64Array((GW + 1) * (GH + 1));
  const box = (src, rad) => {
    for (let y = 0; y < GH; y++) {
      let row = 0;
      for (let x = 0; x < GW; x++) { row += src[y * GW + x]; I[(y + 1) * (GW + 1) + x + 1] = I[y * (GW + 1) + x + 1] + row; }
    }
    const o = new Float64Array(N);
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const x0 = Math.max(0, x - rad), x1 = Math.min(GW, x + rad + 1), y0 = Math.max(0, y - rad), y1 = Math.min(GH, y + rad + 1);
      o[y * GW + x] = (I[y1 * (GW + 1) + x1] - I[y0 * (GW + 1) + x1] - I[y1 * (GW + 1) + x0] + I[y0 * (GW + 1) + x0]) / ((x1 - x0) * (y1 - y0));
    }
    return o;
  };
  let prev = null, moved = 0;
  for (let t = 0; t < n; t++) {
    const fr = buf.subarray(t * N, (t + 1) * N);
    let sd = 0;
    const near = box(fr, 1), wide = box(fr, 9);
    const D = new Float64Array(N);
    for (let i = 0; i < N; i++) { D[i] = Math.abs(near[i] - wide[i]); sd += D[i]; }
    // and big shapes that differ from the picture's main tone (a person on a plain wall, a rocket against the sky)
    const tone = Float64Array.from(wide).sort()[N >> 1];
    let sg = 0;
    const G = new Float64Array(N);
    for (let i = 0; i < N; i++) { G[i] = Math.abs(wide[i] - tone); sg += G[i]; }
    let sm = 0;
    if (prev) {
      for (let i = 0; i < N; i++) diff[i] = Math.abs(fr[i] - prev[i]);
      const med = Float64Array.from(diff).sort()[N >> 1];
      for (let i = 0; i < N; i++) { diff[i] = Math.max(0, diff[i] - med - 3); sm += diff[i]; }
    }
    const motion = prev && sm > N * 0.05;
    if (motion) moved++;
    for (let i = 0; i < N; i++) E[i] += (sd ? (0.6 * D[i]) / sd : 0) + (sg ? G[i] / sg : 0) + (motion ? (3 * diff[i]) / sm : 0);
    prev = fr;
  }
  const cols = new Float64Array(GW), rows = new Float64Array(GH);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { cols[x] += E[y * GW + x]; rows[y] += E[y * GW + x]; }
  // the window with the most interest; a pull towards the middle (heads and horizons sit a little above it)
  const best = (prof, frac, mid) => {
    const L = prof.length, win = Math.round(L * frac);
    if (frac >= 0.97 || win < 2) return null; // nothing to crop on this axis
    let top = -1, at = 0.5;
    for (let a = 0; a + win <= L; a++) {
      let sum = 0;
      for (let i = a; i < a + win; i++) sum += prof[i];
      const c = (a + win / 2) / L;
      const score = sum * (1 - 0.5 * Math.abs(c - mid));
      if (score > top) { top = score; at = c; }
    }
    return +at.toFixed(3);
  };
  // what moves is a sure sign; without movement the guess is only half trusted (a busy shelf is not the subject)
  const trust = moved >= Math.max(2, n * 0.3) ? 1 : 0.5;
  const fx = best(cols, Math.min(1, 9 / 16 / (w / h)), 0.5), fy = best(rows, Math.min(1, w / h / (16 / 9)), 0.42);
  return [fx == null ? 0.5 : +(0.5 + (fx - 0.5) * trust).toFixed(3), fy == null ? 0.5 : +(0.42 + (fy - 0.42) * trust).toFixed(3)];
}

// ------------------------------------------------------------------ download
// Resumable (<file>.part + .part.json); big files that allow ranges come down in several parts at once.
async function download(url, file, { headers = {}, conns = 6, quiet = false } = {}) {
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return file;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const H = { "User-Agent": NF.UA, ...headers };
  let size = 0, ranges = false, final = url;
  try {
    const r = await fetch(url, { headers: { ...H, Range: "bytes=0-0" }, signal: AbortSignal.timeout(30000) });
    final = r.url || url;
    if (r.status === 206) { ranges = true; size = Number((r.headers.get("content-range") || "").split("/")[1]) || 0; }
    else if (r.ok) size = Number(r.headers.get("content-length")) || 0;
    else throw Object.assign(new Error("HTTP " + r.status), { status: r.status });
    try { await r.body?.cancel(); } catch {}
  } catch (e) {
    if (e.status) throw e;
  }
  const part = file + ".part", stF = file + ".part.json";
  const t0 = Date.now();
  let shown = 0;
  const show = (done) => {
    if (quiet || Date.now() - shown < 4000) return;
    shown = Date.now();
    const s = (Date.now() - t0) / 1000;
    console.log(`    ${mb(done)}${size ? " / " + mb(size) : ""}  ${(done / 1048576 / Math.max(1, s)).toFixed(1)} MB/s`);
  };
  if (ranges && size > 16 << 20) {
    let segs = rd(stF, null);
    if (!segs || segs.size !== size || !fs.existsSync(part)) {
      const n = Math.max(2, Math.min(conns, Math.ceil(size / (8 << 20))));
      const step = Math.ceil(size / n);
      segs = { size, list: Array.from({ length: n }, (_, i) => ({ a: i * step, b: Math.min(size - 1, (i + 1) * step - 1), p: i * step })) };
      fs.writeFileSync(part, "");
    }
    const fh = await fsp.open(part, "r+");
    let done = segs.list.reduce((s, x) => s + (x.p - x.a), 0);
    const tick = setInterval(() => { try { fs.writeFileSync(stF, JSON.stringify(segs)); } catch {} show(done); }, 1000);
    try {
      await Promise.all(segs.list.map(async (s) => {
        for (let tries = 0; s.p <= s.b; ) {
          try {
            const r = await fetch(final, { headers: { ...H, Range: `bytes=${s.p}-${s.b}` }, signal: AbortSignal.timeout(120000) });
            if (r.status !== 206) throw new Error("HTTP " + r.status);
            for await (const chunk of r.body) {
              const room = s.b - s.p + 1;
              if (room <= 0) break;
              const buf = chunk.length > room ? chunk.subarray(0, room) : chunk;
              await fh.write(buf, 0, buf.length, s.p);
              s.p += buf.length;
              done += buf.length;
              tries = 0;
            }
          } catch (e) {
            if (++tries > 8) throw e;
            await sleep(800 * tries);
          }
        }
      }));
    } finally {
      clearInterval(tick);
      await fh.close();
      try { fs.writeFileSync(stF, JSON.stringify(segs)); } catch {}
    }
  } else {
    for (let tries = 0; ; ) {
      const have = fs.existsSync(part) ? fs.statSync(part).size : 0;
      try {
        const r = await fetch(final, { headers: have && ranges ? { ...H, Range: `bytes=${have}-` } : H, signal: AbortSignal.timeout(300000) });
        if (!r.ok) throw Object.assign(new Error("HTTP " + r.status), { status: r.status });
        const append = r.status === 206;
        const out = fs.createWriteStream(part, { flags: append ? "a" : "w" });
        let done = append ? have : 0;
        for await (const chunk of r.body) { out.write(chunk); done += chunk.length; show(done); }
        await new Promise((res) => out.end(res));
        break;
      } catch (e) {
        if (e.status && e.status < 500 && e.status !== 429) throw e;
        if (++tries > 6) throw e;
        await sleep(1000 * tries);
      }
    }
  }
  fs.renameSync(part, file);
  fs.rmSync(stF, { force: true });
  return file;
}

// ------------------------------------------------------------------ candidates
function candFile(V, ref) {
  if (ref.startsWith("@")) {
    const [s, i] = ref.slice(1).split(":");
    return { file: path.join(CWD, "videos", "_search", `${s}.json`), i: Number(i), shot: s };
  }
  const [s, i] = ref.split(":");
  if (i === undefined) die(`a reference looks like s03:2 (row 2 of cands/s03.json), got "${ref}"`);
  return { file: path.join(V.work, "cands", `${s}.json`), i: Number(i), shot: s };
}
function loadCand(V, ref) {
  const c = candFile(V, ref);
  const list = rd(c.file, null);
  if (!list) die(`no ${rel(c.file)} — run find first`);
  const it = list.items[c.i];
  if (!it) die(`${ref}: no row ${c.i} (0–${list.items.length - 1})`);
  return { it, c, list };
}
async function withDetails(it) {
  if ((it.source === "archive" || it.source === "nasa") && !it.files.length) await NF.details(it);
  return it;
}
// rows → numbered grid image, one 320×180 tile per row with source · licence · size · length on it
async function grid(items, out, cache) {
  if (!haveFf()) { console.log("  (ffmpeg missing: no contact sheet)"); return; }
  const tdir = path.join(cache, "tiles", path.basename(out, ".jpg"));
  fs.rmSync(tdir, { recursive: true, force: true });
  fs.mkdirSync(tdir, { recursive: true });
  const thumbs = path.join(cache, "thumbs");
  fs.mkdirSync(thumbs, { recursive: true });
  const jobs = items.map((it, i) => async () => {
    const tf = path.join(thumbs, `${it.source}-${slug(it.id)}.img`);
    let ok = false;
    if (it.thumb) {
      try { await download(it.thumb, tf, { quiet: true }); ok = true; } catch {}
    }
    const tile = path.join(tdir, `${String(i).padStart(3, "0")}.jpg`);
    const l1 = path.join(tdir, `${i}.a.txt`), l2 = path.join(tdir, `${i}.b.txt`);
    const res = it.w && it.h ? `${Math.min(it.w, it.h) >= 2000 ? "4K" : Math.min(it.w, it.h) >= 1000 ? "1080" : Math.min(it.w, it.h) >= 700 ? "720" : Math.min(it.w, it.h) + "p"}` : "";
    fs.writeFileSync(l1, `${i}  ${SRC3[it.source] || it.source}  ${TAG[it.licence.verdict]}  ${res}${it.w && it.h && it.h > it.w ? " vert" : ""}  ${it.kind === "video" ? fmtT(it.dur) : "img"}`);
    fs.writeFileSync(l2, ascii(it.title).slice(0, 44) || "-");
    const font = FONT && canDraw() ? `fontfile='${fxPath(FONT)}':` : "";
    const lab = canDraw() && FONT
      ? `,drawbox=y=0:w=iw:h=24:color=black@0.72:t=fill,drawtext=${font}textfile='${fxPath(l1)}':x=6:y=5:fontsize=15:fontcolor=white,drawbox=y=ih-22:w=iw:h=22:color=black@0.6:t=fill,drawtext=${font}textfile='${fxPath(l2)}':x=6:y=h-18:fontsize=13:fontcolor=0xdddddd`
      : "";
    // every tile in one pixel format: a mixed sequence (PNG thumbs make 4:4:4 JPEGs) restarts the tile filter mid-way
    const base = "scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2:color=0x141414";
    try {
      if (!ok) throw new Error("no thumb");
      ff(["-i", tf, "-vf", base + lab + ",format=yuvj420p", "-frames:v", "1", "-q:v", "4", tile]);
    } catch {
      ff(["-f", "lavfi", "-i", "color=c=0x141414:s=320x180", "-vf", "null" + lab + ",format=yuvj420p", "-frames:v", "1", "-q:v", "4", tile]);
    }
  });
  for (let k = 0; k < jobs.length; k += 6) await Promise.all(jobs.slice(k, k + 6).map((f) => f()));
  const cols = 6, rows = Math.ceil(items.length / cols);
  ff(["-framerate", "1", "-start_number", "0", "-i", path.join(tdir, "%03d.jpg"), "-vf", `tile=${cols}x${rows}:padding=4:margin=4:color=0x202020`, "-frames:v", "1", "-q:v", "3", out]);
  fs.rmSync(tdir, { recursive: true, force: true });
}
const line = (it, i) => `${String(i).padStart(2)} ${(SRC3[it.source] || it.source).padEnd(9)} ${TAG[it.licence.verdict].padEnd(5)} ${(it.w ? `${it.w}x${it.h}` : "").padEnd(9)} ${(it.kind === "video" ? fmtT(it.dur) : "img").padEnd(5)} ${it.title.slice(0, 70)}${it.notes && it.notes.length ? "  ⚠ " + it.notes[0].slice(0, 140) : ""}`;
// nothing free: say so (and how to see what was held back) instead of printing nothing
const EMPTY = "  nothing free for this. Try other words or another source, or --allow free,credit,careful to see what needs checking (read each ⚠ note: match and TV footage, re-uploads and «all rights reserved» are never used).";

// ---- relevance. Stock sites always answer something ("1950s crowd" → a rave); archives answer nothing to long
// queries. So: every query is tried shorter when a site has little (era words off, then the last word off), each row
// is scored by how many of the query's words its title / description / tags carry, and when the query names an era
// the modern stock sites are pushed down.
const STOP = new Set("a an the of in on at to for from with and or by into over under near about as is are be was were this that these those its his her their".split(" "));
const ERA = /^(1[5-9]\d\d|20[0-2]\d|1[5-9]\d0s|\d0s|old|vintage|historic|historical|archive|archival|antique|retro|ancient|century|wwi|wwii|ww1|ww2|newsreel|colonial|medieval)$/;
const MODERN = new Set(["coverr", "mixkit", "pexels", "pixabay", "unsplash"]);
const qwords = (q) => q.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const isEra = (q) => qwords(q).some((w) => ERA.test(w));
function relax(q) {
  const out = [q.trim()];
  let ws = q.trim().split(/\s+/);
  const noEra = ws.filter((w) => !ERA.test(w.toLowerCase()));
  if (noEra.length && noEra.length < ws.length) { ws = noEra; out.push(ws.join(" ")); }
  while (ws.length > 2) { ws = ws.slice(0, -1); out.push(ws.join(" ")); }
  return [...new Set(out)];
}
// look: "modern" = today's colour footage and photos (stock sites first, HD and up), "archive" = old film and
// historical pictures, "any" = both, ranked by the words.
const LOOKS = {
  modern: { sources: ["coverr", "mixkit", "pexels", "pixabay", "unsplash", "nasa", "commons"], min: 1080 },
  archive: { sources: ["archive", "commons", "nasa", "europeana", "wellcome", "cleveland"], min: 0 },
};
function score(it, q, look) {
  const ws = qwords(q).filter((w) => !/^\d/.test(w) && !ERA.test(w));
  const hay = `${it.title} ${it.desc} ${it.tags || ""}`.toLowerCase();
  const hit = ws.length ? ws.filter((w) => hay.includes(w.replace(/(ies|es|s)$/, (m) => (m === "ies" ? "y" : "")))).length / ws.length : 1;
  const old = look === "archive" || (look !== "modern" && isEra(q));
  return hit - (old && MODERN.has(it.source) ? 0.6 : 0) + (look === "modern" && MODERN.has(it.source) ? 0.25 : 0);
}
async function searchQuery(q, { kind, sources, per, allow, look }, errs) {
  const pool = sources || (LOOKS[look] && LOOKS[look].sources) || Object.keys(NF.SOURCES);
  const ids = pool.filter((id) => NF.enabled(id) && (!kind || NF.SOURCES[id].kinds.includes(kind)));
  const got = new Map(ids.map((id) => [id, []]));
  for (const v of relax(q)) {
    const need = ids.filter((id) => got.get(id).length < 3);
    if (!need.length) break;
    const r = await NF.searchAll(v, { kind, sources: need, per, allow });
    Object.assign(errs, r.errors);
    for (const it of r.items) if (!got.get(it.source).some((x) => x.id === it.id)) got.get(it.source).push(Object.assign(it, { q: v }));
  }
  return [...got.values()].flat().map((it) => ({ it, s: score(it, q, look) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.it);
}
// queries → rows: each query's best first, round-robin over the queries, no site over ~half the sheet;
// details (real size and length) for archive.org and NASA videos; then the size floor (--min, or 1080 for modern)
async function gather(queries, { kind, n = 18, look = "any", min }) {
  const allow = allowOf(), sources = srcOf();
  const floor = Number(min ?? flags.min ?? (LOOKS[look] ? LOOKS[look].min : 0)) || 0;
  const per = Math.max(4, Math.ceil((n * 1.5) / Math.max(1, queries.length) / 3));
  const errs = {};
  const lists = [];
  for (const q of queries) lists.push(await searchQuery(q, { kind, sources, per, allow, look }, errs));
  const seen = new Set(), out = [], bySrc = {};
  const cap = Math.max(4, Math.ceil(n * 0.5));
  for (let i = 0; out.length < n && lists.some((l) => i < l.length); i++)
    for (const l of lists) {
      const it = l[i];
      if (!it || out.length >= n) continue;
      const k = `${it.source}:${it.id}`;
      if (seen.has(k) || (bySrc[it.source] || 0) >= cap) continue;
      seen.add(k);
      bySrc[it.source] = (bySrc[it.source] || 0) + 1;
      out.push(it);
    }
  const need = out.filter((it) => it.kind === "video" && (it.source === "archive" || it.source === "nasa"));
  for (let k = 0; k < need.length; k += 4) await Promise.all(need.slice(k, k + 4).map((it) => withDetails(it).catch(() => {})));
  // a row whose size is known and too small goes; unknown sizes (Mixkit, some museums) stay
  const big = floor ? out.filter((it) => !(it.w && it.h) || Math.min(it.w, it.h) >= floor) : out;
  return { items: big, errors: errs };
}

// ------------------------------------------------------------------ commands
async function cmdSources() {
  console.log("source      kinds        key / reach");
  const tests = { archive: "apollo", commons: "apollo", nasa: "apollo", coverr: "ocean", mixkit: "ocean", cleveland: "ship", wellcome: "ship", europeana: "ship", pexels: "ocean", pixabay: "ocean", unsplash: "ocean" };
  await Promise.all(Object.entries(NF.SOURCES).map(async ([id, s]) => {
    let st;
    if (s.key && !s.optionalKey && !NF.keys[s.key]) st = `off: put ${s.key}=… in .env (free key at ${s.home})`;
    else {
      const t0 = Date.now();
      const r = await NF.search(id, tests[id], { kind: s.kinds[0], per: 3 });
      st = r.error ? `✗ ${r.error}` : `✓ ${r.items.length} results in ${((Date.now() - t0) / 1000).toFixed(1)} s${s.key && !NF.keys[s.key] ? ` (demo key; your own ${s.key} is better)` : ""}`;
    }
    s._st = st;
  }));
  for (const [id, s] of Object.entries(NF.SOURCES)) console.log(`${id.padEnd(11)} ${s.kinds.join("+").padEnd(12)} ${s._st}`);
  console.log(`ffmpeg: ${haveFf() ? "✓" : "✗ missing"}${haveFf() && !canDraw() ? " (no drawtext: contact sheets without labels)" : ""} · proxy: ${PROXY ? "on" : "none"}`);
}

async function cmdSearch() {
  const q = pos.join(" ").trim();
  if (!q) die('search "<english words>"');
  const kind = flags.kind === "image" ? "image" : flags.kind === "any" ? undefined : "video";
  const n = Number(flags.n) || 18;
  const look = flags.modern ? "modern" : flags.archive ? "archive" : "any";
  const { items, errors } = await gather([q], { kind, n, look });
  const dir = path.join(CWD, "videos", "_search");
  const s = slug(q) + (kind ? "-" + kind : "");
  wr(path.join(dir, `${s}.json`), { q, kind, items });
  items.forEach((it, i) => console.log(line(it, i)));
  for (const [k, e] of Object.entries(errors)) console.log(`  (${k}: ${e})`);
  if (!items.length) console.log(EMPTY);
  if (items.length) { await grid(items, path.join(dir, `${s}.jpg`), path.join(dir, "cache")); console.log(`sheet: ${rel(path.join(dir, s + ".jpg"))} · refs @${s}:<i>`); }
}

function cmdPlan() {
  const V = vid(pos[0]);
  const f = path.join(V.work, "shots.json");
  if (fs.existsSync(f) && !flags.force) die(`${rel(f)} exists (edit it, or --force to start over)`);
  let rows = [];
  const voPath = flags.vo ? path.resolve(CWD, flags.vo) : [path.join(V.src, "vo.json"), path.join(V.src, "words.json")].find((p) => fs.existsSync(p));
  if (flags.text) {
    rows = fs.readFileSync(path.resolve(CWD, flags.text), "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean).map((text, i) => ({ line: i + 1, text, t0: null, t1: null }));
  } else if (voPath) {
    const vo = rd(voPath, null);
    if (vo && vo.segs && vo.words) {
      rows = vo.segs.map((s) => ({ line: s.n, text: vo.words.filter((w) => w.line === s.n).map((w) => w.w).join(" "), t0: s.start, t1: s.end }));
    } else if (Array.isArray(vo) && vo.length && "si" in vo[0]) {
      const by = new Map();
      for (const w of vo) { if (!by.has(w.si)) by.set(w.si, []); by.get(w.si).push(w); }
      rows = [...by.entries()].map(([si, ws]) => ({ line: si + 1, text: ws.map((w) => w.w).join(" "), t0: ws[0].s, t1: ws[ws.length - 1].e }));
    } else die(`can't read ${rel(voPath)} (expected vo.json from doc-build-vo or words.json from eleven-align)`);
  } else die("no narration: give --vo <vo.json|words.json> or --text <one sentence per line>");
  const shots = rows.map((r, i) => {
    const dur = r.t0 != null ? +(r.t1 - r.t0).toFixed(2) : null;
    return { id: `s${String(i + 1).padStart(2, "0")}`, line: r.line, text: r.text, t0: r.t0, t1: r.t1, dur, clips: dur ? Math.max(1, Math.round(dur / 4.5)) : 1, kind: "video", look: "any", need: "", queries: [], avoid: "", picks: [] };
  });
  wr(f, { video: V.id, orient: flags.horizontal ? "horizontal" : "vertical", note: "For each shot write need (what must literally be on screen for this sentence), 2-4 English queries (concrete first, then broader), kind (video|image), look (modern = today's colour HD footage, archive = old film and historical pictures, any), min (shortest side in px, optional) and avoid. Then: footage find <NN>.", shots });
  console.log(`${rel(f)}: ${shots.length} shots`);
  for (const s of shots) console.log(`${s.id} ${s.t0 != null ? `${s.t0.toFixed(1)}–${s.t1.toFixed(1)}s ×${s.clips}` : ""}  ${s.text.slice(0, 90)}`);
}

async function cmdFind() {
  const V = vid(pos[0]);
  const plan = rd(path.join(V.work, "shots.json"), null);
  if (!plan) die(`no ${rel(path.join(V.work, "shots.json"))} — run plan first`);
  const want = pos.slice(1);
  const n = Number(flags.n) || 18;
  for (const s of plan.shots) {
    if (want.length && !want.includes(s.id)) continue;
    if (!s.queries || !s.queries.length) { console.log(`${s.id}: no queries yet (write them in shots.json)`); continue; }
    const kind = s.kind === "image" ? "image" : s.kind === "any" ? undefined : "video";
    const saved = flags.src;
    if (s.src && s.src.length && !flags.src) flags.src = s.src.join(",");
    const look = flags.modern ? "modern" : flags.archive ? "archive" : s.look || "any";
    const { items, errors } = await gather(s.queries, { kind, n, look, min: s.min });
    flags.src = saved;
    const f = path.join(V.work, "cands", `${s.id}.json`);
    wr(f, { shot: s.id, text: s.text, need: s.need, queries: s.queries, kind, items });
    console.log(`\n${s.id}  ${s.need || s.text.slice(0, 80)}  (${items.length})`);
    items.forEach((it, i) => console.log("  " + line(it, i)));
    if (!items.length) console.log(EMPTY);
    for (const [k, e] of Object.entries(errors)) console.log(`  (${k}: ${e})`);
    if (items.length) { await grid(items, f.replace(/\.json$/, ".jpg"), path.join(V.work, "cache")); console.log(`  sheet: ${rel(f.replace(/\.json$/, ".jpg"))}`); }
  }
}

// archive.org: its own frames (no download); other sites: the small preview, sampled with time stamps
async function cmdLook() {
  const V = vid(pos[0]);
  const ref = pos[1] || die("look <NN> <shot>:<i>");
  const { it, c } = loadCand(V, ref);
  await withDetails(it);
  const out = path.join(V.work, "looks", `${ref.replace(/[@:]/g, "_")}${flags.file ? "_f" + flags.file : ""}.jpg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const cache = path.join(V.work, "cache");
  console.log(`${it.title}\n${it.page}\n${it.licence.name} (${it.licence.verdict})${it.author ? " · " + it.author : ""}${it.notes.length ? "\n⚠ " + it.notes.join(" · ") : ""}`);
  if (it.desc) console.log(it.desc.slice(0, 300));
  if (it.kind === "image") {
    const src = it.preview || (it.files[0] || {}).url;
    const tmp = path.join(cache, "look", `${it.source}-${slug(it.id)}.img`);
    await download(src, tmp, { quiet: true });
    ff(["-i", tmp, "-vf", "scale='min(1600,iw)':-2", "-frames:v", "1", "-q:v", "3", out]);
    console.log(`view: ${rel(out)}  (full size ${it.w || "?"}×${it.h || "?"})`);
    return;
  }
  const k = Number(flags.file) || 0;
  const file = it.files[k] || it.files[0] || {};
  if (it.files.length > 1 && it.source === "archive") console.log(`clips in this item: ${it.files.map((f, j) => `${j}=${f.name} ${fmtT(f.dur)}`).join(" · ")} (choose with --file)`);
  let frames = [];
  if (it.source === "archive" && it.frames && it.frames.length) {
    const mine = it.frames.filter((f) => f.of === file.name || (!f.of && it.files.length === 1));
    const all = (mine.length ? mine : it.frames).map((f) => ({ ...f, t: Number((/_(\d{6})\.jpg$/.exec(f.name) || [])[1]) })).filter((f) => !isNaN(f.t)).sort((a, b) => a.t - b.t);
    const step = Math.max(1, Math.ceil(all.length / 36));
    frames = all.filter((_, j) => j % step === 0).slice(0, 36);
  }
  const tdir = path.join(cache, "look", slug(ref));
  fs.rmSync(tdir, { recursive: true, force: true });
  fs.mkdirSync(tdir, { recursive: true });
  const font = FONT && canDraw() ? `fontfile='${fxPath(FONT)}':` : "";
  if (frames.length) {
    await Promise.all(frames.map(async (f, j) => {
      const src = path.join(tdir, `${j}.src.jpg`);
      try { await download(NA.fileUrl(it.id, f.name), src, { quiet: true }); } catch { return; }
      const lab = path.join(tdir, `${j}.txt`);
      fs.writeFileSync(lab, fmtT(f.t) || "0:00");
      const draw = canDraw() && FONT ? `,drawtext=${font}textfile='${fxPath(lab)}':x=6:y=h-24:fontsize=17:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=3` : "";
      ff(["-i", src, "-vf", `scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2${draw},format=yuvj420p`, "-frames:v", "1", path.join(tdir, `${String(j).padStart(3, "0")}.jpg`)]);
    }));
    const tiles = fs.readdirSync(tdir).filter((f) => /^\d{3}\.jpg$/.test(f)).sort();
    tiles.forEach((f, j) => fs.renameSync(path.join(tdir, f), path.join(tdir, `t${String(j).padStart(3, "0")}.jpg`)));
    ff(["-framerate", "1", "-start_number", "0", "-i", path.join(tdir, "t%03d.jpg"), "-vf", `tile=6x${Math.ceil(tiles.length / 6)}:padding=3:margin=3`, "-frames:v", "1", "-q:v", "3", out]);
  } else {
    const src = file.preview || it.preview || file.url;
    if (!src) die("no preview file");
    const pv = path.join(cache, "look", `${it.source}-${slug(it.id)}-${k}${path.extname(new URL(src).pathname) || ".mp4"}`);
    console.log(`  preview ↓ ${src.slice(0, 100)}`);
    await download(src, pv);
    const p = probe(pv);
    const every = Math.max(1, p.dur / 30);
    const draw = canDraw() && FONT ? `,drawtext=${font}text='%{pts\\:hms}':x=6:y=h-24:fontsize=17:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=3` : "";
    const rows = Math.ceil(p.dur / every / 6);
    ff(["-i", pv, "-vf", `fps=1/${every.toFixed(3)},scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2${draw},tile=6x${Math.max(1, rows)}:padding=3:margin=3`, "-frames:v", "1", "-q:v", "3", out]);
    console.log(`  ${fmtT(p.dur)} · one frame every ${every.toFixed(1)} s`);
  }
  fs.rmSync(tdir, { recursive: true, force: true });
  console.log(`sheet: ${rel(out)}  (${file.w || it.w || "?"}×${file.h || it.h || "?"}, ${fmtT(file.dur || it.dur)})`);
}

// cut [a,b] of a video into a clean H.264 clip: interlacing removed, square pixels, short side 1080, and for old film
// the black borders cropped (crop: "auto" | "none" | "w:h:x:y"). Modern footage is never auto-cropped: a night shot's
// dark edges look like borders to cropdetect.
function cut(input, out, { a = 0, b = 0, audio = false, remote = false, crop: cropMode = "none" }) {
  const p = probe(input);
  const end = b > a ? b : p.dur;
  const dur = Math.max(0.2, end - a);
  const pre = p.field && !/progressive|unknown/.test(p.field) ? "yadif=0:-1:0," : "";
  // servers see who is asking (Wikimedia refuses ffmpeg's anonymous name with 429)
  const seek = remote ? ["-user_agent", NF.UA, "-reconnect", "1", "-reconnect_on_network_error", "1", "-reconnect_delay_max", "5"] : [];
  let crop = /^\d+:\d+:\d+:\d+$/.test(cropMode) ? `crop=${cropMode},` : "";
  if (cropMode === "auto") {
    try {
      const det = spawnSync(FF, ["-hide_banner", ...seek, "-ss", String(a), "-t", String(Math.min(6, dur)), "-i", input, "-vf", `${pre}cropdetect=limit=24:round=2:reset=0`, "-f", "null", "-"], { encoding: "utf8", env: PROXY ? { ...process.env, http_proxy: PROXY } : process.env });
      const cnt = {};
      for (const m of (det.stderr || "").matchAll(/crop=(\d+:\d+:\d+:\d+)/g)) cnt[m[1]] = (cnt[m[1]] || 0) + 1;
      const best = Object.entries(cnt).sort((x, y) => y[1] - x[1])[0];
      if (best) {
        const [w, h] = best[0].split(":").map(Number);
        if (w * h >= p.w * p.h * 0.55 && (w < p.w - 8 || h < p.h - 8)) crop = `crop=${best[0]},`;
      }
    } catch {}
  }
  const sar = p.sar && !/^0:|^N/.test(p.sar) ? p.sar.split(":").map(Number).reduce((x, y) => x / y) : 1;
  const W = crop ? Number(crop.split("=")[1].split(":")[0]) : p.w, H = crop ? Number(crop.split("=")[1].split(":")[1]) : p.h;
  const realW = W * sar, short = Math.min(realW, H);
  const target = short >= 360 ? 1080 : Math.round(short * 3);
  const k = target / short;
  const ow = Math.round((realW * k) / 2) * 2, oh = Math.round((H * k) / 2) * 2;
  const sharpen = k > 1.05 ? ",unsharp=5:5:0.45:3:3:0" : "";
  const vf = `${pre}${crop}scale=${ow}:${oh}:flags=lanczos,setsar=1${sharpen},format=yuv420p`;
  const fps = p.fps > 60 ? ["-r", "60"] : [];
  ff([...seek, "-ss", a.toFixed(3), "-i", input, "-t", dur.toFixed(3), "-map", "0:v:0", ...(audio ? ["-map", "0:a:0?", "-c:a", "aac", "-b:a", "192k"] : ["-an"]), "-vf", vf, ...fps,
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-g", "12", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", out]);
  return probe(out);
}

// MPEG program streams seek slowly over http: fetch the byte window around the clip and cut it locally
async function byteWindow(url, size, len, a, b, tmp) {
  const head = tmp + ".head";
  await rangeTo(url, head, 0, Math.min(size - 1, 3_000_000));
  const s0 = probe(head).start;
  fs.rmSync(head, { force: true });
  const bps = size / len;
  let x = Math.max(0, a - 10), y = Math.min(len, b + 8);
  for (let i = 0; i < 4; i++) {
    const b0 = Math.max(0, Math.floor(x * bps)), b1 = Math.min(size - 1, Math.ceil(y * bps));
    fs.rmSync(tmp, { force: true });
    await rangeTo(url, tmp, b0, b1);
    const c = probe(tmp);
    const w0 = s0 + a, w1 = s0 + b;
    if (c.start <= w0 + 0.05 && c.start + c.dur >= w1 - 0.05) return { file: tmp, offset: w0 - c.start };
    if (c.start > w0) x = Math.max(0, x - (c.start - w0) - 8);
    if (c.start + c.dur < w1) y = Math.min(len + 30, y + (w1 - c.start - c.dur) + 8);
  }
  throw new Error("could not find the clip inside the file");
}
async function rangeTo(url, file, a, b) {
  const r = await fetch(url, { headers: { "User-Agent": NF.UA, Range: `bytes=${a}-${b}` }, signal: AbortSignal.timeout(600000) });
  if (r.status !== 206) throw new Error("HTTP " + r.status + " (no ranges)");
  const out = fs.createWriteStream(file);
  for await (const chunk of r.body) out.write(chunk);
  await new Promise((res) => out.end(res));
}

function nextName(V, shot) {
  const man = rd(V.manifest, { clips: {} });
  for (const ch of "abcdefghijklmnopqrstuvwxyz") if (!man.clips[shot + ch]) return shot + ch;
  return shot + "_" + Date.now();
}
// the manifest also keeps every shot's time (from shots.json), so the video can lay clips out by itself (autoShots)
function record(V, name, entry) {
  const man = rd(V.manifest, { clips: {} });
  man.clips[name] = entry;
  const plan = rd(path.join(V.work, "shots.json"), null);
  if (plan) man.shots = Object.fromEntries(plan.shots.map((s) => [s.id, { t0: s.t0, t1: s.t1, text: s.text }]));
  wr(V.manifest, man);
  writeCredits(V, man);
}
function writeCredits(V, man = rd(V.manifest, { clips: {} })) {
  const rows = Object.entries(man.clips);
  const md = ["# اعتبار فوتیج و عکس‌ها", "", "این‌ها را در کپشن اینستاگرام یا توضیحات یوتیوب بیاور (برای CC BY اجباری است، برای بقیه کار درستی است).", "",
    "| نام | منبع | عنوان | سازنده | مجوز | لینک |", "|---|---|---|---|---|---|",
    ...rows.map(([n, c]) => `| ${n} | ${NF.SOURCES[c.source]?.name || c.source} | ${c.title.replace(/\|/g, "/")} | ${(c.author || "").replace(/\|/g, "/")} | ${c.licence.name} | ${c.page} |`), ""];
  wr(path.join(V.work, "CREDITS.md"), md.join("\n"));
}

async function cmdGet() {
  const V = vid(pos[0]);
  const ref = pos[1] || die("get <NN> <shot>:<i> [--in s --out s]");
  const { it, c } = loadCand(V, ref);
  await withDetails(it);
  if (it.licence.verdict === "blocked" && !flags.force) die(`licence "${it.licence.name}" is not for commercial use (--force only if you own the rights)`);
  if (!haveFf()) die("ffmpeg is missing");
  const shot = flags.shot ? String(flags.shot) : c.shot.replace(/^@/, "");
  const plan0 = rd(path.join(V.work, "shots.json"), null);
  if (plan0 && !plan0.shots.some((s) => s.id === shot)) console.log(`  (not on any shot of the narration yet: add --shot sNN, or set "shot" in footage.json)`);
  const name = slug(flags.as || nextName(V, shot));
  fs.mkdirSync(V.pub, { recursive: true });
  const cache = path.join(V.work, "cache", "src");
  const k = Number(flags.file) || 0;
  const files = it.files.filter((f) => f && f.url);
  if (!files.length) die("this result has no downloadable file");
  // Unsplash asks apps to report the download
  if (it.source === "unsplash" && files[0].track) { try { await fetch(files[0].track, { headers: { Authorization: `Client-ID ${NF.keys.UNSPLASH_ACCESS_KEY}` } }); } catch {} }
  const base = { source: it.source, id: it.id, title: it.title, page: it.page, author: it.author, year: it.year || null, licence: it.licence, credit: it.credit, shot };
  console.log(`${it.title}  ·  ${it.licence.name}`);
  if (it.kind === "image") {
    let got = null;
    for (const f of [files[k] || files[0], ...files].filter(Boolean)) {
      try {
        const tmp = path.join(cache, `${it.source}-${slug(it.id)}-${slug(f.label || "f")}.img`);
        await download(f.url, tmp);
        got = tmp;
        break;
      } catch (e) { console.log(`  ✗ ${f.label || ""} ${e.message}`); }
    }
    if (!got) die("download failed");
    const out = path.join(V.pub, `${name}.jpg`);
    ff(["-i", got, "-vf", "scale='min(3840,iw)':-2:flags=lanczos", "-frames:v", "1", "-q:v", "2", out]);
    const p = probe(out);
    record(V, name, { file: rel(out).replace(/^.*?public\//, ""), kind: "image", w: p.w, h: p.h, focus: focusOf(out, p.w, p.h, true), ...base });
    console.log(`✓ ${rel(out)}  ${p.w}×${p.h}`);
    return;
  }
  // video: which file — the chosen one, else the biggest that isn't absurd (originals over 1.5 GB → a smaller copy)
  let f = files[k] || files[0];
  if (!flags.file && f.size > 1.5e9) f = files.find((x) => x.size && x.size <= 1.5e9 && Math.min(x.w || 0, x.h || 0) >= 720) || f;
  const a = flags.in !== undefined ? Number(flags.in) : 0;
  const b = flags.out !== undefined ? Number(flags.out) : 0;
  const out = path.join(V.pub, `${name}.mp4`);
  const ext = path.extname(new URL(f.url).pathname).toLowerCase() || ".mp4";
  const isPS = /^\.(mpe?g|mpg|vob|ts|m2ts|mts)$/.test(ext);
  const local = path.join(cache, `${it.source}-${slug(it.id)}-${k}${ext}`);
  let p;
  const small = !f.size || f.size < 400e6;
  // old film often sits inside black borders; today's footage never needs cropping
  const cropMode = flags.crop ? String(flags.crop) : it.source === "archive" || (it.year && it.year < 1990) ? "auto" : "none";
  try {
    if (small || fs.existsSync(local)) {
      console.log(`  ↓ ${f.label || ""} ${mb(f.size)} ${f.url.slice(0, 90)}`);
      try { await download(f.url, local); }
      catch (e) {
        if (it.source !== "mixkit" || !files[1]) throw e;
        console.log(`  (${e.message}: trying ${files[1].label})`);
        f = files[1];
        await download(f.url, local);
      }
      p = cut(local, out, { a, b, audio: !!flags.audio, crop: cropMode });
    } else if (isPS && b > a && f.dur) {
      console.log(`  ↓ byte window of ${mb(f.size)} around ${a}–${b} s`);
      const w = await byteWindow(f.url, f.size, f.dur, a, b, local + ".win");
      p = cut(w.file, out, { a: w.offset, b: w.offset + (b - a), audio: !!flags.audio, crop: cropMode });
      fs.rmSync(w.file, { force: true });
    } else {
      if (!(b > a)) die(`the file is ${mb(f.size)}: give --in/--out (look at it first: footage look ${V.id} ${ref})`);
      console.log(`  ✂ ${a}–${b} s straight from the server (${mb(f.size)} file)`);
      p = cut(f.url, out, { a, b, audio: !!flags.audio, remote: true, crop: cropMode });
    }
  } catch (e) {
    fs.rmSync(out, { force: true });
    die(`${e.message}`);
  }
  record(V, name, { file: rel(out).replace(/^.*?public\//, ""), kind: "video", w: p.w, h: p.h, dur: +p.dur.toFixed(3), fps: +p.fps.toFixed(3), in: a, out: b || null, audio: !!flags.audio, focus: focusOf(out, p.w, p.h), ...base });
  console.log(`✓ ${rel(out)}  ${p.w}×${p.h}  ${p.dur.toFixed(1)} s`);
}

// brightness (mean luma), cuts inside the clip, length against its shot; --tame evens out washed-out / murky clips
function cmdQc() {
  const V = vid(pos[0]);
  const man = rd(V.manifest, null);
  if (!man) die(`no ${rel(V.manifest)} yet`);
  const plan = rd(path.join(V.work, "shots.json"), { shots: [] });
  for (const [n, c] of Object.entries(man.clips)) {
    const f = path.join(V.pubRoot, c.file);
    if (!fs.existsSync(f)) { console.log(`${n}: file missing`); continue; }
    if (!c.focus || flags.refocus) { man.clips[n].focus = focusOf(f, c.w, c.h, c.kind === "image"); wr(V.manifest, man); }
    const fo = man.clips[n].focus ? `focus ${man.clips[n].focus.map((v) => v.toFixed(2)).join(",")}` : "";
    if (c.kind !== "video") { console.log(`${n.padEnd(8)} ${String(c.w + "x" + c.h).padEnd(10)} photo   ${fo}`); continue; }
    const r = spawnSync(FF, ["-hide_banner", "-i", f, "-vf", "select='not(mod(n\\,6))',scale=320:-2,signalstats,metadata=print", "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 27 });
    const ys = [...(r.stderr || "").matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
    const y = ys.length ? ys.reduce((s, v) => s + v, 0) / ys.length : NaN;
    const sc = spawnSync(FF, ["-hide_banner", "-i", f, "-vf", "scale=320:-2,select='gt(scene,0.38)',showinfo", "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 27 });
    const cuts = [...(sc.stderr || "").matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1])).filter((t) => t > 0.15);
    const shot = plan.shots.find((s) => s.id === c.shot);
    const warn = [];
    if (y > 150) warn.push(`bright (Y ${y.toFixed(0)})`);
    if (y < 40) warn.push(`dark (Y ${y.toFixed(0)})`);
    if (cuts.length) warn.push(`cut inside at ${cuts.map((t) => t.toFixed(1)).join(", ")} s`);
    if (shot && shot.dur && c.dur < shot.dur / Math.max(1, shot.clips) - 0.3) warn.push(`shorter than its share of ${shot.id} (${(shot.dur / Math.max(1, shot.clips)).toFixed(1)} s)`);
    console.log(`${n.padEnd(8)} ${String(c.w + "x" + c.h).padEnd(10)} ${c.dur.toFixed(1).padStart(5)} s  Y ${isNaN(y) ? "?" : y.toFixed(0).padStart(3)}  ${fo}  ${warn.join(" · ") || "ok"}`);
    if (flags.tame && (y > 150 || y < 40) && !c.tamed) {
      const curve = y > 165 ? "0/0 0.5/0.34 0.85/0.64 1/0.8" : y > 150 ? "0/0 0.5/0.41 0.85/0.72 1/0.86" : "0/0 0.25/0.31 0.5/0.57 1/1";
      const tmp = f.replace(/\.mp4$/, ".tame.mp4");
      ff(["-i", f, "-vf", `curves=all='${curve}',format=yuv420p`, ...(c.audio ? ["-c:a", "copy"] : ["-an"]), "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-g", "12", "-movflags", "+faststart", tmp]);
      fs.renameSync(tmp, f);
      man.clips[n].tamed = curve;
      wr(V.manifest, man);
      console.log(`         → tamed (${curve})`);
    }
  }
}

function cmdCredits() {
  const V = vid(pos[0]);
  const man = rd(V.manifest, null);
  if (!man) die(`no ${rel(V.manifest)} yet`);
  writeCredits(V, man);
  const by = new Map();
  for (const c of Object.values(man.clips)) {
    const k = `${NF.SOURCES[c.source]?.name || c.source}`;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(c);
  }
  console.log("Footage & photos:");
  for (const [src, list] of by) {
    const parts = [...new Set(list.map((c) => (c.licence.attr ? `${c.title}${c.author ? " by " + c.author : ""} (${c.licence.name})` : "")).filter(Boolean))];
    const lics = [...new Set(list.filter((c) => !c.licence.attr).map((c) => c.licence.name))];
    console.log(`• ${src}${lics.length ? ` — ${lics.join(", ")}` : ""}${parts.length ? `${lics.length ? ";" : " —"} ${parts.join("; ")}` : ""}`);
  }
  console.log(`\n(full table: ${rel(path.join(V.work, "CREDITS.md"))})`);
}

function cmdFocus() {
  if (!pos.length) die("focus <file…>");
  for (const f of pos) {
    const p = probe(f);
    const still = /.(jpe?g|png|webp|tiff?|bmp)$/i.test(f) || p.dur < 0.1;
    console.log(`${(focusOf(f, p.w, p.h, still) || ["?", "?"]).join(",")}  ${p.w}×${p.h}  ${rel(path.resolve(f))}`);
  }
}

const COMMANDS = { focus: cmdFocus, sources: cmdSources, search: cmdSearch, plan: cmdPlan, find: cmdFind, look: cmdLook, get: cmdGet, qc: cmdQc, credits: cmdCredits };
if (!COMMANDS[cmd]) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").filter((l) => l.startsWith("//")).slice(0, 20).map((l) => l.slice(3)).join("\n"));
  process.exit(cmd ? 1 : 0);
}
await COMMANDS[cmd]();
