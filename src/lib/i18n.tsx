import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "am" | "om";

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "am", label: "አማርኛ", short: "አማ" },
  { code: "om", label: "Afaan Oromoo", short: "OM" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.services": "Services",
  "nav.work": "Work",
  "nav.contact": "Contact",
  "nav.book": "Book a Project",

  "hero.greeting": "Hello, I'm",
  "hero.name": "Daniel Korsa",
  "hero.role": "Graphics & Brand Designer",
  "hero.tagline":
    "I craft bold logos, striking brand identities and scroll-stopping visuals that help businesses look unforgettable.",
  "hero.cta.primary": "Book a Project",
  "hero.cta.secondary": "View My Work",
  "hero.scroll": "Scroll to explore",
  "hero.badge": "Available for freelance",

  "about.kicker": "About Me",
  "about.title": "Designing brands people remember",
  "about.p1":
    "I'm Daniel Korsa, a passionate graphics designer based in Bale Robe, Ethiopia. Under the name Danny Graphics, I turn ideas into clean, modern and meaningful visual identities.",
  "about.p2":
    "From logos and branding to event posters, social media campaigns and print, every project is built on strong concepts, careful typography and an obsession with detail.",
  "about.philosophyTitle": "My design philosophy",
  "about.philosophy":
    "Great design is invisible until it makes you feel something. I balance clarity, emotion and craft to create work that's both beautiful and effective.",
  "about.stat1": "Projects Delivered",
  "about.stat2": "Happy Clients",
  "about.stat3": "Years Experience",
  "about.stat4": "Brands Built",
  "about.skills": "Core Skills",
  "about.timelineTitle": "My Journey",

  "skill.branding": "Branding & Identity",
  "skill.logo": "Logo Design",
  "skill.poster": "Poster & Flyer Design",
  "skill.social": "Social Media Design",
  "skill.print": "Print & Packaging",
  "skill.photoshop": "Photoshop & Illustrator",

  "tl.1.year": "Started",
  "tl.1.title": "First steps in design",
  "tl.1.desc": "Discovered a passion for visual storytelling and began learning design tools.",
  "tl.2.year": "Growth",
  "tl.2.title": "Danny Graphics is born",
  "tl.2.desc": "Launched my brand and started serving local businesses with custom design.",
  "tl.3.year": "Today",
  "tl.3.title": "Trusted by brands",
  "tl.3.desc": "Delivering premium branding, posters and social media design across Ethiopia.",

  "services.kicker": "What I Do",
  "services.title": "Services crafted for your brand",
  "services.subtitle": "Everything you need to look professional and stand out.",
  "service.branding.title": "Branding & Identity",
  "service.branding.desc": "Complete brand systems — colors, typography and guidelines that scale.",
  "service.logo.title": "Logo Design",
  "service.logo.desc": "Memorable, versatile logos that capture the essence of your business.",
  "service.poster.title": "Posters & Flyers",
  "service.poster.desc": "Eye-catching event posters, banners and promotional flyers.",
  "service.social.title": "Social Media Design",
  "service.social.desc": "Scroll-stopping posts, covers and ad creatives for every platform.",
  "service.event.title": "Event Design",
  "service.event.desc": "Cohesive visuals for events — from invitations to stage backdrops.",
  "service.print.title": "Printing & Cards",
  "service.print.desc": "Business cards, brochures and print-ready files done right.",
  "service.cta": "Request this",

  "work.kicker": "Selected Work",
  "work.title": "A portfolio that speaks",
  "work.subtitle": "Real projects for real brands — branding, posters, logos and more.",
  "work.filter.all": "All",
  "work.filter.branding": "Branding",
  "work.filter.poster": "Posters",
  "work.filter.logo": "Logos",
  "work.filter.social": "Social Media",
  "work.view": "View Project",

  "proj.danny.title": "Danny Graphics Banner",
  "proj.danny.cat": "Branding",
  "proj.abire.title": "Abire Kano Gold Maker",
  "proj.abire.cat": "Branding",
  "proj.kiya.title": "Kiya Optics Banner",
  "proj.kiya.cat": "Posters",
  "proj.nurobe.title": "Nurobe Hotel Poster",
  "proj.nurobe.cat": "Posters",
  "proj.melody.title": "Melody Store Promo",
  "proj.melody.cat": "Social Media",
  "proj.hayyoota.title": "Hayyoota Music Cover",
  "proj.hayyoota.cat": "Posters",
  "proj.ujb.title": "Urjii Baalee Logo",
  "proj.ujb.cat": "Logos",

  "contact.kicker": "Let's Work Together",
  "contact.title": "Start your project",
  "contact.subtitle": "Tell me about your idea and I'll get back to you within 24 hours.",
  "contact.form.name": "Your name",
  "contact.form.email": "Email address",
  "contact.form.phone": "Phone (optional)",
  "contact.form.service": "Service needed",
  "contact.form.service.placeholder": "Select a service",
  "contact.form.message": "Project details",
  "contact.form.file": "Attach a reference (optional)",
  "contact.form.fileHint": "Drag & drop a file here, or click to browse",
  "contact.form.submit": "Send Request",
  "contact.form.sending": "Sending...",
  "contact.form.success": "Thank you! Your request has been sent.",
  "contact.form.successDesc": "I'll reach out to you very soon.",
  "contact.form.again": "Send another",
  "contact.step": "Step",
  "contact.of": "of",
  "contact.next": "Next",
  "contact.back": "Back",
  "contact.err.name": "Please enter your name",
  "contact.err.email": "Please enter a valid email",
  "contact.err.message": "Please describe your project",

  "contact.reach": "Reach me directly",
  "contact.phone": "Phone",
  "contact.email": "Email",
  "contact.location": "Location",
  "contact.locationValue": "Bale, Robe, Ethiopia",
  "contact.telegram": "Telegram",
  "contact.bizTelegram": "Business Telegram",
  "contact.follow": "Follow me",

  "footer.tagline": "Crafting brands that people remember.",
  "footer.quick": "Quick Links",
  "footer.connect": "Connect",
  "footer.rights": "All rights reserved.",
  "footer.made": "Designed & built with care.",

  "widget.title": "Quick contact",
  "widget.call": "Call",
  "widget.message": "Message",

  "chat.fab": "Chat with Danny AI",
  "chat.title": "Danny — AI Assistant",
  "chat.status": "Online · replies instantly",
  "chat.greeting":
    "👋 Hi! I'm Danny's AI assistant. Ask me about services, pricing or get help starting a booking. I speak English, አማርኛ and Afaan Oromoo.",
  "chat.placeholder": "Type your message...",
  "chat.send": "Send",
  "chat.error": "Sorry, something went wrong. Please try again.",
  "chat.suggest1": "What services do you offer?",
  "chat.suggest2": "How much does a logo cost?",
  "chat.suggest3": "I want to book a project",
  "chat.tabChat": "AI Chat",
  "chat.tabContact": "Contact",
  "chat.clear": "New chat",
};

