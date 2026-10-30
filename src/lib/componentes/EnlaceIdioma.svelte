<!-- Enlace del pie a la otra versión de la página ("English version" / "Versión en español") -->
<script>
  import { ui, otraVersion } from '$lib/sitio.js';
  import Linea from './Linea.svelte';
  let { lang, alt = null } = $props();
  const O = $derived(ui(lang).otro);
</script>
<a class="foot-lang" href={otraVersion(lang, alt)} hreflang={O.lang} lang={O.lang}><Linea k="lGlobe" />{O.pie}</a>
