-- =====================================================
-- Disable Email Confirmation for Development
-- =====================================================
-- WARNING: This is for DEVELOPMENT ONLY
-- In production, you should keep email confirmation enabled
-- and use a proper backend or Edge Function for user creation

-- Option 1: Via Supabase Dashboard (Recommended)
-- Go to: Authentication → Settings → Email Auth
-- Uncheck "Enable email confirmations"
-- Save changes

-- Option 2: Via SQL (if you have access to auth schema)
-- UPDATE auth.config SET value = 'false' WHERE name = 'enable_signup';
-- This is usually not accessible in self-hosted Supabase Studio

-- =====================================================
-- Alternative: Create Signup Trigger to Auto-Confirm
-- =====================================================
-- This trigger automatically confirms users when they sign up

CREATE OR REPLACE FUNCTION auto_confirm_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the user
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger requires access to auth schema
-- which may not be available in Supabase Studio
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   BEFORE INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_confirm_users();

-- =====================================================
-- Best Practice for Production
-- =====================================================
-- For production, use one of these approaches:
-- 
-- 1. Supabase Edge Function with SERVICE_ROLE key
-- 2. Backend API endpoint with SERVICE_ROLE key
-- 3. Manual user creation via Supabase Dashboard
-- 4. Invite-based system with magic links

