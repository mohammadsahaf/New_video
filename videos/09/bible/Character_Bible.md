# Character_Bible.md · انجیل شخصیت‌ها · ویدیو ۰۹

> توضیح هر شخصیت (بلوک `DESC`) را **عین‌به‌عین** در هر پرامپت تکرار کن. ظاهر ثابت می‌ماند.
> شیت هر شخصیت = یک تصویر چندزاویه برای **Ingredients** گوگل فلو. بعد از تأیید، اسم فایل را عوض نکن.
> صدا: مدل `eleven_v3`، فارسی. صدا را یک بار انتخاب کن و Voice ID را در `voices.md` بنویس (نه کلید API).

## پرامپت پایه‌ی شیت (برای همه)
```
Character reference turnaround sheet on a plain neutral warm-grey studio backdrop, four views of the SAME person side by side: full-body front, full-body three-quarter, full-body profile, and a head-and-shoulders close-up with mouth slightly open as if speaking. Even soft overcast light, no shadows on face, sharp focus, photorealistic skin, historically accurate Early Dynastic Sumerian costume, c. 2700 BC. No text, no labels.
```
(بعد از این، بلوک DESC شخصیت را بچسبان.)

---
### CHAR_01A · گیلگمش، شاه (پرده‌ی ۱ و ۲ الف)
- **سن و قامت:** ۳۵، بسیار بلند (دو سر از بقیه بلندتر)، شانه‌ی پهن، عضله‌ی واقعی کارگری نه بدنساز.
- **DESC:**
```
CHAR_01A Gilgamesh, king of Uruk, age 35, towering broad-shouldered man, deep olive sun-darkened skin, heavy brow, intense dark brown eyes, slightly hooked nose, long thick black beard falling to mid-chest in loose natural waves held by two thin gold rings near the chin, long black hair gathered in a low chignon bound with a plain gold band, upper lip clearly visible above the beard. Bare muscular chest with a faded scar across the left collarbone. Wears a knee-length tufted sheep-wool kaunakes skirt in undyed cream, a broad leather belt, a heavy bronze axe on the hip, lapis and carnelian bead collar. Proud, restless, arrogant gaze.
```
- **صدا:** مرد ۳۵ تا ۴۵، بم و پرقدرت، کمی مغرور، سرعت متوسط.
- **فایل:** `ING_CHAR_01A.png`

### CHAR_01B · گیلگمش، سرگردان (از مرگ انکیدو تا پایان)
- **همان چهره‌ی CHAR_01A.** فقط این‌ها عوض می‌شود:
```
CHAR_01B Gilgamesh the wanderer, the SAME man as CHAR_01A, now gaunt and hollow-cheeked, sunken red-rimmed eyes, beard grown wild and matted with salt and dust (gold rings gone), hair loose and tangled to the shoulders, cracked sunburnt lips still clearly visible. Wears a raw untanned lion skin over his shoulders with the lion's head hanging on his back, a torn wool skirt, bare bleeding feet, carries a bronze axe and a dagger.
```
- **صدا:** همان صدای ۰۱A، با تنظیم Stability پایین‌تر و تگ `[hoarse, exhausted]`.
- **فایل:** `ING_CHAR_01B.png`

### CHAR_02 · انکیدو
```
CHAR_02 Enkidu, age 30, broad heavy-boned wild man, sun-cracked dark bronze skin covered in coarse body hair, long matted brown-black hair falling to the waist like a woman's, short rough beard trimmed so the mouth is visible, warm innocent amber-brown eyes, scar on the right eyebrow. Early: naked except a loose antelope hide around the hips, clay and grass on his skin. Later (after Shamhat): hair braided back, dressed in a simple brown wool kaunakes skirt and leather belt, copper dagger.
```
- دو نسخه‌ی شیت: `ING_CHAR_02_WILD.png` و `ING_CHAR_02_CITY.png`
- **صدا:** مرد ۳۰، زبر، گرم، ساده؛ اول جمله‌ها کوتاه و شکسته.

