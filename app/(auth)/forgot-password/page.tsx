"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  // 1: Enter Email | 2: Enter OTP & New Password
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  
  // OTP logic
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(0);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let interval: any;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMsg("Vui lòng nhập email của bạn.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Không thể gửi yêu cầu.");
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || "Đã gửi mã OTP!");
      setStep(2);
      setTimer(60); // 60s cooldown for resend
    } catch (err) {
      setErrorMsg("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMsg("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      digits.forEach((_, idx) => {
        if (inputRefs.current[idx]) inputRefs.current[idx]!.value = digits[idx];
      });
      inputRefs.current[5]?.focus();
    }
  };

  // Submit new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    
    if (fullCode.length !== 6) {
      setErrorMsg("Vui lòng nhập đủ 6 số OTP.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode, newPassword })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Không thể đặt lại mật khẩu.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Đổi mật khẩu thành công! Đang chuyển hướng...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setErrorMsg("Lỗi kết nối máy chủ.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto lg:mx-0">
      <h2 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">Khôi Phục Mật Khẩu</h2>
      <p className="text-slate-500 mb-8 font-medium text-sm">
        {step === 1 ? "Nhập email của bạn để nhận mã OTP." : "Nhập mã OTP và mật khẩu mới của bạn."}
      </p>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm font-medium">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-800 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email của bạn</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input 
                type="email" 
                placeholder="nguyenvana@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="pl-10 bg-slate-50/50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600 placeholder:text-slate-400" 
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] mt-2 transition-all shadow-md hover:shadow-lg" 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Nhận mã Xác thực"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center block mb-2">Nhập mã OTP 6 số</label>
            <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center font-extrabold text-xl rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all shadow-sm"
                />
              ))}
            </div>
            
            <div className="text-center mt-3">
              {timer > 0 ? (
                <span className="text-xs text-slate-500 font-medium">Gửi lại sau <strong className="text-emerald-600">{timer}s</strong></span>
              ) : (
                <button type="button" onClick={() => handleRequestOtp()} className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1 mx-auto">
                  <RefreshCw className="h-3 w-3" /> Gửi lại mã
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input 
                type="password" 
                placeholder="Nhập mật khẩu mới" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
                minLength={6}
                className="pl-10 bg-slate-50/50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600 placeholder:text-slate-400" 
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] transition-all shadow-md hover:shadow-lg" 
            disabled={loading || otp.join("").length !== 6 || newPassword.length < 6}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Xác nhận & Đổi Mật Khẩu"}
          </Button>
        </form>
      )}

      <div className="mt-8 text-center text-sm">
        <Link href="/login" className="text-slate-500 font-medium hover:text-green-600 transition-colors flex items-center justify-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Quay lại Đăng Nhập
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Column - Hero/Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-500 to-green-700 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            EcoEvent Hub
          </Link>
          <div className="mt-24 xl:mt-32 max-w-xl">
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Bảo Mật Bền Vững
            </h1>
            <p className="text-lg text-green-50/90 font-medium leading-relaxed max-w-md">
              Chúng tôi luôn đảm bảo an toàn tuyệt đối cho tài khoản của bạn. Đặt lại mật khẩu dễ dàng qua hệ thống mã xác thực một lần (OTP).
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 bg-white text-slate-900">
        <div className="flex items-center justify-between lg:justify-start mb-8 lg:mb-12">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 px-0 hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold text-xl text-green-700">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            EcoEvent
          </Link>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-sm font-medium">Đang tải...</div>}>
          <ForgotPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
