<!--
  Página de reparación de móviles (reparacion-moviles.html y en/phone-screen-repair.html):
  pedir presupuesto de cambio de pantalla. Textos y reglas en src/lib/textos/moviles.js

  Piezas:
  - Estilo: static/css/moviles.css
  - Formulario (fotos, validación y envío): static/js/modules/moviles.js
  - El envío va a /api/presupuesto-movil (servidor/api.mjs), que lo pasa a n8n
    (flujo 10, deploy/n8n/flujos/10-presupuesto-movil.json) y n8n te lo manda
    por correo con las fotos adjuntas. Si el NAS no responde, el formulario
    lo manda por Web3Forms (sin fotos) para que no se pierda.
  - Fondo de la cabecera: tools/imagen-moviles.js (assets/img/moviles/)
-->
<script>
  import { ui, PARES, publica, negocio, MENU_MARCA, MENU_MARCA_EN } from '$lib/sitio.js';
  import { TX, FONDO, VISIBLES, MARCAS, DIBUJOS } from '$lib/textos/moviles.js';
  import SERVICIOS from '$lib/datos/paginas-servicio.js';
  import SERVICIOS_EN from '$lib/datos/paginas-servicio-en.js';
  import Cabeza from '$lib/componentes/Cabeza.svelte';
  import Menu from '$lib/componentes/Menu.svelte';
  import Pie from '$lib/componentes/Pie.svelte';
  import Final from '$lib/componentes/Final.svelte';
  import Linea from '$lib/componentes/Linea.svelte';

  let { lang = 'es' } = $props();

  const X = $derived(TX[lang]);
  const F = $derived(X.form);
  const R = $derived(ui(lang).raiz);
  const alt = PARES.moviles;
  const problemas = VISIBLES.flatMap(r => r.problemas.map(p => ({ ...p, reparacion: r })));

  /* ---------- Datos para Google (sin precios: dependen del modelo) ---------- */
  const url = $derived(publica(alt[lang]));
  const jsonld = $derived([{
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#servicio`,
    name: X.servicio.name,
    serviceType: X.servicio.type,
    description: X.servicio.desc,
    url,
    provider: negocio(lang),
    areaServed: { '@type': 'City', name: 'Madrid' }
  }]);
  const menu = $derived({ ...(lang === 'en' ? MENU_MARCA_EN : MENU_MARCA), cta: ['#presupuesto', X.cta] });
</script>

