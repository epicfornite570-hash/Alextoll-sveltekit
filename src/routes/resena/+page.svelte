<!--
  Página para pedir reseñas: mándasela al cliente al terminar un trabajo
  (por email, mensaje o con el QR de docs/tarjeta-resena.html).
  El enlace de Google se pone en static/js/config.js (resenasGoogle).
-->
<script>
  import PaginaTexto from '$lib/componentes/PaginaTexto.svelte';
  import Linea from '$lib/componentes/Linea.svelte';
  import Estrellas from '$lib/componentes/Estrellas.svelte';
  import PlataEstrellas from '$lib/componentes/PlataEstrellas.svelte';
</script>

<PaginaTexto title="Tu opinión | Alextoll" canonical="resena.html" robots="noindex"
  desc="¿Qué tal ha ido tu equipo? Deja tu reseña de Alextoll en Google en menos de un minuto." css={['legal.css', 'resena.css']} scripts={['modules/resena.js']}>
<PlataEstrellas />
<section class="rv" aria-labelledby="rv-t">
  <div class="rv-card card">
    <p class="eyebrow">Tu opinión</p>
    <Estrellas cls="rv-stars" />
    <h1 id="rv-t">¿Qué tal ha ido tu&nbsp;equipo?</h1>
    <p class="lede">Tu opinión sincera en Google, buena o mala, me ayuda a mejorar y orienta a otras personas que buscan un técnico.</p>
    <ol class="rv-steps">
      <li><span class="rv-n">01</span><b>Pulsa el botón</b><small>Se abre mi ficha de Google.</small></li>
      <li><span class="rv-n">02</span><b>Elige las estrellas</b><small>Las que creas justas.</small></li>
      <li><span class="rv-n">03</span><b>Cuenta tu experiencia</b><small>Con tus palabras, como la viviste.</small></li>
    </ol>
    <div class="rv-acts">
      <a class="btn btn--primary" id="rv-google" href="#" target="_blank" rel="noopener" hidden>Escribir mi reseña en Google<Linea k="lArrow" cls="ico-arrow" /></a>
      <a class="btn btn--secondary" id="rv-mail" data-mail="Qué tal ha ido mi equipo" data-mail-texto="Hola Alextoll, te cuento qué tal ha ido con mi equipo: " href="mailto:alextoll2005@gmail.com">Prefiero contártelo por email</a>
    </div>
    <p class="rv-note" id="rv-note">Tardas menos de un minuto. Solo necesitas una cuenta de Google.</p>
  </div>
  <p class="rv-thanks">Gracias por confiar en mí. <span>Alejandro, Alextoll</span></p>
</section>
</PaginaTexto>
