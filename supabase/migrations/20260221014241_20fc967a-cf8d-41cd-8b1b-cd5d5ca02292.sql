
-- Crop listings table for farmers to list their produce
CREATE TABLE public.crop_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT,
  farmer_district TEXT NOT NULL,
  farmer_village TEXT,
  crop_name TEXT NOT NULL,
  crop_category TEXT NOT NULL DEFAULT 'Other',
  quantity_quintals NUMERIC NOT NULL CHECK (quantity_quintals > 0),
  expected_price_per_quintal NUMERIC NOT NULL CHECK (expected_price_per_quintal > 0),
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Purchase requests from buyers
CREATE TABLE public.purchase_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.crop_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_email TEXT,
  quantity_quintals NUMERIC NOT NULL CHECK (quantity_quintals > 0),
  offered_price_per_quintal NUMERIC NOT NULL CHECK (offered_price_per_quintal > 0),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

-- Crop listings policies
CREATE POLICY "Anyone can view available listings"
  ON public.crop_listings FOR SELECT
  USING (is_available = true);

CREATE POLICY "Farmers can view their own listings"
  ON public.crop_listings FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can create listings"
  ON public.crop_listings FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update their own listings"
  ON public.crop_listings FOR UPDATE
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete their own listings"
  ON public.crop_listings FOR DELETE
  USING (auth.uid() = farmer_id);

-- Purchase requests policies
CREATE POLICY "Buyers can view their own requests"
  ON public.purchase_requests FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Farmers can view requests for their listings"
  ON public.purchase_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crop_listings
      WHERE crop_listings.id = purchase_requests.listing_id
      AND crop_listings.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create purchase requests"
  ON public.purchase_requests FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Farmers can update request status"
  ON public.purchase_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.crop_listings
      WHERE crop_listings.id = purchase_requests.listing_id
      AND crop_listings.farmer_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_crop_listings_updated_at
  BEFORE UPDATE ON public.crop_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at
  BEFORE UPDATE ON public.purchase_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
