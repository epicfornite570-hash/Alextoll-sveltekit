"""Ordenador de la 404 (alextoll.store): modelo procedural en GLB.

Parte del kit «pc404» (diseño original con Astra) y lo corrige para la web:
  - piezas apoyadas de verdad (zócalo, CPU, RAM, gráfica en su ranura, pies en el suelo)
  - normales suaves en cilindros, tubos y aspas; coordenadas UV para las texturas de la web
  - ventiladores con marco redondo, aspas con ángulo y rotor aparte (gira en la web)
  - cables como tubos continuos, sin cables duplicados uno encima de otro
  - frontal de malla perforada (textura con transparencia) en vez de una rejilla de barras
  - una sola malla por pieza y material: pocos dibujos por fotograma, archivo más pequeño
  - montaje revisado: cada pieza llega alineada con su sitio y entra frenando, sin atravesar nada

Uso:  python3 tools/pc404/build_model.py      (necesita numpy, scipy y Pillow)
Sale: static/assets/3d/pc404-<VERSION>.glb y tools/pc404/assembly.json
Unidades: metros. Y hacia arriba, frontal hacia +Z, lateral de cristal en -X.
"""
from pathlib import Path
import io, json, math, struct
import numpy as np
from scipy.spatial import ConvexHull
from PIL import Image, ImageDraw

VERSION = 2
AQUI = Path(__file__).parent
WEB = AQUI.parent.parent
SALIDA = WEB / 'static' / 'assets' / '3d' / f'pc404-{VERSION}.glb'

G = {'asset': {'version': '2.0', 'generator': 'pc404 procedural v2 (alextoll.store)'},
     'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'name': 'PC_404', 'children': []}],
     'meshes': [], 'materials': [], 'buffers': [], 'bufferViews': [], 'accessors': [],
     'samplers': [], 'images': [], 'textures': []}
buf = bytearray()


# ---------------------------------------------------------------- materiales
def material(name, color, metal=0.0, rough=0.5, alpha=1.0, emissive=None, extra=None):
    m = {'name': name, 'pbrMetallicRoughness': {'baseColorFactor': list(color) + [alpha], 'metallicFactor': metal, 'roughnessFactor': rough}}
    if alpha < 1: m.update(alphaMode='BLEND', doubleSided=True)
    if emissive: m['emissiveFactor'] = emissive
    if extra: m.update(extra)
    G['materials'].append(m)
    return len(G['materials']) - 1


def datos(a, tipo, ctype=5126, target=None):
    a = np.asarray(a, dtype={5126: '<f4', 5125: '<u4', 5123: '<u2'}[ctype])
    buf.extend(b'\0' * ((-len(buf)) % 4))
    ini = len(buf); raw = a.tobytes(); buf.extend(raw)
    bv = {'buffer': 0, 'byteOffset': ini, 'byteLength': len(raw)}
    if target: bv['target'] = target
    G['bufferViews'].append(bv)
    acc = {'bufferView': len(G['bufferViews']) - 1, 'componentType': ctype, 'count': len(a), 'type': tipo}
    if tipo == 'VEC3': acc.update(min=a.min(axis=0).tolist(), max=a.max(axis=0).tolist())
    if tipo == 'SCALAR' and ctype == 5126: acc.update(min=[float(a.min())], max=[float(a.max())])
    G['accessors'].append(acc)
    return len(G['accessors']) - 1


