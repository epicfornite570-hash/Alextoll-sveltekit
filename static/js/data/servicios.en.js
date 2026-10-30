/* =========================================================
   SERVICIOS EN INGLÉS (páginas de en/)
   ---------------------------------------------------------
   Se carga DESPUÉS de js/data/servicios.js y solo cambia los textos:
   iconos, precios ("desde") y orden salen de servicios.js.
   Si añades un servicio allí, añade aquí su traducción con el mismo id.
   paginas: enlaces a las páginas de servicio en inglés (carpeta en/)
   ========================================================= */
window.AT = window.AT || {};

(function () {
  const EN = {
    limpieza: { name: 'Computer cleaning', paginas: [['Cleaning and thermal paste', 'computer-cleaning-madrid.html'], ['Virus and adware removal', 'virus-removal-madrid.html']],
      text: 'Cleaning inside and out, plus a system clean-up so it runs smoothly again.',
      items: ['Dust out of fans and heatsink', 'Fresh thermal paste', 'Junk software and virus removal'] },
    arreglos: { name: 'Repairs and fixes', paginas: [['Computer repair', 'computer-repair-madrid.html']],
      text: 'Whatever fails, freezes or won\'t start. I find the cause before replacing anything.',
      items: ['Won\'t turn on or won\'t boot', 'Blue screens and restarts', 'Keyboard, battery or fan'] },
    hardware: { name: 'Hardware upgrades', paginas: [['SSD upgrade', 'ssd-upgrade-madrid.html'], ['RAM upgrade', 'ram-upgrade-madrid.html'], ['Graphics card or power supply', 'graphics-card-upgrade-madrid.html']],
      text: 'More life for your computer with compatible parts, without buying a new one.',
      items: ['More RAM', 'Hard drive to SSD', 'Graphics card, power supply or Wi-Fi'] },
    so: { name: 'Operating systems', paginas: [['Reinstall Windows or Linux', 'reinstall-windows-linux-madrid.html']],
      text: 'Clean install, upgrade or full wipe, with your files backed up first.',
      items: ['Windows 10 and 11', 'Linux (Ubuntu, Mint…)', 'Windows and Linux side by side'] },
    software: { name: 'Programs and software',
      text: 'I install and set up what you are going to use, ready for work or play.',
      items: ['Office, browsers, antivirus', 'Drivers', 'Printers and peripherals'] },
    optimizacion: { name: 'Tune-up',
      text: 'For the computer that takes forever to start or keeps hanging.',
      items: ['Faster startup', 'Temperature check', 'Updates up to date'] },
    copias: { name: 'Backups', paginas: [['Move your data to a new computer', 'data-transfer-new-computer-madrid.html']],
      text: 'I back up your photos and documents and move everything to your new computer if you change.',
      items: ['Backup to an external drive or the cloud', 'Moving data from one PC to another'] },
    asesoria: { name: 'Advice and PC building', paginas: [['Help choosing a computer', 'computer-buying-advice-madrid.html'], ['Custom PC build', 'custom-pc-build-madrid.html']],
      text: 'I help you choose parts or a computer for your budget and what you need it for.',
      items: ['What to buy and what to avoid', 'Custom PC builds'] }
  };
  (AT.SERVICIOS || []).forEach(s => { if (EN[s.id]) Object.assign(s, { paginas: [] }, EN[s.id]); });
})();
