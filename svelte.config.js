/* =========================================================
   SvelteKit: la web se genera entera como páginas HTML estáticas
   (adapter-static) en la carpeta build/, que es lo que se sube al NAS.
   ========================================================= */
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
    // Se generan todas las páginas de src/routes; los enlaces son .html y no se siguen
    prerender: { entries: ['*'], crawl: false },
    /* El único JavaScript escrito dentro de la página es el arranque de SvelteKit: va con su huella
       (hash) en una <meta> de Content-Security-Policy. nginx pone el resto de la política. */
    csp: { mode: 'hash', directives: { 'script-src': ['self', 'https://apis.google.com'] } }
  }
};
