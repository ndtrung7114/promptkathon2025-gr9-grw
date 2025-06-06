# 🔧 Quick Fix for RLS Policy Error

The error you're seeing is due to an infinite recursion in the Row Level Security policies. Here's how to fix it:

## 🚨 The Problem

The error "infinite recursion detected in policy for relation admin_users" occurs because the RLS policies are referencing the `admin_users` table in a circular way.

## ✅ The Solution

### Step 1: Run the Fix SQL Script

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the `fix-rls-policies.sql` file

**Or copy and paste this SQL directly:**

```sql
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can manage milestones" ON public.milestones;
DROP POLICY IF EXISTS "Admins can read all progress" ON public.user_campaign_progress;

-- Create simplified policies
CREATE POLICY "Authenticated users can manage campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage milestones" ON public.milestones
  FOR ALL USING (auth.uid() IS NOT NULL);
```

### Step 2: Test the Fix

After running the SQL, refresh your website. The campaign database test should now work properly.

## 🎯 What This Does

- Removes the circular dependency on `admin_users` table
- Allows any authenticated user to manage campaigns (you can restrict this later)
- Keeps the public read access for campaigns and milestones
- Maintains user-specific access for progress tracking

## 🔄 After the Fix

Once this is working, you can set up proper admin role restrictions later when you implement the admin panel.

## ⚡ Quick Test

1. Run the SQL fix
2. Refresh your website
3. Check the browser console - the recursion error should be gone
4. The CampaignDatabaseTest component should show green checkmarks
