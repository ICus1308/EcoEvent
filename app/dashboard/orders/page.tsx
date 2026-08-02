"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ShieldCheck, Clock, CheckCircle2, ShoppingBag, RotateCcw, Loader2 } from "lucide-react";
import BackButton from "@/components/BackButton";

interface OrderItem {
  id: string;
  type: "buy" | "renting" | "rented";
  buyerId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  rentalStartDate?: string | null;
  rentalEndDate?: string | null;
  totalAmount: number;
  depositTotal?: number | null;
  status: string;
  createdAt: string;
}

export default function OrdersDashboard() {
  const [activeTab, setActiveTab] = useState<"ACTIVE_RENTALS" | "PURCHASED" | "PAST_RENTALS">("ACTIVE_RENTALS");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real database orders from REST API
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const activeRentals = orders.filter(
    (o) => o.type === "renting" || o.status === "RENTAL_ACTIVE"
  );
  const purchasedOrders = orders.filter(
    (o) => o.type === "buy" || o.status === "PAID" || o.status === "DELIVERED"
  );
  const pastRentals = orders.filter(
    (o) => o.type === "rented" || o.status === "COMPLETED" || o.status === "RETURNED"
  );

  const handleReturnItem = async (id: string) => {
    if (!confirm("Xác nhận bạn đã bàn giao và trả lại thiết bị này cho nhà cung cấp?")) return;
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, type: "rented", status: "COMPLETED" } : o))
      );
      alert("Đã ghi nhận yêu cầu trả thiết bị! Tiền cọc đã được hoàn trả lại ví của bạn.");
    } catch (err) {
      alert("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">


      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nhật Ký Mua Hàng & Thuê Thiết Bị</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Quản lý thời hạn trả đồ thuê, tình trạng tiền cọc và lịch sử các món đồ đã mua từ cơ sở dữ liệu thực tế.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("ACTIVE_RENTALS")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === "ACTIVE_RENTALS"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Clock className="h-4 w-4" /> Đang Thuê ({activeRentals.length})
          </button>

          <button
            onClick={() => setActiveTab("PURCHASED")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === "PURCHASED"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Đã Mua ({purchasedOrders.length})
          </button>

          <button
            onClick={() => setActiveTab("PAST_RENTALS")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === "PAST_RENTALS"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" /> Lịch Sử Thuê Đã Trả ({pastRentals.length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu đơn hàng từ cơ sở dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: ACTIVE RENTALS */}
            {activeTab === "ACTIVE_RENTALS" && (
              <div className="space-y-4">
                {activeRentals.length === 0 ? (
                  <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
                    <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-base">Bạn không có thiết bị nào đang thuê</h3>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                      Hiện tại không có đơn thuê nào hoạt động trong tài khoản của bạn. Hãy truy cập cửa hàng để thuê vật phẩm sinh thái.
                    </p>
                    <Link href="/shop" className="inline-block mt-4">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
                        Khám Phá Cửa Hàng
                      </Button>
                    </Link>
                  </div>
                ) : (
                  activeRentals.map((rental) => (
                    <div
                      key={rental.id}
                      className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={rental.imageUrl || "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600"}
                          alt={rental.productName}
                          className="w-24 h-24 rounded-xl object-cover border border-slate-100 bg-slate-100 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-600 text-white uppercase">
                              Đang Thuê Active
                            </span>
                            <span className="text-xs font-mono text-slate-400">Mã đơn: {rental.id}</span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 mb-2">{rental.productName}</h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                            <p>
                              Thời gian thuê: <strong className="text-slate-900">{rental.rentalStartDate || "N/A"}</strong> đến <strong className="text-emerald-700">{rental.rentalEndDate || "N/A"}</strong>
                            </p>
                            <p className="flex items-center gap-1 text-emerald-800 font-semibold">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              Tiền cọc giữ an toàn: {(rental.depositTotal || 0).toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Tổng thanh toán thuê:</span>
                          <span className="text-base font-extrabold text-emerald-700">
                            {rental.totalAmount.toLocaleString("vi-VN")}đ
                          </span>
                        </div>

                        <Button
                          onClick={() => handleReturnItem(rental.id)}
                          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 px-5"
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Báo Trả Đồ & Hoàn Cọc
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: PURCHASED ITEMS */}
            {activeTab === "PURCHASED" && (
              <div className="space-y-4">
                {purchasedOrders.length === 0 ? (
                  <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
                    <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-base">Chưa có đơn mua nào</h3>
                    <p className="text-slate-500 text-xs mt-1">Bạn chưa thực hiện bất kỳ giao dịch mua hàng nào.</p>
                  </div>
                ) : (
                  purchasedOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={order.imageUrl || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"} alt={order.productName} className="w-20 h-20 rounded-xl object-cover border border-slate-100" />
                        <div>
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 mb-1 inline-block">
                            Đã Mua Thành Công
                          </span>
                          <h3 className="font-bold text-slate-900 text-base">{order.productName}</h3>
                          <p className="text-xs text-slate-500 mt-1">Mã đơn: {order.id} | Ngày mua: {order.createdAt}</p>
                        </div>
                      </div>
                      <div className="text-right font-extrabold text-blue-700 text-lg">
                        {order.totalAmount.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: PAST RENTALS */}
            {activeTab === "PAST_RENTALS" && (
              <div className="space-y-4">
                {pastRentals.length === 0 ? (
                  <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
                    <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-base">Chưa có lịch sử trả đồ</h3>
                    <p className="text-slate-500 text-xs mt-1">Lịch sử hoàn cọc và trả thiết bị sẽ được hiển thị ở đây.</p>
                  </div>
                ) : (
                  pastRentals.map((past) => (
                    <div key={past.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={past.imageUrl || "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600"} alt={past.productName} className="w-20 h-20 rounded-xl object-cover border border-slate-100" />
                        <div>
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 mb-1 inline-block">
                            Đã Trả Đồ & Hoàn Cọc
                          </span>
                          <h3 className="font-bold text-slate-900 text-base">{past.productName}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Tiền cọc đã hoàn trả: <strong className="text-emerald-700">{(past.depositTotal || 0).toLocaleString("vi-VN")}đ</strong>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                          Đã Hoàn Tất
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
