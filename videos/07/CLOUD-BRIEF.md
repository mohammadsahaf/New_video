# کار ابری ویدیو ۰۷ · ایلام (ساخت، بازبینی، رندر)

هدف: از نریشن و تصویرهای آماده، ویدیوی ۲۵ دقیقه‌ای ۱۰۸۰p بساز. کامپیوتر کاربر ضعیف است (۸ گیگ رم) و کار سنگین آنجا قطع می‌شد، پس همه‌ی رندر و whisper اینجا انجام شود. کد اصلی آماده است: `src/v07/` (الگو: `src/v06`). **قبل از هر کار `.claude/skills/nfp-alvana/SKILL.md` و `CLAUDE.md` را بخوان.** با کاربر فارسی و خیلی کوتاه حرف بزن؛ بدون سؤال جلو برو و آخر با `deliver` تحویل بده.

## ورودی‌ها (نسخه‌ی سبک در `cloud/v07/`)
- `cloud/v07/narration/v07-01..16.mp3` نریشن نهایی (Adam Stone). `v07-01.json` زمان‌بندی بخش ۱ (whisper.cpp).
- `cloud/v07/img/P001..P139.jpg` (۱۳۹ عکس، ۲۰۰۰px) و `cloud/v07/clips/P###.mp4` (۴۴ کلیپ ۷۲۰p بی‌صدا؛ P090 کلیپ ندارد). عکس‌های واقعی موزه‌ها در `public/v07/art/` (اعتبار: `videos/07/CREDITS.md`).
- فهرست جمله‌به‌جمله `videos/07/shot-list.md`، متن نریشن `videos/07/narration-elevenlabs.md`.

## مراحل (ترتیب را به‌هم نزن؛ هر دستور حداکثر ~۱۰ دقیقه)
1. کپی ورودی‌ها: `mkdir -p uploads/v07 && cp -rn cloud/v07/img cloud/v07/clips cloud/v07/narration uploads/v07/`
2. `bash scripts/cloud-setup.sh` و `pip install faster-whisper`.
3. زمان‌بندی کلمه‌ها: `python src/v07/whisper_words.py large-v3` (بخش‌ها را دسته‌دسته، در پس‌زمینه با `nohup`؛ فایل‌های موجود را رد می‌کند). اگر مدل دانلود نشد، Network access را بررسی کن یا `medium` بزن.
4. `python src/v07/align.py` ← `src/v07/vo.json` و `public/v07/voice.mp3`. خروجی «matched» هر بخش باید بالای ~۸۵٪ باشد؛ اگر پایین بود مدل را عوض کن.
5. `bash src/v07/prepare.sh` ← `public/v07/img` و `clips` (۱۰۸۰p/۳۰fps).
6. `python src/v07/plan.py` ← `src/v07/plan.json`؛ `npx tsc --noEmit` باید بدون خطا باشد.
7. **بازبینی فریم‌ها:** `V07-Look` با `--scale=0.5` (نقشه‌ها M1…M17، کارت‌ها، عنوان بخش‌ها، چند شات). کانتکت‌شیت بساز و ایرادها را درست کن: نقشه‌ها (برچسب‌ها، رنگ، مرز تقریبی)، کارت‌های بلند، فاصله‌ی متن با زیرنویس، عکس واقعی روی زمینه‌ی تیره. بعد کانتکت‌شیت را با `deliver` برای کاربر بفرست.
8. رندر: `RENDER_BUDGET_SEC=480 node tools/render-chunks.mjs V07-Silent <FRAMES> out/chunks out/v07-silent.mp4 150 --muted` (FRAMES = `ceil((total+1.5)*30)`، حدود ۴۵ هزار). کد خروج 3 یعنی ادامه دارد؛ همان دستور را تکرار کن تا تمام شود. تا رندر تمام نشده نوبتت را تمام نکن. رندر کامل چند ساعت است.
9. صدا: موزیک آرام و حماسی از `alvana-audio` (طبق `AUDIO.md`، موزیک زیر نریشن، ۳۱- دسی‌بل)، افکت‌های کم، میکس با `tools/mix.mjs`. سپس با ffmpeg: ویدیوی بی‌صدا + میکس، گرین فیلم ظریف یک‌بار، −14 LUFS.
10. تحویل: `node tools/deliver.mjs out/v07-final.mp4 --title "ایلام v07"`؛ لینک‌ها را به کاربر بده. بعد کاور، تامبنیل (`.claude/skills/video-covers`)، توضیحات یوتیوب با اعتبار عکس‌ها (`CREDITS.md`) و ۳ ریلز.

## قانون‌ها
- ثابت‌ها: ۱۶:۹، ۳۰fps، زیرنویس کلمه‌به‌کلمه، رنگ‌های طلایی/مرمر. لحن تاریخی: به «اَنشان»، «آشوربانیپال»، «چُغازَنبیل» همان املا.
- برچسب AI: نریشن ElevenLabs و صحنه‌های واقع‌نما؛ در گزارش آخر یک خط بنویس.
- چیزی بالای ۹۵MB یا `.env` commit نشود. `out/` و `public/v07/` commit نمی‌شوند.
