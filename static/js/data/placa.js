/* =========================================================
   PIEZAS de la placa base interactiva de la cabecera
   ---------------------------------------------------------
   - part: nombre del grupo en el dibujo (data-part="..." en ordenadores.html)
   - x, y: dónde va el punto táctil, en coordenadas del dibujo
           (el dibujo mide 640 x 520)
   - code: rótulo de serigrafía que se ve en la ficha
   - svc:  id del servicio relacionado (ver servicios.js)
   ========================================================= */
window.AT = window.AT || {};

AT.PIEZAS = [
  { part:'fan',  x:265, y:155, code:'CPU_FAN', title:'Ventilador y disipador',
    text:'Si suena como un avión o quema al tocarlo, casi siempre es polvo y pasta térmica seca. Se limpia y vuelve a ir fresco.', svc:'limpieza' },
  { part:'ram',  x:424, y:170, code:'DIMM_A1-B2', title:'Memoria RAM',
    text:'Con 8 GB hoy se queda corto en cuanto abres el navegador con varias pestañas. Subir a 16 GB es de las mejoras más baratas.', svc:'hardware' },
  { part:'m2',   x:280, y:296, code:'M2_1', title:'Disco SSD',
    text:'Pasar de disco duro a SSD es el cambio que más se nota: arranca en segundos y los programas abren al momento.', svc:'hardware' },
  { part:'atx',  x:558, y:160, code:'ATX_24P', title:'Alimentación',
    text:'Si no enciende o se apaga solo, reviso fuente, cables y batería antes de cambiar ninguna pieza.', svc:'arreglos' },
  { part:'io',   x:59,  y:160, code:'I/O', title:'Puertos, Wi-Fi y periféricos',
    text:'USB que no reconocen, Wi-Fi que se corta o una impresora que no imprime: drivers y configuración.', svc:'software' },
  { part:'pcie', x:120, y:369, code:'PCIE_X16', title:'Tarjeta gráfica',
    text:'Para jugar o editar vídeo. Te digo qué gráfica encaja con tu fuente y tu placa, y la monto.', svc:'asesoria' },
  { part:'bios', x:384, y:453, code:'BIOS', title:'Arranque y sistema',
    text:'Si se queda en el logo o dice que no encuentra el sistema, reparo el arranque o instalo Windows o Linux desde cero.', svc:'so' },
  { part:'cmos', x:300, y:460, code:'BAT1', title:'Pila de la placa',
    text:'Si pierde la hora cada vez que lo apagas, suele ser esta pila. Cuesta muy poco y se cambia en minutos.', svc:'arreglos' },
  { part:'sata', x:570, y:333, code:'SATA_0-3', title:'Discos de datos',
    text:'Copia de tus fotos y documentos antes de tocar nada, o pasar todo de un ordenador a otro.', svc:'copias' }
];