def imagen_png(img):
    b = io.BytesIO(); img.save(b, 'PNG', optimize=True); raw = b.getvalue()
    buf.extend(b'\0' * ((-len(buf)) % 4))
    ini = len(buf); buf.extend(raw)
    G['bufferViews'].append({'buffer': 0, 'byteOffset': ini, 'byteLength': len(raw)})
    G['images'].append({'bufferView': len(G['bufferViews']) - 1, 'mimeType': 'image/png'})
    if not G['samplers']: G['samplers'].append({'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497})
    G['textures'].append({'sampler': 0, 'source': len(G['images']) - 1})
    return len(G['textures']) - 1


def textura_malla():
    """Chapa perforada: agujeros redondos al tresbolillo (transparentes) en una baldosa repetible."""
    n = 512; paso = n / 4; r = paso * .36
    img = Image.new('RGBA', (n, n), (40, 42, 48, 255))
    d = ImageDraw.Draw(img)
    for fila in range(-1, 5):
        for col in range(-1, 6):
            x = col * paso + (paso / 2 if fila % 2 else 0); y = fila * paso
            d.ellipse([x - r, y - r, x + r, y + r], fill=(0, 0, 0, 0))
    return img.resize((128, 128), Image.LANCZOS)


M = {
    'frame': material('Grafito satinado', [.13, .15, .18], .78, .32),
    'panel': material('Acero pintado', [.065, .075, .09], .45, .43),
    'edge': material('Aluminio cepillado', [.44, .49, .55], .88, .28),
    'pcb': material('PCB oscuro', [.035, .065, .06], .2, .72),
    'plastic': material('Polimero mate', [.035, .04, .052], .05, .55),
    'chip': material('Encapsulado chips', [.09, .10, .12], .15, .48),
    'gold': material('Contactos', [.6, .4, .14], .82, .3),
    'blue': material('Azul tenue', [.04, .18, .55], .25, .3, emissive=[.015, .12, .5]),
    'glass': material('Vidrio lateral', [.3, .43, .5], .05, .12, .12),
    'rubber': material('Goma', [.022, .025, .03], 0, .9),
    'cable': material('Cable trenzado', [.03, .032, .036], 0, .7),
    'fan': material('Aspas', [.03, .033, .04], .05, .45),
}
M['mesh'] = material('Malla frontal', [1, 1, 1], .6, .45, extra={
    'alphaMode': 'MASK', 'alphaCutoff': .5, 'doubleSided': True})
# la baldosa mide 18 mm: el panel (192 × 405 mm) la repite 10,7 × 22,5 veces
G['materials'][M['mesh']]['pbrMetallicRoughness']['baseColorTexture'] = {'index': imagen_png(textura_malla()),
    'extensions': {'KHR_texture_transform': {'scale': [.192 / .018, .405 / .018]}}}


# ---------------------------------------------------------------- nodos y mallas acumuladas
nodos = {}      # nombre -> índice
acum = {}       # índice de nodo -> {material: [pos, nor, uv, idx]}


def nodo(nombre, padre=0, t=None, r=None, extras=None):
    d = {'name': nombre, 'children': []}
    if t is not None: d['translation'] = [float(v) for v in t]
    if r is not None: d['rotation'] = [float(v) for v in r]
    if extras: d['extras'] = extras
    G['nodes'].append(d); i = len(G['nodes']) - 1
    G['nodes'][padre]['children'].append(i); nodos[nombre] = i
    return i


def grupo(nombre):
    return nodo(nombre, 0, extras={'part': nombre})


def quat_eje(desde, hacia):
    a = np.array(desde, float); b = np.array(hacia, float)
    a /= np.linalg.norm(a); b /= np.linalg.norm(b)
    c = np.cross(a, b); w = 1 + np.dot(a, b)
    if w < 1e-8: return [1, 0, 0, 0] if abs(a[0]) < .9 else [0, 1, 0, 0]
    q = np.r_[c, w]; return (q / np.linalg.norm(q)).tolist()


def matriz_quat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def anadir(destino, mat, V, N, UV, F):
    """Suma geometría (ya colocada) a la malla de ese nodo y material.
    Las UV de cada pieza se llevan a 0..1 (en el archivo van como enteros de 16 bits)."""
    UV = np.asarray(UV, float)
    if len(UV) and (UV.min() < 0 or UV.max() > 1):
        lo = UV.min(axis=0); r = UV.max(axis=0) - lo; r[r == 0] = 1; UV = (UV - lo) / r
    a = acum.setdefault(destino, {}).setdefault(mat, [[], [], [], []])
    base = sum(len(p) for p in a[0])
    a[0].append(np.asarray(V, float)); a[1].append(np.asarray(N, float)); a[2].append(np.asarray(UV, float))
    a[3].append(np.asarray(F, int) + base)


def uv_plano(V, N, escala=10.0):
    """UV por proyección según la cara (en decímetros: 1 unidad = 10 cm)."""
    uv = np.zeros((len(V), 2))
    for i, (p, n) in enumerate(zip(V, N)):
        ax = int(np.argmax(np.abs(n)))
        o = [k for k in range(3) if k != ax]
        uv[i] = [p[o[0]] * escala, p[o[1]] * escala] if ax != 0 else [p[2] * escala, p[1] * escala]
    return uv


def caras_planas(V, F):
    """Normales planas: cada cara plana con sus propios vértices (compartidos dentro de la cara)."""
    V = np.asarray(V, float); P = []; Nn = []; FF = []; vistos = {}
    for f in F:
        a, b, c = V[f]; n = np.cross(b - a, c - a); l = np.linalg.norm(n)
        if l < 1e-14: continue
        n /= l; tri = []
        for p in (a, b, c):
            k = (tuple(np.round(p, 7)), tuple(np.round(n, 4)))
            if k not in vistos: vistos[k] = len(P); P.append(p); Nn.append(n)
            tri.append(vistos[k])
        FF.append(tri)
    return np.array(P), np.array(Nn), np.array(FF)


def normales_suaves(V, F):
    V = np.asarray(V, float); N = np.zeros_like(V)
    for f in F:
        a, b, c = V[f]; n = np.cross(b - a, c - a); N[f] += n
    l = np.linalg.norm(N, axis=1, keepdims=True); l[l == 0] = 1
    return N / l


_cache_caja = {}


def caja(dims, pos, mat, destino, bisel=.001, uv='plano', uvesc=10.0, rot=None):
    dims = tuple(float(d) for d in dims)
    key = (dims, bisel)
    if key not in _cache_caja:
        h = np.array(dims) / 2; r = min(bisel, min(h) * .3); vs = []
        if r <= 0:
            vs = [[sx * h[0], sy * h[1], sz * h[2]] for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]
        else:
            for ax in range(3):
                for s in (-1, 1):
                    for a in (-1, 1):
                        for b in (-1, 1):
                            p = h - r; o = [i for i in range(3) if i != ax]
                            p = p.copy(); p[ax] = h[ax] * s; p[o[0]] *= a; p[o[1]] *= b; vs.append(p)
        vs = np.unique(np.array(vs), axis=0); hull = ConvexHull(vs); fs = []
        for f, eq in zip(hull.simplices, hull.equations):
            f = list(f); a, b, c = vs[f]
            if np.dot(np.cross(b - a, c - a), eq[:3]) < 0: f = [f[0], f[2], f[1]]
            fs.append(f)
        _cache_caja[key] = caras_planas(vs, fs)
    P, Nn, F = _cache_caja[key]
    h = np.array(dims) / 2
    if uv == 'ajuste':   # 0..1 sobre la cara (para texturas dibujadas: placa, módulos)
        UV = np.zeros((len(P), 2))
        for i, (p, n) in enumerate(zip(P, Nn)):
            ax = int(np.argmax(np.abs(n))); o = [k for k in range(3) if k != ax]
            if ax == 0: o = [2, 1]
            UV[i] = [(p[o[0]] / h[o[0]] + 1) / 2, (p[o[1]] / h[o[1]] + 1) / 2]
    else:
        UV = None
    R = matriz_quat(rot) if rot is not None else np.eye(3)
    V = P @ R.T + np.array(pos); N = Nn @ R.T
    if UV is None: UV = uv_plano(V, N, uvesc)
    anadir(destino, mat, V, N, UV, F)


def cilindro(r, largo, pos, mat, destino, eje='z', seg=24, tapas=True, r2=None):
    """Cilindro (o tronco de cono con r2) con laterales suaves y tapas planas."""
    r2 = r if r2 is None else r2
    V = []; N = []; UV = []; F = []
    for k, (z, rr) in enumerate(((-largo / 2, r), (largo / 2, r2))):
        for i in range(seg + 1):
            a = 2 * math.pi * i / seg
            V.append([rr * math.cos(a), rr * math.sin(a), z]); N.append([math.cos(a), math.sin(a), (r - r2) / largo])
            UV.append([i / seg * 2 * math.pi * r * 10, (z + largo / 2) * 10])
    for i in range(seg):
        a, b, c, d = i, i + 1, seg + 1 + i, seg + 2 + i
        F += [[a, b, d], [a, d, c]]
    if tapas:
        for z, rr, s in ((-largo / 2, r, -1), (largo / 2, r2, 1)):
            c0 = len(V); V.append([0, 0, z]); N.append([0, 0, s]); UV.append([0, 0])
            for i in range(seg + 1):
                a = 2 * math.pi * i / seg
                V.append([rr * math.cos(a), rr * math.sin(a), z]); N.append([0, 0, s]); UV.append([math.cos(a) * rr * 10, math.sin(a) * rr * 10])
            for i in range(seg):
                F.append([c0, c0 + 1 + i, c0 + 2 + i] if s > 0 else [c0, c0 + 2 + i, c0 + 1 + i])
    V = np.array(V); N = np.array(N); N /= np.linalg.norm(N, axis=1, keepdims=True)
    q = quat_eje([0, 0, 1], {'x': [1, 0, 0], 'y': [0, 1, 0], 'z': [0, 0, 1]}[eje])
    R = matriz_quat(q)
    anadir(destino, mat, V @ R.T + np.array(pos), N @ R.T, np.array(UV), F)


def anillo(r_in, r_out, largo, pos, mat, destino, eje='z', seg=32):
    """Tubo corto con grosor (marco redondo del ventilador)."""
    V = []; N = []; F = []
    def tira(r, s):
        b = len(V)
        for z in (-largo / 2, largo / 2):
            for i in range(seg + 1):
                a = 2 * math.pi * i / seg; V.append([r * math.cos(a), r * math.sin(a), z]); N.append([s * math.cos(a), s * math.sin(a), 0])
        for i in range(seg):
            a, b2, c, d = b + i, b + i + 1, b + seg + 1 + i, b + seg + 2 + i
            F.extend([[a, b2, d], [a, d, c]] if s > 0 else [[a, d, b2], [a, c, d]])
    tira(r_out, 1); tira(r_in, -1)
    for z, s in ((-largo / 2, -1), (largo / 2, 1)):
        b = len(V)
        for i in range(seg + 1):
            a = 2 * math.pi * i / seg
            V.append([r_in * math.cos(a), r_in * math.sin(a), z]); N.append([0, 0, s])
            V.append([r_out * math.cos(a), r_out * math.sin(a), z]); N.append([0, 0, s])
        for i in range(seg):
            a, b2, c, d = b + 2 * i, b + 2 * i + 1, b + 2 * i + 2, b + 2 * i + 3
            F.extend([[a, b2, d], [a, d, c]] if s > 0 else [[a, d, b2], [a, c, d]])
    V = np.array(V); N = np.array(N, float)
    R = matriz_quat(quat_eje([0, 0, 1], {'x': [1, 0, 0], 'y': [0, 1, 0], 'z': [0, 0, 1]}[eje]))
    V = V @ R.T + np.array(pos); N = N @ R.T
    anadir(destino, mat, V, N, uv_plano(V, N), F)


def tubo(puntos, r, mat, destino, seg=6, pasos=5):
    """Tubo continuo por una curva Catmull-Rom (cables)."""
    P = [np.array(p, float) for p in puntos]
    P = [2 * P[0] - P[1]] + P + [2 * P[-1] - P[-2]]
    C = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(pasos):
            t = k / pasos
            C.append(.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    C.append(P[-2]); C = np.array(C)
    T = np.gradient(C, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True)
    n = np.cross(T[0], [0, 1, 0] if abs(T[0][1]) < .9 else [1, 0, 0]); n /= np.linalg.norm(n)
    V = []; N = []; UV = []; F = []; largo = 0
    for i, (c, t) in enumerate(zip(C, T)):
        if i: n = n - np.dot(n, t) * t; n /= np.linalg.norm(n); largo += np.linalg.norm(C[i] - C[i - 1])
        b = np.cross(t, n)
        for j in range(seg + 1):
            a = 2 * math.pi * j / seg; d = math.cos(a) * n + math.sin(a) * b
            V.append(c + r * d); N.append(d); UV.append([j / seg, largo * 10])
    for i in range(len(C) - 1):
        for j in range(seg):
            a = i * (seg + 1) + j; b2 = a + seg + 1
            F += [[a, b2, b2 + 1], [a, b2 + 1, a + 1]]
    anadir(destino, mat, V, N, UV, F)


def aspa(r0, r1, ang0, barrido, paso, grosor, mat, destino, k_total, fase):
    """Aspa curva con ángulo de ataque: superficie con grosor, normales suaves."""
    nr, nc = 5, 4; V = []; F = []
    for cara in (-1, 1):
        b = len(V)
        for i in range(nr):
            rr = r0 + (r1 - r0) * i / (nr - 1)
            curva = barrido * (0.75 + 0.5 * i / (nr - 1))
            for j in range(nc):
                u = j / (nc - 1); a = fase + ang0 + curva * u + 0.22 * (i / (nr - 1)) ** 1.5
                z = (u - .5) * paso * (1 - 0.35 * i / (nr - 1)) + cara * grosor / 2
                V.append([rr * math.cos(a), rr * math.sin(a), z])
        for i in range(nr - 1):
            for j in range(nc - 1):
                a = b + i * nc + j; c = a + nc
                F.extend([[a, c, c + 1], [a, c + 1, a + 1]] if cara > 0 else [[a, c + 1, c], [a, a + 1, c + 1]])
    # bordes que cierran el grosor
    m = nr * nc
    borde = [i * nc for i in range(nr)] + [(nr - 1) * nc + j for j in range(1, nc)] + [i * nc + nc - 1 for i in range(nr - 2, -1, -1)] + [j for j in range(nc - 2, 0, -1)]
    for s in range(len(borde)):
        a = borde[s]; b2 = borde[(s + 1) % len(borde)]
        F += [[a, b2, b2 + m], [a, b2 + m, a + m]]
    V = np.array(V); N = normales_suaves(V, F)
    return V, N, F


def ventilador(nombre, centro, lado, padre_grupo, eje=(0, 0, 1), aspas=7, grosor=.025, marco=True):
    """Marco cuadrado con aro interior y rotor aparte (nodo «<nombre>_rotor» que gira en la web)."""
    q = quat_eje([0, 0, 1], eje); R = matriz_quat(q); c = np.array(centro, float)
    def poner(pl):  # local del ventilador -> grupo
        return pl @ R.T + c
    r = lado * .46
    # marco: cuatro largueros con chaflán y orejas de tornillo
    tmp = {}
    def local_caja(dims, pos, mat, bisel=.0015):
        caja(dims, pos, mat, ('tmp', id(tmp)), bisel)
    for s in (-1, 1) if marco else ():
        local_caja((.008, lado, grosor), (s * (lado - .008) / 2, 0, 0), M['plastic'])
        local_caja((lado, .008, grosor), (0, s * (lado - .008) / 2, 0), M['plastic'])
        for s2 in (-1, 1):
            local_caja((.016, .016, grosor * .8), (s * lado * .42, s2 * lado * .42, 0), M['plastic'], 0)
    anillo(r + .001, r + .006, grosor, (0, 0, 0), M['plastic'], ('tmp', id(tmp)))
    # cruceta trasera que sujeta el motor
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        local_caja((r * .95, .006, .004), (math.cos(a) * r * .5, math.sin(a) * r * .5, -grosor / 2 + .003), M['plastic'], 0)
    cilindro(r * .3, .006, (0, 0, -grosor / 2 + .004), M['plastic'], ('tmp', id(tmp)), seg=28)
    for s in (-1, 1) if marco else ():
        for s2 in (-1, 1):
            cilindro(.0026, .004, (s * lado * .42, s2 * lado * .42, grosor / 2 - .0005), M['edge'], ('tmp', id(tmp)), seg=8)
    # pasar lo temporal al grupo, girado y colocado
    for mat, (Vs, Ns, UVs, Fs) in acum.pop(('tmp', id(tmp))).items():
        V = np.vstack(Vs); N = np.vstack(Ns); F = np.vstack(Fs)
        V2 = poner(V); N2 = N @ R.T
        anadir(padre_grupo, mat, V2, N2, uv_plano(V2, N2), F)
    # rotor: buje + aspas, en su propio nodo
    rot = nodo(nombre + '_rotor', padre_grupo, t=c, r=q, extras={'rotor': True})
    cilindro(r * .27, grosor * .62, (0, 0, .002), M['fan'], rot, seg=32)
    cilindro(r * .2, .0012, (0, 0, grosor * .31 + .0026), M['chip'], rot, seg=32, tapas=True)
    for k in range(aspas):
        V, N, F = aspa(r * .26, r * .97, 0, .62, grosor * .5, .0011, M['fan'], rot, aspas, k * 2 * math.pi / aspas)
        V[:, 2] += .002
        anadir(rot, M['fan'], V, N, uv_plano(V, N), F)
    return rot


# ================================================================= MODELO
# ---- Chasis
frame = grupo('case_frame')
for x in (-.105, .105):
    for z in (-.205, .205):
        caja((.009, .43, .009), (x, .235, z), M['frame'], frame, .0015)
caja((.22, .008, .42), (0, .024, 0), M['panel'], frame, .0015)              # base
caja((.22, .008, .42), (0, .446, 0), M['panel'], frame, .0015)              # techo
for z in (-.205, .205):
    caja((.21, .008, .009), (0, .438, z), M['frame'], frame)
    caja((.21, .008, .009), (0, .032, z), M['frame'], frame)
caja((.005, .33, .39), (.087, .27, 0), M['panel'], frame)                    # bandeja de la placa
for y, z in ((.36, .1), (.24, .1), (.43, -.135)):                           # pasacables de goma
    caja((.004, .05, .016), (.0835, y, z), M['rubber'], frame, .005)
    caja((.0008, .044, .0015), (.0813, y, z), M['chip'], frame, 0)           # ranura del pasacables
caja((.003, .415, .4), (.1125, .238, 0), M['panel'], frame, .001)           # lateral derecho cerrado
# trasera: columna derecha, izquierda y travesaños (sin el de abajo: por ahí entra la fuente)
caja((.035, .41, .006), (.085, .235, -.208), M['frame'], frame)
caja((.016, .41, .006), (-.098, .235, -.208), M['frame'], frame)
for y in (.115, .24, .43):
    caja((.19, .008, .006), (0, y, -.208), M['frame'], frame)
# tapas de ranuras PCI (las tres a la altura de la gráfica las ocupa su chapa)
for y in (.13, .149, .225):
    caja((.075, .009, .003), (-.04, y, -.21), M['frame'], frame, .0005)
# tapa de la fuente con lateral cerrado y rejilla en el techo
caja((.21, .005, .4), (0, .105, 0), M['panel'], frame)
caja((.006, .078, .21), (-.103, .065, .095), M['panel'], frame)            # lateral de la tapa (detrás queda abierto: se ve la fuente)
caja((.2, .078, .004), (0, .065, .198), M['panel'], frame)                   # frente de la tapa
for x in (-.07, .07):
    for z in (-.165, .165):
        caja((.034, .02, .042), (x, .01, z), M['rubber'], frame, .004)        # pies apoyados en el suelo
for z in np.linspace(-.15, .14, 19):
    caja((.125, .0016, .0032), (0, .4508, z), M['plastic'], frame, 0)        # ranuras del techo
for z in np.linspace(-.16, .05, 8):
    caja((.06, .0012, .0035), (.03, .1077, z), M['plastic'], frame, 0)       # rejilla de la tapa de la fuente

# ---- Fuente de alimentación
psu = grupo('psu')
caja((.15, .075, .145), (.015, .064, -.122), M['plastic'], psu, .003)
caja((.152, .002, .1), (.015, .1025, -.12), M['frame'], psu, .0005)          # etiqueta / chapa superior
caja((.026, .02, .004), (.045, .07, -.1965), M['chip'], psu, .001)           # conector de corriente
cilindro(.03, .003, (.015, .064, -.1955), M['frame'], psu, 'z', 32)          # rejilla trasera
for k in range(6):
    caja((.05, .0015, .001), (.015, .049 + k * .006, -.1972), M['plastic'], psu, 0)

# ---- Placa base (cara delantera de la placa en x = BX)
BX = .0765
mb = grupo('motherboard')
caja((.003, .272, .245), (.078, .285, -.055), M['pcb'], mb, 0, uv='ajuste')
for y in (.16, .285, .41):
    for z in (-.17, .055):
        cilindro(.0032, .009, (.082, y, z), M['gold'], mb, 'x', 12)
        cilindro(.0035, .0015, (BX - .0008, y, z), M['edge'], mb, 'x', 12)    # tornillos
caja((.006, .056, .056), (BX - .003, .326, -.083), M['plastic'], mb, .001)  # zócalo
caja((.002, .046, .046), (BX - .0065, .326, -.083), M['frame'], mb, .0004)  # marco de retención
for z in (.015, .032):
    caja((.009, .137, .0065), (BX - .0045, .324, z), M['plastic'], mb, .0008)  # ranuras RAM
    for s in (-1, 1):
        caja((.004, .006, .0068), (BX - .011, .324 + s * .0705, z), M['plastic'], mb, .0008)  # pestañas
caja((.012, .009, .12), (BX - .006, .206, -.1), M['plastic'], mb, .001)     # ranura PCIe (a la altura de la placa de la gráfica, que entra en ella)
caja((.009, .009, .045), (BX - .0045, .17, -.115), M['plastic'], mb, .001)  # segunda ranura
caja((.022, .083, .022), (BX - .011, .342, -.153), M['edge'], mb, .002)     # disipador VRM
for y in np.linspace(.306, .378, 9):
    caja((.024, .0018, .024), (BX - .013, y, -.153), M['frame'], mb, 0)
caja((.012, .03, .095), (BX - .006, .405, -.075), M['edge'], mb, .002)      # VRM superior
caja((.032, .1, .026), (BX - .016, .34, -.192), M['frame'], mb, .002)       # bloque de E/S hasta la trasera
for y, h in ((.305, .012), (.322, .012), (.34, .016), (.36, .01), (.378, .012)):
    caja((.026, h, .004), (BX - .016, y, -.2035), M['plastic'], mb, .0006)
caja((.01, .034, .034), (BX - .005, .235, .02), M['edge'], mb, .002)         # chipset
caja((.012, .052, .016), (BX - .006, .31, .058), M['plastic'], mb, .001)     # conector de 24 pines
caja((.01, .016, .016), (BX - .005, .415, -.16), M['plastic'], mb, .001)     # conector CPU 8 pines
for y, z in ((.18, .035), (.26, -.145), (.175, -.09), (.395, .02)):
    caja((.003, .015, .02), (BX - .0015, y, z), M['chip'], mb, .0005)
for y in np.linspace(.23, .39, 10):
    cilindro(.003, .012, (BX - .006, y, -.133), M['edge'], mb, 'x', 12)
caja((.004, .012, .012), (BX - .002, .2, .045), M['chip'], mb, .0005)       # pila

# ---- CPU
cpu = grupo('cpu')
caja((.002, .04, .04), (BX - .007, .326, -.083), M['pcb'], cpu, .0003)
caja((.003, .033, .033), (BX - .0095, .326, -.083), M['edge'], cpu, .0015)

# ---- SSD M.2 con disipador
ssd = grupo('ssd')
caja((.0016, .022, .08), (BX - .0018, .262, -.05), M['pcb'], ssd, 0)
caja((.006, .023, .078), (BX - .0055, .262, -.05), M['frame'], ssd, .0012)
for z in np.linspace(-.084, -.016, 12):
    caja((.003, .019, .0012), (BX - .0095, .262, z), M['edge'], ssd, 0)

# ---- RAM (entran en sus ranuras)
for nombre, z in (('ram_a', .015), ('ram_b', .032)):
    g = grupo(nombre)
    xr = BX - .009 - .016
    caja((.034, .133, .0013), (xr + .002, .324, z), M['pcb'], g, 0, uv='ajuste')
    caja((.03, .128, .006), (xr, .324, z), M['frame'], g, .0012)
    caja((.0025, .114, .0062), (xr - .016, .324, z), M['blue'], g, .0006)
    caja((.002, .13, .0012), (BX - .0085, .324, z), M['gold'], g, 0)

# ---- Disipador del procesador (de torre baja, ventilador hacia el cristal)
cool = grupo('cpu_cooler')
caja((.012, .038, .038), (BX - .017, .326, -.083), M['edge'], cool, .002)
for x in np.linspace(-.036, .034, 24):
    caja((.0011, .099, .072), (x, .326, -.083), M['edge'], cool, 0)
for z in (-.108, -.096, -.07, -.058):
    tubo([[.06, .31, z], [.045, .3, z], [-.02, .3, z], [-.039, .302, z]], .003, M['edge'], cool, seg=10, pasos=6)
caja((.004, .101, .074), (.037, .326, -.083), M['frame'], cool, .001)        # tapa superior
ventilador('cpu_fan', (-.049, .326, -.083), .094, cool, eje=(-1, 0, 0), grosor=.022)

# ---- Gráfica (horizontal, enchufada en la ranura PCIe, ventiladores hacia abajo)
gpu = grupo('gpu')
caja((.12, .0016, .265), (.006, .2055, -.06), M['pcb'], gpu, 0)             # placa de la gráfica
caja((.0054, .0016, .084), (.0688, .2055, -.1), M['gold'], gpu, 0)          # conector: entero dentro de la ranura (si asoma, su cara coincide con la de la ranura y parpadea)
caja((.112, .003, .268), (.003, .2085, -.06), M['frame'], gpu, .0012)       # placa trasera
caja((.104, .032, .262), (.0, .188, -.058), M['edge'], gpu, .002)           # bloque de aletas
for z in np.linspace(-.182, .066, 46):
    caja((.098, .03, .0009), (-.001, .1875, z), M['frame'], gpu, 0)
caja((.108, .007, .27), (-.001, .1685, -.058), M['plastic'], gpu, .002)     # carcasa de los ventiladores
caja((.008, .04, .27), (-.054, .187, -.058), M['plastic'], gpu, .002)       # lateral visible
for z in (-.1955, .0795):
    caja((.112, .044, .005), (.002, .187, z), M['plastic'], gpu, .0015)      # tapas de los extremos (el radiador no se ve desnudo)
caja((.03, .0015, .1), (-.02, .2105, .0), M['chip'], gpu, 0)                # etiqueta de la placa trasera
caja((.0012, .003, .17), (-.0585, .199, -.04), M['blue'], gpu, 0)           # línea azul (se enciende)
caja((.115, .045, .003), (.005, .187, -.1975), M['edge'], gpu, .0006)       # chapa trasera
for y in (.172, .184, .196):
    caja((.02, .006, .002), (-.02, y, -.1995), M['plastic'], gpu, .0005)    # salidas de vídeo
caja((.004, .012, .02), (-.0565, .199, .05), M['plastic'], gpu, .001)       # conector de corriente
for z in (-.122, .002):
    ventilador('gpu_fan_' + ('a' if z < 0 else 'b'), (-.001, .163, z), .086, gpu, eje=(0, -1, 0), grosor=.009, marco=False)

# ---- Ventiladores de la caja
for nombre, y in (('fan_front_a', .33), ('fan_front_b', .188)):
    g = grupo(nombre); ventilador(nombre, (0, y, .18), .132, g, eje=(0, 0, -1))
g = grupo('fan_rear'); ventilador('fan_rear', (0, .364, -.191), .106, g, eje=(0, 0, -1))

# ---- Cables
cab = grupo('cable_set')
for i in range(4):   # corriente de la gráfica: sale del conector y baja por la tapa de la fuente
    dz = .044 + i * .0042
    tubo([[-.058, .199, dz], [-.074, .196, dz], [-.08, .17, dz], [-.078, .135, dz], [-.06, .112, dz], [-.03, .108, dz]], .0017, M['cable'], cab)
for i in range(6):   # 24 pines: del conector hacia el pasacables de la bandeja
    dy = .292 + i * .0068
    tubo([[.064, dy, .066], [.05, dy, .08], [.062, dy - .02, .097], [.083, .24 + i * .006, .1]], .0016, M['cable'], cab)
for i in range(3):   # 8 pines del procesador, por arriba
    dz = -.166 + i * .004
    tubo([[.068, .424, dz], [.06, .432, dz], [.075, .434, dz - .02], [.085, .38, -.135]], .0015, M['cable'], cab)
for y in (.14, .156):
    caja((.007, .004, .022), (-.079, y, .0505), M['frame'], cab, .0008)      # peines de cables

# ---- Frontal de aluminio con malla perforada
front = grupo('front_mesh')
for x in (-.103, .103):
    caja((.014, .43, .014), (x, .237, .214), M['edge'], front, .0025)
for y in (.027, .446):
    caja((.22, .014, .014), (0, y, .214), M['edge'], front, .0025)
caja((.192, .405, .0015), (0, .2365, .216), M['mesh'], front, 0, uv='ajuste')
caja((.0022, .05, .0016), (.094, .39, .2215), M['blue'], front, 0)          # indicador de encendido

# ---- Cristal lateral con marco
glass = grupo('glass_side')
caja((.003, .397, .392), (-.112, .237, 0), M['glass'], glass, 0)
for z in (-.198, .198):
    caja((.004, .402, .006), (-.1125, .237, z), M['frame'], glass, .001)
for y in (.037, .437):
    caja((.004, .006, .4), (-.1125, y, 0), M['frame'], glass, .001)
for y in (.05, .425):
    for z in (-.184, .184):
        cilindro(.0045, .004, (-.1155, y, z), M['edge'], glass, 'x', 16)


# ================================================================= MONTAJE
# Cada pieza: (inicio, fin, trayecto). El trayecto son desplazamientos desde su sitio:
# el primero es donde aparece, el penúltimo la deja alineada con su hueco y el último es 0
# (encajada). Entre puntos se mueve suave; el último tramo frena al llegar.
X = -1
MONTAJE = [
    ('psu',         .5, 1.5, [[0, .015, -.26], [0, 0, -.1], [0, 0, 0]]),
    ('motherboard', 1.35, 2.5, [[-.25, .02, 0], [-.06, 0, 0], [0, 0, 0]]),
    ('cpu',         2.4, 3.0, [[-.2, .04, 0], [-.04, 0, 0], [0, 0, 0]]),
    ('ssd',         2.85, 3.45, [[-.2, -.02, .015], [-.04, 0, 0], [0, 0, 0]]),
    ('ram_a',       3.2, 3.8, [[-.2, .05, 0], [-.055, 0, 0], [0, 0, 0]]),
    ('ram_b',       3.5, 4.1, [[-.21, .05, 0], [-.055, 0, 0], [0, 0, 0]]),
    ('cpu_cooler',  4.1, 5.15, [[-.25, .06, 0], [-.08, 0, 0], [0, 0, 0]]),
    ('gpu',         5.05, 6.2, [[-.26, .025, .015], [-.11, 0, 0], [0, 0, 0]]),
    ('fan_front_a', 6.1, 6.8, [[0, .015, .24], [0, 0, .08], [0, 0, 0]]),
    ('fan_front_b', 6.35, 7.05, [[0, .015, .24], [0, 0, .08], [0, 0, 0]]),
    ('fan_rear',    6.7, 7.4, [[0, .015, -.22], [0, 0, -.07], [0, 0, 0]]),
    ('cable_set',   7.35, 8.0, [[-.16, 0, 0], [-.035, 0, 0], [0, 0, 0]]),
    ('front_mesh',  7.9, 8.7, [[0, 0, .22], [0, 0, .045], [0, 0, 0]]),
    ('glass_side',  8.65, 9.8, [[-.24, .008, 0], [-.05, 0, 0], [0, 0, 0]]),
]
DURACION = 10.0


def suave(t): return t * t * (3 - 2 * t)
def frena(t): return 1 - (1 - t) ** 3


anim = {'name': 'Assembly_10s', 'samplers': [], 'channels': []}
for nombre, ini, fin, tray in MONTAJE:
    tray = np.array(tray, float)
    tiempos = [0.0, ini]; valores = [tray[0], tray[0]]
    tramos = len(tray) - 1
    # el último tramo dura un poco más (encaje lento)
    pesos = np.array([1.0] * (tramos - 1) + [1.25]); pesos /= pesos.sum()
    t0 = ini
    for k in range(tramos):
        dur = (fin - ini) * pesos[k]
        curva = frena if k == tramos - 1 else suave
        for s in range(1, 13):
            u = s / 12; tiempos.append(t0 + dur * u)
            valores.append(tray[k] + (tray[k + 1] - tray[k]) * curva(u))
        t0 += dur
    tiempos.append(DURACION); valores.append(np.zeros(3))
    si = len(anim['samplers'])
    anim['samplers'].append({'input': datos(tiempos, 'SCALAR'), 'output': datos(np.array(valores), 'VEC3'), 'interpolation': 'LINEAR'})
    anim['channels'].append({'sampler': si, 'target': {'node': nodos[nombre], 'path': 'translation'}})
    G['nodes'][nodos[nombre]]['extras'].update(assemblyStart=ini, assemblyEnd=fin, explodedOffset=tray[0].tolist())
G['animations'] = [anim]


# ================================================================= ESCRIBIR
# KHR_mesh_quantization: posiciones en enteros de 16 bits (las piezas caben en ±1 m: precisión
# de 0,03 mm), normales en 8 bits y UV en 16 bits. La mitad de tamaño y Three.js lo lee tal cual.
def vista_entera(arr, ctype, comps, stride, normalizada=True, minmax=False):
    dt = {5122: '<i2', 5123: '<u2', 5120: '<i1'}[ctype]
    n = len(arr); tam = np.dtype(dt).itemsize
    huecos = stride // tam
    out = np.zeros((n, huecos), dtype=dt); out[:, :comps] = arr
    buf.extend(b'\0' * ((-len(buf)) % 4)); ini = len(buf); raw = out.tobytes(); buf.extend(raw)
    G['bufferViews'].append({'buffer': 0, 'byteOffset': ini, 'byteLength': len(raw), 'byteStride': stride, 'target': 34962})
    acc = {'bufferView': len(G['bufferViews']) - 1, 'componentType': ctype, 'count': n, 'type': {2: 'VEC2', 3: 'VEC3'}[comps], 'normalized': normalizada}
    if minmax: acc.update(min=arr.min(axis=0).astype(int).tolist(), max=arr.max(axis=0).astype(int).tolist())
    G['accessors'].append(acc); return len(G['accessors']) - 1


for destino, mats in acum.items():
    if not isinstance(destino, int): continue
    prims = []
    for mat, (Vs, Ns, UVs, Fs) in mats.items():
        V = np.vstack(Vs); N = np.vstack(Ns); UV = np.vstack(UVs); F = np.vstack(Fs).ravel()
        assert np.abs(V).max() < 1
        qV = np.round(V * 32767).astype(int)
        qN = np.round(N / np.linalg.norm(N, axis=1, keepdims=True) * 127).astype(int)
        qUV = np.round(np.clip(UV, 0, 1) * 65535).astype(int)
        ctype = 5123 if len(V) < 65536 else 5125
        prims.append({'attributes': {'POSITION': vista_entera(qV, 5122, 3, 8, minmax=True), 'NORMAL': vista_entera(qN, 5120, 3, 4),
                                     'TEXCOORD_0': vista_entera(qUV, 5123, 2, 4)},
                      'indices': datos(F, 'SCALAR', ctype, target=34963), 'material': mat})
    G['meshes'].append({'name': G['nodes'][destino]['name'], 'primitives': prims})
    G['nodes'][destino]['mesh'] = len(G['meshes']) - 1
G['extensionsUsed'] = ['KHR_mesh_quantization', 'KHR_texture_transform']
G['extensionsRequired'] = ['KHR_mesh_quantization']
for n in G['nodes']:
    if not n['children']: del n['children']
G['buffers'] = [{'byteLength': len(buf)}]
j = json.dumps(G, separators=(',', ':')).encode(); j += b' ' * ((-len(j)) % 4); buf.extend(b'\0' * ((-len(buf)) % 4))
glb = struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(j) + 8 + len(buf)) + struct.pack('<I4s', len(j), b'JSON') + j + struct.pack('<I4s', len(buf), b'BIN\0') + buf
SALIDA.parent.mkdir(parents=True, exist_ok=True)
SALIDA.write_bytes(glb)
(AQUI / 'assembly.json').write_text(json.dumps({'units': 'meters', 'duration': DURACION, 'clip': anim['name'],
    'parts': [{'name': n, 'start': s, 'end': e, 'path': t} for n, s, e, t in MONTAJE]}, indent=2))
tri = sum(G['accessors'][p['indices']]['count'] // 3 for m in G['meshes'] for p in m['primitives'])
print(f'{SALIDA.relative_to(WEB)}: {len(glb) // 1024} KB, {len(G["nodes"])} nodos, {sum(len(m["primitives"]) for m in G["meshes"])} dibujos, {tri} triángulos')
