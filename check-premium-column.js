// Simple migration script for adding isPremium column
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qotancrrdsciwwzavwxe.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdGFuY3JyZHNjaXd3emF2d3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTE4NzgsImV4cCI6MjA0OTA2Nzg3OH0.0V2D9QKXMIz0cQCKXLIaL5jRgC9Mh0-iSvkGHo-Aonw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPremiumColumn() {
  console.log("🚀 Adding isPremium column...");

  try {
    // First check if column exists
    const { data: tableInfo } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (tableInfo && tableInfo.length > 0) {
      const hasIsPremium = "is_premium" in tableInfo[0];

      if (hasIsPremium) {
        console.log("✅ isPremium column already exists");
      } else {
        console.log(
          "❌ isPremium column does not exist. Please run the SQL migration manually."
        );
        console.log("SQL to run:");
        console.log(
          "ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;"
        );
      }

      // Show sample data
      console.log("Sample profile data:", tableInfo[0]);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

addPremiumColumn();
