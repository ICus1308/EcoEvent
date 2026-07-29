"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, QrCode, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

function CheckoutInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "1";
  const daysParam = searchParams.get("days");
  
  const product = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  const isRent = product.listingType === "RENT";
  const days = isRent ? parseInt(daysParam || "1") : 1;
  
  const basePrice = isRent ? (product.rentalPricePerDay || 0) * days : (product.price || 0);
  const platformFee = basePrice * 0.03; // 3% eco-fee
  const deposit = isRent ? (product.depositAmount || 0) : 0;
  const totalPayment = basePrice + platformFee + deposit;

  const [step, setStep] = useState(1); // 1: Review, 2: Payment, 3: Success

  const handlePayment = () => {
    setStep(2);
    // Simulate webhook payment success after 3 seconds
    setTimeout(() => {
      setStep(3);
    }, 3000);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <h1 className="text-2xl font-bold">Thanh toán An toàn</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          Bảo vệ người mua EcoShare
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">{isRent ? "Hợp đồng Thuê" : "Điều khoản Mua hàng"}</h2>
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 text-sm space-y-4">
                <p>Bằng cách tiếp tục, bạn đồng ý với Điều khoản {isRent ? "Thuê" : "Mua"} EcoShare:</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {isRent ? (
                    <>
                      <li>Bạn chịu trách nhiệm hoàn trả "{product.name}" trong tình trạng ban đầu.</li>
                      <li>Số tiền cọc {deposit.toLocaleString()} ₫ sẽ được giữ ký quỹ và hoàn trả sau khi trả lại hàng an toàn.</li>
                      <li>Trả trễ sẽ bị phạt tùy theo quy định của người cho thuê.</li>
                    </>
                  ) : (
                    <>
                      <li>Sản phẩm "{product.name}" sẽ được giao đến địa chỉ của bạn.</li>
                      <li>Người bán cam kết chất lượng sản phẩm như mô tả.</li>
                      <li>Chính sách hoàn trả áp dụng trong vòng 3 ngày kể từ khi nhận hàng.</li>
                    </>
                  )}
                </ul>
                <div className="pt-4 border-t flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Hợp đồng Kỹ thuật số tự động tạo
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt Đơn hàng</CardTitle>
                <CardDescription>
                  {isRent ? `Thuê ${days} Ngày` : 'Mua ngay'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{product.name}</span>
                  <span>{basePrice.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí sinh thái nền tảng (3%)</span>
                  <span>{platformFee.toLocaleString()} ₫</span>
                </div>
                {isRent && (
                  <div className="flex justify-between text-muted-foreground border-t pt-3">
                    <span>Tiền cọc ký quỹ (có thể hoàn lại)</span>
                    <span>{deposit.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl pt-4 border-t">
                  <span>Tổng thanh toán</span>
                  <span>{totalPayment.toLocaleString()} ₫</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handlePayment}>
                  Thanh toán qua VietQR <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center pb-2">
              <CardTitle>Quét mã để Thanh toán</CardTitle>
              <CardDescription>Sử dụng bất kỳ ứng dụng ngân hàng nào để quét mã VietQR</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <div className="bg-white p-4 rounded-xl shadow-inner border mb-6">
                {/* Simulated QR Code using an icon */}
                <QrCode className="w-48 h-48 text-black" />
              </div>
              <div className="text-center space-y-2 mb-6">
                <div className="text-sm text-muted-foreground">Số tiền cần thanh toán</div>
                <div className="text-2xl font-bold text-green-700">{totalPayment.toLocaleString()} ₫</div>
                <div className="text-xs text-muted-foreground mt-2">Đang chờ xác nhận thanh toán qua SePay...</div>
              </div>
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Thanh toán Thành công!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Đơn {isRent ? "thuê" : "mua"} {product.name} của bạn đã được xác nhận. {isRent && "Tiền cọc đang được giữ an toàn."}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/orders">
              <Button variant="outline">Xem Đơn hàng</Button>
            </Link>
            <Link href="/messages">
              <Button className="bg-green-600 hover:bg-green-700">Nhắn tin Chủ {isRent ? "cho thuê" : "cửa hàng"}</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-4" /> Đang tải trang thanh toán...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
