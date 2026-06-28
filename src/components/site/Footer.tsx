import { Phone, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CONTACT, IMAGES } from "@/lib/site";
import { SocialRow } from "./socials";

const links = [
  { id: "home", key: "nav.home" },
  { id: "about", key: "nav.about" },
  { id: "services", key: "nav.services" },
  { id: "work", key: "nav.work" },
  { id: "contact", key: "nav.contact" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border py-14">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-[80%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={IMAGES.logo} alt="Danny Graphics logo" className="h-10 w-10 object-contain" />
              <span className="font-display text-lg font-bold">
                Danny Graphics<span className="text-gradient-gold">.</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="mt-5">
              <SocialRow />
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("footer.quick")}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollTo(l.id)}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(l.key)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("footer.connect")}
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={CONTACT.phoneHref} className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-primary">
                  <Phone className="h-4 w-4 text-gold" /> {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={CONTACT.emailHref} className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-primary">
                  <Mail className="h-4 w-4 text-gold" /> {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold" /> {t("contact.locationValue")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>
            © {year} Daniel Korsa — Danny Graphics. {t("footer.rights")}
          </p>
          <p>{t("footer.made")}</p>
        </div>
      </div>
    </footer>
  );
}
