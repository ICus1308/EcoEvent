import dotenv from "dotenv";
dotenv.config();

import { supabase } from "./lib/supabase";

async function checkBucket() {
  const { data, error } = await supabase.storage.getBucket('uploads');
  if (error) {
    console.error("Error getting bucket:", error);
  } else {
    console.log("Bucket exists:", data);
  }
}

checkBucket().catch(console.error);
