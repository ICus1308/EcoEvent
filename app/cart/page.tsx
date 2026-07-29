"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, ShieldCheck, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      }
    } catch (err) {
      alert("Không thể xóa sản phẩm khỏi giỏ hàng.");
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => {
      if (item.product?.listingType === "RENT") {
        const days = 3;
        const pricePerDay = item.product.rentalPricePerDay || 0;
        return acc + pricePerDay * days * item.quantity;
      }
      return acc + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateDepositTotal = () => {
    return items.reduce((acc, item) => {
      if (item.product?.listingType === "RENT") {
        return acc + (item.product.depositAmount || 0) * item.quantity;
      }
      return acc;
    }, 0);
  };

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      fetch("/api/cart", { method: "DELETE" }).catch(() => {});
      router.push("/dashboard/orders");
    }, 2000);
  };

  const subtotal = calculateSubtotal();
  const depositTotal = calculateDepositTotal();
  const grandTotal = subtotal + depositTotal;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <BackButton label="Quay về Trang Chủ" />
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
            <span>Giỏ Hàng Của Bạn</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
          Giỏ Hàng ({items.length})
        </h1>

        {checkoutSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 p-12 rounded-3xl text-center max-w-xl mx-auto">
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-950 mb-2">Thanh Toán Đặt Hàng Thành Công!</h2>
            <p className="text-emerald-800 text-sm mb-6">
              Đơn hàng & hợp đồng thuê của bạn đã được ghi nhận. Bạn sẽ được chuyển hướng tới Quản Lý Đơn Hàng...
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
          </div>
        ) : loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="font-medium text-sm">Đang tải giỏ hàng...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Giỏ hàng của bạn đang trống</h3>
            <p className="text-slate-500 text-sm mb-6">Hãy khám phá chợ thiết bị và vật phẩm sự kiện xanh ngay.</p>
            <Link href="/shop">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6">
                Khám Phá Cửa Hàng
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Item list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const prod = item.product || {};
                const isRent = prod.listingType === "RENT";

                return (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-100 bg-slate-100 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${
                              isRent ? "bg-emerald-600" : "bg-blue-600"
                            }`}
                          >
                            {isRent ? "Thuê" : "Mua"}
                          </span>
                          <span className="text-xs font-mono text-slate-400">SKU: {prod.code || prod.sku}</span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-base">{prod.name}</h4>

                        {isRent ? (
                          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                            <p>
                              Giá thuê: <strong className="text-emerald-700">{prod.rentalPricePerDay?.toLocaleString("vi-VN")}đ</strong>/ngày (Ước tính 3 ngày)
                            </p>
                            <p className="flex items-center gap-1 text-slate-500">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              Tiền cọc: <strong className="text-slate-800">{prod.depositAmount?.toLocaleString("vi-VN")}đ</strong>
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-blue-700 font-bold mt-1">
                            Giá bán: {prod.price?.toLocaleString("vi-VN")}đ
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-sm font-semibold text-slate-700">Số lượng: {item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary sidebar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit space-y-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">Tóm Tắt Đơn Hàng</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tiền hàng & Phí thuê:</span>
                  <span className="font-semibold text-slate-900">{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>

                {depositTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" /> Tổng tiền cọc (hoàn lại):
                    </span>
                    <span className="font-semibold text-emerald-700">{depositTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Phí nền tảng Eco:</span>
                  <span className="font-semibold text-emerald-600">Miễn phí (0đ)</span>
                </div>

                <hr className="border-slate-100 pt-2" />

                <div className="flex justify-between text-base font-extrabold text-slate-900">
                  <span>Tổng thanh toán:</span>
                  <span className="text-emerald-700 text-lg">{grandTotal.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              {depositTotal > 0 && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                  * Tiền cọc sẽ được tự động giữ và hoàn trả ngay sau khi bạn trả thiết bị thuê hoàn chỉnh.
                </div>
              )}

              <Button
                onClick={handleCheckout}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Xác Nhận Đặt Hàng & Thuê <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
