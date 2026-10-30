/* =========================================================
   Página de reseñas (resena.html)
   - Pone el enlace de Google de js/config.js (resenasGoogle).
   - Sin enlace: solo se ofrece contarlo por email, como botón principal.
   - Cuenta en las estadísticas cuántos pulsan "reseña en Google".
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.resena = {
  init() {
    const google = AT.$('#rv-google'); if (!google) return;
    const mail = AT.$('#rv-mail'), nota = AT.$('#rv-note');
    const url = AT.config.resenasGoogle;

    if (url) {
      google.href = url;
      google.hidden = false;
      google.addEventListener('click', () => AT.track && AT.track('resena'));
    } else {
      mail.classList.replace('btn--secondary', 'btn--primary');
      mail.textContent = 'Contarme qué tal por email';
      if (nota) nota.textContent = 'Muy pronto podrás dejarla también en Google.';
      /* Sin ficha de Google no hay botón: los pasos «pulsa el botón…» y el texto sobre Google no valen */
      const pasos = AT.$('.rv-steps'); if (pasos) pasos.hidden = true;
      const lede = AT.$('.rv .lede');
      if (lede) lede.textContent = 'Cuéntame qué tal ha ido, tanto si todo salió bien como si no. Tu opinión sincera me ayuda a mejorar.';
    }

    /* Las estrellas se encienden una detrás de otra al cargar */
    const estrellas = AT.$('.rv-stars');
    if (estrellas && !AT.reduceMotion) requestAnimationFrame(() => estrellas.classList.add('is-on'));
    else if (estrellas) estrellas.classList.add('is-on', 'is-still');
  }
};
