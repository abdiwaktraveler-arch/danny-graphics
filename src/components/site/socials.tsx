import { Instagram, Linkedin, Send, Music2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CONTACT } from "@/lib/site";

export interface Social {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const SOCIALS: Social[] = [
  { label: "Telegram", href: CONTACT.telegramHref, icon: Send },
  { label: "Instagram", href: CONTACT.instagramHref, icon: Instagram },
  { label: "LinkedIn", href: CONTACT.linkedinHref, icon: Linkedin },
  { label: "TikTok", href: CONTACT.tiktokHref, icon: Music2 },
];

export function SocialRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {SOCIALS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="flex h-11 w-11 items-center justify-center rounded-full glass text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:text-primary hover:shadow-glow"
        >
          <s.icon className="h-[18px] w-[18px]" />
        </a>
      ))}
    </div>
  );
}
