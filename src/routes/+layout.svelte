<!-- Común a todas las páginas: carga los scripts de static/js que cada página necesita -->
<script>
  import { onMount } from 'svelte';
  import { crearLegado, cargarScripts } from '$lib/legado.js';
  import { anclasConBase } from '$lib/cliente/anclas.js';

  let { children } = $props();

  const legado = crearLegado();
  onMount(() => {
    cargarScripts(legado.scripts);
    cargarScripts(legado.modulos, { modulo: true });
    return anclasConBase();
  });
</script>

{@render children()}
