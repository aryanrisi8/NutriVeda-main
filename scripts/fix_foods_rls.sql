-- Fix RLS policies for foods table to allow INSERT and UPDATE operations
-- Run this script in Supabase SQL editor to resolve the RLS issues

-- First, drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "All authenticated users can view foods" ON public.foods;

-- Create comprehensive policies for foods table
-- Allow SELECT for all authenticated users
CREATE POLICY "authenticated_users_select_foods" ON public.foods
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow INSERT for all authenticated users
CREATE POLICY "authenticated_users_insert_foods" ON public.foods
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow UPDATE for all authenticated users
CREATE POLICY "authenticated_users_update_foods" ON public.foods
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Optional: Allow DELETE for all authenticated users (uncomment if needed)
-- CREATE POLICY "authenticated_users_delete_foods" ON public.foods
--     FOR DELETE USING (auth.role() = 'authenticated');

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.foods TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;