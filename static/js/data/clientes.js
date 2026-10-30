/* =========================================================
   ÁREA DE CLIENTES (clientes.html)
   ---------------------------------------------------------
   Las etapas por las que pasa cada trabajo. El cliente ve
   una barra de progreso con ellas; tú eliges la etapa actual
   en el panel. Puedes cambiar los textos, pero NO los "id"
   (están guardados en los trabajos que ya existen).
   ========================================================= */
window.AT = window.AT || {};

AT.TIPOS_TRABAJO = {
  ordenador: {
    nombre: 'Ordenador', icono: 'lLaptop',
    etapas: [
      { id: 'recibido',    nombre: 'Recibido',      texto: 'Tengo tu equipo y está en la cola de trabajo.' },
      { id: 'diagnostico', nombre: 'Diagnóstico',   texto: 'Estoy revisando qué le pasa.' },
      { id: 'presupuesto', nombre: 'Presupuesto',   texto: 'Tienes el presupuesto abajo. No toco nada hasta que lo aceptes.' },
      { id: 'reparacion',  nombre: 'En reparación', texto: 'Manos a la obra.' },
      { id: 'listo',       nombre: 'Listo',         texto: 'Tu equipo está listo. Escríbeme y quedamos para la entrega.' },
      { id: 'entregado',   nombre: 'Entregado',     texto: 'Trabajo terminado. ¡Gracias por confiar en mí!' }
    ]
  },
  web: {
    nombre: 'Página web', icono: 'lGlobe',
    etapas: [
      { id: 'idea',       nombre: 'Idea',       texto: 'Estamos hablando de lo que necesitas.' },
      { id: 'propuesta',  nombre: 'Propuesta',  texto: 'Tienes la propuesta y el presupuesto abajo.' },
      { id: 'diseno',     nombre: 'Diseño',     texto: 'Estoy diseñando cómo se verá tu web.' },
      { id: 'desarrollo', nombre: 'Desarrollo', texto: 'La estoy construyendo.' },
      { id: 'revision',   nombre: 'Revisión',   texto: 'Revísala y dime qué cambiarías.' },
      { id: 'publicada',  nombre: 'Publicada',  texto: '¡Tu web ya está en internet!' }
    ]
  }
};
