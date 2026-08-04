"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Recycle, 
  ShoppingBag, 
  Users, 
  CheckCircle2, 
  TrendingDown, 
  Calendar, 
  Coins, 
  Bot, 
  Heart,
  ChevronRight,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SlideUp, 
  ScrollReveal, 
  AnimatedSection, 
  HoverCard, 
  PopIn,
  staggerContainerVariants, 
  staggerItemVariants 
} from "@/components/ui/animations";

export default function LandingPage() {
  // Interactive preview state for Section 2 (AI Planner Preview)
  const [selectedEventType, setSelectedEventType] = useState("Workshop CLB");
  const [guestCount, setGuestCount] = useState(100);

  // Mock calculation based on interactive state
  const traditionalCost = guestCount * 45000;
  const ecoCost = guestCount * 28000;
  const savings = traditionalCost - ecoCost;
  const plasticSaved = Math.round(guestCount * 0.45);

  const FEATURED_PRODUCTS = [
    {
      id: "prod-1",
      name: "Bộ đồ ăn bằng tre sinh thái (100 bộ)",
      price: 350000,
      type: "RENT",
      priceUnit: "ngày",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80",
      ecoBadge: "🌱 100% Tự nhiên",
      location: "Đại học RMIT"
    },
    {
      id: "prod-2",
      name: "Khung backdrop gỗ tái chế gấp gọn",
      price: 500000,
      type: "RENT",
      priceUnit: "ngày",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
      ecoBadge: "🪵 Gỗ tái chế",
      location: "Đại học Bách Khoa"
    },
    {
      id: "prod-3",
      name: "Bộ đàm sự kiện chuyên nghiệp (Bộ 6 cái)",
      price: 250000,
      type: "RENT",
      priceUnit: "ngày",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      ecoBadge: "🔋 Pin sạc sạc lại",
      location: "Quận 1, TP.HCM"
    },
    {
      id: "prod-4",
      name: "Thùng phân loại rác sự kiện 3 ngăn",
      price: 180000,
      type: "BUY",
      priceUnit: "sản phẩm",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80",
      ecoBadge: "♻️ Nhựa tái chế 100%",
      location: "TP. Thủ Đức"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-slate-50">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <SlideUp delay={0.1}>
                <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100/70 dark:bg-emerald-900/40 px-4 py-1.5 text-xs md:text-sm font-semibold text-emerald-800 dark:text-emerald-300 backdrop-blur-md">
                  <Leaf className="mr-2 h-4 w-4 text-emerald-600" />
                  Nền tảng sự kiện sinh thái & kinh tế chia sẻ đầu tiên
                </div>
              </SlideUp>

              <SlideUp delay={0.2}>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                  Lập kế hoạch sự kiện <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600">xanh hơn</span>.<br />
                  Chia sẻ tài nguyên thông minh.
                </h1>
              </SlideUp>

              <SlideUp delay={0.3}>
                <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Ứng dụng Gemini AI thiết kế dòng thời gian và bảng chi phí tối ưu rác thải. Thuê thiết bị sự kiện từ cộng đồng CLB & nhà cung cấp uy tín với ký quỹ an toàn.
                </p>
              </SlideUp>

              <SlideUp delay={0.4}>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-2">
                  <Link href="/ai-planner" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 h-13 font-bold shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                      <Sparkles className="mr-2 h-5 w-5 text-yellow-300" /> Lập kế hoạch bằng AI
                    </Button>
                  </Link>
                  <Link href="/shop" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-2xl px-8 h-13 font-bold border-slate-300 hover:bg-emerald-50 text-slate-800 transition-all duration-300 cursor-pointer">
                      Khám phá cửa hàng xanh <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </SlideUp>

              {/* Mini Social Proof Stats */}
              <SlideUp delay={0.5}>
                <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                  <div>
                    <p className="text-xl font-extrabold text-emerald-700">500+</p>
                    <p className="text-xs text-slate-500 font-medium">Sự kiện xanh</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-emerald-700">12T+</p>
                    <p className="text-xs text-slate-500 font-medium">Giảm rác nhựa</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-emerald-700">100%</p>
                    <p className="text-xs text-slate-500 font-medium">Hoàn cọc an toàn</p>
                  </div>
                </div>
              </SlideUp>
            </div>

            {/* Right Visual Card Mockup */}
            <div className="lg:col-span-5 relative">
              <PopIn delay={0.3}>
                <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 backdrop-blur-xl">
                  {/* Decorative Header Badge */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Gemini AI Event Plan</h4>
                        <p className="text-[11px] text-emerald-600 font-medium">● Đã tối ưu hóa rác thải</p>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                      Eco Score: 98/100
                    </span>
                  </div>

                  {/* Mock Scenario Card */}
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Quy mô khách mời:</span>
                      <span className="font-bold text-slate-900">150 Sinh viên</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                      <div className="flex justify-between font-bold text-emerald-950">
                        <span>Bộ đồ ăn tre tái sử dụng:</span>
                        <span>-45kg Rác thải nhựa</span>
                      </div>
                      <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-full w-[85%]" />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-blue-950">
                      <span className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-blue-600" /> Tiền cọc ký quỹ VietQR:
                      </span>
                      <span className="font-bold">Được bảo vệ 100%</span>
                    </div>
                  </div>

                  {/* Floating Action Badge */}
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-5 -left-5 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs"
                  >
                    <div className="h-8 w-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      <Coins className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold">Tiết kiệm ước tính</p>
                      <p className="text-emerald-400 font-extrabold text-sm">1,700,000 ₫</p>
                    </div>
                  </motion.div>

                </div>
              </PopIn>
            </div>

          </div>
        </div>

        {/* Decorative background glow circles */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/3 left-0 -translate-y-1/2 -translate-x-1/3 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute bottom-0 right-0 translate-x-1/4 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none" 
        />
      </section>

      {/* SECTION 2: AI PLANNER INTERACTIVE PREVIEW */}
      <AnimatedSection className="py-24 bg-white border-y border-slate-200/70">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-100/80 px-3 py-1 rounded-full">
              Trải nghiệm tương tác AI
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mô phỏng kế hoạch sự kiện thông minh
            </h2>
            <p className="text-slate-600 text-base">
              Thử thay đổi quy mô sự kiện bên dưới để thấy Gemini AI tự động tính toán tiết kiệm chi phí và giảm thiểu rác thải nhựa ngay lập tức.
            </p>
          </div>

          {/* Interactive Calculator Block */}
          <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Loại hình sự kiện
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Workshop CLB", "Tiệc sinh nhật", "Lễ hội nhạc"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedEventType(type)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          selectedEventType === type
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Quy mô tham dự:</span>
                    <span className="text-emerald-700 font-extrabold text-sm">{guestCount} người</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>20 người</span>
                    <span>250 người</span>
                    <span>500 người</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-700" /> Khuyên dùng từ Gemini AI:
                  </p>
                  <p className="text-emerald-900 leading-relaxed">
                    Sử dụng gói thuê bộ đồ ăn bằng tre và bình nước thủy tinh dùng lại thay vì chai nhựa 500ml dùng 1 lần.
                  </p>
                </div>
              </div>

              {/* Dynamic Comparison Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Dự toán cho {selectedEventType}</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">AI Simulated</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Chi phí truyền thống (Đồ nhựa 1 lần):</span>
                    <span className="font-bold text-red-600 line-through">{traditionalCost.toLocaleString("vi-VN")} ₫</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-900 font-semibold">
                    <span>Chi phí phương pháp xanh (Thuê P2P):</span>
                    <span className="font-extrabold text-emerald-700">{ecoCost.toLocaleString("vi-VN")} ₫</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] text-emerald-800 font-medium">Tiết kiệm chi phí:</p>
                      <p className="text-lg font-extrabold text-emerald-700">{savings.toLocaleString("vi-VN")} ₫</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-emerald-800 font-medium">Rác nhựa cắt giảm:</p>
                      <p className="text-lg font-extrabold text-emerald-700">~{plasticSaved} kg</p>
                    </div>
                  </div>
                </div>

                <Link href="/ai-planner" className="block pt-2">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs h-11 shadow-sm cursor-pointer">
                    Tạo đề xuất chi tiết bằng AI ngay <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* SECTION 3: ECO-GEAR MARKETPLACE CAROUSEL/GRID */}
      <AnimatedSection className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-100/80 px-3 py-1 rounded-full">
                Chợ vật phẩm Eco-Gear
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                Thiết bị xanh sẵn sàng cho thuê & bán
              </h2>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="rounded-xl font-bold border-slate-300 hover:bg-slate-100 text-xs h-11 cursor-pointer">
                Xem tất cả cửa hàng <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((prod) => (
              <HoverCard key={prod.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {prod.type === "RENT" ? "Thuê" : "Mua"}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {prod.ecoBadge}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 block">📍 {prod.location}</span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{prod.name}</h3>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Giá {prod.type === "RENT" ? "thuê" : "bán"}:</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      {prod.price.toLocaleString("vi-VN")} ₫
                    </span>
                    <span className="text-[10px] text-slate-500">/{prod.priceUnit}</span>
                  </div>
                  <Link href={`/shop`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-3.5 h-9 cursor-pointer">
                      Chi tiết
                    </Button>
                  </Link>
                </div>
              </HoverCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* SECTION 4: P2P SHARING ECONOMY SHOWCASE */}
      <AnimatedSection className="py-24 bg-white border-y border-slate-200/70">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Steps Left */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Đăng thiết bị nhàn rỗi</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cá nhân hoặc Câu lạc bộ sinh viên tải ảnh đồ dùng sự kiện (loa đài, máy ảnh, backdrop, đồ ăn tre) lên ứng dụng.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Cho thuê an toàn & ký quỹ</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hệ thống tự động giữ khoản tiền cọc của người thuê qua ví ký quỹ kỹ thuật số VietQR cho đến khi hoàn trả thiết bị hoàn chỉnh.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Nhận doanh thu & giảm lãng phí</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tạo thu nhập thụ động cho CLB của bạn đồng thời giúp giảm 80% rác thải nhựa và thiết bị dùng 1 lần trong cộng đồng.
                  </p>
                </div>
              </div>
            </div>

            {/* Description Right */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-100/80 px-3 py-1 rounded-full">
                Mô hình kinh tế chia sẻ P2P
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Đừng mua đồ dùng 1 lần. Hãy chia sẻ tài nguyên nhàn rỗi!
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Hàng ngàn thiết bị sự kiện tại các trường đại học và câu lạc bộ đang bị bỏ lãng phí sau mỗi sự kiện. EcoEvent Hub kết nối người cho thuê và người cần thuê với quy trình ký quỹ bảo vệ 100%.
              </p>
              
              <div className="pt-2">
                <Link href="/dashboard/inventory/new">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl px-8 h-12 text-sm shadow-md cursor-pointer">
                    Đăng vật phẩm cho thuê ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </AnimatedSection>

      {/* SECTION 5: TRUST & VERIFIED BADGES */}
      <AnimatedSection className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-800">
              Minh bạch & Đáng tin cậy
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              An tâm giao dịch với hệ thống xác thực Eco
            </h2>
            <p className="text-slate-400 text-sm">
              Chúng tôi bảo vệ quyền lợi của cả chủ thiết bị và người thuê qua công nghệ xác minh tài khoản sinh viên và ví ký quỹ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Ký quỹ an toàn VietQR</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tiền cọc được giữ an toàn trên hệ thống và tự động hoàn trả 100% ngay sau khi giao dịch trả đồ hoàn tất.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Xác thực Sinh viên (.edu.vn)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sinh viên thuộc các trường đại học đã xác thực email `.edu.vn` được ưu đãi giảm/miễn 100% khoản cọc ký quỹ.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Verified Eco Host Badge</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chủ kho hàng và nhà cung cấp được đánh giá sao và gắn huy hiệu uy tín sau mỗi giao dịch cho thuê thành công.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* SECTION: PRICING INTRODUCTION */}
      <AnimatedSection className="py-24 bg-slate-50 border-t border-slate-200/70">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-100/80 px-3 py-1 rounded-full">
              Bảng giá
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Lựa chọn gói dịch vụ phù hợp
            </h2>
            <p className="text-slate-600 text-sm">
              EcoEvent Hub cung cấp các gói dịch vụ linh hoạt đáp ứng mọi nhu cầu từ cá nhân, sinh viên đến các doanh nghiệp tổ chức sự kiện chuyên nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gói Cơ Bản</h3>
              <p className="text-slate-500 text-sm mb-6">Dành cho sinh viên và cá nhân</p>
              <div className="text-4xl font-extrabold text-emerald-700 mb-6">Miễn phí</div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2 Kế hoạch AI / tháng</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Đăng tối đa 3 vật phẩm chợ Eco</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Phí dịch vụ sàn: 5.0%</li>
              </ul>
              <Link href="/pricing" className="w-full">
                <Button variant="outline" className="w-full border-slate-300 font-bold rounded-xl h-11 cursor-pointer">
                  Bắt đầu miễn phí
                </Button>
              </Link>
            </div>
            
            {/* Plus Plan */}
            <div className="bg-emerald-900 p-8 rounded-3xl border border-emerald-800 shadow-xl flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-950 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Phổ biến nhất
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gói Plus</h3>
              <p className="text-emerald-300 text-sm mb-6">Dành cho tổ chức sự kiện vừa & nhỏ</p>
              <div className="text-4xl font-extrabold text-white mb-6">99k<span className="text-lg text-emerald-400 font-normal">/tháng</span></div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-emerald-50">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> AI Event Plan VÔ HẠN</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Đăng tối đa 15 vật phẩm chợ Eco</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Phí dịch vụ ưu đãi: Chỉ 3.0%</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Giảm 50% tiền cọc thuê thiết bị</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Xuất file PDF/Excel kịch bản</li>
              </ul>
              <Link href="/pricing" className="w-full">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl h-11 cursor-pointer">
                  Nâng cấp gói Plus
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gói Premium Vendor</h3>
              <p className="text-slate-500 text-sm mb-6">Giải pháp tùy chỉnh toàn diện</p>
              <div className="text-4xl font-extrabold text-amber-600 mb-6">299k<span className="text-lg text-slate-500 font-normal">/tháng</span></div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Đăng vật phẩm KHÔNG GIỚI HẠN</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Phí dịch vụ thấp nhất: Chỉ 1.5%</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Club & Faculty Portal quản lý đồ</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Hỗ trợ kỹ thuật Ưu tiên 24/7</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Top-Search Boost hiển thị bài đăng</li>
              </ul>
              <Link href="/pricing" className="w-full">
                <Button variant="outline" className="w-full border-slate-300 font-bold rounded-xl h-11 cursor-pointer hover:bg-slate-50">
                  Xem chi tiết
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* SECTION: FAQ */}
      <AnimatedSection className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Câu hỏi thường gặp
            </h2>
            <p className="text-slate-600 text-sm">
              Những thắc mắc phổ biến nhất của người dùng về EcoEvent Hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
              <h4 className="font-bold text-slate-900 mb-2 text-sm">EcoEvent Hub là gì?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Là nền tảng kết hợp công cụ AI lập kế hoạch sự kiện và chợ thiết bị xanh (mô hình kinh tế chia sẻ P2P), giúp tối ưu chi phí và giảm thiểu rác thải nhựa.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
              <h4 className="font-bold text-slate-900 mb-2 text-sm">Tiền cọc thuê đồ có an toàn không?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Có. Chúng tôi sử dụng ví ký quỹ tự động qua VietQR. Tiền cọc của bạn được giữ an toàn bởi hệ thống và tự động hoàn trả 100% sau khi giao dịch kết thúc.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
              <h4 className="font-bold text-slate-900 mb-2 text-sm">Sinh viên có được ưu đãi gì không?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Có! Tài khoản đăng ký bằng email `.edu.vn` sẽ được hệ thống xác thực và giảm/miễn khoản cọc ký quỹ cho hầu hết các thiết bị từ đối tác của chúng tôi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
              <h4 className="font-bold text-slate-900 mb-2 text-sm">Công cụ AI Planner hoạt động ra sao?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gemini AI tự động phân tích quy mô, loại hình sự kiện của bạn để thiết kế dòng thời gian và đề xuất thay thế đồ dùng 1 lần bằng giải pháp xanh tiết kiệm hơn.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* SECTION 6: CALL-TO-ACTION & FOOTER */}
      <section className="py-24 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-center relative overflow-hidden">
        <ScrollReveal>
          <div className="container mx-auto px-4 md:px-6 relative z-10 space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-emerald-200 border border-white/20">
              <Zap className="h-4 w-4 text-yellow-300" /> Bắt đầu hành trình sự kiện xanh ngay hôm nay
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Sẵn sàng tạo nên những sự kiện không rác thải?
            </h2>
            <p className="text-emerald-100 text-base max-w-2xl mx-auto font-medium">
              Đăng ký tài khoản miễn phí để sử dụng công cụ Gemini AI lập kế hoạch sự kiện và khám phá chợ thiết bị eco ngay bây giờ.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-950 hover:bg-emerald-50 rounded-2xl px-9 h-13 font-extrabold text-sm shadow-xl cursor-pointer">
                  Đăng ký tài khoản miễn phí
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto bg-transparent border border-white/40 text-white hover:bg-white/10 rounded-2xl px-9 h-13 font-bold text-sm cursor-pointer transition-all">
                  Khám phá chợ thiết bị
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Leaf className="h-6 w-6 text-emerald-500" />
                <span className="font-bold text-xl tracking-tight">EcoEvent Hub</span>
              </div>
              <p className="text-sm leading-relaxed">Nền tảng sự kiện sinh thái & kinh tế chia sẻ hàng đầu dành cho sinh viên và giới trẻ.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/ai-planner" className="hover:text-emerald-400 transition">AI lập kế hoạch</Link></li>
                <li><Link href="/shop" className="hover:text-emerald-400 transition">Chợ thiết bị xanh</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-400 transition">Bảng giá gói</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-emerald-400 transition">Câu hỏi thường gặp</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition">Liên hệ chúng tôi</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition">Chính sách bảo mật</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Kết nối</h4>
              <p className="text-sm mb-4">Nhận thông tin cập nhật mới nhất về các sự kiện xanh.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email của bạn" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-emerald-500 text-white" />
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-2 text-sm font-bold transition">Gửi</button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800/50 text-xs text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} EcoEvent Hub. Đã đăng ký bản quyền.</p>
            <div className="flex gap-4">
              <span>Made with <Heart className="h-3 w-3 inline text-red-500" /> for a greener future</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
