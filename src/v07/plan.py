# V07 shot planner: narration timing (vo.json) + the sentence-by-sentence list (videos/07/shot-list.md) -> plan.json
# shots (image / clip / real artifact on screen), scenes (map / card / chapter title). Run from the repo root: python src/v07/plan.py
import json, re, os, math, subprocess
ARTSIZE = {}
ROOT = os.path.dirname(os.path.abspath(__file__)) + '/../..'
os.chdir(ROOT)
vo = json.load(open('src/v07/vo.json', encoding='utf8'))
segs, total = vo['segs'], vo['total']
byk = {(s['ch'], s['pi']): s for s in segs}
CLIPLEN = 6.0

# ---- cards (T) · text, sub-line, full-screen?
CARDS = {
 (1, 9): ('ایلام', 'نامی که پاک نشد', 'title'),
 (1, 10): ('«شاه اَنشان»', 'کوروش بزرگ', False),
 (3, 5): ('یک زبانِ بی‌خانواده', 'ایلامی: یک نقطه‌ی تنها', True),
 (4, 4): ('نامِ پادشاهان', 'میخی ↔ ایلامی خطی', False),
 (4, 6): ('یک نام', 'از دلِ گِل بیرون آمد', True),
 (5, 1): ('آونگ', 'بین‌النهرین ⇄ ایلام', True),
 (6, 7): ('سه کرسیِ قدرت', 'برادر ← برادر · پسرِ خواهر', False),
 (6, 8): ('«پدر»', 'لقبِ پادشاهانِ بین‌النهرین برای سوکل‌مخِ ایلام', False),
 (6, 11): ('۶۰۰ سال', 'کینه‌ی ایلام از حمورابی', True),
 (7, 5): ('۵۰ متر', 'برابرِ یک برجِ ۱۵ طبقه', False),
 (7, 8): ('۱۹۷۹', 'ثبتِ چُغازَنبیل در فهرست جهانی یونسکو', False),
 (7, 12): ('«هر کس اسمِ من را پاک کند…\nخدایانِ بزرگ نامش را نابود کنند»', 'نفرینِ ملکه ناپیرآسو', True),
 (7, 14): ('شوتروک · آشوربانیپال · زمان', 'سه چهره‌ی آینده', True),
 (8, 2): ('آونگ', 'دوباره حرکت کرد', True),
 (8, 10): ('«من شوتروک ناهونْتِه هستم…»', 'کتیبه‌ی روی سنگِ نَرام‌سین', False),
 (8, 11): ('۱۱۰۰ سال فاصله', 'نَرام‌سین ↔ شوتروک ناهونْتِه', True),
 (9, 8): ('۱۱۵۸ پیش از میلاد ← ۱۹۰۱ میلادی', 'زیرِ خاکِ شوش', True),
 (9, 9): ('سه تکه سنگِ سیاه', 'شوش · زمستان ۱۹۰۱', False),
 (13, 8): ('سرِ تِئومان', 'به نینوا رسید', True),
 (14, 1): ('طنزی تلخ', '', True),
 (15, 5): ('«شاه اَنشان»', 'استوانه‌ی کوروش', True),
 (16, 6): ('یک پرسش برای شما', '', True),
 (16, 8): ('تاریخ جاوید', 'اینجا، تاریخ جاویده', True),
}
# ---- maps (M) · id used by map.tsx
MAPS = {(1, 14): 'M1', (2, 1): 'M2', (2, 2): 'M2r', (2, 5): 'M3', (3, 2): 'M4', (5, 2): 'M5', (5, 3): 'M6', (5, 8): 'M7',
        (6, 9): 'M8', (8, 3): 'M9', (9, 4): 'M10', (10, 1): 'M11', (10, 2): 'M12', (11, 9): 'M13', (14, 2): 'M14', (14, 3): 'M15',
        (15, 6): 'M16', (16, 7): 'M17'}
# ---- real artifacts that exist in public/v07/art (name -> file); a missing one is skipped
ART = {n[:-4] for n in os.listdir('public/v07/art')} if os.path.isdir('public/v07/art') else set()
ARTALIAS = {'chogha': 'chogha-model', 'chogha-wide': 'chogha-model', 'hammurabi-top': 'hammurabi-top'}

# ---- parse the shot list
items = {}
for ln in open('videos/07/shot-list.md', encoding='utf8'):
    m = re.match(r'- \*\*(\d\d)\.(\d\d)\*\*.*?←\s*(.*)$', ln.strip())
    if not m: continue
    ch, pi, rest = int(m.group(1)), int(m.group(2)), m.group(3)
    its = []
    for part in [x.strip() for x in rest.split('·')]:
        pm = re.match(r'P(\d{3})(\s*🎥)?', part)
        if pm: its.append(('P', int(pm.group(1)), bool(pm.group(2)))); continue
        if part.startswith('A:'):
            name = part[2:].strip().split(' ')[0]
            name = ARTALIAS.get(name, name)
            its.append(('A', name, None)); continue
    items[(ch, pi)] = its

clips = {int(f[1:4]) for f in os.listdir('uploads/v07/clips') if re.fullmatch(r'P\d{3}\.mp4', f)}
imgs = {int(f[1:4]) for f in os.listdir('uploads/v07/img') if re.fullmatch(r'P\d{3}\.jpg', f)}

