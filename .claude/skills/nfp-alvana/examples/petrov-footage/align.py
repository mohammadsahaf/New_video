import json, re, difflib, sys
W = json.load(open('out/vo/words.json'))
lines = [l.strip() for l in open('videos/05/script.txt', encoding='utf8').read().split('\n') if l.strip()]
G = {}
for grp in ['تط','سصث','زذضظ','هحة','اآعءأإ','قغ','یيئى','کك','وؤ']:
    for c in grp: G[c] = grp[0]
FA = '۰۱۲۳۴۵۶۷۸۹'
def norm(s):
    out = []
    for c in s:
        if c in FA: c = str(FA.index(c))
        c = c.lower()
        c = G.get(c, c)
        if re.match(r'[\w]', c) and c != '_': out.append(c)
    return out
# whisper chars with times
wc, wt = [], []
for w in W:
    cs = norm(w['w'])
    for i, c in enumerate(cs):
        wc.append(c); wt.append(w['s'] + (w['e'] - w['s']) * (i + 0.5) / max(1, len(cs)))
# script words and chars
sw = []  # (line, word, char start, char end)
sc = []
for n, l in enumerate(lines, 1):
    for w in l.split():
        cs = norm(w)
        sw.append([n, w, len(sc), len(sc) + len(cs)])
        sc.extend(cs)
sm = difflib.SequenceMatcher(None, sc, wc, autojunk=False)
m = {}
for a, b, size in sm.get_matching_blocks():
    for k in range(size): m[a + k] = b + k
print('matched chars', len(m), 'of', len(sc), file=sys.stderr)
# word times from matched chars; need >=2 matched chars (or the whole word) to trust
res = []
for n, w, a, b in sw:
    hit = [m[i] for i in range(a, b) if i in m]
    ok = len(hit) >= max(1, min(2, b - a)) and len(hit) >= 0.5 * (b - a)
    if ok:
        s = wt[hit[0]] - 0.06; e = wt[hit[-1]] + 0.06
        # snap to whisper word bounds
        res.append({'w': w, 'line': n, 's': s, 'e': e, 'ok': True})
    else:
        res.append({'w': w, 'line': n, 's': None, 'e': None, 'ok': False})
# snap starts/ends to the whisper word containing the char
def wordbound(ci, which):
    acc = 0
    for x in W:
        L = len(norm(x['w']))
        if ci < acc + L: return x[which]
        acc += L
    return W[-1][which]
for r, (n, w, a, b) in zip(res, sw):
    if r['ok']:
        hit = [m[i] for i in range(a, b) if i in m]
        r['s'] = wordbound(hit[0], 's'); r['e'] = wordbound(hit[-1], 'e')
# interpolate the rest by character position between known neighbours
idx = [i for i, r in enumerate(res) if r['ok']]
for i, r in enumerate(res):
    if r['ok']: continue
    p = max([j for j in idx if j < i], default=None); q = min([j for j in idx if j > i], default=None)
    if p is None: r['s'] = 0.0; r['e'] = res[q]['s'] if q is not None else 0.4; continue
    if q is None: r['s'] = res[p]['e']; r['e'] = r['s'] + 0.4; continue
    span = res[q]['s'] - res[p]['e']
    tot = sum(len(norm(res[k]['w'])) + 1 for k in range(p + 1, q))
    off = sum(len(norm(res[k]['w'])) + 1 for k in range(p + 1, i))
    r['s'] = res[p]['e'] + span * off / max(1, tot)
    r['e'] = res[p]['e'] + span * (off + len(norm(r['w'])) + 1) / max(1, tot)
# monotonic clean-up
for i in range(1, len(res)):
    if res[i]['s'] < res[i-1]['s']: res[i]['s'] = res[i-1]['s']
    if res[i]['e'] < res[i]['s'] + 0.05: res[i]['e'] = res[i]['s'] + 0.05
bad = [(r['line'], r['w']) for r in res if not r['ok']]
print('unmatched words', len(bad), bad[:60], file=sys.stderr)
words = [{'w': r['w'], 's': round(r['s'], 2), 'e': round(r['e'], 2), 'line': r['line']} for r in res]
segs = []
for n in range(1, len(lines) + 1):
    ws = [w for w in words if w['line'] == n]
    segs.append({'n': n, 'sp': 'A', 'start': ws[0]['s'], 'end': ws[-1]['e']})
total = float(sys.argv[1])
json.dump({'total': total, 'segs': segs, 'words': words}, open('src/v05/vo.json', 'w'), ensure_ascii=False)
for s in segs: print(s['n'], s['start'], s['end'], file=sys.stderr) if s['n'] in (1,2,27,38,39,40,53,55,75) else None
