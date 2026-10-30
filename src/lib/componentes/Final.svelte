<!--
  Final de cada página: banner de cookies, aviso (toast) y los scripts del navegador.
    scripts: scripts propios de la página dentro de static/js (p. ej. 'modules/video.js'),
             se cargan después de los comunes y antes de main.js
    comunes: los scripts de todas las páginas (solo se cambia en diagnostico.html)
-->
<script>
  import { ui } from '$lib/sitio.js';
  import { idioma } from '$lib/idioma.js';
  import { usarScripts } from '$lib/legado.js';

  const COMUNES = ['config.js', 'lib/utils.js', 'lib/icons.js', 'modules/nav.js', 'modules/reveal.js', 'modules/contacto.js', 'modules/cookies.js?v=2', 'modules/visitas.js?v=2', 'modules/idioma.js'];
  let { scripts = [], comunes = COMUNES, lang = idioma() } = $props();

  const U = $derived(ui(lang));
  const lista = [...comunes, ...scripts, 'main.js'].map(s => `${ui(lang).raiz}js/${s}`);
  usarScripts(lista);
</script>

<!-- La lista de scripts también va escrita en la página (no se ejecuta): el botón ES/EN
     (static/js/modules/idioma.js) la lee en la página del otro idioma para cargar lo que falte. -->
{@html `<script type="application/json" id="at-scripts">${JSON.stringify(lista).replace(/</g, '\\u003c')}</script>`}

<!-- Ventana de cookies (static/js/modules/cookies.js, static/css/layout.css).
     Aceptar y Rechazar tienen el mismo peso, como pide la AEPD.
     Los textos van en data-* para que el módulo avise en el idioma de la página. -->
<div class="cookie" id="cookie" role="dialog" aria-modal="false" aria-labelledby="ck-t" aria-describedby="ck-d" data-ok={U.ckOk} data-solo={U.ckSoloNec} hidden>
  <div class="ck-head">
    <span class="ck-ico" aria-hidden="true"><svg class="ico-l" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 3.2 3.2 0 0 1-3.6-3.1A3.2 3.2 0 0 1 14 5.6 3 3 0 0 1 12 3z"/><circle cx="8.6" cy="11.4" r=".9"/><circle cx="12.3" cy="15.6" r=".9"/><circle cx="15.9" cy="12.9" r=".9"/><circle cx="9.4" cy="7.4" r=".6"/></svg></span>
    <div class="ck-tit"><p class="ck-kicker">{U.ckKicker}</p><h2 id="ck-t">{U.ckTitulo}</h2></div>
    <button class="ck-x" type="button" id="ck-x" aria-label={U.ckCerrar} hidden><svg class="ico-l" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  </div>
  <p class="ck-txt" id="ck-d">{@html U.ckTexto}</p>
  <div class="ck-prefs" id="ck-prefs" hidden>
    <div class="ck-opt"><span class="ck-opt-t"><b>{U.ckNec}</b><small>{U.ckNecTxt}</small></span><span class="ck-sw"><input type="checkbox" role="switch" checked disabled aria-label={U.ckNecAria}><i aria-hidden="true"></i></span></div>
    <label class="ck-opt" for="ck-stats"><span class="ck-opt-t"><b>{U.ckEst}</b><small>{U.ckEstTxt}</small></span><span class="ck-sw"><input type="checkbox" role="switch" id="ck-stats" aria-label={U.ckEstAria}><i aria-hidden="true"></i></span></label>
  </div>
  <div class="ck-acts">
    <button class="ck-btn" type="button" id="ck-none">{U.ckNo}</button>
    <button class="ck-btn" type="button" id="ck-all">{U.ckSi}</button>
    <button class="ck-btn ck-btn--full" type="button" id="ck-save" hidden>{U.ckGuardar}</button>
    <button class="ck-more" type="button" id="ck-conf">{U.ckConf}<svg class="ico-l" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>
  </div>
</div>
<div class="toast" id="toast" role="status" hidden></div>
