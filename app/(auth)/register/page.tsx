"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Loader2, User, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { Role } from "@prisma/client";

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: "Khách hàng (Lên kế hoạch, Thuê đồ)",
  VERIFIED_STUDENT: "Sinh viên (Yêu cầu email .edu.vn)",
  VENDOR: "Nhà cung cấp / Câu lạc bộ"
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "user_" + Date.now();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, fullname, password, role })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        setErrorMessage(`Máy chủ gặp lỗi (${res.status}). Vui lòng thử lại sau.`);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Đăng ký thất bại.");
        setLoading(false);
        return;
      }

      // If requireOtp is returned, navigate to OTP verification screen
      if (data.requireOtp) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Register client error:", err);
      setErrorMessage("Không thể kết nối đến máy chủ.");
      setLoading(false);
    }
  };

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
              Tương lai của tổ chức sự kiện xanh.
            </h1>
            <p className="text-lg text-green-50/90 font-medium leading-relaxed max-w-md">
              Tham gia cùng những nhà tiên phong sử dụng công nghệ AI để lên kế hoạch sự kiện và chia sẻ tài nguyên một cách bền vững, tiết kiệm chi phí trong thời gian thực.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-black/30 transition-colors">
              <h3 className="font-bold text-2xl mb-1 tracking-tight">AI Planner</h3>
              <p className="text-sm text-green-50/80 font-medium">Lên kế hoạch thông minh</p>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-black/30 transition-colors">
              <h3 className="font-bold text-2xl mb-1 tracking-tight">24/7</h3>
              <p className="text-sm text-green-50/80 font-medium">Chia sẻ tài nguyên</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 bg-white text-slate-900">
        <div className="flex items-center justify-between lg:justify-start mb-8 lg:mb-12">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")} 
            className="text-slate-500 hover:text-slate-900 px-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Trang Chủ
          </Button>

          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold text-xl text-green-700">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            EcoEvent
          </Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">Tạo Tài Khoản</h2>
          <p className="text-slate-500 mb-8 font-medium text-sm">Bắt đầu hành trình xanh của bạn hôm nay.</p>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm font-medium">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và Tên</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Nguyễn Văn A" 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required 
                  className="pl-10 bg-slate-50/50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600 placeholder:text-slate-400" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Địa chỉ Email</label>
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
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="Mật khẩu của bạn (ít nhất 6 ký tự)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                  className="pl-10 bg-slate-50/50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600 placeholder:text-slate-400" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vai trò</label>
              <Select value={role} onValueChange={(val) => val && setRole(val as Role)}>
                <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-slate-900 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600">
                  <SelectValue placeholder="Chọn vai trò của bạn">
                    {ROLE_LABELS[role]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 min-w-[320px] shadow-lg">
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {role === "VERIFIED_STUDENT" && (
              <div className="px-4 py-3 bg-green-50 text-green-800 text-xs rounded-xl border border-green-200 font-medium leading-relaxed">
                Sau khi xác thực email, bạn sẽ được miễn phí tiền cọc và nhận ưu đãi độc quyền.
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] mt-2 transition-all shadow-md hover:shadow-lg cursor-pointer" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                <span className="flex items-center justify-center">
                  Tiếp Tục Xác Thực Email <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500 font-medium">Đã có tài khoản? </span>
            <Link href="/login" className="text-green-600 hover:text-green-700 font-bold ml-1 transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
