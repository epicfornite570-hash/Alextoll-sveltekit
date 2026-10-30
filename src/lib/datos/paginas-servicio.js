/* =========================================================
   PÁGINAS DE SERVICIO (una por búsqueda de Google)
   ---------------------------------------------------------
   Para añadir una página: copia un bloque, cambia los textos y ejecuta
       npm run build
   Se crea la página <slug>.html, se añade al sitemap y aparece en el pie.

   - slug:      nombre del archivo (sin tildes ni espacios). Incluye la ciudad: ayuda en Google.
   - enlace:    texto corto para los enlaces del pie
   - titulo:    el H1 de la página (lo que la gente busca)
   - seoTitulo: título de la pestaña y de Google (unos 60 caracteres)
   - desc:      descripción para Google (unos 150 caracteres)
   - servicio:  nombre del servicio del formulario (debe existir en static/js/data/servicios.js)
   - mensaje:   texto que aparece escrito al abrir el email
   Escribe para la persona que tiene el problema, no para Google. Nada de precios inventados.
   ========================================================= */
export default [
  {
    slug: 'cambiar-disco-ssd-madrid',
    enlace: 'Cambiar disco duro por SSD',
    titulo: 'Cambiar el disco duro por un SSD en Madrid',
    seoTitulo: 'Cambiar disco duro por SSD en Madrid | Alextoll',
    desc: 'Tu ordenador arrancará en segundos. Paso tu disco duro a un SSD conservando Windows, programas y archivos, o instalo el sistema limpio. Presupuesto antes de empezar.',
    lede: 'Es la mejora que más se nota en un ordenador con disco duro: arranca en segundos y los programas se abren al momento. Y casi siempre puedes conservar todo lo que tienes.',
    servicio: 'Ampliación de hardware',
    mensaje: 'Hola Alextoll, quiero cambiar el disco duro de mi ordenador por un SSD',
    senales: [
      'Tarda varios minutos en encender.',
      'El disco aparece al 100 % en el Administrador de tareas aunque no hagas nada.',
      'Los programas tardan mucho en abrirse.',
      'Se oye el disco trabajar: un rumor constante o pequeños clics.'
    ],
    pasos: [
      ['Compruebo tu equipo', 'Miro qué disco tiene, qué conector usa (SATA o M.2) y qué SSD es compatible.'],
      ['Te digo qué SSD poner', 'Te recomiendo uno de calidad con la capacidad que necesitas. Puedes comprarlo tú o lo consigo yo.'],
      ['Copio todo o instalo limpio', 'Clono el disco para que lo encuentres todo igual, o instalo el sistema desde cero si va lleno de restos.'],
      ['Compruebo y te lo devuelvo', 'Reviso que arranca bien y que el SSD funciona a su velocidad. Tu disco antiguo es tuyo.']
    ],
    incluye: ['Revisión de compatibilidad', 'Montaje del SSD', 'Clonado del disco o instalación limpia', 'Comprobación de velocidad y salud del disco'],
    faq: [
      ['¿Pierdo mis archivos?', 'No. Si clono el disco, lo encuentras todo igual. Si prefieres una instalación limpia, antes hago copia de tus archivos.'],
      ['¿Vale para portátiles?', 'Sí, en casi todos. Algunos muy antiguos o muy finos tienen particularidades; te lo digo antes de empezar.'],
      ['¿Qué capacidad necesito?', 'Para un uso normal, 500 GB suele sobrar. Si guardas muchas fotos, vídeos o juegos, mejor 1 TB.'],
      ['¿Y mi disco antiguo?', 'Te lo devuelvo. Si quieres, lo dejo preparado como disco externo para hacer copias.']
    ],
    relacionadas: ['ampliar-memoria-ram-madrid', 'formatear-ordenador-madrid']
  },
  {
    slug: 'ampliar-memoria-ram-madrid',
    enlace: 'Ampliar la memoria RAM',
    titulo: 'Ampliar la memoria RAM del ordenador en Madrid',
    seoTitulo: 'Ampliar memoria RAM de ordenador o portátil en Madrid | Alextoll',
    desc: 'Si tu ordenador se atasca con varias pestañas o programas abiertos, más RAM le da aire. Compruebo qué admite tu equipo, la instalo y la pruebo. Presupuesto antes de empezar.',
    lede: 'Si el ordenador se atasca con varias pestañas abiertas o al cambiar de programa, más memoria RAM le da aire sin tener que cambiar de equipo.',
    servicio: 'Ampliación de hardware',
    mensaje: 'Hola Alextoll, quiero ampliar la memoria RAM de mi ordenador',
    senales: [
      'Se queda pensando con muchas pestañas del navegador abiertas.',
      'Al cambiar de un programa a otro tarda en reaccionar.',
      'La memoria aparece casi llena en el Administrador de tareas.',
      'Juegos o programas de edición van a tirones.'
    ],
    pasos: [
      ['Miro qué RAM admite', 'Compruebo el tipo de memoria (DDR3, DDR4 o DDR5), la velocidad, las ranuras libres y el máximo que admite la placa.'],
      ['Te digo cuánta poner', 'Para la mayoría, 16 GB es lo justo hoy. Te digo si compensa y qué módulos comprar.'],
      ['La instalo', 'Monto los módulos y compruebo que el equipo los reconoce y funcionan en doble canal cuando se puede.'],
      ['Prueba de memoria', 'Paso un test para asegurarme de que no hay errores antes de devolvértelo.']
    ],
    incluye: ['Comprobación de compatibilidad', 'Montaje de los módulos', 'Configuración en doble canal cuando se puede', 'Test de memoria'],
    faq: [
      ['¿Mi portátil admite más RAM?', 'Depende del modelo: en algunos va soldada a la placa y no se puede ampliar. Lo compruebo con el modelo exacto antes de que compres nada.'],
      ['¿Cuánta RAM necesito?', 'Para navegar, ofimática y estudiar, 16 GB va sobrado. Para juegos actuales o edición de vídeo, 16 o 32 GB.'],
      ['¿Puedo mezclar módulos distintos?', 'A veces funciona, pero no es lo ideal. Te digo si los que tienes se pueden aprovechar.'],
      ['¿Se borra algo al ampliar la RAM?', 'No. Ampliar la memoria no toca tus archivos ni tus programas.']
    ],
    relacionadas: ['cambiar-disco-ssd-madrid', 'limpieza-ordenador-madrid']
  },
  {
    slug: 'formatear-ordenador-madrid',
    enlace: 'Formatear e instalar Windows o Linux',
    titulo: 'Formatear el ordenador e instalar Windows o Linux en Madrid',
    seoTitulo: 'Formatear ordenador e instalar Windows o Linux en Madrid | Alextoll',
    desc: 'Instalación limpia de Windows 10, Windows 11 o Linux con tus archivos guardados antes. Drivers, actualizaciones y programas listos para usar. Presupuesto antes de empezar.',
    lede: 'Cuando el sistema va lleno de programas, errores o virus, una instalación limpia lo deja como el primer día. Tus archivos se guardan antes de tocar nada.',
    servicio: 'Sistemas operativos',
    mensaje: 'Hola Alextoll, quiero formatear mi ordenador',
    senales: [
      'Tarda mucho en arrancar aunque el disco sea bueno.',
      'Salen anuncios, ventanas raras o programas que no instalaste.',
      'Errores constantes o actualizaciones que fallan.',
      'Vas a vender o regalar el ordenador y quieres dejarlo limpio.'
    ],
    pasos: [
      ['Copia de tus archivos', 'Guardo tus fotos, documentos y lo que me digas antes de tocar nada.'],
      ['Instalación limpia', 'Instalo Windows 10, Windows 11 o la distribución de Linux que prefieras, con las últimas actualizaciones.'],
      ['Drivers y programas', 'Dejo instalados los controladores y los programas que uses: navegador, Office, antivirus, impresora…'],
      ['Te devuelvo tus archivos', 'Coloco tus archivos donde estaban y, si cambias de sistema, te enseño lo nuevo.']
    ],
    incluye: ['Copia de seguridad de tus archivos', 'Instalación del sistema', 'Controladores (drivers) y actualizaciones', 'Programas básicos configurados'],
    faq: [
      ['¿Necesito una licencia de Windows?', 'Si el equipo ya tenía Windows activado, normalmente se reactiva solo. Si no, te explico las opciones legales.'],
      ['¿Puedo tener Windows y Linux a la vez?', 'Sí. Instalo los dos y eliges cuál arrancar al encender.'],
      ['¿Qué Linux me recomiendas?', 'Para empezar, Linux Mint o Ubuntu: son sencillos y funcionan bien en equipos con algunos años.'],
      ['¿Cuánto tarda?', 'Normalmente uno o dos días, según la cantidad de archivos que haya que copiar.']
    ],
    relacionadas: ['cambiar-disco-ssd-madrid', 'limpieza-ordenador-madrid']
  },
  {
    slug: 'limpieza-ordenador-madrid',
    enlace: 'Limpieza y pasta térmica',
    titulo: 'Limpieza de ordenador y cambio de pasta térmica en Madrid',
    seoTitulo: 'Limpieza de ordenador y pasta térmica en Madrid | Alextoll',
    desc: '¿Tu ordenador hace ruido o se calienta? Limpieza interna de ventiladores y disipador, pasta térmica nueva y revisión de temperaturas. Presupuesto antes de empezar.',
    lede: 'El polvo en los ventiladores y la pasta térmica seca hacen que el ordenador se caliente, haga ruido y vaya más lento. Una limpieza a fondo lo arregla.',
    servicio: 'Limpieza de ordenadores',
    mensaje: 'Hola Alextoll, mi ordenador hace ruido y se calienta',
    senales: [
      'El ventilador suena fuerte aunque no hagas nada pesado.',
      'El portátil quema por debajo o en el teclado.',
      'Se apaga solo o se vuelve lento al rato de usarlo.',
      'Hace años que nadie lo abre por dentro.'
    ],
    pasos: [
      ['Lo abro y reviso', 'Miro el estado de ventiladores y disipador, y anoto las temperaturas antes de limpiar.'],
      ['Limpieza interna', 'Quito el polvo de ventiladores, rejillas y disipador con las herramientas adecuadas.'],
      ['Pasta térmica nueva', 'Cambio la pasta térmica del procesador, y la de la gráfica si hace falta.'],
      ['Limpieza del sistema y prueba', 'Quito programas basura del arranque y compruebo que las temperaturas han bajado.']
    ],
    incluye: ['Limpieza de ventiladores y disipador', 'Cambio de pasta térmica', 'Temperaturas antes y después', 'Limpieza de programas de inicio'],
    faq: [
      ['¿Cada cuánto hay que limpiarlo?', 'Depende de dónde esté, pero cada uno o dos años es buena idea. Con mascotas o mucho polvo, antes.'],
      ['¿Lo puedo hacer yo con aire comprimido?', 'Por fuera ayuda, pero el polvo apelmazado del disipador y la pasta térmica seca solo se arreglan abriéndolo.'],
      ['¿Sirve para portátiles?', 'Sí. En los portátiles es donde más se nota, porque tienen menos espacio para refrigerarse.'],
      ['¿Se borra algo?', 'No. La limpieza física no toca tus archivos.']
    ],
    relacionadas: ['reparacion-ordenadores-madrid', 'formatear-ordenador-madrid']
  },
  {
    slug: 'reparacion-ordenadores-madrid',
    enlace: 'Reparación de ordenadores',
    titulo: 'Reparación de ordenadores y portátiles en Madrid',
    seoTitulo: 'Reparación de ordenadores y portátiles en Madrid | Alextoll',
    desc: '¿No enciende, se reinicia o da pantallazos azules? Diagnóstico pieza a pieza y presupuesto cerrado antes de reparar. Ordenadores de sobremesa y portátiles.',
    lede: 'No enciende, se reinicia, da pantallazos azules o se apaga solo. Busco la causa pieza a pieza antes de cambiar nada, y te digo el precio antes de arreglarlo.',
    servicio: 'Reparaciones y arreglos',
    mensaje: 'Hola Alextoll, mi ordenador tiene un problema y querría repararlo',
    senales: [
      'No enciende o se queda en el logo.',
      'Pantallazos azules o reinicios sin aviso.',
      'Se apaga solo al rato de usarlo.',
      'Teclado, batería o ventilador que no funcionan bien.'
    ],
    pasos: [
      ['Me cuentas qué pasa', 'Qué hace, desde cuándo y si ha pasado algo antes: un golpe, un líquido, una actualización.'],
      ['Diagnóstico', 'Pruebo fuente, memoria, disco y temperaturas hasta dar con la pieza o el fallo de software.'],
      ['Presupuesto cerrado', 'Te explico qué le pasa y cuánto cuesta. Si no te convence, no se hace nada.'],
      ['Reparación y prueba', 'Lo arreglo, lo pruebo a fondo y te lo devuelvo funcionando.']
    ],
    incluye: ['Diagnóstico pieza a pieza', 'Presupuesto antes de reparar', 'Reparación o cambio de piezas', 'Prueba final completa'],
    faq: [
      ['¿Cuánto cuesta el diagnóstico?', 'Te lo digo antes de empezar. Contarme el problema y pedir presupuesto no cuesta nada.'],
      ['¿Merece la pena arreglarlo?', 'Si la reparación cuesta casi lo que un equipo nuevo, te lo digo. También puedes usar el asesor de la web.'],
      ['¿Puedo recuperar mis archivos si no enciende?', 'Muchas veces sí: aunque el ordenador no arranque, el disco suele estar bien y se pueden sacar los datos.'],
      ['¿Reparas portátiles y sobremesa?', 'Sí, los dos, con Windows o Linux.']
    ],
    relacionadas: ['limpieza-ordenador-madrid', 'cambiar-disco-ssd-madrid']
  },
  {
    slug: 'montar-pc-por-piezas-madrid',
    enlace: 'Montar un PC por piezas',
    titulo: 'Montar un PC por piezas en Madrid',
    seoTitulo: 'Montar PC por piezas en Madrid (gaming o trabajo) | Alextoll',
    desc: 'Te ayudo a elegir las piezas según tu presupuesto y para qué lo quieres, monto el PC, instalo Windows y lo dejo probado. Para jugar, estudiar o trabajar.',
    lede: 'Un PC montado por piezas rinde más por el mismo dinero que uno de tienda. Te ayudo a elegir cada pieza, lo monto con cuidado y te lo entrego listo para usar.',
    servicio: 'Asesoramiento y montaje',
    mensaje: 'Hola Alextoll, quiero montar un PC por piezas',
    senales: [
      'Quieres un PC para jugar y los de tienda no te convencen.',
      'Tienes un presupuesto y no sabes qué piezas encajan.',
      'Ya has comprado las piezas y te da miedo montarlo tú.',
      'Necesitas un equipo para editar, programar o estudiar.'
    ],
    pasos: [
      ['Me cuentas qué quieres', 'Para qué lo vas a usar, a qué juegos o programas, y cuánto quieres gastar.'],
      ['Elegimos las piezas', 'Te propongo una lista compatible y equilibrada, sin gastar de más donde no se nota. La compras tú o la consigo yo.'],
      ['Lo monto', 'Monto todas las piezas, ordeno los cables para que circule bien el aire y configuro la BIOS.'],
      ['Sistema y pruebas', 'Instalo Windows o Linux y los controladores, y paso pruebas de temperatura y estabilidad antes de dártelo.']
    ],
    incluye: ['Lista de piezas compatible con tu presupuesto', 'Montaje y organización de cables', 'Instalación del sistema y controladores', 'Pruebas de temperatura y estabilidad'],
    faq: [
      ['¿Puedo comprar yo las piezas?', 'Sí. Te paso la lista y tú las compras donde quieras, o las consigo yo y las incluyo en el presupuesto.'],
      ['¿Y si ya tengo las piezas?', 'Perfecto: reviso que sean compatibles y lo monto. Si falta algo, te lo digo antes de empezar.'],
      ['¿Cuánto cuesta un PC para jugar?', 'Depende de los juegos y de la calidad que quieras. Dime tu presupuesto y te digo qué se puede montar con él.'],
      ['¿Cuándo puedes hacerlo?', 'Sobre todo los fines de semana. Escríbeme cuando quieras y quedamos el día que mejor te venga.']
    ],
    relacionadas: ['asesoramiento-comprar-ordenador-madrid', 'cambiar-tarjeta-grafica-madrid']
  },
  {
    slug: 'asesoramiento-comprar-ordenador-madrid',
    enlace: 'Te ayudo a elegir ordenador',
    titulo: '¿Qué ordenador comprar? Te ayudo a elegir en Madrid',
    seoTitulo: 'Qué ordenador o portátil comprar: asesoramiento en Madrid | Alextoll',
    desc: '¿No sabes qué ordenador o portátil comprar? Te digo cuál te conviene según tu uso y tu presupuesto, sin comisiones de tienda. Y si compensa mejorar el que tienes.',
    lede: 'Entre tantos modelos es fácil pagar de más o quedarse corto. Me cuentas para qué lo quieres y cuánto quieres gastar, y te digo qué comprar y qué evitar.',
    servicio: 'Asesoramiento y montaje',
    mensaje: 'Hola Alextoll, quiero comprar un ordenador y no sé cuál elegir',
    senales: [
      'Tu ordenador va lento y dudas entre arreglarlo o comprar otro.',
      'Ves portátiles parecidos con precios muy distintos.',
      'No sabes cuánta RAM, qué procesador o qué disco necesitas.',
      'Es para alguien que no entiende de informática y no quieres equivocarte.'
    ],
    pasos: [
      ['Me cuentas tu uso', 'Para qué lo vas a usar, dónde (casa, clase, viajes) y cuánto quieres gastar.'],
      ['Miro si compensa mejorar el tuyo', 'A veces un SSD y más RAM dejan tu ordenador como nuevo por mucho menos dinero.'],
      ['Te propongo opciones', 'Dos o tres modelos que encajan, explicados sin tecnicismos, y lo que no merece la pena pagar.'],
      ['Te lo dejo listo', 'Si quieres, cuando lo tengas lo configuro y te paso tus archivos del ordenador antiguo.']
    ],
    incluye: ['Recomendación según tu uso y presupuesto', 'Comparativa sencilla de modelos', 'Valoración de si compensa mejorar el actual', 'Configuración y paso de datos (opcional)'],
    faq: [
      ['¿Me cobras comisión por lo que compre?', 'No. No vendo ordenadores: te recomiendo lo que te conviene a ti, lo compres donde lo compres.'],
      ['¿Portátil o sobremesa?', 'Si lo vas a mover, portátil. Si es para jugar o trabajar siempre en el mismo sitio, un sobremesa rinde más por el mismo dinero.'],
      ['¿Me ayudas a pasar mis cosas al nuevo?', 'Sí: fotos, documentos, correo y programas. Lo dejo todo como lo tenías.'],
      ['¿Cuándo puedes hacerlo?', 'Sobre todo los fines de semana. Escríbeme cuando quieras y te contesto.']
    ],
    relacionadas: ['montar-pc-por-piezas-madrid', 'pasar-datos-ordenador-nuevo-madrid']
  },
  {
    slug: 'cambiar-tarjeta-grafica-madrid',
    enlace: 'Cambiar gráfica, fuente o Wi-Fi',
    titulo: 'Cambiar la tarjeta gráfica, la fuente o el Wi-Fi en Madrid',
    seoTitulo: 'Cambiar tarjeta gráfica o fuente del PC en Madrid | Alextoll',
    desc: 'Compruebo qué gráfica cabe en tu PC y si la fuente la aguanta, la instalo con sus controladores y la pruebo. También fuentes, tarjetas Wi-Fi y otras piezas.',
    lede: 'Una gráfica nueva puede darle otra vida a tu PC para jugar o editar. Antes de comprarla, compruebo que cabe, que tu fuente la aguanta y que no se va a quedar limitada.',
    servicio: 'Ampliación de hardware',
    mensaje: 'Hola Alextoll, quiero cambiar la tarjeta gráfica (u otra pieza) de mi PC',
    senales: [
      'Los juegos nuevos van a tirones o tienes que bajar todo al mínimo.',
      'Quieres una gráfica nueva y no sabes si tu fuente la aguanta.',
      'El PC se apaga solo al jugar (a veces es la fuente).',
      'El Wi-Fi va lento o se corta y quieres una tarjeta mejor.'
    ],
    pasos: [
      ['Reviso tu PC', 'Miro la fuente, el espacio de la caja, la placa y el procesador para saber qué encaja.'],
      ['Te digo qué comprar', 'Te recomiendo una pieza equilibrada con tu equipo, para no pagar por potencia que no vas a aprovechar.'],
      ['La instalo', 'Monto la pieza, conecto bien la alimentación e instalo los controladores limpios.'],
      ['Pruebo que va bien', 'Paso pruebas de rendimiento y temperatura para asegurarme de que todo funciona estable.']
    ],
    incluye: ['Comprobación de compatibilidad y de la fuente', 'Montaje de la pieza', 'Controladores limpios', 'Pruebas de rendimiento y temperatura'],
    faq: [
      ['¿Mi fuente aguanta una gráfica nueva?', 'Depende de la potencia y la calidad de la fuente. Lo compruebo antes de que compres nada.'],
      ['¿Mi procesador limitará la gráfica?', 'Puede pasar si son muy distintos. Te digo si compensa o si conviene cambiar algo más.'],
      ['¿Qué piezas puedes cambiar?', 'Gráfica, fuente, RAM, discos, Wi-Fi, ventiladores, disipador… casi cualquier pieza de un sobremesa, y RAM, disco y batería en muchos portátiles.'],
      ['¿Cuándo puedes hacerlo?', 'Sobre todo los fines de semana. Escríbeme cuando quieras y quedamos.']
    ],
    relacionadas: ['montar-pc-por-piezas-madrid', 'ampliar-memoria-ram-madrid']
  },
  {
    slug: 'pasar-datos-ordenador-nuevo-madrid',
    enlace: 'Pasar datos al ordenador nuevo',
    titulo: 'Pasar tus datos al ordenador nuevo y copias de seguridad en Madrid',
    seoTitulo: 'Pasar datos a un ordenador nuevo en Madrid | Alextoll',
    desc: '¿Cambias de ordenador en Madrid? Paso tus fotos, documentos, correo y favoritos al nuevo y dejo una copia de seguridad de tus archivos antes de empezar.',
    lede: 'Cambiar de ordenador no debería significar perder tus fotos ni pasarte un día configurándolo todo. Te lo paso todo al nuevo y te dejo copias para que estés tranquilo.',
    servicio: 'Copias de seguridad',
    mensaje: 'Hola Alextoll, quiero pasar mis datos a un ordenador nuevo',
    senales: [
      'Te has comprado un ordenador nuevo y el viejo tiene todas tus cosas.',
      'Nunca has hecho una copia de tus fotos.',
      'Tu ordenador hace cosas raras y temes perder los archivos.',
      'Quieres que las copias se hagan solas sin acordarte.'
    ],
    pasos: [
      ['Vemos qué quieres conservar', 'Fotos, documentos, correo, favoritos del navegador, contraseñas guardadas y programas.'],
      ['Hago copia de todo', 'Antes de tocar nada, guardo una copia en un disco externo o en la nube.'],
      ['Lo paso al nuevo', 'Coloco cada cosa en su sitio y configuro el ordenador nuevo para que lo encuentres todo como antes.'],
      ['Copias automáticas', 'Si quieres, dejo programadas copias de seguridad para que se hagan solas.']
    ],
    incluye: ['Copia de seguridad antes de empezar', 'Paso de archivos, correo y favoritos', 'Configuración del ordenador nuevo', 'Copias automáticas (opcional)'],
    faq: [
      ['¿Y si el ordenador viejo no enciende?', 'Muchas veces el disco está bien y se pueden sacar los datos. Te lo digo después de revisarlo.'],
      ['¿Dónde se guardan las copias?', 'En un disco externo, en la nube (Google Drive, OneDrive…) o en los dos. Te explico las ventajas de cada uno.'],
      ['¿Borras el ordenador viejo?', 'Si vas a venderlo o regalarlo, lo dejo borrado de forma segura para que nadie pueda recuperar tus datos.'],
      ['¿Cuándo puedes hacerlo?', 'Sobre todo los fines de semana. Escríbeme cuando quieras y quedamos.']
    ],
    relacionadas: ['asesoramiento-comprar-ordenador-madrid', 'formatear-ordenador-madrid']
  },
  {
    slug: 'quitar-virus-ordenador-madrid',
    enlace: 'Quitar virus y publicidad',
    titulo: 'Quitar virus, publicidad y programas basura en Madrid',
    seoTitulo: 'Quitar virus y programas basura del ordenador en Madrid | Alextoll',
    desc: '¿Te salen anuncios, el navegador abre páginas solas o el ordenador va lentísimo? Quito virus, publicidad y programas basura sin perder tus archivos.',
    lede: 'Ventanas de publicidad, un navegador que abre páginas que no has pedido o un ordenador que de repente va lentísimo. Lo limpio a fondo sin perder tus archivos.',
    servicio: 'Limpieza de ordenadores',
    mensaje: 'Hola Alextoll, creo que mi ordenador tiene virus o publicidad',
    senales: [
      'Te salen anuncios o ventanas aunque no estés navegando.',
      'El navegador tiene una página de inicio o un buscador que no elegiste.',
      'Hay programas que no recuerdas haber instalado.',
      'El ventilador suena y va lento sin hacer nada.'
    ],
    pasos: [
      ['Copia de tus archivos', 'Lo primero, guardo tus fotos y documentos por si acaso.'],
      ['Análisis a fondo', 'Busco virus, publicidad y programas basura con varias herramientas, también en el navegador.'],
      ['Limpieza', 'Elimino todo lo que sobra y dejo el navegador como debe estar.'],
      ['Protección', 'Dejo Windows actualizado y protegido, y te explico cómo evitar que vuelva a pasar.']
    ],
    incluye: ['Copia de seguridad previa', 'Eliminación de virus y publicidad', 'Limpieza del navegador y del inicio', 'Windows actualizado y protegido'],
    faq: [
      ['¿Tengo que formatear?', 'Casi nunca. Normalmente se limpia sin reinstalar. Si el sistema está muy dañado, te lo digo y lo hacemos guardando tus archivos.'],
      ['¿Necesito un antivirus de pago?', 'Para la mayoría, el de Windows bien configurado es suficiente. Te digo si en tu caso compensa otro.'],
      ['¿Pierdo mis archivos?', 'No. Antes de limpiar hago copia de lo importante.'],
      ['¿Cuándo puedes hacerlo?', 'Sobre todo los fines de semana. Muchas veces se puede hacer en remoto, sin moverte de casa.']
    ],
    relacionadas: ['limpieza-ordenador-madrid', 'formatear-ordenador-madrid']
  }
];
