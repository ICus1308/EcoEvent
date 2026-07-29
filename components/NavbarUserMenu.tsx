"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, ShoppingBag, Calendar, Store, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function NavbarUserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer text-sm font-semibold shadow-sm"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
          {user.fullname ? user.fullname.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[120px] truncate">{user.fullname || user.username}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Profile Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Tài khoản người dùng</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.fullname || user.username}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{user.email || user.username + "@eco.vn"}</p>
          </div>

          {/* Menu Items required by prompt */}
          <div className="py-1">
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 font-medium transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span>Giỏ hàng của tôi</span>
            </Link>

            <Link
              href="/dashboard/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 font-medium transition-colors"
            >
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span>Đơn đã mua & Thuê</span>
            </Link>

            <Link
              href="/dashboard/inventory"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 font-medium transition-colors"
            >
              <Store className="h-4 w-4 text-emerald-600" />
              <span>Kho vật phẩm đăng bán</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Cài đặt tài khoản</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Đăng xuất</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
