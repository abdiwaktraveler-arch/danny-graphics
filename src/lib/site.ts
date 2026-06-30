import portrait from "@/assets/portrait.png";
import logo from "@/assets/logo.png";
import workDanny from "@/assets/work-danny.jpg";
import workAbire from "@/assets/work-abire.jpg";
import workKiya from "@/assets/work-kiya.jpg";
import workNurobe from "@/assets/work-nurobe.jpg";
import workMelody from "@/assets/work-melody.jpg";
import workHayyoota from "@/assets/work-hayyoota.jpg";
import workUjb from "@/assets/work-ujb.jpg";

export const IMAGES = {
  portrait,
  logo,
};

/**
 * SINGLE SOURCE OF TRUTH for everything about Daniel / Danny Graphics.
 * Update values here and they automatically apply across the whole site
 * (components) AND the AI assistant (see PROFILE / CONTACT_SUMMARY below,
 * consumed by src/routes/api/chat.ts).
 */
export const OWNER = {
  name: "Daniel Korsa",
  studio: "Danny Graphics",
  role: "Graphics & Brand Designer",
  location: "Bale Robe, Ethiopia",
  tools: "Photoshop & Illustrator",
  languages: "English, Amharic, Afaan Oromoo",
} as const;

export const CONTACT = {
  phone: "+251 910 287 915",
  phoneHref: "tel:+251910287915",
  email: "danikorsa47@gmail.com",
  emailHref: "mailto:danikorsa47@gmail.com",
  location: "Bale, Robe, Ethiopia",
  telegram: "@dyekorsa",
  telegramHref: "https://t.me/dyekorsa",
  bizTelegram: "Danny Graphics",
  bizTelegramHref: "https://t.me/dangraphicsdesign",
  instagram: "@lij.dani.1",
  instagramHref: "https://instagram.com/lij.dani.1",
  linkedin: "Daniel Korsa",
  linkedinHref: "https://www.linkedin.com/in/daniel-korsa-1506523a4",
  tiktok: "@dannyk0rsa",
  tiktokHref: "https://www.tiktok.com/@dannyk0rsa",
} as const;

/**
 * A plain-text summary of the contact details, derived from CONTACT above so
 * the AI assistant always quotes the up-to-date phone / email / Telegram.
 * Import this into server code (e.g. the chat route) instead of hardcoding.
 */
export const CONTACT_SUMMARY =
  `Phone: ${CONTACT.phone}\n` +
  `Email: ${CONTACT.email}\n` +
  `Telegram (direct): ${CONTACT.telegram} (${CONTACT.telegramHref})\n` +
  `Telegram (studio): ${CONTACT.bizTelegram} (${CONTACT.bizTelegramHref})\n` +
  `Instagram: ${CONTACT.instagram} (${CONTACT.instagramHref})\n` +
  `TikTok: ${CONTACT.tiktok} (${CONTACT.tiktokHref})\n` +
  `Location: ${OWNER.location}`;

export type WorkCategory = "branding" | "poster" | "logo" | "social";

export interface Project {
  id: string;
  image: string;
  titleKey: string;
  catKey: string;
  category: WorkCategory;
  span?: boolean;
}

export const PROJECTS: Project[] = [
  { id: "danny", image: workDanny, titleKey: "proj.danny.title", catKey: "proj.danny.cat", category: "branding", span: true },
  { id: "nurobe", image: workNurobe, titleKey: "proj.nurobe.title", catKey: "proj.nurobe.cat", category: "poster" },
  { id: "hayyoota", image: workHayyoota, titleKey: "proj.hayyoota.title", catKey: "proj.hayyoota.cat", category: "poster" },
  { id: "melody", image: workMelody, titleKey: "proj.melody.title", catKey: "proj.melody.cat", category: "social" },
  { id: "kiya", image: workKiya, titleKey: "proj.kiya.title", catKey: "proj.kiya.cat", category: "poster", span: true },
  { id: "abire", image: workAbire, titleKey: "proj.abire.title", catKey: "proj.abire.cat", category: "branding" },
  { id: "ujb", image: workUjb, titleKey: "proj.ujb.title", catKey: "proj.ujb.cat", category: "logo" },
];
