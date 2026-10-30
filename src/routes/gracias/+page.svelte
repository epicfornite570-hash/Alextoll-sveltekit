<script>
  import PaginaTexto from '$lib/componentes/PaginaTexto.svelte';
  import Linea from '$lib/componentes/Linea.svelte';
  import Estrellas from '$lib/componentes/Estrellas.svelte';
  import PlataEstrellas from '$lib/componentes/PlataEstrellas.svelte';
</script>

<PaginaTexto title="Mensaje enviado | Alextoll" canonical="gracias.html" robots="noindex" css={['legal.css', 'resena.css']}>
<p class="meta">Mensaje recibido</p>
<h1>Gracias. Tu mensaje me ha llegado.</h1>
<p class="lede">Te respondo lo antes posible, normalmente por email. Si se te olvidó algo, escríbeme a <b>alextoll2005@gmail.com</b>.</p>
<div class="acts">
  <a class="btn btn--primary" href="index.html">Volver a la web</a>
  <a class="btn btn--secondary" href="mailto:alextoll2005@gmail.com?subject=Consulta%20para%20Alextoll">Escribirme un email</a>
</div>
<PlataEstrellas />
<a class="rv-mini" href="resena.html">
  <Estrellas cls="rv-mini-stars" />
  <span class="rv-mini-txt"><b>¿Ya te he arreglado algún equipo?</b><small>Tu opinión en Google ayuda a que otras personas me encuentren.</small></span>
  <span class="rv-mini-go">Dejar reseña<Linea k="lArrow" cls="ico-arrow" /></span>
</a>
</PaginaTexto>
