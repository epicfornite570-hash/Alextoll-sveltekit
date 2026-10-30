/* Idioma de la página que se está generando: las páginas en inglés están en /en/ */
import { page } from '$app/state';

export const idioma = () => {
  const p = page.url.pathname;
  return p === '/en' || p.startsWith('/en/') ? 'en' : 'es';
};
