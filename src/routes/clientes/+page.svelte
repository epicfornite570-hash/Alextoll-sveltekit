<!--
  Área de clientes (clientes.html): inicio de sesión con correo, Google, X o Microsoft
  y el panel de trabajos. Solo en español.
  (Facebook está quitado hasta que Meta publique la app; su logotipo sigue en MARCAS.)
  - Estilos: static/css/clientes.css
  - Lógica:  static/js/modules/clientes.js (+ static/js/lib/firestore.js)
  - Etapas de cada trabajo: static/js/data/clientes.js
  - Configuración de Firebase: static/js/config.js → firebase
-->
<script>
  import { MENU_MARCA } from '$lib/sitio.js';
  import SERVICIOS from '$lib/datos/paginas-servicio.js';
  import Cabeza from '$lib/componentes/Cabeza.svelte';
  import Menu from '$lib/componentes/Menu.svelte';
  import Pie from '$lib/componentes/Pie.svelte';
  import Final from '$lib/componentes/Final.svelte';
  import Linea from '$lib/componentes/Linea.svelte';
  import Icono from '$lib/componentes/Icono.svelte';

  /* Logotipos en blanco (sin color, como el resto de la web) */
  const MARCAS = {
    google: '<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>',
    x: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
    facebook: '<path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>',
    /* Microsoft: los cuatro cuadrados del logotipo */
    microsoft: '<path d="M1 1h10.5v10.5H1zM12.5 1H23v10.5H12.5zM1 12.5h10.5V23H1zM12.5 12.5H23V23H12.5z"/>'
  };

  const VENTAJAS = [
    ['lClock', 'Cada paso, a la vista', 'Desde que recibo tu equipo o tu idea hasta la entrega.'],
    ['lFile', 'Presupuesto claro', 'Lo revisas y lo aceptas desde aquí. No toco nada antes.'],
    ['lShield', 'Todo tu historial', 'Reparaciones y webs, con sus novedades, en un solo sitio.']
  ];
</script>

<Cabeza title="Área de clientes | Alextoll" desc="Sigue el estado de tu reparación o de tu web, revisa el presupuesto y consulta tu historial con Alextoll."
  canonical="clientes.html" robots="noindex,follow" css={['clientes.css']} />
<Menu menu={MENU_MARCA} actual="clientes.html" />

