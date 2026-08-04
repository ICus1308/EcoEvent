"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { User, CreditCard, Bell, Shield, BookOpen, Save, CheckCircle2, Loader2, Lock, Sparkles, Wallet, Receipt, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { SlideUp } from "@/components/ui/animations";

export default function SettingsPage() {
  const { user, checkSession } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Profile Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+84 912 345 678");
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80");

  // Notifications Toggles (Tailored to EcoEvent Hub)
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [depositNotifs, setDepositNotifs] = useState(true);
  const [aiSuggestionsNotifs, setAiSuggestionsNotifs] = useState(false);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(true);

  // AI & Privacy Toggles (Tailored to EcoEvent Hub)
  const [aiPersonalization, setAiPersonalization] = useState(true);
  const [publicContactInfo, setPublicContactInfo] = useState(true);
  const [hideExactAddress, setHideExactAddress] = useState(true);

  useEffect(() => {
    if (user) {
      setDisplayName(user.fullname || user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      try {
        const token = localStorage.getItem("sessionToken");
        if (token && token.startsWith("demo-token-")) {
          const encoded = token.replace("demo-token-", "");
          const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
          let jsonStr = "";

          if (typeof window !== "undefined" && window.atob) {
            try {
              jsonStr = decodeURIComponent(escape(window.atob(base64)));
            } catch {
              jsonStr = window.atob(base64);
            }
          } else if (typeof Buffer !== "undefined") {
            jsonStr = Buffer.from(base64, "base64").toString("utf-8");
          }

          if (jsonStr) {
            const currentData = JSON.parse(jsonStr);
            currentData.fullname = displayName;
            currentData.email = email;
            
            const stringified = JSON.stringify(currentData);
            let newEncoded = "";
            if (typeof window !== "undefined" && window.btoa) {
              newEncoded = window.btoa(unescape(encodeURIComponent(stringified)))
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
            } else if (typeof Buffer !== "undefined") {
              newEncoded = Buffer.from(stringified).toString("base64url");
            }

            if (newEncoded) {
              localStorage.setItem("sessionToken", "demo-token-" + newEncoded);
              checkSession();
            }
          }
        }
      } catch (err) {
        console.warn("Safe token parse warning:", err);
      }
      showToast("Đã lưu các thay đổi thông tin cá nhân của bạn!");
    }, 600);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không trùng khớp.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Đã cập nhật mật khẩu thành công!");
    }, 600);
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <SlideUp>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Cài đặt tài khoản
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý thông tin cá nhân, đơn hàng, thông báo tin nhắn và quyền riêng tư trên EcoEvent Hub.
          </p>
        </div>
      </SlideUp>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <SlideUp delay={0.1} className="md:col-span-1">
          <nav className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <User className="h-4 w-4" /> Hồ sơ cá nhân
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "billing"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <CreditCard className="h-4 w-4" /> Thanh toán & Ví cọc
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <Bell className="h-4 w-4" /> Thông báo & Đơn hàng
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <Shield className="h-4 w-4" /> Bảo mật & Mật khẩu
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "privacy"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="h-4 w-4" /> Gemini AI & Quyền riêng tư
            </button>
          </nav>
        </SlideUp>

        {/* Main Content Area */}
        <SlideUp delay={0.2} className="md:col-span-3">
          <Card className="border-slate-200 dark:border-slate-800 shadow-md">
            <CardContent className="p-6 md:p-8">
              
              {/* Feedback Alert Toast */}
              {savedSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-300 text-sm font-medium"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>{feedbackMessage}</span>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                
                {/* 1. Profile Tab */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
                      <div className="h-16 w-16 rounded-full bg-green-700 text-white flex items-center justify-center text-xl font-bold border-2 border-green-500 shadow-inner flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {displayName || "Người dùng"}
                          </h2>
                          <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2.5 py-0.5 rounded-full font-semibold border border-green-200 dark:border-green-800">
                            {user?.role === "VENDOR" ? "Nhà cung cấp / Câu lạc bộ" : user?.role === "VERIFIED_STUDENT" ? "Sinh viên Xác thực" : "Thành viên Eco"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {email || "nguyenvana@example.com"}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Tên hiển thị
                          </label>
                          <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Nhập tên hiển thị của bạn"
                            className="bg-slate-50/50 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Địa chỉ Email
                          </label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nguyenvana@example.com"
                            className="bg-slate-50/50 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Số điện thoại liên hệ
                          </label>
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+84 912 345 678"
                            className="bg-slate-50/50 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Đường dẫn Avatar
                          </label>
                          <Input
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="bg-slate-50/50 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (user) {
                              setDisplayName(user.fullname || user.username || "");
                              setEmail(user.email || "");
                            }
                          }}
                          className="rounded-xl h-11 px-6 font-semibold cursor-pointer"
                        >
                          Hủy
                        </Button>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 px-6 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</>
                          ) : (
                            <><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* 2. Billing & Plan Tab */}
                {activeTab === "billing" && (
                  <motion.div
                    key="billing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Current Plan Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-green-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-green-800/40 shadow-lg">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-green-400 font-bold">Gói tài khoản hiện tại</span>
                        <h3 className="text-2xl font-bold mt-1">Người dùng Sinh Thái (Eco Member)</h3>
                        <p className="text-sm text-slate-300 mt-0.5">Được miễn phí tạo kế hoạch AI và đăng sản phẩm cho thuê cơ bản.</p>
                      </div>
                      <Button 
                        onClick={() => showToast("✨ Cảm ơn bạn! Yêu cầu nâng cấp gói Eco Vendor Pro đã được gửi.")}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl px-6 h-11 shadow-md hover:shadow-lg flex-shrink-0 cursor-pointer"
                      >
                        Nâng cấp Gói Pro
                      </Button>
                    </div>

                    {/* Escrow Wallet Box */}
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
                          <Wallet className="h-5 w-5 text-green-600" /> Ví ký quỹ & đặt cọc thuê đồ
                        </div>
                        <span className="font-bold text-lg text-green-600">1,000,000 ₫</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Số tiền cọc ký quỹ được giữ an toàn và sẽ hoàn trả tự động vào ví của bạn ngay sau khi chủ thiết bị xác nhận thiết bị được hoàn trả an toàn.
                      </p>
                    </div>

                    {/* Order & Payment History */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">
                        <Receipt className="h-5 w-5 text-green-600" /> Lịch sử đơn hàng & thanh toán
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-card flex justify-between items-center text-sm">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">Đơn thuê #ORD-9421: Bộ đồ ăn tre (100 người)</p>
                            <p className="text-xs text-slate-500">Ngày 10 tháng 8, 2026 • Cọc ký quỹ: 1,000,000 ₫</p>
                          </div>
                          <span className="font-bold text-green-600">1,945,000 ₫</span>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-card flex justify-between items-center text-sm">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">Đơn thuê #ORD-8820: Máy ảnh Sony A7III</p>
                            <p className="text-xs text-slate-500">Ngày 25 tháng 7, 2026 • Đã hoàn tất</p>
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">1,250,000 ₫</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. Notifications Tab */}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800">
                      <div>
                        <h4 className="font-bold text-base">Thông báo tin nhắn mới</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Nhận thông báo ngay khi có khách hàng hoặc người cho thuê gửi tin nhắn.</p>
                      </div>
                      <button
                        onClick={() => setMessageNotifs(!messageNotifs)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${messageNotifs ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${messageNotifs ? 'left-6.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800">
                      <div>
                        <h4 className="font-bold text-base">Thông báo đơn hàng & cho thuê sản phẩm</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Thông báo khi có người thuê/mua đồ của bạn hoặc khi đơn thuê sắp đến hạn trả.</p>
                      </div>
                      <button
                        onClick={() => setOrderNotifs(!orderNotifs)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${orderNotifs ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${orderNotifs ? 'left-6.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800">
                      <div>
                        <h4 className="font-bold text-base">Cảnh báo tiền cọc & ký quỹ</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Nhận thông báo khi tiền cọc được giữ hoặc được hoàn trả về ví của bạn.</p>
                      </div>
                      <button
                        onClick={() => setDepositNotifs(!depositNotifs)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${depositNotifs ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${depositNotifs ? 'left-6.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800">
                      <div>
                        <h4 className="font-bold text-base">Gợi ý kế hoạch xanh từ Gemini AI</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Nhận bản tin cập nhật giải pháp giảm rác thải sự kiện từ AI.</p>
                      </div>
                      <button
                        onClick={() => setAiSuggestionsNotifs(!aiSuggestionsNotifs)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${aiSuggestionsNotifs ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${aiSuggestionsNotifs ? 'left-6.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800 mt-6">
                      <div>
                        <h4 className="font-bold text-base">Thử nghiệm thông báo đẩy</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Tạo thông báo mẫu về tin nhắn và khách đặt hàng.</p>
                      </div>
                      <Button
                        onClick={() => showToast("📦 Khách hàng vừa đặt thuê sản phẩm 'Bộ đồ ăn tre' của bạn!")}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-5 cursor-pointer"
                      >
                        Thử nghiệm Thông báo Đẩy
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* 4. Security Tab */}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-slate-100">
                        <Lock className="h-5 w-5 text-green-600" /> Mật khẩu đăng nhập
                      </div>

                      <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
                            <Input
                              type="password"
                              placeholder="Nhập mật khẩu hiện tại"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="bg-slate-50/50 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
                            <Input
                              type="password"
                              placeholder="Nhập mật khẩu mới"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-slate-50/50 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Xác nhận Mật khẩu mới</label>
                          <Input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-slate-50/50 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-6 h-11 mt-2 cursor-pointer"
                        >
                          {loading ? "Đang cập nhật..." : "Cập nhật Mật khẩu"}
                        </Button>
                      </form>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800">
                      <div>
                        <h4 className="font-bold text-base">Xác minh 2 bước (2FA)</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Bảo vệ tài khoản và giao dịch thuê đồ bằng mã OTP qua email hoặc SMS.</p>
                      </div>
                      <button
                        onClick={() => setTwoFactor(!twoFactor)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${twoFactor ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${twoFactor ? 'left-6.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-green-950/40 border border-green-800/40 flex items-center justify-between text-green-300 text-sm">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Xác thực sinh viên (.edu.vn)</p>
                          <p className="text-xs text-green-400/80">Tài khoản của bạn đã được ưu đãi miễn phí 100% tiền đặt cọc thuê thiết bị.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. AI & Privacy Tab */}
                {activeTab === "privacy" && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800">
                      <div>
                        <h4 className="font-bold text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-400" /> Cho phép Gemini AI cá nhân hóa kế hoạch
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Sử dụng quy mô sự kiện và ngân sách của bạn để tạo dòng thời gian xanh tự động.</p>
                      </div>
                      <button
                        onClick={() => setAiPersonalization(!aiPersonalization)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${aiPersonalization ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${aiPersonalization ? 'left-6.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800">
                      <div>
                        <h4 className="font-bold text-base">Công khai số điện thoại cho người thuê</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Cho phép người thuê nhìn thấy số điện thoại khi đơn thuê được xác nhận thành công.</p>
                      </div>
                      <button
                        onClick={() => setPublicContactInfo(!publicContactInfo)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${publicContactInfo ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${publicContactInfo ? 'left-6.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center border border-slate-800">
                      <div>
                        <h4 className="font-bold text-base">Ẩn vị trí kho hàng chi tiết</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Chỉ hiển thị bán kính khu vực chung của thiết bị cho đến khi đơn đặt hàng được xác nhận.</p>
                      </div>
                      <button
                        onClick={() => setHideExactAddress(!hideExactAddress)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${hideExactAddress ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${hideExactAddress ? 'left-6.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </div>
  );
}
