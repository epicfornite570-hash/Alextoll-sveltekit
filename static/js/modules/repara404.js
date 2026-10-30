/* =========================================================
   404 de Alextoll (lo carga 404.html como módulo)
   Un solo lienzo 3D detrás de la cabecera de la página:
   - a la izquierda, un «404» cromado que sigue al ratón y gira
     si lo tocas;
   - a la derecha (debajo en el móvil), una torre que se monta
     sola: fuente, placa, procesador, SSD, RAM, disipador,
     gráfica, ventiladores, cables, frontal y cristal. Al cerrar
     se enciende (luz azul y ventiladores girando).
   El ordenador es assets/3d/pc404-N.glb, generado por
   tools/pc404/build_model.py (piezas, materiales base y el clip
   de montaje). Aquí se le ponen materiales finales, luces y
   sombras, y se reproduce el clip con un AnimationMixer.
   Dónde va cada cosa lo decide el CSS: el 3D se coloca encima
   de los huecos #r4-404 y #r4-pc. Al tocar una pieza se ve su
   ficha con enlace al servicio. Sin WebGL, o si el modelo no
   carga, se queda la foto del 404 y una foto del ordenador.
   ========================================================= */
import * as THREE from '../vendor/three-0.180/three.module.min.js';
import { RoomEnvironment } from '../vendor/three-0.180/RoomEnvironment.js';
import { GLTFLoader } from '../vendor/three-0.180/GLTFLoader.js';

const MODELO = '/assets/3d/pc404-2.glb';
const $ = (id) => document.getElementById(id);
const raiz = $('r4'), hueco404 = $('r4-404'), huecoPc = $('r4-pc');
const QUIETO = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOVIL = matchMedia('(pointer: coarse)').matches;
// ?montaje=6.5 congela el montaje en ese segundo (para revisar encajes y trayectos)
const PRUEBA = new URLSearchParams(location.search).get('montaje');

const FICHAS = {
  disipador: { t: 'Disipador del procesador', d: 'Si el ordenador hace ruido o se calienta, una limpieza con pasta térmica nueva lo deja como el primer día.', url: '/limpieza-ordenador-madrid.html', a: 'Limpieza y pasta térmica' },
  ram: { t: 'Memoria RAM', d: 'Si va lento con varias cosas abiertas, ampliar la memoria es de las mejoras que más se notan.', url: '/ampliar-memoria-ram-madrid.html', a: 'Ampliar la memoria RAM' },
  grafica: { t: 'Tarjeta gráfica', d: 'Para jugar, editar vídeo o usar varias pantallas, la gráfica marca la diferencia.', url: '/cambiar-tarjeta-grafica-madrid.html', a: 'Cambiar la gráfica' },
  ssd: { t: 'Disco SSD', d: 'Cambiar el disco duro de siempre por un SSD hace que el ordenador arranque y abra todo mucho antes.', url: '/cambiar-disco-ssd-madrid.html', a: 'Cambiar disco duro por SSD' },
  fuente: { t: 'Fuente de alimentación', d: 'Si se apaga solo o no arranca, muchas veces es la fuente. Se cambia por una de calidad y con la potencia justa.', url: '/cambiar-tarjeta-grafica-madrid.html', a: 'Cambiar fuente o gráfica' },
  ventiladores: { t: 'Ventiladores', d: 'Con polvo giran más y enfrían menos. Una limpieza a fondo baja el ruido y la temperatura.', url: '/limpieza-ordenador-madrid.html', a: 'Limpieza del ordenador' }
};
// qué ficha abre cada pieza del modelo (el resto no abre nada)
const FICHA_DE = { cpu_cooler: 'disipador', cpu: 'disipador', ram_a: 'ram', ram_b: 'ram', gpu: 'grafica', ssd: 'ssd', psu: 'fuente', fan_front_a: 'ventiladores', fan_front_b: 'ventiladores', fan_rear: 'ventiladores', front_mesh: 'ventiladores' };

