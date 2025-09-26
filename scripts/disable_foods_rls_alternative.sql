-- Alternative approach: Disable RLS for foods table
-- Use this only if the comprehensive RLS policies don't work
-- This makes the foods table accessible to all authenticated users without restrictions

-- Disable RLS on foods table
ALTER TABLE public.foods DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with more permissive policies
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Create a single permissive policy for all operations
CREATE POLICY "foods_policy_all_operations" ON public.foods
    FOR ALL USING (true) WITH CHECK (true);

-- Grant all necessary permissions
GRANT ALL ON public.foods TO authenticated;
GRANT ALL ON public.foods TO anon;