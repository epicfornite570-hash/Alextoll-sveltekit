<!-- Icono de línea fina (24 × 24). k: nombre en AT.LINEA; cls: clase extra (p. ej. ico-arrow) -->
<script>
  import { trazo } from '$lib/iconos.js';
  let { k, cls = '' } = $props();
</script>
<svg class="ico-l{cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">{@html trazo(k)}</svg>
