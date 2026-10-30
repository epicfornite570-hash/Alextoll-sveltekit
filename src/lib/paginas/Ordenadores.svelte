<!--
  Página de ordenadores (ordenadores.html y en/computers.html): reparación y mejora de ordenadores.
  Textos en src/lib/textos/ordenadores.js · Estilo en static/css/home.css (y static/css/conoce.css para "Conoce a Alextoll")

  Lo que rellenan los scripts del navegador al cargar:
  - Desplegable del formulario: static/js/data/servicios.js (y servicios.en.js en inglés)
  - Indicadores de confianza: static/js/config.js (confianza)
  - Precios "desde": static/js/data/servicios.js (campo desde)
  - Trabajos y opiniones: static/js/data/opiniones.js
-->
<script>
  import { ui, PARES, negocio, menuLocal, MENU_ORDENADORES, MENU_ORDENADORES_EN } from '$lib/sitio.js';
  import { TX } from '$lib/textos/ordenadores.js';
  import { I } from '$lib/datos/iconos-linea.js';
  import SERVICIOS from '$lib/datos/paginas-servicio.js';
  import SERVICIOS_EN from '$lib/datos/paginas-servicio-en.js';
  import Cabeza from '$lib/componentes/Cabeza.svelte';
  import Menu from '$lib/componentes/Menu.svelte';
  import Pie from '$lib/componentes/Pie.svelte';
  import Final from '$lib/componentes/Final.svelte';
  import Conoce from '$lib/componentes/Conoce.svelte';
  import Linea from '$lib/componentes/Linea.svelte';
  import Trazo from '$lib/componentes/Trazo.svelte';
  import BotonPausa from '$lib/componentes/BotonPausa.svelte';

  let { lang = 'es' } = $props();

  const X = $derived(TX[lang]);
  const C = $derived(X.cont);
  const R = $derived(ui(lang).raiz);
  const alt = PARES.ordenadores;
  const en = $derived(lang === 'en');
  const servicios = $derived(en ? SERVICIOS_EN : SERVICIOS);
  const webs = $derived(en ? 'web-design.html' : 'webs.html');

  const jsonld = $derived([{
    '@context': 'https://schema.org',
    '@graph': [
      negocio(lang),
      {
        '@type': 'FAQPage',
        mainEntity: X.faq.preguntas.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
      }
    ]
  }]);
  const menu = $derived(menuLocal(en ? MENU_ORDENADORES_EN : MENU_ORDENADORES, alt[lang].replace('en/', '')));
  const scripts = $derived(['data/servicios.js', ...(en ? ['data/servicios.en.js'] : []), 'data/opiniones.js',
    'modules/video.js', 'modules/servicios.js', 'modules/portada.js', 'modules/conoce.js', 'modules/social.js', 'modules/form.js?v=2']);
</script>

