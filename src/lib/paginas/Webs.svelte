<!--
  Página de diseño web (webs.html y en/web-design.html): diseño de páginas web para pequeños negocios.
  Textos, precios y preguntas en src/lib/textos/webs.js (los precios están en PRECIOS, una sola vez).

  Piezas:
  - Mockups (portátil, tablet y móvil) hechos con HTML y CSS: static/css/webs.css y static/css/mockups.css
  - Webs de ejemplo (negocios ficticios) dentro de los mockups: src/lib/componentes/mockups
  - Ventanas de "Ver ejemplo": <dialog> que abre static/js/modules/webs.js
  - Ondas plateadas del fondo de la cabecera: static/js/modules/ondas.js
-->
<script>
  import { ui, PARES, publica, negocio } from '$lib/sitio.js';
  import { TX, PRECIOS } from '$lib/textos/webs.js';
  import SERVICIOS from '$lib/datos/paginas-servicio.js';
  import SERVICIOS_EN from '$lib/datos/paginas-servicio-en.js';
  import Cabeza from '$lib/componentes/Cabeza.svelte';
  import Menu from '$lib/componentes/Menu.svelte';
  import Pie from '$lib/componentes/Pie.svelte';
  import Final from '$lib/componentes/Final.svelte';
  import Linea from '$lib/componentes/Linea.svelte';
  import Icono from '$lib/componentes/Icono.svelte';
  import Dispositivo from '$lib/componentes/mockups/Dispositivo.svelte';
  import WebEjemplo from '$lib/componentes/mockups/WebEjemplo.svelte';

  let { lang = 'es' } = $props();

  const X = $derived(TX[lang]);
  const F = $derived(X.form);
  const R = $derived(ui(lang).raiz);
  const alt = PARES.webs;

  /* ---------- Datos para Google ---------- */
  const url = $derived(publica(alt[lang]));
  const S = $derived(X.servicio);
  const jsonld = $derived([{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#servicio`,
        name: S.name,
        serviceType: S.type,
        description: S.desc,
        url,
        provider: negocio(lang),
        areaServed: { '@type': 'Country', name: S.area },
        offers: X.planes.map(p => ({ '@type': 'Offer', name: S.nombreOferta(p), price: String(PRECIOS[p.id]), priceCurrency: 'EUR', description: S.oferta(p) }))
      },
      {
        '@type': 'FAQPage',
        mainEntity: X.preguntas.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
      }
    ]
  }]);
  const menu = $derived({ enlaces: X.enlaces, cta: ['#idea', X.cuentame], logo: 'index.html' });
</script>

<Cabeza title={X.title} desc={X.desc} canonical={alt[lang]} css={['home.css', 'mockups.css?v=2', 'webs.css?v=2']} {jsonld} og="assets/img/og-webs.jpg" {lang} {alt} />   <!-- sube ?v= al cambiar webs.css -->
<Menu {menu} {lang} {alt} />

<main id="main" class="main--flush">

<!-- 1. CABECERA -->
<section class="hero wb-hero" id="inicio" aria-labelledby="titulo">
  <div class="wb-hero-bg" aria-hidden="true">
    <canvas class="wb-ondas" id="ondas"></canvas>
    <span class="wb-rings"><span class="wb-ring wb-ring--1"></span><span class="wb-ring wb-ring--2"></span></span>
  </div>
  <div class="wrap wb-hero-in">
    <div class="hero-copy wb-hero-copy">
      <p class="eyebrow">{X.hero.eyebrow}</p>
      <h1 id="titulo">{@html X.hero.h1}</h1>
      <p class="hero-lede">{X.hero.lede}</p>
      <div class="hero-cta">
        <a class="btn btn--primary" href="#idea">{X.cuentame}<Linea k="lArrow" cls="ico-arrow" /></a>
        <a class="btn btn--secondary" href="#incluye">{X.hero.verIncluye}</a>
      </div>
      <ul class="hero-points">
        <li><Linea k="lDiamond" />{X.hero.puntos[0]}</li>
        <li><Linea k="lUser" />{X.hero.puntos[1]}</li>
        <li><Linea k="lShield" />{X.hero.puntos[2]}</li>
      </ul>
    </div>
    <div class="wb-devices wb-stage" id="wb-devices" aria-hidden="true">
      <span class="wb-floor"></span>
      <div class="wb-tilt">
        <Dispositivo tipo="portatil" cls="wb-d-laptop"><WebEjemplo marca="brasa" titulo={X.hero.laptop} lazy={false} {lang} /></Dispositivo>
        <Dispositivo tipo="tablet" cls="wb-d-tablet"><WebEjemplo marca="nativa" titulo={X.hero.tablet} p lazy={false} {lang} /></Dispositivo>
        <Dispositivo tipo="movil" cls="wb-d-phone"><WebEjemplo marca="nord" p secciones lazy={false} {lang} /></Dispositivo>
      </div>
    </div>
  </div>
