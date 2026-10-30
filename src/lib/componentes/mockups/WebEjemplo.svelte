<!--
  Web de ejemplo en miniatura (negocios ficticios) para los mockups.
    marca:     'brasa' | 'nativa' | 'nord' | 'lumen'
    p:         versión vertical (tablet y móvil)
    live:      versión completa para la ventana de "Ver ejemplo"
    secciones: añade el resto de la página (se ve al bajar)
    lazy:      false → la imagen se carga enseguida (cabecera)
    titulo:    el titular de la cabecera (si no, el de los textos)
-->
<script>
  import { TX } from '$lib/datos/mockups.js';
  import { idioma } from '$lib/idioma.js';

  let { marca, p = false, live = false, secciones = false, lazy = true, titulo, lang = idioma() } = $props();

  const NOMBRE = { brasa: 'La Brasa', nativa: 'Nativa', nord: 'Nord', lumen: 'Lumen' };
  const POS = ['ms-thumb--1', 'ms-thumb--2', 'ms-thumb--3'];   // encuadre de cada miniatura de Nord: static/css/mockups.css
  const L = $derived(TX[lang] || TX.es);
  const X = $derived(L[marca]);
  const R = $derived(lang === 'en' ? '../' : '');
  const logo = $derived(NOMBRE[marca]);
  const clase = $derived(marca === 'lumen' ? 'ms ms-lumen' : `ms ms-${marca}${p ? ' ms--p' : ''}${live ? ' ms--live' : ''}`);
  const sub = $derived(marca === 'nativa' && p ? X.subP : X.sub);
  const btn = $derived(marca === 'nord' && p ? X.btnP : X.btn);
  const resto = $derived(marca !== 'lumen' && (secciones || live));
</script>

{#snippet img(src, cls, perezosa = true, pos = '')}<img class={pos ? `${cls} ${pos}` : cls} src="{R}assets/img/webs/{src}" alt="" loading={perezosa ? 'lazy' : undefined} decoding="async">{/snippet}

<div class={clase}><div class="ms-nav"><span class="ms-logo">{logo}</span><span class="ms-links">{#each X.nav as l}<i>{l}</i>{/each}</span><span class="ms-burger"></span></div>
  <div class="ms-hero">{#if marca === 'lumen'}<span class="ms-liquid"></span>{:else}{@render img(`${marca}.webp`, 'ms-img', lazy !== false)}{/if}
    <div class="ms-copy"><span class="ms-h">{titulo || X.titulo}</span><span class="ms-p">{sub}</span><span class="ms-btn">{btn}</span></div>
  </div>{#if resto}
  <div class="ms-sec">
    <span class="ms-eb">{X.eb}</span><span class="ms-h2">{X.h2}</span>
    {#if marca === 'brasa'}
    <div class="ms-grid ms-menu">
      {#each X.platos as [b, s, e]}<div class="ms-item"><b>{b}</b><span>{s}</span><em>{e}</em></div>
      {/each}
    </div>
    {:else if marca === 'nativa'}
    <div class="ms-grid">
      {#each X.clases as [b, s]}<div class="ms-item"><b>{b}</b><span>{s}</span></div>
      {/each}
    </div>
    {:else}
    <div class="ms-grid">
      {#each X.productos as [b, e], i}<div class="ms-item">{@render img('nord.webp', 'ms-thumb', true, POS[i])}<b>{b}</b><em>{e}</em></div>
      {/each}
    </div>
    {/if}
  </div>
  <div class="ms-band"><span class="ms-h2">{X.banda[0]}</span><span class="ms-p">{X.banda[1]}</span><span class="ms-btn">{X.banda[2]}</span></div>
  <div class="ms-foot"><span class="ms-logo">{logo}</span><span>{X.pieTxt}</span><span>{L.pie}</span></div>{/if}
</div>