<Cabeza title={X.title} desc={X.desc} canonical={alt[lang]} css={['home.css', 'conoce.css']} {jsonld} {lang} {alt}
  ogTitle={X.ogTitle} ogDesc={X.ogDesc} ogAlt={X.ogAlt} autor="Alejandro Martín Rodríguez (Alextoll)">
  {#snippet extra()}
  <link rel="preload" as="image" href="{R}assets/video/taller-poster.webp" media="(min-aspect-ratio: 4/5)">
  <link rel="preload" as="image" href="{R}assets/video/taller-vertical-poster.webp" media="(max-aspect-ratio: 4/5)">
  {/snippet}
</Cabeza>

<Menu {menu} {lang} {alt} />

<main id="main" class="main--flush">
<!-- 1. CABECERA
     Vídeo en assets/video/ (se genera con tools/video/generar-video.js).
     Lo pone static/js/modules/video.js: versión horizontal o vertical según la pantalla.
     Sin JavaScript, con "reducir movimiento" o con ahorro de datos se ve la imagen fija. -->
<section class="hero" id="inicio" aria-labelledby="titulo">
  <div class="hero-media" aria-hidden="true">
    <video class="hero-video" id="hero-video" muted loop playsinline preload="none" disablepictureinpicture data-video="{R}assets/video/taller"></video>
  </div>
  <div class="wrap hero-in">
    <div class="hero-copy">
      <p class="eyebrow">{X.hero.eyebrow}</p>
      <h1 id="titulo">{@html X.hero.h1}</h1>
      <p class="hero-lede">{X.hero.lede}</p>
      <div class="hero-cta">
        <a class="btn btn--primary" href="#contacto">{X.hero.cta}<Linea k="lArrow" cls="ico-arrow" /></a>
        <a class="btn btn--secondary" href="#conoce">{X.hero.sobreMi}</a>
      </div>
      <ul class="hero-points">
        <li><Trazo d={I.rayo} />{X.hero.puntos[0]}</li>
        <li><Trazo d={I.escudo} />{X.hero.puntos[1]}</li>
        <li><Trazo d={I.hoja} />{X.hero.puntos[2]}</li>
      </ul>
    </div>
  </div>
  <BotonPausa label={X.hero.pausa} />
</section>

<!-- 2. SERVICIOS -->
<section class="section" id="servicios" aria-labelledby="t-serv">
  <div class="wrap">
    <div class="head-split" data-reveal>
      <div><p class="eyebrow">{X.serv.eyebrow}</p><h2 id="t-serv">{X.serv.h2}</h2></div>
      <p class="head-note">{X.serv.nota}</p>
    </div>
    <div class="cards4">
      {#each X.serv.cards as [img, h, p, slug]}
      <article class="card pcard" data-reveal>
        <div class="pcard-img"><img src="{R}assets/img/escenas/{img}" alt="" loading="lazy" decoding="async" width="1200" height="760"></div>
        <div class="pcard-body">
          <h3>{h}</h3>
          <p>{p}</p>
          <a class="btn btn--ghost btn--sm" href="{slug}.html">{X.serv.mas}<Linea k="lArrow" cls="ico-arrow" /><span class="sr-only">: {h.toLowerCase()}</span></a>
        </div>
      </article>
      {/each}
    </div>
    <p class="svc-more" data-reveal>{@html X.serv.tambien}</p>
    <!-- Enlace a la página de diseño web -->
    <a class="card web-teaser" href={webs} data-reveal>
      <span class="web-teaser-txt"><span class="eyebrow">{X.serv.teaser[0]}</span><b>{X.serv.teaser[1]}</b><span>{X.serv.teaser[2]}</span></span>
      <span class="btn btn--secondary btn--sm">{X.serv.teaser[3]}<Linea k="lArrow" cls="ico-arrow" /></span>
    </a>
  </div>
</section>

<!-- 3. CONFIANZA: cómo trabajo + indicadores -->
<section class="section" id="como-trabajo" aria-labelledby="t-proc">
  <div class="wrap">
    <div class="trust">
      <div class="trust-copy" data-reveal>
        <p class="eyebrow">{X.trust.eyebrow}</p>
        <h2 id="t-proc">{X.trust.h2}</h2>
        <p>{X.trust.txt}</p>
        <a class="btn btn--primary btn--sm" href="#contacto">{X.hero.cta}<Linea k="lArrow" cls="ico-arrow" /></a>
      </div>
      <ol class="steps">
        {#each X.trust.pasos as [i, h, p]}
        <li class="card step" data-reveal><Trazo d={I[i]} /><h3>{h}</h3><p>{p}</p></li>
        {/each}
      </ol>
    </div>
    <!-- Indicadores: se rellenan desde static/js/config.js (confianza). Esto es lo que se ve sin JavaScript. -->
    <ul class="stats" id="stats" data-reveal>
      {#each X.trust.stats as [i, v, t]}
      <li><Trazo d={I[i]} /><div><strong>{v}</strong><span>{t}</span></div></li>
      {/each}
    </ul>
  </div>
</section>

<!-- 4. TRABAJOS REALES
     Se rellenan desde static/js/data/opiniones.js (AT.TRABAJOS), con foto de antes y de después.
     Mientras la lista esté vacía se ven estos huecos. -->
<section class="section" id="trabajos" aria-labelledby="t-tr">
  <div class="wrap">
    <div class="head-split" data-reveal>
      <div><p class="eyebrow">{X.trab.eyebrow}</p><h2 id="t-tr">{X.trab.h2}</h2></div>
      <div class="carousel-nav">
        <button class="circ" type="button" data-scroll="-1" aria-label={X.trab.anteriores} aria-controls="works"><Trazo d={I.izq} /></button>
        <button class="circ" type="button" data-scroll="1" aria-label={X.trab.mas} aria-controls="works"><Trazo d={I.der} /></button>
      </div>
    </div>
    <div class="works" id="works" data-reveal tabindex="0" aria-label={X.trab.aria}>
      {#each X.trab.items as [h, p]}
      <article class="card wcard">
        <div class="ba ba--empty"><div class="ba-ph"><Trazo d={I.foto} /><span>{X.trab.pronto}</span></div><span class="ba-tag ba-tag--a">{X.trab.antes}</span><span class="ba-tag ba-tag--d">{X.trab.despues}</span></div>
        <div class="wcard-body"><h3>{h}</h3><p>{p}</p></div>
      </article>
      {/each}
    </div>
    <p class="works-note" id="works-note" data-reveal>{X.trab.nota}</p>
  </div>
</section>

<!-- Opiniones (se muestran solas cuando añades opiniones reales en static/js/data/opiniones.js) -->
<section class="section" id="opiniones" aria-labelledby="t-op" hidden>
  <div class="wrap">
    <div class="head-split"><div><p class="eyebrow">{X.op.eyebrow}</p><h2 id="t-op">{X.op.h2}</h2></div></div>
    <div class="quotes" id="quotes"></div>
  </div>
</section>

<!-- 5. CONOCE A ALEXTOLL (la puerta al portfolio) -->
<Conoce {lang} />

<!-- 6. PRECIOS ORIENTATIVOS
     Las cifras salen de static/js/data/servicios.js (campo "desde"). Si está vacío se ve "A presupuesto". -->
<section class="section" id="precios" aria-labelledby="t-pre">
  <div class="wrap pricing">
    <div class="pricing-copy" data-reveal>
      <p class="eyebrow">{X.precios.eyebrow}</p>
      <h2 id="t-pre">{X.precios.h2}</h2>
      <p>{X.precios.txt}</p>
      <div class="acts">
        <a class="btn btn--primary" href="#contacto">{X.precios.cta}<Linea k="lArrow" cls="ico-arrow" /></a>
        <a class="btn btn--link" href="{R}diagnostico.html" hreflang={en ? 'es' : undefined}>{X.precios.online}<Linea k="lArrow" cls="ico-arrow" /></a>
      </div>
    </div>
    <ul class="tiles" id="tiles" data-reveal>
      {#each X.precios.tiles as [id, i, h, from]}
      <li class="card tile" data-svc={id}><Trazo d={I[i]} /><h3>{h}</h3><span class="from">{from}</span><span class="val val--txt">{X.precios.aPresupuesto}</span></li>
      {/each}
    </ul>
  </div>
</section>

<!-- 7. PREGUNTAS FRECUENTES
     Las mismas preguntas van a los datos para Google (FAQPage) del <head>. -->
<section class="section" id="preguntas" aria-labelledby="t-faq">
  <div class="wrap">
    <div class="head-split" data-reveal>
      <div><p class="eyebrow">{X.faq.eyebrow}</p><h2 id="t-faq">{X.faq.h2}</h2></div>
      <a class="btn btn--ghost btn--sm" href="#contacto">{X.faq.otra}<Linea k="lArrow" cls="ico-arrow" /></a>
    </div>
    <div class="faq" data-reveal>
      {#each X.faq.preguntas as [q, a, id]}
      <details class="qa"><summary><Trazo d={I.mas} />{q}</summary><p id={id || undefined}>{a}</p></details>
      {/each}
    </div>
  </div>
</section>

<!-- 8. CONTACTO -->
<section class="section" id="contacto" aria-labelledby="t-cont">
  <div class="wrap">
    <div class="head-split" data-reveal>
      <div><p class="eyebrow">{C.eyebrow}</p><h2 id="t-cont">{C.h2}</h2></div>
      <p class="head-note">{C.nota}</p>
    </div>
    <div class="contact" data-reveal>
      <!--
        FORMULARIO: lo envía static/js/modules/form.js (servidor propio /api/contacto; Web3Forms de plan B, clave en static/js/config.js).
        name="contacto" y data-netlify="true" son del antiguo envío por Netlify Forms: no estorban.
      -->
      <div class="card">
      <form class="form" id="form" name="contacto" method="POST" data-netlify="true" netlify-honeypot="empresa" action={en ? 'thanks.html' : R + 'gracias.html'} novalidate>
        <input type="hidden" name="form-name" value="contacto">
        <p class="hp" aria-hidden="true"><label>{C.noRellenar}: <input name="empresa" tabindex="-1" autocomplete="off"></label></p>
        <p class="draft-note" id="f-draft" hidden>{C.borrador} <button type="button">{C.deCero}</button></p>
        <div class="row2">
          <div class="field">
            <label for="f-nombre">{C.nombre}</label>
            <input id="f-nombre" name="nombre" autocomplete="name" required aria-describedby="e-nombre">
            <span class="err" id="e-nombre"></span>
          </div>
          <div class="field">
            <label for="f-contacto">{C.contacto}</label>
            <input id="f-contacto" name="contacto" autocomplete="on" required aria-describedby="e-contacto">
            <span class="err" id="e-contacto"></span>
          </div>
        </div>
        <div class="field">
          <label for="f-servicio">{C.necesitas}</label>
          <select id="f-servicio" name="servicio">
            <option value={C.noSe[0]}>{C.noSe[1]}</option>
          </select>
        </div>
        <div class="field">
          <label for="f-mensaje">{C.mensaje}</label>
          <span class="hint" id="h-mensaje">{C.hint}</span>
          <textarea id="f-mensaje" name="mensaje" required aria-describedby="h-mensaje e-mensaje"></textarea>
          <span class="counter" id="f-count" aria-hidden="true"></span>
          <span class="err" id="e-mensaje"></span>
        </div>
        <label class="check" for="f-priv">
          <input type="checkbox" id="f-priv" name="privacidad" value="acepto" required>
          <span>{@html C.priv}</span>
        </label>
        <span class="err" id="e-priv"></span>
        <div class="form-foot">
          <button class="btn btn--primary" type="submit" id="f-send">{C.enviar}</button>
        </div>
        <div class="status" id="f-status" role="status" hidden></div>
      </form>
      </div>

      <div class="card contact-list">
        <div class="contact-item">
          <span class="label">Email</span>
          <span class="val">alextoll2005@gmail.com</span>
          <div class="acts">
            <a href="mailto:alextoll2005@gmail.com?subject={C.asunto}">{C.escribir}</a>
            <button type="button" data-copy="alextoll2005@gmail.com">{C.copiar}</button>
            <a href="{R}assets/alextoll.vcf" download="Alextoll.vcf">{C.guardar}</a>
          </div>
        </div>
        <div class="contact-item">
          <span class="label">{C.quien}</span>
          <span class="val">Alejandro Martín Rodríguez</span>
          <p class="muted">Alextoll<span data-zona-wrap hidden>, <span data-zona></span></span>. <a href="#conoce">{C.conoceme}</a></p>
        </div>
      </div>
    </div>
  </div>
</section>
</main>

<Pie {servicios} tag={X.tag} cta={['#contacto', X.diagnostico]} {lang} {alt} />
<Final {scripts} {lang} />
