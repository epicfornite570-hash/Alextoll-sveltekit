<!--
  Página de un servicio (una por búsqueda de Google), p. ej. cambiar-disco-ssd-madrid.html.
  Los textos de cada servicio están en src/lib/datos/paginas-servicio.js (español)
  y src/lib/datos/paginas-servicio-en.js (inglés). Estilo en static/css/servicio.css
-->
<script>
  import { SITE, negocio, MENU_ORDENADORES, MENU_ORDENADORES_EN } from '$lib/sitio.js';
  import { TX } from '$lib/textos/servicio.js';
  import PAGINAS from '$lib/datos/paginas-servicio.js';
  import PAGINAS_EN from '$lib/datos/paginas-servicio-en.js';
  import Cabeza from '$lib/componentes/Cabeza.svelte';
  import Menu from '$lib/componentes/Menu.svelte';
  import Pie from '$lib/componentes/Pie.svelte';
  import Final from '$lib/componentes/Final.svelte';
  import Linea from '$lib/componentes/Linea.svelte';
  import Icono from '$lib/componentes/Icono.svelte';

  /* p: el servicio (un bloque de paginas-servicio*.js) */
  let { p, lang = 'es' } = $props();

  const X = $derived(TX[lang]);
  const lista = $derived(lang === 'en' ? PAGINAS_EN : PAGINAS);
  const porSlug = $derived(Object.fromEntries(lista.map(s => [s.slug, s])));
  const carpeta = $derived(lang === 'en' ? 'en/' : '');
  const url = $derived(`${SITE}${carpeta}${p.slug}.html`);
  /* Las dos versiones de la página (botón ES/EN y hreflang) */
  const en = $derived(lang === 'en' ? p : PAGINAS_EN.find(e => e.es === p.slug));
  const alt = $derived(en ? { es: `${en.es}.html`, en: `en/${en.slug}.html` } : null);
  const presupuesto = $derived(`${X.ordenadores}?servicio=${encodeURIComponent(p.servicio)}#contacto`);
  const relacionadas = $derived((p.relacionadas || []).filter(s => porSlug[s]));

  const jsonld = $derived([
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: p.titulo,
      description: p.desc,
      url,
      serviceType: p.enlace,
      areaServed: { '@type': 'City', name: 'Madrid' },
      provider: negocio(lang)
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: X.inicio, item: `${SITE}${carpeta}` },
        { '@type': 'ListItem', position: 2, name: X.ordenadoresTxt, item: `${SITE}${carpeta}${X.ordenadores}` },
        { '@type': 'ListItem', position: 3, name: p.enlace, item: url }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
    }
  ]);
</script>

<Cabeza title={p.seoTitulo} desc={p.desc} canonical="{carpeta}{p.slug}.html" css={['servicio.css']} {jsonld} {lang} {alt} />
<Menu menu={lang === 'en' ? MENU_ORDENADORES_EN : MENU_ORDENADORES} {lang} {alt} />

<main id="main">
<section class="svc-hero" aria-labelledby="titulo">
  <div class="wrap">
    <nav class="crumbs" aria-label={X.estasEn}>
      <a href="index.html">{X.inicio}</a><span aria-hidden="true">/</span><a href={X.ordenadores}>{X.ordenadoresTxt}</a><span aria-hidden="true">/</span><span aria-current="page">{p.enlace}</span>
    </nav>
    <h1 id="titulo">{p.titulo}</h1>
    <p class="lede">{p.lede}</p>
    <div class="cta">
      <a class="btn btn--primary" href={presupuesto}>{X.presupuesto}</a>
      <a class="btn btn--secondary" data-mail={p.enlace} data-mail-texto={p.mensaje} href="mailto:alextoll2005@gmail.com"><Linea k="lMail" />{X.email}</a>
    </div>
  </div>
</section>

<section class="section section--tint" aria-labelledby="t-senales">
  <div class="wrap svc-grid">
    <div>
      <h2 id="t-senales">{X.tePasa}</h2>
      <ul class="senales">
        {#each p.senales as s}
        <li><Icono k="bsod" /><span>{s}</span></li>
        {/each}
      </ul>
    </div>
    <div class="incluye">
      <h2>{X.incluye}</h2>
      <ul>
        {#each p.incluye as s}
        <li><Icono k="check" /><span>{s}</span></li>
        {/each}
      </ul>
      <p class="precio">{@html X.precio}</p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="t-pasos">
  <div class="wrap">
    <h2 id="t-pasos" class="svc-h2">{X.comoLoHago}</h2>
    <ol class="pasos">
      {#each p.pasos as [t, d]}
      <li><h3>{t}</h3><p>{d}</p></li>
      {/each}
    </ol>
  </div>
</section>

<section class="section section--tint" aria-labelledby="t-faq">
  <div class="wrap">
    <h2 id="t-faq" class="svc-h2">{X.faq}</h2>
    <dl class="faq">
      {#each p.faq as [q, a]}
      <dt>{q}</dt><dd>{a}</dd>
      {/each}
    </dl>
  </div>
</section>

<section class="section" aria-labelledby="t-rel">
  <div class="wrap svc-end">
    <div>
      <h2 id="t-rel" class="svc-h2">{X.interesar}</h2>
      <ul class="related">
        {#each relacionadas as s}
        <li><a href="{s}.html"><span>{porSlug[s].titulo}</span><Icono k="arrow" /></a></li>
        {/each}
        <li><a href="{X.ordenadores}#servicios"><span>{X.todos}</span><Icono k="arrow" /></a></li>
      </ul>
    </div>
    <div class="svc-cta">
      <h2>{X.loMiramos}</h2>
      <p>{X.cuentame}</p>
      <a class="btn btn--primary" href={presupuesto}>{X.presupuesto}</a>
    </div>
  </div>
</section>
</main>

<Pie servicios={lista} tag={X.tag} cta={[presupuesto, X.diagnostico]} {lang} {alt} />
<Final {lang} />
