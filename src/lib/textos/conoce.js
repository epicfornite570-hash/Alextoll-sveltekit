/* =========================================================
   Textos de "Conoce a Alextoll", la puerta al portfolio (https://alextoll.xyz/).
   La sección está en src/lib/componentes/Conoce.svelte; la usan la portada y ordenadores.

   Si cambian las secciones del portfolio, cambia capitulos (el primer valor es el id
   de la sección en alextoll.xyz) y vuelve a hacer las capturas (1440 × 900, guardadas
   a 1280 y 720 px de ancho en static/assets/img/conoce/).
   ========================================================= */
export const PORTFOLIO = 'https://alextoll.xyz/';
export const VIDEO = 'assets/video/portfolio-1';   // si lo vuelves a grabar, sube el número (caché de Cloudflare)

export const TX = {
  es: {
    eyebrow: 'Portfolio', pre: 'Conoce a',
    lede: 'Detrás de cada reparación y de cada web estoy yo, Alex. En mi portfolio te cuento quién soy, cómo trabajo y lo que construyo.',
    cta: 'Entrar en el portfolio', nueva: '(se abre en una pestaña nueva)', indice: 'Qué vas a encontrar en el portfolio',
    pie: 'Vista real de alextoll.xyz', nota: '',
    capitulos: [
      ['sobre-mi', 'Sobre mí', 'Quién soy y cómo nació Alextoll'],
      ['alextoll', 'Alextoll.store', 'Esta web, contada por dentro'],
      ['nas', 'Mi NAS', 'Del navegador a mi servidor en casa'],
      ['xtoll', 'Xtoll', 'Mi proyecto de fin de grado']
    ]
  },
  en: {
    eyebrow: 'Portfolio', pre: 'Meet',
    lede: 'Behind every repair and every website, there’s me, Alex. My portfolio tells you who I am, how I work and what I build.',
    cta: 'Visit my portfolio', nueva: '(opens in a new tab, in Spanish)', indice: 'What you will find in the portfolio',
    pie: 'Live view of alextoll.xyz', nota: 'In Spanish',
    capitulos: [
      ['sobre-mi', 'About me', 'Who I am and how Alextoll began'],
      ['alextoll', 'Alextoll.store', 'This website, from the inside'],
      ['nas', 'My NAS', 'The home server behind this site'],
      ['xtoll', 'Xtoll', 'My final degree project']
    ]
  }
};
