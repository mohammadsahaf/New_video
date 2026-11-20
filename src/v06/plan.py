# V06 shot planner: narration timing (vo.json) + per-chapter asset pools -> plan.json (shots + map/card/chapter scenes)
import json,math,subprocess,re,glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/../..')
vo=json.load(open('src/v06/vo.json',encoding='utf8'))
segs=vo['segs']; total=vo['total']
P={1:'c01 i01 c03 i04 i13 i20 c19 i02',2:'i21 c21 i22 i08 i18 i33 i32',3:'i23 c23 i24 i25 i01',4:'i26 i25 i08 i27 i02 i22',5:'i02 i05 i28',
6:'c28 i28 c03 i03 c29 i29 c30 i30 i04 i31 i29 i03',7:'i32 i06 c07 i07 c33 i33 i05 i06 i16',8:'i34 c35 i35 i10 c11 i11 i02',9:'i10 i36 i37 i06 i13 i35',
10:'c07 i07 c38 i38 c08 i08 c09 i09 i39',11:'i12 i06 i37 i36 i12',12:'i40 c13 i13 i14 c01 i14',13:'c41 i41 i15 i16 i05 i31 i04',
14:'c42 i42 c43 i43 c18 i18 i44 i45 c19 i19',15:'i20 i18 i45',16:'i36 i33 i45 i41 i20',17:'i20 i18 c01'}
MAPS={(1,1):'M1',(2,1):'M2',(2,4):'M2s',(3,3):'M3',(4,7):'M4',(5,3):'M5',(6,2):'M6',(6,9):'M6b',(7,1):'M5e',(8,2):'M7',(9,2):'M7f',(9,5):'M7t',(10,2):'M8',(12,1):'M9',(14,4):'M10a',(14,6):'M10b',(14,7):'M10c',(15,1):'M11'}
CARDS={(2,5):('۵۳۲','صلح ابدی'),(2,6):('۸ سال','عمر صلح ابدی'),(3,1):('۵۹۰ میلادی','فرار خسرو'),(4,1):('۶۰۲ میلادی','کودتای فوکاس'),
(4,3):('«تو عادلی، خداوندا...»','موریس، امپراتور روم'),(6,1):('بهار ۶۱۴','اورشلیم'),(6,7):('۵۷٬۰۰۰ ؟','عددِ راهب استراتیگیوس · محل بحث'),
(8,6):('آتش در برابر آتش','اورشلیم ← آذرگشنسب'),(10,6):('حدود ۱۰ روز','محاصره‌ی قسطنطنیه · ۶۲۶'),(11,2):('«شهربراز را بکش»','نامه‌ی خسرو · به روایت مورخان رومی'),
(12,4):('۱۲ دسامبر ۶۲۷','نبرد نینوا'),(13,2):('فوریه‌ی ۶۲۸','کودتای شیرویه'),(14,5):('۶۳۶، ۶۴۲، ۶۵۱','یرموک · قادسیه · نهاوند · مرو'),
(16,2):('اول: خستگی','۲۶ سال جنگ'),(16,3):('دوم: پول','خزانه‌های خالی'),(16,4):('سوم: طاعون','۶۲۸ میلادی'),(16,5):('چهارم: سیاست','شاه پس از شاه'),
(17,3):('اگر قسطنطنیه سقوط کرده بود؟','نظرت را در کامنت بنویس')}
FULL={(16,2),(16,3),(16,4),(16,5),(17,3),(4,3),(11,2)}
TITLES={int(m.group(1)):m.group(2).strip() for m in re.finditer(r'## فصل (\d+) · ([^(\n]+)',open('videos/06/script.md',encoding='utf8').read())}
CLIPLEN={f.split('/')[-1][:2]:float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode()) for f in glob.glob('public/v06/clips/*.mp4')}
CLIPLEN['07']=4.0  # after 4 s the far shore turns into modern Istanbul (minarets)
shots=[];scenes=[];used={};pos={c:0 for c in P}
spans=[[0 if i==0 else (segs[i-1]['end']+s['start'])/2,None] for i,s in enumerate(segs)]
for i in range(len(spans)-1): spans[i][1]=spans[i+1][0]
spans[-1][1]=total+1.0
for i,s in enumerate(segs):
    ch=s['ch']; k=sum(1 for x in segs[:i] if x['ch']==ch)+1; a,b=spans[i]; key=(ch,k)
    if k==1: scenes.append({'kind':'chapter','n':ch,'title':TITLES[ch],'at':round(a+0.15,2),'until':round(a+3.6,2)})
    if key in MAPS:
        scenes.append({'kind':'map','id':MAPS[key],'at':round(a,2),'until':round(b,2)}); continue
    if key in CARDS:
        tx,sub=CARDS[key]; full=key in FULL
        scenes.append({'kind':'card','text':tx,'sub':sub,'at':round(a+0.1,2),'until':round(b if full else min(b,a+4.2),2),'full':full})
    L=b-a; n=max(1,math.ceil(L/5.8)); pool=P[ch].split()
    for j in range(n):
        a0=a+L*j/n; b0=a+L*(j+1)/n; nm=pool[pos[ch]%len(pool)]; pos[ch]+=1
        u=used.get(nm,0); used[nm]=u+1; sh={'name':nm,'at':round(a0,2),'until':round(b0,2)}; seed=len(shots)
        if nm[0]=='i':
            mv=(seed+u)%4
            sh.update({'focus':[[0.5,0.45],[0.42,0.5],[0.58,0.5],[0.5,0.55]][mv],'pan':[[0,0],[0.08,0],[-0.08,0],[0,-0.05]][mv],'zoom':[1.0,1.08,1.08,1.14][mv],'push':[0.1,0.04,0.04,-0.08][mv]})
        else:
            cl=CLIPLEN[nm[1:]]; d=b0-a0
            frm=0 if u%2==0 or cl<d+1 else max(0,cl-d-0.2)
            rate=1.0 if cl-frm>=d else max(0.55,(cl-frm-0.1)/d)
            sh.update({'from':round(frm,2),'rate':round(rate,3),'zoom':1.1 if nm=='c28' else 1.0,'push':0.03})
        shots.append(sh)
# image 17 (the cross returns to Jerusalem, 630) where the narration says it
OVR={573.75:('i17',[0.62,0.45],[-0.06,0],1.05,0.08),1245.37:('i17',[0.5,0.5],[0,0],1.0,0.1),1251.05:('i17',[0.38,0.3],[0.02,0.02],1.25,0.06)}
for sh in shots:
    k=round(sh['at'],2)
    if k in OVR:
        nm,fo,pa,zo,pu=OVR[k]; sh.update({'name':nm,'focus':fo,'pan':pa,'zoom':zo,'push':pu}); sh.pop('from',None); sh.pop('rate',None)
json.dump({'total':total,'shots':shots,'scenes':scenes},open('src/v06/plan.json','w'),ensure_ascii=False,indent=0)
print(len(shots),'shots',sum(s['kind']=='map' for s in scenes),'maps',sum(s['kind']=='card' for s in scenes),'cards; max reuse',sorted(used.items(),key=lambda x:-x[1])[:5])
