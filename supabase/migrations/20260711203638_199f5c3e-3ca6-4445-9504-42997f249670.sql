-- ============ WORKS (portfolio photos managed by admin) ============
CREATE TABLE public.works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'branding' CHECK (category IN ('branding','poster','logo','social')),
  image_path text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.works TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.works TO authenticated;
GRANT ALL ON public.works TO service_role;

ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view works"
  ON public.works FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert works"
  ON public.works FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update works"
  ON public.works FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete works"
  ON public.works FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_works_updated_at
  BEFORE UPDATE ON public.works
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SITE CONTENT (editable text overrides per locale) ============
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en','am','om')),
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key, locale)
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STORAGE: admin management of work images (private bucket) ============
CREATE POLICY "Admins can upload work images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'work-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update work images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'work-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'work-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete work images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'work-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view work images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'work-images' AND public.has_role(auth.uid(), 'admin'));