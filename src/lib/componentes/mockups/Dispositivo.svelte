<!-- Marco de un dispositivo (mockup) con una web dentro.
     tipo: 'portatil' | 'tablet' | 'movil';  cls: clase extra -->
<script>
  let { tipo = 'portatil', cls = '', children } = $props();
</script>
{#if tipo === 'portatil'}
<div class="dv dv-laptop {cls}"><div class="dv-lid"><div class="dv-screen">{@render children()}</div></div><div class="dv-base"></div></div>
{:else if tipo === 'tablet'}
<div class="dv dv-tablet {cls}"><div class="dv-screen">{@render children()}</div></div>
{:else}
<div class="dv dv-phone {cls}"><div class="dv-screen">{@render children()}</div></div>
{/if}
