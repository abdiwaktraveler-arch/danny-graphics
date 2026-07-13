import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AuditValue = string | number | boolean | null;

export type AuditEntry = {
  id: string;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  summary: string;
  details: Record<string, AuditValue>;
  created_at: string;
};

const recordSchema = z.object({
  action: z.enum(["create", "update", "delete"]),
  entity: z.enum(["work", "site_text", "account"]),
  entity_id: z.string().max(200).optional().nullable(),
  summary: z.string().min(1).max(300),
  details: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
});

/**
 * Records a dashboard action. Any signed-in account is treated as an admin for
 * this site, so the actor comes from the verified session token.
 */
export const recordAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => recordSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const actorEmail =
      ((claims as Record<string, unknown> | undefined)?.email as string | undefined) ?? null;

    const { error } = await supabase.from("admin_audit_log").insert({
      actor_id: userId,
      actor_email: actorEmail,
      action: data.action,
      entity: data.entity,
      entity_id: data.entity_id ?? null,
      summary: data.summary,
      details: (data.details ?? {}) as Record<string, AuditValue>,
    });
    if (error) {
      console.error("Audit log insert failed:", error);
      return { ok: false };
    }
    return { ok: true };
  });

/** Returns the most recent dashboard actions. */
export const getAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AuditEntry[]> => {
    const { supabase } = context;

    const { data, error } = await supabase
      .from("admin_audit_log")
      .select("id,actor_email,action,entity,entity_id,summary,details,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as AuditEntry[];
  });
