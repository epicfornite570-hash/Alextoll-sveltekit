<!--
  Página de texto (aviso legal, privacidad, cookies, gracias, reseña y 404):
  cabecera, menú, el texto dentro de <main class="page"> y el pie.
-->
<script>
  import { MENU_MARCA, MENU_MARCA_EN } from '$lib/sitio.js';
  import { idioma } from '$lib/idioma.js';
  import SERVICIOS from '$lib/datos/paginas-servicio.js';
  import SERVICIOS_EN from '$lib/datos/paginas-servicio-en.js';
  import Cabeza from './Cabeza.svelte';
  import Menu from './Menu.svelte';
  import Pie from './Pie.svelte';
  import Final from './Final.svelte';

  let { title, desc = 'Alextoll, reparación y mejora de ordenadores en Madrid.', canonical, css = ['legal.css'], robots,
    scripts = [], lang = idioma(), extra, children } = $props();
</script>

<Cabeza {title} {desc} {canonical} {css} {robots} {lang} {extra} />
<Menu menu={lang === 'en' ? MENU_MARCA_EN : MENU_MARCA} {lang} />

<main class="page" id="main">
<div class="wrap">
{@render children()}
</div>
</main>

<Pie servicios={lang === 'en' ? SERVICIOS_EN : SERVICIOS} {lang} />
<Final {scripts} {lang} />
