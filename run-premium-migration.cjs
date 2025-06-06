const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://qotancrrdsciwwzavwxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdGFuY3JyZHNjaXd3emF2d3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTE4NzgsImV4cCI6MjA0OTA2Nzg3OH0.0V2D9QKXMIz0cQCKXLIaL5jRgC9Mh0-iSvkGHo-Aonw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runPremiumMigration() {
  try {
    console.log('🚀 Adding isPremium column to profiles table...');
    
    // Add the isPremium column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add isPremium column to profiles table
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
        
        -- Create an index for faster queries on premium status
        CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);
      `
    });
    
    if (alterError) {
      console.error('❌ Error adding column:', alterError);
      return;
    }
    
    console.log('✅ isPremium column added successfully');
    
    // Update the handle_new_user function
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user() 
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, full_name, is_premium)
          VALUES (new.id, new.email, new.raw_user_meta_data->>'name', false)
          ON CONFLICT (id) DO NOTHING;
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (functionError) {
      console.error('❌ Error updating function:', functionError);
      return;
    }
    
    console.log('✅ handle_new_user function updated successfully');
    
    // Verify the column was added by checking a sample record
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, is_premium')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Error verifying column:', profileError);
      return;
    }
    
    if (profileData && profileData.length > 0) {
      console.log('✅ Verification successful. Sample profile:', {
        id: profileData[0].id,
        email: profileData[0].email,
        is_premium: profileData[0].is_premium
      });
    }
    
    // Update all existing users to have is_premium = false if null
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_premium: false })
      .is('is_premium', null);
    
    if (updateError) {
      console.warn('⚠️ Warning updating existing records:', updateError);
    } else {
      console.log('✅ Updated existing records to set is_premium = false');
    }
    
    console.log('🎉 Premium feature migration completed successfully!');
    
  } catch (err) {
    console.error('💥 Migration error:', err);
  }
}

runPremiumMigration();
