"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, ShieldCheck, ArrowRight, ArrowLeft, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginToken } = useAuth();

  const emailParam = searchParams.get("email") || "";
  const [email] = useState(emailParam);

  // 6-digit PIN state
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [timer, setTimer] = useState(60);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus box 0 on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMsg("");

    // Auto-advance focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      digits.forEach((_, idx) => {
        if (inputRefs.current[idx]) {
          inputRefs.current[idx]!.value = digits[idx];
        }
      });
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("Vui lòng nhập đầy đủ 6 chữ số mã xác thực.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Mã xác thực không hợp lệ.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Xác thực thành công! Đang chuyển hướng...");
      loginToken(data.token, data.user);
      setTimeout(() => {
        router.push("/dashboard/inventory");
      }, 1000);
    } catch (err) {
      setErrorMsg("Lỗi kết nối máy chủ.");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Đã gửi lại mã xác thực 6 chữ số mới!");
        setTimer(60);
      } else {
        setErrorMsg(data.error || "Không thể gửi lại mã.");
      }
    } catch (err) {
      setErrorMsg("Không thể kết nối máy chủ.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Xác Thực Email (OTP)</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Mã xác thực 6 chữ số đã được gửi tới email:
        </p>
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">{email || "nguyenvana@example.com"}</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2.5 text-red-700 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6-Digit PIN Boxes */}
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center font-extrabold text-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <span className="flex items-center justify-center">
              Xác Nhận & Kích Hoạt <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      {/* Resend Section */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 font-medium mb-2">Bạn không nhận được mã verification?</p>
        {timer > 0 ? (
          <span className="text-xs font-semibold text-slate-400">
            Gửi lại mã mới sau <strong className="text-emerald-600">{timer}s</strong>
          </span>
        ) : (
          <button
            onClick={handleResendOtp}
            disabled={resending}
            className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
          >
            {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Gửi Lại Mã 6 Chữ Số Ngay
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="mb-6 flex items-center gap-2 font-bold text-2xl text-emerald-700 dark:text-emerald-400">
        <div className="bg-emerald-600 p-2 rounded-xl text-white">
          <Leaf className="h-5 w-5" />
        </div>
        EcoEvent Hub
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm font-medium">Đang tải màn hình xác thực...</div>}>
        <OTPForm />
      </Suspense>

      <div className="mt-8 text-xs text-slate-400 font-medium">
        <Link href="/register" className="hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Trở về trang đăng ký
        </Link>
      </div>
    </div>
  );
}