</section>

<!-- 2. EJEMPLOS
     Negocios ficticios para enseñar estilos. Cuando tengas webs reales de clientes,
     cámbialos en src/lib/textos/webs.js (ejemplos) y quita "Ejemplo de diseño". -->
<section class="section" id="ejemplos" aria-labelledby="t-ej">
  <div class="wrap">
    <div class="head-split" data-reveal>
      <div><p class="eyebrow">{X.ej.eyebrow}</p><h2 id="t-ej">{X.ej.h2}</h2></div>
      <p class="head-note">{X.ej.nota}</p>
    </div>
    <div class="wb-exs">
      {#each X.ejemplos as e}
      <article class="card wb-ex wb-ex--{e.id}" data-reveal>
        <div class="wb-ex-stage wb-stage" aria-hidden="true">
          <Dispositivo tipo="portatil" cls="wb-ex-laptop"><WebEjemplo marca={e.id} {lang} /></Dispositivo>
        </div>
        <div class="wb-ex-body">
          <h3>{e.cat}</h3>
          <p>{e.txt}</p>
          <button class="btn btn--link wb-ex-open" type="button" data-ejemplo="ej-{e.id}" aria-haspopup="dialog">{X.verEjemplo}<Linea k="lArrow" cls="ico-arrow" /><span class="sr-only">: {e.nombre}</span></button>
        </div>
      </article>
      {/each}
    </div>
  </div>
</section>

<!-- 3. QUÉ INCLUYE -->
<section class="section" id="incluye" aria-labelledby="t-inc">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <p class="eyebrow">{X.inc.eyebrow}</p>
      <h2 id="t-inc">{X.inc.h2}</h2>
    </div>
    <div class="wb-feats">
      {#each X.inc.feats as [i, h, p]}
      <article class="card wb-feat" data-reveal><Linea k={i} /><h3>{h}</h3><p>{p}</p></article>
      {/each}
    </div>
    <ul class="wb-extras" data-reveal>
      {#each X.inc.extras as [i, t]}
      <li><Linea k={i} />{t}</li>
      {/each}
    </ul>
  </div>
</section>

<!-- 4. PRECIOS ORIENTATIVOS -->
<section class="section" id="precios" aria-labelledby="t-pre">
  <div class="wrap">
    <div class="head-split" data-reveal>
      <div>
        <p class="eyebrow">{X.pre.eyebrow}</p>
        <h2 id="t-pre">{X.pre.h2}</h2>
        <p class="wb-lede">{X.pre.lede}</p>
      </div>
      <p class="wb-note"><Linea k="lInfo" />{X.pre.nota}</p>
    </div>
    <div class="wb-plans">
      {#each X.planes as p}
      <article class="card wb-plan wb-plan--{p.id}{p.destacado ? ' is-featured' : ''}" data-reveal>
        <div class="wb-plan-head">
          <div>
            <h3>{p.nombre}{#if p.destacado}{' '}<span class="wb-badge">{p.destacado}</span>{/if}</h3>
            <p>{p.lema}</p>
          </div>
          <p class="wb-price"><span>{X.desde}</span><b>{X.euros(PRECIOS[p.id])}</b></p>
        </div>
        <div class="wb-plan-body">
          <ul class="wb-checks">
            {#each p.incluye as i}
            <li><Linea k="lCheck" />{i}</li>
            {/each}
          </ul>
          <div class="wb-plan-stage wb-stage" aria-hidden="true"><Dispositivo tipo="portatil" cls="wb-plan-laptop">{#if p.id === 'pro'}<WebEjemplo marca="lumen" {lang} />{:else}<WebEjemplo marca="nord" titulo={X.planTitulo} {lang} />{/if}</Dispositivo></div>
        </div>
        <a class="btn {p.destacado ? 'btn--primary' : 'btn--secondary'} wb-plan-cta" href="#idea" data-plan={p.valor}>{X.quiero(p.nombre)}<Linea k="lArrow" cls="ico-arrow" /></a>
      </article>
      {/each}
    </div>
    <p class="wb-maint" data-reveal><Linea k="lRefresh" /><span>{@html X.pre.mant} <a href="#idea" data-plan={X.pre.mantValor}>{X.pre.mantLink}</a>.</span></p>
  </div>
</section>

<!-- 5. CÓMO TRABAJO -->
<section class="section" id="proceso" aria-labelledby="t-pro">
  <div class="wrap">
    <div class="head-split" data-reveal>
      <div><p class="eyebrow">{X.pro.eyebrow}</p><h2 id="t-pro">{X.pro.h2}</h2></div>
      <p class="wb-ai"><Linea k="lGear" /><span>{X.pro.ai}</span></p>
    </div>
    <ol class="wb-steps">
      {#each X.pro.pasos as [i, h, p], n}
      <li class="card wb-step" data-reveal><Linea k={i} /><div><h3><span>{n + 1}.</span> {h}</h3><p>{p}</p></div></li>
      {/each}
    </ol>
  </div>
</section>

<!-- 6. PREGUNTAS -->
<section class="section" id="preguntas" aria-labelledby="t-faq">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <p class="eyebrow">{X.faq.eyebrow}</p>
      <h2 id="t-faq">{X.faq.h2}</h2>
    </div>
    <div class="faq" data-reveal>
      {#each X.preguntas as [q, a]}
      <details class="qa"><summary><Linea k="lPlus" />{q}</summary><p>{a}</p></details>
      {/each}
    </div>
  </div>
</section>

<!-- 7. CONTACTO -->
<section class="section wb-contact" id="contacto" aria-labelledby="t-cont">
  <div class="wrap">
    <div class="card wb-cta" data-reveal>
      <picture class="wb-cta-img" aria-hidden="true">
        <source srcset="{R}assets/img/webs/escritorio-1200.webp 1200w, {R}assets/img/webs/escritorio-2100.webp 2108w" sizes="(min-width: 1240px) 1200px, 100vw" type="image/webp">
        <img src="{R}assets/img/webs/escritorio-1200.webp" alt="" loading="lazy" decoding="async" width="1200" height="383">
      </picture>
      <div class="wb-cta-copy">
        <p class="eyebrow">{X.cont.eyebrow}</p>
        <h2 id="t-cont">{X.cont.h2}</h2>
        <p>{X.cont.txt}</p>
        <div class="hero-cta">
          <a class="btn btn--primary" href="#idea">{X.cuentame}<Linea k="lArrow" cls="ico-arrow" /></a>
          <a class="btn btn--secondary" href="mailto:alextoll2005@gmail.com?subject={X.cont.asunto}"><Linea k="lMail" />{X.cont.email}</a>
        </div>
      </div>
    </div>

    <div class="contact wb-form-wrap" id="idea" data-reveal>
      <div class="card">
      <form class="form" id="form" name="contacto" method="POST" action={lang === 'en' ? 'thanks.html' : R + 'gracias.html'} novalidate data-borrador="alextoll_borrador_web" data-asunto={F.asuntoForm}>
        <p class="hp" aria-hidden="true"><label>{F.noRellenar}: <input name="empresa" tabindex="-1" autocomplete="off"></label></p>
        <p class="draft-note" id="f-draft" hidden>{F.borrador} <button type="button">{F.deCero}</button></p>
        <div class="row2">
          <div class="field">
            <label for="f-nombre">{F.nombre}</label>
            <input id="f-nombre" name="nombre" autocomplete="name" required aria-describedby="e-nombre">
            <span class="err" id="e-nombre"></span>
          </div>
          <div class="field">
            <label for="f-contacto">{F.contacto}</label>
            <input id="f-contacto" name="contacto" autocomplete="on" required aria-describedby="e-contacto">
            <span class="err" id="e-contacto"></span>
          </div>
        </div>
        <div class="field">
          <label for="f-servicio">{F.interesa}</label>
          <select id="f-servicio" name="servicio" data-fijo>
            <option value={F.noSe[0]}>{F.noSe[1]}</option>
            {#each X.planes as p}
            <option value={p.valor}>{p.valor}</option>
            {/each}
            <option value={X.pre.mantValor}>{X.pre.mantValor}</option>
          </select>
        </div>
        <div class="field">
          <label for="f-mensaje">{F.idea}</label>
          <span class="hint" id="h-mensaje">{F.hint}</span>
          <textarea id="f-mensaje" name="mensaje" required aria-describedby="h-mensaje e-mensaje"></textarea>
          <span class="counter" id="f-count" aria-hidden="true"></span>
          <span class="err" id="e-mensaje"></span>
        </div>
        <label class="check" for="f-priv">
          <input type="checkbox" id="f-priv" name="privacidad" value="acepto" required>
          <span>{@html F.priv}</span>
        </label>
        <span class="err" id="e-priv"></span>
        <div class="form-foot">
          <button class="btn btn--primary" type="submit" id="f-send">{F.enviar}</button>
        </div>
        <div class="status" id="f-status" role="status" hidden></div>
      </form>
      </div>

      <div class="card contact-list">
        <div class="contact-item">
          <span class="label">Email</span>
          <span class="val">alextoll2005@gmail.com</span>
          <div class="acts">
            <a href="mailto:alextoll2005@gmail.com?subject={X.cont.asunto}">{F.escribir}</a>
            <button type="button" data-copy="alextoll2005@gmail.com">{F.copiar}</button>
          </div>
        </div>
        <div class="contact-item">
          <span class="label">{F.sinCompromiso}</span>
          <p class="wb-promise">{F.promesa}</p>
        </div>
      </div>
    </div>
  </div>
</section>
</main>

<!-- Ventanas de "Ver ejemplo" (las abre static/js/modules/webs.js) -->
{#each X.ejemplos as e}
<dialog class="wb-dlg" id="ej-{e.id}" aria-labelledby="ej-{e.id}-t">
  <div class="wb-dlg-bar">
    <span class="wb-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="wb-url" aria-hidden="true"><Icono k="lock" />{e.dominio}</span>
    <h2 class="sr-only" id="ej-{e.id}-t">{X.ejemploDe}: {e.nombre} ({X.ficticio})</h2>
    <span class="wb-dlg-tag">{X.ejemploDiseno}</span>
    <!-- svelte-ignore a11y_autofocus -->
    <button class="wb-dlg-x" type="button" data-cerrar autofocus aria-label={X.cerrarEjemplo}><Linea k="lPlus" /></button>
  </div>
  <div class="wb-dlg-body"><WebEjemplo marca={e.id} live {lang} /></div>
  <div class="wb-dlg-foot">
    <p>{@html X.teGusta}</p>
    <a class="btn btn--primary btn--sm" href="#idea" data-cerrar>{X.cuentame}<Linea k="lArrow" cls="ico-arrow" /></a>
  </div>
</dialog>
{/each}

<Pie servicios={lang === 'en' ? SERVICIOS_EN : SERVICIOS} tag={X.tag} cta={['#idea', X.cuentame]} {lang} {alt} />
<Final scripts={['modules/form.js?v=2', 'modules/ondas.js', 'modules/webs.js']} {lang} />