<Cabeza title={X.title} desc={X.desc} canonical={alt[lang]} css={['home.css', 'moviles.css']} {jsonld} {lang} {alt}
  og="assets/img/moviles/og-moviles.jpg" ogAlt={X.ogAlt}>
  {#snippet extra()}
  <link rel="preload" as="image" href="{R}{FONDO}-vertical.webp" media="(max-aspect-ratio: 4/5)" fetchpriority="high">
  <link rel="preload" as="image" imagesrcset="{R}{FONDO}-1280.webp 1280w, {R}{FONDO}-2560.webp 2560w" imagesizes="100vw" media="not all and (max-aspect-ratio: 4/5)" fetchpriority="high">
  {/snippet}
</Cabeza>
<Menu {menu} actual={lang === 'en' ? 'phone-screen-repair.html' : 'reparacion-moviles.html'} {lang} {alt} />

<main id="main" class="main--flush">

<!-- 1. CABECERA
     Fondo: assets/img/moviles/fondo-1-*.webp (tools/imagen-moviles.js).
     Horizontal en pantallas anchas y vertical en el móvil (static/css/moviles.css). -->
<section class="hero mv-hero" id="inicio" aria-labelledby="titulo">
  <div class="mv-hero-bg" aria-hidden="true">
    <picture>
      <source media="(max-aspect-ratio: 4/5)" srcset="{R}{FONDO}-vertical.webp" width="1080" height="1920">
      <img src="{R}{FONDO}-1280.webp" srcset="{R}{FONDO}-1280.webp 1280w, {R}{FONDO}-2560.webp 2560w" sizes="100vw" alt="" width="2560" height="1440" fetchpriority="high" decoding="async">
    </picture>
    <span class="mv-scan"></span>
  </div>
  <div class="wrap mv-hero-in">
    <div class="mv-hero-copy">
      <p class="eyebrow mv-eyebrow"><Linea k="lPhone" />{X.hero.eyebrow}</p>
      <h1 id="titulo">{@html X.hero.h1}</h1>
      <p class="hero-lede mv-lede">{X.hero.lede}</p>
      <div class="hero-cta mv-hero-cta">
        <a class="btn btn--primary mv-btn-glow" href="#presupuesto">{X.cta}<Linea k="lArrow" cls="ico-arrow" /></a>
        <a class="btn btn--secondary" href="#como-funciona">{X.hero.como}</a>
      </div>
      <ul class="mv-points">
        {#each X.hero.puntos as [i, t]}
        <li><Linea k={i} />{t}</li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<!-- 2. PROBLEMAS
     Son motivos para cambiar la pantalla, no servicios distintos. Salen de REPARACIONES. -->
<section class="section mv-section" id="problemas" aria-labelledby="t-prob">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <p class="eyebrow">{X.prob.eyebrow}</p>
      <h2 id="t-prob">{X.prob.h2}</h2>
      <p>{X.prob.lede}</p>
    </div>
    <div class="mv-probs">
      {#each problemas as p}
      <article class="card mv-prob" data-reveal>
        <div class="mv-prob-art"><svg class="mv-d mv-d--{p.dibujo}" viewBox="0 0 160 164" aria-hidden="true">{@html DIBUJOS[p.dibujo]}</svg></div>
        <div class="mv-prob-body">
          <h3><Linea k={p.icono} />{p[lang][0]}</h3>
          <p>{p[lang][1]}</p>
          <a class="btn btn--link mv-prob-cta" href="#presupuesto" data-problema={p[lang][0]}>{X.prob.pedir}<Linea k="lArrow" cls="ico-arrow" /></a>
        </div>
      </article>
      {/each}
    </div>
  </div>
</section>

<!-- 3. CÓMO FUNCIONA -->
<section class="section mv-section" id="como-funciona" aria-labelledby="t-pasos">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <p class="eyebrow">{X.pasos.eyebrow}</p>
      <h2 id="t-pasos">{X.pasos.h2}</h2>
    </div>
    <ol class="mv-steps">
      {#each X.pasos.lista as [i, h, p], n}
      <li class="card mv-step" data-reveal><span class="mv-step-n" aria-hidden="true">{n + 1}</span><Linea k={i} /><h3><span class="sr-only">{`${n + 1}. `}</span>{h}</h3><p>{p}</p></li>
      {/each}
    </ol>
  </div>
</section>

<!-- 4. FORMULARIO DE PRESUPUESTO
     static/js/modules/moviles.js: valida, reduce las fotos y lo envía a /api/presupuesto-movil.
     El aviso verde solo sale cuando el correo se ha enviado de verdad. -->
<section class="section mv-section mv-form-sec" id="presupuesto" aria-labelledby="t-form">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <p class="eyebrow">{F.eyebrow}</p>
      <h2 id="t-form">{F.h2}</h2>
      <p>{F.lede}</p>
    </div>
    <div class="mv-form-grid">
      <div class="card mv-form-card" data-reveal>
      <form class="form" id="form-movil" method="POST" action="/api/presupuesto-movil" novalidate data-idioma={lang}>
        <p class="hp" aria-hidden="true"><label>{F.noRellenar}: <input name="empresa" tabindex="-1" autocomplete="off"></label></p>
        {#if VISIBLES.length > 1}
        <div class="field">
          <label for="m-reparacion">{F.reparacion}</label>
          <select id="m-reparacion" name="reparacion">
            {#each VISIBLES as r}
            <option value={r.id}>{r.nombre[lang]}</option>
            {/each}
          </select>
        </div>
        {:else}
        <input type="hidden" name="reparacion" value={VISIBLES[0].id}>
        {/if}
        <div class="row2">
          <div class="field">
            <label for="m-nombre">{F.nombre}</label>
            <input id="m-nombre" name="nombre" autocomplete="name" required maxlength="80" aria-describedby="e-m-nombre">
            <span class="err" id="e-m-nombre"></span>
          </div>
          <div class="field">
            <label for="m-email">{F.email}</label>
            <input id="m-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="120" aria-describedby="h-m-email e-m-email">
            <span class="hint" id="h-m-email">{F.emailHint}</span>
            <span class="err" id="e-m-email"></span>
          </div>
        </div>
        <div class="row2">
          <div class="field">
            <label for="m-marca">{F.marca}</label>
            <input id="m-marca" name="marca" list="m-marcas" required maxlength="40" placeholder={F.marcaPh} autocomplete="off" aria-describedby="e-m-marca">
            <datalist id="m-marcas">{#each MARCAS as m}<option value={m}></option>{/each}</datalist>
            <span class="err" id="e-m-marca"></span>
          </div>
          <div class="field">
            <label for="m-modelo">{F.modelo}</label>
            <input id="m-modelo" name="modelo" required maxlength="60" placeholder={F.modeloPh} autocomplete="off" aria-describedby="h-m-modelo e-m-modelo">
            <span class="err" id="e-m-modelo"></span>
          </div>
        </div>
        <p class="hint mv-hint-wide" id="h-m-modelo"><Linea k="lInfo" />{F.modeloHint}</p>
        <div class="field">
          <label for="m-problema">{F.problema}</label>
          <select id="m-problema" name="problema" required aria-describedby="e-m-problema">
            <option value="">{F.elige}</option>
            <!-- Agrupado por reparación si algún día hay más de una -->
            {#if VISIBLES.length > 1}
            {#each VISIBLES as r}
            <optgroup label={r.nombre[lang]}>
              {#each r.problemas as p}
              <option value={p[lang][0]}>{p[lang][0]}</option>
              {/each}
            </optgroup>
            {/each}
            {:else}
            {#each problemas as p}
            <option value={p[lang][0]}>{p[lang][0]}</option>
            {/each}
            {/if}
            <option value={F.varios}>{F.varios}</option>
            <option value={F.noSe}>{F.noSe}</option>
          </select>
          <span class="err" id="e-m-problema"></span>
        </div>
        <div class="field">
          <label for="m-descripcion">{F.desc} <span class="mv-opt">{F.opcional}</span></label>
          <span class="hint" id="h-m-descripcion">{F.descHint}</span>
          <textarea id="m-descripcion" name="descripcion" maxlength="1500" aria-describedby="h-m-descripcion"></textarea>
          <span class="counter" id="m-count" aria-hidden="true"></span>
        </div>
        <div class="field mv-fotos">
          <span class="mv-label" id="l-m-fotos">{F.fotos} <span class="mv-opt">{F.opcional}</span></span>
          <span class="hint" id="h-m-fotos">{F.fotosHint}</span>
          <ul class="mv-thumbs" id="m-thumbs" aria-live="polite"></ul>
          <label class="mv-drop" for="m-fotos" id="m-drop">
            <Linea k="lCamera" /><span data-una={F.fotosBtn} data-mas={F.fotosBtnMas}>{F.fotosBtn}</span>
            <input class="sr-only" id="m-fotos" type="file" accept="image/*" multiple aria-labelledby="l-m-fotos" aria-describedby="h-m-fotos e-m-fotos">
          </label>
          <span class="err" id="e-m-fotos"></span>
        </div>
        <label class="check" for="m-priv">
          <input type="checkbox" id="m-priv" name="privacidad" value="acepto" required>
          <span>{@html F.priv}</span>
        </label>
        <span class="err" id="e-m-priv"></span>
        <div class="form-foot">
          <button class="btn btn--primary mv-send" type="submit" id="m-send">{F.enviar}<Linea k="lArrow" cls="ico-arrow" /></button>
        </div>
        <div class="status" id="m-status" role="status" hidden></div>
      </form>
      <div class="mv-ok" id="m-ok" tabindex="-1" hidden>
        <span class="mv-ok-ico" aria-hidden="true"><Linea k="lCheck" /></span>
        <h3>{F.okTitulo}</h3>
        <p id="m-ok-txt"></p>
        <button class="btn btn--secondary btn--sm" type="button" id="m-otra">{F.otra}</button>
      </div>
      </div>

      <aside class="card mv-info" data-reveal aria-labelledby="t-info">
        <h3 id="t-info">{F.info}</h3>
        <ul class="mv-notes">
          {#each F.notas as [i, h, p]}
          <li><Linea k={i} /><div><b>{h}</b><p>{p}</p></div></li>
          {/each}
        </ul>
        <div class="contact-item mv-mail">
          <span class="label">{F.prefieres}</span>
          <span class="val">alextoll2005@gmail.com</span>
          <div class="acts">
            <a href="mailto:alextoll2005@gmail.com?subject={F.asunto}">{F.escribir}</a>
            <button type="button" data-copy="alextoll2005@gmail.com">{F.copiar}</button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>
</main>

<Pie servicios={lang === 'en' ? SERVICIOS_EN : SERVICIOS} tag={X.tag} cta={['#presupuesto', X.cta]} {lang} {alt} />
<!-- Sube ?v= al cambiar moviles.js (Cloudflare guarda los JS 4 h) -->
<Final scripts={['modules/moviles.js?v=2']} {lang} />
