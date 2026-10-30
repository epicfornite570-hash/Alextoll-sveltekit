<!--
  Confirmación en inglés: a ella apuntan los formularios de las páginas en inglés
  (el atributo action, que solo se usa si el navegador no ejecuta JavaScript).
  Como gracias.html: noindex, sin datos del mensaje en la dirección y sin prometer plazos.
-->
<script>
  import PaginaTexto from '$lib/componentes/PaginaTexto.svelte';
</script>

<PaginaTexto title="Message sent | Alextoll" desc="Alextoll, computer repair and upgrades in Madrid." canonical="en/thanks.html" robots="noindex" css={['legal.css', 'resena.css']}>
<p class="meta">Message received</p>
<h1>Thank you. Your message has reached me.</h1>
<p class="lede">I will reply as soon as I can, usually by email. If you forgot something, write to me at <b>alextoll2005@gmail.com</b>.</p>
<div class="acts">
  <a class="btn btn--primary" href="index.html">Back to the website</a>
  <a class="btn btn--secondary" href="mailto:alextoll2005@gmail.com?subject=Enquiry%20for%20Alextoll">Send me an email</a>
</div>
</PaginaTexto>
