# V07 narration aligner: whisper word times (uploads/v07/narration/timing/v07-NN.json) + the script text
# (videos/07/narration-elevenlabs.md) -> src/v07/vo.json { total, segs:[{n,ch,pi,start,end}], words:[{w,s,e,line}] }
# and public/v07/voice.mp3 (16 sections joined with a short pause). line = global paragraph number (1-based).
# Run from the repo root:  python src/v07/align.py
import json, re, os, subprocess, difflib, glob
ROOT = os.path.dirname(os.path.abspath(__file__)) + '/../..'
os.chdir(ROOT)
GAP = 0.6      # silence between sections (s)
LEAD = 0.8     # silence before the first word
TAIL = 1.5

TAGS = re.compile(r'\[[a-z ]+\]')
def clean(w):
    w = re.sub(r'[ً-ٰٟ‌‍]', '', w)          # harakat, ZWNJ
    w = re.sub(r'[،؛؟!?.,:;«»"\'()\-–—…]', '', w)
    return w.replace('ي', 'ی').replace('ك', 'ک').replace('ْ', '').strip()

# ---- script: sections -> paragraphs -> words
md = open('videos/07/narration-elevenlabs.md', encoding='utf8').read()
secs = re.findall(r'## بخش (\d+)[^\n]*\n```\n(.*?)\n```', md, re.S)
SCRIPT = {}
for n, body in secs:
    paras = [TAGS.sub('', p).strip() for p in body.split('\n\n') if p.strip()]
    SCRIPT[int(n)] = paras

def sim(a, b):
    if a == b: return 1.0
    if not a or not b: return 0.0
    return difflib.SequenceMatcher(None, a, b).ratio()

def align(sw, ww):
    """Needleman-Wunsch: script words sw (strings) vs whisper words ww [(text,s,e)] -> list of (s,e) or None per script word"""
    n, m = len(sw), len(ww)
    S = [[0.0] * (m + 1) for _ in range(n + 1)]
    B = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1): B[i][0] = 1
    for j in range(1, m + 1): B[0][j] = 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            r = sim(sw[i - 1], ww[j - 1][0])
            d = S[i - 1][j - 1] + (r * 2 - 0.9 if r >= 0.5 else -0.6)
            u = S[i - 1][j] - 0.3
            l = S[i][j - 1] - 0.3
            best = max(d, u, l)
            S[i][j] = best
            B[i][j] = 0 if best == d else (1 if best == u else 2)
    out = [None] * n
    i, j = n, m
    while i > 0 or j > 0:
        b = B[i][j]
        if i > 0 and j > 0 and b == 0:
            if sim(sw[i - 1], ww[j - 1][0]) >= 0.5: out[i - 1] = (ww[j - 1][1], ww[j - 1][2])
            i -= 1; j -= 1
        elif i > 0 and (b == 1 or j == 0): i -= 1
        else: j -= 1
    return out

def fill(times, dur):
    """interpolate unmatched words between matched neighbours, by character length"""
    n = len(times)
    idx = [i for i, t in enumerate(times) if t]
    if not idx: return None
    res = list(times)
    def span(a, b, t0, t1):            # words a..b-1 share [t0,t1]
        tot = sum(max(1, len(W[k])) for k in range(a, b)) or 1
        c = t0
        for k in range(a, b):
            d = (t1 - t0) * max(1, len(W[k])) / tot
            res[k] = (c, c + d); c += d
    return span, res, idx

