# V06 edit v3 (retention): the Jerusalem story (the thumbnail's promise) moves to minute 1, the background chapters are trimmed.
# Input: vo_orig.json + sentences_orig.json (narration in the order it was recorded, 17 files). Output: vo.json, sentences.json,
# public/v06/voice.mp3 (the re-cut narration) and edit.json (new order). k = the sentence's original id (shotlist.py keys on it).
import json,subprocess,os,re,sys
import numpy as np
ROOT=os.path.dirname(os.path.abspath(__file__))+'/../..'; os.chdir(ROOT)
vo=json.load(open('src/v06/vo_orig.json',encoding='utf8')); S=json.load(open('src/v06/sentences_orig.json',encoding='utf8'))
byk={x['k']:x for x in S}
CH={}
for x in S: CH.setdefault(x['ch'],[]).append(x['k'])
CUT=set([18,19,20,21,28]+[36,40,41,42,47]+[63,64,66,68]+[76,77,78])  # trimmed sentences
ORDER=CH[1]+CH[6]+CH[2]+CH[3]+CH[4]+CH[5]+CH[7]+CH[8]+CH[9]+CH[10]+CH[11]+CH[12]+CH[13]+CH[14]+CH[15]+CH[16]+CH[17]
ORDER=[k for k in ORDER if k not in CUT]
SR=44100
# the original narration, joined
raw=b''
for n in range(1,18):
    raw+=subprocess.run(['ffmpeg','-v','error','-i',f'uploads/v06/narration/V06-{n:02d}.mp3','-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
A=np.frombuffer(raw,dtype=np.int16).astype(np.float32)
total_old=len(A)/SR
st={x['k']:(0.0 if x['k']==1 else max(0.0,x['a']-0.12)) for x in S}
ks=[x['k'] for x in S]
en={k:(st[ks[i+1]] if i+1<len(ks) else total_old) for i,k in enumerate(ks)}
out=[];T=0.0;newt={}
prev=None
for k in ORDER:
    a,b=int(st[k]*SR),int(en[k]*SR); seg=A[a:b].copy()
    f=int(0.012*SR)
    if prev is None or k!=prev+1:  # a join: tiny fades so nothing clicks
        seg[:f]*=np.linspace(0,1,f)
        if out: out[-1][-f:]*=np.linspace(1,0,f)
    out.append(seg); newt[k]=T; T+=len(seg)/SR; prev=k
Y=np.concatenate(out)
tail=np.zeros(int(1.5*SR),dtype=np.float32)
Y=np.concatenate([Y,tail])
open('/tmp/v06cut.raw','wb').write(np.clip(Y,-32768,32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ac','1','-ar',str(SR),'-i','/tmp/v06cut.raw','-c:a','libmp3lame','-b:a','192k','public/v06/voice.mp3'],check=True)
total=T
# re-time words and sentences
W=vo['words']; words=[]
for k in ORDER:
    x=byk[k]; sh=newt[k]-st[k]
    for w in W:
        if x['a']-0.02<=w['s']<=x['b']+0.02 and w['line']==x['p']:
            words.append({'w':w['w'],'s':round(w['s']+sh,3),'e':round(w['e']+sh,3),'line':w['line']})
sent=[]
for k in ORDER:
    x=byk[k]; sh=newt[k]-st[k]; sent.append({**x,'a':round(x['a']+sh,2),'b':round(x['b']+sh,2)})
# paragraph segments (with the chapter and the index inside the chapter it had)
first={}
for s in vo['segs']: first.setdefault(s['ch'],s['n'])
segs=[]
for p in sorted({w['line'] for w in words}):
    ws=[w for w in words if w['line']==p]; ch=[s['ch'] for s in vo['segs'] if s['n']==p][0]
    segs.append({'n':p,'ch':ch,'pi':p-first[ch]+1,'start':ws[0]['s'],'end':ws[-1]['e']})
segs.sort(key=lambda s:s['start'])
seq=[]
for x in sent:
    if not seq or seq[-1]!=x['ch']: seq.append(x['ch'])
json.dump({'total':round(total,3),'segs':segs,'words':words,'chapters':[],'order':seq},open('src/v06/vo.json','w'),ensure_ascii=False)
json.dump(sent,open('src/v06/sentences.json','w'),ensure_ascii=False,indent=0)
json.dump({'order':ORDER,'cut':sorted(CUT),'chapter_order':seq,'total_old':round(total_old,2),'total':round(total,2)},open('src/v06/edit.json','w'))
print('old',round(total_old/60,2),'min -> new',round(total/60,2),'min; chapter order',seq,'; sentences',len(ORDER))
