<!--
  Menú flotante.
    base:    se pone delante de los enlaces que empiezan por # (normalmente '')
    menu:    { enlaces, cta, logo } (MENU_MARCA, MENU_ORDENADORES... en src/lib/sitio.js)
    actual:  href de la página en la que estás (se marca en el menú)
    alt:     { es, en } las dos versiones de la página (botón ES/EN)
-->
<script>
  import { ui, otraVersion, MENU_MARCA } from '$lib/sitio.js';
  import { idioma } from '$lib/idioma.js';
  import Linea from './Linea.svelte';
  import Icono from './Icono.svelte';
  import Logo from './Logo.svelte';

  let { base = '', menu = MENU_MARCA, logo, actual = '', lang = idioma(), alt = null } = $props();

  const U = $derived(ui(lang));
  const O = $derived(U.otro);
  const url = (h) => h.startsWith('#') ? base + h : h;
  const inicio = $derived(logo ?? menu.logo);
  const ctaHref = $derived(url(menu.cta[0]));
</script>

<header class="nav" id="nav">
  <div class="nav-in">
    <Logo href={inicio} {lang} />
    <nav aria-label={U.principal}>
      <ul class="menu" id="menu">
        {#each menu.enlaces as [h, t]}
        <li><a href={url(h)} aria-current={h === actual ? 'page' : undefined}>{t}</a></li>
        {/each}
        <li class="menu-cta"><a class="btn btn--primary" href={ctaHref}>{menu.cta[1]}<Linea k="lArrow" cls="ico-arrow" /></a></li>
      </ul>
    </nav>
    <a class="nav-lang" href={otraVersion(lang, alt)} hreflang={O.lang} lang={O.lang} aria-label={O.aria} title={O.aria}><Linea k="lGlobe" /><span>{O.corto}</span></a>
    <a class="nav-acc" href="{U.raiz}clientes.html" aria-label={U.areaClientes} aria-current={actual === 'clientes.html' ? 'page' : undefined}><Linea k="lUser" /><span>{U.clientes}</span></a>
    <a class="btn btn--primary btn--sm nav-cta" href={ctaHref}>{menu.cta[1]}<Linea k="lArrow" cls="ico-arrow" /></a>
    <button class="burger" id="burger" type="button" aria-label={U.abrirMenu} aria-expanded="false" aria-controls="menu"><Icono k="list" /></button>
  </div>
</header>
