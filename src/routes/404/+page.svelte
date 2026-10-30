<!--
  Página de error 404 (nginx la sirve en cualquier dirección que no existe, p. ej. /algo/mal):
  src/hooks.server.js le pone <base href="/"> para que sus enlaces y archivos se busquen desde la raíz.

  404 con 3D (static/js/modules/repara404.js, con three.js en static/js/vendor/three-0.180): un «404» cromado
  en #r4-404 y un PC (static/assets/3d/pc404-N.glb) que se monta solo en #r4-pc. El CSS (static/css/repara404.css)
  decide dónde van los huecos; el 3D se dibuja encima. Mientras carga, sin WebGL o sin JavaScript se ve una foto
  del «404» (static/assets/img/404-cromo-*.webp, sacada del propio 3D en reposo con tools/foto-404.cjs) y los enlaces.
-->
<script>
  import PaginaTexto from '$lib/componentes/PaginaTexto.svelte';
  import { usarModulos } from '$lib/legado.js';

  /* El 3D se descarga en paralelo desde el principio (si no, un archivo espera al otro) */
  const MODULO = 'js/modules/repara404.js?v=13';
  const PRECARGA = [MODULO, 'js/vendor/three-0.180/three.module.min.js', 'js/vendor/three-0.180/three.core.min.js',
    'js/vendor/three-0.180/RoomEnvironment.js', 'js/vendor/three-0.180/GLTFLoader.js', 'js/vendor/three-0.180/BufferGeometryUtils.js'];
  usarModulos([MODULO]);
</script>

<PaginaTexto title="Página no encontrada | Alextoll" canonical="404.html" robots="noindex" css={['legal.css', 'repara404.css?v=9']}>
  {#snippet extra()}
    {#each PRECARGA as u}<link rel="modulepreload" href="/{u}">{/each}
    <!-- El ordenador (tools/pc404/build_model.py) se pide a la vez que el 3D, sin esperar al módulo -->
    <link rel="preload" as="fetch" href="/assets/3d/pc404-2.glb" crossorigin="">
    <!-- Foto del «404» cromado: se ve nada más entrar y el 3D la sustituye sin que se note -->
    <link rel="preload" as="image" href="/assets/img/404-cromo-movil-2.webp" media="(max-width: 899px)" fetchpriority="high">
    <link rel="preload" as="image" href="/assets/img/404-cromo-pc-2.webp" media="(min-width: 900px)" fetchpriority="high">
  {/snippet}
<section class="r4h" id="r4">
  <div class="r4h-txt">
    <div class="r4-hueco r4-hueco-404" id="r4-404">
      <picture class="r4-foto">
        <source media="(min-width: 900px)" srcset="/assets/img/404-cromo-pc-2.webp" width="974" height="626">
        <img src="assets/img/404-cromo-movil-2.webp" width="742" height="476" alt="404" fetchpriority="high">
      </picture>
    </div>
    <h1>Esta página no existe</h1>
    <p class="lede">El enlace está mal escrito o la página ya no está. Mientras tanto, mira cómo se monta un PC pieza a pieza.</p>
    <div class="acts">
      <a class="btn btn--primary" href="index.html">Ir a la portada</a>
      <a class="btn btn--secondary" href="index.html#caminos">¿Qué necesitas?</a>
    </div>
  </div>
  <div class="r4-hueco r4-hueco-pc" id="r4-pc">
    <img class="r4-pcfoto" src="assets/img/pc404-montado-3.webp" width="760" height="760" alt="Torre de ordenador montada, con el lateral de cristal" loading="lazy">
    <p class="r4-carga" aria-hidden="true">Preparando el ordenador…</p>
    <p class="r4-pista">Toca una pieza para ver qué hace · arrastra para girar</p>
    <button class="btn btn--secondary btn--sm r4-otra" type="button" id="r4-otra" hidden>Repetir montaje</button>
  </div>
</section>

<div class="r4-info" id="r4-info" hidden aria-live="polite"></div>

<section class="r4-servicios" aria-labelledby="r4-serv-t">
  <h2 id="r4-serv-t">¿Le pasa algo a tu ordenador?</h2>
  <ul class="r4-piezas">
    <li><a href="limpieza-ordenador-madrid.html"><b>Disipador</b><span>Limpieza y pasta térmica</span></a></li>
    <li><a href="ampliar-memoria-ram-madrid.html"><b>Memoria RAM</b><span>Ampliar la memoria RAM</span></a></li>
    <li><a href="cambiar-tarjeta-grafica-madrid.html"><b>Tarjeta gráfica</b><span>Cambiar gráfica, fuente o Wi-Fi</span></a></li>
    <li><a href="cambiar-disco-ssd-madrid.html"><b>Disco SSD</b><span>Cambiar disco duro por SSD</span></a></li>
  </ul>
</section>
</PaginaTexto>
