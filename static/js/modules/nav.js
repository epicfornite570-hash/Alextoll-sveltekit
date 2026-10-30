/* =========================================================
   Menú: fondo al bajar, menú móvil y sección activa.
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.nav = {
  init() {
    const nav = AT.$('#nav'), burger = AT.$('#burger'), menu = AT.$('#menu');
    if (!nav) return;

    /* Fondo sólido al hacer scroll (en páginas sin cabecera oscura ya viene sólido) */
    if (!nav.classList.contains('nav--solid')) {
      const onScroll = () => nav.classList.toggle('is-solid', scrollY > 24 || menu?.classList.contains('open'));
      addEventListener('scroll', onScroll, { passive: true, signal: AT.pagina.signal }); onScroll();
    }

    /* Menú móvil */
    if (burger && menu) {
      const setOpen = (open) => {
        menu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? AT.t('Cerrar menú', 'Close menu') : AT.t('Abrir menú', 'Open menu'));
        if (open) nav.classList.add('is-solid'); else if (scrollY <= 24 && !nav.classList.contains('nav--solid')) nav.classList.remove('is-solid');
      };
      burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
      menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
      addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setOpen(false); burger.focus(); } }, { signal: AT.pagina.signal });
      document.addEventListener('click', e => { if (menu.classList.contains('open') && !nav.contains(e.target)) setOpen(false); }, { signal: AT.pagina.signal });
    }

    /* Sección activa: enciende el LED del enlace correspondiente */
    const links = AT.$$('.menu a[href^="#"]').filter(a => a.getAttribute('href').length > 1);
    const sections = links.map(a => AT.$(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id)));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(s => io.observe(s));
      AT.alSalir(() => io.disconnect());
    }
  }
};
