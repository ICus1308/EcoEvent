"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Zap, Shield, Crown, ArrowLeft, Loader2, Star, CheckCircle2 } from "lucide-react";
import { AnimatedSection, HoverCard } from "@/components/ui/animations";

interface PlanData {
  id: string;
  tier: "FREE" | "PLUS" | "PREMIUM";
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  aiLimitPerMonth: number;
  maxListings: number;
  platformFeePct: number;
  hasPdfExport: boolean;
  hasTopSearch: boolean;
  hasPortal: boolean;
  hasAnalytics: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<string>("FREE");
  const [plans, setPlans] = useState<PlanData[]>([]);

  useEffect(() => {
    async function fetchPricingData() {
      try {
        const token = localStorage.getItem("sessionToken");
        const res = await fetch("/api/subscription", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success) {
          if (data.currentPlan) {
            setCurrentTier(data.currentPlan.tier);
          }
          if (data.allPlans) {
            setPlans(data.allPlans);
          }
        }
      } catch (err) {
        console.error("Error fetching pricing:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPricingData();
  }, []);

  const handleSelectPlan = (tier: string) => {
    if (tier === "FREE") return;
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      router.push("/login?redirect=/pricing");
      return;
    }
    const interval = isAnnual ? "YEARLY" : "MONTHLY";
    router.push(`/checkout/subscription?tier=${tier}&interval=${interval}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-12 pb-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-6 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-800/50 backdrop-blur-md">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang chủ
          </Link>

          <span className="block text-emerald-400 font-numeric font-bold text-sm uppercase tracking-widest mb-3">
            Bảng giá gói thành viên
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading tracking-tight text-white mb-4">
            Nâng tầm trải nghiệm sự kiện xanh
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto font-body">
            Mở khóa sức mạnh AI thiết kế sự kiện không giới hạn, giảm phí dịch vụ giao dịch và đăng bán vật phẩm trên Chợ Eco-Gear.
          </p>

          {/* Monthly / Yearly Switcher */}
          <div className="mt-10 inline-flex items-center gap-3 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 backdrop-blur-md shadow-xl">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isAnnual
                  ? "bg-emerald-600 text-white shadow-md font-heading"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Thanh toán theo tháng
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isAnnual
                  ? "bg-emerald-600 text-white shadow-md font-heading"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Thanh toán theo năm
              <span className="bg-emerald-400/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-numeric border border-emerald-400/30">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <main className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
        <AnimatedSection>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">Đang tải bảng giá dịch vụ...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* GÓI CƠ BẢN (FREE) */}
            <HoverCard className={`bg-white rounded-3xl border ${currentTier === "FREE" ? "border-emerald-500 shadow-emerald-100/50" : "border-slate-200"} p-8 shadow-sm flex flex-col justify-between relative`}>
              {currentTier === "FREE" && (
                <div className="absolute -top-3.5 right-6 bg-slate-900 text-white text-xs font-bold font-numeric uppercase px-3 py-1 rounded-full border border-slate-700">
                  Gói hiện tại
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-slate-900">Gói cơ bản</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 h-10">Dành cho cá nhân trải nghiệm ứng dụng và tổ chức sự kiện quy mô nhỏ.</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-extrabold font-numeric text-slate-900">0đ</span>
                  <span className="text-sm text-slate-500 font-medium"> / mãi mãi</span>
                </div>

                <hr className="border-slate-100 mb-6" />

                <ul className="space-y-3.5 text-sm font-body text-slate-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>2 Kế hoạch AI</strong> / tháng</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Đăng tối đa <strong>3 vật phẩm</strong> chợ Eco</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Phí dịch vụ sàn: <strong>5.0%</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span>Huy hiệu Verified Eco Host</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span>Xuất file PDF/Excel kịch bản</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span>Top-Search Boost bài đăng</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="outline"
                disabled={currentTier === "FREE"}
                onClick={() => handleSelectPlan("FREE")}
                className="w-full h-12 rounded-2xl border-slate-300 font-bold text-sm"
              >
                {currentTier === "FREE" ? "Gói đang sử dụng" : "Dùng miễn phí"}
              </Button>
            </HoverCard>

            {/* GÓI PLUS (PRO - POPULAR) */}
            <HoverCard className={`bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl border-2 border-emerald-500 p-8 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2`}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold font-numeric text-xs uppercase tracking-wider px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Phổ biến nhất
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                      <Star className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold font-heading text-white">Gói Plus</h3>
                  </div>
                  {currentTier === "PLUS" && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2.5 py-0.5 rounded-full">
                      Đang dùng
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 mb-6 h-10">Dành cho Người tổ chức sự kiện thường xuyên & Sinh viên tích cực.</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-extrabold font-numeric text-emerald-400">
                    {isAnnual ? "990.000đ" : "99.000đ"}
                  </span>
                  <span className="text-sm text-slate-400 font-medium"> / {isAnnual ? "năm" : "tháng"}</span>
                </div>

                <hr className="border-slate-800 mb-6" />

                <ul className="space-y-3.5 text-sm font-body text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>AI Event Plan VÔ HẠN</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Đăng tối đa <strong>15 vật phẩm</strong> chợ Eco</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Phí dịch vụ ưu đãi: <strong>Chỉ 3.0%</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Huy hiệu <strong>Verified Eco Host</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Xuất file PDF/Excel</strong> kịch bản chi tiết</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Giảm 50% tiền cọc</strong> thuê thiết bị</span>
                  </li>
                </ul>
              </div>

              <Button
                disabled={currentTier === "PLUS"}
                onClick={() => handleSelectPlan("PLUS")}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg transition-all"
              >
                {currentTier === "PLUS" ? "Gói hiện tại" : "Nâng cấp gói Plus"}
              </Button>
            </HoverCard>

            {/* GÓI PREMIUM VENDOR */}
            <HoverCard className={`bg-white rounded-3xl border ${currentTier === "PREMIUM" ? "border-amber-500 shadow-amber-100/50" : "border-slate-200"} p-8 shadow-sm flex flex-col justify-between relative`}>
              {currentTier === "PREMIUM" && (
                <div className="absolute -top-3.5 right-6 bg-amber-500 text-slate-950 text-xs font-bold font-numeric uppercase px-3 py-1 rounded-full">
                  Gói hiện tại
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <Crown className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-slate-900">Gói Premium Vendor</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 h-10">Dành cho Công ty sự kiện, Kho chứa đồ & Dịch vụ chuyên nghiệp.</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-extrabold font-numeric text-amber-600">
                    {isAnnual ? "2.900.000đ" : "290.000đ"}
                  </span>
                  <span className="text-sm text-slate-500 font-medium"> / {isAnnual ? "năm" : "tháng"}</span>
                </div>

                <hr className="border-slate-100 mb-6" />

                <ul className="space-y-3.5 text-sm font-body text-slate-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Đăng vật phẩm <strong>KHÔNG GIỚI HẠN</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Phí dịch vụ thấp nhất: <strong>Chỉ 1.5%</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span><strong>Top-Search Boost</strong> hiển thị đầu trang</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Badge nổi bật <strong>Premium Vendor</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span><strong>Club & Faculty Portal</strong> quản lý kho đồ</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Hỗ trợ kỹ thuật <strong>Ưu tiên 24/7 (1-on-1)</strong></span>
                  </li>
                </ul>
              </div>

              <Button
                disabled={currentTier === "PREMIUM"}
                onClick={() => handleSelectPlan("PREMIUM")}
                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all"
              >
                {currentTier === "PREMIUM" ? "Gói hiện tại" : "Đăng ký Premium Vendor"}
              </Button>
            </HoverCard>

          </div>
        )}
        </AnimatedSection>

        {/* Feature Comparison Table */}
        <AnimatedSection delay={0.2} className="mt-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm overflow-hidden">
          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 text-center">
            So sánh chi tiết các quyền lợi
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="p-4 font-bold text-slate-700">Tính năng</th>
                  <th className="p-4 font-bold text-slate-700 text-center">Gói Cơ Bản</th>
                  <th className="p-4 font-bold text-emerald-700 text-center">Gói Plus (Pro)</th>
                  <th className="p-4 font-bold text-amber-700 text-center">Gói Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-medium text-slate-800">Tạo Kế hoạch Sự kiện bằng AI</td>
                  <td className="p-4 text-center">2 kế hoạch/tháng</td>
                  <td className="p-4 text-center font-bold text-emerald-700">Vô hạn</td>
                  <td className="p-4 text-center font-bold text-amber-700">Vô hạn</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-800">Giới hạn Đăng sản phẩm/Thiết bị</td>
                  <td className="p-4 text-center">Tối đa 3 món</td>
                  <td className="p-4 text-center">Tối đa 15 món</td>
                  <td className="p-4 text-center font-bold text-amber-700">Không giới hạn</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-800">Phí dịch vụ giao dịch sàn</td>
                  <td className="p-4 text-center">5.0%</td>
                  <td className="p-4 text-center">3.0%</td>
                  <td className="p-4 text-center font-bold text-amber-700">1.5%</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-800">Xuất file PDF / Excel AI Plan</td>
                  <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 text-center"><Check className="w-4 h-4 mx-auto text-emerald-600" /></td>
                  <td className="p-4 text-center"><Check className="w-4 h-4 mx-auto text-amber-600" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-800">Huy hiệu Uy tín (Verified Badge)</td>
                  <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 text-center font-medium text-emerald-700">Verified Eco Host</td>
                  <td className="p-4 text-center font-bold text-amber-700">Premium Vendor</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-800">Top-Search Boost trên Chợ</td>
                  <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 text-center"><Check className="w-4 h-4 mx-auto text-amber-600" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-800">Club & Faculty Management Portal</td>
                  <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 text-center"><X className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 text-center"><Check className="w-4 h-4 mx-auto text-amber-600" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimatedSection>

      </main>
    </div>
  );
}
