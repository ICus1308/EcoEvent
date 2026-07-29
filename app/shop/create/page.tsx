"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ShopCreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/inventory/new");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
      <p className="font-medium text-sm">Đang chuyển hướng đến trang tạo sản phẩm...</p>
    </div>
  );
}
