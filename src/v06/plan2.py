# V06 v2 planner: one picture per narration sentence (shotlist.py + sentences.json) -> plan.json
import json,math,re,os,sys,glob,subprocess
ROOT=os.path.dirname(os.path.abspath(__file__))+'/../..'; os.chdir(ROOT); sys.path.insert(0,'src/v06')
from shotlist import A
vo=json.load(open('src/v06/vo.json',encoding='utf8')); total=vo['total']
S=json.load(open('src/v06/sentences.json',encoding='utf8'))
CLIP={os.path.basename(f)[:-4]:float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode()) for f in glob.glob('public/v06/clips/*.mp4')}
CLIP['07']=4.0  # after 4 s the far shore turns into modern Istanbul
T={'title':('جنگی که جهان باستان را تمام کرد','خسرو پرویز و هراکلیوس · ۶۰۲ تا ۶۲۸'),'quote':('«جنگ با روم، تمام‌شدنی نیست»','باوری که از سال ۵۴۰ ماند'),
   'years':('۱۱ سال بعد','۶۰۲ میلادی'),'end':('تاریخ جاوید','داستان‌های بعدی را از دست نده')}
# ── cards and chapter titles (by paragraph, as in v1) ──
CARDS={(1,1):('دسامبر ۶۲۷','امپراتور روم در قلب ایران'),(2,5):('۵۳۲','صلح ابدی'),(2,6):('۸ سال','عمر صلح ابدی'),(3,1):('۵۹۰ میلادی','فرار خسرو'),(4,1):('۶۰۲ میلادی','کودتای فوکاس'),
(4,3):('«تو عادلی، خداوندا...»','موریس، امپراتور روم'),(6,1):('بهار ۶۱۴','اورشلیم'),(6,7):('۵۷٬۰۰۰ ؟','عددِ راهب استراتیگیوس · محل بحث'),
(8,6):('آتش در برابر آتش','اورشلیم ← آذرگشنسب'),(10,6):('حدود ۱۰ روز','محاصره‌ی قسطنطنیه · ۶۲۶'),(11,2):('«شهربراز را بکش»','نامه‌ی خسرو · به روایت مورخان رومی'),
(12,4):('۱۲ دسامبر ۶۲۷','نبرد نینوا'),(13,2):('فوریه‌ی ۶۲۸','کودتای شیرویه'),(14,5):('۶۳۶، ۶۴۲، ۶۵۱','یرموک · قادسیه · نهاوند · مرو'),
(16,2):('اول: خستگی','۲۶ سال جنگ'),(16,3):('دوم: پول','خزانه‌های خالی'),(16,4):('سوم: طاعون','۶۲۸ میلادی'),(16,5):('چهارم: سیاست','شاه پس از شاه'),
(17,3):('اگر قسطنطنیه سقوط کرده بود؟','نظرت را در کامنت بنویس')}
FULL={(16,2),(16,3),(16,4),(16,5),(4,3)}
TITLES={int(m.group(1)):m.group(2).strip() for m in re.finditer(r'## فصل (\d+) · ([^(\n]+)',open('videos/06/script.md',encoding='utf8').read())}
segs=vo['segs']; scenes=[]; ORD=vo.get('order') or list(range(1,18)); seen=set()
for i,s in enumerate(segs):
    ch=s['ch']; k=s.get('pi') or (sum(1 for x in segs[:i] if x['ch']==ch)+1)
    a=0 if i==0 else (segs[i-1]['end']+s['start'])/2
    b=total+1.0 if i==len(segs)-1 else (s['end']+segs[i+1]['start'])/2
    if ch not in seen:
        seen.add(ch); scenes.append({'kind':'chapter','n':ORD.index(ch)+1,'title':TITLES[ch],'at':round(a+0.15,2),'until':round(a+3.6,2)})
    if (ch,k) in CARDS:
        tx,sub=CARDS[(ch,k)]; full=(ch,k) in FULL
        scenes.append({'kind':'card','text':tx,'sub':sub,'at':round(a+0.1,2),'until':round(b if full else min(b,a+4.2),2),'full':full})
# ── shots, one (or two) per sentence ──
st=[0.0]+[max(0,x['a']-0.12) for x in S[1:]]; en=st[1:]+[total+1.5]
items=[]
for x,a,b in zip(S,st,en):
    parts=A[x['k']].split('|')
    for j,p in enumerate(parts): items.append((p,a+(b-a)*j/len(parts),a+(b-a)*(j+1)/len(parts)))
# merge neighbours that show the same thing (no cut), maps by id
merged=[]
for p,a,b in items:
    if merged and merged[-1][0]==p: merged[-1][2]=b
    else: merged.append([p,a,b])
shots=[];clipuse={};seed=0
MOVES=[([0.5,0.45],[0,0],1.0,0.08),([0.42,0.5],[0.06,0],1.06,0.05),([0.58,0.5],[-0.06,0],1.06,0.05),([0.5,0.55],[0,-0.04],1.12,-0.07)]
for p,a,b in merged:
    if p.startswith('M:'): scenes.append({'kind':'map','id':p[2:],'at':round(a,2),'until':round(b,2)}); continue
    if p.startswith('T:'):
        tx,sub=T[p[2:]]; scenes.append({'kind':'card','text':tx,'sub':sub,'at':round(a,2),'until':round(b,2),'full':True}); continue
    m=re.match(r'([icN])(\d+)(D2?|)$',p); kind,num,fr=m.groups()
    if kind=='N': key='N'+num; name=('c' if key in CLIP else 'i')+key
    else: key=num; name=kind+num
    seed+=1; d=b-a
    sh={'name':name,'at':round(a,3),'until':round(b,3)}
    if name[0]=='i':
        fo,pa,zo,pu=MOVES[seed%4]
        if fr=='D': fo,pa,zo,pu=[0.5,0.42],[0.03*((seed%3)-1),0],1.4,0.05
        if fr=='D2': fo,pa,zo,pu=[0.32 if seed%2 else 0.68,0.45],[0,0],1.45,0.04
        sh.update({'focus':fo,'pan':pa,'zoom':zo,'push':pu})
    else:
        cl=CLIP[name[1:]]; u=clipuse.get(name,0); clipuse[name]=u+1
        frm=0 if u%2==0 or cl<d+0.5 else max(0,cl-d-0.1)
        rate=1.0 if cl-frm>=d else max(0.5,(cl-frm-0.1)/d)
        sh.update({'from':round(frm,2),'rate':round(rate,3),'zoom':1.35 if fr else (1.1 if name=='c28' else 1.0),'push':0.03,'focus':[0.5,0.45]})
    if name[0]=='i' and d>9:  # a long still: punch in halfway instead of holding one frame
        mid=round(a+d/2,3); sh2=dict(sh); sh['until']=mid; sh2.update({'at':mid,'focus':[0.5,0.42],'zoom':round(sh['zoom']*1.3,2),'pan':[0,0],'push':0.04})
        shots+= [sh,sh2]; continue
    shots.append(sh)
json.dump({'total':total,'shots':shots,'scenes':scenes},open('src/v06/plan.json','w'),ensure_ascii=False,indent=0)
from collections import Counter
runs=Counter(re.sub(r'^[ic]','',s['name']) for s in shots)
print(len(shots),'shots',sum(s['kind']=='map' for s in scenes),'maps; most used',runs.most_common(5),'; avg',round(sum(s['until']-s['at'] for s in shots)/len(shots),1),'s; longest',round(max(s['until']-s['at'] for s in shots),1))
