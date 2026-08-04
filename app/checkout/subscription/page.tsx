"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Copy, Loader2, QrCode, ShieldCheck, Sparkles } from "lucide-react";

function SubscriptionCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tier = searchParams.get("tier") || "PLUS";
  const interval = searchParams.get("interval") || "MONTHLY";

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function initCheckout() {
      setLoading(true);
      setErrorMsg("");
      try {
        const token = localStorage.getItem("sessionToken");
        if (!token) {
          router.push(`/login?redirect=/checkout/subscription?tier=${tier}&interval=${interval}`);
          return;
        }

        const res = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tier, interval }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setCheckoutData(data);
        } else {
          setErrorMsg(data.error || "Không thể khởi tạo đơn thanh toán.");
        }
      } catch (err) {
        setErrorMsg("Không thể kết nối đến máy chủ thanh toán.");
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [tier, interval, router]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!checkoutData) return;
    setVerifying(true);
    try {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch("/api/subscription/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          paymentId: checkoutData.paymentId,
          transactionRef: checkoutData.transactionRef,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        alert(data.error || "Không thể xác minh thanh toán.");
      }
    } catch (err) {
      alert("Lỗi kết nối khi xác minh thanh toán.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
        <h2 className="text-base font-bold font-heading text-slate-800">Đang khởi tạo mã VietQR...</h2>
        <p className="text-xs text-slate-500 mt-1">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            !
          </div>
          <h2 className="text-lg font-bold font-heading text-slate-900 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-xs text-slate-600 mb-6">{errorMsg}</p>
          <Link href="/pricing">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs">
              Quay lại Bảng Giá
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 max-w-md w-full text-center shadow-lg animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-bold font-numeric uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3 inline-block">
            Thanh Toán Thành Công
          </span>
          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">
            Nâng Cấp Thành Công!
          </h2>
          <p className="text-xs text-slate-600 mb-6 font-body">
            Gói dịch vụ <strong>{checkoutData?.planName}</strong> của bạn đã được kích hoạt thành công. Hãy bắt đầu khám phá các tính năng cao cấp!
          </p>
          
          <div className="space-y-2">
            <Link href="/dashboard/inventory/new" className="block">
              <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer">
                Thêm sản phẩm
              </Button>
            </Link>
            <Link href="/pricing" className="block">
              <Button variant="ghost" className="w-full text-slate-600 font-medium text-xs">
                Xem lại Gói Cước
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bank = checkoutData?.bankInfo;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/pricing">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 text-xs">
              <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Bảng Giá
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-bold font-heading text-slate-800 text-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Thanh Toán Gói Thành Viên</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold font-numeric uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
            Thanh Toán An Toàn Qua VietQR
          </span>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900">
            Nâng Cấp Gói {checkoutData?.planName}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Quét mã QR bằng ứng dụng Ngân hàng (MBBank, Vietcombank, Techcombank, MoMo...) để kích hoạt gói ngay tức thì.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: VietQR Code */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-700">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Quét mã VietQR tự động nhập số tiền & nội dung</span>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white border-2 border-emerald-500 rounded-2xl shadow-md mb-4 relative group">
              <img
                src={checkoutData?.qrUrl}
                alt="VietQR Payment Code"
                className="w-64 h-64 object-contain rounded-xl"
              />
            </div>

            <p className="text-[11px] text-slate-500 italic max-w-xs">
              Mã QR đã bao gồm số tiền <strong className="text-emerald-700 font-numeric">{checkoutData?.amount?.toLocaleString("vi-VN")}đ</strong> và cú pháp chuyển khoản chính xác.
            </p>
          </div>

          {/* Right Column: Bank Details & Action */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider mb-4 border-b pb-2 border-slate-100">
                Thông Tin Chuyển Khoản Thủ Công
              </h3>

              <div className="space-y-3.5 text-xs font-body">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-bold text-slate-900 font-heading">{bank?.bankName}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-numeric text-slate-900 text-sm">{bank?.accountNo}</span>
                    <button
                      onClick={() => handleCopy(bank?.accountNo)}
                      className="p-1 text-slate-400 hover:text-emerald-600"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-900">{bank?.accountName}</span>
                </div>

                <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-600 font-semibold">Số tiền thanh toán:</span>
                  <span className="font-extrabold font-numeric text-emerald-700 text-base">
                    {bank?.amount?.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-amber-800 font-bold block">Nội dung chuyển khoản (bắt buộc):</span>
                    <span className="font-mono font-bold text-amber-900 text-sm tracking-wider">{bank?.refCode}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(bank?.refCode)}
                    className="p-2 bg-amber-200/60 hover:bg-amber-300 rounded-lg text-amber-900 font-bold text-[11px] flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            </div>

            {copied && (
              <p className="text-[11px] text-emerald-600 font-medium text-center animate-in fade-in">
                ✓ Đã sao chép vào bộ nhớ tạm!
              </p>
            )}

            <hr className="border-slate-100" />

            <div className="space-y-3">
              <Button
                disabled={verifying}
                onClick={handleConfirmPayment}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang kiểm tra giao dịch...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" /> Tôi Đã Chuyển Khoản Thành Công
                  </>
                )}
              </Button>
              <p className="text-[11px] text-slate-400 text-center font-normal">
                Hệ thống sẽ tự động kích hoạt gói của bạn ngay khi nhận được xác nhận chuyển khoản.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-body text-xs text-slate-500">Đang tải trang thanh toán...</div>}>
      <SubscriptionCheckoutContent />
    </Suspense>
  );
}
