"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Leaf, Menu } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import NavbarUserMenu from "@/components/NavbarUserMenu";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/verify-otp")
  ) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block text-emerald-950 dark:text-emerald-300">
            EcoEvent Hub
          </span>
        </Link>
        
        {/* Core Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Link href="/shop" className="transition-colors hover:text-emerald-600">Chợ Sinh Thái</Link>
          <Link href="/ai-planner" className="transition-colors hover:text-emerald-600">AI Lập Kế Hoạch</Link>
          <Link href="/pricing" className="transition-colors text-emerald-700 font-bold hover:text-emerald-600 flex items-center gap-1">
            Gói Dịch Vụ
          </Link>
        </nav>
        
        {/* Quick Auth Actions & User Profile Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <NavbarUserMenu />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Đăng Nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                  Bắt Đầu Ngay
                </Button>
              </Link>
            </>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
