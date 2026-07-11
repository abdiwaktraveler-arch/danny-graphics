/**
 * Text fields that the admin can override from the dashboard.
 * Each key maps to an i18n key in src/lib/i18n.tsx. When a value is saved in
 * the site_content table it overrides the built-in default for that language.
 */
export type EditableField = { key: string; label: string; multiline?: boolean };
export type EditableSection = { title: string; fields: EditableField[] };

export const EDITABLE_SECTIONS: EditableSection[] = [
  {
    title: "Hero",
    fields: [
      { key: "hero.role", label: "Role / subtitle" },
      { key: "hero.tagline", label: "Tagline", multiline: true },
      { key: "hero.badge", label: "Availability badge" },
    ],
  },
  {
    title: "About",
    fields: [
      { key: "about.title", label: "Section title" },
      { key: "about.p1", label: "Paragraph 1", multiline: true },
      { key: "about.p2", label: "Paragraph 2", multiline: true },
      { key: "about.philosophy", label: "Design philosophy", multiline: true },
    ],
  },
  {
    title: "Services",
    fields: [
      { key: "services.title", label: "Section title" },
      { key: "services.subtitle", label: "Subtitle", multiline: true },
    ],
  },
  {
    title: "Work",
    fields: [
      { key: "work.title", label: "Section title" },
      { key: "work.subtitle", label: "Subtitle", multiline: true },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "contact.title", label: "Section title" },
      { key: "contact.subtitle", label: "Subtitle", multiline: true },
    ],
  },
];
