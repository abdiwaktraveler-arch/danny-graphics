import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "crypto";

function deriveSecret(apiKey: string): string {
  return createHash("sha256").update(`telegram-webhook:${apiKey}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function reply(chatId: number, text: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const connKey = process.env.TELEGRAM_API_KEY;
  if (!lovableKey || !connKey) return;
  await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const connKey = process.env.TELEGRAM_API_KEY;
        if (!connKey) return Response.json({ ok: true });

        const expected = deriveSecret(connKey);
        const actual = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(actual, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let update: {
          message?: {
            chat?: { id?: number; type?: string };
            from?: { first_name?: string; username?: string };
            text?: string;
          };
        };
        try {
          update = await request.json();
        } catch {
          return Response.json({ ok: true });
        }

        const msg = update.message;
        const chatId = msg?.chat?.id;
        if (!chatId) return Response.json({ ok: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("telegram_recipients").upsert(
          {
            chat_id: chatId,
            first_name: msg?.from?.first_name ?? null,
            username: msg?.from?.username ?? null,
          },
          { onConflict: "chat_id" },
        );

        const text = (msg?.text ?? "").trim().toLowerCase();
        if (text.startsWith("/start") || text.startsWith("/begin")) {
          await reply(
            chatId,
            "✅ <b>You're all set!</b>\nYou'll now receive instant alerts here whenever someone books a project through your portfolio. 🎨",
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
