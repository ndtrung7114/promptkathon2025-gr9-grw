import { milestoneImageService } from "./src/lib/supabase/milestoneImageService.js";

async function testMilestoneImages() {
  console.log("=== Testing Milestone Image Service ===");

  // Test with a known milestone ID (from your conversation history)
  const testMilestoneId = "082b7dac-2f81-4d6b-8a84-05c75be42f4e";

  console.log(`Testing with milestone ID: ${testMilestoneId}`);

  try {
    // Test getting all images for the milestone
    const images = await milestoneImageService.getImagesByMilestoneId(
      testMilestoneId
    );
    console.log(`Found ${images.length} images for milestone`);

    if (images.length > 0) {
      console.log("Images found:");
      images.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.title} (ID: ${img.id})`);
        console.log(`     URL: ${img.image_url}`);
        console.log(`     Milestone ID: ${img.milestone_id}`);
      });

      // Test getting a random image
      const randomImage =
        await milestoneImageService.getRandomImageByMilestoneId(
          testMilestoneId
        );
      if (randomImage) {
        console.log("\nRandom image selected:");
        console.log(`  Title: ${randomImage.title}`);
        console.log(`  URL: ${randomImage.image_url}`);
      }
    } else {
      console.log("No images found in database for this milestone");

      // Let's check what milestones exist
      console.log("\n=== Checking available milestones ===");
      const { createClient } = await import("@supabase/supabase-js");

      // Use environment variables or hardcoded values for testing
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || "your-supabase-url",
        process.env.VITE_SUPABASE_ANON_KEY || "your-supabase-key"
      );

      const { data: milestones, error } = await supabase
        .from("milestones")
        .select("id, title, slug")
        .limit(5);

      if (error) {
        console.error("Error fetching milestones:", error);
      } else {
        console.log("Available milestones:");
        milestones?.forEach((milestone) => {
          console.log(`  - ${milestone.title} (ID: ${milestone.id})`);
        });
      }

      // Check game_images table
      const { data: gameImages, error: imgError } = await supabase
        .from("game_images")
        .select("id, title, milestone_id")
        .not("milestone_id", "is", null)
        .limit(10);

      if (imgError) {
        console.error("Error fetching game images:", imgError);
      } else {
        console.log("\nGame images with milestone_id:");
        gameImages?.forEach((img) => {
          console.log(`  - ${img.title} (Milestone: ${img.milestone_id})`);
        });
      }
    }
  } catch (error) {
    console.error("Error during test:", error);
  }
}

testMilestoneImages();
