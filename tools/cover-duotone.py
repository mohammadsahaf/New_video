import sys
from PIL import Image, ImageOps, ImageEnhance
def hx(h): return tuple(int(h[i:i+2],16) for i in (1,3,5))
src,dst,dark,light,contrast=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4],float(sys.argv[5])
im=Image.open(src).convert("RGBA"); a=im.getchannel("A")
g=ImageOps.grayscale(im.convert("RGB")); g=ImageEnhance.Contrast(g).enhance(contrast)
d=ImageOps.colorize(g,hx(dark),hx(light)).convert("RGBA"); d.putalpha(a); d.save(dst); print(dst)
