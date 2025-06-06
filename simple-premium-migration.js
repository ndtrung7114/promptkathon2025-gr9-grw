// Simple script to add isPremium column
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qotancrrdsciwwzavwxe.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdGFuY3JyZHNjaXd3emF2d3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTE4NzgsImV4cCI6MjA0OTA2Nzg3OH0.0V2D9QKXMIz0cQCKXLIaL5jRgC9Mh0-iSvkGHo-Aonw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndAddPremiumColumn() {
  try {
    console.log("🔍 Checking if isPremium column exists...");

    // Try to select is_premium column to see if it exists
    const { data, error } = await supabase
      .from("profiles")
      .select("is_premium")
      .limit(1);

    if (error) {
      if (error.message.includes('column "is_premium" does not exist')) {
        console.log("❌ isPremium column does not exist.");
        console.log("ℹ️ Please run this SQL manually in Supabase SQL Editor:");
        console.log(
          "ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;"
        );
        console.log(
          "CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);"
        );
      } else {
        console.error("❌ Error checking column:", error);
      }
    } else {
      console.log("✅ isPremium column already exists!");

      // Check a sample record
      const { data: sampleData, error: sampleError } = await supabase
        .from("profiles")
        .select("id, email, is_premium")
        .limit(5);

      if (sampleData) {
        console.log("📊 Sample profiles with isPremium status:");
        sampleData.forEach((profile) => {
          console.log(`- ${profile.email}: isPremium = ${profile.is_premium}`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Script error:", error);
  }
}

checkAndAddPremiumColumn();
