// Test the updated game progress service with level_id
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qotancrrdsciwwzavwxe.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdGFuY3JyZHNjaXd3emF2d3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTE4NzgsImV4cCI6MjA0OTA2Nzg3OH0.0V2D9QKXMIz0cQCKXLIaL5jRgC9Mh0-iSvkGHo-Aonw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGameProgressService() {
  try {
    console.log("=== Testing Game Progress Service with level_id ===\n");

    // 1. Check table structure by trying to access common columns
    console.log("1. Testing table column access...");

    const testColumns = [
      "id",
      "user_id",
      "level_id",
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
          console.log(`❌ Column '${column}' error:`, error.message);
        } else {
          console.log(`✅ Column '${column}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking column '${column}':`, err.message);
      }
    }

    // 2. Test inserting a progress record
    console.log("\n2. Testing milestone completion insertion...");

    const testUserId = "test-user-" + Date.now();
    const testMilestoneId = "082b7dac-2f81-4d6b-8a84-05c75be42f4e"; // Sample milestone ID

    console.log(
      `Testing with userId: ${testUserId}, milestoneId: ${testMilestoneId}`
    );

    const { data: insertData, error: insertError } = await supabase
      .from("game_progress")
      .insert({
        user_id: testUserId,
        level_id: testMilestoneId,
        difficulty: 2,
        is_completed: true,
        completion_time: 120,
        score: 100,
        moves_count: 25,
        hints_used: 2,
      })
      .select()
      .single();

    if (insertError) {
      console.log("❌ Insert failed:", insertError);
    } else {
      console.log("✅ Successfully inserted milestone completion:", insertData);
    }

    // 3. Test retrieving completed milestones
    console.log("\n3. Testing retrieval of completed milestones...");

    const { data: completedData, error: selectError } = await supabase
      .from("game_progress")
      .select("level_id")
      .eq("user_id", testUserId)
      .eq("is_completed", true);

    if (selectError) {
      console.log("❌ Select failed:", selectError);
    } else {
      console.log(
        "✅ Successfully retrieved completed milestones:",
        completedData
      );

      const completedMilestoneIds = completedData.map((item) => item.level_id);
      console.log("Completed milestone IDs:", completedMilestoneIds);
    }

    // 4. Clean up test data
    console.log("\n4. Cleaning up test data...");

    const { error: deleteError } = await supabase
      .from("game_progress")
      .delete()
      .eq("user_id", testUserId);

    if (deleteError) {
      console.log("❌ Cleanup failed:", deleteError);
    } else {
      console.log("✅ Test data cleaned up successfully");
    }

    console.log("\n=== Game Progress Service Test Complete ===");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testGameProgressService();
