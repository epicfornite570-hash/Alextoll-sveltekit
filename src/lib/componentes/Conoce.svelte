<!--
  "Conoce a Alextoll": la puerta al portfolio (https://alextoll.xyz/). Sustituye a la antigua página "Sobre mí".
  La usan la portada (clase 'cx--portada') y ordenadores. Los menús y el pie enlazan a #conoce.
  - A la izquierda, el título, una frase y los capítulos del portfolio (cada uno enlaza a su sección).
  - A la derecha, una ventana de navegador con el portfolio de verdad: el vídeo de su portada
    (static/assets/video/portfolio-1.*) y capturas de cada sección (static/assets/img/conoce/*.webp).
    Al pasar por un capítulo, la ventana enseña esa sección y la barra de direcciones cambia.
  - Detrás, un campo de caracteres plateados (static/js/modules/conoce.js y conoce-fondo.js).
  Textos en src/lib/textos/conoce.js; estilo en static/css/conoce.css.
  Sin JavaScript se ve la portada del portfolio y todos los enlaces funcionan.
-->
<script>
  import { ui } from '$lib/sitio.js';
  import { idioma } from '$lib/idioma.js';
  import { TX, PORTFOLIO, VIDEO } from '$lib/textos/conoce.js';
  import Linea from './Linea.svelte';

  let { lang = idioma(), id = 'conoce', clase = '' } = $props();
  const X = $derived(TX[lang]);
  const R = $derived(ui(lang).raiz);
  const hreflang = $derived(lang === 'en' ? 'es' : undefined);
</script>

<section class="cx{clase ? ' ' + clase : ''}" {id} aria-labelledby="t-{id}">
  <div class="wrap">
    <div class="cx-stage" data-reveal>
      <canvas class="cx-ascii" aria-hidden="true"></canvas>
      <div class="cx-copy">
        <p class="eyebrow cx-eyebrow"><span class="cx-pulse" aria-hidden="true"></span>{X.eyebrow}<span class="cx-host-tag" aria-hidden="true">alextoll.xyz</span></p>
        <h2 id="t-{id}"><span class="cx-pre">{X.pre}</span> <span class="cx-name">Alextoll</span></h2>
        <p class="cx-lede">{X.lede}</p>
        <h3 class="sr-only">{X.indice}</h3>
        <ol class="cx-index">
          {#each X.capitulos as [c, t, d], i}
            <li><a class="cx-row" href="{PORTFOLIO}#{c}" data-cx={c} target="_blank" rel="noopener" {hreflang}>
              <span class="cx-n" aria-hidden="true">0{i + 1}</span><span class="cx-t">{t}</span><span class="cx-d">{d}</span><Linea k="lArrowUR" cls="cx-go" /><span class="sr-only">{' ' + X.nueva}</span>
              <span class="cx-time" aria-hidden="true"></span>
            </a></li>
          {/each}
        </ol>
        <div class="cx-acts">
          <a class="btn btn--primary cx-cta" href={PORTFOLIO} data-cx="inicio" target="_blank" rel="noopener" {hreflang}>{X.cta}<Linea k="lArrowUR" cls="ico-arrow" /><span class="sr-only">{' ' + X.nueva}</span></a>
          {#if X.nota}<span class="cx-note">{X.nota}</span>{/if}
        </div>
      </div>
      <figure class="cx-shell">
        <a class="cx-win" href={PORTFOLIO} target="_blank" rel="noopener" {hreflang} tabindex="-1" aria-hidden="true">
          <span class="cx-bar">
            <span class="cx-dots"><i></i><i></i><i></i></span>
            <span class="cx-addr"><svg class="cx-lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><span class="cx-url"><span class="cx-host">alextoll.xyz</span><span class="cx-path"></span></span><span class="cx-caret"></span></span>
            <span class="cx-load"></span>
          </span>
          <span class="cx-view">
            <img class="cx-shot cx-poster is-on" data-cx-shot="inicio" src="{R}{VIDEO}-poster.webp" alt="" width="1280" height="800" loading="lazy" decoding="async">
            <video class="cx-video" muted loop playsinline preload="none" disablepictureinpicture disableremoteplayback data-video="{R}{VIDEO}"></video>
            {#each X.capitulos as [c]}
              <img class="cx-shot" data-cx-shot={c} src="{R}assets/img/conoce/{c}-720.webp" srcset="{R}assets/img/conoce/{c}-720.webp 720w, {R}assets/img/conoce/{c}-1280.webp 1280w" sizes="(min-width: 900px) 640px, 92vw" alt="" width="1280" height="800" loading="lazy" decoding="async">
            {/each}
            <span class="cx-scan"></span>
            <span class="cx-glare"></span>
          </span>
        </a>
        <figcaption class="cx-cap"><span class="cx-cap-in"><span class="cx-live" aria-hidden="true"></span>{X.pie}</span></figcaption>
      </figure>
    </div>
  </div>
</section>
