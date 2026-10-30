/* =========================================================
   SERVICE PAGES IN ENGLISH (carpeta en/)
   ---------------------------------------------------------
   La versión en inglés de src/lib/datos/paginas-servicio.js. Mismos campos, más:
   - es: slug de la página en español (para el botón ES/EN y para Google)
   - relacionadas: slugs en inglés de este mismo archivo
   - servicio: nombre del servicio en inglés (static/js/data/servicios.en.js)
   Si cambias una página en español, cambia también aquí su traducción y ejecuta
       npm run build
   ========================================================= */
export default [
  {
    slug: 'ssd-upgrade-madrid', es: 'cambiar-disco-ssd-madrid',
    enlace: 'Swap your hard drive for an SSD',
    titulo: 'Swap your hard drive for an SSD in Madrid',
    seoTitulo: 'SSD upgrade: replace your hard drive in Madrid | Alextoll',
    desc: 'Your computer will start in seconds. I move your hard drive to an SSD keeping Windows, programs and files, or install a clean system. Quote before I start.',
    lede: 'It is the upgrade you notice most on a computer with a hard drive: it starts in seconds and programs open straight away. And you can almost always keep everything you have.',
    servicio: 'Hardware upgrades',
    mensaje: 'Hi Alextoll, I would like to replace my computer\'s hard drive with an SSD',
    senales: [
      'It takes several minutes to start.',
      'The disk shows 100% in Task Manager even when you are doing nothing.',
      'Programs take ages to open.',
      'You can hear the disk working: a constant hum or little clicks.'
    ],
    pasos: [
      ['I check your computer', 'I look at which disk it has, which connector it uses (SATA or M.2) and which SSD is compatible.'],
      ['I tell you which SSD to get', 'I recommend a good-quality one with the capacity you need. You can buy it yourself or I can get it.'],
      ['I copy everything or install clean', 'I clone the disk so everything is just as you left it, or install the system from scratch if it is full of leftovers.'],
      ['I test it and hand it back', 'I make sure it starts properly and the SSD runs at full speed. Your old disk is yours to keep.']
    ],
    incluye: ['Compatibility check', 'SSD fitting', 'Disk cloning or clean install', 'Speed and disk health check'],
    faq: [
      ['Will I lose my files?', 'No. If I clone the disk, you will find everything as it was. If you prefer a clean install, I back up your files first.'],
      ['Does it work on laptops?', 'Yes, on almost all of them. Some very old or very thin models have quirks; I will tell you before I start.'],
      ['What capacity do I need?', 'For normal use, 500 GB is usually plenty. If you keep lots of photos, videos or games, go for 1 TB.'],
      ['What about my old disk?', 'I give it back to you. If you like, I can set it up as an external drive for backups.']
    ],
    relacionadas: ['ram-upgrade-madrid', 'reinstall-windows-linux-madrid']
  },
  {
    slug: 'ram-upgrade-madrid', es: 'ampliar-memoria-ram-madrid',
    enlace: 'RAM upgrade',
    titulo: 'Upgrade your computer\'s RAM in Madrid',
    seoTitulo: 'RAM upgrade for desktops and laptops in Madrid | Alextoll',
    desc: 'If your computer struggles with several tabs or programs open, more RAM gives it room to breathe. I check what your machine supports, fit it and test it. Quote before I start.',
    lede: 'If your computer freezes up with several tabs open or when you switch programs, more RAM gives it room to breathe without buying a new one.',
    servicio: 'Hardware upgrades',
    mensaje: 'Hi Alextoll, I would like to upgrade my computer\'s RAM',
    senales: [
      'It hangs when you have lots of browser tabs open.',
      'It is slow to respond when you switch from one program to another.',
      'Memory shows as almost full in Task Manager.',
      'Games or editing software stutter.'
    ],
    pasos: [
      ['I check which RAM it takes', 'I check the memory type (DDR3, DDR4 or DDR5), the speed, the free slots and the maximum the motherboard supports.'],
      ['I tell you how much to add', 'For most people, 16 GB is the sweet spot today. I tell you whether it is worth it and which modules to buy.'],
      ['I fit it', 'I install the modules and check the computer recognises them and runs them in dual channel when possible.'],
      ['Memory test', 'I run a test to make sure there are no errors before giving it back to you.']
    ],
    incluye: ['Compatibility check', 'Module fitting', 'Dual-channel setup when possible', 'Memory test'],
    faq: [
      ['Can my laptop take more RAM?', 'It depends on the model: in some, the memory is soldered to the board and cannot be upgraded. I check the exact model before you buy anything.'],
      ['How much RAM do I need?', 'For browsing, office work and studying, 16 GB is more than enough. For modern games or video editing, 16 or 32 GB.'],
      ['Can I mix different modules?', 'Sometimes it works, but it is not ideal. I will tell you whether the ones you have can be reused.'],
      ['Does upgrading the RAM delete anything?', 'No. Adding memory does not touch your files or programs.']
    ],
    relacionadas: ['ssd-upgrade-madrid', 'computer-cleaning-madrid']
  },
  {
    slug: 'reinstall-windows-linux-madrid', es: 'formatear-ordenador-madrid',
    enlace: 'Reinstall Windows or Linux',
    titulo: 'Wipe your computer and reinstall Windows or Linux in Madrid',
    seoTitulo: 'Reinstall Windows or Linux on your computer in Madrid | Alextoll',
    desc: 'Clean install of Windows 10, Windows 11 or Linux with your files backed up first. Drivers, updates and programs ready to use. Quote before I start.',
    lede: 'When the system is cluttered with programs, errors or viruses, a clean install leaves it like new. Your files are backed up before I touch anything.',
    servicio: 'Operating systems',
    mensaje: 'Hi Alextoll, I would like to wipe and reinstall my computer',
    senales: [
      'It takes ages to start even though the disk is fine.',
      'Ads, strange windows or programs you never installed keep appearing.',
      'Constant errors or updates that fail.',
      'You are selling or giving away the computer and want it wiped.'
    ],
    pasos: [
      ['Back up your files', 'I save your photos, documents and anything you tell me before touching anything.'],
      ['Clean install', 'I install Windows 10, Windows 11 or the Linux distribution you prefer, with the latest updates.'],
      ['Drivers and programs', 'I install the drivers and the programs you use: browser, Office, antivirus, printer…'],
      ['Your files back in place', 'I put your files back where they were and, if you are switching systems, show you what is new.']
    ],
    incluye: ['Backup of your files', 'System installation', 'Drivers and updates', 'Basic programs set up'],
    faq: [
      ['Do I need a Windows licence?', 'If the computer already had Windows activated, it usually reactivates on its own. If not, I explain the legal options.'],
      ['Can I have Windows and Linux at the same time?', 'Yes. I install both and you choose which one to start when you switch it on.'],
      ['Which Linux do you recommend?', 'To get started, Linux Mint or Ubuntu: they are easy to use and run well on computers that are a few years old.'],
      ['How long does it take?', 'Usually one or two days, depending on how many files need copying.']
    ],
    relacionadas: ['ssd-upgrade-madrid', 'computer-cleaning-madrid']
  },
  {
    slug: 'computer-cleaning-madrid', es: 'limpieza-ordenador-madrid',
    enlace: 'Cleaning and thermal paste',
    titulo: 'Computer cleaning and thermal paste replacement in Madrid',
    seoTitulo: 'Computer cleaning and thermal paste in Madrid | Alextoll',
    desc: 'Is your computer noisy or running hot? Internal cleaning of fans and heatsink, fresh thermal paste and a temperature check. Quote before I start.',
    lede: 'Dust in the fans and dried-out thermal paste make your computer run hot, get noisy and slow down. A deep clean fixes it.',
    servicio: 'Computer cleaning',
    mensaje: 'Hi Alextoll, my computer is noisy and running hot',
    senales: [
      'The fan is loud even when you are not doing anything heavy.',
      'The laptop gets very hot underneath or on the keyboard.',
      'It switches itself off or slows down after a while.',
      'Nobody has opened it up in years.'
    ],
    pasos: [
      ['I open it and check it', 'I check the state of the fans and heatsink and note the temperatures before cleaning.'],
      ['Internal cleaning', 'I remove the dust from fans, vents and heatsink with the right tools.'],
      ['Fresh thermal paste', 'I replace the processor\'s thermal paste, and the graphics card\'s if needed.'],
      ['System clean-up and test', 'I remove junk programs from startup and check that temperatures have dropped.']
    ],
    incluye: ['Fan and heatsink cleaning', 'Thermal paste replacement', 'Temperatures before and after', 'Startup programs clean-up'],
    faq: [
      ['How often should it be cleaned?', 'It depends on where it lives, but every one or two years is a good idea. Sooner with pets or lots of dust.'],
      ['Can I do it myself with compressed air?', 'It helps on the outside, but caked-on dust in the heatsink and dried-out thermal paste can only be fixed by opening it up.'],
      ['Does it work for laptops?', 'Yes. Laptops are where you notice it most, because they have less room to cool down.'],
      ['Does anything get deleted?', 'No. Physical cleaning does not touch your files.']
    ],
    relacionadas: ['computer-repair-madrid', 'reinstall-windows-linux-madrid']
  },
  {
    slug: 'computer-repair-madrid', es: 'reparacion-ordenadores-madrid',
    enlace: 'Computer repair',
    titulo: 'Computer and laptop repair in Madrid',
    seoTitulo: 'Computer and laptop repair in Madrid, in English | Alextoll',
    desc: 'Won\'t turn on, keeps restarting or showing blue screens? Part-by-part diagnosis and a fixed quote before any repair. Desktops and laptops, service in English.',
    lede: 'It won\'t turn on, it restarts, shows blue screens or switches itself off. I track down the cause part by part before replacing anything, and tell you the price before I fix it.',
    servicio: 'Repairs and fixes',
    mensaje: 'Hi Alextoll, my computer has a problem and I would like to get it repaired',
    senales: [
      'It won\'t turn on or gets stuck on the logo.',
      'Blue screens or restarts without warning.',
      'It switches itself off after a while.',
      'Keyboard, battery or fan not working properly.'
    ],
    pasos: [
      ['You tell me what is happening', 'What it does, since when, and whether anything happened before: a knock, a spill, an update.'],
      ['Diagnosis', 'I test the power supply, memory, disk and temperatures until I find the faulty part or the software problem.'],
      ['Fixed quote', 'I explain what is wrong and how much it costs. If you are not convinced, nothing gets done.'],
      ['Repair and test', 'I fix it, test it thoroughly and hand it back working.']
    ],
    incluye: ['Part-by-part diagnosis', 'Quote before repairing', 'Repair or parts replacement', 'Full final test'],
    faq: [
      ['How much does the diagnosis cost?', 'I tell you before I start. Telling me about the problem and asking for a quote is free.'],
      ['Is it worth repairing?', 'If the repair costs almost as much as a new computer, I will tell you so.'],
      ['Can I get my files back if it won\'t turn on?', 'Often, yes: even if the computer won\'t start, the disk is usually fine and the data can be recovered.'],
      ['Do you repair laptops and desktops?', 'Yes, both, with Windows or Linux.']
    ],
    relacionadas: ['computer-cleaning-madrid', 'ssd-upgrade-madrid']
  },
  {
    slug: 'custom-pc-build-madrid', es: 'montar-pc-por-piezas-madrid',
    enlace: 'Custom PC build',
    titulo: 'Custom PC build in Madrid',
    seoTitulo: 'Custom PC build in Madrid (gaming or work) | Alextoll',
    desc: 'I help you choose the parts for your budget and what you need it for, build the PC, install Windows and test it. For gaming, studying or work.',
    lede: 'A PC built from parts gives you more performance for the same money than a shop-bought one. I help you choose each part, build it carefully and hand it over ready to use.',
    servicio: 'Advice and PC building',
    mensaje: 'Hi Alextoll, I would like to build a custom PC',
    senales: [
      'You want a gaming PC and the shop ones don\'t convince you.',
      'You have a budget and don\'t know which parts go together.',
      'You have already bought the parts and are worried about building it yourself.',
      'You need a machine for editing, programming or studying.'
    ],
    pasos: [
      ['You tell me what you want', 'What you will use it for, which games or programs, and how much you want to spend.'],
      ['We choose the parts', 'I suggest a compatible, balanced list without overspending where you won\'t notice it. You buy it or I get it.'],
      ['I build it', 'I fit all the parts, tidy the cables so the air flows well and set up the BIOS.'],
      ['System and tests', 'I install Windows or Linux and the drivers, and run temperature and stability tests before handing it over.']
    ],
    incluye: ['Parts list matched to your budget', 'Build and cable management', 'System and driver installation', 'Temperature and stability tests'],
    faq: [
      ['Can I buy the parts myself?', 'Yes. I give you the list and you buy them wherever you like, or I get them and include them in the quote.'],
      ['What if I already have the parts?', 'Perfect: I check they are compatible and build it. If anything is missing, I tell you before I start.'],
      ['How much does a gaming PC cost?', 'It depends on the games and the quality you want. Tell me your budget and I will tell you what can be built with it.'],
      ['When can you do it?', 'Mostly at weekends. Write to me whenever you like and we will find the day that suits you.']
    ],
    relacionadas: ['computer-buying-advice-madrid', 'graphics-card-upgrade-madrid']
  },
  {
    slug: 'computer-buying-advice-madrid', es: 'asesoramiento-comprar-ordenador-madrid',
    enlace: 'Help choosing a computer',
    titulo: 'Which computer should I buy? Help choosing in Madrid',
    seoTitulo: 'Which computer or laptop to buy: advice in Madrid | Alextoll',
    desc: 'Not sure which computer or laptop to buy? I tell you which one suits your use and budget, with no shop commission. And whether upgrading yours is worth it.',
    lede: 'With so many models it is easy to overpay or fall short. Tell me what you need it for and how much you want to spend, and I will tell you what to buy and what to avoid.',
    servicio: 'Advice and PC building',
    mensaje: 'Hi Alextoll, I want to buy a computer and don\'t know which one to choose',
    senales: [
      'Your computer is slow and you are torn between fixing it and buying a new one.',
      'You see similar laptops at very different prices.',
      'You don\'t know how much RAM, which processor or which disk you need.',
      'It is for someone who isn\'t into computers and you don\'t want to get it wrong.'
    ],
    pasos: [
      ['You tell me how you use it', 'What you will use it for, where (home, class, travel) and how much you want to spend.'],
      ['I check if upgrading yours is worth it', 'Sometimes an SSD and more RAM make your computer feel new for much less money.'],
      ['I suggest options', 'Two or three models that fit, explained without jargon, and what is not worth paying for.'],
      ['I get it ready for you', 'If you like, once you have it I set it up and move your files over from the old computer.']
    ],
    incluye: ['Recommendation based on your use and budget', 'Simple model comparison', 'Whether upgrading your current one is worth it', 'Setup and data transfer (optional)'],
    faq: [
      ['Do you take a commission on what I buy?', 'No. I don\'t sell computers: I recommend what suits you, wherever you buy it.'],
      ['Laptop or desktop?', 'If you will carry it around, a laptop. For gaming or working always in the same place, a desktop gives you more for the same money.'],
      ['Will you help me move my things to the new one?', 'Yes: photos, documents, email and programs. I leave everything as you had it.'],
      ['When can you do it?', 'Mostly at weekends. Write to me whenever you like and I will get back to you.']
    ],
    relacionadas: ['custom-pc-build-madrid', 'data-transfer-new-computer-madrid']
  },
  {
    slug: 'graphics-card-upgrade-madrid', es: 'cambiar-tarjeta-grafica-madrid',
    enlace: 'Graphics card, PSU or Wi-Fi upgrade',
    titulo: 'Upgrade your graphics card, power supply or Wi-Fi in Madrid',
    seoTitulo: 'Graphics card or power supply upgrade in Madrid | Alextoll',
    desc: 'I check which graphics card fits your PC and whether your power supply can handle it, install it with its drivers and test it. Also power supplies, Wi-Fi cards and other parts.',
    lede: 'A new graphics card can give your PC a new lease of life for gaming or editing. Before you buy it, I check that it fits, that your power supply can handle it and that it won\'t be held back.',
    servicio: 'Hardware upgrades',
    mensaje: 'Hi Alextoll, I would like to replace the graphics card (or another part) in my PC',
    senales: [
      'New games stutter or you have to turn everything down to minimum.',
      'You want a new graphics card and don\'t know if your power supply can handle it.',
      'The PC switches itself off while gaming (sometimes it is the power supply).',
      'The Wi-Fi is slow or keeps dropping and you want a better card.'
    ],
    pasos: [
      ['I check your PC', 'I look at the power supply, the room in the case, the motherboard and the processor to see what fits.'],
      ['I tell you what to buy', 'I recommend a part that is balanced with your system, so you don\'t pay for power you won\'t use.'],
      ['I install it', 'I fit the part, connect the power properly and install clean drivers.'],
      ['I test that it works well', 'I run performance and temperature tests to make sure everything is stable.']
    ],
    incluye: ['Compatibility and power supply check', 'Part fitting', 'Clean drivers', 'Performance and temperature tests'],
    faq: [
      ['Can my power supply handle a new graphics card?', 'It depends on the wattage and quality of the power supply. I check before you buy anything.'],
      ['Will my processor hold the graphics card back?', 'It can happen if they are very mismatched. I tell you whether it is worth it or if something else should be upgraded too.'],
      ['Which parts can you replace?', 'Graphics card, power supply, RAM, disks, Wi-Fi, fans, heatsink… almost any part in a desktop, and RAM, disk and battery in many laptops.'],
      ['When can you do it?', 'Mostly at weekends. Write to me whenever you like and we will arrange it.']
    ],
    relacionadas: ['custom-pc-build-madrid', 'ram-upgrade-madrid']
  },
  {
    slug: 'data-transfer-new-computer-madrid', es: 'pasar-datos-ordenador-nuevo-madrid',
    enlace: 'Move your data to a new computer',
    titulo: 'Move your data to a new computer and back it up in Madrid',
    seoTitulo: 'Data transfer to a new computer and backups in Madrid | Alextoll',
    desc: 'Getting a new computer in Madrid? I move your photos, documents, email and bookmarks to the new one and make a backup of your files before I start.',
    lede: 'Changing computers shouldn\'t mean losing your photos or spending a whole day setting everything up. I move it all to the new one and set up backups so you can relax.',
    servicio: 'Backups',
    mensaje: 'Hi Alextoll, I would like to move my data to a new computer',
    senales: [
      'You have bought a new computer and the old one has all your stuff.',
      'You have never backed up your photos.',
      'Your computer is acting strangely and you are afraid of losing your files.',
      'You want backups to happen on their own without having to remember.'
    ],
    pasos: [
      ['We decide what to keep', 'Photos, documents, email, browser bookmarks, saved passwords and programs.'],
      ['I back everything up', 'Before touching anything, I save a copy to an external drive or the cloud.'],
      ['I move it to the new one', 'I put everything in its place and set up the new computer so you find everything as before.'],
      ['Automatic backups', 'If you like, I schedule backups so they run on their own.']
    ],
    incluye: ['Backup before starting', 'Transfer of files, email and bookmarks', 'New computer setup', 'Automatic backups (optional)'],
    faq: [
      ['What if the old computer won\'t turn on?', 'Often the disk is fine and the data can be recovered. I will tell you after checking it.'],
      ['Where are the backups stored?', 'On an external drive, in the cloud (Google Drive, OneDrive…) or both. I explain the pros of each.'],
      ['Do you wipe the old computer?', 'If you are selling it or giving it away, I wipe it securely so nobody can recover your data.'],
      ['When can you do it?', 'Mostly at weekends. Write to me whenever you like and we will arrange it.']
    ],
    relacionadas: ['computer-buying-advice-madrid', 'reinstall-windows-linux-madrid']
  },
  {
    slug: 'virus-removal-madrid', es: 'quitar-virus-ordenador-madrid',
    enlace: 'Virus and adware removal',
    titulo: 'Virus, adware and junk software removal in Madrid',
    seoTitulo: 'Virus and junk software removal in Madrid | Alextoll',
    desc: 'Pop-up ads, a browser that opens pages on its own or a painfully slow computer? I remove viruses, adware and junk software without losing your files.',
    lede: 'Pop-up ads, a browser that opens pages you never asked for, or a computer that is suddenly painfully slow. I clean it thoroughly without losing your files.',
    servicio: 'Computer cleaning',
    mensaje: 'Hi Alextoll, I think my computer has a virus or adware',
    senales: [
      'Ads or windows pop up even when you are not browsing.',
      'Your browser has a home page or search engine you didn\'t choose.',
      'There are programs you don\'t remember installing.',
      'The fan is loud and it is slow while doing nothing.'
    ],
    pasos: [
      ['Back up your files', 'First of all, I save your photos and documents just in case.'],
      ['Thorough scan', 'I look for viruses, adware and junk software with several tools, including in the browser.'],
      ['Clean-up', 'I remove everything that shouldn\'t be there and set the browser back to how it should be.'],
      ['Protection', 'I leave Windows updated and protected, and explain how to stop it happening again.']
    ],
    incluye: ['Backup beforehand', 'Virus and adware removal', 'Browser and startup clean-up', 'Windows updated and protected'],
    faq: [
      ['Do I need to wipe the computer?', 'Hardly ever. It can usually be cleaned without reinstalling. If the system is badly damaged, I tell you and we do it keeping your files.'],
      ['Do I need a paid antivirus?', 'For most people, the one built into Windows, properly set up, is enough. I tell you if another one is worth it in your case.'],
      ['Will I lose my files?', 'No. I back up what matters before cleaning.'],
      ['When can you do it?', 'Mostly at weekends. It can often be done remotely, without you leaving home.']
    ],
    relacionadas: ['computer-cleaning-madrid', 'reinstall-windows-linux-madrid']
  }
];
