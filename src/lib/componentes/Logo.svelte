<!-- Marca: el símbolo del logo (assets/img/marca-gris.svg) y el nombre -->
<script>
  import { ui } from '$lib/sitio.js';
  import { idioma } from '$lib/idioma.js';
  let { href, lang = idioma() } = $props();
  const U = $derived(ui(lang));
</script>
<a class="logo" {href} aria-label={U.irInicio}><img class="logo-mark" src="{U.raiz}assets/img/marca-gris.svg" alt="" width="31" height="24"><span>Alextoll</span></a>
