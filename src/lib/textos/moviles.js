/* Textos y datos de la página de reparación de móviles (reparacion-moviles.html y en/phone-screen-repair.html).
   Página: src/lib/paginas/Moviles.svelte

   Reglas de esta página (las pidió Alextoll):
   - Sin precios fijos (dependen del modelo), sin plazos, sin garantías inventadas
     y sin prometer que haya repuestos.
   - Solo cambio de pantalla. Para ofrecer otra reparación en el futuro, añádela a
     REPARACIONES con visible: true (ver abajo). */

export const FONDO = 'assets/img/moviles/fondo-1';   // mismo número que VERSION en tools/imagen-moviles.js

/* ---------- Reparaciones que se ofrecen ----------
   Ahora solo el cambio de pantalla. Para añadir otra más adelante (por ejemplo, la batería):
   copia el bloque, cambia id, nombre y problemas, y pon visible: true. Con más de una visible,
   el formulario muestra un desplegable "¿Qué reparación necesitas?" y las tarjetas de
   problemas se agrupan por reparación. El servidor acepta cualquier id de la lista. */
export const REPARACIONES = [
  {
    id: 'pantalla', visible: true,
    nombre: { es: 'Cambio de pantalla', en: 'Screen replacement' },
    problemas: [
      { id: 'cristal', icono: 'lPhoneCrack', dibujo: 'grieta',
        es: ['Cristal roto', 'Pantallas agrietadas o completamente rotas.'],
        en: ['Cracked glass', 'Cracked or completely shattered screens.'] },
      { id: 'imagen', icono: 'lPhoneOff', dibujo: 'lineas',
        es: ['Pantalla sin imagen', 'Pantallas negras, con manchas o líneas de colores.'],
        en: ['No picture', 'Black screens, screens with blotches or coloured lines.'] },
      { id: 'tactil', icono: 'lTouch', dibujo: 'toque',
        es: ['Táctil que no responde', 'Problemas al pulsar o deslizar el dedo.'],
        en: ['Touch not responding', 'Trouble tapping or swiping with your finger.'] }
    ]
  }
];
export const VISIBLES = REPARACIONES.filter(r => r.visible);

/* Marcas que se sugieren al escribir (se puede poner cualquier otra) */
export const MARCAS = ['Apple (iPhone)', 'Samsung', 'Xiaomi', 'Redmi', 'POCO', 'OPPO', 'realme', 'Motorola', 'Google Pixel', 'Huawei', 'Honor', 'OnePlus', 'vivo', 'Nothing', 'Sony', 'Nokia', 'TCL', 'Alcatel'];

