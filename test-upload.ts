import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
  const buffer = Buffer.from("test image content", "utf-8");
  const filename = `test-${Date.now()}.txt`;
  
  console.log("Uploading to bucket 'uploads'...");
  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(filename, buffer, {
      contentType: "text/plain",
      upsert: false,
    });
    
  if (error) {
    console.error("Supabase Storage error:", error);
  } else {
    console.log("Upload success:", data);
  }
}

testUpload().catch(console.error);
