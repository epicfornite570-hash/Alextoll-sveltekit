<!--
  Panel privado de estadísticas (estadisticas.html): no aparece en Google ni está enlazado
  desde la web. Lo rellena static/js/estadisticas.js con los datos del contador
  (servidor/api.mjs). Ver docs/ESTADISTICAS.md
-->
<script>
  import Icono from '$lib/componentes/Icono.svelte';
  import { usarScripts } from '$lib/legado.js';

  usarScripts(['js/estadisticas.js']);
</script>

<svelte:head>
<title>Estadísticas | Alextoll</title>
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#000000">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="assets/img/icono-gris.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/icono-gris-192.png" sizes="192x192" type="image/png">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css?v=3">
<link rel="stylesheet" href="css/estadisticas.css?v=2">
{@html '<script src="js/theme-init.js"></script>'}
</svelte:head>

<a class="skip" href="#main">Saltar al contenido</a>
<header class="nav">
  <div class="nav-in">
    <a class="logo" href="index.html" aria-label="Alextoll, ir a la página principal"><img class="logo-mark" src="assets/img/marca-gris.svg" alt="" width="31" height="24"><span>Alextoll</span></a>
    <a class="btn btn--secondary btn--sm st-volver" href="index.html">Volver a la web<Icono k="arrow" /></a>
  </div>
</header>

<main id="main" class="stats">
  <div class="wrap">
    <h1>Estadísticas</h1>
    <p class="intro">Visitas a tu web y cuánta gente te contacta. Sin cookies y sin guardar datos personales de nadie.</p>

    <!-- Acceso -->
    <div id="login" class="login" hidden>
      <form id="login-form" class="form">
        <div class="field">
          <label for="clave">Clave del panel</label>
          <input id="clave" type="password" autocomplete="current-password" required>
          <span class="hint">La contraseña STATS_KEY que pusiste en el servidor.</span>
        </div>
        <label class="check" for="recordar"><input type="checkbox" id="recordar"><span>Recordar en este navegador</span></label>
        <button class="btn btn--primary" type="submit">Ver estadísticas</button>
        <p class="err" id="login-err" role="alert"></p>
      </form>
    </div>

    <!-- Panel -->
    <div id="panel" class="panel" hidden>
      <div class="filters-row">
        <div class="range" id="range" role="group" aria-label="Periodo">
          <button type="button" data-dias="7" aria-pressed="false">7 días</button>
          <button type="button" data-dias="30" aria-pressed="true">30 días</button>
          <button type="button" data-dias="90" aria-pressed="false">90 días</button>
        </div>
        <div class="tools">
          <label class="check" for="no-contar"><input type="checkbox" id="no-contar"><span>No contar mis visitas desde este navegador</span></label>
          <button type="button" class="linkbtn" id="salir">Salir</button>
        </div>
      </div>

      <div class="tiles">
        <div class="tile tile--hero"><span class="label">Visitas</span><span class="value" id="t-visitas">0</span><span class="sub" id="t-visitas-sub"></span></div>
        <div class="tile"><span class="label">Pulsaron WhatsApp</span><span class="value" id="t-wa">0</span></div>
        <div class="tile"><span class="label">Pulsaron llamar</span><span class="value" id="t-tel">0</span></div>
        <div class="tile"><span class="label">Formularios enviados</span><span class="value" id="t-form">0</span></div>
        <div class="tile"><span class="label">Fueron a dejar reseña</span><span class="value" id="t-resena">0</span></div>
        <div class="tile"><span class="label">Fueron al portfolio</span><span class="value" id="t-portfolio">0</span></div>
        <div class="tile"><span class="label">Tasa de contacto</span><span class="value" id="t-conv">0 %</span><span class="sub">de las visitas te contactan</span></div>
      </div>

      <section class="chart-card" aria-labelledby="t-chart">
        <h2 id="t-chart">Visitas por día</h2>
        <p class="note">Pasa el ratón por las columnas (o usa las flechas del teclado) para ver cada día.</p>
        <div class="chart" id="chart"><div class="tip" id="tip" hidden></div></div>
        <details class="table-view">
          <summary>Ver los datos en una tabla</summary>
          <table id="tabla"><thead><tr><th>Día</th><th>Visitas</th></tr></thead><tbody></tbody></table>
        </details>
      </section>

      <div class="lists">
        <section aria-labelledby="t-pag"><h2 id="t-pag">Páginas más vistas</h2><ul class="rank" id="l-paginas"></ul></section>
        <section aria-labelledby="t-ori"><h2 id="t-ori">De dónde llegan</h2><ul class="rank" id="l-origenes"></ul></section>
        <section aria-labelledby="t-dis"><h2 id="t-dis">Móvil o escritorio</h2><ul class="rank" id="l-disp"></ul></section>
      </div>
    </div>
  </div>
</main>
