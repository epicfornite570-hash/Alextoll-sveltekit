<!--
  Diagnóstico rápido online (diagnostico.html): tres herramientas para orientarse antes de escribir
  (por síntomas, pieza a pieza en la placa y "¿mejorar o cambiar?"). Solo en español.
  Lo que hace cada herramienta: static/js/modules/diagnostico.js, board.js y asesor.js,
  con los datos de static/js/data/sintomas.js y placa.js. Estilo en static/css/herramientas.css
-->
<script>
  import { MENU_ORDENADORES } from '$lib/sitio.js';
  import SERVICIOS from '$lib/datos/paginas-servicio.js';
  import Menu from '$lib/componentes/Menu.svelte';
  import Pie from '$lib/componentes/Pie.svelte';
  import Final from '$lib/componentes/Final.svelte';
  import Linea from '$lib/componentes/Linea.svelte';
  import PlacaBase from '$lib/componentes/PlacaBase.svelte';
</script>

<svelte:head>
<title>Diagnóstico rápido de tu ordenador | Alextoll</title>
<meta name="description" content="¿Qué le pasa a tu ordenador? Elige el síntoma, toca la pieza de la placa o responde cinco preguntas y te digo qué haría. Gratis y sin registrarte.">
<meta name="robots" content="index,follow">
<link rel="canonical" href="https://alextoll.store/diagnostico.html">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Alextoll">
<meta property="og:title" content="Diagnóstico rápido de tu ordenador | Alextoll">
<meta property="og:description" content="¿Qué le pasa a tu ordenador? Elige el síntoma, toca la pieza de la placa o responde cinco preguntas y te digo qué haría. Gratis y sin registrarte.">
<meta property="og:url" content="https://alextoll.store/diagnostico.html">
<meta property="og:image" content="https://alextoll.store/assets/img/og-ordenadores.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#000000">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="assets/img/icono-gris.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/icono-gris-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="assets/img/icono-gris-180.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css?v=3">
<link rel="stylesheet" href="css/herramientas.css">
{@html '<script src="js/theme-init.js"></script>'}
</svelte:head>

<a class="skip" href="#main">Saltar al contenido</a>
<Menu menu={MENU_ORDENADORES} />

<main id="main">
<section class="tool-hero" aria-labelledby="t-herr">
  <div class="wrap">
    <p class="eyebrow">Herramientas gratuitas</p>
    <h1 id="t-herr">Diagnóstico rápido, sin compromiso</h1>
    <p>Tres herramientas para orientarte antes de escribirme. Cuando termines, el formulario de contacto se rellena solo con lo que has elegido.</p>
    <div class="tool-nav">
      <a class="btn btn--secondary btn--sm" href="#diagnostico">Por síntomas</a>
      <a class="btn btn--secondary btn--sm" href="#placa">Pieza a pieza</a>
      <a class="btn btn--secondary btn--sm" href="#asesor">¿Mejorar o cambiar?</a>
    </div>
  </div>
</section>

<!-- 2. DIAGNÓSTICO -->
<section class="section tool-sec" id="diagnostico" aria-labelledby="t-diag">
  <div class="wrap">
    <div class="section-head">
      <h2 id="t-diag">¿Qué le pasa a tu ordenador?</h2>
      <p>Elige lo que más se parezca a tu problema y te digo por dónde suelen ir los tiros.</p>
    </div>
    <div class="diag">
      <div class="symptoms" id="symptoms" role="group" aria-label="Síntomas"></div>
      <aside class="ticket" aria-live="polite" aria-label="Orden de trabajo">
        <div class="ticket-head"><span>Orden de trabajo</span><span class="code" id="ticket-no">Nº 0000</span></div>
        <div id="ticket-body">
          <p class="note">Elige un síntoma y aquí verás la causa más habitual, qué haría yo y el servicio que encaja.</p>
        </div>
      </aside>
    </div>
  </div>
</section>

<!-- 1b. LA PLACA: dibujo técnico con las piezas numeradas -->
<section class="section tool-sec" id="placa" aria-labelledby="t-placa">
  <div class="wrap placa-in">
    <div class="placa-copy">
      <div class="section-head">
        <h2 id="t-placa">¿Dónde está el problema?</h2>
        <p>Pulsa un número del dibujo o de la lista y te cuento qué suele fallar en esa pieza y cómo lo arreglo.</p>
      </div>
      <div class="legend-box">
        <h3 id="t-legend">Piezas de la placa</h3>
        <!-- Se rellena desde js/data/placa.js -->
        <ol class="legend" id="part-legend" aria-labelledby="t-legend"></ol>
      </div>
    </div>

    <figure class="board-fig">
      <div class="board" id="board">