durs = {}
segs, words, line = [], [], 0
T = LEAD
chapters = {}
for n in sorted(SCRIPT):
    f = f'uploads/v07/narration/timing/v07-{n:02d}.json'
    mp3 = f'uploads/v07/narration/v07-{n:02d}.mp3'
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).decode())
    durs[n] = d
    j = json.load(open(f, encoding='utf8')) if os.path.exists(f) else None
    ww = []
    if j:
        for it in j['transcription']:
            t = clean(it['text'])
            if t: ww.append((t, it['offsets']['from'] / 1000, it['offsets']['to'] / 1000))
    # all script words of the section, remembering the paragraph
    W, P, raw = [], [], []
    for pi, para in enumerate(SCRIPT[n]):
        for w in para.split():
            c = clean(w)
            if c: W.append(c); P.append(pi); raw.append(w)
    if ww:
        t = align(W, ww)
    else:
        t = [None] * len(W)
    # interpolate
    res = list(t)
    anchors = [i for i, x in enumerate(t) if x]
    if not anchors:   # no timing: spread evenly
        tot = sum(len(w) for w in W); c = 0
        for i, w in enumerate(W):
            a = d * c / tot; c += len(w); res[i] = (a, d * c / tot)
    else:
        def span(a, b, t0, t1):
            tot = sum(max(1, len(W[k])) for k in range(a, b)) or 1; c = t0
            for k in range(a, b):
                dd = (t1 - t0) * max(1, len(W[k])) / tot; res[k] = (c, c + dd); c += dd
        span(0, anchors[0], 0.0, t[anchors[0]][0]) if anchors[0] > 0 else None
        for x, y in zip(anchors, anchors[1:]):
            if y - x > 1: span(x + 1, y, t[x][1], t[y][0])
        if anchors[-1] < len(W) - 1: span(anchors[-1] + 1, len(W), t[anchors[-1]][1], max(t[anchors[-1]][1], d))
    # monotone, non-overlapping
    last = 0.0
    for i in range(len(res)):
        a, b = res[i]
        a = max(a, last); b = max(b, a + 0.05); res[i] = (a, b); last = b
    # whisper token ends are sloppy: a word lasts until the next one starts (long pauses stay as pauses)
    for i in range(len(res) - 1):
        a, b = res[i]; nxt = res[i + 1][0]
        res[i] = (a, max(a + 0.08, min(nxt - 0.02, a + 1.3)))
    # paragraph segments
    base = T
    for pi in range(len(SCRIPT[n])):
        ids = [i for i in range(len(W)) if P[i] == pi]
        if not ids: continue
        line += 1
        a = res[ids[0]][0]; b = res[ids[-1]][1]
        segs.append({'n': line, 'ch': n, 'pi': pi + 1, 'start': round(base + a, 3), 'end': round(base + b, 3)})
        for i in ids:
            words.append({'w': raw[i], 's': round(base + res[i][0], 3), 'e': round(base + res[i][1], 3), 'line': line})
    chapters[n] = {'start': round(base, 3), 'end': round(base + d, 3), 'matched': sum(1 for x in t if x), 'words': len(W)}
    T = base + d + GAP
total = T - GAP + TAIL
json.dump({'total': round(total, 3), 'segs': segs, 'words': words, 'chapters': chapters}, open('src/v07/vo.json', 'w', encoding='utf8'), ensure_ascii=False)
print('total', round(total, 1), 's =', round(total / 60, 2), 'min;', len(segs), 'paragraphs;', len(words), 'words')
for n, c in chapters.items(): print(n, c)

# ---- the joined narration: LEAD silence, sections with GAP between, TAIL
os.makedirs('public/v07', exist_ok=True)
parts = ['-f', 'lavfi', '-t', str(LEAD), '-i', 'anullsrc=r=44100:cl=mono']
inputs, fil = [], ['[0:a]aresample=44100[s0]']
k = 1; labels = ['[s0]']
for n in sorted(SCRIPT):
    inputs += ['-i', f'uploads/v07/narration/v07-{n:02d}.mp3']
    fil.append(f'[{k}:a]aresample=44100,aformat=channel_layouts=mono[a{k}]'); labels.append(f'[a{k}]'); k += 1
    if n != max(SCRIPT):
        inputs += ['-f', 'lavfi', '-t', str(GAP), '-i', 'anullsrc=r=44100:cl=mono']
        fil.append(f'[{k}:a]aresample=44100[a{k}]'); labels.append(f'[a{k}]'); k += 1
inputs += ['-f', 'lavfi', '-t', str(TAIL), '-i', 'anullsrc=r=44100:cl=mono']
fil.append(f'[{k}:a]aresample=44100[a{k}]'); labels.append(f'[a{k}]')
fg = ';'.join(fil) + ';' + ''.join(labels) + f'concat=n={len(labels)}:v=0:a=1[out]'
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + parts + inputs + ['-filter_complex', fg, '-map', '[out]', '-c:a', 'libmp3lame', '-b:a', '192k', 'public/v07/voice.mp3'], check=True)
print('voice.mp3 written')
