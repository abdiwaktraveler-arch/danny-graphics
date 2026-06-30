-- Lock down the booking-attachments storage bucket.
-- Remove the unrestricted public upload policy. Uploads will now go through the
-- server (service role), which validates file size and type before storing.
DROP POLICY IF EXISTS "Anyone can upload booking attachments" ON storage.objects;

-- Only admins may read uploaded attachments.
CREATE POLICY "Admins can view booking attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'booking-attachments'
  AND public.has_role(auth.uid(), 'admin')
);

-- Only admins may delete uploaded attachments.
CREATE POLICY "Admins can delete booking attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'booking-attachments'
  AND public.has_role(auth.uid(), 'admin')
);