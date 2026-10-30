<!-- Icono relleno (Phosphor, 256 × 256). k: nombre en static/js/lib/icons.js -->
<script>
  import { trazo } from '$lib/iconos.js';
  let { k } = $props();
</script>
<svg class="ico" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">{@html trazo(k)}</svg>
