#!/usr/bin/env node
// Seedance image-to-video via BytePlus ModelArk (free tier: 2M tokens of Seedance 1.0 Pro for new accounts).
// The API key is NOT stored here: it is a Network secret on the cloud environment for host
// ark.ap-southeast.bytepluses.com, and the proxy injects it. ARK_API_KEY below is only a dummy placeholder.
//
// Usage (one clip):
//   node tools/seedance.mjs <image> <out.mp4> "<motion prompt>" [--dur 5] [--ratio 9:16] [--res 720p] [--model seedance-1-0-pro-250528] [--fixed]
// Usage (batch from a JSON list [{ "img": "...", "out": "...", "prompt": "..." }]):
//   node tools/seedance.mjs --batch uploads/v05/clips.json
// Cost: tokens ≈ width*height*24*seconds/1024 — a 5 s 720p clip ≈ 108k tokens (≈18 free clips), 1080p ≈ 243k.
import fs from "node:fs";
import path from "node:path";

const HOST = "https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks";
const KEY = process.env.ARK_API_KEY || "proxy-injected";

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const flag = (name) => args.includes(name);

const mime = (f) => ({ ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" })[path.extname(f).toLowerCase()] || "image/jpeg";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(url, init = {}) {
  const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, ...(init.headers || {}) } });
  const text = await r.text();
  let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 400)}`);
  return j;
}

async function makeClip({ img, out, prompt, dur, ratio, res, model, fixed }) {
  if (fs.existsSync(out) && fs.statSync(out).size > 10000) { console.log("skip (exists)", out); return; }
  const b64 = fs.readFileSync(img).toString("base64");
  const body = {
    model,
    content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: `data:${mime(img)};base64,${b64}` } },
    ],
    ratio, duration: Number(dur), resolution: res, watermark: false, camera_fixed: !!fixed,
  };
  const { id } = await api(HOST, { method: "POST", body: JSON.stringify(body) });
  console.log("task", id, "←", path.basename(img));
  const t0 = Date.now();
  for (;;) {
    await sleep(10000);
    const t = await api(`${HOST}/${id}`);
    if (t.status === "succeeded") {
      const v = await fetch(t.content.video_url);
      if (!v.ok) throw new Error(`download HTTP ${v.status}`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, Buffer.from(await v.arrayBuffer()));
      console.log(`done ${out} · ${Math.round((Date.now() - t0) / 1000)}s · tokens ${t.usage?.total_tokens ?? "?"}`);
      return;
    }
    if (t.status === "failed" || t.status === "cancelled" || t.status === "expired") throw new Error(`task ${id} ${t.status}: ${JSON.stringify(t.error)}`);
    process.stdout.write(".");
  }
}

const common = { dur: opt("--dur", "5"), ratio: opt("--ratio", "9:16"), res: opt("--res", "720p"), model: opt("--model", "seedance-1-0-pro-250528"), fixed: flag("--fixed") };
const batch = opt("--batch");
const jobs = batch ? JSON.parse(fs.readFileSync(batch, "utf8")).map((j) => ({ ...common, ...j })) : [{ ...common, img: args[0], out: args[1], prompt: args[2] }];
if (!jobs[0]?.img || !jobs[0]?.out || !jobs[0]?.prompt) { console.error("usage: node tools/seedance.mjs <image> <out.mp4> \"<prompt>\" [--dur 5] [--ratio 9:16] [--res 720p]"); process.exit(2); }

let failed = 0;
for (const j of jobs) {
  try { await makeClip(j); } catch (e) { failed++; console.error("FAILED", j.img, e.message); }
}
process.exit(failed ? 1 : 0);
