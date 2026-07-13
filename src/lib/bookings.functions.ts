import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

/**
 * The admin dashboard is intentionally password-gated only: any signed-in
 * account can access it. The `_authenticated` route and middleware verify the
 * password session before this function can run.
 */
export const ensureAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => ({ isAdmin: true }));

export const getBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BookingRow[]> => {
    const { supabase } = context;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = await Promise.all(
      (data ?? []).map(async (b: any): Promise<BookingRow> => {
        let signed: string | null = null;
        if (b.attachment_url) {
          const { data: s } = await supabase.storage
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
    const { supabase } = context;
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
    const { supabase } = context;
    const { error } = await supabase.from("bookings").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
