// Quick test to verify milestone images filtering
// This will test the actual service functions

import { milestoneImageService } from "./src/lib/supabase/milestoneImageService.js";

async function testMilestoneFiltering() {
  console.log("🔍 Testing Milestone Images Filtering\n");

  try {
    // Test 1: Get images with milestone IDs only
    console.log("1. Testing getImagesWithMilestones():");
    const milestoneImages =
      await milestoneImageService.getImagesWithMilestones();
    console.log(`   Found ${milestoneImages.length} images with milestone_id`);

    if (milestoneImages.length > 0) {
      console.log("   Sample image:");
      const sample = milestoneImages[0];
      console.log(`   - Title: ${sample.title}`);
      console.log(`   - Milestone ID: ${sample.milestone_id}`);
      console.log(`   - Topic: ${sample.topic}`);
    }

    // Test 2: Get images by topic (milestone-filtered)
    console.log('\n2. Testing getImagesByTopic("history"):');
    const historyImages = await milestoneImageService.getImagesByTopic(
      "history"
    );
    console.log(
      `   Found ${historyImages.length} history images with milestone_id`
    );

    // Test 3: Get images by specific milestone
    console.log('\n3. Testing getImagesByMilestoneId("trung-sisters-1"):');
    const specificImages = await milestoneImageService.getImagesByMilestoneId(
      "trung-sisters-1"
    );
    console.log(`   Found ${specificImages.length} images for trung-sisters-1`);

    if (specificImages.length > 0) {
      specificImages.forEach((img) => {
        console.log(`   - ${img.title}`);
      });
    }

    // Test 4: Get random image by milestone
    console.log('\n4. Testing getRandomImageByMilestoneId("trung-sisters-1"):');
    const randomImage = await milestoneImageService.getRandomImageByMilestoneId(
      "trung-sisters-1"
    );
    if (randomImage) {
      console.log(`   Random image: ${randomImage.title}`);
    } else {
      console.log("   No random image found");
    }

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testMilestoneFiltering();
