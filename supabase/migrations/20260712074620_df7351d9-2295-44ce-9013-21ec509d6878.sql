-- Thumbnail path for works (small compressed image used in grids)
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS thumb_path text;

-- Admin audit log: records uploads, edits, deletes, and site text changes
CREATE TABLE public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  summary text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read the audit log. Inserts are done server-side with the
-- service role, so no insert policy is granted to app users.
CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log (created_at DESC);