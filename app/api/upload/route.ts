import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "Kích thước video vượt quá 50MB giới hạn." }, { status: 400 });
    }
    
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Kích thước ảnh vượt quá 5MB giới hạn." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;

    // Upload to Supabase Storage (requires a public 'uploads' bucket)
    const { supabase } = await import("@/lib/supabase");
    
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filename, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json(
        { error: `Không thể tải ảnh lên Supabase: ${error.message}. Hãy chắc chắn bạn đã tạo bucket 'uploads' ở chế độ Public.` }, 
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(filename);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi tải ảnh lên." }, { status: 500 });
  }
}