/* ---------- Texturas dibujadas en un canvas ---------- */
function lienzo(w, h, dibujar, { color = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  dibujar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
let semilla = 11;
const azar = () => (semilla = (semilla * 9301 + 49297) % 233280) / 233280;

/* Placa base: la cara que se ve mide 245 × 272 mm (z de -177,5 a 67,5 mm, y de 149 a 421 mm).
   aPx pasa milímetros del modelo a píxeles del dibujo (4 px por mm). */
const PLACA = { z0: -0.1775, y1: 0.421, w: 980, h: 1088 };
const aPx = (y, z) => [(z - PLACA.z0) * 4000, (PLACA.y1 - y) * 4000];
function dibujarPlaca(x, fondo, tinta, detalles) {
  x.fillStyle = fondo; x.fillRect(0, 0, PLACA.w, PLACA.h);
  semilla = 5;
  x.strokeStyle = tinta; x.lineWidth = 1.6; x.lineJoin = 'round';
  for (let i = 0; i < 170; i++) {
    let px = azar() * PLACA.w, py = azar() * PLACA.h;
    x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < 4; k++) {
      const d = 30 + azar() * 140, dir = Math.floor(azar() * 4);
      const dx = [1, 0, -1, 0][dir] * d, dy = [0, 1, 0, -1][dir] * d;
      const diag = 12 * (azar() > 0.5 ? 1 : -1);
      px += dx; py += dy; x.lineTo(px + (dy ? diag : 0), py + (dx ? diag : 0));
    }
    x.stroke();
  }
  if (!detalles) return;
  // serigrafía de los componentes, en su sitio
  x.strokeStyle = 'rgba(214,216,222,.55)'; x.lineWidth = 3;
  const marco = (y, z, h, w) => { const [a, b] = aPx(y + h / 2, z - w / 2); x.strokeRect(a, b, w * 4000, h * 4000); };
  marco(0.326, -0.083, 0.066, 0.066);                         // zócalo
  for (const z of [0.015, 0.032]) marco(0.324, z, 0.145, 0.012); // ranuras RAM
  marco(0.2115, -0.1, 0.016, 0.128);                          // PCIe
  marco(0.262, -0.05, 0.028, 0.086);                          // M.2
  x.fillStyle = 'rgba(232,232,236,.6)'; x.font = '600 15px "JetBrains Mono", ui-monospace, monospace';
  for (const [t, y, z] of [['CPU_FAN', 0.398, -0.125], ['DIMM_A1', 0.405, 0.005], ['PCIEX16_1', 0.226, -0.155], ['M2_1', 0.283, -0.09], ['ATX_PWR', 0.345, 0.045], ['CHA_FAN1', 0.2, 0.0], ['BIOS', 0.17, -0.06], ['AUDIO', 0.165, -0.165]]) {
    const [a, b] = aPx(y, z); x.fillText(t, a, b);
  }
  // pastillas doradas y anillos de los tornillos
  x.fillStyle = 'rgba(200,170,100,.4)';
  for (let i = 0; i < 300; i++) x.fillRect(azar() * PLACA.w, azar() * PLACA.h, 3, 2);
  x.strokeStyle = 'rgba(210,210,214,.8)'; x.lineWidth = 5;
  for (const y of [0.16, 0.285, 0.41]) for (const z of [-0.17, 0.055]) { const [a, b] = aPx(y, z); x.beginPath(); x.arc(a, b, 19, 0, 7); x.stroke(); }
}

/* Rugosidad con poro fino (rompe el aspecto de plástico perfecto en chapas y aluminio) */
const poro = (rayas) => lienzo(256, 256, (x, w, h) => {
  x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    const v = 120 + Math.floor(azar() * 70);
    x.fillStyle = `rgba(${v},${v},${v},.5)`;
    if (rayas) x.fillRect(azar() * w - 40, azar() * h, 30 + azar() * 120, 1);
    else x.fillRect(azar() * w, azar() * h, 1.5, 1.5);
  }
}, { color: false });