/* ---------- Textos ---------- */
export const TX = {
  es: {
    title: 'Reparación de móviles: cambio de pantalla en Madrid | Alextoll',
    desc: '¿Pantalla rota, negra o que no responde al tacto? Pide tu presupuesto personalizado y sin compromiso para cambiar la pantalla de tu móvil.',
    ogAlt: 'Dos móviles en un fondo oscuro azul y morado, uno con la pantalla rota',
    tag: 'Cambio de pantalla de móviles',
    cta: 'Pedir presupuesto',
    hero: {
      eyebrow: 'Reparación de móviles',
      h1: '<span class="mv-h1-a">¿Pantalla rota?</span> <span class="mv-h1-b">¡Dale una segunda vida a tu <span class="mv-nw">móvil! <span class="mv-emoji" role="img" aria-label="móvil">📱</span></span></span>',
      lede: '¿Se te ha caído el móvil y se ha roto la pantalla? En Alextoll te ayudamos a recuperar tu dispositivo. Solicita tu presupuesto personalizado sin compromiso.',
      como: 'Cómo funciona',
      puntos: [['lFile', 'Presupuesto sin compromiso'], ['lPhone', 'Precio según tu modelo'], ['lUser', 'Trato directo conmigo']]
    },
    prob: {
      eyebrow: 'Cambio de pantalla', h2: '¿Qué problemas solucionamos?',
      lede: 'Estos son los motivos más habituales para cambiar la pantalla. Si no sabes cuál es el tuyo, cuéntamelo en el formulario y lo vemos.',
      pedir: 'Pedir presupuesto por esto'
    },
    pasos: {
      eyebrow: 'Paso a paso', h2: '¿Cómo funciona?',
      lista: [
        ['lChat', 'Cuéntame tu problema', 'Indica la marca, el modelo y el daño de la pantalla.'],
        ['lFile', 'Recibe tu presupuesto', 'Revisaré tu solicitud y te comunicaré el precio.'],
        ['lWrench', 'Cambio de pantalla', 'Una vez aceptado el presupuesto, acordaremos cómo realizar la reparación.']
      ]
    },
    form: {
      eyebrow: 'Presupuesto', h2: 'Pide tu presupuesto',
      lede: 'Rellena el formulario y te respondo por email con el precio para tu modelo. Sin compromiso.',
      noRellenar: 'No rellenar',
      nombre: 'Tu nombre', email: 'Email de contacto', emailHint: 'Te mando el presupuesto aquí.',
      marca: 'Marca del móvil', marcaPh: 'Por ejemplo: Samsung',
      modelo: 'Modelo exacto', modeloPh: 'Por ejemplo: Galaxy A54 5G',
      modeloHint: 'Lo encuentras en Ajustes → Información del teléfono (en iPhone: Ajustes → General → Información).',
      reparacion: '¿Qué reparación necesitas?',
      problema: 'Tipo de problema', elige: 'Elige una opción', varios: 'Varias cosas a la vez', noSe: 'No estoy seguro',
      desc: 'Descripción adicional', opcional: '(opcional)',
      descHint: 'Cómo pasó, qué se ve en la pantalla, si el móvil funciona por lo demás…',
      fotos: 'Fotografías', fotosHint: 'Hasta 3 fotos de la pantalla. Ayudan a darte un presupuesto más exacto.',
      fotosBtn: 'Añadir fotos', fotosBtnMas: 'Añadir otra foto',
      priv: 'He leído y acepto la <a href="privacidad.html">política de privacidad</a>. Uso tus datos y tus fotos solo para darte el presupuesto.',
      enviar: 'Enviar solicitud',
      okTitulo: '¡Solicitud enviada!', otra: 'Enviar otra solicitud',
      info: 'Información importante',
      notas: [
        ['lInfo', 'Sin precios fijos', 'El precio depende de la marca y el modelo de tu móvil, por eso te lo doy después de ver tu solicitud.'],
        ['lMail', 'Te respondo por email', 'Revisaré tu solicitud y te escribiré con el presupuesto.'],
        ['lPhone', 'Solo pantallas', 'De momento me dedico únicamente al cambio de pantalla de móviles.']
      ],
      prefieres: '¿Prefieres escribirme?', asunto: 'Presupuesto%20cambio%20de%20pantalla', escribir: 'Escribir', copiar: 'Copiar'
    },
    servicio: { name: 'Cambio de pantalla de móvil', type: 'Reparación de móviles',
      desc: 'Cambio de pantalla de teléfonos móviles: cristal roto, pantalla sin imagen o táctil que no responde. Presupuesto personalizado y sin compromiso según la marca y el modelo.' }
  },

  en: {
    title: 'Phone screen repair and replacement in Madrid | Alextoll',
    desc: 'Cracked, black or unresponsive screen? Ask for a personalised, no-obligation quote to replace your phone screen. Service in English and Spanish.',
    ogAlt: 'Two phones on a dark blue and purple background, one with a cracked screen',
    tag: 'Phone screen replacement',
    cta: 'Get a quote',
    hero: {
      eyebrow: 'Phone repair',
      h1: '<span class="mv-h1-a">Cracked screen?</span> <span class="mv-h1-b">Give your phone a second <span class="mv-nw">life! <span class="mv-emoji" role="img" aria-label="phone">📱</span></span></span>',
      lede: 'Dropped your phone and broke the screen? At Alextoll we help you get your device back. Ask for your personalised, no-obligation quote.',
      como: 'How it works',
      puntos: [['lFile', 'No-obligation quote'], ['lPhone', 'Price based on your model'], ['lUser', 'You deal with me directly']]
    },
    prob: {
      eyebrow: 'Screen replacement', h2: 'What problems do we fix?',
      lede: 'These are the most common reasons to replace a screen. If you are not sure which one is yours, tell me in the form and we will look at it.',
      pedir: 'Get a quote for this'
    },
    pasos: {
      eyebrow: 'Step by step', h2: 'How does it work?',
      lista: [
        ['lChat', 'Tell me the problem', 'Give me the brand, the model and the damage to the screen.'],
        ['lFile', 'Get your quote', 'I will review your request and let you know the price.'],
        ['lWrench', 'Screen replacement', 'Once you accept the quote, we will agree on how to do the repair.']
      ]
    },
    form: {
      eyebrow: 'Quote', h2: 'Ask for your quote',
      lede: 'Fill in the form and I will email you the price for your model. No obligation.',
      noRellenar: 'Do not fill in',
      nombre: 'Your name', email: 'Contact email', emailHint: 'I will send the quote here.',
      marca: 'Phone brand', marcaPh: 'For example: Samsung',
      modelo: 'Exact model', modeloPh: 'For example: Galaxy A54 5G',
      modeloHint: 'You can find it in Settings → About phone (on iPhone: Settings → General → About).',
      reparacion: 'Which repair do you need?',
      problema: 'Type of problem', elige: 'Choose an option', varios: 'Several things at once', noSe: 'I am not sure',
      desc: 'Additional details', opcional: '(optional)',
      descHint: 'How it happened, what you see on the screen, whether the phone otherwise works…',
      fotos: 'Photos', fotosHint: 'Up to 3 photos of the screen. They help me give you a more accurate quote.',
      fotosBtn: 'Add photos', fotosBtnMas: 'Add another photo',
      priv: 'I have read and accept the <a href="../privacidad.html" hreflang="es">privacy policy</a> (in Spanish). I only use your details and photos to give you the quote.',
      enviar: 'Send request',
      okTitulo: 'Request sent!', otra: 'Send another request',
      info: 'Good to know',
      notas: [
        ['lInfo', 'No fixed prices', 'The price depends on the brand and model of your phone, so I give it to you after seeing your request.'],
        ['lMail', 'I reply by email', 'I will review your request and write to you with the quote.'],
        ['lPhone', 'Screens only', 'For now I only do phone screen replacements.']
      ],
      prefieres: 'Would you rather write to me?', asunto: 'Phone%20screen%20quote', escribir: 'Write', copiar: 'Copy'
    },
    servicio: { name: 'Phone screen replacement', type: 'Phone repair',
      desc: 'Phone screen replacement: cracked glass, no picture or unresponsive touch. Personalised, no-obligation quote based on the brand and model. Service in English and Spanish.' }
  }
};

