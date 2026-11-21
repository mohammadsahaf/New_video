# Rebuild character-sheet.md and image-prompts.md from plan/shots.py and plan/chars.py
import sys,re,os; sys.path.insert(0,os.path.dirname(__file__))
import shots, chars
S,C,BASE=shots.S,chars.C,chars.BASE
os.chdir(os.path.join(os.path.dirname(__file__),'..'))
SHORT={"SCRIBE":"the young scribe","ASHURBANIPAL":"King Ashurbanipal","ASSYRIAN-QUEEN":"the Assyrian queen","SHAMASH-SHUM-UKIN":"King Shamash-shum-ukin",
"ESARHADDON":"old King Esarhaddon","TEUMMAN":"King Teumman","HUMBAN-HALTASH":"King Humban-haltash","UNTASH":"King Untash-Napirisha","NAPIRASU":"Queen Napir-Asu",
"SHUTRUK":"King Shutruk-Nahhunte","PUZUR":"Puzur-Inshushinak","IBBI-SIN":"King Ibbi-Sin","SARGON":"Sargon","HAMMURABI":"Hammurabi","NEBUCHADNEZZAR":"King Nebuchadnezzar I",
"CYRUS":"Cyrus","PERSIAN-SCRIBE":"the Persian scribe","ELAMITE-SOLDIER-OLD":"early Elamite soldiers","ELAMITE-SOLDIER-MIDDLE":"Elamite soldiers",
"ELAMITE-SOLDIER-NEO":"Elamite soldiers","ASSYRIAN-SOLDIER":"Assyrian soldiers","BABYLONIAN-SOLDIER":"Babylonian soldiers","AKKADIAN-SOLDIER":"Akkadian soldiers",
"SUMERIAN":"Sumerian","ELAMITE-PRIEST":"Elamite priests"}
def fill(p):
    toks=list(dict.fromkeys(re.findall(r'\[([A-Z-]+)\]',p)))
    for k in toks: p=p.replace(f'[{k}]',SHORT[k])
    assert '[' not in p, p
    p=p.rstrip('. ')+'.'
    if toks: p+=' Character details — '+' | '.join(f'{SHORT[k]}: {C[k][3]}' for k in toks)+'.'
    return p
SHEET=["SCRIBE","ASHURBANIPAL","TEUMMAN","HUMBAN-HALTASH","SHAMASH-SHUM-UKIN","UNTASH","NAPIRASU","SHUTRUK","PUZUR","CYRUS","ASSYRIAN-SOLDIER","ELAMITE-SOLDIER-NEO","ELAMITE-SOLDIER-MIDDLE","ELAMITE-SOLDIER-OLD"]
STATUS=dict(l.split(' ',1) for l in open('plan/ref-status.txt').read().strip().splitlines()) if os.path.exists('plan/ref-status.txt') else {}
n=0; app={k:[] for k in C}; rows=[]
for k,v in S.items():
    for x in v:
        kind,body=x.split('|',1)
        if kind in 'PC':
            n+=1; pid=f'P{n:03d}'
            pr,mo=(body.split('|')+[''])[:2] if kind=='C' else (body,'')
            for t in re.findall(r'\[([A-Z-]+)\]',pr): app[t].append(pid)
            rows.append((k,pid,kind,pr.strip(),mo.strip()))
