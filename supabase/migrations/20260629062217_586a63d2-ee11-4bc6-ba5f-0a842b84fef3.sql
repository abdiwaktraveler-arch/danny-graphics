CREATE POLICY "Anyone can upload booking attachments"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'booking-attachments');