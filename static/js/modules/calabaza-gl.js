/* =========================================================
   Calabaza 3D de Halloween (portada): MODELO, MATERIALES E ILUMINACIÓN
   ---------------------------------------------------------
   Sin motor 3D ni archivos de modelo: la calabaza es una superficie
   continua definida por una función de distancia (SDF) y se dibuja con
   WebGL trazando rayos (raymarching) en un solo shader. Así los ojos y
   la boca son cortes reales en una cáscara hueca con grosor, la boca se
   deforma sin romper nada y todo pesa unos pocos KB.

   El shader está dividido en bloques:
     1. MODELO      cuerpo (gajos, surcos, hundimientos), tallo, cáscara
                    hueca, ojos y boca tallados (con dientes)
     2. MATERIALES  piel, carne de los cortes, interior y tallo
     3. ILUMINACIÓN luz lateral, contraluz frío, luz de brasas interior
                    (ilumina paredes, dientes y bordes) y brillo en el hueco
   Las animaciones (estado de la cara y la postura) llegan como uniforms
   desde js/modules/calabaza-anim.js; la integración está en halloween.js.

   await AT.calabazaGL.crear(canvas) → { pintar(estado), medir(w, h), soltar() }  (null sin WebGL o sin gráfica)
   o null si el navegador no tiene WebGL con precisión alta o falla (se queda la foto).
   AT.calabazaGL.proyectar([x, y, z]) → dónde cae ese punto en el lienzo (sombra y reflejo).
   ========================================================= */
window.AT = window.AT || {};

