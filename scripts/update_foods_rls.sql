-- Update RLS policies for foods table to allow INSERT operations
-- This allows authenticated users to add new food items to the database

-- Add INSERT policy for foods table
CREATE POLICY "Authenticated users can insert foods" ON public.foods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for foods table (in case we need to update existing foods)
CREATE POLICY "Authenticated users can update foods" ON public.foods
  FOR UPDATE USING (auth.role() = 'authenticated');