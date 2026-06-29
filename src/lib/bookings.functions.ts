import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The email allowed to bootstrap the first admin account. */
const ADMIN_EMAIL = "danikorsa47@gmail.com";

export type BookingRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  attachment_url: string | null;
  attachment_signed_url: string | null;
  locale: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  return data === true;
}

/**
 * Ensures the signed-in user is an admin.
 * Bootstraps admin role for the owner email on first login.
 */
export const ensureAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    if (await isAdmin(supabase, userId)) {
      return { isAdmin: true };
    }

    const email = ((claims as Record<string, unknown> | undefined)?.email as string | undefined)?.toLowerCase();
    if (email && email === ADMIN_EMAIL) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) {
        console.error("Admin bootstrap error:", error);
        return { isAdmin: false };
      }
      return { isAdmin: true };
    }

    return { isAdmin: false };
  });

export const getBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BookingRow[]> => {
    const { supabase, userId } = context;
    if (!(await isAdmin(supabase, userId))) {
      throw new Error("Forbidden");
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const rows = await Promise.all(
      (data ?? []).map(async (b: any): Promise<BookingRow> => {
        let signed: string | null = null;
        if (b.attachment_url) {
          const { data: s } = await supabaseAdmin.storage
            .from("booking-attachments")
            .createSignedUrl(b.attachment_url, 60 * 60);
          signed = s?.signedUrl ?? null;
        }
        return { ...b, attachment_signed_url: signed };
      }),
    );

    return rows;
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "contacted", "in_progress", "done", "archived"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!(await isAdmin(supabase, userId))) {
      throw new Error("Forbidden");
    }
    const { error } = await supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!(await isAdmin(supabase, userId))) {
      throw new Error("Forbidden");
    }
    const { error } = await supabase.from("bookings").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
