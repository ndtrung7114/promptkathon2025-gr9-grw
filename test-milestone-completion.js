// Test script to verify milestone completion with actual database IDs
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qotancrrdsciwwzavwxe.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdGFuY3JyZHNjaXd3emF2d3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTE4NzgsImV4cCI6MjA0OTA2Nzg3OH0.0V2D9QKXMIz0cQCKXLIaL5jRgC9Mh0-iSvkGHo-Aonw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMilestoneCompletion() {
  try {
    console.log("=== Testing Milestone Completion with Database IDs ===\n");

    // 1. First, let's get some actual campaign and milestone data
    console.log("1. Fetching campaigns and milestones...");
    const { data: campaigns, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, slug, title")
      .eq("is_active", true)
      .limit(1);

    if (campaignError) {
      console.error("Error fetching campaigns:", campaignError);
      return;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("No campaigns found");
      return;
    }

    const campaign = campaigns[0];
    console.log(
      `Found campaign: ${campaign.title} (ID: ${campaign.id}, Slug: ${campaign.slug})`
    );

    // 2. Get milestones for this campaign
    const { data: milestones, error: milestoneError } = await supabase
      .from("milestones")
      .select("id, slug, title, campaign_id")
      .eq("campaign_id", campaign.id)
      .eq("is_active", true)
      .limit(2);

    if (milestoneError) {
      console.error("Error fetching milestones:", milestoneError);
      return;
    }

    if (!milestones || milestones.length === 0) {
      console.log("No milestones found for this campaign");
      return;
    }

    console.log(`Found ${milestones.length} milestones:`);
    milestones.forEach((m) => {
      console.log(`  - ${m.title} (ID: ${m.id}, Slug: ${m.slug})`);
    });

    // 3. Test user ID (using a test user ID)
    const testUserId = "test-user-123";
    console.log(`\n2. Testing with user ID: ${testUserId}`);

    // 4. Check initial completion status
    console.log("\n3. Checking initial completion status...");
    const { data: initialProgress, error: initialError } = await supabase
      .from("game_progress")
      .select("milestone_id, is_completed, difficulty")
      .eq("user_id", testUserId);

    if (initialError) {
      console.error("Error checking initial progress:", initialError);
    } else {
      console.log(
        `Initial completed milestones: ${initialProgress?.length || 0}`
      );
      if (initialProgress && initialProgress.length > 0) {
        initialProgress.forEach((p) => {
          console.log(
            `  - Milestone ${p.milestone_id}: ${
              p.is_completed ? "Completed" : "Not completed"
            } (Difficulty: ${p.difficulty})`
          );
        });
      }
    }

    // 5. Test marking a milestone as completed using actual database ID
    const testMilestone = milestones[0];
    console.log(
      `\n4. Marking milestone as completed: ${testMilestone.title} (${testMilestone.id})`
    );

    const { error: markError } = await supabase.from("game_progress").upsert({
      user_id: testUserId,
      milestone_id: testMilestone.id, // Using actual database UUID
      difficulty: 2,
      is_completed: true,
      completion_time: 120,
      score: 100,
      moves_count: 25,
      hints_used: 2,
      completed_at: new Date().toISOString(),
    });

    if (markError) {
      console.error("Error marking milestone as completed:", markError);
    } else {
      console.log("✅ Successfully marked milestone as completed");
    }

    // 6. Verify the completion was recorded correctly
    console.log("\n5. Verifying completion...");
    const { data: completedMilestones, error: verifyError } = await supabase
      .from("game_progress")
      .select("milestone_id")
      .eq("user_id", testUserId)
      .eq("is_completed", true);

    if (verifyError) {
      console.error("Error verifying completion:", verifyError);
    } else {
      console.log(
        `✅ Found ${completedMilestones?.length || 0} completed milestones:`
      );
      if (completedMilestones) {
        completedMilestones.forEach((m) => {
          console.log(`  - ${m.milestone_id}`);
        });
      }
    }

    // 7. Test the progression logic
    if (milestones.length > 1) {
      const secondMilestone = milestones[1];
      console.log(
        `\n6. Testing progression logic for: ${secondMilestone.title} (${secondMilestone.id})`
      );

      // Check if first milestone is completed (should unlock second)
      const firstMilestoneCompleted = completedMilestones?.some(
        (m) => m.milestone_id === testMilestone.id
      );
      console.log(
        `First milestone completed: ${firstMilestoneCompleted ? "Yes" : "No"}`
      );
      console.log(
        `Second milestone should be: ${
          firstMilestoneCompleted ? "Unlocked" : "Locked"
        }`
      );
    }

    console.log("\n=== Milestone Completion Test Complete ===");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testMilestoneCompletion();
