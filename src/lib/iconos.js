/* Iconos: se leen de static/js/lib/icons.js (los mismos que usan los scripts del
   navegador) para no tenerlos repetidos. Iconos rellenos (AT.ICONS, 256 × 256)
   y de línea fina (AT.LINEA, 24 × 24). */
import fuente from '../../static/js/lib/icons.js?raw';

export const trazo = (k) => {
  const m = fuente.match(new RegExp(`\\b${k}:'([^']*)'`));
  return m ? m[1] : '';
};
