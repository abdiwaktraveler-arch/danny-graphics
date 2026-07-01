import { createFileRoute } from "@tanstack/react-router";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createOpenAiProvider } from "@/lib/openai-provider.server";
import { OWNER, CONTACT, CONTACT_SUMMARY } from "@/lib/site";

type ChatBody = { messages?: { role: "user" | "assistant"; content: string }[] };

const SYSTEM_PROMPT = `You are "Danny", the friendly AI assistant for the portfolio of ${OWNER.name} — a ${OWNER.role.toLowerCase()} who works under the studio name "${OWNER.studio}", based in ${OWNER.location}.

# Your goals
1. Warmly answer visitor questions about ${OWNER.name}'s design services and process.
2. Help visitors figure out what they need and gently guide them to book a project using the "Book a Project" / contact form on the page (or by reaching ${OWNER.name} directly on Telegram ${CONTACT.bizTelegram} (${CONTACT.bizTelegramHref}), phone ${CONTACT.phone}, email ${CONTACT.email}).
3. Answer FAQs about ${OWNER.name}.

# Language
Detect the visitor's language from their latest message and ALWAYS reply in that same language.
You fully support: English, Amharic (አማርኛ), and Afaan Oromoo. If they write in another language, do your best in that language.

# Services ${OWNER.name} offers
- Branding & Identity: full brand systems — colors, typography, guidelines.
- Logo Design: memorable, versatile logos.
- Posters & Flyers: event posters, banners, promotional flyers.
- Social Media Design: posts, covers, ad creatives for every platform.
- Event Design: invitations to stage backdrops.
- Printing & Cards: business cards, brochures, print-ready files.

# Pricing
${OWNER.name} prices each project individually based on scope, deliverables and timeline. Do NOT invent specific prices or currency amounts. Instead, explain that pricing is tailored, ask 1–2 quick scoping questions (what they need, deadline, budget range if any), and encourage them to submit the booking form for an exact quote — ${OWNER.name} replies within 24 hours.

# About ${OWNER.name} (FAQ)
- Name: ${OWNER.name}. Studio: ${OWNER.studio}.
- Location: ${OWNER.location}. Works with clients across Ethiopia and remotely.
- Tools: ${OWNER.tools}.
- Turnaround: varies by project; he confirms timelines after understanding scope.
- Languages: ${OWNER.languages}.

# Contact details (always quote these exactly)
${CONTACT_SUMMARY}

# Style
Be concise, warm and professional. Use short paragraphs. Write in plain conversational text only — do NOT use markdown formatting (no **bold**, no ##headings, no asterisk bullet lists). If you list items, use simple short lines or commas. Use the visitor's name if they share it. When it's a good moment, invite them to book: e.g. "Want me to help you start a booking request?" Keep responses focused — no long essays. Never claim to be a human; you're ${OWNER.name}'s AI assistant.`;

/** JSON error the client can render as a friendly, actionable message. */
function configError(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 503,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const openaiKey = process.env.OPENAI_API_KEY;
        const lovableKey = process.env.LOVABLE_API_KEY;

        // Pick a provider. Prefer the user's own OpenAI key (works on any host,
        // incl. Vercel); fall back to the managed Lovable AI Gateway.
        let getModel: () => Parameters<typeof streamText>[0]["model"];
        if (openaiKey) {
          const openai = createOpenAiProvider(openaiKey);
          getModel = () => openai(process.env.OPENAI_MODEL || "gpt-4o-mini");
        } else if (lovableKey) {
          const gateway = createLovableAiGatewayProvider(lovableKey);
          getModel = () => gateway("google/gemini-3-flash-preview");
        } else {
          // Neither key is set — most commonly a missing env var on Vercel.
          return configError(
            "The AI assistant isn't configured on this deployment yet. " +
              "Add an OPENAI_API_KEY environment variable (in Vercel: Project → Settings → " +
              "Environment Variables, for both Production and Preview) and redeploy. " +
              "Meanwhile you can reach us on Telegram " +
              `${CONTACT.bizTelegram} or by phone at ${CONTACT.phone}.`,
          );
        }

        let body: ChatBody;
        try {
          body = (await request.json()) as ChatBody;
        } catch {
          return new Response(JSON.stringify({ error: "Invalid request." }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const incoming = Array.isArray(body.messages) ? body.messages : [];
        const history: ModelMessage[] = incoming
          .filter(
            (m) =>
              m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string" &&
              m.content.trim().length > 0,
          )
          .slice(-16)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

        if (history.length === 0) {
          return new Response(JSON.stringify({ error: "No message provided." }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const result = streamText({
            model: getModel(),
            system: SYSTEM_PROMPT,
            messages: history,
          });
          return result.toTextStreamResponse();
        } catch (err) {
          console.error("Chat error:", err);
          return new Response(
            JSON.stringify({
              error:
                "The assistant is temporarily unavailable. This can happen if the API key is " +
                "invalid or out of credits. Please try again shortly, or contact us directly on " +
                `Telegram ${CONTACT.bizTelegram}.`,
            }),
            { status: 502, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