{#snippet proveedor(id, texto)}<button class="btn cl-prov" type="button" data-proveedor={id}><svg class="cl-brand" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{@html MARCAS[id]}</svg><span>{texto}</span></button>{/snippet}
<main id="main" class="cl" data-cl>
  <div class="cl-glow" aria-hidden="true"></div>
  <div class="wrap">

    <!-- Cargando (mientras Firebase comprueba si ya habías entrado) -->
    <div class="cl-loading" data-vista="cargando" role="status">
      <span class="cl-spin" aria-hidden="true"></span><span>Conectando…</span>
    </div>

    <!-- ACCESO -->
    <section class="cl-access" data-vista="acceso" aria-labelledby="cl-t-acc" hidden>
      <div class="cl-intro">
        <p class="eyebrow">Área de clientes</p>
        <h1 id="cl-t-acc" tabindex="-1"><span>Tu equipo,</span> <span class="silver">siempre a la vista.</span></h1>
        <p class="lede">Entra para ver en qué punto está tu reparación o tu web, revisar el presupuesto y consultar todo lo que hemos hecho.</p>
        <ul class="cl-perks">
          {#each VENTAJAS as [i, t, x]}
          <li><Linea k={i} /><div><b>{t}</b><span>{x}</span></div></li>
          {/each}
        </ul>
      </div>

      <div class="card cl-login">
        <h2>Acceder</h2>
        <p class="cl-login-sub">Usa el mismo correo que me diste y verás tus trabajos.</p>
        <div class="cl-provs">
          {@render proveedor('google', 'Continuar con Google')}
          {@render proveedor('x', 'Continuar con X')}
          {@render proveedor('microsoft', 'Continuar con Microsoft')}
        </div>
        <p class="cl-sep"><span>o con tu correo</span></p>

        <div class="cl-tabs" role="tablist" aria-label="Acceso con correo">
          <button type="button" role="tab" id="cl-tab-entrar" aria-selected="true" aria-controls="cl-form" data-modo="entrar">Entrar</button>
          <button type="button" role="tab" id="cl-tab-crear" aria-selected="false" aria-controls="cl-form" data-modo="crear" tabindex="-1">Crear cuenta</button>
        </div>
        <form class="cl-form" id="cl-form" aria-labelledby="cl-tab-entrar" novalidate>
          <div class="field" data-solo="crear" hidden>
            <label for="cl-nombre">Nombre</label>
            <input id="cl-nombre" name="nombre" type="text" autocomplete="name" maxlength="80">
          </div>
          <div class="field">
            <label for="cl-email">Correo</label>
            <input id="cl-email" name="email" type="email" autocomplete="email" inputmode="email" required>
          </div>
          <div class="field">
            <label for="cl-pass">Contraseña</label>
            <div class="cl-pass">
              <input id="cl-pass" name="password" type="password" autocomplete="current-password" minlength="8" required>
              <button type="button" class="cl-eye" data-ver-pass aria-label="Mostrar contraseña" aria-pressed="false"><Icono k="eye" /></button>
            </div>
            <span class="hint" data-solo="crear" hidden>Mínimo 8 caracteres.</span>
          </div>
          <button class="btn btn--primary btn--block" type="submit" data-enviar>Entrar<Linea k="lArrow" cls="ico-arrow" /></button>
          <button class="linkbtn cl-forgot" type="button" data-olvido data-solo="entrar">¿Has olvidado tu contraseña?</button>
          <div class="status" data-estado role="status" hidden></div>
        </form>
        <p class="cl-legal">Al continuar aceptas la <a href="privacidad.html#clientes">política de privacidad</a>. Solo guardo tu nombre, tu correo y tus trabajos.</p>
      </div>
    </section>

    <!-- VERIFICAR EL CORREO -->
    <section class="cl-center" data-vista="verificar" aria-labelledby="cl-t-ver" hidden>
      <div class="card cl-note">
        <span class="cl-note-ico"><Linea k="lMail" /></span>
        <h1 id="cl-t-ver" tabindex="-1">Revisa tu correo</h1>
        <p class="lede">Te he enviado un enlace a <b data-cl-email></b> para confirmar que es tuyo. Ábrelo y vuelve aquí.</p>
        <div class="cl-note-acts">
          <button class="btn btn--primary" type="button" data-ya-verificado>Ya lo he confirmado</button>
          <button class="btn btn--secondary" type="button" data-reenviar>Reenviar el correo</button>
        </div>
        <p class="cl-small">¿No te llega? Espera un par de minutos y mira en Spam y Promociones (llega de <b>noreply@alextoll-web-959a5.firebaseapp.com</b>) o <button class="linkbtn" type="button" data-salir>usa otra cuenta</button>.</p>
        <div class="status" data-estado-ver role="status" hidden></div>
      </div>
    </section>

    <!-- PRÓXIMAMENTE (sin configurar Firebase) -->
    <section class="cl-center" data-vista="pronto" aria-labelledby="cl-t-pronto" hidden>
      <div class="card cl-note">
        <span class="cl-note-ico"><Linea k="lClock" /></span>
        <p class="eyebrow">Área de clientes</p>
        <h1 id="cl-t-pronto" tabindex="-1">Muy pronto</h1>
        <p class="lede">Aquí podrás seguir tu reparación o tu web paso a paso. Mientras tanto, te informo yo directamente.</p>
        <div class="cl-note-acts">
          <a class="btn btn--primary" href="mailto:alextoll2005@gmail.com?subject=Consulta%20sobre%20mi%20trabajo"><Linea k="lMail" />Escríbeme</a>
          <a class="btn btn--secondary" href="index.html">Volver a la portada</a>
        </div>
      </div>
    </section>

    <!-- BARRA DE LA CUENTA (cliente y panel) -->
    <div class="cl-bar" data-barra hidden>
      <div class="cl-who">
        <span class="cl-avatar" data-cl-iniciales aria-hidden="true"></span>
        <div><b data-cl-nombre></b><span><span data-cl-email></span><span class="cl-via" data-cl-via></span></span></div>
      </div>
      <button class="btn btn--secondary btn--sm" type="button" data-salir>Cerrar sesión</button>
    </div>

    <!-- CLIENTE: MIS TRABAJOS -->
    <section class="cl-zone" data-vista="cliente" aria-labelledby="cl-t-cli" hidden>
      <header class="cl-zone-head">
        <div>
          <p class="eyebrow">Área de clientes</p>
          <h1 id="cl-t-cli" tabindex="-1">Hola, <span data-cl-saludo></span></h1>
        </div>
        <p class="cl-zone-sub">Aquí tienes tus trabajos conmigo. Se actualiza cada vez que hay novedades.</p>
      </header>
      <div class="cl-jobs" id="cl-trabajos" aria-live="polite"></div>
      <p class="cl-small cl-delete">¿Quieres borrar tu cuenta? <button class="linkbtn" type="button" data-borrar-cuenta>Eliminar mi cuenta</button></p>
    </section>

    <!-- PANEL DE ALEXTOLL -->
    <section class="cl-zone" data-vista="admin" aria-labelledby="cl-t-adm" hidden>
      <header class="cl-zone-head">
        <div>
          <p class="eyebrow">Panel de Alextoll</p>
          <h1 id="cl-t-adm" tabindex="-1">Trabajos</h1>
        </div>
        <button class="btn btn--primary" type="button" data-nuevo><Linea k="lPlus" />Nuevo trabajo</button>
      </header>
      <div class="cl-tiles" id="cl-tiles"></div>
      <div class="cl-tools">
        <div class="cl-seg" role="group" aria-label="Mostrar">
          <button type="button" data-filtro="curso" aria-pressed="true">En curso</button>
          <button type="button" data-filtro="hechos" aria-pressed="false">Terminados</button>
          <button type="button" data-filtro="todos" aria-pressed="false">Todos</button>
        </div>
        <label class="cl-search"><Linea k="lSearch" /><span class="sr-only">Buscar</span><input type="search" id="cl-buscar" placeholder="Buscar cliente, correo o equipo"></label>
      </div>
      <div class="cl-rows" id="cl-admin-lista" aria-live="polite"></div>
    </section>

  </div>
</main>

<!-- Editor de trabajos (solo el panel) -->
<dialog class="cl-dlg" id="cl-editor" aria-labelledby="cl-ed-t">
  <form class="cl-ed" method="dialog" novalidate>
    <header class="cl-ed-head">
      <h2 id="cl-ed-t">Nuevo trabajo</h2>
      <button class="cl-x" type="button" data-cerrar aria-label="Cerrar"><Linea k="lPlus" /></button>
    </header>
    <div class="cl-ed-body">
      <fieldset>
        <legend>Cliente</legend>
        <div class="cl-grid2">
          <div class="field"><label for="ed-email">Correo *</label><input id="ed-email" name="email" type="email" required placeholder="el correo con el que entrará"></div>
          <div class="field"><label for="ed-cliente">Nombre</label><input id="ed-cliente" name="cliente" type="text" maxlength="80"></div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Trabajo</legend>
        <div class="cl-grid2">
          <div class="field"><label for="ed-tipo">Tipo</label><select id="ed-tipo" name="tipo"></select></div>
          <div class="field"><label for="ed-estado">Etapa</label><select id="ed-estado" name="estado"></select></div>
          <div class="field cl-span2"><label for="ed-titulo">Título *</label><input id="ed-titulo" name="titulo" type="text" required maxlength="90" placeholder="Portátil HP Pavilion 15"></div>
          <div class="field cl-span2"><label for="ed-servicio">Qué se hace</label><input id="ed-servicio" name="servicio" type="text" maxlength="140" placeholder="Cambio a SSD, limpieza y pasta térmica"></div>
          <div class="field"><label for="ed-fecha">Fecha prevista</label><input id="ed-fecha" name="fechaPrevista" type="date"></div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Presupuesto</legend>
        <div class="cl-lines" id="ed-lineas"></div>
        <div class="cl-lines-foot">
          <button class="btn btn--link" type="button" data-linea><Linea k="lPlus" />Añadir línea</button>
          <span>Total <b id="ed-total">0 €</b></span>
        </div>
        <label class="check"><input type="checkbox" id="ed-aceptado" name="presupuestoAceptado"><span>Aceptado por el cliente</span></label>
      </fieldset>
      <fieldset>
        <legend>Novedades</legend>
        <ol class="cl-news cl-news--edit" id="ed-novedades"></ol>
        <div class="field"><label for="ed-nota">Añadir una novedad</label><textarea id="ed-nota" name="nota" rows="3" maxlength="600" placeholder="He cambiado el disco y estoy instalando Windows."></textarea>
          <span class="hint">Al cambiar de etapa se apunta sola.</span></div>
      </fieldset>
      <div class="status" data-estado-ed role="status" hidden></div>
    </div>
    <footer class="cl-ed-foot">
      <button class="btn btn--link cl-danger" type="button" data-borrar hidden>Borrar trabajo</button>
      <span class="cl-ed-acts">
        <button class="btn btn--secondary" type="button" data-cerrar>Cancelar</button>
        <button class="btn btn--primary" type="submit" data-guardar>Guardar</button>
      </span>
    </footer>
  </form>
</dialog>

<!-- Confirmación (sustituye a confirm()) -->
<dialog class="cl-dlg cl-dlg--sm" id="cl-confirmar" aria-labelledby="cl-cf-t">
  <form method="dialog" class="cl-cf">
    <h2 id="cl-cf-t"></h2>
    <p data-texto></p>
    <div class="cl-cf-acts">
      <button class="btn btn--secondary" value="no">Cancelar</button>
      <button class="btn btn--primary" value="si" data-si></button>
    </div>
  </form>
</dialog>

<Pie servicios={SERVICIOS} />
<!-- ?v=: súbelo al cambiar clientes.js (Cloudflare deja 4 h en caché el JS) -->
<Final scripts={['data/clientes.js', 'lib/firestore.js', 'modules/clientes.js?v=9']} />
