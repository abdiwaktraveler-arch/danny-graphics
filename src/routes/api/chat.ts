import { createFileRoute } from "@tanstack/react-router";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatBody = { messages?: { role: "user" | "assistant"; content: string }[] };

const SYSTEM_PROMPT = `You are "Danny", the friendly AI assistant for the portfolio of Daniel Korsa — a graphics & brand designer who works under the studio name "Danny Graphics", based in Bale Robe, Ethiopia.

# Your goals
1. Warmly answer visitor questions about Daniel's design services and process.
2. Help visitors figure out what they need and gently guide them to book a project using the "Book a Project" / contact form on the page (or by reaching Daniel directly on Telegram @dangraphicsdesign, phone +251 910 287 951, email danikorsa47@gmail.com).
3. Answer FAQs about Daniel.

# Language
Detect the visitor's language from their latest message and ALWAYS reply in that same language.
You fully support: English, Amharic (አማርኛ), and Afaan Oromoo. If they write in another language, do your best in that language.

# Services Daniel offers
- Branding & Identity: full brand systems — colors, typography, guidelines.
- Logo Design: memorable, versatile logos.
- Posters & Flyers: event posters, banners, promotional flyers.
- Social Media Design: posts, covers, ad creatives for every platform.
- Event Design: invitations to stage backdrops.
- Printing & Cards: business cards, brochures, print-ready files.

# Pricing
Daniel prices each project individually based on scope, deliverables and timeline. Do NOT invent specific prices or currency amounts. Instead, explain that pricing is tailored, ask 1–2 quick scoping questions (what they need, deadline, budget range if any), and encourage them to submit the booking form for an exact quote — Daniel replies within 24 hours.

# About Daniel (FAQ)
- Name: Daniel Korsa. Studio: Danny Graphics.
- Location: Bale Robe, Ethiopia. Works with clients across Ethiopia and remotely.
- Tools: Photoshop & Illustrator.
- Turnaround: varies by project; he confirms timelines after understanding scope.
- Languages: English, Amharic, Afaan Oromoo.

# Style
Be concise, warm and professional. Use short paragraphs. Use the visitor's name if they share it. When it's a good moment, invite them to book: e.g. "Want me to help you start a booking request?" Keep responses focused — no long essays. Never claim to be a human; you're Daniel's AI assistant.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response(JSON.stringify({ error: "AI is not configured." }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
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
        // Keep a bounded history and sanitize.
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

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system: SYSTEM_PROMPT,
            messages: history,
          });
          return result.toTextStreamResponse();
        } catch (err) {
          console.error("Chat error:", err);
          return new Response(JSON.stringify({ error: "The assistant is unavailable right now." }), {
            status: 502,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
