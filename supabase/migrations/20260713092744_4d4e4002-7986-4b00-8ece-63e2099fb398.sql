-- Make the dashboard password-gated instead of role-gated.
-- Any authenticated user can manage this single-owner site.

-- Works
DROP POLICY IF EXISTS "Admins can insert works" ON public.works;
DROP POLICY IF EXISTS "Admins can update works" ON public.works;
DROP POLICY IF EXISTS "Admins can delete works" ON public.works;

CREATE POLICY "Signed-in users can insert works"
  ON public.works FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Signed-in users can update works"
  ON public.works FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Signed-in users can delete works"
  ON public.works FOR DELETE TO authenticated
  USING (true);

-- Site content
DROP POLICY IF EXISTS "Admins can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;

CREATE POLICY "Signed-in users can insert site content"
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Signed-in users can update site content"
  ON public.site_content FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Signed-in users can delete site content"
  ON public.site_content FOR DELETE TO authenticated
  USING (true);

-- Bookings
DROP POLICY IF EXISTS "Admins can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

CREATE POLICY "Signed-in users can view bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Signed-in users can update bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Signed-in users can delete bookings"
  ON public.bookings FOR DELETE TO authenticated
  USING (true);

-- Audit log
DROP POLICY IF EXISTS "Admins can view audit log" ON public.admin_audit_log;

CREATE POLICY "Signed-in users can view audit log"
  ON public.admin_audit_log FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Signed-in users can create audit log"
  ON public.admin_audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);

-- Storage permissions for dashboard media.
DROP POLICY IF EXISTS "Admins can upload work images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update work images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete work images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view work images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view booking attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete booking attachments" ON storage.objects;

CREATE POLICY "Signed-in users can upload work images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'work-images');

CREATE POLICY "Signed-in users can update work images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'work-images')
  WITH CHECK (bucket_id = 'work-images');

CREATE POLICY "Signed-in users can delete work images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'work-images');

CREATE POLICY "Signed-in users can view work images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'work-images');

CREATE POLICY "Signed-in users can view booking attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'booking-attachments');

CREATE POLICY "Signed-in users can delete booking attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'booking-attachments');