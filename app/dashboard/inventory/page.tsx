"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Calendar, Trash2, Edit3, PauseCircle, PlayCircle, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import BackButton from "@/components/BackButton";

export default function InventoryDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "RENT" | "SALE">("ALL");

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
      const res = await fetch("/api/inventory", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.inventory || []);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa niêm yết này không?")) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Không thể xóa sản phẩm.");
      }
    } catch (err) {
      alert("Không thể xóa sản phẩm.");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "INACTIVE" ? "IN_STOCK" : "INACTIVE";
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      alert("Không thể thay đổi trạng thái sản phẩm.");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === "RENT") return p.listingType === "RENT";
    if (activeTab === "SALE") return p.listingType === "SALE";
    return true;
  });

  const rentCount = products.filter((p) => p.listingType === "RENT").length;
  const saleCount = products.filter((p) => p.listingType === "SALE").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">


      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Kho Hàng & Niêm Yết</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Theo dõi, chỉnh sửa tồn kho và quản lý các thiết bị/sản phẩm bạn đã đăng bán hoặc cho thuê.
            </p>
          </div>

          <Link href="/shop/create">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 h-11 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Thêm Niêm Yết
            </Button>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            Tất Cả ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("RENT")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === "RENT"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Calendar className="h-4 w-4" /> Đã Đăng Cho Thuê ({rentCount})
          </button>

          <button
            onClick={() => setActiveTab("SALE")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === "SALE"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Tag className="h-4 w-4" /> Đã Đăng Bán ({saleCount})
          </button>
        </div>

        {/* Product Inventory Cards */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="font-medium text-sm">Đang tải danh sách kho hàng...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-center">
            <div className="bg-slate-100 p-4 rounded-2xl mb-4 text-slate-400">
              <Package className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa Có Sản Phẩm Nào</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              Bạn chưa đăng sản phẩm nào thuộc mục này. Hãy bắt đầu bằng cách thêm niêm yết mới.
            </p>
            <Link href="/shop/create">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Đăng Sản Phẩm Mới
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1 ${
                          item.listingType === "RENT" ? "bg-emerald-600" : "bg-blue-600"
                        }`}
                      >
                        {item.listingType === "RENT" ? <Calendar className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
                        {item.listingType === "RENT" ? "CHO THƯÊ" : "BÁN"}
                      </span>

                      {item.status === "INACTIVE" && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white">
                          TẠM ẨN
                        </span>
                      )}
                      {item.status === "OUT_OF_STOCK" && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white">
                          HẾT HÀNG
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 text-white text-xs font-mono font-semibold">
                      SKU: {item.sku || item.code}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{item.description}</p>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                      {item.listingType === "RENT" ? (
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="text-slate-500">Giá thuê: </span>
                            <span className="font-bold text-emerald-700 text-sm">
                              {item.rentalPricePerDay?.toLocaleString("vi-VN")}đ
                            </span>
                            <span className="text-slate-400">/ngày</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Cọc: </span>
                            <span className="font-bold text-slate-700">
                              {item.depositAmount?.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs">
                          <span className="text-slate-500">Giá bán: </span>
                          <span className="font-bold text-blue-700 text-sm">
                            {item.price?.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Tồn kho: <strong className="text-slate-900">{item.stock}</strong></span>
                      <span>Danh mục: <strong className="text-slate-800">{item.category}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions: Edit & Delete & Toggle */}
                <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link href={`/dashboard/inventory/${item.id}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Sửa
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    {item.status === "INACTIVE" ? (
                      <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-xl text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
