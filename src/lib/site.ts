import portrait from "@/assets/portrait.png.asset.json";
import logo from "@/assets/logo.png.asset.json";
import workDanny from "@/assets/work-danny.jpg.asset.json";
import workAbire from "@/assets/work-abire.jpg.asset.json";
import workKiya from "@/assets/work-kiya.jpg.asset.json";
import workNurobe from "@/assets/work-nurobe.jpg.asset.json";
import workMelody from "@/assets/work-melody.jpg.asset.json";
import workHayyoota from "@/assets/work-hayyoota.jpg.asset.json";
import workUjb from "@/assets/work-ujb.jpg.asset.json";

export const IMAGES = {
  portrait: portrait.url,
  logo: logo.url,
};

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
};

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
  { id: "danny", image: workDanny.url, titleKey: "proj.danny.title", catKey: "proj.danny.cat", category: "branding", span: true },
  { id: "nurobe", image: workNurobe.url, titleKey: "proj.nurobe.title", catKey: "proj.nurobe.cat", category: "poster" },
  { id: "hayyoota", image: workHayyoota.url, titleKey: "proj.hayyoota.title", catKey: "proj.hayyoota.cat", category: "poster" },
  { id: "melody", image: workMelody.url, titleKey: "proj.melody.title", catKey: "proj.melody.cat", category: "social" },
  { id: "kiya", image: workKiya.url, titleKey: "proj.kiya.title", catKey: "proj.kiya.cat", category: "poster", span: true },
  { id: "abire", image: workAbire.url, titleKey: "proj.abire.title", catKey: "proj.abire.cat", category: "branding" },
  { id: "ujb", image: workUjb.url, titleKey: "proj.ujb.title", catKey: "proj.ujb.cat", category: "logo" },
];
