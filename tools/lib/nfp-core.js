// NFP Archive — shared core: archive.org search queries, licence verdicts, file picking, Persian → English terms.
// A classic script (no modules: the page must also work opened straight from disk) that fills globalThis.NA.
// The dev scripts in tools/ load this same file in Node with vm, so keep it free of DOM calls.
(function (G) {
  const NA = (G.NA = G.NA || {});
  const API = "https://archive.org";
  NA.API = API;

  // ---------------------------------------------------------------- licence ----
  // Public domain because of who made it: US federal government works (NASA, National Archives / FedFlix) and the
  // Universal Newsreels, which Universal gave to the public domain in 1976.
  const GOV = /^(nasa|nasa[-_].*|.*nasa.*collection|jsc-pao-video-collection|fedflix|usgovfilms|universal_newsreels|nationalarchives|.*spaceflightcenter.*|greatimagesinnasa.*|solarsystemcollection|spitzerspacetelescopecollection|hubblesite.*|maps_usgs|usgs_.*)$/i;
  // Prelinger says plainly that not all of its films are public domain: only the ones it marked with the
  // Creative Commons Public Domain dedication are. In this collection the uploader is the rights holder.
  const PRELINGER = /^(prelinger|prelingerhomemovies)$/i;
  // Collections whose licences were set by the institution that owns the works (museum open access, the
  // Publicvideos stock-footage project), so a PD / CC0 / CC BY there can be trusted.
  const INSTITUTION = /^(clevelandart|het-utrechts-archief|stock_footage)$/i;
  // Museum mirrors without a licence on archive.org: the museum's own site says which images are open access.
  const MUSEUM = /^(metropolitanmuseumofart-gallery|brooklynmuseum)$/i;
  const PD_LIC = /publicdomain|\/zero\//i;
  const OPEN_LIC = /\/licenses\/by\/|\/licenses\/by-sa\//i;
  const NC_ND = /-nc|-nd/i;
  // Works published in the US before 1931 are public domain there (1930 works entered it on 1 Jan 2026).
  const AGE_LIMIT = 1930;

  NA.yearOf = (d) => {
    const y = parseInt(String(d.year ?? d.date ?? "").slice(0, 4), 10);
    return y > 1800 && y < 2100 ? y : null;
  };

  // → { level: free | claimed | restricted | unknown, why, lic }
  NA.verdict = function (d) {
    const cols = [].concat(d.collection ?? []);
    const lic = String(d.licenseurl ?? "");
    const y = NA.yearOf(d);
    if (lic && NC_ND.test(lic)) return { level: "restricted", why: "ncnd", lic };
    if (cols.some((c) => GOV.test(c)) || /^gov\./.test(d.identifier ?? "")) {
      return { level: "free", why: cols.some((c) => /universal_newsreels/i.test(c)) ? "newsreel" : "gov", lic };
    }
    if (cols.some((c) => PRELINGER.test(c))) {
      return PD_LIC.test(lic) ? { level: "free", why: "prelinger", lic } : { level: "unknown", why: "prelinger-none", lic };
    }
    if (cols.some((c) => INSTITUTION.test(c)) && (PD_LIC.test(lic) || OPEN_LIC.test(lic))) {
      return OPEN_LIC.test(lic) ? { level: "free", why: "inst-by", lic, attr: true } : { level: "free", why: "inst", lic };
    }
    if (y && y <= AGE_LIMIT) return { level: "free", why: "age", lic };
    if (cols.some((c) => MUSEUM.test(c))) return { level: "claimed", why: "museum", lic };
    if (lic && (PD_LIC.test(lic) || OPEN_LIC.test(lic))) {
      return { level: "claimed", why: /\/by-sa\//.test(lic) ? "bysa" : /\/by\//.test(lic) ? "by" : "pd", lic };
    }
    return { level: "unknown", why: "none", lic };
  };

  NA.LEVELS = {
    free: { fa: "آزاد", short: "آزاد", order: 0 },
    claimed: { fa: "مجوز ادعایی", short: "ادعایی", order: 1 },
    restricted: { fa: "غیرتجاری", short: "غیرتجاری", order: 2 },
    unknown: { fa: "کپی‌رایت احتمالی", short: "کپی‌رایت", order: 3 },
  };
  NA.WHY = {
    gov: "ساخته‌ی دولت آمریکاست (ناسا، آرشیو ملی و…). آثار دولت فدرال آمریکا مالک ندارند و استفاده‌ی تجاری‌شان آزاد است. فقط از لوگوی ناسا طوری استفاده نکن که انگار ناسا از کارت حمایت می‌کند.",
    newsreel: "نیوزریل‌های Universal را خود استودیو در ۱۹۷۶ به مالکیت عمومی داده است؛ استفاده‌ی تجاری آزاد است.",
    prelinger: "آرشیو Prelinger خودش این فیلم را با مجوز مالکیت عمومی (Public Domain) منتشر کرده است؛ استفاده آزاد است.",
    inst: "خود موزه یا آرشیوِ صاحب اثر آن را با مجوز مالکیت عمومی (CC0 / Public Domain) منتشر کرده است؛ استفاده‌ی تجاری آزاد است.",
    "inst-by": "خود آرشیوِ صاحب اثر آن را با مجوز CC BY منتشر کرده است: استفاده‌ی تجاری آزاد است، به شرط اینکه نام منبع را در توضیحات بیاوری.",
    "prelinger-none": "در کالکشن Prelinger است ولی مجوز آزاد ندارد. خود Prelinger می‌گوید همه‌ی فیلم‌هایش آزاد نیستند؛ نسخه‌ی دیگری از همین فیلم را با مجوز Public Domain پیدا کن یا از آن نگذر.",
    museum: "تصویر یک اثر موزه‌ای است (متروپولیتن یا بروکلین). بیشتر آثار قدیمی این موزه‌ها روی سایت خود موزه با برچسب «Open Access / Public Domain» آزادند؛ قبل از استفاده‌ی تجاری، همین برچسب را در صفحه‌ی اثر روی سایت موزه چک کن.",
    age: "قبل از ۱۹۳۱ منتشر شده و در آمریکا مالکیت عمومی است. ولی موزیک یا صدایی که بعداً رویش گذاشته‌اند ممکن است آزاد نباشد؛ صدا را جدا چک کن.",
    pd: "آپلودکننده آن را «مالکیت عمومی» اعلام کرده. فقط اگر واقعاً صاحب اثر باشد یا اثر واقعاً قدیمی باشد معتبر است؛ برای کار مهم منبع اصلی را چک کن.",
    by: "آپلودکننده مجوز CC BY گذاشته: استفاده‌ی تجاری آزاد است به شرط ذکر نام سازنده — اگر واقعاً صاحب اثر باشد.",
    bysa: "آپلودکننده مجوز CC BY-SA گذاشته: با ذکر نام و انتشار نتیجه با همان مجوز — اگر واقعاً صاحب اثر باشد.",
    ncnd: "مجوز غیرتجاری (NC) یا «بدون تغییر» (ND) دارد؛ برای پیج و کانالی که درآمد دارد یا ادیت روی آن مناسب نیست.",
    none: "مجوزی ثبت نشده؛ فرض کن کپی‌رایت دارد (تبلیغ برندها، تلویزیون، فیلم). اگر استفاده کردی: فقط تکه‌ی کوتاه، داخل طراحی خودت، با روایت خودت و بدون موزیک اصلی. ممکن است Content ID یوتیوب یا حقوق اینستاگرام آن را بگیرد.",
  };

  // English licence line for a credit / video description.
  NA.CREDIT_EN = {
    gov: "Public domain (U.S. federal government work)",
    newsreel: "Public domain (Universal Newsreels, given to the public in 1976)",
    prelinger: "Public domain (Prelinger Archives)",
    "prelinger-none": "Prelinger Archives, no open licence stated",
    inst: "Public domain / CC0 (released by the holding institution)",
    "inst-by": "CC BY (released by the holding institution), attribution required",
    age: "Public domain in the U.S. (published before 1931)",
    museum: "Museum image, check its open-access status on the museum site",
    pd: "Public domain (as stated by the uploader)",
    by: "CC BY (as stated by the uploader), attribution required",
    bysa: "CC BY-SA (as stated by the uploader)",
    ncnd: "Non-commercial or no-derivatives licence",
    none: "No licence stated, assume copyrighted",
  };

  // ---------------------------------------------------------------- queries ----
  // Streaming-only TV news and lending-library items have nothing to download. The adult list keeps NSFW uploads
  // (and the stag films some "vintage" collections carry) out of every search.
  const NSFW = "porn OR porno OR pornography OR xxx OR nsfw OR erotic OR erotica OR hentai OR nude OR nudes OR nudity OR naked OR sex OR sexy OR sexual OR fetish OR stag OR shunga OR stripper OR striptease OR playboy OR onlyfans OR lingerie OR bikini OR hardcore OR softcore OR uncensored";
  const BASE = `-collection:(tvarchive OR tvnews OR inlibrary OR printdisabled OR lendinglibrary OR hentaiarchive) -access-restricted-item:true -subject:(${NSFW}) -title:(${NSFW})`;
  // «Curated archives», the default scope: film, TV and photo collections kept by archives, museums and agencies.
  // «Whole archive» adds the community uploads, where most hits are rips of films, anime and TV.
  NA.CURATED = "prelinger prelingerhomemovies ephemera usgovfilms FedFlix universal_newsreels nasa stock_footage feature_films silent_films Comedy_Films Film_Noir SciFi_Horror classic_tv classic_tv_commercials animationandcartoons more_animation classic_cartoons movie_trailers computerchronicles applemedia computercommercials videogamecommercials metropolitanmuseumofart-gallery clevelandart brooklynmuseum het-utrechts-archief maps_usgs picfreededphotos magazineart vintage-australian-print-ads Fine-Art-History";
  // Feature films, TV series and cartoons: left out of the documentary topics, where their subject tags
  // ("gold", "ship", "planet") would bury the real footage under westerns and B-movies.
  const FICTION = "feature_films feature_films_unsorted feature_films_picfixer SciFi_Horror Film_Noir Comedy_Films classic_tv animationandcartoons more_animation classic_cartoons movie_trailers television";
  // Inside (…) archive.org reads a space as AND, so collection lists are joined with OR.
  const colQ = (list) => `collection:(${list.trim().split(/\s+/).join(" OR ")})`;
  const GOV_Q = "collection:(nasa OR FedFlix OR usgovfilms OR universal_newsreels OR jsc-pao-video-collection) OR identifier:gov.*";
  const FREE_Q = `(${GOV_Q} OR (collection:(prelinger OR prelingerhomemovies) AND licenseurl:(*publicdomain* OR *zero*)) OR year:[1800 TO ${AGE_LIMIT}])`;
  const OPEN_Q = `(${FREE_Q.slice(1, -1)} OR (licenseurl:(*publicdomain* OR *zero* OR *licenses\\/by\\/* OR *licenses\\/by-sa\\/*) AND -licenseurl:(*nc* OR *nd*)))`;

  // Words go to the title and subject tags: the full text pulls in films that mention a topic once.
  const T = (terms) => `(title:(${terms}) OR subject:(${terms}))`;
  NA.T = T;

  // A topic: { t: title/subject words, q: raw clause, c: collections, and: raw clause added with AND }
  // → { terms, cols, and }: the terms are searched inside the scope; the topic's own collections always count.
  NA.topicClause = function (tp) {
    const terms = [];
    if (tp.t) terms.push(T(tp.t));
    if (tp.q) terms.push(`(${tp.q})`);
    return { terms: terms.length > 1 ? `(${terms.join(" OR ")})` : terms[0] || "", cols: tp.c ? colQ(tp.c) : "", and: tp.and || "" };
  };

  NA.DECADES = [
    { id: "old", fa: "قبل از ۱۹۳۰", q: "year:[1800 TO 1929]" },
    { id: "1930", fa: "دهه‌ی ۳۰", q: "year:[1930 TO 1939]" },
    { id: "1940", fa: "دهه‌ی ۴۰", q: "year:[1940 TO 1949]" },
    { id: "1950", fa: "دهه‌ی ۵۰", q: "year:[1950 TO 1959]" },
    { id: "1960", fa: "دهه‌ی ۶۰", q: "year:[1960 TO 1969]" },
    { id: "1970", fa: "دهه‌ی ۷۰", q: "year:[1970 TO 1979]" },
    { id: "1980", fa: "دهه‌ی ۸۰", q: "year:[1980 TO 1989]" },
    { id: "1990", fa: "دهه‌ی ۹۰", q: "year:[1990 TO 1999]" },
    { id: "2000", fa: "۲۰۰۰ به بعد", q: "year:[2000 TO 2100]" },
  ];
  NA.SORTS = [
    { id: "popular", fa: "پربازدیدترین", sort: "downloads desc" },
    { id: "relevance", fa: "مرتبط‌ترین", sort: "" },
    { id: "oldest", fa: "قدیمی‌ترین", sort: "year asc" },
    { id: "newest", fa: "جدیدترین", sort: "year desc" },
    { id: "added", fa: "تازه آپلودشده", sort: "addeddate desc" },
  ];

  // { clause: string | topicClause(), scope: curated|all, fiction: bool, type: all|movies|image,
  //   licence: all|free|open, decade, sort }
  NA.buildQuery = function ({ clause, scope = "curated", fiction = true, type = "all", licence = "all", decade = "" }) {
    const cl = typeof clause === "string" ? { terms: clause, cols: "", and: "" } : clause;
    const scoped = cl.terms ? (scope === "all" ? cl.terms : `(${cl.terms} AND ${colQ(NA.CURATED)})`) : "";
    const core = [scoped, cl.cols].filter(Boolean).join(" OR ") || (scope === "all" ? "*:*" : colQ(NA.CURATED));
    let q = `(${core})`;
    if (cl.and) q += ` AND (${cl.and})`;
    if (!fiction) q += ` -${colQ(FICTION)}`;
    q += ` AND mediatype:(${type === "all" ? "movies OR image" : type}) ${BASE}`;
    if (licence === "free") q += ` AND ${FREE_Q}`;
    if (licence === "open") q += ` AND ${OPEN_Q}`;
    const dc = NA.DECADES.find((x) => x.id === decade);
    if (dc) q += ` AND ${dc.q}`;
    return q;
  };

  NA.FIELDS = ["identifier", "title", "year", "date", "mediatype", "licenseurl", "collection", "downloads", "creator", "item_size"];
  NA.searchUrl = function (opts, page = 1, rows = 36) {
    const sp = new URLSearchParams({ q: NA.buildQuery(opts), rows: String(rows), page: String(page), output: "json" });
    for (const f of NA.FIELDS) sp.append("fl[]", f);
    const s = NA.SORTS.find((x) => x.id === (opts.sort || "popular"));
    if (s && s.sort) sp.append("sort[]", s.sort);
    return `${API}/advancedsearch.php?${sp}`;
  };

  async function getJSON(url, tries = 3) {
    let err;
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(45000) : undefined });
        if (r.ok) return await r.json();
        err = new Error("HTTP " + r.status);
        if (r.status < 500 && r.status !== 429) break;
      } catch (e) {
        err = e;
      }
      await new Promise((res) => setTimeout(res, 1200 * (i + 1)));
    }
    throw err;
  }
  NA.getJSON = getJSON;

  NA.search = async function (opts, page = 1, rows = 36) {
    // archive.org sometimes answers 200 with {"error": "[BACKEND_ERROR] …"}; that passes after a moment
    for (let i = 0; ; i++) {
      const j = await getJSON(NA.searchUrl(opts, page, rows));
      if (j.response) return { total: j.response.numFound, docs: j.response.docs };
      if (i >= 2 || !/BACKEND|timeout|unavailable/i.test(String(j.error || ""))) throw new Error(j.error || "search failed");
      await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
    }
  };

  const metaCache = new Map();
  NA.metadata = function (id) {
    if (!metaCache.has(id)) metaCache.set(id, getJSON(`${API}/metadata/${encodeURIComponent(id)}`).catch((e) => { metaCache.delete(id); throw e; }));
    return metaCache.get(id);
  };

  NA.thumb = (id) => `${API}/services/img/${encodeURIComponent(id)}`;
  // archive.org's IIIF image server: a resized JPEG of any image file (it gives up with 504 on huge ones).
  NA.iiif = (id, name, w) => `https://iiif.archive.org/image/iiif/3/${encodeURIComponent(id + "/" + name)}/full/${w},/0/default.jpg`;
  NA.itemUrl = (id) => `${API}/details/${encodeURIComponent(id)}`;
  NA.fileUrl = (id, name) => `${API}/download/${encodeURIComponent(id)}/${name.split("/").map(encodeURIComponent).join("/")}`;

  // ---------------------------------------------------------------- files ----
  const VIDEO_EXT = /\.(mp4|m4v|mov|mpe?g|mpg|mxf|mkv|webm|avi|ogv|ts|m2ts|vob|dv|wmv|flv)$/i;
  const IMAGE_EXT = /\.(jpe?g|png|tiff?|gif|webp|jp2)$/i;
  const SKIP = /(^|\/)__ia_thumb|_thumb\.jpg$|\.thumbs\/|_itemimage|_meta\.|_files\.xml|\.torrent$|\.sqlite$|_spectrogram|\.afpk$/i;
  const num = (x) => (x == null || x === "" ? 0 : Number(x));

  // Seconds from "123.4" or "1:02:03".
  NA.seconds = function (len) {
    if (len == null) return 0;
    const s = String(len);
    if (!s.includes(":")) return Number(s) || 0;
    return s.split(":").reduce((a, p) => a * 60 + Number(p), 0);
  };

  // Item metadata → { videos: [{ name, url, w, h, len, size, format, original, preview }], images: [...], pdfs }
  // One entry per clip (archive.org keeps the upload plus several encodes of it): the original for download, and
  // the best browser-playable mp4 of the same clip for the preview player.
  NA.pickFiles = function (meta) {
    const id = meta.metadata.identifier;
    const all = meta.files || [];
    // archive.org's own small renders: frames under <name>.thumbs/ for videos, <name>_thumb.jpg for images.
    const framesOf = (name) => all.filter((f) => /Thumbnail/i.test(f.format || "") && f.original === name).map((f) => f.name).sort();
    const thumbOf = (name) => (all.find((f) => /JPEG Thumb/i.test(f.format || "") && f.original === name) || {}).name;
    const files = all.filter((f) => !SKIP.test(f.name));
    const vids = files.filter((f) => VIDEO_EXT.test(f.name) || /MPEG|h\.264|QuickTime|Matroska|Ogg Video|WebM|Cinepack|AVI/i.test(f.format || ""));
    const clips = new Map();
    for (const f of vids) {
      const key = (f.original || f.name).replace(/\.(ia\.)?[^./]+$/, "").replace(/_512kb$/i, "");
      if (!clips.has(key)) clips.set(key, []);
      clips.get(key).push(f);
    }
    const playable = (f) => /\.(mp4|m4v)$/i.test(f.name) || /h\.264|MPEG4/i.test(f.format || "");
    const videos = [];
    for (const group of clips.values()) {
      const tall = (f) => num(f.height) * 1e6 + num(f.size) / 1e6;
      const orig = group.filter((f) => f.source === "original").sort((a, b) => tall(b) - tall(a))[0];
      const best = orig || [...group].sort((a, b) => tall(b) - tall(a))[0];
      const prev = group.filter(playable).sort((a, b) => tall(b) - tall(a))[0];
      const frames = group.map((f) => framesOf(f.name)).find((x) => x.length) || [];
      videos.push({
        poster: frames.length ? NA.fileUrl(id, frames[Math.floor(frames.length * 0.4)]) : null,
        name: best.name, url: NA.fileUrl(id, best.name), w: num(best.width), h: num(best.height),
        len: NA.seconds(best.length || (prev && prev.length)), size: num(best.size), format: best.format || "",
        original: best.source === "original",
        preview: prev ? NA.fileUrl(id, prev.name) : null, previewName: prev ? prev.name : null,
        alts: group.filter((f) => f !== best).map((f) => ({ name: f.name, url: NA.fileUrl(id, f.name), w: num(f.width), h: num(f.height), size: num(f.size), format: f.format || "" })),
      });
    }
    videos.sort((a, b) => b.size - a.size);
    // Images, one entry per picture: museums upload a TIFF (often 80-500 MB, which no browser shows) and
    // archive.org adds a JPEG of it. Download rows offer both; the preview is a small displayable file, else an
    // IIIF render (archive.org's resizer), else the thumbnail.
    const DISPLAY = /\.(jpe?g|png|gif|webp)$/i;
    const imgs = files.filter((f) => (IMAGE_EXT.test(f.name) || /JPEG|PNG|TIFF|GIF/i.test(f.format || "")) && !/Thumb|Tile/i.test(f.format || "") && num(f.size) > 30000);
    const pics = new Map();
    for (const f of imgs) {
      const key = (f.original || f.name).replace(/\.[^./]+$/, "");
      if (!pics.has(key)) pics.set(key, []);
      pics.get(key).push(f);
    }
    const images = [];
    for (const group of pics.values()) {
      const byOrig = (a, b) => (b.source === "original") - (a.source === "original") || num(b.size) - num(a.size);
      const variants = [...group].sort(byOrig);
      const best = variants[0];
      const shows = group.filter((f) => DISPLAY.test(f.name)).sort((a, b) => num(a.size) - num(b.size));
      const t = group.map((f) => thumbOf(f.name)).find(Boolean);
      const thumb = t ? NA.fileUrl(id, t) : null;
      let preview = thumb;
      if (shows.length && num(shows[0].size) <= 4e6) preview = NA.fileUrl(id, shows[0].name);
      else if (shows.length || best) preview = NA.iiif(id, (shows[0] || best).name, 1400);
      images.push({
        name: best.name, url: NA.fileUrl(id, best.name), thumb, preview, w: num(best.width), h: num(best.height), size: num(best.size), format: best.format || "",
        variants: variants.map((f) => ({ name: f.name, url: NA.fileUrl(id, f.name), w: num(f.width), h: num(f.height), size: num(f.size), format: f.format || "", original: f.source === "original" })),
      });
    }
    images.sort((a, b) => b.size - a.size);
    const pdfs = files.filter((f) => /\.pdf$/i.test(f.name)).map((f) => ({ name: f.name, url: NA.fileUrl(id, f.name), size: num(f.size) }));
    return { videos, images, pdfs };
  };

  NA.quality = function (h) {
    if (!h) return "";
    if (h >= 2000) return "4K";
    if (h >= 1000) return "Full HD";
    if (h >= 700) return "HD";
    return "SD";
  };
  NA.fmtSize = function (b) {
    b = num(b);
    if (!b) return "";
    if (b >= 1073741824) return (b / 1073741824).toFixed(1) + " GB";
    if (b >= 1048576) return (b / 1048576).toFixed(b >= 104857600 ? 0 : 1) + " MB";
    return Math.max(1, Math.round(b / 1024)) + " KB";
  };
  NA.fmtTime = function (s) {
    s = Math.round(num(s));
    if (!s) return "";
    const p2 = (n) => String(n).padStart(2, "0");
    return s >= 3600 ? `${Math.floor(s / 3600)}:${p2(Math.floor(s / 60) % 60)}:${p2(s % 60)}` : `${Math.floor(s / 60)}:${p2(s % 60)}`;
  };

  // ---------------------------------------------------------------- Persian ----
  const FA_CHARS = /[؀-ۿ]/;
  // Words that carry no topic ("videos about the history of…"). Media words are read by the app as a type filter.
  NA.STOP_FA = /^(و|یا|در|از|به|با|که|را|رو|برای|این|آن|اون|یک|یه|های|ها|ی|درباره|درباره‌ی|راجع|مورد|تاریخ|تاریخچه|قدیمی|قدیم|قدیمی‌ترین|تاریخی|معروف|جالب|زیبا|فیلم|فیلمهای|عکس|عکسهای|تصویر|تصاویر|ویدیو|ویدئو|ویدیوهای|ویدئوهای|کلیپ|کلیپهای|فوتیج|آرشیو|آرشیوی|میخوام|می‌خوام|بده|بیار|پیدا|کن)$/;
  NA.MEDIA_FA = { image: /(^|\s)(عکس|عکسهای|عکس‌های|تصویر|تصاویر)(\s|$)/, movies: /(^|\s)(فیلم|فیلمهای|فیلم‌های|ویدیو|ویدئو|ویدیوهای|کلیپ|فوتیج)(\s|$)/ };
  NA.hasPersian = (s) => FA_CHARS.test(s);
  NA.normFa = (s) =>
    String(s)
      .replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/ة/g, "ه").replace(/[ؤ]/g, "و").replace(/[إأآ]/g, (c) => (c === "آ" ? "آ" : "ا"))
      .replace(/[ً-ٰٟ]/g, "")
      .replace(/[‌‏‎]/g, " ")
      .replace(/[۰-۹]/g, (d) => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)])
      .replace(/[٠-٩]/g, (d) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
      .replace(/[،,؛;:!؟?«»"()\[\]]/g, " ")
      .replace(/\s+/g, " ").trim();

  const DECADE_WORDS = { "بیست": 1920, "سی": 1930, "چهل": 1940, "پنجاه": 1950, "شصت": 1960, "هفتاد": 1970, "هشتاد": 1980, "نود": 1990 };
  NA.decadeId = (y) => (y < 1930 ? "old" : y >= 2000 ? "2000" : String(Math.floor(y / 10) * 10));

  // Persian text → English search terms via the phrase dictionary (longest phrase first). Latin words pass through.
  // "دهه‌ی ۵۰" / "دهه پنجاه" become a decade filter and a four-digit year a year filter. Phrases are AND-ed, or
  // OR-ed when the person wrote «و» / «یا» between them ("بورس و وال‌استریت" means either).
  // → { en, parts: [{ fa, en }], unknown: [fa words], decade, year }
  NA.translate = function (text, dict) {
    let norm = NA.normFa(text), decade = "", year = 0;
    norm = norm.replace(/دهه( ی)? (\d{2,4}|بیست|سی|چهل|پنجاه|شصت|هفتاد|هشتاد|نود)( میلادی)?/, (m, _i, d) => {
      let y = DECADE_WORDS[d] || Number(d);
      if (y < 100) y += 1900;
      if (y >= 1800 && y < 2100) decade = NA.decadeId(y);
      return " ";
    });
    norm = norm.replace(/(^| )(1[89]\d\d|20[0-2]\d)( |$)/, (m, a, y, b) => { year = Number(y); return " "; });
    const orJoin = / (و|یا) /.test(` ${norm} `);
    const words = norm.split(" ").filter(Boolean);
    const idx = NA._dictIdx || (NA._dictIdx = (() => {
      const m = new Map();
      let maxN = 1;
      for (const [k, v] of Object.entries(dict)) {
        const nk = NA.normFa(k);
        m.set(nk, v);
        maxN = Math.max(maxN, nk.split(" ").length);
      }
      return { m, maxN };
    })());
    const parts = [], unknown = [];
    const stem = (w) => [w, w.replace(/(های|ها|ان|ات)$/, ""), w.replace(/ی$/, ""), w.replace(/(های|ها)ی?$/, "")];
    for (let i = 0; i < words.length; ) {
      if (!FA_CHARS.test(words[i])) { parts.push({ fa: words[i], en: words[i] }); i++; continue; }
      let hit = null;
      for (let n = Math.min(idx.maxN, words.length - i); n >= 1 && !hit; n--) {
        const phrase = words.slice(i, i + n).join(" ");
        for (const cand of n === 1 ? stem(phrase) : [phrase, phrase.replace(/(های|ها)$/, "")]) {
          if (idx.m.has(cand)) { hit = { fa: phrase, en: idx.m.get(cand), n }; break; }
        }
      }
      if (hit) { parts.push({ fa: hit.fa, en: hit.en }); i += hit.n; }
      else { if (!NA.STOP_FA.test(words[i])) unknown.push(words[i]); i++; }
    }
    // Each Persian phrase may map to several alternatives ("a|b"): OR them; phrases are AND-ed.
    const en = parts
      .map((p) => {
        const alts = String(p.en).split("|").map((a) => (/\s/.test(a.trim()) && !/^".*"$/.test(a.trim()) ? `"${a.trim()}"` : a.trim()));
        return alts.length > 1 ? `(${alts.join(" OR ")})` : alts[0];
      })
      .join(orJoin ? " OR " : " AND ");
    return { en, parts, unknown, decade, year };
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
