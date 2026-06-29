import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().default(""),
  service: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(1).max(4000),
  attachmentUrl: z.string().trim().max(1000).optional().default(""),
  locale: z.string().trim().max(8).optional().default(""),
});

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function notifyTelegram(input: {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  locale: string;
}) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const connKey = process.env.TELEGRAM_API_KEY;
  if (!lovableKey || !connKey) return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: recipients } = await supabaseAdmin
    .from("telegram_recipients")
    .select("chat_id");

  if (!recipients || recipients.length === 0) return;

  const lines = [
    "🎨 <b>New Booking Request</b>",
    "",
    `👤 <b>Name:</b> ${esc(input.name)}`,
    `✉️ <b>Email:</b> ${esc(input.email)}`,
    input.phone ? `📞 <b>Phone:</b> ${esc(input.phone)}` : "",
    input.service ? `🛠 <b>Service:</b> ${esc(input.service)}` : "",
    input.locale ? `🌐 <b>Language:</b> ${esc(input.locale)}` : "",
    "",
    `📝 <b>Details:</b>\n${esc(input.message)}`,
  ].filter(Boolean);

  const text = lines.join("\n");

  await Promise.allSettled(
    recipients.map((r) =>
      fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: r.chat_id,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }),
    ),
  );
}

export const Route = createFileRoute("/api/public/bookings/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = bookingSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { error: "Please check your details and try again." },
            { status: 400 },
          );
        }
        const d = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: booking, error } = await supabaseAdmin
          .from("bookings")
          .insert({
            name: d.name,
            email: d.email,
            phone: d.phone || null,
            service: d.service || null,
            message: d.message,
            attachment_url: d.attachmentUrl || null,
            locale: d.locale || null,
          })
          .select("id")
          .single();

        if (error || !booking) {
          console.error("Booking insert error:", error);
          return Response.json({ error: "Could not save your request." }, { status: 500 });
        }

        // Fire-and-forget notification (do not block / fail the user submission).
        try {
          await notifyTelegram(d);
        } catch (err) {
          console.error("Telegram notify error:", err);
        }

        return Response.json({ ok: true, id: booking.id });
      },
    },
  },
});
