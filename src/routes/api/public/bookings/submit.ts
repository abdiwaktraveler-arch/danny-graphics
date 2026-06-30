import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().default(""),
  service: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(1).max(4000),
  locale: z.string().trim().max(8).optional().default(""),
});

// Server-side upload constraints (defense in depth — the bucket is no longer
// writable from the client).
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);
const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

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
        const contentType = request.headers.get("content-type") ?? "";

        // Parse the text fields and the optional file from multipart form data.
        let fields: Record<string, string> = {};
        let file: File | null = null;

        try {
          if (contentType.includes("multipart/form-data")) {
            const fd = await request.formData();
            fields = {
              name: String(fd.get("name") ?? ""),
              email: String(fd.get("email") ?? ""),
              phone: String(fd.get("phone") ?? ""),
              service: String(fd.get("service") ?? ""),
              message: String(fd.get("message") ?? ""),
              locale: String(fd.get("locale") ?? ""),
            };
            const f = fd.get("file");
            if (f instanceof File && f.size > 0) file = f;
          } else {
            // Backwards-compatible JSON path (no attachment).
            const raw = (await request.json()) as Record<string, unknown>;
            fields = {
              name: String(raw.name ?? ""),
              email: String(raw.email ?? ""),
              phone: String(raw.phone ?? ""),
              service: String(raw.service ?? ""),
              message: String(raw.message ?? ""),
              locale: String(raw.locale ?? ""),
            };
          }
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const parsed = bookingSchema.safeParse(fields);
        if (!parsed.success) {
          return Response.json(
            { error: "Please check your details and try again." },
            { status: 400 },
          );
        }
        const d = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Validate & store the attachment server-side (the bucket is not
        // client-writable). Reject oversized or disallowed file types.
        let attachmentPath: string | null = null;
        if (file) {
          if (file.size > MAX_FILE_BYTES) {
            return Response.json({ error: "File must be under 10MB." }, { status: 400 });
          }
          const mime = file.type.toLowerCase();
          const ext = EXT_BY_MIME[mime];
          if (!ALLOWED_MIME.has(mime) || !ext) {
            return Response.json(
              { error: "Unsupported file type. Upload an image or PDF." },
              { status: 400 },
            );
          }
          const path = `${crypto.randomUUID()}.${ext}`;
          const bytes = new Uint8Array(await file.arrayBuffer());
          const { error: upErr } = await supabaseAdmin.storage
            .from("booking-attachments")
            .upload(path, bytes, { contentType: mime, upsert: false });
          if (upErr) {
            console.error("Attachment upload error:", upErr);
            return Response.json({ error: "Could not upload your file." }, { status: 500 });
          }
          attachmentPath = path;
        }

        const { data: booking, error } = await supabaseAdmin
          .from("bookings")
          .insert({
            name: d.name,
            email: d.email,
            phone: d.phone || null,
            service: d.service || null,
            message: d.message,
            attachment_url: attachmentPath,
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
