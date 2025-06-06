import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkGameImages() {
  console.log("=== Checking game_images table ===");
  const { data, error } = await supabase
    .from("game_images")
    .select("id, title, milestone_id, is_active")
    .limit(10);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Sample game_images:");
    console.table(data);
  }

  console.log("=== Checking milestones table ===");
  const { data: milestones, error: milestoneError } = await supabase
    .from("milestones")
    .select("id, title, slug")
    .limit(5);

  if (milestoneError) {
    console.error("Milestone Error:", milestoneError);
  } else {
    console.log("Sample milestones:");
    console.table(milestones);
  }

  // Check specific milestone ID
  console.log("=== Checking specific milestone images ===");
  const testMilestoneId = "082b7dac-2f81-4d6b-8a84-05c75be42f4e";
  const { data: specificImages, error: specificError } = await supabase
    .from("game_images")
    .select("*")
    .eq("milestone_id", testMilestoneId)
    .eq("is_active", true);

  if (specificError) {
    console.error("Error fetching specific milestone images:", specificError);
  } else {
    console.log(
      `Images for milestone ${testMilestoneId}:`,
      specificImages.length
    );
    if (specificImages.length > 0) {
      console.table(
        specificImages.map((img) => ({
          id: img.id,
          title: img.title,
          milestone_id: img.milestone_id,
          image_url: img.image_url,
        }))
      );
    }
  }
}

checkGameImages()
  .then(() => process.exit(0))
  .catch(console.error);
