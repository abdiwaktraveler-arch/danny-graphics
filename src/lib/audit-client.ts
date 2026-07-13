import { supabase } from "@/integrations/supabase/client";

type AuditValue = string | number | boolean | null;

type AuditInput = {
  action: "create" | "update" | "delete";
  entity: "work" | "site_text" | "account";
  entity_id?: string | null;
  summary: string;
  details?: Record<string, AuditValue>;
};

export async function recordClientAudit(input: AuditInput) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return supabase.from("admin_audit_log").insert({
    actor_id: user?.id ?? null,
    actor_email: user?.email ?? null,
    action: input.action,
    entity: input.entity,
    entity_id: input.entity_id ?? null,
    summary: input.summary,
    details: input.details ?? {},
  });
}