const am: Dict = {
  "nav.home": "መነሻ",
  "nav.about": "ስለ እኔ",
  "nav.services": "አገልግሎቶች",
  "nav.work": "ስራዎች",
  "nav.contact": "አግኙኝ",
  "nav.book": "ፕሮጀክት ይዘዙ",

  "hero.greeting": "ሰላም፣ እኔ",
  "hero.name": "ዳንኤል ኮርሳ",
  "hero.role": "የግራፊክስ እና ብራንድ ዲዛይነር",
  "hero.tagline":
    "ንግዶች የማይረሱ ሆነው እንዲታዩ የሚያደርጉ ደፋር ሎጎዎች፣ ጠንካራ የብራንድ ማንነቶች እና ማራኪ ምስሎችን እሰራለሁ።",
  "hero.cta.primary": "ፕሮጀክት ይዘዙ",
  "hero.cta.secondary": "ስራዎቼን ይመልከቱ",
  "hero.scroll": "ለማሰስ ይሸብልሉ",
  "hero.badge": "ለፍሪላንስ ዝግጁ ነኝ",

  "about.kicker": "ስለ እኔ",
  "about.title": "ሰዎች የሚያስታውሷቸውን ብራንዶች መንደፍ",
  "about.p1":
    "እኔ ዳንኤል ኮርሳ ነኝ፣ በባሌ ሮቤ ኢትዮጵያ የምኖር ቀናተኛ የግራፊክስ ዲዛይነር። በዳኒ ግራፊክስ ስም ሀሳቦችን ወደ ንፁህ፣ ዘመናዊ እና ትርጉም ያላቸው የእይታ ማንነቶች እቀይራለሁ።",
  "about.p2":
    "ከሎጎ እና ብራንዲንግ እስከ የዝግጅት ፖስተሮች፣ የማህበራዊ ሚዲያ ዘመቻዎች እና ህትመት ድረስ፣ እያንዳንዱ ፕሮጀክት በጠንካራ ሀሳቦች ላይ የተገነባ ነው።",
  "about.philosophyTitle": "የንድፍ ፍልስፍናዬ",
  "about.philosophy":
    "ጥሩ ንድፍ አንድ ነገር እስኪያሰማዎት ድረስ የማይታይ ነው። ቆንጆም ውጤታማም ስራ ለመፍጠር ግልጽነትን፣ ስሜትን እና ጥበብን አመዛዝናለሁ።",
  "about.stat1": "የተጠናቀቁ ፕሮጀክቶች",
  "about.stat2": "ደስተኛ ደንበኞች",
  "about.stat3": "የልምድ ዓመታት",
  "about.stat4": "የተገነቡ ብራንዶች",
  "about.skills": "ዋና ክህሎቶች",
  "about.timelineTitle": "ጉዞዬ",

  "skill.branding": "ብራንዲንግ እና ማንነት",
  "skill.logo": "የሎጎ ንድፍ",
  "skill.poster": "የፖስተር እና ፍላየር ንድፍ",
  "skill.social": "የማህበራዊ ሚዲያ ንድፍ",
  "skill.print": "ህትመት እና ማሸጊያ",
  "skill.photoshop": "ፎቶሾፕ እና ኢለስትሬተር",

  "tl.1.year": "ጅማሬ",
  "tl.1.title": "በንድፍ የመጀመሪያ እርምጃዎች",
  "tl.1.desc": "ለእይታ ታሪክ አተራረክ ፍቅርን አግኝቼ የንድፍ መሳሪያዎችን መማር ጀመርኩ።",
  "tl.2.year": "እድገት",
  "tl.2.title": "ዳኒ ግራፊክስ ተወለደ",
  "tl.2.desc": "ብራንዴን ጀምሬ የአካባቢ ንግዶችን በብጁ ንድፍ ማገልገል ጀመርኩ።",
  "tl.3.year": "ዛሬ",
  "tl.3.title": "በብራንዶች የታመነ",
  "tl.3.desc": "በመላ ኢትዮጵያ ፕሪሚየም ብራንዲንግ፣ ፖስተሮች እና የማህበራዊ ሚዲያ ንድፍ እያቀረብኩ ነው።",

  "services.kicker": "ምን እሰራለሁ",
  "services.title": "ለብራንድዎ የተዘጋጁ አገልግሎቶች",
  "services.subtitle": "ፕሮፌሽናል ሆነው ለመታየት የሚያስፈልግዎ ሁሉ።",
  "service.branding.title": "ብራንዲንግ እና ማንነት",
  "service.branding.desc": "ሙሉ የብራንድ ስርዓቶች — ቀለሞች፣ ፊደላት እና መመሪያዎች።",
  "service.logo.title": "የሎጎ ንድፍ",
  "service.logo.desc": "የንግድዎን ምንነት የሚይዙ የማይረሱ ሎጎዎች።",
  "service.poster.title": "ፖስተሮች እና ፍላየሮች",
  "service.poster.desc": "ማራኪ የዝግጅት ፖስተሮች፣ ባነሮች እና የማስታወቂያ ፍላየሮች።",
  "service.social.title": "የማህበራዊ ሚዲያ ንድፍ",
  "service.social.desc": "ለእያንዳንዱ መድረክ ማራኪ ፖስቶች፣ ሽፋኖች እና ማስታወቂያዎች።",
  "service.event.title": "የዝግጅት ንድፍ",
  "service.event.desc": "ለዝግጅቶች የተቀናጁ ምስሎች — ከግብዣ እስከ የመድረክ ጀርባ።",
  "service.print.title": "ህትመት እና ካርዶች",
  "service.print.desc": "የንግድ ካርዶች፣ ብሮሹሮች እና ለህትመት ዝግጁ ፋይሎች።",
  "service.cta": "ይህንን ይጠይቁ",

  "work.kicker": "የተመረጡ ስራዎች",
  "work.title": "የሚናገር ፖርትፎሊዮ",
  "work.subtitle": "ለእውነተኛ ብራንዶች እውነተኛ ፕሮጀክቶች — ብራንዲንግ፣ ፖስተሮች፣ ሎጎዎች እና ሌሎችም።",
  "work.filter.all": "ሁሉም",
  "work.filter.branding": "ብራንዲንግ",
  "work.filter.poster": "ፖስተሮች",
  "work.filter.logo": "ሎጎዎች",
  "work.filter.social": "ማህበራዊ ሚዲያ",
  "work.view": "ፕሮጀክት ይመልከቱ",

  "proj.danny.title": "ዳኒ ግራፊክስ ባነር",
  "proj.danny.cat": "ብራንዲንግ",
  "proj.abire.title": "አቢሬ ካኖ ጎልድ ሜከር",
  "proj.abire.cat": "ብራንዲንግ",
  "proj.kiya.title": "ኪያ ኦፕቲክስ ባነር",
  "proj.kiya.cat": "ፖስተሮች",
  "proj.nurobe.title": "ኑሮቤ ሆቴል ፖስተር",
  "proj.nurobe.cat": "ፖስተሮች",
  "proj.melody.title": "ሜሎዲ ስቶር ማስታወቂያ",
  "proj.melody.cat": "ማህበራዊ ሚዲያ",
  "proj.hayyoota.title": "ሀዮታ የሙዚቃ ሽፋን",
  "proj.hayyoota.cat": "ፖስተሮች",
  "proj.ujb.title": "ኡርጂ ባሌ ሎጎ",
  "proj.ujb.cat": "ሎጎዎች",

  "contact.kicker": "አብረን እንስራ",
  "contact.title": "ፕሮጀክትዎን ይጀምሩ",
  "contact.subtitle": "ስለ ሀሳብዎ ይንገሩኝ፣ በ24 ሰዓታት ውስጥ እመልሳለሁ።",
  "contact.form.name": "ስምዎ",
  "contact.form.email": "የኢሜይል አድራሻ",
  "contact.form.phone": "ስልክ (አማራጭ)",
  "contact.form.service": "የሚፈለግ አገልግሎት",
  "contact.form.service.placeholder": "አገልግሎት ይምረጡ",
  "contact.form.message": "የፕሮጀክት ዝርዝሮች",
  "contact.form.file": "ማጣቀሻ ያያይዙ (አማራጭ)",
  "contact.form.fileHint": "ፋይል እዚህ ይጎትቱ፣ ወይም ለማሰስ ይጫኑ",
  "contact.form.submit": "ጥያቄ ላክ",
  "contact.form.sending": "በመላክ ላይ...",
  "contact.form.success": "አመሰግናለሁ! ጥያቄዎ ተልኳል።",
  "contact.form.successDesc": "በቅርቡ አገኝዎታለሁ።",
  "contact.form.again": "ሌላ ላክ",
  "contact.step": "ደረጃ",
  "contact.of": "ከ",
  "contact.next": "ቀጣይ",
  "contact.back": "ተመለስ",
  "contact.err.name": "እባክዎ ስምዎን ያስገቡ",
  "contact.err.email": "እባክዎ ትክክለኛ ኢሜይል ያስገቡ",
  "contact.err.message": "እባክዎ ፕሮጀክትዎን ይግለጹ",

  "contact.reach": "በቀጥታ ያግኙኝ",
  "contact.phone": "ስልክ",
  "contact.email": "ኢሜይል",
  "contact.location": "አካባቢ",
  "contact.locationValue": "ባሌ፣ ሮቤ፣ ኢትዮጵያ",
  "contact.telegram": "ቴሌግራም",
  "contact.bizTelegram": "የንግድ ቴሌግራም",
  "contact.follow": "ይከተሉኝ",

  "footer.tagline": "ሰዎች የሚያስታውሷቸውን ብራንዶች መንደፍ።",
  "footer.quick": "ፈጣን አገናኞች",
  "footer.connect": "ይገናኙ",
  "footer.rights": "መብቱ በህግ የተጠበቀ ነው።",
  "footer.made": "በጥንቃቄ የተነደፈ።",

  "widget.title": "ፈጣን ግንኙነት",
  "widget.call": "ይደውሉ",
  "widget.message": "መልዕክት",

  "chat.fab": "ከዳኒ AI ጋር ይወያዩ",
  "chat.title": "ዳኒ — AI ረዳት",
  "chat.status": "በመስመር ላይ · ወዲያውኑ ይመልሳል",
  "chat.greeting":
    "👋 ሰላም! እኔ የዳንኤል AI ረዳት ነኝ። ስለ አገልግሎቶች፣ ዋጋ ይጠይቁ ወይም ቡኪንግ ለመጀመር እርዳታ ያግኙ። እንግሊዝኛ፣ አማርኛ እና አፋን ኦሮሞ እናገራለሁ።",
  "chat.placeholder": "መልዕክትዎን ይጻፉ...",
  "chat.send": "ላክ",
  "chat.error": "ይቅርታ፣ የሆነ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
  "chat.suggest1": "ምን አገልግሎቶች ይሰጣሉ?",
  "chat.suggest2": "ሎጎ ምን ያህል ያስከፍላል?",
  "chat.suggest3": "ፕሮጀክት መዝዝ እፈልጋለሁ",
  "chat.tabChat": "AI ውይይት",
  "chat.tabContact": "አግኙኝ",
  "chat.clear": "አዲስ ውይይት",
};