### CHAR_03 · شمخت، کاهنه‌ی معبد ایشتر
```
CHAR_03 Shamhat, temple priestess of Ishtar, age 28, calm self-assured woman, warm brown skin, kohl-lined dark eyes, thick black hair in a high rolled coiffure with a headdress of thin gold leaves and lapis beads (Queen Puabi style), long draped undyed linen robe leaving the right shoulder bare, heavy carnelian bead necklace, small gold ring earrings. Gentle knowing smile.
```
- **صدا:** زن ۲۵ تا ۳۰، آرام، گرم، مطمئن. **فایل:** `ING_CHAR_03.png`

### CHAR_04 · ایشتر، الهه
```
CHAR_04 Ishtar, goddess of love and war, appears as a tall striking woman, age indeterminate, flawless but real skin with faint gold dust on cheekbones, cold almond-shaped black eyes, black hair under a tall horned crown of four stacked pairs of bronze horns (Mesopotamian sign of divinity), layered flounced wool robe dyed deep red, an eight-pointed star pendant of gold, a pair of bronze maces crossed on her back. Lit always from below by firelight. Beautiful and dangerous.
```
- **صدا:** زن، سرد و شیرین، آهسته، نجوای خطرناک. **فایل:** `ING_CHAR_04.png`

### CHAR_05 · سیدوری، میخانه‌دار کنار دریا
```
CHAR_05 Siduri, alewife at the edge of the world, age 50, sturdy kind-faced woman, deep laugh lines, grey-streaked black hair under a long dark-blue wool veil that frames but does not cover the mouth, simple undyed wool robe with a stained apron, carries a large clay beer jar with a reed drinking straw, copper bangles.
```
- **صدا:** زن ۵۰، مادرانه، غمگین، آرام. **فایل:** `ING_CHAR_05.png`

### CHAR_06 · اورشنابی، قایقران
```
CHAR_06 Urshanabi, ferryman of the Waters of Death, age 60, lean sinewy old boatman, leathery deeply wrinkled sunburnt face, short white beard cropped close so the lips are visible, pale grey watchful eyes, shaved head under a brown felt skullcap, rope-burn calluses on his hands, plain brown wool tunic-skirt tied with rope, always holding a long wooden punting pole.
```
- **صدا:** مرد ۶۰، کم‌حرف، نجوا، خشک. **فایل:** `ING_CHAR_06.png`

### CHAR_07 · اوتناپیشتیم، بازمانده‌ی طوفان
```
CHAR_07 Utnapishtim the Faraway, survivor of the Great Flood, extremely old man who looks 100, paper-thin translucent skin, deep-set milky but alert eyes, very long thin white beard combed straight down and parted around the mouth, long white hair, simple bleached linen robe, sits on a reed mat, hands like old roots. Serene, tired, almost transparent.
```
- **صدا:** مرد بسیار پیر، شکسته، آهسته، با مکث. **فایل:** `ING_CHAR_07.png`
- **نسخه‌ی جوان (فقط فلش‌بک طوفان):** همان چهره، ۴۵ ساله، ریش سیاه. `ING_CHAR_07_YOUNG.png`

### NARR · کاتب (سین‌لِقه‌اونّینی)
```
NARR the Scribe Sin-leqi-unninni, age 70, frail old Babylonian scribe, shaved head, long grey beard, linen shawl, ink-dark fingertips, seen only as hands, silhouette and candlelit profile over clay tablets.
```
- **صدا:** راوی پیر، بم، گرم، آرام (بدون لب). **فایل:** `ING_NARR.png`

### صداهای بدون چهره
- **VO_HUMB هومبابا:** صدای بم مردانه، Pitch پایین، با لایه‌ی نفس حیوانی و غرش (افکت جدا).
- **CHAR_08 جرج اسمیت (کُدا، بی‌دیالوگ):**
```
CHAR_08 George Smith, Victorian Assyriologist, London 1872, age 32, thin pale man, neat dark side-parted hair, full dark beard and moustache, round wire spectacles, black frock coat and waistcoat, white shirt, holding a broken clay tablet under a brass oil lamp.
```
