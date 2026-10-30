<!-- Cinco estrellas plateadas (resena.html y gracias.html). Necesitan <PlataEstrellas /> una vez en la página -->
<script>
  import Linea from './Linea.svelte';
  let { cls } = $props();
</script>
<div class={cls} aria-hidden="true">{#each [1, 2, 3, 4, 5] as _}<Linea k="lStar" cls="rv-star" />{/each}</div>
