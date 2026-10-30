/* =========================================================
   Scripts "de antes" (static/js) que todavía no se han pasado a Svelte.
   Cada página dice cuáles necesita (componente Final) y el layout los carga
   en orden cuando Svelte ya ha tomado el control de la página (después de
   "hidratarla"): si se ejecutaran antes, cambiarían el HTML que Svelte espera.
   ========================================================= */
import { getContext, setContext } from 'svelte';

const CLAVE = Symbol('legado');

/* En el layout: crea la lista de la página */
export const crearLegado = () => {
  const legado = { scripts: [], modulos: [] };
  setContext(CLAVE, legado);
  return legado;
};

/* En la página: estos son los scripts que necesita (rutas completas, en orden) */
export const usarScripts = (lista) => {
  const legado = getContext(CLAVE);
  if (legado) legado.scripts = lista;
};

/* Módulos JavaScript (type="module", p. ej. el 3D del 404): van aparte porque no tienen orden */
export const usarModulos = (lista) => {
  const legado = getContext(CLAVE);
  if (legado) legado.modulos = lista;
};

/* Los carga uno detrás de otro, en el mismo orden que antes tenían los <script defer> */
export const cargarScripts = (lista, { modulo = false } = {}) => {
  for (const src of lista) {
    const s = document.createElement('script');
    if (modulo) s.type = 'module';
    s.src = src;
    s.async = false;
    document.body.appendChild(s);
  }
};
