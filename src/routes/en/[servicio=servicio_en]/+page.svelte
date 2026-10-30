<script>
  import Servicio from '$lib/paginas/Servicio.svelte';
  let { data } = $props();
</script>
<Servicio p={data.p} lang="en" />
