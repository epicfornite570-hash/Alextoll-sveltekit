/* Solo las direcciones de las páginas de servicio en español (src/lib/datos/paginas-servicio.js) */
import PAGINAS from '$lib/datos/paginas-servicio.js';
const SLUGS = new Set(PAGINAS.map(p => p.slug));
export const match = (param) => SLUGS.has(param);