# ---- spans: boundary halfway between the end of a paragraph and the start of the next
order = sorted(byk)
spans = {}
for i, k in enumerate(order):
    s = byk[k]
    a = 0.0 if i == 0 else (byk[order[i - 1]]['end'] + s['start']) / 2
    b = total + 1.0 if i == len(order) - 1 else (s['end'] + byk[order[i + 1]]['start']) / 2
    spans[k] = (a, b)

shots, scenes, used = [], [], {}
MV = [([0.5, 0.45], [0, 0], 1.0, 0.10), ([0.42, 0.5], [0.08, 0], 1.08, 0.04), ([0.58, 0.5], [-0.08, 0], 1.08, 0.04), ([0.5, 0.55], [0, -0.05], 1.14, -0.08)]
def still(name, a, b, kind='i', art=False, seed=0):
    f, pa, z, pu = MV[seed % 4]
    sh = {'name': name, 'at': round(a, 2), 'until': round(b, 2), 'focus': f, 'pan': pa, 'zoom': z, 'push': pu}
    if art:
        sh['art'] = True
        nm = name[2:]
        if nm not in ARTSIZE:
            w, h = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', f'public/v07/art/{nm}.jpg']).decode().strip().split('x')
            ARTSIZE[nm] = (int(w), int(h))
        sh['w'], sh['h'] = ARTSIZE[nm]
    return sh

seed = 0
for k in order:
    ch, pi = k
    a, b = spans[k]; L = b - a
    its = items.get(k, [])
    if pi == 1 and ch > 1:
        scenes.append({'kind': 'chapter', 'n': ch, 'at': round(a + 0.2, 2), 'until': round(a + 3.4, 2)})
    mapid = MAPS.get(k)
    card = CARDS.get(k)
    vis = [x for x in its if (x[0] == 'P' and x[1] in imgs) or (x[0] == 'A' and x[1] in ART)]
    # time budget: a map takes the tail of the paragraph (all of it when there is nothing else)
    pic_b = b
    if mapid:
        if vis: pic_b = a + L * 0.4
        else: pic_b = a
        scenes.append({'kind': 'map', 'id': mapid, 'at': round(pic_b, 2), 'until': round(b, 2)})
    La = pic_b - a
    if La > 0.4:
        if not vis:
            shots.append({'name': 'black', 'at': round(a, 2), 'until': round(pic_b, 2)})
        else:
            n = len(vis)
            # a long paragraph with one picture: give it a second camera move
            parts = []
            for it in vis: parts.append(it)
            tgt = max(n, math.ceil(La / 6.5))
            if tgt > n:  # repeat the last still with a new move (clip -> its still frame afterwards)
                extra = tgt - n
                for _ in range(extra): parts.append(('R', vis[-1], None))
            m = len(parts)
            for j, it in enumerate(parts):
                a0, b0 = a + La * j / m, a + La * (j + 1) / m
                seed += 1
                if it[0] == 'A':
                    shots.append(still('a:' + it[1], a0, b0, art=True, seed=seed))
                elif it[0] == 'P':
                    num, isclip = it[1], it[2] and it[1] in clips
                    d = b0 - a0
                    if isclip:
                        rate = 1.0 if CLIPLEN >= d else max(0.55, (CLIPLEN - 0.1) / d)
                        sh = {'name': f'c{num:03d}', 'at': round(a0, 2), 'until': round(b0, 2), 'from': 0.0, 'rate': round(rate, 3), 'zoom': 1.0, 'push': 0.03}
                        # clip shorter than the slot even at the slowest rate: finish on the still frame
                        if CLIPLEN / 0.55 < d - 0.2:
                            cut = a0 + CLIPLEN / 0.55 - 0.1
                            sh['until'] = round(cut, 2)
                            shots.append(sh)
                            shots.append(still(f'i{num:03d}', cut, b0, seed=seed))
                            continue
                        shots.append(sh)
                    else:
                        shots.append(still(f'i{num:03d}', a0, b0, seed=seed))
                else:  # R: the same picture again, other camera move
                    base = it[1]
                    nm = ('a:' + base[1]) if base[0] == 'A' else f'i{base[1]:03d}'
                    shots.append(still(nm, a0, b0, art=base[0] == 'A', seed=seed + 2))
    if card:
        tx, sub, full = card
        if full == 'title': full = True
        dur = (b - a) if full is True else min(b - a, 4.6)
        scenes.append({'kind': 'card', 'text': tx, 'sub': sub, 'at': round(a + 0.15, 2), 'until': round(a + 0.15 + dur - 0.2, 2), 'full': bool(full), 'title': card[2] == 'title'})

shots.sort(key=lambda s: s['at'])
json.dump({'total': total, 'shots': shots, 'scenes': scenes}, open('src/v07/plan.json', 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(len(shots), 'shots;', sum(s['kind'] == 'map' for s in scenes), 'maps;', sum(s['kind'] == 'card' for s in scenes), 'cards;', 'images used', len({s['name'] for s in shots if s['name'][0] in 'ic'}), 'art', len({s['name'] for s in shots if s['name'][:2] == 'a:'}))
missing = [(k, x) for k, its in items.items() for x in its if (x[0] == 'P' and x[1] not in imgs) or (x[0] == 'A' and x[1] not in ART)]
print('skipped (not found):', missing)
