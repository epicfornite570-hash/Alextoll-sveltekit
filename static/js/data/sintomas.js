/* =========================================================
   SÍNTOMAS del diagnóstico "¿Qué le pasa a tu ordenador?"
   ---------------------------------------------------------
   - label: lo que pulsa el visitante
   - cause: causa más habitual
   - fix:   qué harías tú
   - svc:   id del servicio que encaja (ver servicios.js)
   ========================================================= */
window.AT = window.AT || {};

AT.SINTOMAS = [
  { icon:'speed',  label:'Va muy lento', cause:'Disco duro antiguo, poca RAM o demasiados programas al arrancar.', fix:'Revisión, limpieza del sistema y, si compensa, cambio a SSD.', svc:'optimizacion' },
  { icon:'fan',    label:'Hace ruido y se calienta', cause:'Polvo acumulado y pasta térmica seca.', fix:'Limpieza interna y cambio de pasta térmica.', svc:'limpieza' },
  { icon:'power',  label:'No enciende o no arranca', cause:'Fuente, batería, disco o sistema dañado.', fix:'Diagnóstico pieza a pieza antes de cambiar nada.', svc:'arreglos' },
  { icon:'bsod',   label:'Pantallazos o se reinicia', cause:'Drivers, memoria o temperatura.', fix:'Pruebas de memoria y temperatura, y reinstalar drivers.', svc:'arreglos' },
  { icon:'shield', label:'Publicidad rara o virus', cause:'Programas no deseados instalados junto con otra descarga.', fix:'Limpieza completa y antivirus bien configurado.', svc:'limpieza' },
  { icon:'os',     label:'Quiero formatear', cause:'El sistema está lleno de restos o quieres empezar de cero.', fix:'Copia de tus archivos e instalación limpia de Windows o Linux.', svc:'so' },
  { icon:'ram',    label:'Quiero que vaya mejor', cause:'El equipo se ha quedado corto para lo que usas.', fix:'Ampliar RAM o poner un SSD. Te digo si merece la pena.', svc:'hardware' },
  { icon:'wifi',   label:'Wi-Fi, impresora o programas', cause:'Drivers o configuración.', fix:'Instalación y configuración de lo que necesites.', svc:'software' }
];
