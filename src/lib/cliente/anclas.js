/* Enlaces "#seccion" cuando la página lleva <base href> (la 404 y el cambio de idioma):
   con <base>, el navegador los mandaría a otra página. Aquí se desplaza en la misma. */
export function anclasConBase() {
  const alPulsar = (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || !document.querySelector('base[href]') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const h = a.getAttribute('href'), destino = h.length > 1 && document.getElementById(decodeURIComponent(h.slice(1)));
    if (h.length > 1 && !destino) return;
    const suave = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    history.pushState(history.state, '', location.href.split('#')[0] + (h.length > 1 ? h : ''));
    destino ? destino.scrollIntoView({ behavior: suave }) : scrollTo({ top: 0, behavior: suave });
    if (destino && h === '#main') destino.focus?.({ preventScroll: true });
  };
  document.addEventListener('click', alPulsar, true);
  return () => document.removeEventListener('click', alPulsar, true);
}
