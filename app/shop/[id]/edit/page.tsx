"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShopProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/inventory/${resolvedParams.id}/edit`);
  }, [resolvedParams.id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
      <p className="text-sm font-medium">Đang chuyển hướng đến trang chỉnh sửa sản phẩm...</p>
    </div>
  );
}
