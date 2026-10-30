/* Solo las direcciones de las páginas de servicio en inglés (src/lib/datos/paginas-servicio-en.js) */
import PAGINAS from '$lib/datos/paginas-servicio-en.js';
const SLUGS = new Set(PAGINAS.map(p => p.slug));
export const match = (param) => SLUGS.has(param);
