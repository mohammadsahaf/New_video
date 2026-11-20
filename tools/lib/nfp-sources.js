// NFP Archive — one search across the free-licence media sites, for the page (inlined), server.mjs and the kit's
// footage tool (both load it with vm). A classic script like core.js: it fills globalThis.NF and uses only fetch.
// Every result comes back in one shape: { source, id, kind, title, desc, page, thumb, preview, w, h, dur, year,
// author, licence: { code, name, url, verdict, attr, sa }, credit, files: [{ url, w, h, size, mime, label }], notes }.
// archive.org results come through core.js (NA), which knows that site's collections and licence rules.
(function (G) {
  const NF = (G.NF = G.NF || {});
  const NODE = typeof window === "undefined";
  // An honest name for the sites' logs (Wikimedia asks every tool for one). Browsers send their own.
  NF.UA = NF.UA || "NFP-Footage/1.0 (+https://alvana.me)";
  // API keys for the optional sources: the host fills these (Node: from .env; the page: never).
  NF.keys = NF.keys || {};

  // ---------------------------------------------------------------- http ----
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function req(url, { headers = {}, as = "json", tries = 3, timeout = 30000 } = {}) {
    const h = Object.assign({}, headers);
    if (NODE && !h["User-Agent"]) h["User-Agent"] = NF.UA;
    let err;
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(url, { headers: h, signal: AbortSignal.timeout ? AbortSignal.timeout(timeout) : undefined });
        if (r.ok) return as === "json" ? await r.json() : await r.text();
        err = new Error(`HTTP ${r.status}`);
        err.status = r.status;
        if (r.status < 500 && r.status !== 429) break;
      } catch (e) {
        err = e;
      }
      if (i < tries - 1) await sleep(1500 * (i + 1));
    }
    throw err;
  }
  NF.req = req;
  const qs = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();
  const strip = (s) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();
  const noUtm = (u) => (u ? String(u).replace(/\?utm_[^#]*$/, "").replace(/^http:\/\//, "https://") : u);
  const num = (x) => (x == null || x === "" ? 0 : Number(x) || 0);
  const year = (s) => { const m = /\b(1[5-9]\d\d|20\d\d)\b/.exec(String(s || "")); return m ? Number(m[1]) : null; };
  const slug = (s) => String(s).toLowerCase().replace(/["']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ---------------------------------------------------------------- licence ----
  // verdict: free = use it (no credit needed, though a credit is kind) · credit = free with the author's name in the
  // caption · careful = usable with conditions you must check (share-alike, the uploader's own claim) · blocked = not for
  // a page or channel that earns money or edits the work (non-commercial, no-derivatives, in copyright, unknown).
  const L = (code, name, url, verdict, attr = false, sa = false) => ({ code, name, url: url || "", verdict, attr, sa });
  const ver = (t) => { const m = /(\d\.\d)/.exec(t); return m ? " " + m[1] : ""; };
  NF.lic = function (name, url) {
    const n = String(name || "").trim();
    const t = `${n} ${url || ""}`.toLowerCase();
    if (/(-|\b)nc(\b|-)|noncommercial|non-commercial/.test(t)) return L("nc", n || "CC BY-NC", url, "blocked", true);
    if (/(-|\b)nd(\b|-)|noderiv|no-deriv/.test(t)) return L("nd", n || "CC BY-ND", url, "blocked", true);
    if (/rightsstatements\.org\/vocab\/(inc|cne|und)|in copyright|all rights reserved|copyrighted free use/.test(t) && !/noc-|nkc/.test(t)) return L("inc", n || "In copyright", url, "blocked");
    if (/publicdomain\/zero|\bcc0\b|cc-0|cc-zero|\bzero\b/.test(t)) return L("cc0", "CC0", url, "free");
    if (/publicdomain\/mark|public domain|\bpdm\b|\bpd(-|\b)|noc-|nkc|no known copyright/.test(t)) return L("pd", n && n.length < 40 ? n : "Public domain", url, "free");
    if (/by-sa|attribution-sharealike|cc-by-sa/.test(t)) return L("by-sa", "CC BY-SA" + ver(t), url, "careful", true, true);
    if (/licenses\/by\/|\bcc[ -]by\b|cc-by|attribution \d|^attribution$/.test(t)) return L("by", "CC BY" + ver(t), url, "credit", true);
    if (/\bogl\b|open government licen/.test(t)) return L("ogl", "Open Government Licence", url, "credit", true);
    if (/gfdl|gnu free documentation/.test(t)) return L("gfdl", "GFDL", url, "careful", true, true);
    return L("unknown", n || "no licence stated", url, "blocked");
  };
  NF.VERDICTS = {
    free: { fa: "آزاد", order: 0 },
    credit: { fa: "آزاد با ذکر نام", order: 1 },
    careful: { fa: "با شرط", order: 2 },
    blocked: { fa: "ممنوع برای کار تجاری", order: 3 },
  };
  // A one-line credit for the caption / video description.
  NF.creditOf = (it) => {
    const who = it.author ? ` · ${it.author}` : "";
    return `${it.title}${who} · ${NF.SOURCES[it.source]?.name || it.source} · ${it.licence.name}`;
  };
  // Two warnings a licence can't give. A file copied from YouTube with CC BY carries only that channel's claim (YouTube
  // allows CC BY just for what the uploader owns, and the licence never stops Content ID); public-domain ones (NASA, the
  // White House…) are tagged by Commons from an official source and stay free. A match or award show belongs to the league
  // or the broadcaster, whatever licence an uploader put on it. Either one turns free / credit into careful, so a default
  // search (free, credit) leaves it out; the note says why. Measured on 12 everyday topics (2026-11-09): 221 usable
  // videos → 189, the rest being personal or TV channels' re-uploads and match clips.
  NF.FLAGS = {
    youtube: {
      en: "copied from YouTube: only if that channel owns the footage (club, agency, government), never a re-upload of TV",
      fa: "از یوتیوب آمده: فقط اگر کانال اصلی صاحب رسمی خود فیلم است (باشگاه، خبرگزاری، دولت). ادیت یا کپی یک آدم معمولی از تلویزیون ممنوع است.",
    },
    sport: {
      en: "looks like a match / award show: if it is broadcast footage it belongs to the league or broadcaster (Content ID): do not use",
      fa: "شبیه پخش مسابقه یا مراسم است. اگر هست، حق تصویرش مال لیگ یا شبکه‌ی پخش است و Content ID پیدایش می‌کند: استفاده نکن.",
    },
  };
  // A match by its title only (descriptions say "goal" and "highlights" about anything): a league or competition name,
  // "A vs B", "Team v Team" / "Time x Time", a score in brackets, or a play word next to a football word. "Saturn V",
  // "goal-directed navigation" and "NASA highlights…" stay out.
  const SPORT_STRONG = /\b(champions league|europa league|premier league|la ?liga|serie a|bundesliga|ligue 1|eredivisie|copa (del rey|am[eé]rica|libertadores)|fifa|uefa|ballon d'?or|olympic games|nba|nfl|nhl|mlb|ufc|wwe|formula (1|one)|grand prix|super bowl|el cl[aá]sico)\b|\b\w{2,}\.? vs\.? \w{2,}|\(\d{1,2} ?[-–] ?\d{1,2}\)/i;
  const SPORT_TEAMS = /\b[A-Z][\w'.-]+ (v\.?|x) [A-Z]/;
  const SPORT_PLAY = /\b(goals?|golazo|highlights|penalt(y|ies)|free[ -]kick|hat[ -]trick|full match|match ?day)\b/i;
  const SPORT_NOUN = /\b(football|soccer|f[uú]tbol|futebol|league|liga|cup|fc|cf|club|match(es)?|stadium|player|striker|ronaldo|messi|neymar|mbapp[eé]|real madrid|barcelona|chelsea|juventus|bayern)\b/i;
  const isSport = (t) => SPORT_STRONG.test(t) || SPORT_TEAMS.test(t) || (SPORT_PLAY.test(t) && SPORT_NOUN.test(t));
  const STOCK = new Set(["coverr", "mixkit", "pexels", "pixabay", "unsplash"]);
  const finish = (it, flags) => {
    flags = Array.isArray(flags) ? flags : [];
    it.notes = it.notes || [];
    it.flags = [];
    if (it.kind === "video" && !STOCK.has(it.source) && isSport(it.title || "")) flags = flags.concat("sport");
    for (const f of flags) {
      if (it.flags.includes(f)) continue;
      it.flags.push(f);
      it.notes.unshift(NF.FLAGS[f].en);
      if (it.licence.verdict === "free" || it.licence.verdict === "credit") it.licence.verdict = "careful";
    }
    it.credit = NF.creditOf(it);
    return it;
  };

  // ---------------------------------------------------------------- sources ----
  // name · fa · kinds · key (an env var: the source is off without it) · cors (the page may call it straight from a
  // browser; the rest go through the local helper or Node) · lic (what its licence means, in Persian)
  NF.SOURCES = {
    archive: { name: "Internet Archive", fa: "آرشیو اینترنت", kinds: ["video", "image"], cors: true, home: "https://archive.org",
      lic: "فیلم‌های دولت آمریکا (ناسا، آرشیو ملی)، Prelinger با مجوز Public Domain و آثار قبل از ۱۹۳۱ آزادند؛ بقیه را آپلودکننده ادعا کرده." },
    commons: { name: "Wikimedia Commons", fa: "ویکی‌مدیا کامنز", kinds: ["video", "image"], cors: true, home: "https://commons.wikimedia.org",
      lic: "هر فایل مجوز خودش را دارد: CC0 و Public domain آزاد، CC BY با ذکر نام، CC BY-SA با شرط انتشار با همان مجوز." },
    nasa: { name: "NASA", fa: "ناسا", kinds: ["video", "image"], cors: true, home: "https://images.nasa.gov",
      lic: "ساخته‌ی دولت آمریکا و آزاد است. لوگوی ناسا را طوری نگذار که انگار ناسا حامی توست؛ تصویر آدم‌ها را برای تبلیغ به کار نبر." },
    coverr: { name: "Coverr", fa: "Coverr", kinds: ["video"], cors: false, home: "https://coverr.co",
      lic: "فوتیج امروزی با مجوز Coverr: استفاده‌ی تجاری آزاد، بدون ذکر نام. کلیپ‌های ساخت هوش مصنوعی کنار گذاشته می‌شوند." },
    mixkit: { name: "Mixkit", fa: "Mixkit", kinds: ["video"], cors: false, home: "https://mixkit.co",
      lic: "فوتیج امروزی با مجوز رایگان Mixkit: استفاده‌ی تجاری آزاد، بدون ذکر نام؛ فقط خود کلیپ را جدا نفروش. از ایران فیلتر است (VPN)." },
    cleveland: { name: "Cleveland Museum of Art", fa: "موزه‌ی هنر کلیولند", kinds: ["image"], cors: true, home: "https://www.clevelandart.org/open-access",
      lic: "آثار هنری و تاریخی با مجوز CC0: کاملاً آزاد." },
    wellcome: { name: "Wellcome Collection", fa: "مجموعه‌ی ولکام", kinds: ["image"], cors: true, home: "https://wellcomecollection.org",
      lic: "تصویرهای تاریخ علم و پزشکی؛ بیشترشان CC BY (با ذکر نام) یا Public domain. غیرتجاری‌ها کنار گذاشته می‌شوند." },
    europeana: { name: "Europeana", fa: "یوروپیانا", kinds: ["image", "video"], cors: true, home: "https://www.europeana.eu", key: "EUROPEANA_API_KEY", optionalKey: true,
      lic: "آرشیو موزه‌ها و کتابخانه‌های اروپا؛ فقط مجوزهای باز. کلید رایگان خودت بهتر است (بدون کلید با کلید نمایشی و محدود کار می‌کند)." },
    pexels: { name: "Pexels", fa: "Pexels", kinds: ["video", "image"], cors: false, home: "https://www.pexels.com", key: "PEXELS_API_KEY",
      lic: "عکس و فوتیج امروزی با مجوز Pexels: استفاده‌ی تجاری آزاد، بدون ذکر نام؛ آدم و برند داخل تصویر را برای ادعای نادرست به کار نبر. کلید رایگان و VPN لازم است." },
    pixabay: { name: "Pixabay", fa: "Pixabay", kinds: ["video", "image"], cors: false, home: "https://pixabay.com", key: "PIXABAY_API_KEY",
      lic: "عکس و فوتیج با مجوز Pixabay: استفاده‌ی تجاری آزاد، بدون ذکر نام. کلید رایگان و VPN لازم است." },
    unsplash: { name: "Unsplash", fa: "Unsplash", kinds: ["image"], cors: false, home: "https://unsplash.com", key: "UNSPLASH_ACCESS_KEY",
      lic: "عکس با مجوز Unsplash: استفاده‌ی تجاری آزاد؛ ذکر نام عکاس خوب است. کلید رایگان و VPN لازم است." },
  };
  NF.enabled = (id) => {
    const s = NF.SOURCES[id];
    return !!s && (!s.key || s.optionalKey || !!NF.keys[s.key]);
  };

  const A = {};

  // archive.org — through core.js. Free text goes to titles and subject tags inside the curated archives, with open
  // licences only; a thin result widens to the same words as a phrase anywhere in the item (its description). Not to
  // "any of the words": that turns "oil refinery" into every oil painting.
  A.archive = async (q, { kind, page = 1, per = 20 }) => {
    const NA = G.NA;
    if (!NA) throw new Error("core.js not loaded");
    const words = q.replace(/["()]/g, " ").trim().split(/\s+/).filter(Boolean);
    const type = kind === "image" ? "image" : kind === "video" ? "movies" : "all";
    const base = { scope: "curated", fiction: false, type, licence: "open", sort: "popular" };
    let r = await NA.search(Object.assign({ clause: { terms: NA.T(words.join(" AND ")), cols: "", and: "" } }, base), page, per);
    if (page === 1 && r.total < 8) {
      const r2 = await NA.search(Object.assign({ clause: { terms: `("${words.join(" ")}")`, cols: "", and: "" } }, base), page, per);
      if (r2.total > r.total) r = r2;
    }
    return r.docs.map((d) => {
      const v = NA.verdict(d);
      // archive.org levels → ours: an uploader's licence is only a claim, so it stays "careful"
      const verdict = v.level === "free" ? (v.attr ? "credit" : "free") : v.level === "claimed" ? "careful" : "blocked";
      const it = {
        source: "archive", id: d.identifier, kind: d.mediatype === "image" ? "image" : "video",
        title: strip(Array.isArray(d.title) ? d.title[0] : d.title), desc: "", page: NA.itemUrl(d.identifier), thumb: NA.thumb(d.identifier),
        preview: null, w: 0, h: 0, dur: 0, year: NA.yearOf(d), author: strip([].concat(d.creator || [])[0] || ""),
        licence: { code: v.why, name: NA.CREDIT_EN[v.why] || v.why, url: v.lic || "", verdict, attr: !!v.attr, sa: v.why === "bysa" }, files: [],
        notes: v.why === "age" ? ["sound may be newer than the film"] : [],
      };
      return finish(it);
    });
  };
  // Files of an archive.org item: one entry per clip (largest first), with archive.org's own frames for the contact sheet.
  NF.archiveFiles = async (it) => {
    const NA = G.NA;
    const meta = await NA.metadata(it.id);
    const f = NA.pickFiles(meta);
    it.desc = strip(meta.metadata.description).slice(0, 400);
    if (it.kind === "video") {
      it.files = f.videos.map((v) => ({ url: v.url, name: v.name, w: v.w, h: v.h, dur: v.len, size: v.size, mime: v.format, label: v.original ? "original" : "derivative", preview: v.preview, poster: v.poster }));
      const v0 = it.files[0];
      if (v0) Object.assign(it, { w: v0.w, h: v0.h, dur: v0.dur, preview: v0.preview || v0.url });
      it.frames = (meta.files || []).filter((x) => /Thumbnail/i.test(x.format || "")).map((x) => ({ name: x.name, of: x.original }));
    } else {
      it.files = f.images.map((m) => ({ url: m.url, name: m.name, w: m.w, h: m.h, size: m.size, mime: m.format, label: "image", preview: m.preview }));
      const m0 = it.files[0];
      if (m0) Object.assign(it, { w: m0.w, h: m0.h, preview: m0.preview });
    }
    return it;
  };

  // Wikimedia Commons — the search engine's filetype: filter splits video from pictures.
  A.commons = async (q, { kind, page = 1, per = 20 }) => {
    const ft = kind === "image" ? " filetype:bitmap" : kind === "video" ? " filetype:video" : "";
    const p = {
      action: "query", format: "json", origin: "*", uselang: "en", generator: "search", gsrnamespace: 6, gsrsearch: q + ft, gsrlimit: per,
      gsroffset: (page - 1) * per, prop: "imageinfo|videoinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: 640, viprop: "derivatives",
      iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|Credit|DateTimeOriginal|ImageDescription|Restrictions|ObjectName",
    };
    const headers = NODE ? {} : { "Api-User-Agent": NF.UA };
    const j = await req("https://commons.wikimedia.org/w/api.php?" + qs(p), { headers });
    const pages = Object.values((j.query && j.query.pages) || {}).sort((a, b) => a.index - b.index);
    return pages.map((pg) => {
      const ii = (pg.imageinfo || [])[0] || {};
      const em = ii.extmetadata || {};
      const g = (k) => strip(em[k] && em[k].value);
      const lic = NF.lic(g("LicenseShortName"), g("LicenseUrl"));
      const isVid = /^(video|application\/ogg)/.test(ii.mime || "") || !!ii.duration;
      const der = ((pg.videoinfo || [])[0] || {}).derivatives || [];
      const files = [{ url: noUtm(ii.url), w: num(ii.width), h: num(ii.height), size: num(ii.size), mime: ii.mime, label: "original" }]
        .concat(der.map((d) => ({ url: noUtm(d.src), w: num(d.width), h: num(d.height), mime: String(d.type || "").split(";")[0], label: d.transcodekey || "derivative" })));
      const prev = der.filter((d) => /webm|mp4/.test(d.type || "") && num(d.height) >= 240).sort((a, b) => num(a.height) - num(b.height))[0];
      const restr = g("Restrictions");
      const it = {
        source: "commons", id: pg.title, kind: isVid ? "video" : "image",
        title: pg.title.replace(/^File:/, "").replace(/\.[a-z0-9]+$/i, "").replace(/_/g, " "),
        desc: g("ImageDescription").slice(0, 400), page: noUtm(ii.descriptionurl), thumb: noUtm(ii.thumburl),
        preview: isVid ? (prev ? noUtm(prev.src) : noUtm(ii.url)) : noUtm((ii.responsiveUrls && ii.responsiveUrls["2"]) || ii.thumburl),
        w: num(ii.width), h: num(ii.height), dur: num(ii.duration), year: year(g("DateTimeOriginal")), author: g("Artist").slice(0, 120),
        licence: lic, files, notes: restr ? [restr] : [],
      };
      return finish(it, lic.verdict !== "free" && /\byoutu(be\b|\.be)/i.test(g("Credit")) ? ["youtube"] : []);
    });
  };

  // NASA Image and Video Library — public domain. The file list (orig, large, medium, small…) is a second call.
  A.nasa = async (q, { kind, page = 1, per = 20 }) => {
    const j = await req("https://images-api.nasa.gov/search?" + qs({ q, media_type: kind === "image" ? "image" : kind === "video" ? "video" : "image,video", page, page_size: per }));
    return (j.collection.items || []).map((x) => {
      const d = (x.data || [])[0] || {};
      const links = x.links || [];
      const thumb = (links.find((l) => /thumb|small|medium/.test(l.href) && /\.jpe?g$/i.test(l.href)) || links[0] || {}).href;
      const big = links.filter((l) => /\.jpe?g$/i.test(l.href)).sort((a, b) => num(b.width) - num(a.width))[0];
      const it = {
        source: "nasa", id: d.nasa_id, kind: d.media_type === "video" ? "video" : "image", title: strip(d.title), desc: strip(d.description_508 || d.description).slice(0, 400),
        page: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`, thumb: noUtm(thumb), preview: d.media_type === "image" ? noUtm(big && big.href) : null,
        // a video's size is only known from its own metadata (details); the link sizes are its thumbnail's
        w: d.media_type === "image" ? num(big && big.width) : 0, h: d.media_type === "image" ? num(big && big.height) : 0, dur: 0, year: year(d.date_created), author: strip(d.photographer || d.secondary_creator || d.center || "NASA"),
        licence: L("gov", "Public domain (NASA)", "https://www.nasa.gov/nasa-brand-center/images-and-media/", "free"), files: [], collection: x.href,
        notes: ["NASA: no logo or endorsement; check third-party material"],
      };
      return finish(it);
    });
  };
  NF.nasaFiles = async (it) => {
    const list = (await req(it.collection)).map(noUtm);
    const pick = (re) => list.filter((u) => re.test(u));
    const order = it.kind === "video" ? ["~orig", "~large", "~medium", "~small", "~mobile", "~preview"] : ["~orig", "~large", "~medium", "~small"];
    const ext = it.kind === "video" ? /\.(mp4|mov)$/i : /\.(jpe?g|png|tiff?)$/i;
    it.files = [];
    for (const k of order) for (const u of pick(ext)) if (u.includes(k + ".")) it.files.push({ url: u, label: k.slice(1) });
    if (it.kind === "video") {
      it.preview = (it.files.find((f) => /small|mobile|preview/.test(f.label)) || it.files[it.files.length - 1] || {}).url || null;
      // the asset's own metadata: size and length of the original
      const mu = list.find((u) => /metadata\.json$/.test(u));
      if (mu) {
        try {
          const m = await req(mu);
          it.w = num(m["QuickTime:ImageWidth"] || m["Track1:ImageWidth"]);
          it.h = num(m["QuickTime:ImageHeight"] || m["Track1:ImageHeight"]);
          const dur = String(m["QuickTime:Duration"] || m["QuickTime:MediaDuration"] || "");
          it.dur = dur.includes(":") ? dur.split(":").reduce((a, p) => a * 60 + Number(p || 0), 0) : parseFloat(dur) || 0;
          if (it.files[0]) Object.assign(it.files[0], { w: it.w, h: it.h, dur: it.dur, size: num(m["File:FileSize"]) || 0 });
        } catch {}
      }
    }
    return it;
  };

  // Coverr — today's stock footage. The search page carries its records as JSON; AI-made clips (flagged, or from the
  // site's AI generator) are left out.
  A.coverr = async (q, { kind, page = 1, per = 20 }) => {
    if (kind === "image") return [];
    const html = await req(`https://coverr.co/s?${qs({ q, page: page > 1 ? page : "" })}`, { as: "text" });
    const out = new Map();
    for (const m of html.matchAll(/"baseFilename":"([^"]+)"/g)) {
      const base = m[1];
      if (out.has(base) || /^coverr-temp-|ai-generation|^user-ai/i.test(base)) continue;
      const i0 = html.lastIndexOf('{"id":', m.index), i1 = html.indexOf('"allSlugs"', m.index);
      if (i0 < 0 || i1 < 0 || i1 - i0 > 8000) continue;
      const rec = html.slice(i0, i1);
      const g = (k) => (rec.match(new RegExp('"' + k + '":("([^"]*)"|true|false|null|[0-9.]+)')) || [])[1];
      const s = (k) => ((rec.match(new RegExp('"' + k + '":"([^"]*)"')) || [])[1] || "").replace(/\\u0026/g, "&");
      if (g("isPremium") === "true" || g("isAiGenerated") === "true" || !/"urls":\{"mp4"/.test(rec)) continue;
      const mp4 = s("mp4"), prev = s("mp4Preview");
      const tags = ((/"tags":\[([^\]]*)\]/.exec(rec) || [])[1] || "").replace(/"/g, "").replace(/,/g, ", ");
      out.set(base, finish({
        source: "coverr", id: base, kind: "video", title: s("title"), desc: s("description").slice(0, 300), tags, page: `https://coverr.co/videos/${s("slug") || base}`,
        thumb: s("thumbnail") || `https://cdn.coverr.co/videos/${base}/thumbnail?width=640`, preview: prev || mp4,
        w: num(g("maxWidth")), h: num(g("maxHeight")), dur: num(s("duration")), year: year(s("createdAt")), author: "",
        licence: L("coverr", "Coverr License", "https://coverr.co/license", "free"),
        files: [{ url: mp4, w: num(g("maxWidth")), h: num(g("maxHeight")), label: "1080p" }],
        notes: g("hasAudio") === "true" ? ["has audio"] : [],
      }));
    }
    return [...out.values()].slice(0, per);
  };

  // Mixkit — today's stock footage (free licence). Its search pages are plain HTML; the full file is <id>-1080.mp4
  // (some older clips only have 720).
  A.mixkit = async (q, { kind, page = 1, per = 20 }) => {
    if (kind === "image") return [];
    const html = await req(`https://mixkit.co/free-stock-video/discover/${slug(q)}/${page > 1 ? `?page=${page}` : ""}`, { as: "text" });
    const parts = html.split('data-item-grid--video-player-item-id-value="').slice(1);
    const out = [];
    for (const p of parts) {
      const id = (/^(\d+)/.exec(p) || [])[1];
      if (!id || out.some((x) => x.id === id)) continue;
      const title = strip((/overlay-video-title">([\s\S]*?)</.exec(p) || /alt="([^"]+)"/.exec(p) || [])[1] || "");
      const desc = strip((/overlay-video-description">([\s\S]*?)</.exec(p) || [])[1] || "");
      const href = (/href="(\/free-stock-video\/[^"]+)"/.exec(p) || [])[1];
      out.push(finish({
        source: "mixkit", id, kind: "video", title: title.replace(/\.$/, ""), desc, page: href ? "https://mixkit.co" + href : "https://mixkit.co/free-stock-video/",
        thumb: `https://assets.mixkit.co/videos/${id}/${id}-thumb-360-0.jpg`, preview: `https://assets.mixkit.co/videos/${id}/${id}-360.mp4`,
        w: 0, h: 0, dur: 0, year: null, author: "", licence: L("mixkit", "Mixkit Free License", "https://mixkit.co/license/#videoFree", "free"),
        files: [{ url: `https://assets.mixkit.co/videos/${id}/${id}-1080.mp4`, label: "1080p" }, { url: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`, label: "720p" }],
      }));
    }
    return out.slice(0, per);
  };

  // Cleveland Museum of Art — open access (CC0) artworks and objects.
  A.cleveland = async (q, { kind, page = 1, per = 20 }) => {
    if (kind === "video") return [];
    const j = await req("https://openaccess-api.clevelandart.org/api/artworks/?" + qs({ q, cc0: 1, has_image: 1, limit: per, skip: (page - 1) * per }));
    return (j.data || []).map((d) => {
      const im = d.images || {};
      const pr = im.print || im.web || {}, web = im.web || pr;
      return finish({
        source: "cleveland", id: String(d.id), kind: "image", title: strip(d.title), desc: strip(d.tombstone || d.description || "").slice(0, 300),
        page: d.url, thumb: web.url, preview: web.url, w: num(pr.width), h: num(pr.height), dur: 0, year: year(d.creation_date),
        author: strip(((d.creators || [])[0] || {}).description || ""), licence: L("cc0", "CC0", "https://creativecommons.org/publicdomain/zero/1.0/", "free"),
        files: [pr, web].filter((x) => x && x.url).map((x) => ({ url: x.url, w: num(x.width), h: num(x.height), size: num(x.filesize), label: x === pr ? "print" : "web" })),
      });
    });
  };

  // Wellcome Collection — history of science and medicine; IIIF serves any size.
  A.wellcome = async (q, { kind, page = 1, per = 20 }) => {
    if (kind === "video") return [];
    const j = await req("https://api.wellcomecollection.org/catalogue/v2/images?" + qs({ query: q, pageSize: per, page, include: "source.contributors" }));
    return (j.results || []).map((r) => {
      const loc = (r.locations || [])[0] || {};
      const base = String(loc.url || "").replace(/\/info\.json$/, "");
      const lc = loc.license || {};
      const lic = NF.lic(lc.id === "pdm" ? "Public domain" : lc.id === "cc-0" ? "CC0" : lc.label || lc.id, lc.url);
      const src = r.source || {};
      return finish({
        source: "wellcome", id: r.id, kind: "image", title: strip(src.title), desc: "", page: `https://wellcomecollection.org/works/${src.id}`,
        thumb: `${base}/full/400,/0/default.jpg`, preview: `${base}/full/1000,/0/default.jpg`, w: 0, h: 0, ar: num(r.aspectRatio), dur: 0, year: year(src.title),
        author: strip(((src.contributors || [])[0] || {}).agent?.label || "Wellcome Collection"), licence: lic,
        files: [{ url: `${base}/full/2400,/0/default.jpg`, label: "2400px" }, { url: `${base}/full/full/0/default.jpg`, label: "full" }],
      });
    });
  };

  // Europeana — Europe's museums and archives; open reuse only. A free personal key is better than the demo key.
  A.europeana = async (q, { kind, page = 1, per = 20 }) => {
    const type = kind === "video" ? "VIDEO" : "IMAGE";
    const j = await req("https://api.europeana.eu/record/v2/search.json?" + qs({ wskey: NF.keys.EUROPEANA_API_KEY || "api2demo", query: q, reusability: "open", media: "true", qf: `TYPE:${type}`, rows: per, start: (page - 1) * per + 1, profile: "rich" }));
    return (j.items || []).map((x) => {
      const rights = (x.rights || [])[0] || "";
      const media = (x.edmIsShownBy || [])[0] || "";
      // a IIIF render ("…/full/512,/0/default.jpg") can be asked for at full size
      const big = /\/full\/[^/]+\/0\/default\.(jpe?g|png)$/i.test(media) ? media.replace(/\/full\/[^/]+\/0\//, "/full/full/0/") : "";
      return finish({
        source: "europeana", id: x.id, kind: kind === "video" ? "video" : "image", title: strip((x.title || [])[0]), desc: strip((x.dcDescription || [])[0] || "").slice(0, 300),
        page: noUtm(String(x.guid || "").replace(/\?utm.*$/, "")), thumb: (x.edmPreview || [])[0] || "", preview: kind === "video" ? media : (x.edmPreview || [])[0] || media,
        w: num(x.edmIsShownByWidth), h: num(x.edmIsShownByHeight), dur: 0, year: year((x.year || [])[0]), author: strip(((x.dcCreator || [])[0]) || (x.dataProvider || [])[0] || ""),
        licence: NF.lic(rights, rights), files: [big && { url: big, label: "full" }, media && { url: media, label: "original" }].filter(Boolean), provider: (x.dataProvider || [])[0] || "",
      });
    }).filter((it) => it.files.length);
  };

  // Pexels, Pixabay, Unsplash — need the user's own free key (and from Iran a VPN).
  A.pexels = async (q, { kind, page = 1, per = 20 }) => {
    const key = NF.keys.PEXELS_API_KEY;
    if (!key) throw new Error("PEXELS_API_KEY not set");
    const headers = { Authorization: key };
    if (kind === "video") {
      const j = await req("https://api.pexels.com/videos/search?" + qs({ query: q, per_page: per, page }), { headers });
      return (j.videos || []).map((v) => {
        const files = (v.video_files || []).filter((f) => /mp4/.test(f.file_type || "")).sort((a, b) => num(b.height) * num(b.width) - num(a.height) * num(a.width));
        const hd = files.filter((f) => num(Math.min(f.width, f.height)) <= 2160);
        const small = [...files].sort((a, b) => num(a.width) - num(b.width)).find((f) => num(Math.min(f.width, f.height)) >= 360);
        return finish({
          source: "pexels", id: String(v.id), kind: "video", title: slugTitle(v.url) || `Pexels video ${v.id}`, desc: "", page: v.url, thumb: v.image, preview: small && small.link,
          w: num(v.width), h: num(v.height), dur: num(v.duration), year: null, author: strip(v.user && v.user.name), licence: L("pexels", "Pexels License", "https://www.pexels.com/license/", "free"),
          files: hd.map((f) => ({ url: f.link, w: num(f.width), h: num(f.height), label: f.quality || "" })),
        });
      });
    }
    const j = await req("https://api.pexels.com/v1/search?" + qs({ query: q, per_page: per, page }), { headers });
    return (j.photos || []).map((p) => finish({
      source: "pexels", id: String(p.id), kind: "image", title: strip(p.alt) || `Pexels photo ${p.id}`, desc: "", page: p.url, thumb: p.src && p.src.medium, preview: p.src && p.src.large,
      w: num(p.width), h: num(p.height), dur: 0, year: null, author: strip(p.photographer), licence: L("pexels", "Pexels License", "https://www.pexels.com/license/", "free"),
      files: [{ url: p.src && p.src.original, w: num(p.width), h: num(p.height), label: "original" }, { url: p.src && p.src.large2x, label: "large2x" }],
    }));
  };
  const slugTitle = (u) => { const m = /\/video\/([^/]+?)-\d+\/?$/.exec(String(u || "")); return m ? m[1].replace(/-/g, " ") : ""; };

  A.pixabay = async (q, { kind, page = 1, per = 20 }) => {
    const key = NF.keys.PIXABAY_API_KEY;
    if (!key) throw new Error("PIXABAY_API_KEY not set");
    const lic = L("pixabay", "Pixabay Content License", "https://pixabay.com/service/license-summary/", "free");
    if (kind === "video") {
      const j = await req("https://pixabay.com/api/videos/?" + qs({ key, q, per_page: Math.max(3, per), page, safesearch: "true" }));
      return (j.hits || []).map((h) => {
        const v = h.videos || {};
        const best = v.large && v.large.url ? v.large : v.medium || v.small || {};
        return finish({
          source: "pixabay", id: String(h.id), kind: "video", title: h.tags || `Pixabay video ${h.id}`, desc: "", page: h.pageURL,
          thumb: (v.tiny && v.tiny.thumbnail) || (v.small && v.small.thumbnail) || "", preview: (v.tiny || v.small || {}).url, w: num(best.width), h: num(best.height), dur: num(h.duration),
          year: null, author: strip(h.user), licence: lic, files: [v.large, v.medium, v.small].filter((x) => x && x.url).map((x) => ({ url: x.url, w: num(x.width), h: num(x.height), size: num(x.size) })),
        });
      });
    }
    const j = await req("https://pixabay.com/api/?" + qs({ key, q, image_type: "photo", per_page: Math.max(3, per), page, safesearch: "true" }));
    return (j.hits || []).map((h) => finish({
      source: "pixabay", id: String(h.id), kind: "image", title: h.tags || `Pixabay photo ${h.id}`, desc: "", page: h.pageURL, thumb: h.webformatURL, preview: h.largeImageURL,
      w: num(h.imageWidth), h: num(h.imageHeight), dur: 0, year: null, author: strip(h.user), licence: lic,
      files: [{ url: h.largeImageURL, label: "large" }],
    }));
  };

  A.unsplash = async (q, { kind, page = 1, per = 20 }) => {
    if (kind === "video") return [];
    const key = NF.keys.UNSPLASH_ACCESS_KEY;
    if (!key) throw new Error("UNSPLASH_ACCESS_KEY not set");
    const j = await req("https://api.unsplash.com/search/photos?" + qs({ query: q, per_page: per, page }), { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } });
    return (j.results || []).map((p) => finish({
      source: "unsplash", id: p.id, kind: "image", title: strip(p.description || p.alt_description) || `Unsplash photo ${p.id}`, desc: "", page: p.links && p.links.html,
      thumb: p.urls && p.urls.small, preview: p.urls && p.urls.regular, w: num(p.width), h: num(p.height), dur: 0, year: year(p.created_at), author: strip(p.user && p.user.name),
      licence: L("unsplash", "Unsplash License", "https://unsplash.com/license", "free"),
      // Unsplash asks apps to report each download (the download_location call) before fetching the file
      files: [{ url: p.urls && (p.urls.raw ? p.urls.raw + "&w=3000&fm=jpg&q=88" : p.urls.full), w: num(p.width), h: num(p.height), label: "3000px", track: p.links && p.links.download_location }],
    }));
  };

  // ---------------------------------------------------------------- search ----
  // One source → { items, error }. A site that doesn't answer within opt.budget (20 s) is reported, not waited for.
  NF.search = async function (source, q, opt = {}) {
    const s = NF.SOURCES[source];
    if (!s || !A[source]) return { items: [], error: "unknown source" };
    if (s.key && !s.optionalKey && !NF.keys[s.key]) return { items: [], error: `needs ${s.key}` };
    if (opt.kind && !s.kinds.includes(opt.kind)) return { items: [] };
    let timer;
    const late = new Promise((r) => { timer = setTimeout(() => r({ items: [], error: "no answer (timeout)" }), opt.budget || 20000); });
    const run = (async () => {
      try {
        return { items: await A[source](q, opt) };
      } catch (e) {
        return { items: [], error: String((e && e.message) || e) };
      }
    })();
    try { return await Promise.race([run, late]); } finally { clearTimeout(timer); }
  };
  // Several sources at once, results interleaved (so one site doesn't fill the page), filtered by verdict.
  // opt: { kind, sources: [...], per, page, allow: ["free","credit"] }
  NF.searchAll = async function (q, opt = {}) {
    const ids = (opt.sources && opt.sources.length ? opt.sources : Object.keys(NF.SOURCES)).filter((id) => NF.enabled(id) && (!opt.kind || NF.SOURCES[id].kinds.includes(opt.kind)));
    const allow = opt.allow || ["free", "credit"];
    const res = await Promise.all(ids.map(async (id) => [id, await NF.search(id, q, { kind: opt.kind, page: opt.page || 1, per: opt.per || 20, budget: opt.budget })]));
    const errors = {};
    const lists = res.map(([id, r]) => {
      if (r.error) errors[id] = r.error;
      return r.items.filter((it) => allow.includes(it.licence.verdict) && (!opt.kind || it.kind === opt.kind));
    });
    const out = [];
    for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i]);
    return { items: out, errors, sources: ids };
  };
  // Fill in the files (and real size/length) of one result.
  NF.details = async function (it) {
    if (it.source === "archive") return NF.archiveFiles(it);
    if (it.source === "nasa") return NF.nasaFiles(it);
    return it;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
