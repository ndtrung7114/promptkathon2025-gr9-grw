// Test script to verify milestone images filtering
// Run this with: node test-milestone-filtering.js

const { createClient } = require("@supabase/supabase-js");

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMilestoneFiltering() {
  console.log("🔍 Testing milestone images filtering...\n");

  try {
    // Test 1: Get all images
    console.log("1. Testing all active images:");
    const { data: allImages, error: allError } = await supabase
      .from("game_images")
      .select("id, title, milestone_id, topic, is_active")
      .eq("is_active", true);

    if (allError) {
      console.error("❌ Error fetching all images:", allError);
      return;
    }

    console.log(`   Total active images: ${allImages.length}`);
    console.log(
      `   With milestone_id: ${
        allImages.filter((img) => img.milestone_id).length
      }`
    );
    console.log(
      `   Without milestone_id: ${
        allImages.filter((img) => !img.milestone_id).length
      }\n`
    );

    // Test 2: Get only images with milestone_id
    console.log("2. Testing milestone-filtered images:");
    const { data: milestoneImages, error: milestoneError } = await supabase
      .from("game_images")
      .select("id, title, milestone_id, topic")
      .eq("is_active", true)
      .not("milestone_id", "is", null);

    if (milestoneError) {
      console.error("❌ Error fetching milestone images:", milestoneError);
      return;
    }

    console.log(`   Images with milestone_id: ${milestoneImages.length}`);

    // Group by topic
    const byTopic = milestoneImages.reduce((acc, img) => {
      acc[img.topic] = (acc[img.topic] || 0) + 1;
      return acc;
    }, {});

    console.log("   By topic:", byTopic);

    // Test 3: Test specific milestone
    console.log("\n3. Testing specific milestone (trung-sisters-1):");
    const { data: specificImages, error: specificError } = await supabase
      .from("game_images")
      .select("id, title, milestone_id, topic")
      .eq("milestone_id", "trung-sisters-1")
      .eq("is_active", true);

    if (specificError) {
      console.error(
        "❌ Error fetching specific milestone images:",
        specificError
      );
      return;
    }

    console.log(`   Images for trung-sisters-1: ${specificImages.length}`);
    specificImages.forEach((img) => {
      console.log(`   - ${img.title} (${img.topic})`);
    });

    console.log("\n✅ Milestone filtering test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Instructions
console.log("📋 INSTRUCTIONS:");
console.log("1. Update the supabaseUrl and supabaseKey variables above");
console.log("2. Install dependencies: npm install @supabase/supabase-js");
console.log("3. Run: node test-milestone-filtering.js\n");

// Run the test if credentials are provided
if (
  supabaseUrl !== "YOUR_SUPABASE_URL" &&
  supabaseKey !== "YOUR_SUPABASE_ANON_KEY"
) {
  testMilestoneFiltering();
} else {
  console.log("⚠️  Please update the Supabase credentials in this file first.");
}