AT.calabazaGL = (() => {
  const VERT = 'attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}';

  const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uOpen, uSmileL, uSmileR, uSquint, uLight, uBreath, uLev;
uniform mat3 uRot;          // del mundo al objeto (inclinación, balanceo, giro mínimo)
uniform vec3 uLin[23];      // lados de los ojos (8) y de los 5 dientes (15)
#define PI 3.14159265
#define TH 0.085            // grosor de la cáscara

/* ---------- utilidades ---------- */
float hash(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float noise(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float smin(float a, float b, float k){ float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }

/* =========================================================
   1. MODELO
   ========================================================= */
float gGroove, gRibT, gLat;   // datos del último punto del cuerpo (para el material)

/* Cuerpo: elipsoide achatado con 10 gajos de anchos distintos, surcos que
   mueren en los hundimientos del tallo y de la base, bultos suaves y base irregular */
float body(vec3 p){
  p.y += .025 * p.x - .02 * p.z;                       // pequeña asimetría (no es simétrica)
  float h = length(p.xz);
  float a = atan(p.x, p.z);                            // 0 = de frente a la cámara
  float aw = a + .11 * sin(a + .6) + .05 * sin(2. * a + 2.) + .03 * sin(3. * a + 4.1);  // gajos desiguales
  float t = aw * 10. / (2. * PI) + .5;                 // surco en el centro: cada ojo cae en un gajo
  float g = .5 - .5 * cos(2. * PI * t);               // 0 en el centro del gajo, 1 en el surco
  float lump = .035 * sin(a * 3. + 1.3) + .022 * sin(a * 5. + .2) + .012 * sin(a * 7. + 2.6);
  vec3 r = vec3(1. + lump, .74 + .5 * lump, 1. + lump) * (1. + .01 * uBreath);
  float k0 = length(p / r), k1 = length(p / (r * r));
  float d = k0 * (k0 - 1.) / k1;
  float lat = clamp(h / (length(p) + 1e-4), 0., 1.);
  float lat2 = lat * lat;
  d += (.075 * g * g + .03 * pow(g, 12.)) * lat2;      // gajos redondeados y surco marcado
  d += .19 * exp(-h * h * 6.5) * smoothstep(.05, .45, p.y);    // hundimiento alrededor del tallo
  d += .11 * exp(-h * h * 8.) * smoothstep(-.05, -.45, p.y);   // hundimiento de la base
  d += .008 * sin(p.x * 5.1 + 1.) * sin(p.y * 4.3 + 2.) * sin(p.z * 4.7);   // bultos irregulares (sin ruido: más barato)
  d = smax(d, -p.y - .67 + .025 * sin(a * 2. + .5) + .015 * sin(a * 5.), .08);  // base algo plana e irregular
  gGroove = g; gRibT = t; gLat = lat;
  return d;
}

/* Tallo corto, retorcido y seco, que sale torcido del hundimiento: estrías marcadas
   que se abren en la base (como las de verdad) y punta cortada en sesgo */
float stem(vec3 p){
  vec3 q = p - vec3(.03, .52, -.04);
  float y = q.y;
  q.x -= .8 * y * y; q.z += .14 * y * y;               // se dobla
  float ang = atan(q.z, q.x) + 3.4 * y;                // se retuerce
  float base = exp(-max(y, 0.) * 13.);
  float rad = .072 - .024 * clamp(y / .28, 0., 1.) + .085 * base
            + (.008 + .032 * base) * cos(5. * ang) + .005 * cos(11. * ang + 1.);
  float d = length(q.xz) - rad;
  d = max(d, -y - .05);
  d = max(d, y - .29 - .16 * q.x + .05 * q.z + .03 * noise(q * 22.));   // punta cortada en sesgo, irregular
  return d * .65;
}

/* Polígono de 5 lados (ojos) */
/* Ojos y dientes son polígonos convexos: su distancia es el máximo de las distancias a
   las rectas de sus lados (uLin = normal hacia fuera y desplazamiento, calculados en JS
   una vez por dibujo: lineas() más abajo). Muy barato */
#define lado(p, i) (dot(uLin[i].xy, p) + uLin[i].z)

/* Ojos: cavidades estrechas, con la parte de arriba cayendo hacia el centro
   (gesto desafiante) y los extremos de fuera algo subidos. Algo distintos entre sí */
float eyes(vec2 p){
  float l = max(max(lado(p, 0), lado(p, 1)), max(lado(p, 2), lado(p, 3)));
  float r = max(max(lado(p, 4), lado(p, 5)), max(lado(p, 6), lado(p, 7)));
  return min(l, r) - .006;
}
#define diente(p, i) max(lado(p, i), max(lado(p, i + 1), lado(p, i + 2)))

/* Boca: sonrisa entre dos curvas, con dientes de la propia carne. Simétrica (los dos lados
   iguales), con el borde algo ondulado como tallado a mano.
   Al abrirse baja la parte de abajo, las comisuras se estiran y el labio de arriba casi no cambia */
float lipU(float u){
  return -.15 + .14 * u * u
       + .055 * uSmileR * smoothstep(.25, 1., u) + .055 * uSmileL * smoothstep(.25, 1., -u)
       - .018 * uOpen * u * u
       + .012 * cos(u * 9.3) + .006 * cos(u * 21.);   // tallado a mano: ondulado, igual a los dos lados
}
float mouth(vec2 p){
  float xl = -.545 - .02 * uOpen, xr = .545 + .02 * uOpen;
  float u = (p.x - (xl + xr) * .5) / ((xr - xl) * .5);
  float uc = clamp(u, -1., 1.);
  float yu = lipU(uc);
  float th = .25 * pow(max(1. - uc * uc, 0.), .5) + .006 + uOpen * .11 * (1. - uc * uc);
  float yl = yu - th - .014 * cos(uc * 7.1) - .006 * cos(uc * 17.);
  float d = max(max(p.y - yu, yl - p.y) * .8, (abs(u) - 1.) * (xr - xl) * .5);
  /* dientes de arriba (cuelgan) y de abajo (suben con la mandíbula): se colocan
     sobre los labios una vez por dibujo en JavaScript (dientes() más abajo) */
  float t = min(min(diente(p, 8), diente(p, 11)), min(diente(p, 14), min(diente(p, 17), diente(p, 20))));
  return max(d, -(t - .008));
}
/* Lejos de un rasgo basta la distancia a su caja (mucho más barato que calcularlo entero) */
float caja(vec2 p, vec2 c, vec2 h){ vec2 q = abs(p - c) - h; return length(max(q, 0.)) + min(max(q.x, q.y), 0.); }
float face(vec2 p){
  p.y -= .06;                                          // la cara, algo por encima del ecuador
  float ce = caja(vec2(abs(p.x), p.y), vec2(.39, .13), vec2(.24, .2));
  float cm = caja(p, vec2(0., -.25), vec2(.6, .33));
  float e = ce > .04 ? ce : eyes(p);
  float m = cm > .04 ? cm : mouth(p);
  return min(e, m);
}

float gStem;   // distancia al tallo en el último punto
float gCut;    // distancia 2D a los cortes en el último punto
float gBody;   // distancia al cuerpo (sin cortes) en el último punto
float map(vec3 p){
  float b = body(p);
  gBody = b;
  /* lejos de la cáscara no hace falta calcular los cortes ni el tallo (mucho más rápido) */
  vec3 qs = p - vec3(.1, .68, -.02);
  float sb = length(qs) - .32;                         // esfera que contiene el tallo
  if (b > .07 && sb > .07) { gCut = .2; gStem = sb; return min(b, sb); }
  if (b < -TH - .07) { gCut = .2; gStem = 1.; return -(b + TH); }
  float shell = max(b, -(b + TH));                     // hueca: solo queda la cáscara
  float c = .2;
  if (p.z > .1) {
    float depth = clamp(-b / TH, 0., 1.);
    c = face(p.xy);
    gCut = c;
    c = max(c + (.017 + .009 * noise(p * 7.)) * depth, .15 - p.z);              // corte en bisel: algo más estrecho por dentro (se ve el grosor)
    shell = smax(shell, -c, .012);
  } else gCut = .2;
  float s = sb > .05 ? sb : stem(p);
  gStem = s;
  return smin(shell, s, .035);
}

/* =========================================================
   Trazado
   ========================================================= */
vec3 normalAt(vec3 p){
  const vec2 k = vec2(1, -1); const float e = .0015;
  return normalize(k.xyy * map(p + k.xyy * e) + k.yyx * map(p + k.yyx * e) + k.yxy * map(p + k.yxy * e) + k.xxx * map(p + k.xxx * e));
}

/* =========================================================
   2 y 3. MATERIALES E ILUMINACIÓN
   ========================================================= */
const vec3 LUZ_IN = vec3(0., -.2, .02);                 // brasas dentro de la calabaza
/* Ruido con su pendiente (una sola consulta en vez de cuatro) para el relieve fino */
vec4 noised(vec3 x){
  vec3 i = floor(x), f = fract(x), u = f * f * (3. - 2. * f), du = 6. * f * (1. - f);
  float a = hash(i), b = hash(i + vec3(1,0,0)), c = hash(i + vec3(0,1,0)), d = hash(i + vec3(1,1,0));
  float e = hash(i + vec3(0,0,1)), f1 = hash(i + vec3(1,0,1)), g = hash(i + vec3(0,1,1)), h = hash(i + vec3(1,1,1));
  float k1 = b - a, k2 = c - a, k3 = e - a, k4 = a - b - c + d, k5 = a - c - e + g, k6 = a - b - e + f1, k7 = -a + b + c - d + e - f1 - g + h;
  return vec4(a + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z,
    du * vec3(k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z, k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x, k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y));
}
vec3 bump(vec3 p, vec3 n, float f, float a){
  vec3 g = noised(p * f).yzw;
  return normalize(n - a * .02 * f * (g - n * dot(g, n)));
}
float ggx(vec3 n, vec3 v, vec3 l, float r){
  vec3 h = normalize(v + l); float a = r * r, nh = max(dot(n, h), 0.);
  float dd = nh * nh * (a * a - 1.) + 1.;
  return a * a / (PI * dd * dd) * .25;
}

vec3 shade(vec3 p, vec3 rd, out float inner){
  vec3 n = normalAt(p);
  map(p);                                              // deja los datos de este punto en g*
  float b = gBody, g = gGroove, t = gRibT, lat = gLat, cut = gCut, st = gStem;
  vec3 v = -rd;
  /* oclusión aproximada sin muestrear (más barata): surcos, hundimientos y base */
  float h2 = dot(p.xz, p.xz);
  float ao = 1. - .55 * pow(g, 4.) * lat - .35 * exp(-h2 * 7.) * smoothstep(.15, .5, p.y) - .3 * smoothstep(-.34, -.69, p.y);
  inner = 0.;
  vec3 col;
  vec3 KEY = normalize(vec3(-.9, .45, .32)), RIM = normalize(vec3(.8, .35, -.5)), FILL = normalize(vec3(.7, -.1, .7));

  if (st < .004 && st <= b + .01) {
    /* ---- tallo seco: fibroso, verde grisáceo y pardo, mate; la punta cortada,
       más clara y fibrosa ---- */
    vec3 q = p - vec3(.03, .52, -.04);
    float ang = atan(q.z, q.x) + 3.4 * q.y;
    float fib = noise(vec3(ang * 16., q.y * 6., 0.)) * .7 + noise(vec3(ang * 45., q.y * 14., 5.)) * .3;
    vec3 alb = mix(vec3(.075, .07, .04), vec3(.25, .22, .14), fib * fib);
    alb = mix(alb, vec3(.16, .1, .05), smoothstep(.0, .2, q.y) * .5);    // más pardo y seco hacia arriba
    float punta = smoothstep(.5, .85, n.y) * smoothstep(.12, .22, q.y);
    alb = mix(alb, vec3(.3, .25, .16) * (.7 + .5 * noise(p * 90.)), punta);
    alb *= mix(.55, 1., smoothstep(-.04, .05, q.y));                   // sombra donde nace
    vec3 nn = bump(p, n, 60., .2);
    float nk = dot(nn, KEY);
    col = alb * (max(nk, 0.) * vec3(1., .93, .85) * 1.4 + max(nk * .5 + .5, 0.) * .06) * ao;
    col += vec3(1., .95, .9) * ggx(nn, v, KEY, .6) * .03 * max(nk, 0.);
    col += vec3(.45, .55, .7) * pow(1. - max(dot(nn, v), 0.), 3.) * max(dot(nn, RIM) + .2, 0.) * .07;
    return col;
  }

  if (b > -.012) {
    /* ---- piel: naranja quemado oscuro, cada gajo de un tono algo distinto, lomos más
       vivos y surcos marrones, vetas finas de tallo a base, motas claras, zonas quemadas,
       arrugas junto a los surcos y un brillo de cera suave (no de plástico) ---- */
    float a = atan(p.x, p.z);
    vec3 T = vec3(cos(a), 0., -sin(a));                  // dirección de un gajo al siguiente
    float rib = .5 + .5 * sin(floor(t + .5) * 2.39 + 1.3);
    float crest = 1. - g;
    vec3 alb = mix(vec3(.34, .105, .018), vec3(.24, .07, .015), rib);
    alb = mix(alb, vec3(.42, .15, .028), crest * crest * crest * .45);   // lomo del gajo algo más vivo
    vec4 vt = noised(vec3(t * 31., p.y * 1.7, 3.));                      // vetas a lo largo del gajo
    float vet = vt.x * .65 + noise(vec3(t * 83., p.y * 3.5, 9.)) * .35;
    alb *= .8 + .38 * vet;
    float zona = smoothstep(.5, .85, noise(p * 2.1 + vec3(7., 3., 1.)));
    alb = mix(alb, vec3(.14, .055, .02), zona * .55);                    // zonas marrones
    alb = mix(alb, vec3(.06, .035, .02), smoothstep(.66, .86, noise(p * 5.5 + 11.)) * .5);   // manchas oscuras
    float mota = smoothstep(.8, .93, noise(p * 105.)) * (1. - zona);
    alb = mix(alb, vec3(.46, .27, .11), mota * .32);                       // motas claras de la piel
    alb = mix(alb, vec3(.12, .1, .04), exp(-dot(p.xz, p.xz) * 9.) * smoothstep(.2, .5, p.y) * .75);  // verdoso junto al tallo
    alb = mix(alb, vec3(.09, .045, .018), pow(g, 4.) * lat * .85);       // surcos más oscuros
    alb = mix(alb, vec3(.1, .055, .025), smoothstep(-.34, -.69, p.y) * .65);  // base más quemada
    alb *= .9 + .2 * noise(p * 11.);
    /* relieve: vetas, poros muy finos y arrugas en los surcos */
    vec3 nn = normalize(n - T * vt.y * .022 * lat);
    nn = bump(p, nn, 70., .022);
    float wr = g > .5 ? noise(vec3(t * 60., p.y * 26., 1.)) - .5 : 0.;
    nn = normalize(nn + T * wr * .3 * pow(g, 3.) * lat);
    float rough = .36 + .3 * zona + .15 * g;
    float nk = dot(nn, KEY), dif = max(nk, 0.);
    vec3 hk = normalize(v + KEY);
    float F = .04 + .96 * pow(1. - max(dot(v, hk), 0.), 5.);
    float spec = ggx(nn, v, KEY, rough) * F;
    col = alb * dif * vec3(1., .9, .8) * 1.2 * ao;
    col += alb * vec3(1., .32, .08) * smoothstep(-.25, .1, nk) * (1. - smoothstep(.1, .5, nk)) * .35 * ao;  // la luz entra un poco en la piel junto a la sombra (cálido, no plástico)
    col += vec3(1., .92, .82) * spec * dif * 1.6 * (1. - .6 * mota) * ao;
    col += alb * vec3(.35, .4, .5) * max(dot(nn, FILL), 0.) * .22 * ao;   // relleno frío muy suave
    col += alb * .02 * ao;
    float fr = pow(1. - max(dot(nn, v), 0.), 3.);
    col += vec3(.45, .58, .78) * fr * max(dot(nn, RIM) + .3, 0.) * .4 * mix(.4, 1., ao); // contraluz frío
    /* luz interior que asoma solo en el filo de los cortes */
    float spill = exp(-max(cut, 0.) * 160.) * smoothstep(.1, .35, p.z) * uLight;
    col += vec3(1., .42, .1) * spill * .05;
    return col;
  }

  /* ---- carne e interior: paredes de los cortes ámbar, interior rojizo y
     brasas; la luz interior ilumina dientes, bordes y paredes ---- */
  inner = 1.;
  float depth = clamp(-b / TH, 0., 1.);
  vec3 L = LUZ_IN - p; float dl = length(L); L /= dl;
  float ndl = max(dot(n, L), 0.);
  float att = 1. / (1. + 3. * dl * dl);
  float wall = smoothstep(-TH + .004, -TH + .03, b);    // pared del corte (no el fondo de dentro)
  vec3 flesh = mix(vec3(.62, .32, .08), vec3(.66, .2, .05), depth);
  vec3 cavity = mix(vec3(.42, .1, .025), vec3(.26, .05, .014), noise(p * 5.));
  vec3 alb = mix(cavity, flesh, wall);
  float fib = noise(vec3(p.x * 18., p.y * 4., p.z * 18.));
  alb *= .75 + .5 * fib;
  vec3 warm = vec3(1., .45, .1) * uLight;
  /* fondo y paredes interiores: luz de las brasas con caída por distancia; arriba,
     lejos de las brasas, queda más oscuro y rojizo */
  col = alb * warm * (ndl * .75 + .25) * att * 3.2 * mix(.45, 1., ao) * (1. - wall);
  /* paredes del corte: la luz de dentro las baña desde el borde interior (ámbar)
     y se apaga hacia fuera; las que miran a las brasas reciben más */
  col += alb * warm * pow(depth, 1.6) * (.3 + .7 * ndl) * mix(.6, 1., ao) * wall * 1.5;
  /* puntos más calientes discretos en el fondo */
  float hot = pow(noise(p * 8. + 1.7), 6.) * smoothstep(0., -.5, p.y) * (1. - wall);
  col += vec3(1., .38, .06) * hot * 1.4 * uLight;
  /* el borde de fuera del corte: carne en penumbra con algo de luz de la habitación */
  col += alb * (max(dot(n, KEY), 0.) * .1 + .015) * (1. - depth) * wall;
  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  vec3 ro = vec3(0., .3, 4.6), ta = vec3(0., .12, 0.);
  vec3 fw = normalize(ta - ro), rt = normalize(cross(fw, vec3(0, 1, 0))), up = cross(rt, fw);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.866 * fw);   // 30° de campo vertical
  /* al espacio de la calabaza (postura animada) */
  vec3 o = uRot * (ro - vec3(0., uLev, 0.)), dir = uRot * rd;
  /* esfera que la envuelve: los rayos que no la tocan salen transparentes */
  vec3 oc = o - vec3(0., .1, 0.);
  float bb = dot(oc, dir), cc = dot(oc, oc) - 1.32 * 1.32, hh = bb * bb - cc;
  if (hh < 0.) { gl_FragColor = vec4(0.); return; }
  float t = max(-bb - sqrt(hh), 0.), tmax = -bb + sqrt(hh);
  float px = 1.5 / uRes.y / 1.866;                        // tamaño de un píxel a distancia 1
  float best = 1e3, bestT = t, d = 1.;
  bool hit = false;
  for (int i = 0; i < 96; i++) {
    vec3 p = o + dir * t;
    d = map(p);
    float ratio = d / (px * t);
    if (ratio < best) { best = ratio; bestT = t; }
    if (d < .0006 * t) { hit = true; break; }
    t += d * .72;
    if (t > tmax) break;
  }
  float alpha = hit ? 1. : clamp(1. - best, 0., 1.);  // borde suavizado (sin dientes de sierra)
  if (alpha <= 0.) { gl_FragColor = vec4(0.); return; }
  if (!hit) t = bestT;
  vec3 p = o + dir * t;
  float inner;
  vec3 col = shade(p, dir, inner);
  /* brillo cálido del hueco que se ve a través de ojos y boca */
  if (inner > .5) {
    vec3 w = LUZ_IN - o; float s = dot(w, dir); float dd = length(w - dir * clamp(s, 0., t));
    col += vec3(1., .4, .08) * exp(-dd * dd * 9.) * .2 * uLight;
  }
  col = col * (2.51 * col + .03) / (col * (2.43 * col + .59) + .14);   // curva de cine (ACES)
  col = pow(clamp(col, 0., 1.), vec3(1. / 2.2));
  gl_FragColor = vec4(col * alpha, alpha);
}`;

  /* Boca: lo mismo que lipU() y mouth() del shader, para colocar los dientes sobre los labios */
  const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lipU = (u, e) => -.15 + .14 * u * u + .055 * e.smileR * sst(.25, 1, u) + .055 * e.smileL * sst(.25, 1, -u)
    - .018 * e.open * u * u + .012 * Math.cos(u * 9.3) + .006 * Math.cos(u * 21);
  const lipL = (u, e) => lipU(u, e) - (.25 * Math.pow(Math.max(1 - u * u, 0), .5) + .006 + e.open * .11 * (1 - u * u))
    - .014 * Math.cos(u * 7.1) - .006 * Math.cos(u * 17);
  /* [x, ancho izq., ancho der., desvío de la punta, largo]: colocados en espejo, igual a los dos lados */
  const ARRIBA = [[-.325, .065, .055, -.01, .105], [0, .09, .09, 0, .14], [.325, .055, .065, .01, .105]];
  const ABAJO = [[-.17, .06, .05, .012, .13], [.17, .05, .06, -.012, .13]];
  /* Rectas de los lados de un polígono convexo: [nx, ny, c] con la normal hacia fuera */
  const lineas = (pts, out) => {
    let cx = 0, cy = 0; pts.forEach(([x, y]) => { cx += x / pts.length; cy += y / pts.length; });
    pts.forEach(([ax, ay], i) => {
      const [bx, by] = pts[(i + 1) % pts.length], l = Math.hypot(bx - ax, by - ay);
      let nx = (by - ay) / l, ny = -(bx - ax) / l;
      if (nx * (cx - ax) + ny * (cy - ay) > 0) { nx = -nx; ny = -ny; }
      out.push(nx, ny, -(nx * ax + ny * ay));
    });
  };
  const caraLineas = (e) => {
    const v = [], sq = e.squint * .028;
    lineas([[-.6, .29 - sq * .5], [-.18, .075 - sq], [-.24, -.03], [-.5, .05]], v);      // ojo izquierdo
    lineas([[.58, .3 - sq * .5], [.17, .085 - sq], [.23, -.025], [.49, .055]], v);       // ojo derecho
    const xl = -.545 - .02 * e.open, xr = .545 + .02 * e.open, U = (x) => (x - (xl + xr) / 2) / ((xr - xl) / 2);
    for (const [x, a, b, k, l] of ARRIBA) { const y = lipU(U(x), e) + .03; lineas([[x - a, y], [x + b, y], [x + k, y - l]], v); }
    for (const [x, a, b, k, l] of ABAJO) { const y = lipL(U(x), e) - .04; lineas([[x - a, y], [x + b, y], [x + k, y + l]], v); }
    return new Float32Array(v);
  };

  /* Compila sin bloquear la página si el navegador lo permite (KHR_parallel_shader_compile) */
  /* Sin gráfica (WebGL dibujado por el procesador: SwiftShader, llvmpipe, «Microsoft Basic Render»...)
     cada dibujo tarda muchísimo y frena toda la página (y la nota de PageSpeed): se queda la foto,
     que flota igual. software: true solo para las herramientas y las pruebas */
  const SOFTWARE = /swiftshader|llvmpipe|softpipe|lavapipe|software|basic render/i;
  const porSoftware = (gl) => { const info = gl.getExtension('WEBGL_debug_renderer_info'); return SOFTWARE.test(String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER))); };
  /* sinGrafica(): lo mismo con un lienzo de prueba, para que el resto del fondo también se quede quieto */
  let sinG;
  const sinGrafica = () => {
    if (sinG === undefined) {
      sinG = false;
      try {
        const gl = document.createElement('canvas').getContext('webgl');
        if (gl) { sinG = porSoftware(gl); const x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); }
      } catch (e) {}
    }
    return sinG;
  };
  async function crear(canvas, fuente = FRAG, { software = false } = {}) {
    let gl;
    try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'default' }); } catch (e) {}
    if (!gl) return null;
    if (!software && porSoftware(gl)) return null;
    const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    if (!hp || hp.precision < 16) return null;              // sin precisión alta se vería mal: se queda la foto

    const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, fuente);
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    const par = gl.getExtension('KHR_parallel_shader_compile');
    if (par) while (!gl.getProgramParameter(pr, par.COMPLETION_STATUS_KHR)) {
      await new Promise(r => setTimeout(r, 50));
      if (gl.isContextLost()) return null;
    }
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      console.warn('[calabaza]', gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(pr));
      return null;
    }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(pr, 'aP'); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uOpen', 'uSmileL', 'uSmileR', 'uSquint', 'uLight', 'uBreath', 'uLev', 'uRot', 'uLin[0]'].forEach(n => { U[n] = gl.getUniformLocation(pr, n); });

    /* rotación mundo → objeto: inversa de (giro y · inclinación x · balanceo z) */
    const rot = (tx, ry, rz) => {
      const cx = Math.cos(tx), sx = Math.sin(tx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
      /* M = Ry·Rx·Rz ; la inversa es la traspuesta. GLSL lee por columnas: pasamos M por filas = Mᵀ por columnas */
      const m = [
        cy * cz + sy * sx * sz, -cy * sz + sy * sx * cz, sy * cx,
        cx * sz, cx * cz, -sx,
        -sy * cz + cy * sx * sz, sy * sz + cy * sx * cz, cy * cx
      ];
      return new Float32Array(m);
    };

    return {
      gl,
      /* devuelve true si ha cambiado el tamaño (y con él se ha borrado el lienzo) */
      medir(w, h) { if (canvas.width === w && canvas.height === h) return false; canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); return true; },
      pintar(e) {
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        gl.uniform1f(U.uOpen, e.open); gl.uniform1f(U.uSmileL, e.smileL); gl.uniform1f(U.uSmileR, e.smileR);
        gl.uniform1f(U.uSquint, e.squint); gl.uniform1f(U.uLight, e.light); gl.uniform1f(U.uBreath, e.breath);
        gl.uniform1f(U.uLev, e.lev);
        gl.uniformMatrix3fv(U.uRot, false, rot(e.tilt, e.yaw, e.sway));
        gl.uniform3fv(U['uLin[0]'], caraLineas(e));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      soltar() {
        gl.deleteBuffer(buf); gl.deleteProgram(pr); gl.deleteShader(vs); gl.deleteShader(fs);
        const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext();
      }
    };
  }
  /* Cámara (la misma que en el shader): dónde cae en el lienzo un punto de la calabaza.
     Devuelve la altura desde arriba en fracción del lienzo (lienzo cuadrado) */
  const RO = [0, .3, 4.6], TA = [0, .12, 0];
  const norm = (v) => { const l = Math.hypot(...v); return v.map(x => x / l); };
  const FW = norm(TA.map((x, i) => x - RO[i])), RT = norm([-FW[2], 0, FW[0]]);
  const UP = [RT[1] * FW[2] - RT[2] * FW[1], RT[2] * FW[0] - RT[0] * FW[2], RT[0] * FW[1] - RT[1] * FW[0]];
  const proyectar = (p) => {
    const d = p.map((x, i) => x - RO[i]), z = d[0] * FW[0] + d[1] * FW[1] + d[2] * FW[2];
    return { x: .5 + 1.866 * (d[0] * RT[0] + d[1] * RT[1] + d[2] * RT[2]) / z, y: .5 - 1.866 * (d[0] * UP[0] + d[1] * UP[1] + d[2] * UP[2]) / z };
  };
  return { crear, sinGrafica, proyectar, FRAG };   // FRAG: para el banco de pruebas (tools/halloween)
})();
