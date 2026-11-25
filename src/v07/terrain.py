# V07 natural base maps: real elevation (AWS Terrarium tiles = SRTM/GEBCO, open data) -> hillshaded, tinted relief
# in the film's own projection (x = lon*KX, y = -lat*K, see map.tsx), plus Natural Earth rivers. Run from the repo root:
#   python src/v07/terrain.py        -> public/v07/terrain/{wide,near}.jpg and src/v07/rivers.json
import os, math, json, subprocess, sys
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/../..')
CACHE = 'out/terrain'
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

def tile_xy(lon, lat, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y

def fetch(z, x0, x1, y0, y1):
    jobs = []
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            f = f'{CACHE}/{z}_{x}_{y}.png'
            if not os.path.exists(f) or os.path.getsize(f) < 200: jobs.append((URL.format(z=z, x=x, y=y), f))
    os.makedirs(CACHE, exist_ok=True)
    open(f'{CACHE}/jobs.txt', 'w').write('\n'.join(f'url = "{u}"\noutput = "{f}"' for u, f in jobs) + '\n')
    if jobs:
        subprocess.run(['curl', '-s', '--parallel', '--parallel-max', '16', '--retry', '3', '--max-time', '120', '-K', f'{CACHE}/jobs.txt'], check=True)

def mosaic(z, lon0, lon1, lat0, lat1):
    xa, ya = tile_xy(lon0, lat1, z); xb, yb = tile_xy(lon1, lat0, z)
    x0, x1, y0, y1 = int(xa), int(xb), int(ya), int(yb)
    fetch(z, x0, x1, y0, y1)
    W, H = (x1 - x0 + 1) * 256, (y1 - y0 + 1) * 256
    el = np.zeros((H, W), np.float32)
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            im = np.asarray(Image.open(f'{CACHE}/{z}_{x}_{y}.png').convert('RGB')).astype(np.float32)
            el[(y - y0) * 256:(y - y0 + 1) * 256, (x - x0) * 256:(x - x0 + 1) * 256] = im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768
    return el, x0, y0

# elevation colours (m): lowland green -> steppe/desert tan -> mountain brown -> grey -> snow
STOPS = [(0, (92, 108, 60)), (120, (128, 132, 74)), (350, (170, 154, 96)), (700, (176, 144, 98)), (1300, (150, 118, 84)), (2200, (126, 104, 88)), (3200, (156, 146, 138)), (4300, (226, 226, 224))]
def tint(e):
    out = np.zeros(e.shape + (3,), np.float32)
    xs = [s[0] for s in STOPS]
    for c in range(3): out[..., c] = np.interp(e, xs, [s[1][c] for s in STOPS])
    return out

def build(name, lon0, lon1, lat0, lat1, ppd_lon, ppd_lat, z, exag):
    el, tx0, ty0 = mosaic(z, lon0, lon1, lat0, lat1)
    W, H = int((lon1 - lon0) * ppd_lon), int((lat1 - lat0) * ppd_lat)
    lon = lon0 + (np.arange(W) + 0.5) / ppd_lon
    lat = lat1 - (np.arange(H) + 0.5) / ppd_lat
    n = 2 ** z
    mx = (lon + 180) / 360 * n * 256 - tx0 * 256
    my = (1 - np.arcsinh(np.tan(np.radians(lat))) / math.pi) / 2 * n * 256 - ty0 * 256
    X, Y = np.meshgrid(mx, my)
    e = map_coordinates(el, [Y, X], order=1, mode='nearest').astype(np.float32)
    es = gaussian_filter(e, 0.8)
    dx = 111320 * np.cos(np.radians(lat))[:, None] / ppd_lon
    dy = 110574 / ppd_lat
    gy, gx = np.gradient(es * exag, dy, axis=0), np.gradient(es * exag, axis=1) / dx
    # light from the north-west, 40 deg up (image y grows southwards)
    az, alt = math.radians(315), math.radians(40)
    slope = np.arctan(np.hypot(gx, gy)); aspect = np.arctan2(-gx, gy)
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    shade = np.clip(shade, 0, 1)
    land = e > 0
    col = tint(np.maximum(e, 0)) * (0.50 + 0.80 * shade)[..., None]
    # sea: shallow teal -> deep blue-black, with the same relief shading very faintly
    dd = np.clip(-e / 600, 0, 1)
    cas = (lon[None, :] > 46.3) & (lon[None, :] < 55.2) & (lat[:, None] > 36.3) & (lat[:, None] < 47.2)
    dd = np.where(cas & ~land, 0.5, dd)   # Caspian tiles have no bathymetry: one even depth, no tile seams
    d = gaussian_filter(dd, 2.0)[..., None]
    sea = np.array([34, 78, 86], np.float32) * (1 - d) + np.array([8, 22, 32], np.float32) * d
    # soft shore: blend over ~1.5 px
    m = gaussian_filter(land.astype(np.float32), 1.2)[..., None]
    img = col * m + sea * (1 - m)
    img = img * 0.88
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(f'public/v07/terrain/{name}.jpg', quality=88)
    print(name, W, H)

# wide: whole empire; near: Mesopotamia + Iran (the camera zoomed in)
build('wide', 10, 80, 10, 50, 60, 66, 6, 2.5)
build('near', 30, 64, 24, 43, 120, 138, 8, 3.0)

# rivers (Natural Earth 10m)
RV = f'{CACHE}/ne_rivers.json'
if not os.path.exists(RV):
    subprocess.run(['curl', '-s', '-o', RV, '--max-time', '120', 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson'], check=True)
gj = json.load(open(RV))
out = []
for f in gj['features']:
    g = f['geometry']; lines = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
    for ln in lines:
        pts = [[round(p[0], 2), round(p[1], 2)] for p in ln if 10 <= p[0] <= 80 and 10 <= p[1] <= 50]
        if len(pts) > 1: out.append({'n': f['properties'].get('name_en') or '', 'p': pts})
json.dump(out, open('src/v07/rivers.json', 'w'), separators=(',', ':'))
print('rivers', len(out))
