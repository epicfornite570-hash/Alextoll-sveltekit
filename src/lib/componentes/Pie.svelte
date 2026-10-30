<!--
  Pie común (las páginas de servicio se enlazan desde aquí).
    servicios: páginas de servicio del idioma (src/lib/datos/paginas-servicio*.js)
    base:      '' solo si la página es la portada (los enlaces a la portada se quedan en ella)
    tag:       frase junto al logo;  cta: [href, texto] del botón
    alt:       { es, en } las dos versiones de la página (enlace a la otra versión)
-->
<script>
  import { ui, PIE } from '$lib/sitio.js';
  import { idioma } from '$lib/idioma.js';
  import Linea from './Linea.svelte';
  import Logo from './Logo.svelte';
  import EnlaceIdioma from './EnlaceIdioma.svelte';

  let { servicios = [], base = 'index.html', tag, cta, lang = idioma(), alt = null } = $props();

  const U = $derived(ui(lang));
  const E = $derived(PIE[lang] || PIE.es);
  const ES = $derived(E.es);
  const X = $derived(U.enEs);
  const frase = $derived(tag || U.pieTag);
  const boton = $derived(cta || ['index.html#caminos', U.queNecesitas]);
  const inicio = $derived(base === '' ? '#inicio' : E.inicio);
  const contacto = $derived(base === '' ? '#contacto' : `${E.inicio}#contacto`);
</script>

<footer class="foot">
  <div class="wrap">
    <div class="foot-top">
      <Logo href={inicio} {lang} />
      <p class="foot-tag">{@html frase}</p>
      <nav class="foot-nav" aria-label={U.pieNav}>
        <a href={inicio}>{U.inicio}</a><a href={E.ordenadores}>{U.ordenadores}</a><a href={E.webs}>{U.webs}</a><a href={E.moviles}>{U.moviles}</a><a href={E.sobreMi}>{U.sobreMi}</a><a href={contacto}>{U.contacto}</a>
      </nav>
      <div class="foot-icons">
        <a href="mailto:alextoll2005@gmail.com" aria-label="Email: alextoll2005@gmail.com"><Linea k="lMail" /></a>
        <a href={contacto} aria-label={U.dondeTrabajo}><Linea k="lPin" /></a>
      </div>
      <a class="btn btn--primary btn--sm" href={boton[0]}>{boton[1]}<Linea k="lArrow" cls="ico-arrow" /></a>
    </div>
    <div class="foot-grid">
      <div>
        <h2>{U.pieOrdenadores}</h2>
        <ul>
          <li><a href={E.ordenadores}>{U.todosServicios}</a></li>
          {#each servicios as s}
          <li><a href="{s.slug}.html">{s.enlace}</a></li>
          {/each}
        </ul>
      </div>
      <div>
        <h2>Alextoll</h2>
        <ul>
          <li><a href={E.sobreMi}>{U.conoce}</a></li>
          <li><a href={E.webs}>{U.disenoWeb}</a></li>
          <li><a href={E.moviles}>{U.reparaMoviles}</a></li>
          <li><a href="{ES}diagnostico.html">{U.diagnostico}{@html X}</a></li>
          <li><a href="{ES}clientes.html">{U.areaCli}{@html X}</a></li>
          <li><a href="{ES}resena.html">{U.resena}{@html X}</a></li>
          <li><a href="{ES}aviso-legal.html">{U.avisoLegal}{@html X}</a></li>
          <li><a href="{ES}privacidad.html">{U.privacidad}{@html X}</a></li>
          <li><a href="{ES}cookies.html">{U.cookiesPol}{@html X}</a></li>
          <li><button class="linkbtn" type="button" data-open-cookies>{U.configCookies}</button></li>
        </ul>
      </div>
      <div>
        <h2>{U.contacto}</h2>
        <ul>
          <li><a href="mailto:alextoll2005@gmail.com">alextoll2005@gmail.com</a></li>
          <li><a href={contacto}>{U.zona}</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-legal">
      <span>© <span data-year>2026</span> Alextoll, Alejandro Martín Rodríguez</span>
      <span class="foot-legal-links"><EnlaceIdioma {lang} {alt} /><span>Madrid</span></span>
    </div>
  </div>
</footer>
