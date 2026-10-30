/* Se carga en el <head> sin defer. Debe ser pequeño.
   - Marca que hay JavaScript (el CSS lo usa para no esconder nada si falla).
   - Borra la preferencia de tema claro/oscuro de la versión anterior:
     la web ahora es siempre negra. */
(function () {
  document.documentElement.classList.add('js');
  try { localStorage.removeItem('alextoll_theme'); } catch (e) {}
})();
