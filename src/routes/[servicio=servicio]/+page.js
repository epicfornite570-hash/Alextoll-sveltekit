/* Una página por cada servicio de src/lib/datos/paginas-servicio.js */
import PAGINAS from '$lib/datos/paginas-servicio.js';
export const entries = () => PAGINAS.map(p => ({ servicio: p.slug }));
export const load = ({ params }) => ({ p: PAGINAS.find(p => p.slug === params.servicio) });