/* ---------- Dibujos de las tarjetas de problemas (SVG, se animan con static/css/moviles.css) ---------- */
export const MARCO = '<rect class="mv-d-body" x="38" y="8" width="84" height="148" rx="14"/><rect class="mv-d-screen" x="44" y="14" width="72" height="136" rx="9"/><circle class="mv-d-cam" cx="80" cy="20" r="2"/>';
export const DIBUJOS = {
  grieta: `${MARCO}<g class="mv-d-crack"><path pathLength="1" d="M92 52 L82 70 L90 80 L74 104 L78 118 L66 142"/><path pathLength="1" d="M92 52 L104 66 L112 64"/><path pathLength="1" d="M92 52 L98 34 L110 24"/><path pathLength="1" d="M92 52 L70 46 L52 54"/><path pathLength="1" d="M82 70 L60 82 L48 80"/><path pathLength="1" d="M90 80 L108 96 L114 116"/><path pathLength="1" d="M92 52 L84 30 L86 16"/></g><circle class="mv-d-impact" cx="92" cy="52" r="5"/>`,
  lineas: `${MARCO}<g class="mv-d-lines"><rect x="58" y="14" width="2.4" height="136"/><rect x="71" y="14" width="1.6" height="136"/><rect x="88" y="14" width="3" height="136"/><rect x="101" y="14" width="1.6" height="136"/></g><path class="mv-d-blot" d="M62 104c8-6 20-4 24 4s-2 18-12 18-18-14-12-22z"/>`,
  toque: `${MARCO}<g class="mv-d-ui"><rect x="52" y="32" width="56" height="8" rx="4"/><rect x="52" y="48" width="40" height="8" rx="4"/><rect x="52" y="64" width="48" height="8" rx="4"/></g><circle class="mv-d-ring mv-d-ring--1" cx="80" cy="104" r="10"/><circle class="mv-d-ring mv-d-ring--2" cx="80" cy="104" r="10"/><circle class="mv-d-dot" cx="80" cy="104" r="5"/><path class="mv-d-x" d="M96 120l12 12M108 120l-12 12"/>`
};
