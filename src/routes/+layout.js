/* Todas las páginas se generan al compilar (HTML estático) y luego Svelte toma el control en el
   navegador (csr) para la parte interactiva.
   trailingSlash 'never': la ruta /ordenadores se guarda como ordenadores.html (misma dirección que siempre). */
export const prerender = true;
export const csr = true;
export const trailingSlash = 'never';
