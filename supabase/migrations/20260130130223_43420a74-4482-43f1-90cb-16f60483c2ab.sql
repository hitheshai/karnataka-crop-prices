-- Fix the overly permissive INSERT policy for price_history
-- Only allow inserts from authenticated service role (edge functions)
DROP POLICY IF EXISTS "System can insert price history" ON public.price_history;

-- Create a more secure insert policy - only service role can insert via edge functions
-- Regular users cannot insert directly
CREATE POLICY "Service can insert price history"
ON public.price_history
FOR INSERT
WITH CHECK (false);

-- Note: Edge functions using service role key bypass RLS, so this is secure