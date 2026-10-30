/* Textos de la página de diseño web (webs.html y en/web-design.html).
   Página: src/lib/paginas/Webs.svelte */

/* ---------- Precios orientativos (los mismos en los dos idiomas) ---------- */
export const PRECIOS = { simple: 99, pro: 229 };

/* ---------- Textos ----------
   PREGUNTAS: REVISAR: son respuestas razonables pero no las has confirmado tú
   (sobre todo la del dominio y el alojamiento). Cámbialas si trabajas de otra forma. */
export const TX = {
  es: {
    title: 'Diseño de páginas web para pequeños negocios en Madrid | Alextoll',
    desc: `Webs modernas, rápidas y bonitas para pequeños negocios y profesionales en Madrid. Trato directo y presupuesto claro, desde ${PRECIOS.simple} €.`,
    euros: (n) => `${n} €`, desde: 'Desde', quiero: (n) => `Quiero la ${n}`,
    planes: [
      { id: 'simple', nombre: 'Simple', valor: `Web Simple (desde ${PRECIOS.simple} €)`, lema: 'Todo lo esencial para empezar.',
        incluye: ['Diseño moderno y responsive', 'Hasta 5 secciones', 'Formulario de contacto', 'WhatsApp integrado', 'Optimización básica (velocidad y Google)'] },
      { id: 'pro', nombre: 'Pro', valor: `Web Pro (desde ${PRECIOS.pro} €)`, destacado: 'Más completa', lema: 'Más funcionalidades y más personalización.',
        incluye: ['Diseño personalizado', 'Hasta 10 secciones', 'Formulario y WhatsApp', 'Animaciones modernas', 'Optimización SEO básica', 'Asesoramiento incluido'] }
    ],
    planTitulo: 'Tu negocio, en buenas manos',
    preguntas: [
      ['¿Qué necesito para empezar?', 'Solo una idea de lo que quieres. Si tienes logo, fotos o textos, perfecto; si no, te ayudo a prepararlos.'],
      ['¿Qué es una «sección» en los planes?', 'Un bloque de contenido dentro de la web, como la presentación de tu negocio, tus servicios o el contacto. No es una página independiente: si necesitas varias páginas, lo vemos en el presupuesto.'],
      ['¿Cuánto se tarda?', 'Depende del contenido y de lo rápido que lo tengamos todo. Al empezar te doy una fecha aproximada y te enseño avances para que opines.'],
      ['¿El dominio y el alojamiento están incluidos?', 'No van en el precio de la web porque se pagan cada año. Te ayudo a elegirlos y a configurarlos, y quedan a tu nombre.'],
      ['¿Podré cambiar cosas después?', 'Sí. Cuando necesites cambiar textos, fotos o precios, me escribes y lo hago. También puedo encargarme del mantenimiento.'],
      ['¿Saldrá mi web en Google?', 'La preparo para que Google la entienda bien: títulos, velocidad y versión para móvil. Salir arriba depende también de otras cosas, como tu ficha de Google y las reseñas, y te explico cómo mejorarlo.'],
      ['Ya tengo una web, ¿puedes mejorarla?', 'Claro. Puedo renovarla entera o hacerle cambios concretos. Cuéntame qué tienes y qué te gustaría mejorar.']
    ],
    ejemplos: [
      { id: 'brasa', cat: 'Restaurantes y bares', txt: 'Webs con estilo, carta digital y reservas.', dominio: 'labrasa.ejemplo', nombre: 'restaurante La Brasa' },
      { id: 'nativa', cat: 'Estudios y servicios locales', txt: 'Para centros, profesionales y negocios de barrio.', dominio: 'nativa.ejemplo', nombre: 'estudio de yoga Nativa' },
      { id: 'nord', cat: 'Tiendas y marcas personales', txt: 'Para pequeñas tiendas online y proyectos personales.', dominio: 'nord.ejemplo', nombre: 'tienda de decoración Nord' }
    ],
    verEjemplo: 'Ver ejemplo', ejemploDe: 'Ejemplo de web', ficticio: 'negocio ficticio', ejemploDiseno: 'Ejemplo de diseño', cerrarEjemplo: 'Cerrar el ejemplo',
    teGusta: '<b>¿Te gusta este estilo?</b> Puedo hacer algo así, adaptado a tu negocio.', cuentame: 'Cuéntame tu idea',
    hero: {
      eyebrow: 'Webs modernas para negocios reales', h1: 'Tu negocio merece una web <span class="silver">que parezca profesional.</span>',
      lede: 'Diseño webs modernas, limpias y efectivas para pequeños negocios y proyectos personales. Trato directo, buen diseño y presupuesto accesible.',
      verIncluye: 'Ver qué incluye', puntos: ['Diseño cuidado', 'Trato directo', 'Presupuesto claro'],
      laptop: 'Sabores que conectan', tablet: 'Equilibrio para tu día'
    },
    ej: { eyebrow: 'Ejemplos', h2: 'Webs que se ven modernas desde el primer vistazo', nota: 'Diseños de ejemplo con negocios inventados. Así podría verse la tuya: pulsa «Ver ejemplo» para verla por dentro.' },
    inc: {
      eyebrow: 'Qué incluye', h2: 'Todo lo necesario para que tu web funcione bien',
      feats: [['lDevices', 'Diseño responsive', 'Se ve perfecta en el móvil, la tablet y el ordenador.'], ['lMail', 'Formulario de contacto', 'Para que te escriban fácilmente desde tu web, y te llegue al correo.'],
        ['lWa', 'WhatsApp integrado', 'Tus clientes te escriben a tu WhatsApp con un toque, directamente desde tu web.'], ['lSparkle', 'Animaciones modernas', 'Detalles sutiles que hacen la experiencia más atractiva, sin marear.']],
      extras: [['lLayout', 'Estructura clara'], ['lPen', 'Buen diseño visual'], ['lUsers', 'Trato directo conmigo'], ['lRefresh', 'Cambios cuando los necesites']]
    },
    pre: {
      eyebrow: 'Precios orientativos', h2: 'Opciones simples y claras', lede: 'Cada proyecto es diferente, por eso ofrezco opciones flexibles que se ajustan a lo que necesitas.',
      nota: 'El presupuesto final depende del contenido y de lo que necesites.',
      mant: '¿Ya tienes web? También hago <b>cambios y mantenimiento</b>.', mantLink: 'Cuéntame qué necesitas', mantValor: 'Cambios o mantenimiento de una web'
    },
    pro: {
      eyebrow: 'Cómo trabajo', h2: 'Me cuentas tu idea y la convertimos en una web real',
      ai: 'Trabajo con herramientas modernas para ir más rápido, pero cada web se revisa y se ajusta contigo.',
      pasos: [['lChat', 'Me cuentas', 'Hablamos de tu idea, tus objetivos y lo que necesitas.'], ['lFile', 'La creo', 'Diseño una propuesta adaptada a tu negocio.'],
        ['lSliders', 'La ajustamos', 'La revisamos juntos y hago los cambios que necesites.'], ['lGlobe', 'Online', 'Tu web publicada y lista para recibir visitas y clientes.']]
    },
    faq: { eyebrow: 'Preguntas frecuentes', h2: 'Lo que suelen preguntarme' },
    cont: {
      eyebrow: 'Contacto rápido', h2: 'Si tienes una idea, la vemos',
      txt: 'Cuéntame tu proyecto, aunque sea solo una idea. Te asesoro sin compromiso y vemos la mejor opción para tu negocio.',
      email: 'Escríbeme un email', asunto: 'Quiero%20una%20web'
    },
    form: {
      noRellenar: 'No rellenar', borrador: 'He recuperado lo que estabas escribiendo.', deCero: 'Empezar de cero',
      nombre: 'Nombre', contacto: 'Teléfono o email', interesa: '¿Qué te interesa?', noSe: ['No lo sé', 'No lo sé, que me aconseje'],
      idea: 'Tu idea', hint: 'A qué se dedica tu negocio, si ya tienes web o dominio y alguna web que te guste.',
      priv: 'He leído y acepto la <a href="privacidad.html">política de privacidad</a>. Uso tus datos solo para responderte.',
      enviar: 'Enviar mensaje', escribir: 'Escribir', copiar: 'Copiar', sinCompromiso: 'Sin compromiso',
      promesa: 'Te respondo con una propuesta y un presupuesto claro antes de empezar.', asuntoForm: 'Web para negocio'
    },
    servicio: { name: 'Diseño de páginas web para pequeños negocios', type: 'Diseño web', area: 'España',
      desc: 'Webs modernas, rápidas y adaptadas al móvil para pequeños negocios, profesionales y proyectos personales. Incluye formulario de contacto y un botón de WhatsApp para los clientes de tu negocio.',
      oferta: (p) => `Desde ${PRECIOS[p.id]} €. ${p.lema}`, nombreOferta: (p) => `Web ${p.nombre}` },
    enlaces: [['index.html', 'Inicio'], ['#ejemplos', 'Ejemplos'], ['#incluye', 'Qué incluye'], ['#precios', 'Precios'], ['#proceso', 'Cómo trabajo'], ['#preguntas', 'FAQ'], ['#contacto', 'Contacto']],
    tag: 'Webs modernas y accesibles'
  },

  en: {
    title: 'Website design for small businesses in Madrid | Alextoll',
    desc: `Modern, fast and good-looking websites for small businesses and freelancers in Madrid. Direct contact, in English, and a clear quote, from €${PRECIOS.simple}.`,
    euros: (n) => `€${n}`, desde: 'From', quiero: (n) => `I want the ${n} plan`,
    planes: [
      { id: 'simple', nombre: 'Simple', valor: `Simple plan (from €${PRECIOS.simple})`, lema: 'Everything you need to get started.',
        incluye: ['Modern, responsive design', 'Up to 5 sections', 'Contact form', 'WhatsApp button', 'Basic optimisation (speed and Google)'] },
      { id: 'pro', nombre: 'Pro', valor: `Pro plan (from €${PRECIOS.pro})`, destacado: 'Most complete', lema: 'More features and more personalisation.',
        incluye: ['Custom design', 'Up to 10 sections', 'Form and WhatsApp', 'Modern animations', 'Basic SEO optimisation', 'Advice included'] }
    ],
    planTitulo: 'Your business, in good hands',
    preguntas: [
      ['What do I need to get started?', 'Just an idea of what you want. If you have a logo, photos or text, great; if not, I help you prepare them.'],
      ['What is a "section" in the plans?', 'A block of content within the website, such as the introduction to your business, your services or the contact details. It is not a separate page: if you need several pages, we cover that in the quote.'],
      ['How long does it take?', 'It depends on the content and how quickly we have everything ready. When we start I give you a rough date and show you progress so you can give feedback.'],
      ['Are the domain and hosting included?', 'They are not included in the website price because they are paid yearly. I help you choose and set them up, and they stay in your name.'],
      ['Can I change things later?', 'Yes. Whenever you need to change text, photos or prices, just write to me and I will do it. I can also take care of maintenance.'],
      ['Will my website show up on Google?', 'I build it so Google understands it well: titles, speed and a mobile version. Ranking high also depends on other things, such as your Google Business Profile and reviews, and I explain how to improve it.'],
      ['I already have a website, can you improve it?', 'Of course. I can redo it completely or make specific changes. Tell me what you have and what you would like to improve.'],
      ['Can my website be in English and Spanish?', 'Yes. I can build it in both languages, with a button to switch between them, like this one.']
    ],
    ejemplos: [
      { id: 'brasa', cat: 'Restaurants and bars', txt: 'Stylish websites with a digital menu and bookings.', dominio: 'labrasa.example', nombre: 'La Brasa restaurant' },
      { id: 'nativa', cat: 'Studios and local services', txt: 'For studios, professionals and neighbourhood businesses.', dominio: 'nativa.example', nombre: 'Nativa yoga studio' },
      { id: 'nord', cat: 'Shops and personal brands', txt: 'For small online shops and personal projects.', dominio: 'nord.example', nombre: 'Nord home decor shop' }
    ],
    verEjemplo: 'See example', ejemploDe: 'Website example', ficticio: 'fictional business', ejemploDiseno: 'Design example', cerrarEjemplo: 'Close the example',
    teGusta: '<b>Like this style?</b> I can make something like it, tailored to your business.', cuentame: 'Tell me your idea',
    hero: {
      eyebrow: 'Modern websites for real businesses', h1: 'Your business deserves a website <span class="silver">that looks professional.</span>',
      lede: 'I design modern, clean and effective websites for small businesses and personal projects. Direct contact, in English, good design and an affordable quote.',
      verIncluye: 'See what\'s included', puntos: ['Careful design', 'Direct contact', 'Clear pricing'],
      laptop: 'Flavours that connect', tablet: 'Balance for your day'
    },
    ej: { eyebrow: 'Examples', h2: 'Websites that look modern at first glance', nota: 'Example designs for made-up businesses. This is how yours could look: tap «See example» to look inside.' },
    inc: {
      eyebrow: 'What\'s included', h2: 'Everything your website needs to work well',
      feats: [['lDevices', 'Responsive design', 'Looks perfect on mobile, tablet and desktop.'], ['lMail', 'Contact form', 'So people can easily write to you from your website, straight to your inbox.'],
        ['lWa', 'WhatsApp button', 'Your customers message your WhatsApp with one tap, right from your website.'], ['lSparkle', 'Modern animations', 'Subtle touches that make the experience more engaging, without being dizzying.']],
      extras: [['lLayout', 'Clear structure'], ['lPen', 'Good visual design'], ['lUsers', 'Direct contact with me'], ['lRefresh', 'Changes whenever you need them']]
    },
    pre: {
      eyebrow: 'Guide prices', h2: 'Simple, clear options', lede: 'Every project is different, so I offer flexible options that fit what you need.',
      nota: 'The final quote depends on the content and what you need.',
      mant: 'Already have a website? I also do <b>changes and maintenance</b>.', mantLink: 'Tell me what you need', mantValor: 'Changes or maintenance for a website'
    },
    pro: {
      eyebrow: 'How I work', h2: 'You tell me your idea and we turn it into a real website',
      ai: 'I use modern tools to work faster, but every website is reviewed and fine-tuned with you.',
      pasos: [['lChat', 'You tell me', 'We talk about your idea, your goals and what you need.'], ['lFile', 'I build it', 'I design a proposal tailored to your business.'],
        ['lSliders', 'We fine-tune it', 'We review it together and I make the changes you need.'], ['lGlobe', 'Online', 'Your website live and ready for visitors and customers.']]
    },
    faq: { eyebrow: 'Frequently asked questions', h2: 'What people usually ask me' },
    cont: {
      eyebrow: 'Quick contact', h2: 'Got an idea? Let\'s look at it',
      txt: 'Tell me about your project, even if it is just an idea. No-obligation advice and we will find the best option for your business.',
      email: 'Send me an email', asunto: 'I%20would%20like%20a%20website'
    },
    form: {
      noRellenar: 'Do not fill in', borrador: 'I have restored what you were writing.', deCero: 'Start over',
      nombre: 'Name', contacto: 'Phone or email', interesa: 'What are you interested in?', noSe: ['Not sure', 'Not sure, I would like advice'],
      idea: 'Your idea', hint: 'What your business does, whether you already have a website or domain, and any websites you like.',
      priv: 'I have read and accept the <a href="../privacidad.html" hreflang="es">privacy policy</a> (in Spanish). I only use your details to reply to you.',
      enviar: 'Send message', escribir: 'Write', copiar: 'Copy', sinCompromiso: 'No obligation',
      promesa: 'I reply with a proposal and a clear quote before we start.', asuntoForm: 'Web para negocio (inglés)'
    },
    servicio: { name: 'Website design for small businesses', type: 'Web design', area: 'Spain',
      desc: 'Modern, fast, mobile-friendly websites for small businesses, freelancers and personal projects. Includes a contact form and a WhatsApp button for your business\'s customers. Service in English and Spanish.',
      oferta: (p) => `From €${PRECIOS[p.id]}. ${p.lema}`, nombreOferta: (p) => `${p.nombre} website` },
    enlaces: [['index.html', 'Home'], ['#ejemplos', 'Examples'], ['#incluye', 'What\'s included'], ['#precios', 'Prices'], ['#proceso', 'How I work'], ['#preguntas', 'FAQ'], ['#contacto', 'Contact']],
    tag: 'Modern, accessible websites'
  }
};
