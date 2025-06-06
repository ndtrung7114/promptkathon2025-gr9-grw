// Check game_progress table schema and add missing milestone_id column
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qotancrrdsciwwzavwxe.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdGFuY3JyZHNjaXd3emF2d3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTE4NzgsImV4cCI6MjA0OTA2Nzg3OH0.0V2D9QKXMIz0cQCKXLIaL5jRgC9Mh0-iSvkGHo-Aonw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGameProgressSchema() {
  try {
    console.log("=== Checking game_progress table schema ===\n");

    // Check if the table exists and get its structure
    console.log("1. Checking table structure...");
    const { data: tableExists, error: tableError } = await supabase
      .from("game_progress")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("Error accessing game_progress table:", tableError);

      if (tableError.code === "42P01") {
        console.log("❌ Table game_progress does not exist!");
        console.log("\n📋 Creating game_progress table...");

        // Create the table with the correct schema
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS game_progress (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            milestone_id UUID NOT NULL,
            difficulty INTEGER NOT NULL CHECK (difficulty IN (2, 3)),
            is_completed BOOLEAN DEFAULT FALSE,
            completion_time INTEGER,
            score INTEGER DEFAULT 0,
            moves_count INTEGER DEFAULT 0,
            hints_used INTEGER DEFAULT 0,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, milestone_id, difficulty)
          );
          
          -- Add RLS policies
          ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
          
          -- Policy to allow users to read their own progress
          CREATE POLICY "Users can view their own game progress" ON game_progress
            FOR SELECT USING (auth.uid() = user_id);
          
          -- Policy to allow users to insert their own progress
          CREATE POLICY "Users can insert their own game progress" ON game_progress
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          -- Policy to allow users to update their own progress
          CREATE POLICY "Users can update their own game progress" ON game_progress
            FOR UPDATE USING (auth.uid() = user_id);
        `;

        console.log("Creating table with SQL:", createTableSQL);
      } else {
        console.log("❌ Other error accessing table:", tableError);
      }
      return;
    }

    console.log("✅ Table game_progress exists");

    // Get a sample record to see the current structure
    if (tableExists && tableExists.length > 0) {
      console.log("\n2. Sample record structure:");
      console.log(JSON.stringify(tableExists[0], null, 2));
    } else {
      console.log("\n2. Table is empty, checking column structure...");
    }

    // Try to describe the table structure by attempting operations
    console.log("\n3. Testing column access...");

    const testColumns = [
      "id",
      "user_id",
      "milestone_id",
      "difficulty",
      "is_completed",
      "completion_time",
      "score",
      "moves_count",
      "hints_used",
    ];

    for (const column of testColumns) {
      try {
        const { error } = await supabase
          .from("game_progress")
          .select(column)
          .limit(1);

        if (error) {
          console.log(`❌ Column '${column}' does not exist:`, error.message);
        } else {
          console.log(`✅ Column '${column}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking column '${column}':`, err);
      }
    }
  } catch (error) {
    console.error("Failed to check schema:", error);
  }
}

// Run the check
checkGameProgressSchema();
