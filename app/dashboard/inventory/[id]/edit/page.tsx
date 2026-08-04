"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, Leaf, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "DECORATION",
    status: "IN_STOCK",
    listingType: "SALE",
    price: 0,
    rentalPricePerDay: 0,
    depositAmount: 0,
    stock: 1,
    imageUrl: "",
    ecoFeatures: "🌱 Thân thiện môi trường"
  });

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          const p = data.product;
          setFormData({
            name: p.name || "",
            sku: p.sku || p.code || "",
            description: p.description || "",
            category: p.category || "DECORATION",
            status: p.status || "IN_STOCK",
            listingType: p.listingType || "SALE",
            price: p.price || 0,
            rentalPricePerDay: p.rentalPricePerDay || 0,
            depositAmount: p.depositAmount || 0,
            stock: p.stock ?? 1,
            imageUrl: p.imageUrl || "",
            ecoFeatures: p.ecoFeatures || "🌱 Thân thiện môi trường"
          });
        } else {
          setErrorMsg("Không tìm thấy sản phẩm");
        }
      } catch (err) {
        setErrorMsg("Lỗi kết nối khi lấy thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload: any = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        listingType: formData.listingType,
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl,
        ecoFeatures: formData.ecoFeatures
      };

      if (formData.listingType === "SALE") {
        payload.price = Number(formData.price);
        payload.rentalPricePerDay = null;
        payload.depositAmount = null;
      } else {
        payload.price = null;
        payload.rentalPricePerDay = Number(formData.rentalPricePerDay);
        payload.depositAmount = Number(formData.depositAmount);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.status === 401) {
        setErrorMsg("Vui lòng đăng nhập để chỉnh sửa");
        setTimeout(() => {
          router.push(`/login?callbackUrl=/dashboard/inventory/${productId}/edit`);
        }, 1500);
        return;
      } else if (res.status === 403) {
        setErrorMsg(data.error || "Bạn không có quyền chỉnh sửa sản phẩm này");
        return;
      }

      if (res.ok && data.success) {
        router.push(`/shop/${productId}`);
      } else {
        setErrorMsg(data.error || "Không thể cập nhật sản phẩm");
      }
    } catch (err) {
      setErrorMsg("Lỗi máy chủ khi gửi dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
        <p className="font-medium text-sm">Đang tải dữ liệu niêm yết...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/shop/${productId}`}>
              <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Xem trên Chợ
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <Leaf className="h-4 w-4" />
              Chỉnh Sửa Niêm Yết
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cập Nhật Thông Tin Vật Phẩm</h1>
          <p className="text-slate-500 text-sm mt-1">
            Thay đổi giá bán/thuê, trạng thái kho và hình ảnh sản phẩm. Thay đổi sẽ tự động đồng bộ sang Chợ và Giỏ hàng.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">1. Thông Tin Cơ Bản</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã SKU / Mã Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mô Tả Sản Phẩm</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Classification & Status */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">2. Phân Loại & Trạng Thái</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Danh Mục</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="DECORATION">Trang trí Event</option>
                  <option value="EQUIPMENT">Thiết bị & Âm thanh</option>
                  <option value="TABLEWARE">Bộ đồ ăn & Cốc</option>
                  <option value="ATTIRE">Trang phục & Phụ kiện</option>
                  <option value="PROJECT_TOOLS">Dụng cụ dự án</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hình Thức Đăng</label>
                <select
                  value={formData.listingType}
                  onChange={(e) => setFormData({ ...formData, listingType: e.target.value as "SALE" | "RENT" })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="SALE">Đăng Bán (Bán luôn)</option>
                  <option value="RENT">Cho Thuê (Tính theo ngày)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng Thái Niêm Yết</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="IN_STOCK">Còn hàng</option>
                  <option value="OUT_OF_STOCK">Hết hàng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Mechanics */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">3. Giá & Tồn Kho</h3>

            {formData.listingType === "SALE" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div>
                  <label className="block text-xs font-semibold text-blue-900 mb-1">Giá Bán Trực Tiếp (VNĐ) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số Lượng Trong Kho *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <div>
                  <label className="block text-xs font-semibold text-emerald-900 mb-1">Giá Thuê Theo Ngày (VNĐ) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rentalPricePerDay}
                    onChange={(e) => setFormData({ ...formData, rentalPricePerDay: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-900 mb-1">Tiền Cọc Yêu Cầu (VNĐ) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số Lượng Sẵn Cho Thuê *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Media & Eco Badge */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">4. Hình Ảnh & Nhãn Xanh</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đường Dẫn Ảnh (URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhãn Đặc Tính Sinh Thái</label>
                <input
                  type="text"
                  value={formData.ecoFeatures}
                  onChange={(e) => setFormData({ ...formData, ecoFeatures: e.target.value })}
                  placeholder="e.g. 🌱 100% Phân hủy tự nhiên"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link href="/dashboard/inventory">
              <Button type="button" variant="ghost" className="rounded-xl">Hủy Quá Trình</Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 h-11"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Lưu Thay Đổi Niêm Yết
            </Button>
          </div>

        </form>
      </main>
    </div>
  );
}