const om: Dict = {
  "nav.home": "Mana",
  "nav.about": "Waa'ee Koo",
  "nav.services": "Tajaajila",
  "nav.work": "Hojiiwwan",
  "nav.contact": "Na Qunnamaa",
  "nav.book": "Pirojektii Ajaji",

  "hero.greeting": "Akkam, ani",
  "hero.name": "Daniel Korsa",
  "hero.role": "Dizaayinarii Graafiksii fi Braandii",
  "hero.tagline":
    "Loogoowwan jajjaboo, eenyummaa braandii cimaa fi suuraa nama harkisan kanneen daldalaan akka hin daganne taasisan hojjedha.",
  "hero.cta.primary": "Pirojektii Ajaji",
  "hero.cta.secondary": "Hojii Koo Ilaali",
  "hero.scroll": "Sakatta'uuf gad oofi",
  "hero.badge": "Hojii dhuunfaaf qophii",

  "about.kicker": "Waa'ee Koo",
  "about.title": "Braandii namni yaadatu dizaayinii gochuu",
  "about.p1":
    "Ani Daniel Korsa, dizaayinarii graafiksii Baalee Roobee, Itoophiyaa keessa jiraatuudha. Maqaa Danny Graphics jedhuun yaada gara eenyummaa muraasa, ammayyaa fi hiika qabuutti jijjiira.",
  "about.p2":
    "Loogoo fi braandii irraa hanga poostara taateewwanii, duula miidiyaa hawaasaa fi maxxansaatti, pirojektiin hundi yaada cimaa irratti kan ijaarameedha.",
  "about.philosophyTitle": "Falaasama dizaayinii koo",
  "about.philosophy":
    "Dizaayiniin gaariin hanga waan tokko si dhageessisutti hin mul'atu. Hojii bareedaa fi bu'a qabeessa uumuuf ifa, miira fi ogummaa walsimsiisa.",
  "about.stat1": "Pirojektii Xumurame",
  "about.stat2": "Maamiltoota Gammadan",
  "about.stat3": "Waggaa Muuxannoo",
  "about.stat4": "Braandii Ijaarame",
  "about.skills": "Dandeettii Ijoo",
  "about.timelineTitle": "Imala Koo",

  "skill.branding": "Braandii fi Eenyummaa",
  "skill.logo": "Dizaayinii Loogoo",
  "skill.poster": "Dizaayinii Poostaraa fi Filaayeraa",
  "skill.social": "Dizaayinii Miidiyaa Hawaasaa",
  "skill.print": "Maxxansaa fi Qophii",
  "skill.photoshop": "Photoshop fi Illustrator",

  "tl.1.year": "Jalqaba",
  "tl.1.title": "Tarkaanfii jalqabaa dizaayinii",
  "tl.1.desc": "Jaalala seenaa agarsiisaa argadhee meeshaalee dizaayinii barachuu jalqabe.",
  "tl.2.year": "Guddina",
  "tl.2.title": "Danny Graphics dhalate",
  "tl.2.desc": "Braandii koo jalqabee daldaltoota naannoo dizaayinii addaatiin tajaajiluu eegale.",
  "tl.3.year": "Har'a",
  "tl.3.title": "Braandiidhaan amanamaa",
  "tl.3.desc": "Itoophiyaa guutuu keessatti braandii, poostaraa fi dizaayinii miidiyaa hawaasaa olaanaa dhiheessaa jira.",

  "services.kicker": "Maal Hojjedha",
  "services.title": "Tajaajila braandii keetiif qophaa'e",
  "services.subtitle": "Ogeessa ta'uuf waan barbaachisu hunda.",
  "service.branding.title": "Braandii fi Eenyummaa",
  "service.branding.desc": "Sirna braandii guutuu — halluu, qubee fi qajeelfama.",
  "service.logo.title": "Dizaayinii Loogoo",
  "service.logo.desc": "Loogoo hin dagatamne kan eenyummaa daldala keetii qabatu.",
  "service.poster.title": "Poostaraa fi Filaayera",
  "service.poster.desc": "Poostara taateewwanii, baaneraa fi filaayera beeksisaa nama harkisan.",
  "service.social.title": "Dizaayinii Miidiyaa Hawaasaa",
  "service.social.desc": "Poostii, haguuggii fi beeksisa pilaatformii hundaaf.",
  "service.event.title": "Dizaayinii Taatee",
  "service.event.desc": "Suuraa walsimu taateewwaniif — affeerraa irraa hanga duuba sterii.",
  "service.print.title": "Maxxansaa fi Kaardii",
  "service.print.desc": "Kaardii daldalaa, biroosharaa fi faayilii maxxansaaf qophaa'e.",
  "service.cta": "Kana gaafadhu",

  "work.kicker": "Hojiiwwan Filataman",
  "work.title": "Poortifooliyoo dubbatu",
  "work.subtitle": "Braandii dhugaaf pirojektii dhugaa — braandii, poostaraa, loogoo fi kkf.",
  "work.filter.all": "Hunda",
  "work.filter.branding": "Braandii",
  "work.filter.poster": "Poostaraa",
  "work.filter.logo": "Loogoo",
  "work.filter.social": "Miidiyaa Hawaasaa",
  "work.view": "Pirojektii Ilaali",

  "proj.danny.title": "Baanera Danny Graphics",
  "proj.danny.cat": "Braandii",
  "proj.abire.title": "Abire Kano Gold Maker",
  "proj.abire.cat": "Braandii",
  "proj.kiya.title": "Baanera Kiya Optics",
  "proj.kiya.cat": "Poostaraa",
  "proj.nurobe.title": "Poostara Hoteela Nuuroobee",
  "proj.nurobe.cat": "Poostaraa",
  "proj.melody.title": "Beeksisa Melody Store",
  "proj.melody.cat": "Miidiyaa Hawaasaa",
  "proj.hayyoota.title": "Haguuggii Muuziqaa Hayyoota",
  "proj.hayyoota.cat": "Poostaraa",
  "proj.ujb.title": "Loogoo Urjii Baalee",
  "proj.ujb.cat": "Loogoo",

  "contact.kicker": "Wajjin Haa Hojjennu",
  "contact.title": "Pirojektii kee jalqabi",
  "contact.subtitle": "Waa'ee yaada keetii natti himi, sa'aatii 24 keessatti deebii siif kenna.",
  "contact.form.name": "Maqaa kee",
  "contact.form.email": "Teessoo iimeelii",
  "contact.form.phone": "Bilbila (filannoo)",
  "contact.form.service": "Tajaajila barbaadame",
  "contact.form.service.placeholder": "Tajaajila filadhu",
  "contact.form.message": "Bal'ina pirojektii",
  "contact.form.file": "Wabii maxxansi (filannoo)",
  "contact.form.fileHint": "Faayilii asitti harkisi, yookin sakatta'uuf cuqaasi",
  "contact.form.submit": "Gaaffii Ergi",
  "contact.form.sending": "Ergaa jira...",
  "contact.form.success": "Galatoomi! Gaaffiin kee ergameera.",
  "contact.form.successDesc": "Yeroo dhiyootti sin qunnama.",
  "contact.form.again": "Biraa ergi",
  "contact.step": "Tarkaanfii",
  "contact.of": "kan",
  "contact.next": "Itti aanu",
  "contact.back": "Duubatti",
  "contact.err.name": "Maxxoo maqaa kee galchi",
  "contact.err.email": "Maxxoo iimeelii sirrii galchi",
  "contact.err.message": "Maxxoo pirojektii kee ibsi",

  "contact.reach": "Kallattiin na qunnami",
  "contact.phone": "Bilbila",
  "contact.email": "Iimeelii",
  "contact.location": "Bakka",
  "contact.locationValue": "Baalee, Roobee, Itoophiyaa",
  "contact.telegram": "Telegram",
  "contact.bizTelegram": "Telegram Daldalaa",
  "contact.follow": "Na hordofi",

  "footer.tagline": "Braandii namni yaadatu uumuu.",
  "footer.quick": "Hidhaa Saffisaa",
  "footer.connect": "Wal qunnami",
  "footer.rights": "Mirgi seeraan kan eegamedha.",
  "footer.made": "Of-eeggannoodhaan dizaayinii godhame.",

  "widget.title": "Qunnamtii Saffisaa",
  "widget.call": "Bilbili",
  "widget.message": "Ergaa",

  "chat.fab": "Danny AI waliin haasawi",
  "chat.title": "Danny — Gargaaraa AI",
  "chat.status": "Sarara irra · battalumatti deebisa",
  "chat.greeting":
    "👋 Akkam! Ani gargaaraa AI Daniel ti. Waa'ee tajaajilaa, gatii gaafadhu yookin pirojektii jalqabuuf gargaarsa argadhu. Afaan Ingiliffaa, Amaariffaa fi Afaan Oromoo nan dubbadha.",
  "chat.placeholder": "Ergaa kee barreessi...",
  "chat.send": "Ergi",
  "chat.error": "Dhiifama, rakkoon uumame. Maaloo irra deebi'ii yaali.",
  "chat.suggest1": "Tajaajiloota maalii dhiheessitu?",
  "chat.suggest2": "Loogoon meeqa baasa?",
  "chat.suggest3": "Pirojektii ajajuu barbaada",
  "chat.tabChat": "Haasawa AI",
  "chat.tabContact": "Na qunnami",
  "chat.clear": "Haasawa haaraa",
};

const dicts: Record<Lang, Dict> = { en, am, om };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dk-lang") as Lang | null;
      if (stored && dicts[stored]) setLangState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("dk-lang", l);
    } catch {
      /* ignore */
    }
  };

  const t = (key: string) => dicts[lang][key] ?? en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
