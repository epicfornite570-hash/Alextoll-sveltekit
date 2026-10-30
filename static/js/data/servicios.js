/* =========================================================
   SERVICIOS
   ---------------------------------------------------------
   Para añadir un servicio, copia un bloque { ... } y cambia:
   - id:     palabra corta sin espacios ni tildes (se usa por dentro)
   - icon:   uno de los iconos de js/lib/icons.js
   - name:   nombre que se ve
   - text:   una frase explicando qué es
   - items:  lo que incluye (2 o 3 cosas)
   - desde:  precio "desde" en euros (número) o null para no mostrarlo
   - paginas: (opcional) páginas con más información: [['texto', 'archivo.html'], ...]
   El servicio aparece solo en la lista, en el desplegable
   del formulario y en el diagnóstico.
   ========================================================= */
window.AT = window.AT || {};

AT.SERVICIOS = [
  { id:'limpieza', icon:'clean', name:'Limpieza de ordenadores', desde:null, paginas:[['Limpieza y pasta térmica','limpieza-ordenador-madrid.html'],['Quitar virus y publicidad','quitar-virus-ordenador-madrid.html']],
    text:'Limpieza por dentro y por fuera, y limpieza del sistema para que vuelva a ir fluido.',
    items:['Polvo de ventiladores y disipador','Cambio de pasta térmica','Quitar programas basura y virus'] },

  { id:'arreglos', icon:'wrench', name:'Reparaciones y arreglos', desde:null, paginas:[['Reparación de ordenadores','reparacion-ordenadores-madrid.html']],
    text:'Lo que falla, se bloquea o no arranca. Busco la causa antes de cambiar nada.',
    items:['No enciende o no arranca','Pantallazos y reinicios','Teclado, batería o ventilador'] },

  { id:'hardware', icon:'ram', name:'Ampliación de hardware', desde:null, paginas:[['Cambio a SSD','cambiar-disco-ssd-madrid.html'],['Ampliar la RAM','ampliar-memoria-ram-madrid.html'],['Cambiar gráfica o fuente','cambiar-tarjeta-grafica-madrid.html']],
    text:'Más vida para tu equipo con piezas compatibles, sin cambiar de ordenador.',
    items:['Más memoria RAM','Disco duro a SSD','Gráfica, fuente o Wi-Fi'] },

  { id:'so', icon:'os', name:'Sistemas operativos', desde:null, paginas:[['Formatear e instalar Windows o Linux','formatear-ordenador-madrid.html']],
    text:'Instalación limpia, actualización o formateo, con tus archivos guardados antes.',
    items:['Windows 10 y 11','Linux (Ubuntu, Mint…)','Windows y Linux a la vez'] },

  { id:'software', icon:'apps', name:'Programas y software', desde:null,
    text:'Te dejo instalado y configurado lo que vas a usar, listo para trabajar o jugar.',
    items:['Office, navegadores, antivirus','Controladores (drivers)','Impresoras y periféricos'] },

  { id:'optimizacion', icon:'speed', name:'Puesta a punto', desde:null,
    text:'Para el ordenador que tarda una eternidad en encender o se queda pensando.',
    items:['Arranque más rápido','Revisión de temperaturas','Actualizaciones al día'] },

  { id:'copias', icon:'backup', name:'Copias de seguridad', desde:null, paginas:[['Pasar datos al ordenador nuevo','pasar-datos-ordenador-nuevo-madrid.html']],
    text:'Guardo tus fotos y documentos y te paso todo al ordenador nuevo si cambias.',
    items:['Copia a disco externo o nube','Pasar datos de un PC a otro'] },

  { id:'asesoria', icon:'build', name:'Asesoramiento y montaje', desde:null, paginas:[['Te ayudo a elegir ordenador','asesoramiento-comprar-ordenador-madrid.html'],['Montar un PC por piezas','montar-pc-por-piezas-madrid.html']],
    text:'Te ayudo a elegir piezas u ordenador según tu presupuesto y para qué lo quieres.',
    items:['Qué comprar y qué no','Montaje de PC por piezas'] }
];
