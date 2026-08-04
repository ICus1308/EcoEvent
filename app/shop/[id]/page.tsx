"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf, ShieldCheck, MapPin, Tag, Calendar, Loader2 } from "lucide-react";
import ProductActionCard from "@/components/ProductActionCard";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error("Product detail error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
        <p className="font-medium text-sm">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <h2 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
        <Link href="/shop">
          <Button variant="outline" className="rounded-xl">Quay lại Chợ Sinh Thái</Button>
        </Link>
      </div>
    );
  }

  const isRent = product.listingType === "RENT";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/shop">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" /> Về Chợ Sinh Thái
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Leaf className="h-4 w-4 text-emerald-600" />
            <span>Mã SKU: {product.sku}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image & Product Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm ${isRent ? "bg-emerald-600" : "bg-blue-600"}`}>
                  {isRent ? "Cho thuê" : "Bán"}
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-black/60 backdrop-blur-md text-white">
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-3">
                  <Leaf className="h-3.5 w-3.5" /> {product.ecoFeatures}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{product.name}</h1>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 border-y border-slate-100 py-3">
                <span>Danh mục: <strong className="text-slate-900">
                  {product.category === "DECORATION" ? "Trang trí sự kiện"
                    : product.category === "EQUIPMENT" ? "Thiết bị & âm thanh"
                    : product.category === "TABLEWARE" ? "Bộ đồ ăn & cốc"
                    : product.category === "ATTIRE" ? "Trang phục & phụ kiện"
                    : product.category === "PROJECT_TOOLS" ? "Dụng cụ dự án"
                    : product.category}
                </strong></span>
                <span>Tồn kho: <strong className="text-emerald-700">{product.stock} sản phẩm</strong></span>
                <span>Trạng thái: <strong className="text-slate-900">
                  {product.status === "IN_STOCK" ? "Còn hàng" : product.status === "OUT_OF_STOCK" ? "Hết hàng" : product.status}
                </strong></span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Mô tả chi tiết</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              {isRent && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
                  <h4 className="font-bold text-sm flex items-center gap-1.5 text-emerald-800">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Quyền lợi & chính sách thuê xanh
                  </h4>
                  <p>• Tiền cọc được bảo lưu an toàn và hoàn trả 100% khi nhận lại thiết bị đúng hạn.</p>
                  <p>• Hỗ trợ đổi trả trong 24h nếu thiết bị không đúng mô tả.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Purchase Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <ProductActionCard product={product} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
