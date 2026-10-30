<!-- Pie corto de la portada: contacto directo, enlaces principales y avisos legales -->
<script>
  import { ui, PIE } from '$lib/sitio.js';
  import { idioma } from '$lib/idioma.js';
  import Linea from './Linea.svelte';
  import Logo from './Logo.svelte';
  import EnlaceIdioma from './EnlaceIdioma.svelte';

  let { lang = idioma(), alt = null } = $props();

  const U = $derived(ui(lang));
  const E = $derived(PIE[lang] || PIE.es);
  const ES = $derived(E.es);
  const X = $derived(U.enEs);
</script>

<footer class="foot foot--mini" id="contacto" aria-labelledby="t-contacto">
  <div class="wrap">
    <div class="foot-talk">
      <div>
        <p class="eyebrow">{U.contacto}</p>
        <h2 id="t-contacto">{U.hablarlo}</h2>
      </div>
      <div class="foot-talk-acts">
        <a class="btn btn--primary" href="mailto:alextoll2005@gmail.com?subject={U.asunto}"><Linea k="lMail" />alextoll2005@gmail.com</a>
        <a class="btn btn--secondary" href="{E.ordenadores}#contacto">{U.formulario}<Linea k="lArrow" cls="ico-arrow" /></a>
      </div>
    </div>
    <div class="foot-top">
      <Logo href="#inicio" {lang} />
      <p class="foot-tag">{U.pieTag}</p>
      <nav class="foot-nav" aria-label={U.pieNav}>
        <a href={E.ordenadores}>{U.ordenadores}</a><a href={E.webs}>{U.webs}</a><a href={E.moviles}>{U.moviles}</a><a href="#conoce">{U.sobreMi}</a><a href="{ES}diagnostico.html">{U.diagOnline}{@html X}</a><a href="{ES}resena.html">{U.resena}{@html X}</a>
      </nav>
    </div>
    <div class="foot-legal">
      <span>© <span data-year>2026</span> Alextoll, Alejandro Martín Rodríguez · Madrid</span>
      <span class="foot-legal-links"><EnlaceIdioma {lang} {alt} /><a href="{ES}aviso-legal.html">{U.avisoLegal}{@html X}</a><a href="{ES}privacidad.html">{U.privCorta}{@html X}</a><a href="{ES}cookies.html">{U.cookiesCorta}{@html X}</a><button class="linkbtn" type="button" data-open-cookies>{U.configCookies}</button></span>
    </div>
  </div>
</footer>
