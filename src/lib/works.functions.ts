import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { WorkCategory } from "@/lib/site";

export type PublicWork = {
  id: string;
  title: string;
  category: WorkCategory;
  url: string;
  /** Small, fast-loading version for grids. Falls back to `url`. */
  thumbUrl: string;
  featured: boolean;
  sort_order: number;
};

/**
 * Public list of portfolio works with freshly-signed image URLs.
 * No auth required — works are public content. The images live in a private
 * bucket (public buckets are disabled on this workspace), so we sign the URLs
 * server-side with the service role. Safe: only image URLs are exposed.
 */
export const getPublicWorks = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicWork[]> => {
    const url = process.env.SUPABASE_URL;
    const publishable = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishable) return [];

    const supabasePublic = createClient<Database>(url, publishable, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabasePublic
      .from("works")
      .select("id,title,category,image_path,thumb_path,featured,sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const paths = Array.from(
      new Set(
        data.flatMap((d) => [d.image_path, d.thumb_path].filter(Boolean) as string[]),
      ),
    );
    const { data: signed } = await supabaseAdmin.storage
      .from("work-images")
      .createSignedUrls(paths, 60 * 60 * 24 * 7);

    const urlByPath = new Map<string, string>();
    (signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
    });

    return data
      .map((d) => {
        const url = urlByPath.get(d.image_path) ?? "";
        const thumbUrl = (d.thumb_path && urlByPath.get(d.thumb_path)) || url;
        return {
          id: d.id,
          title: d.title,
          category: d.category as WorkCategory,
          url,
          thumbUrl,
          featured: d.featured,
          sort_order: d.sort_order,
        };
      })
      .filter((w) => w.url);
  },
);
