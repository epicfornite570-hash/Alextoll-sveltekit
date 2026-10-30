<!--
  <head> de las páginas (título, descripción, Google, redes sociales, CSS) y el enlace
  "Saltar al contenido" al principio del <body>.
    css:    hojas de static/css que necesita la página, además de las comunes
    jsonld: datos estructurados para Google (lista de objetos)
    alt:    { es, en } rutas de las dos versiones de la página (Google: hreflang)
    extra:  (snippet) etiquetas extra del <head>, p. ej. precargas
    ogTitle, ogDesc, ogAlt, ogType, autor: opcionales para redes sociales
-->
<script>
  import { SITE, ui, publica, jsonld as ld } from '$lib/sitio.js';
  import { idioma } from '$lib/idioma.js';

  let { title, desc, canonical, css = [], jsonld = [], robots = 'index,follow', og = 'assets/img/og-ordenadores.png',
    extra, lang = idioma(), alt = null, ogTitle = title, ogDesc = desc, ogAlt = '', ogType = 'website', autor = '' } = $props();

  const U = $derived(ui(lang));
  const R = $derived(U.raiz);
  const par = $derived(alt && alt.es && alt.en);
</script>

<svelte:head>
<title>{title}</title>
<meta name="description" content={desc}>
<meta name="robots" content={robots}>
{#if autor}<meta name="author" content={autor}>{/if}
<link rel="canonical" href="{SITE}{canonical}">
{#if par}
<link rel="alternate" hreflang="es" href={publica(alt.es)}>
<link rel="alternate" hreflang="en" href={publica(alt.en)}>
<link rel="alternate" hreflang="x-default" href={publica(alt.es)}>
{/if}
<meta property="og:type" content={ogType}>
<meta property="og:locale" content={U.og}>
{#if par}<meta property="og:locale:alternate" content={ui(U.otro.lang).og}>{/if}
<meta property="og:site_name" content="Alextoll">
<meta property="og:title" content={ogTitle}>
<meta property="og:description" content={ogDesc}>
<meta property="og:url" content="{SITE}{canonical}">
<meta property="og:image" content="{SITE}{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
{#if ogAlt}<meta property="og:image:alt" content={ogAlt}>{/if}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#000000">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="{R}assets/img/icono-gris.svg" type="image/svg+xml">
<link rel="icon" href="{R}assets/img/icono-gris-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="{R}assets/img/icono-gris-180.png">
<link rel="manifest" href="{R}site.webmanifest">
<link rel="preload" href="{R}assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin="">
<link rel="stylesheet" href="{R}css/fonts.css">
<link rel="stylesheet" href="{R}css/tokens.css">
<link rel="stylesheet" href="{R}css/base.css">
<link rel="stylesheet" href="{R}css/layout.css?v=3">
{#each css as c}<link rel="stylesheet" href="{R}css/{c}">{/each}
{@render extra?.()}
{@html `<script src="${R}js/theme-init.js"></script>`}
{#each jsonld as j}{@html ld(j)}{/each}
</svelte:head>

<a class="skip" href="#main">{U.saltar}</a>
