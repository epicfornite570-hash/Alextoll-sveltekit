<!--
  Portada de Alextoll (index.html y en/index.html).
  Una entrada de marca corta: la cabecera con "¿Qué necesitas?", tres caminos (Ordenadores, Webs y
  Reparación de móviles) y "Conoce a Alextoll", la puerta al portfolio (https://alextoll.xyz/). Nada más.
  Textos en src/lib/textos/portada.js · Estilo en static/css/portada.css
-->
<script>
  import { ui, PARES, publica, negocio, menuLocal, MENU_MARCA, MENU_MARCA_EN } from '$lib/sitio.js';
  import { TX } from '$lib/textos/portada.js';
  import Cabeza from '$lib/componentes/Cabeza.svelte';
  import Menu from '$lib/componentes/Menu.svelte';
  import PieMini from '$lib/componentes/PieMini.svelte';
  import Final from '$lib/componentes/Final.svelte';
  import Conoce from '$lib/componentes/Conoce.svelte';
  import Linea from '$lib/componentes/Linea.svelte';
  import BotonPausa from '$lib/componentes/BotonPausa.svelte';
  import Dispositivo from '$lib/componentes/mockups/Dispositivo.svelte';
  import WebEjemplo from '$lib/componentes/mockups/WebEjemplo.svelte';

  let { lang = 'es' } = $props();

  const X = $derived(TX[lang]);
  const R = $derived(ui(lang).raiz);
  const alt = PARES.portada;

  /* Vídeo de fondo de la cabecera: el mar de seda plateada (tools/video/portal.html).
     Horizontal: portal-3.* (y portal-3-hd.* a 2560 × 1440 para pantallas grandes y retina)
     Vertical (móvil): portal-3-vertical.*  ·  Pósters: *-poster.webp */
  const VIDEO = 'assets/video/portal-3';
  /* Edición de Halloween: con true la cabecera lleva el fondo de Halloween (calabaza y ondas,
     static/css/halloween.css y static/js/modules/halloween.js) en vez del vídeo, y el vídeo no se descarga.
     Para volver al de siempre: false (y npm run build / subir al NAS). */
  const HALLOWEEN = true;
  /* Calabaza 3D (WebGL: static/js/modules/calabaza-gl.js y calabaza-anim.js). Debajo, la foto fija de la
     misma calabaza con el mismo encuadre: se ve al momento, mientras carga, sin WebGL o con
     "reducir movimiento". Fotos: node tools/halloween/foto-calabaza.cjs */
  const FOTO = 'assets/img/halloween/calabaza-2';

  /* Las tres tarjetas. Ordenadores y Webs, grandes; Móviles, a lo ancho debajo */
  const caminos = $derived([
    { id: 'pc', icono: 'lChip', ...X.caminos.pc },
    { id: 'web', icono: 'lMonitor', ...X.caminos.web },
    { id: 'movil', icono: 'lPhone', ...X.caminos.movil }
  ]);

  const jsonld = $derived([{
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${publica(alt[lang])}#web`,
    name: 'Alextoll',
    url: publica(alt[lang]),
    inLanguage: lang,
    description: X.webDesc,
    publisher: negocio(lang)
  }]);
  const menu = $derived(menuLocal(lang === 'en' ? MENU_MARCA_EN : MENU_MARCA, 'index.html'));
</script>

<Cabeza title={X.title} desc={X.desc} canonical={lang === 'en' ? 'en/' : ''} css={['mockups.css?v=2', 'portada.css', 'conoce.css', ...(HALLOWEEN ? ['halloween.css?v=3'] : [])]} {jsonld} {lang} {alt}>
  {#snippet extra()}
  {#if !HALLOWEEN}
  <!-- Solo se adelanta el póster que toca (mismo corte 4/5 que css/portada.css y js/modules/video.js) -->
  <link rel="preload" as="image" href="{R}{VIDEO}-poster.webp" media="not all and (max-aspect-ratio: 4/5)" fetchpriority="high">
  <link rel="preload" as="image" href="{R}{VIDEO}-vertical-poster.webp" media="(max-aspect-ratio: 4/5)" fetchpriority="high">
  {/if}
  {/snippet}
</Cabeza>

<Menu {menu} logo="#inicio" {lang} {alt} />

{#snippet media(id)}
  {#if id === 'pc'}
  <img src="{R}assets/img/portada/ordenadores-700.webp" srcset="{R}assets/img/portada/ordenadores-700.webp 700w, {R}assets/img/portada/ordenadores-1200.webp 1200w" sizes="(min-width: 900px) 580px, 100vw" alt="" width="1200" height="1070" loading="lazy" decoding="async">
  {:else if id === 'web'}
  <img class="mk-webbg" src="{R}assets/img/portada/webs-fondo.webp" alt="" width="800" height="710" loading="lazy" decoding="async">
  <Dispositivo tipo="portatil" cls="mk-laptop"><WebEjemplo marca="brasa" titulo={X.caminos.web.laptop} {lang} /></Dispositivo>
  {:else}
  <!-- Fondo de la página de móviles (tools/imagen-moviles.cjs): el móvil roto queda a la izquierda -->
  <img src="{R}assets/img/moviles/fondo-1-1280.webp" srcset="{R}assets/img/moviles/fondo-1-1280.webp 1280w, {R}assets/img/moviles/fondo-1-2560.webp 2560w" sizes="(min-width: 1240px) 1180px, 100vw" alt="" width="2560" height="1440" loading="lazy" decoding="async">
  {/if}
{/snippet}

<main id="main" class="main--flush">

<!-- 1. CABECERA
     Fondo: el vídeo assets/video/portal-3.* (horizontal, -hd en pantallas grandes) y portal-3-vertical.* (móvil).
     El <video> empieza sin fuentes: static/js/modules/video.js pone solo la versión que toca
     (WebM y, si no vale, MP4). Mientras carga, si falla o con "reducir movimiento"
     se ve el póster (primer fotograma) que pone static/css/portada.css. -->
<section class="hero mk-hero{HALLOWEEN ? ' hw-hero' : ''}" id="inicio" aria-labelledby="titulo">
  {#if HALLOWEEN}
  <!-- Fondo de Halloween (edición temporal, HALLOWEEN arriba): calabaza 3D en WebGL con foto fija mientras carga
       + ondas en canvas (static/js/modules/halloween.js) + ascuas y murciélagos (static/js/modules/halloween-ambiente.js)
       + niebla y velo (static/css/halloween.css). Sustituye al vídeo; el botón de pausa para el movimiento. -->
  <div class="mk-hero-bg hw-bg" aria-hidden="true">
    <canvas class="hw-ondas" id="hw-ondas"></canvas>
    <div class="hw-velo"></div>
    <canvas class="hw-murcielagos" id="hw-murcielagos"></canvas>
    <div class="hw-calabaza" id="hw-calabaza">
      <img class="hw-foto" src="{R}{FOTO}-1000.webp" srcset="{R}{FOTO}-600.webp 600w, {R}{FOTO}-1000.webp 1000w" sizes="(max-width: 700px) 86vw, 34vw" alt="" width="1000" height="1000" decoding="async">
      <canvas class="hw-3d"></canvas>
      <div class="hw-niebla"></div>
      <canvas class="hw-bruma"></canvas>
      <canvas class="hw-ascuas"></canvas>
    </div>
  </div>
  {:else}
  <div class="mk-hero-bg" aria-hidden="true">
    <video class="mk-video" id="hero-video" autoplay muted loop playsinline disablepictureinpicture disableremoteplayback preload="none"
      data-video="{R}{VIDEO}" data-video-hd="{R}{VIDEO}-hd" data-video-movil="{R}{VIDEO}-vertical"></video>
  </div>
  {/if}
  <div class="wrap mk-hero-in">
    <div class="mk-hero-copy">
      <p class="eyebrow mk-eyebrow">{X.eyebrow}</p>
      <h1 id="titulo"><span class="mk-brand">Alextoll</span> <span class="mk-q">{X.q}</span></h1>
      <p class="mk-lede">{X.lede}</p>
      <span class="mk-rule" aria-hidden="true"></span>
      <ul class="mk-pillars">
        <li><Linea k="lChip" /><span>{X.pilares[0]}</span></li>
        <li><Linea k="lMonitor" /><span>{X.pilares[1]}</span></li>
        <li><Linea k="lUsers" /><span>{X.pilares[2]}</span></li>
      </ul>
    </div>
  </div>
  <a class="mk-down" href="#caminos" aria-label={X.verOpciones}><Linea k="lArrow" /></a>
  <BotonPausa label={HALLOWEEN ? X.pausaHw : X.pausa} />
</section>

<!-- 2. LOS TRES CAMINOS -->
<section class="mk-caminos" id="caminos" aria-labelledby="t-caminos">
  <div class="wrap">
    <h2 class="sr-only" id="t-caminos">{X.elige}</h2>
    <div class="mk-grid">
      {#each caminos as c}
      <a class="card mk-card mk-card--{c.id}" href={c.href} data-reveal>
        <div class="mk-media{c.id === 'web' ? ' wb-stage' : ''}" aria-hidden="true">
          {@render media(c.id)}
        </div>
        <div class="mk-body">
          <div class="mk-title"><span class="mk-ico"><Linea k={c.icono} /></span><h3>{c.titulo}</h3></div>
          <p>{c.texto}</p>
          <div class="mk-acts"><span class="btn btn--secondary btn--sm mk-cta">{c.cta}<Linea k="lArrow" cls="ico-arrow" /></span><span class="mk-go"><Linea k="lArrowUR" /></span></div>
        </div>
        {#if c.palabras}
        <ul class="mk-words" aria-hidden="true">{#each c.palabras as p}<li>{p}</li>{/each}</ul>
        {/if}
      </a>
      {/each}
    </div>
  </div>
</section>

<!-- 3. CONOCE A ALEXTOLL -->
<Conoce {lang} clase="cx--portada" />
</main>

<PieMini {lang} {alt} />
<Final scripts={[...(HALLOWEEN ? ['modules/calabaza-gl.js?v=4', 'modules/calabaza-anim.js?v=3', 'modules/halloween-ambiente.js?v=2', 'modules/halloween.js?v=5'] : ['modules/video.js']), 'modules/marca.js', 'modules/conoce.js']} {lang} />
