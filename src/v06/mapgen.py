# V06 map basemap: Natural Earth shaded relief (public domain), graded to the channel palette (dark gold), land/sea from the 10 m
# coastline, rivers, and soft territory washes for the empires. Output: public/v06/map/base.jpg + wash-<id>.png (same grid).
# Needs the data in /home/user/mapdata (NE1_HR_LC_SR_W.tif, ne_land.geojson, ne_rivers.geojson). Run from the repo root.
import json,math,os,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFilter,ImageChops
Image.MAX_IMAGE_PIXELS=None
D='/home/user/mapdata/'; OUT='public/v06/map/'; os.makedirs(OUT,exist_ok=True)
LAT0=34; K=26; KX=K*math.cos(math.radians(LAT0))   # the same projection as map.tsx
LON=(0,96); LAT=(56,6); F=3.0                     # F = image pixels per map unit
W=round((LON[1]-LON[0])*KX*F); H=round((LAT[0]-LAT[1])*K*F)
print('grid',W,H)
def px(lon,lat): return ((lon-LON[0])*KX*F,(LAT[0]-lat)*K*F)
# 1) relief, resampled onto the map grid
src=Image.open(D+'NE1_HR_LC_SR_W.tif'); sw,sh=src.size; s=sw/360
box=(int((LON[0]+180)*s),int((90-LAT[0])*s),int((LON[1]+180)*s),int((90-LAT[1])*s))
rel=src.crop(box).convert('RGB').resize((W,H),Image.LANCZOS)
a=np.asarray(rel).astype(np.float32)/255
L=(0.3*a[...,0]+0.59*a[...,1]+0.11*a[...,2])
# 2) land mask from the coastline (supersampled)
SS=2; m=Image.new('L',(W*SS,H*SS),0); dr=ImageDraw.Draw(m)
land=json.load(open(D+'ne_land.geojson'))
def rings(geom):
    if geom['type']=='Polygon': yield geom['coordinates']
    else:
        for p in geom['coordinates']: yield p
for f in land['features']:
    for poly in rings(f['geometry']):
        for i,r in enumerate(poly):
            xs=[c[0] for c in r]; ys=[c[1] for c in r]
            if max(xs)<LON[0]-1 or min(xs)>LON[1]+1 or max(ys)<LAT[1]-1 or min(ys)>LAT[0]+1: continue
            pts=[(px(c[0],c[1])[0]*SS,px(c[0],c[1])[1]*SS) for c in r]
            dr.polygon(pts,fill=255 if i==0 else 0)
mask=m.resize((W,H),Image.LANCZOS); M=np.asarray(mask).astype(np.float32)/255
# 3) grade: land = the relief's own colour, darkened and warmed, with strong hill-shading; sea = deep navy keeping the sea-floor shading
from PIL import ImageFilter as IF
Lim=Image.fromarray((L*255).astype(np.uint8))
Lb=np.asarray(Lim.filter(IF.GaussianBlur(30))).astype(np.float32)/255
detail=(L-Lb)                       # hills, valleys, coast shadow
grey=L[...,None]
nat=0.45*a+0.55*grey               # partly desaturated natural colour
warm=np.array([1.0,0.86,0.62])
land=np.clip((nat*warm)**1.35*0.62+detail[...,None]*3.4,0,1)
land=np.clip(land*1.25-0.04,0,1)
sea_l=np.clip((L-0.45)*1.2,0,1)
sea=np.array([0.025,0.06,0.09])+sea_l[...,None]*np.array([0.03,0.07,0.10])+detail[...,None]*0.6
yy,xx=np.mgrid[0:H,0:W]; vg=1-0.6*(((xx/W-0.5)**2+(yy/H-0.5)**2)*2.4)
out=(land*M[...,None]+np.clip(sea,0,1)*(1-M[...,None]))*np.clip(vg,0.3,1)[...,None]
img=Image.fromarray((np.clip(out,0,1)*255).astype(np.uint8))
# 4) coastline glow + rivers
edge=mask.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1.2))
img=Image.composite(Image.new('RGB',(W,H),(190,160,100)),img,edge.point(lambda v:min(255,int(v*0.55))))
rv=Image.new('RGBA',(W,H),(0,0,0,0)); d2=ImageDraw.Draw(rv)
riv=json.load(open(D+'ne_rivers.geojson'))
for f in riv['features']:
    g=f['geometry']; lines=[g['coordinates']] if g['type']=='LineString' else g['coordinates']
    for ln in lines:
        pts=[px(c[0],c[1]) for c in ln if LON[0]<=c[0]<=LON[1] and LAT[1]<=c[1]<=LAT[0]]
        if len(pts)>1: d2.line(pts,fill=(96,150,176,200),width=3)
rv=rv.filter(ImageFilter.GaussianBlur(0.8))
img=Image.alpha_composite(img.convert('RGBA'),rv).convert('RGB')
img.save(OUT+'base.jpg',quality=88)
# 5) territory washes (soft edge + crisp rim), clipped to land
sys.path.insert(0,'src/v06'); 
REG=json.load(open('src/v06/regions.json'))
for rid,r in REG.items():
    col=tuple(int(c) for c in r['rgb'])
    pts=r['pts']
    for _ in range(3):  # Chaikin smoothing: soft natural-looking borders
        q=[]
        for i in range(len(pts)):
            p0=pts[i]; p1=pts[(i+1)%len(pts)]
            q+= [[0.75*p0[0]+0.25*p1[0],0.75*p0[1]+0.25*p1[1]],[0.25*p0[0]+0.75*p1[0],0.25*p0[1]+0.75*p1[1]]]
        pts=q
    poly=[px(*p) for p in pts]
    mk=Image.new('L',(W,H),0); ImageDraw.Draw(mk).polygon(poly,fill=255)
    soft=mk.filter(ImageFilter.GaussianBlur(26))
    inner=ImageChops.multiply(soft,mask)   # keep on land
    rim=Image.new('L',(W,H),0); ImageDraw.Draw(rim).line(poly+[poly[0]],fill=255,width=7,joint='curve')
    rim=ImageChops.multiply(rim.filter(ImageFilter.GaussianBlur(2)),mask)
    A=np.asarray(inner).astype(np.float32)/255*0.34
    if r.get('hatch'):
        h=Image.new('L',(W,H),0); dh=ImageDraw.Draw(h)
        for k in range(-H,W,34): dh.line([(k,0),(k+H,H)],fill=255,width=9)
        A=A*(0.35+0.65*np.asarray(h).astype(np.float32)/255)
    R=np.asarray(rim).astype(np.float32)/255*0.8
    al=np.clip(np.maximum(A,R*np.clip(np.asarray(soft).astype(np.float32)/255*2+0.15,0,1)),0,1)
    outp=np.zeros((H,W,4),np.uint8); outp[...,0]=col[0]; outp[...,1]=col[1]; outp[...,2]=col[2]; outp[...,3]=(al*255).astype(np.uint8)
    Image.fromarray(outp,'RGBA').save(OUT+f'wash-{rid}.png',optimize=False)
    print('wash',rid)
json.dump({'W':W,'H':H,'F':F,'lon0':LON[0],'lat0':LAT[0],'KX':KX,'K':K},open(OUT+'grid.json','w'))
