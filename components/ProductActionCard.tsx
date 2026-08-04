"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Calendar as CalendarIcon, ShieldCheck, Check, Minus, Plus, Loader2, AlertTriangle, ShieldAlert, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

import { Building2 } from "lucide-react";
import QuantityInput from "@/components/ui/QuantityInput";

interface ProductActionCardProps {
  product: {
    id: string;
    ownerId?: string;
    sku: string;
    name: string;
    listingType: "SALE" | "RENT";
    price?: number | null;
    rentalPricePerDay?: number | null;
    depositAmount?: number | null;
    stock: number;
    status?: string;
    inventories?: Array<{
      id: string;
      warehouseId: string;
      quantity: number;
      reservedQty: number;
      warehouse: { id: string; name: string; location: string };
    }>;
  };
}

export default function ProductActionCard({ product }: ProductActionCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [directCheckingOut, setDirectCheckingOut] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [contactingOwner, setContactingOwner] = useState(false);

  const defaultWarehouseId = product.inventories && product.inventories.length > 0 ? product.inventories[0].warehouseId : "";
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(defaultWarehouseId);

  // Rental date state simulation
  const [startDate, setStartDate] = useState<string>("2026-08-01");
  const [endDate, setEndDate] = useState<string>("2026-08-04");

  const isRent = product.listingType === "RENT";
  const isOwner = Boolean(user && product.ownerId && user.id === product.ownerId);

  // Selected warehouse stock
  const selectedInventory = product.inventories?.find(inv => inv.warehouseId === selectedWarehouseId);
  const availableStock = selectedInventory 
    ? Math.max(0, selectedInventory.quantity - selectedInventory.reservedQty) 
    : product.stock;

  const isOutOfStock = availableStock <= 0 || product.status === "OUT_OF_STOCK";

  // Calculate rental duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const rentalDays = calculateDays();
  const estimatedRentalTotal = (product.rentalPricePerDay || 0) * rentalDays * quantity;
  const estimatedDepositTotal = (product.depositAmount || 0) * quantity;

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (isOwner) {
      setErrorMsg("🚫 Bạn không thể mua/thuê sản phẩm do chính bạn đăng bán!");
      return;
    }
    if (isOutOfStock) {
      setErrorMsg("⚠️ Sản phẩm này hiện đã hết hàng tại kho này!");
      return;
    }

    setAddingToCart(true);
    setCartSuccess(false);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: selectedWarehouseId,
          quantity,
          startDate: isRent ? startDate : undefined,
          endDate: isRent ? endDate : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
      } else {
        setErrorMsg(data.error || "Không thể thêm vào giỏ hàng");
      }
    } catch (err) {
      setErrorMsg("Không thể kết nối máy chủ");
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle Direct Checkout ("Thanh toán ngay / Thuê ngay")
  const handleDirectCheckout = async () => {
    if (isOwner) {
      setErrorMsg("🚫 Bạn không thể mua/thuê sản phẩm do chính bạn đăng bán!");
      return;
    }
    if (isOutOfStock) {
      setErrorMsg("⚠️ Sản phẩm này hiện đã hết hàng tại kho này!");
      return;
    }

    setDirectCheckingOut(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch("/api/checkout/direct", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: selectedWarehouseId,
          quantity,
          rentalStartDate: isRent ? startDate : undefined,
          rentalEndDate: isRent ? endDate : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/dashboard/orders");
      } else {
        setErrorMsg(data.error || "Thanh toán thất bại");
        setDirectCheckingOut(false);
      }
    } catch (err) {
      setErrorMsg("Không thể kết nối máy chủ");
      setDirectCheckingOut(false);
    }
  };

  // Handle Contact Owner
  const handleContactOwner = async () => {
    if (!user) {
      setErrorMsg("Vui lòng đăng nhập để liên hệ chủ đồ");
      return;
    }
    if (isOwner) {
      setErrorMsg("Đây là sản phẩm của bạn.");
      return;
    }

    setContactingOwner(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ recipientId: product.ownerId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Đã mở cuộc trò chuyện với chủ đồ! Hãy mở Bong bóng Chat góc dưới bên phải.");
      } else {
        setErrorMsg(data.error || "Không thể khởi tạo trò chuyện");
      }
    } catch (err) {
      setErrorMsg("Không thể kết nối máy chủ");
    } finally {
      setContactingOwner(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Ownership Warning / Out of Stock Banner */}
      {isOwner && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Sản phẩm này do bạn đăng bán (Không thể mua/thuê sản phẩm của mình).</span>
        </div>
      )}

      {isOutOfStock && !isOwner && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
          <span>Sản phẩm này hiện đã hết hàng trong kho.</span>
        </div>
      )}

      {/* Header Price Section */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
          {isRent ? "Gói cho thuê & tiền cọc" : "Giá bán"}
        </span>

        {isRent ? (
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {product.rentalPricePerDay?.toLocaleString("vi-VN")}đ
              </span>
              <span className="text-sm font-semibold text-slate-500">/ 1 ngày</span>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Tiền cọc hoàn lại: <strong className="text-slate-800 dark:text-slate-200">{product.depositAmount?.toLocaleString("vi-VN")}đ</strong>
            </p>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {product.price?.toLocaleString("vi-VN")}đ
            </span>
          </div>
        )}
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* MULTI-WAREHOUSE SELECTION */}
      {product.inventories && product.inventories.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-emerald-600" />
            Chọn kho xuất hàng
          </label>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            disabled={Boolean(isOwner)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50"
          >
            {product.inventories.map((inv) => {
              const avail = Math.max(0, inv.quantity - inv.reservedQty);
              return (
                <option key={inv.warehouseId} value={inv.warehouseId}>
                  {inv.warehouse?.name || "Kho hàng"} ({avail > 0 ? `Còn ${avail} sp` : "Hết hàng"})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* RENT MECHANIC: Interactive Date Range Picker */}
      {isRent && (
        <div className="space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
          <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-emerald-600" />
            Chọn ngày thuê & trả
          </label>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block mb-1">Ngày bắt đầu:</span>
              <input
                type="date"
                value={startDate}
                disabled={isOwner || isOutOfStock}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50"
              />
            </div>
            <div>
              <span className="text-slate-500 font-medium block mb-1">Ngày kết thúc:</span>
              <input
                type="date"
                value={endDate}
                disabled={isOwner || isOutOfStock}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="pt-2 text-xs border-t border-emerald-200/60 dark:border-emerald-900/60 space-y-1 text-emerald-900 dark:text-emerald-200">
            <div className="flex justify-between">
              <span>Thời gian thuê:</span>
              <strong className="font-bold">{rentalDays} ngày</strong>
            </div>
            <div className="flex justify-between">
              <span>Tổng tiền thuê dự kiến:</span>
              <strong className="font-bold">{estimatedRentalTotal.toLocaleString("vi-VN")}đ</strong>
            </div>
            <div className="flex justify-between">
              <span>Tổng cọc an toàn:</span>
              <strong className="font-bold">{estimatedDepositTotal.toLocaleString("vi-VN")}đ</strong>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Số lượng</span>
        <QuantityInput
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={availableStock}
          disabled={isOwner || isOutOfStock}
        />
      </div>

      {cartSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2 font-medium">
          <Check className="h-4 w-4 text-emerald-600" />
          Đã thêm vào giỏ hàng thành công!
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2 font-medium">
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* DUAL ACTION BUTTONS with Client Guards */}
      <div className="space-y-3 pt-2">
        {/* Action 1: Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={addingToCart || isOwner || isOutOfStock}
          variant="outline"
          className="w-full h-12 rounded-2xl border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addingToCart ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          {isOwner ? "Sản phẩm của bạn" : isOutOfStock ? "Hết hàng trong kho" : "Thêm vào giỏ hàng"}
        </Button>

        {/* Action 2: Direct Checkout */}
        <Button
          onClick={handleDirectCheckout}
          disabled={directCheckingOut || isOwner || isOutOfStock}
          className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {directCheckingOut ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Zap className="h-4 w-4 mr-2 text-yellow-300 fill-yellow-300" />
          )}
          {isOwner
            ? "Không thể tự mua"
            : isOutOfStock
            ? "Đã hết hàng"
            : isRent
            ? "Thuê ngay"
            : "Mua ngay"}
        </Button>

        {/* Action 3: Contact Owner */}
        <Button
          onClick={handleContactOwner}
          disabled={contactingOwner || isOwner}
          variant="outline"
          className="w-full h-12 rounded-2xl border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm shadow-sm disabled:opacity-50"
        >
          {contactingOwner ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-2" />
          )}
          Liên hệ chủ đồ
        </Button>
      </div>
    </div>
  );
}