function iniciar() {
  /* ---------- Motor: un lienzo que cubre toda la cabecera ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOVIL ? 1.6 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const lienzo3d = renderer.domElement;
  lienzo3d.className = 'r4-lienzo';
  lienzo3d.setAttribute('aria-hidden', 'true');
  raiz.prepend(lienzo3d); // invisible hasta el primer dibujo (el CSS lo funde)

  /* Dos escenas en el mismo lienzo: el «404» con la cámara de toda la cabecera, y el PC con su
     propia cámara mirándolo de frente, dibujada en un recuadro sobre #r4-pc. Así el PC no se
     deforma aunque esté lejos del centro del lienzo (en el móvil queda muy abajo). */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 200);
  const DIST = 30;
  camera.position.set(0, 0, DIST);
  const scenePc = new THREE.Scene();
  const camPc = new THREE.PerspectiveCamera(30, 1, 1, 400);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = scenePc.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = scenePc.environmentIntensity = 0.6;
  pmrem.dispose();
  {
    const luz = new THREE.DirectionalLight(0xffffff, 2.4); luz.position.set(6, 12, 14);
    const rel = new THREE.DirectionalLight(0xdfe6f0, 0.6); rel.position.set(-8, 3, 6);
    scene.add(luz, rel);
  }

  // PC: luz principal blanca y amplia (la que da sombra), relleno que entra por el lateral abierto
  // y un contraluz frío que separa el contorno del fondo negro
  const sol = new THREE.DirectionalLight(0xffffff, 2.4);
  const DIR_SOL = new THREE.Vector3(6, 12, 14);
  sol.position.copy(DIR_SOL);
  sol.castShadow = true;
  sol.shadow.mapSize.set(MOVIL ? 1024 : 2048, MOVIL ? 1024 : 2048);
  sol.shadow.bias = -0.0008;
  sol.shadow.normalBias = 0.03;
  sol.shadow.radius = 4;
  const relleno = new THREE.DirectionalLight(0xdfe6f0, 1.3);
  relleno.position.set(-8, 3, 6);
  const contraluz = new THREE.DirectionalLight(0xa9c2ff, 0);
  contraluz.position.set(-9, 6, -12);
  scenePc.add(sol, sol.target, relleno, contraluz);

  /* El PC vive en "equipo" (se coloca sobre #r4-pc) y gira un poco con el dedo.
     "mundo" lleva el modelo (en metros) a la escala de la escena: 1 unidad = 10 cm. */
  const equipo = new THREE.Group();
  scenePc.add(equipo);
  const mundo = new THREE.Group();
  mundo.scale.setScalar(10);
  mundo.position.set(0.2, -2.3, 0);
  equipo.add(mundo);

  // sombra de contacto: suelo que recoge la sombra real + una mancha suave justo debajo
  const sueloPc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.ShadowMaterial({ opacity: 0.45 }));
  sueloPc.rotation.x = -Math.PI / 2; sueloPc.position.y = 0.0004;
  sueloPc.receiveShadow = true;
  const tMancha = lienzo(256, 256, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,.8)'); g.addColorStop(0.45, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, w);
  }, { color: false });
  const mancha = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.62), new THREE.MeshBasicMaterial({ map: tMancha, transparent: true, depthWrite: false, opacity: 0 }));
  mancha.rotation.x = -Math.PI / 2; mancha.position.y = 0.0002;
  mundo.add(sueloPc, mancha);
  // luz dentro de la caja (que el interior se lea aunque la página sea negra) y luz azul del encendido
  // (la distancia de una luz va en unidades de la escena, no del modelo: 1 m = 10)
  const luzInterior = new THREE.PointLight(0xf2f4ff, 0, 9, 1.2);
  luzInterior.position.set(-0.17, 0.43, 0.14);
  const luzAzul = new THREE.PointLight(0x3d7bff, 0, 7, 1.4);
  luzAzul.position.set(-0.04, 0.3, 0.02);
  mundo.add(luzInterior, luzAzul);

  /* ---------- Materiales finales (por nombre del material del GLB) ---------- */
  const tPoro = poro(false), tCepillo = poro(true);
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const AZUL = new THREE.Color(0x3d7bff);
  const MAT = {
    'Grafito satinado': () => std({ color: 0x2c2f35, metalness: 0.75, roughness: 0.4, roughnessMap: tPoro }),
    'Acero pintado': () => std({ color: 0x17191d, metalness: 0.15, roughness: 0.62, roughnessMap: tPoro }),
    'Aluminio cepillado': () => std({ color: 0xc3c7ce, metalness: 1, roughness: 0.34, roughnessMap: tCepillo }),
    'PCB oscuro': () => std({ color: 0x14181d, metalness: 0.15, roughness: 0.6 }),
    'Polimero mate': () => std({ color: 0x17191d, metalness: 0, roughness: 0.62 }),
    'Encapsulado chips': () => std({ color: 0x0e0f12, metalness: 0.2, roughness: 0.42 }),
    'Contactos': () => std({ color: 0xd9b45a, metalness: 1, roughness: 0.32 }),
    'Azul tenue': () => std({ color: 0x18233a, metalness: 0.2, roughness: 0.35, emissive: AZUL, emissiveIntensity: 0 }),
    'Vidrio lateral': () => new THREE.MeshPhysicalMaterial({ color: 0x8fa3b5, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.12, envMapIntensity: 1.3, specularIntensity: 1, depthWrite: false, side: THREE.DoubleSide }),
    'Goma': () => std({ color: 0x0b0c0e, metalness: 0, roughness: 0.92 }),
    'Cable trenzado': () => std({ color: 0x121317, metalness: 0, roughness: 0.66, roughnessMap: tCepillo }),
    'Aspas': () => std({ color: 0x1a1c21, metalness: 0.05, roughness: 0.4 }),
    // la chapa perforada se funde (no se recorta): de lejos queda como malla fina, sin chisporroteo
    'Malla frontal': (o) => (o.map && (o.map.anisotropy = 8), std({ color: 0x3b3e45, metalness: 0.7, roughness: 0.42, map: o.map, transparent: true, depthWrite: false, side: THREE.DoubleSide }))
  };
  /* Colores: cada tema cambia materiales de piezas concretas («pieza|material», con * de comodín)
     y el color de las luces del encendido ('rgb' = va cambiando de color poco a poco) */
  const BLANCO = { color: 0xe6e7ea, metalness: 0.1, roughness: 0.5 }, BLANCO_MET = { color: 0xd9dbdf, metalness: 0.35, roughness: 0.38 };
  const TEMAS = {
    original: { luz: 0x3d7bff, piezas: {} },
    // tono neutro (no apaga los colores como el ACES del «404»), luces RGB más fuertes y cristal más claro
    rgb: { luz: 'rgb', marcosLuz: 0.45, brillo: 1.5, placa: 2, tono: THREE.NeutralToneMapping, expo: 1.05, piezas: {
      'ram_*|Grafito satinado': { color: 0xe3121f, metalness: 0.25, roughness: 0.3 },
      'cpu_cooler|Aluminio cepillado': { color: 0xe68a4e, metalness: 1, roughness: 0.28 },
      'glass_side|Vidrio lateral': { color: 0xe4eaf0, opacidad: 0.07 },
      'gpu|Grafito satinado': { color: 0x9aa0a8, metalness: 0.85, roughness: 0.3 },
      'motherboard|Grafito satinado': { color: 0x8c929b, metalness: 0.85, roughness: 0.32 },
      'cable_set|Cable trenzado': { color: 0xd3162a, roughness: 0.5 }
    } },
    blanco: { luz: 0x56c6ff, piezas: {
      'case_frame|Acero pintado': BLANCO, 'case_frame|Grafito satinado': BLANCO_MET, 'case_frame|Polimero mate': BLANCO,
      'psu|Grafito satinado': BLANCO_MET, 'psu|Polimero mate': BLANCO,
      'gpu|Grafito satinado': BLANCO, 'gpu|Polimero mate': BLANCO, 'ram_*|Grafito satinado': BLANCO_MET,
      'cpu_cooler|Polimero mate': BLANCO, 'fan_*|Polimero mate': BLANCO, '*|Aspas': { color: 0xf1f2f4, metalness: 0, roughness: 0.45 },
      'ssd|Grafito satinado': BLANCO_MET, 'motherboard|Grafito satinado': BLANCO_MET,
      'cable_set|Cable trenzado': { color: 0xdedfe2 }, 'cable_set|Grafito satinado': BLANCO,
      'front_mesh|Malla frontal': { color: 0xeeeff1, escala: 5.5, metalness: 0.25, roughness: 0.45 }, 'glass_side|Grafito satinado': BLANCO
    } },
    rojo: { luz: 0xff2a36, piezas: {
      'ram_*|Grafito satinado': { color: 0xa3121c, metalness: 0.5, roughness: 0.34 },
      'gpu|Grafito satinado': { color: 0x1d1f24, metalness: 0.7, roughness: 0.36 },
      'cpu_cooler|Polimero mate': { color: 0x8f1018, metalness: 0.2, roughness: 0.45 },
      'fan_*|Polimero mate': { color: 0x8f1018, metalness: 0.2, roughness: 0.45 },
      'cable_set|Cable trenzado': { color: 0x9a1420 },
      '*|Azul tenue': { color: 0x3a1216 }
    } }
  };
  const TEMA = TEMAS[new URLSearchParams(location.search).get('color')] || TEMAS.rgb;
  if (TEMA.luz !== 'rgb') { AZUL.set(TEMA.luz); luzAzul.color.set(TEMA.luz); }
  const reglas = Object.entries(TEMA.piezas).map(([k, v]) => {
    const [pz, mt] = k.split('|');
    return { pz: new RegExp('^' + pz.replace('*', '.*') + '$'), mt, v };
  });
  const pintar = (m, pieza, material) => {
    for (const r of reglas) if (r.mt === material && r.pz.test(pieza)) {
      // escala: la textura de la malla es gris oscuro (40/255) y oscurece el color; se compensa
      if (r.v.color !== undefined) m.color.set(r.v.color).multiplyScalar(r.v.escala || 1);
      if (r.v.metalness !== undefined) m.metalness = r.v.metalness;
      if (r.v.roughness !== undefined) m.roughness = r.v.roughness;
      if (r.v.opacidad !== undefined) m.opacity = r.v.opacidad;
    }
  };
  const aspasLuz = [], marcosLuz = []; // aspas y marcos que brillan con el color de las luces (tema rgb)
  const tPlaca = lienzo(PLACA.w, PLACA.h, (x) => dibujarPlaca(x, '#101318', 'rgba(70,80,96,.45)', true));
  const tPistas = lienzo(PLACA.w, PLACA.h, (x) => dibujarPlaca(x, '#000', 'rgba(255,255,255,.8)', false));
  const placaMat = () => std({ map: tPlaca, metalness: 0.2, roughness: 0.55, emissive: AZUL, emissiveMap: tPistas, emissiveIntensity: 0 });

  /* ---------- Piezas, fichas y montaje ---------- */
  const otra = $('r4-otra'), info = $('r4-info');
  const piezas = [];          // { nombre, obj, ini, mats[], ficha }
  const rotores = [];
  const azules = [];          // materiales que se encienden en azul
  let placaEmisiva = null, mixer = null, accion = null, duracion = 10;
  let fase = 'cargando', encendido = 0, pcListo = false, giroVent = 0;
  let desmonte = 0, antesDesmonte = 'montado', cajaPuesta = false; // «Repetir montaje»: las piezas se funden antes de volver a empezar

  function prepararModelo(gltf) {
    const modelo = gltf.scene;
    mundo.add(modelo);
    modelo.traverse((o) => {
      if (o.userData.rotor) rotores.push(o);
      if (o.userData.part) {
        const ini = o.userData.assemblyStart ?? 0;
        piezas.push({ nombre: o.userData.part, obj: o, ini, mats: [], ficha: FICHA_DE[o.userData.part] || null });
      }
    });
    // cada pieza tiene sus propios materiales (para fundirla al aparecer y resaltarla al tocarla)
    for (const p of piezas) {
      const propios = new Map();
      p.obj.traverse((o) => {
        if (!o.isMesh) return;
        let dueno = o; while (dueno && !dueno.userData.part) dueno = dueno.parent;
        if (dueno !== p.obj) return; // los rotores tienen dueño: la pieza que los contiene
        const base = o.material, clave = base.name + (p.nombre === 'motherboard' && base.name === 'PCB oscuro' ? ':placa' : '');
        if (!propios.has(clave)) {
          const m = clave.endsWith(':placa') ? placaMat() : (MAT[base.name] || (() => base.clone()))(base);
          if (m.envMapIntensity !== undefined && base.name !== 'Vidrio lateral') m.envMapIntensity = 1.7;
          if (!clave.endsWith(':placa')) pintar(m, p.nombre, base.name);
          if (TEMA.aspasLuz && base.name === 'Aspas') { m.emissive = AZUL.clone(); m.emissiveIntensity = 0; aspasLuz.push(m); }
          // marcos de los ventiladores con luz (como los ARGB); las aspas se quedan oscuras para que se vea el giro
          if (TEMA.marcosLuz && base.name === 'Polimero mate' && /^(fan_|cpu_cooler)/.test(p.nombre)) { m.emissive = AZUL.clone(); m.emissiveIntensity = 0; marcosLuz.push(m); }
          m.userData.opaca = m.opacity; m.userData.transparente = m.transparent;
          propios.set(clave, m); p.mats.push(m);
          if (base.name === 'Azul tenue') azules.push(m);
          if (clave.endsWith(':placa')) placaEmisiva = m;
        }
        o.material = propios.get(clave);
        o.userData.pieza = p;
        const vidrio = base.name === 'Vidrio lateral';
        o.castShadow = !vidrio && base.name !== 'Malla frontal';
        o.receiveShadow = !vidrio;
      });
    }
    mixer = new THREE.AnimationMixer(modelo);
    const clip = gltf.animations.find((c) => c.name.startsWith('Assembly')) || gltf.animations[0];
    duracion = clip.duration;
    accion = mixer.clipAction(clip);
    accion.setLoop(THREE.LoopOnce, 1);
    accion.clampWhenFinished = true;
    accion.timeScale = 1.65; // el clip dura 10 s: así se monta en unos 6 s (en una 404 no hay que esperar tanto)
    mixer.addEventListener('finished', () => { if (fase === 'montando') encender(); });
  }

  function montar() {
    fase = 'montando'; encendido = 0;
    info.hidden = true;
    accion.reset().play();
  }
  function encender() { fase = 'montado'; encendido = performance.now(); }
  // «reducir movimiento»: se enseña ya montado y encendido, sin animación
  function montadoYa() {
    accion.reset().play(); accion.time = duracion; mixer.update(0);
    fase = 'montado'; encendido = -1e6;
  }
  const empezar = () => { if (fase !== 'espera' || !pcListo || !visible) return; if (QUIETO) montadoYa(); else montar(); };
  otra.addEventListener('click', () => {
    if (!pcListo || fase === 'desmontando') return;
    if (fase === 'espera') { montar(); return; }
    antesDesmonte = fase; fase = 'desmontando'; desmonte = performance.now();
    info.hidden = true;
  });

  /* ---------- «404» cromado ---------- */
  const rotulo = new THREE.Group();
  scene.add(rotulo);
  // reflejos de estudio para el cromo: cielo claro, suelo negro y tres focos alargados
  const estudio = new THREE.Scene();
  {
    const cielo = new THREE.SphereGeometry(20, 32, 16), col = [];
    const pos = cielo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / 20, v = h > 0.04 ? 0.08 + Math.pow(h, 0.7) * 1.2 : h > -0.04 ? 0.01 : 0.05 + (-h) * 0.25;
      col.push(v, v, v * 1.02);
    }
    cielo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    estudio.add(new THREE.Mesh(cielo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    for (const [w, h, x, y, z, f] of [[14, 2, 0, 9, 6, 4], [2.5, 12, -12, 2, 4, 2.4], [2.5, 12, 12, 1, -2, 1.6], [10, 1.2, 0, -3, 12, 1.2]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(f, f, f), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); estudio.add(m);
    }
  }
  const pmrem2 = new THREE.PMREMGenerator(renderer);
  const envCromo = pmrem2.fromScene(estudio, 0.02).texture;
  pmrem2.dispose();
  const mCromo = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.05, envMap: envCromo, envMapIntensity: 1.25 });
  const extruir = { depth: 0.34, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 5, curveSegments: 28 };
  function cuatro() {
    const s = new THREE.Shape();
    s.moveTo(0, 0.24); s.lineTo(0, 0.5); s.lineTo(0.52, 1.3); s.lineTo(0.9, 1.3); s.lineTo(0.9, 0.5);
    s.lineTo(1.04, 0.5); s.lineTo(1.04, 0.24); s.lineTo(0.9, 0.24); s.lineTo(0.9, 0); s.lineTo(0.62, 0);
    s.lineTo(0.62, 0.24); s.lineTo(0, 0.24);
    const h = new THREE.Path(); h.moveTo(0.3, 0.5); h.lineTo(0.62, 1.0); h.lineTo(0.62, 0.5); h.lineTo(0.3, 0.5);
    s.holes.push(h);
    return s;
  }
  function cero() {
    const s = new THREE.Shape(), r = 0.47;
    s.absarc(r, r, r, Math.PI, 0, false); s.lineTo(2 * r, 1.3 - r); s.absarc(r, 1.3 - r, r, 0, Math.PI, false); s.lineTo(0, r);
    const h = new THREE.Path(), ri = 0.2;
    h.absarc(r, r, ri, Math.PI, 0, false); h.lineTo(r + ri, 1.3 - r); h.absarc(r, 1.3 - r, ri, 0, Math.PI, false); h.lineTo(r - ri, r);
    s.holes.push(h);
    return s;
  }
  const digitos = [];
  [[cuatro, 0], [cero, 1.2], [cuatro, 2.24]].forEach(([forma, x], i) => {
    const geo = new THREE.ExtrudeGeometry(forma(), extruir);
    geo.computeBoundingBox();
    const b = geo.boundingBox, cx = (b.max.x + b.min.x) / 2;
    geo.translate(-cx, -0.65, -0.17);
    const m = new THREE.Mesh(geo, mCromo);
    const d = new THREE.Group(); d.add(m);
    d.position.x = x + cx - 1.64;
    d.userData = { fase: i * 1.7, giro: null };
    rotulo.add(d); digitos.push(d);
  });
  // sombra suave pintada bajo el «404» (la sombra de verdad solo cubre el PC)
  const tSombra = lienzo(256, 64, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.6, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.setTransform(1, 0, 0, h / w, 0, 0); x.fillStyle = g; x.fillRect(0, 0, w, w);
  }, { color: false });
  const sueloRotulo = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.9), new THREE.MeshBasicMaterial({ map: tSombra, transparent: true, depthWrite: false }));
  sueloRotulo.rotation.x = -Math.PI / 2; sueloRotulo.position.set(0, -0.9, 0.1);
  rotulo.add(sueloRotulo);

  /* ---------- Colocar el 3D encima de los huecos del CSS ---------- */
  // BASE_PC: lo que ocupa el PC (con sitio para las piezas que llegan por la izquierda)
  const BASE_PC = { w: 6.2, h: 6.4 }, BASE_404 = { w: 3.6, h: 1.75 };
  let ancho = 1, alto = 1;
  function anclar(el, grupo, base) {
    const R = raiz.getBoundingClientRect(), r = el.getBoundingClientRect();
    const vh = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), vw = vh * camera.aspect;
    const cx = (r.left + r.width / 2 - R.left) / R.width * 2 - 1;
    const cy = -((r.top + r.height / 2 - R.top) / R.height * 2 - 1);
    grupo.position.set(cx * vw / 2, cy * vh / 2, 0);
    grupo.scale.setScalar(Math.min(r.width / R.width * vw / base.w, r.height / R.height * vh / base.h));
    return { vw, vh };
  }
  const recuadro = { x: 0, y: 0, w: 1, h: 1, arriba: 0 }; // dónde se dibuja el PC (px CSS del lienzo)
  function medir() {
    ancho = raiz.clientWidth; alto = raiz.clientHeight;
    if (!ancho || !alto) return;
    renderer.setSize(ancho, alto, false);
    camera.aspect = ancho / alto;
    camera.updateProjectionMatrix();
    anclar(hueco404, rotulo, BASE_404);
    // el recuadro del PC es su hueco con margen (las piezas llegan desde fuera); fuera del
    // lienzo no se dibuja nada, así que puede sobresalir
    // (sin la franja de abajo, que es del botón «Repetir montaje» y la pista)
    const R = raiz.getBoundingClientRect(), hr = huecoPc.getBoundingClientRect();
    const banda = parseFloat(getComputedStyle(huecoPc).getPropertyValue('--r4-banda')) || 0;
    const r = { left: hr.left, top: hr.top, width: hr.width, height: Math.max(hr.height - banda, 1) };
    const mx = r.width * 0.35, my = r.height * 0.12;
    const x0 = r.left - R.left - mx, y0 = r.top - R.top - my, w0 = r.width + 2 * mx, h0 = r.height + 2 * my;
    const porPx = Math.max(BASE_PC.w / r.width, BASE_PC.h / r.height); // unidades de escena por píxel
    camPc.aspect = w0 / h0;
    camPc.position.set(0, 0, h0 * porPx / 2 / Math.tan(THREE.MathUtils.degToRad(camPc.fov / 2)));
    // hay navegadores que recortan un recuadro que se sale del lienzo (y lo aplastan): se dibuja
    // solo la parte que cae dentro, recortando la imagen de la cámara con setViewOffset
    const ix = Math.max(x0, 0), iy = Math.max(y0, 0);
    const iw = Math.max(Math.min(x0 + w0, ancho) - ix, 1), ih = Math.max(Math.min(y0 + h0, alto) - iy, 1);
    camPc.setViewOffset(w0, h0, ix - x0, iy - y0, iw, ih);
    Object.assign(recuadro, { x: ix, arriba: iy, w: iw, h: ih, y: alto - iy - ih });
    // la sombra solo cubre el PC: así el mapa de sombras tiene detalle de sobra y los bordes
    // no salen dentados ni «bailan» al girar
    const rs = Math.hypot(BASE_PC.w, BASE_PC.h) * 0.5;
    Object.assign(sol.shadow.camera, { left: -rs, right: rs, top: rs, bottom: -rs, near: 1, far: DIR_SOL.length() + rs * 2 });
    sol.shadow.camera.updateProjectionMatrix();
  }
  // el PC puede ir con otro tono que el «404» (el tema lo decide)
  const tonoPc = (si) => {
    renderer.toneMapping = si && TEMA.tono !== undefined ? TEMA.tono : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = si && TEMA.expo !== undefined ? TEMA.expo : 1.1;
  };
  function dibujar() {
    renderer.setViewport(0, 0, ancho, alto);
    renderer.autoClear = true;
    renderer.render(scene, camera);
    renderer.autoClear = false;
    // el PC no se dibuja hasta que está listo (antes tiene todas las piezas puestas)
    if (fase !== 'cargando') {
      renderer.clearDepth();
      renderer.setViewport(recuadro.x, recuadro.y, recuadro.w, recuadro.h);
      tonoPc(true);
      renderer.render(scenePc, camPc);
      tonoPc(false);
    }
    renderer.setViewport(0, 0, ancho, alto);
    renderer.autoClear = true;
  }

  /* ---------- Tocar: piezas (ficha) y números (giran) ---------- */
  const ray = new THREE.Raycaster(), puntero = new THREE.Vector2(-9, -9);
  const mira = { x: 0, y: 0, hay: false };
  const arrastre = { id: null, x0: 0, y0: 0, gy: 0, gx: 0, movido: false };
  const giro = { y: 0, x: 0, vy: 0 }; // giro extra del PC por el usuario (poco: es para curiosear)
  let tocables = [], resalte = null;
  function tocado(ev) {
    const r = lienzo3d.getBoundingClientRect();
    puntero.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(puntero, camera);
    let hit = ray.intersectObjects(digitos, true)[0];
    if (hit) { let o = hit.object; while (o && !digitos.includes(o)) o = o.parent; return o ? { digito: o } : null; }
    if (fase !== 'montado') return null;
    puntero.set(((ev.clientX - r.left - recuadro.x) / recuadro.w) * 2 - 1, -((ev.clientY - r.top - recuadro.arriba) / recuadro.h) * 2 + 1);
    ray.setFromCamera(puntero, camPc);
    hit = ray.intersectObjects(tocables, true)[0];
    return hit && hit.object.userData.pieza && hit.object.userData.pieza.ficha ? { pieza: hit.object.userData.pieza } : null;
  }
  function ficha(p) {
    const f = FICHAS[p.ficha];
    info.hidden = false;
    info.innerHTML = `<h2>${f.t}</h2><p>${f.d}</p><a href="${f.url}">${f.a} →</a>`;
    // la pieza se ilumina un momento (no se mueve: el cristal ya está puesto)
    resalte = { p, t0: performance.now() };
  }
  lienzo3d.addEventListener('pointerdown', (ev) => {
    Object.assign(arrastre, { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, gy: giro.y, gx: giro.x, movido: false, t: tocado(ev) });
    lienzo3d.setPointerCapture(ev.pointerId);
  });
  lienzo3d.addEventListener('pointermove', (ev) => {
    const r = lienzo3d.getBoundingClientRect();
    if (ev.pointerType === 'mouse') { mira.x = (ev.clientX - r.left) / r.width * 2 - 1; mira.y = (ev.clientY - r.top) / r.height * 2 - 1; mira.hay = true; }
    if (arrastre.id === null) {
      if (ev.pointerType === 'mouse') lienzo3d.style.cursor = tocado(ev) ? 'pointer' : 'grab';
      return;
    }
    const dx = ev.clientX - arrastre.x0, dy = ev.clientY - arrastre.y0;
    if (Math.hypot(dx, dy) > 6) arrastre.movido = true;
    if (arrastre.movido) {
      const ny = THREE.MathUtils.clamp(arrastre.gy + dx * 0.005, -0.7, 0.7);
      giro.vy = ny - giro.y; giro.y = ny;
      giro.x = THREE.MathUtils.clamp(arrastre.gx + dy * 0.002, -0.12, 0.18);
    }
  });
  lienzo3d.addEventListener('pointerleave', () => { mira.hay = false; });
  const soltar = (ev) => {
    if (ev.pointerId !== arrastre.id) return;
    if (!arrastre.movido && arrastre.t) {
      if (arrastre.t.pieza) ficha(arrastre.t.pieza);
      if (arrastre.t.digito && !arrastre.t.digito.userData.giro) arrastre.t.digito.userData.giro = performance.now();
    }
    arrastre.id = null;
  };
  lienzo3d.addEventListener('pointerup', soltar);
  lienzo3d.addEventListener('pointercancel', soltar);

  /* ---------- Bucle: solo dibuja si la cabecera se ve ---------- */
  const suave = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const rebote = (t) => { const c = 1.3; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const sat = (v) => Math.min(Math.max(v, 0), 1);
  let visible = false, ultimo = performance.now(), visto404 = 0;
  const reloj = new THREE.Clock();
  // tres cuartos desde el frontal y el lateral de cristal, algo elevado
  const BASE_GIRO = { x: 0.24, y: 0.68 };
  const NEGRO = new THREE.Color(0, 0, 0), BLANCO_SUAVE = new THREE.Color(0x3a4048);
  function cuadro(ahora) {
    const dt = Math.min((ahora - ultimo) / 1000, 0.05); ultimo = ahora;
    const t = reloj.getElapsedTime();

    // PC: vaivén muy lento + el giro del usuario, que vuelve solo con inercia
    if (arrastre.id === null || !arrastre.movido) {
      giro.y += giro.vy; giro.vy *= 0.9;
      giro.y *= 0.975; giro.x *= 0.95;
    }
    const vaiven = QUIETO ? 0 : Math.sin(t * 0.25) * 0.07;
    equipo.rotation.set(BASE_GIRO.x + giro.x, BASE_GIRO.y + vaiven + giro.y, 0);

    if (mixer && fase !== 'cargando' && fase !== 'espera') {
      if (PRUEBA !== null) { accion.time = Math.min(+PRUEBA, duracion - 1e-3); mixer.update(0); if (+PRUEBA >= duracion && fase === 'montando') { fase = 'montado'; encendido = -1e6; } }
      else if (fase === 'montando') mixer.update(dt);
      const montada = fase === 'montado' || (fase === 'desmontando' && antesDesmonte === 'montado');
      const tm = montada ? duracion : accion.time;
      // al repetir, todo lo que hay dentro se funde en 0,45 s y vuelve a empezar con la caja vacía
      const queda = fase === 'desmontando' ? 1 - suave(sat((ahora - desmonte) / 450)) : 1;
      if (fase === 'desmontando' && queda <= 0) montar();
      // cada pieza aparece al empezar su fase, fundiéndose en 0,25 s mientras ya se mueve
      for (const p of piezas) {
        // la caja (empieza en 0) aparece una vez y ya no se va: al repetir solo se funde lo de dentro
        const caja = p.ini <= 0;
        const a = caja && cajaPuesta ? 1 : fase === 'montando' && queda <= 0 ? 0 : sat((tm - p.ini) / 0.25) * (caja ? 1 : queda);
        if (caja && a >= 1) cajaPuesta = true;
        p.obj.visible = a > 0;
        for (const m of p.mats) {
          const fundiendo = a < 1;
          if (m.transparent !== (fundiendo || m.userData.transparente)) { m.transparent = fundiendo || m.userData.transparente; m.needsUpdate = true; }
          m.opacity = m.userData.opaca * a;
        }
      }
      mancha.material.opacity = sat(tm / 0.4) * 0.85;
    }

    // encendido: LED y líneas azules, pistas de la placa, luz interior y ventiladores que arrancan
    const apagando = fase === 'desmontando' && antesDesmonte === 'montado';
    const e = fase === 'montado' || apagando ? (ahora - encendido) / 1000 : -1;
    const baja = apagando ? 1 - sat((ahora - desmonte) / 450) : 1;
    const led = sat(e / 0.35) * baja, resto = sat((e - 0.35) / 0.6) * baja, vent = sat((e - 0.2) / 1.8) * baja;
    if (TEMA.luz === 'rgb') {
      AZUL.setHSL((t * 0.06) % 1, 1, 0.55);
      luzAzul.color.copy(AZUL);
      for (const m of azules) m.emissive.copy(AZUL);
      for (const m of aspasLuz) m.emissive.copy(AZUL);
      for (const m of marcosLuz) m.emissive.copy(AZUL);
      if (placaEmisiva) placaEmisiva.emissive.copy(AZUL);
    }
    for (const m of azules) m.emissiveIntensity = 2.6 * (TEMA.brillo || 1) * led;
    for (const m of aspasLuz) m.emissiveIntensity = TEMA.aspasLuz * led;
    for (const m of marcosLuz) m.emissiveIntensity = TEMA.marcosLuz * led;
    if (placaEmisiva) placaEmisiva.emissiveIntensity = 0.2 * (TEMA.placa || 1) * resto * (QUIETO ? 1 : 0.9 + Math.sin(t * 2) * 0.1);
    luzAzul.intensity = 4 * (TEMA.luzColor || 1) * resto;
    luzInterior.intensity = fase === 'cargando' ? 0 : 5 + 3 * resto;
    contraluz.intensity = fase === 'cargando' ? 0 : 1.4;
    if (!QUIETO) {
      // como mucho 0,16 rad por fotograma (las aspas se repiten cada 0,9 rad): si gira más deprisa
      // que eso, el ojo lo ve ir a saltos o hacia atrás, sobre todo en móviles a 30-40 fps
      giroVent = vent * vent * 9;
      const paso = Math.min(giroVent * dt, 0.16);
      for (const r of rotores) r.rotateZ(-paso);
    }
    otra.hidden = !pcListo;

    // pieza tocada: se ilumina y se apaga en 0,9 s
    if (resalte) {
      const k = (ahora - resalte.t0) / 900, v = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
      for (const m of resalte.p.mats) if (!azules.includes(m) && !aspasLuz.includes(m) && !marcosLuz.includes(m) && m !== placaEmisiva && m.emissive) m.emissive.copy(NEGRO).lerp(BLANCO_SUAVE, sat(v));
      if (k >= 1) resalte = null;
    }

    // «404»: flota, mira hacia el ratón y gira entero si lo tocas
    // empieza quieto (igual que la foto que se ve mientras carga) y el vaivén entra poco a poco
    const amp = visto404 ? suave(Math.min((ahora - visto404) / 1600, 1)) : 0;
    const objY = amp * (mira.hay ? mira.x * 0.45 : (QUIETO ? 0 : Math.sin(t * 0.5) * 0.18));
    const objX = amp * (mira.hay ? mira.y * 0.3 : (QUIETO ? 0 : Math.sin(t * 0.37) * 0.06));
    rotulo.rotation.y += (objY - rotulo.rotation.y) * 0.06;
    rotulo.rotation.x += (objX - rotulo.rotation.x) * 0.06;
    for (const d of digitos) {
      d.position.y = QUIETO ? 0 : amp * Math.sin(t * 1.2 + d.userData.fase) * 0.05;
      if (d.userData.giro) {
        const k = Math.min((ahora - d.userData.giro) / 1100, 1);
        d.rotation.y = rebote(k) * Math.PI * 2;
        if (k >= 1) { d.userData.giro = null; d.rotation.y = 0; }
      }
    }

    dibujar();
  }
  function arrancarBucle() { renderer.setAnimationLoop(visible && !document.hidden ? (a) => cuadro(a) : null); ultimo = performance.now(); }

  new IntersectionObserver((e) => {
    visible = e[0].isIntersecting;
    empezar();
    arrancarBucle();
  }, { threshold: 0.2 }).observe(raiz);
  document.addEventListener('visibilitychange', arrancarBucle);
  new ResizeObserver(medir).observe(raiz);
  document.fonts && document.fonts.ready.then(medir);
  medir();

  /* Primero el «404» (pocos materiales: se prepara enseguida) y se enseña; mientras, se
     descarga el ordenador. Cuando llega, se preparan sus sombreadores sin bloquear la página
     (con todas las piezas visibles, para que no den tirón al aparecer) y empieza el montaje. */
  const compilar = (e, c) => (renderer.compileAsync ? renderer.compileAsync(e, c) : Promise.resolve());
  const compilarPc = () => { tonoPc(true); const p = compilar(scenePc, camPc); tonoPc(false); return p; };
  const preparar = (fn, pc = false) => (pc ? compilarPc() : compilar(scene, camera)).catch(() => {}).then(fn);
  const modelo = new GLTFLoader().loadAsync(MODELO);
  preparar(() => {
    dibujar();
    raiz.classList.add('r4-3d'); visto404 = performance.now();
    modelo.then((gltf) => {
      prepararModelo(gltf);
      tocables = piezas.filter((p) => p.ficha).map((p) => p.obj);
      medir();
      preparar(() => {
        for (const p of piezas) p.obj.visible = false;
        fase = 'espera'; pcListo = true;
        raiz.classList.add('r4-pclisto');
        empezar();
      }, true);
    }).catch((err) => {
      console.error(err);
      raiz.classList.add('r4-pcfallo');
    });
  });
}

/* Arranque (al final: las funciones y texturas de arriba ya existen) */
function hayWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
if (raiz && hueco404 && huecoPc && !hayWebGL()) raiz.classList.add('r4-sin3d');
else if (raiz && hueco404 && huecoPc) {
  try { iniciar(); } catch (e) { console.error(e); raiz.classList.add('r4-sin3d'); }
}
