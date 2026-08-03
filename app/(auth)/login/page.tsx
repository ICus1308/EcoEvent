"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Loader2, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import { SlideUp, FadeIn, staggerContainerVariants, staggerItemVariants } from "@/components/ui/animations";

export default function LoginPage() {
  const router = useRouter();
  const { loginToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Unverified state & Resend email handling
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setIsUnverified(false);
    setResendSuccessMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        setErrorMessage(`Máy chủ gặp lỗi (${res.status}). Vui lòng thử lại sau.`);
        setLoading(false);
        return;
      }

      if (res.status === 403 && data.unverified) {
        setIsUnverified(true);
        setUnverifiedEmail(data.email || emailOrUsername);
        setErrorMessage(data.error || "Tài khoản chưa được xác minh email.");
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Đăng nhập thất bại.");
        setLoading(false);
        return;
      }

      loginToken(data.token, data.user);
    } catch (err) {
      console.error("Login client error:", err);
      setErrorMessage("Không thể kết nối đến máy chủ.");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail || resending) return;
    setResending(true);
    setResendSuccessMsg("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendSuccessMsg(data.message || "Đã gửi lại email xác nhận!");
      } else {
        setErrorMessage(data.error || "Không thể gửi lại email xác nhận.");
      }
    } catch (e) {
      setErrorMessage("Lỗi kết nối khi gửi lại email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      
      {/* Left Column - Hero/Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-500 to-green-700 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity w-fit">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              EcoEvent Hub
            </Link>
          </motion.div>
          
          <div className="mt-24 xl:mt-32 max-w-xl">
            <SlideUp delay={0.2}>
              <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
                Chào Mừng Trở Lại!
              </h1>
            </SlideUp>
            <SlideUp delay={0.3}>
              <p className="text-lg text-green-50/90 font-medium leading-relaxed max-w-md">
                Đăng nhập để tiếp tục quản lý các sự kiện xanh, theo dõi đơn hàng thiết bị và kết nối với cộng đồng chia sẻ tài nguyên.
              </p>
            </SlideUp>
          </div>
          
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            animate="show"
            className="mt-16 grid grid-cols-2 gap-4 max-w-md"
          >
            <motion.div variants={staggerItemVariants} className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-black/30 transition-colors">
              <h3 className="font-bold text-2xl mb-1 tracking-tight">An Toàn</h3>
              <p className="text-sm text-green-50/80 font-medium">Bảo mật tài khoản</p>
            </motion.div>
            <motion.div variants={staggerItemVariants} className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-black/30 transition-colors">
              <h3 className="font-bold text-2xl mb-1 tracking-tight">Nhanh Chóng</h3>
              <p className="text-sm text-green-50/80 font-medium">Quản lý liền mạch</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 bg-white text-slate-900">
        <FadeIn delay={0.1} className="flex items-center justify-between lg:justify-start mb-8 lg:mb-12">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="text-slate-500 hover:text-slate-900 px-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>

          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold text-xl text-green-700">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            EcoEvent
          </Link>
        </FadeIn>

        <SlideUp delay={0.2} className="w-full max-w-[420px] mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">Đăng Nhập</h2>
          <p className="text-slate-500 mb-8 font-medium text-sm">Truy cập vào tài khoản EcoEvent Hub của bạn.</p>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-3 text-amber-900 text-sm font-medium">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              
              {isUnverified && (
                <Button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="mt-1 h-9 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 w-full justify-center"
                >
                  {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Gửi lại Email xác nhận ngay
                </Button>
              )}
            </div>
          )}

          {resendSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-800 text-sm font-medium">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{resendSuccessMsg}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email hoặc Tên đăng nhập</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="nguyenvana@example.com" 
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required 
                  className="pl-10 bg-slate-50/50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600 placeholder:text-slate-400" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="Nhập mật khẩu" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="pl-10 bg-slate-50/50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600 placeholder:text-slate-400" 
                />
              </div>
              <div className="flex justify-end pt-1">
                <Link href="/forgot-password" className="text-xs font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] mt-2 transition-all shadow-md hover:shadow-lg" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                <span className="flex items-center justify-center">
                  Đăng Nhập <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500 font-medium">Chưa có tài khoản? </span>
            <Link href="/register" className="text-green-600 hover:text-green-700 font-bold ml-1 transition-colors">
              Đăng ký
            </Link>
          </div>
        </SlideUp>
      </div>
    </div>
  );
}