<PlacaBase />
      </div>
      <figcaption class="part-info" id="part-card" aria-live="polite">
        <h3>Elige una pieza</h3>
        <p>Aquí verás qué suele fallar en ella, cómo lo arreglo y podrás pedirme presupuesto.</p>
      </figcaption>
    </figure>
  </div>
</section>

<!-- 4. ASESOR -->
<section class="section tool-sec" id="asesor" aria-labelledby="t-adv">
  <div class="wrap">
    <div class="section-head">
      <h2 id="t-adv">¿Mejorarlo o comprar otro?</h2>
      <p>Antes de comprar un ordenador nuevo, mira si al tuyo le basta con cambiar una pieza.</p>
    </div>
    <div class="advisor">
      <form class="adv-form" id="advisor" aria-label="Asesor de mejoras">
        <fieldset>
          <legend>¿Qué tipo de ordenador es?</legend>
          <div class="seg">
            <label><input type="radio" name="tipo" value="portatil"><span>Portátil</span></label>
            <label><input type="radio" name="tipo" value="sobremesa"><span>Sobremesa</span></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>¿Cuántos años tiene?</legend>
          <div class="seg">
            <label><input type="radio" name="edad" value="<3"><span>Menos de 3 años</span></label>
            <label><input type="radio" name="edad" value="3-6"><span>3 a 6 años</span></label>
            <label><input type="radio" name="edad" value="6-10"><span>6 a 10 años</span></label>
            <label><input type="radio" name="edad" value=">10"><span>Más de 10 años</span></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>¿Cuánta memoria RAM tiene?</legend>
          <div class="seg">
            <label><input type="radio" name="ram" value="4"><span>4 GB o menos</span></label>
            <label><input type="radio" name="ram" value="8"><span>8 GB</span></label>
            <label><input type="radio" name="ram" value="16"><span>16 GB o más</span></label>
            <label><input type="radio" name="ram" value="?"><span>No lo sé</span></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>¿Qué disco tiene?</legend>
          <div class="seg">
            <label><input type="radio" name="disco" value="hdd"><span>Disco duro (HDD)</span></label>
            <label><input type="radio" name="disco" value="ssd"><span>SSD</span></label>
            <label><input type="radio" name="disco" value="?"><span>No lo sé</span></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>¿Para qué lo usas?</legend>
          <div class="seg">
            <label><input type="radio" name="uso" value="basico"><span>Navegar y ofimática</span></label>
            <label><input type="radio" name="uso" value="estudios"><span>Estudios y videollamadas</span></label>
            <label><input type="radio" name="uso" value="juegos"><span>Juegos</span></label>
            <label><input type="radio" name="uso" value="edicion"><span>Editar foto o vídeo</span></label>
          </div>
        </fieldset>
      </form>
      <div class="verdict" id="verdict" aria-live="polite">
        <h3>Contesta y te digo qué haría yo</h3>
        <p>Cinco preguntas rápidas sobre tu ordenador. No hace falta saber de informática.</p>
      </div>
    </div>
  </div>
</section>

<section class="section tool-sec" aria-labelledby="t-fin">
  <div class="wrap">
    <div class="head-split">
      <div><p class="eyebrow">Siguiente paso</p><h2 id="t-fin">¿Lo vemos juntos?</h2></div>
      <a class="btn btn--primary" href="ordenadores.html#contacto">Pedir diagnóstico<Linea k="lArrow" cls="ico-arrow" /></a>
    </div>
  </div>
</section>
</main>

<Pie servicios={SERVICIOS} tag="Reparación y optimización de ordenadores en Madrid" cta={['ordenadores.html#contacto', 'Pedir diagnóstico']} />
<Final comunes={['config.js', 'lib/utils.js', 'lib/icons.js', 'modules/nav.js', 'modules/reveal.js', 'modules/contacto.js', 'modules/cookies.js?v=2', 'modules/visitas.js?v=2']}
  scripts={['data/servicios.js', 'data/sintomas.js', 'data/placa.js', 'modules/servicios.js', 'modules/board.js', 'modules/diagnostico.js', 'modules/asesor.js']} />