L=['# کارکتر شیت · ویدیو ۰۷ · ایلام (قفل‌شده)','',
'**چرا:** تا هر شخصیت در همه‌ی تصویرها یک چهره و یک لباس داشته باشد.','',
'## روال',
'1. برای هر شخصیت اصلی **برگه‌ی مرجع** بساز: `REF-نام.jpg`. برگه‌های تأییدشده در `uploads/v07/refs/` هستند.',
'2. در هر تصویری که آن شخصیت هست، همین برگه را **تصویر مرجع** بده (Higgsfield: Character / Soul ID، یا Nano Banana / Flux Kontext).',
'3. پرامپت‌های `image-prompts.md` بلوک کامل شخصیت را از قبل دارند. فقط کپی کن.','',
'**وضعیت:** ✅ تأیید شد · 🔁 دوباره بساز (دلیلش کنارش هست).',
'**توجه تاریخی:** تئومان روی سنگ‌نگاره‌ها با موی ریخته است. سربازان قبل از ۱۵۰۰ پ.م اسب ندارند. کلاه‌ها نمدی و صاف‌اند، نه بافتنی یا خزدار. بابلِ پیش از ۶۰۰ پ.م آجر لعابی آبی با نقش شیر ندارد.','','---','']
tmpl=("Character reference sheet, {b}. Five views on one neutral mid-grey studio background: front head-and-shoulders, three-quarter view, "
      "side profile, full body front, full body back. Same face and same costume in every view, soft even studio lighting, photoreal, "
      "ancient Near Eastern accuracy, no text, no labels, no watermark.")
i=0
for k in SHEET+[k for k in C if k not in SHEET]:
    fa,role,era,blk=C[k]; i+=1; st=STATUS.get(k,'')
    L+= [f'## {i}. {fa}  `[{k}]` {st}', f'**دوره:** {era}' + (f' · **نقش:** {role}' if role else '') + f' · **در تصویرهای:** {"، ".join(app[k]) or "—"}','',
         '**بلوک قفل‌شده:**','```',blk,'```']
    if k in SHEET: L+=['**برگه‌ی مرجع** → `REF-'+k+'.jpg`','```',tmpl.format(b=blk),'```']
    else: L+=['**تصویر نمونه** → `'+k+'.jpg`','```',BASE+' Portrait of '+blk+'.','```']
    L.append('')
open('character-sheet.md','w').write('\n'.join(L))
old=open('image-prompts.md').read()
head=old.split('## تصویرها (P)')[0]
out=[head,'## تصویرها (P) · به ترتیب نریشن · آماده‌ی کپی (پایه و شخصیت داخلش هست)\n']
sec=None
for k,pid,kind,pr,mo in rows:
    if k[:2]!=sec: sec=k[:2]; out.append(f'\n### بخش {sec}\n')
    refs=[t for t in re.findall(r'\[([A-Z-]+)\]',pr) if t in SHEET]
    rf=f' · مرجع: {", ".join("REF-"+r for r in dict.fromkeys(refs))}' if refs else ''
    out.append(f'**{pid}**{" 🎥" if kind=="C" else ""} · {k}{rf}\n```\n{BASE} {fill(pr)}\n```' + (f'\nکلیپ: `{mo}`' if mo else '') + '\n')
out.append('\n---\n## آثار واقعی (A)\nدر `public/v07/art/`. اعتبارها در `CREDITS.md`.\n')
open('image-prompts.md','w').write('\n'.join(out))
print('built',n)
# shot list
lines={}
for l in open('/tmp/claude-0/lines.txt') if os.path.exists('/tmp/claude-0/lines.txt') else []:
    k,t=l.split(' ',1); lines[k]=t.strip()
sh=['# فهرست جمله‌به‌جمله · ویدیو ۰۷\n','P = عکس تو، 🎥 = کلیپ هم بشود، A = اثر واقعی، M = نقشه‌ی کد، T = کارت کد.\n']
n=0; sec=None
for k,v in S.items():
    if k[:2]!=sec: sec=k[:2]; sh.append(f'\n## بخش {sec}\n')
    it=[]
    for x in v:
        kind,body=x.split('|',1)
        if kind in 'PC': n+=1; it.append(f'P{n:03d}'+(' 🎥' if kind=='C' else ''))
        else: it.append(f'{kind}: {body.strip()}')
    sh.append(f'- **{k}** «{lines.get(k,"")[:60]}…» ← {" · ".join(it)}')
if lines: open('shot-list.md','w').write('\n'.join(sh)+'\n')
