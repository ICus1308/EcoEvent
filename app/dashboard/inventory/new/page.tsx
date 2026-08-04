"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Leaf, Loader2, Image as ImageIcon, AlertCircle, CheckCircle2, DollarSign, Calendar, ShieldCheck, Tag, Barcode } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const CATEGORY_LABELS: Record<string, string> = {
  DECORATION: "Trang trí & Không gian (Decoration)",
  EQUIPMENT: "Thiết bị & Âm thanh (Equipment)",
  TABLEWARE: "Dụng cụ ăn uống Eco (Tableware)",
  ATTIRE: "Trang phục & Phụ kiện (Attire)",
  PROJECT_TOOLS: "Dụng cụ dự án & Thi công (Project Tools)"
};

export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [listingType, setListingType] = useState<"SALE" | "RENT">("RENT");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<string>("EQUIPMENT");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState("");
  const [ecoFeatures, setEcoFeatures] = useState("Vật liệu tái chế, thân thiện môi trường");

  // Conditional price states
  const [price, setPrice] = useState<string>("");
  const [rentalPricePerDay, setRentalPricePerDay] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");

  const generateAutoSKU = () => {
    const prefix = listingType === "SALE" ? "ECO-SALE-" : "ECO-RENT-";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCode(prefix + randomNum);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setErrorMessage("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImageUrl(data.url);
        setErrorMessage(""); // clear any previous errors
      } else {
        const errorText = data.error || "Lỗi upload ảnh.";
        setErrorMessage(errorText);
        alert("LỖI TẢI ẢNH: " + errorText + "\n\nVui lòng xem hướng dẫn để mở quyền (Policy) trên Supabase.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến máy chủ upload.");
      alert("Không thể kết nối đến máy chủ upload.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Client-side Validation
    if (!name.trim()) {
      setErrorMessage("Vui lòng nhập tên sản phẩm.");
      setLoading(false);
      return;
    }
    if (!code.trim()) {
      setErrorMessage("Vui lòng nhập mã sản phẩm / SKU.");
      setLoading(false);
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMessage("Hình ảnh chưa được tải lên thành công. Hãy thử lại hoặc sửa quyền Supabase theo hướng dẫn!");
      setLoading(false);
      return;
    }
    if (stock < 1) {
      setErrorMessage("Số lượng tồn kho phải lớn hơn 0.");
      setLoading(false);
      return;
    }

    const payload: any = {
      name,
      code,
      sku: code,
      category,
      description,
      stock: Number(stock),
      imageUrl,
      ecoFeatures,
      listingType
    };

    if (listingType === "SALE") {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0 || price === "") {
        setErrorMessage("Vui lòng nhập giá bán hợp lệ (không được âm).");
        setLoading(false);
        return;
      }
      payload.price = numPrice;
    } else {
      const numRental = Number(rentalPricePerDay);
      const numDeposit = Number(depositAmount);

      if (isNaN(numRental) || numRental < 0 || rentalPricePerDay === "") {
        setErrorMessage("Vui lòng nhập giá thuê theo ngày hợp lệ.");
        setLoading(false);
        return;
      }
      if (isNaN(numDeposit) || numDeposit < 0 || depositAmount === "") {
        setErrorMessage("Vui lòng nhập tiền cọc hợp lệ.");
        setLoading(false);
        return;
      }

      payload.rentalPricePerDay = numRental;
      payload.depositAmount = numDeposit;
    }

    try {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        setErrorMessage(`Máy chủ gặp lỗi (${res.status}). Vui lòng thử lại.`);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Không thể đăng sản phẩm.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Đã niêm yết sản phẩm thành công! Đang chuyển hướng về kho hàng...");
      setTimeout(() => {
        router.push("/dashboard/inventory");
      }, 1500);
    } catch (err) {
      console.error("Create product client error:", err);
      setErrorMessage("Không thể kết nối đến máy chủ.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/inventory">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Quản lý Kho
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span>Thêm sản phẩm</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thêm Sản Phẩm Mới</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Đăng sản phẩm của bạn lên Chợ Vật Tư & Thiết Bị Sự Kiện Xanh (Eco-Gear Marketplace).
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm font-medium">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          
          {/* Section 1: Listing Type Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              1. Hình Thức Niêm Yết <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setListingType("RENT")}
                className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                  listingType === "RENT"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Vật phẩm THUÊ (Rent)
                  </span>
                  <div className={`w-4 h-4 rounded-full border ${listingType === "RENT" ? "bg-emerald-600 border-emerald-600" : "border-slate-300"}`} />
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Dành cho thiết bị, bàn ghế, sân khấu cho thuê tính phí theo ngày + tiền cọc.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setListingType("SALE")}
                className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                  listingType === "SALE"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base flex items-center gap-2">
                    <Tag className="h-5 w-5 text-emerald-600" />
                    Vật phẩm BÁN (Sale)
                  </span>
                  <div className={`w-4 h-4 rounded-full border ${listingType === "SALE" ? "bg-emerald-600 border-emerald-600" : "border-slate-300"}`} />
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Dành cho đồ thu gom, vật liệu trang trí tái chế, sản phẩm bán cố định.
                </p>
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Thông Tin Cơ Bản</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tên Sản Phẩm / Thiết Bị <span className="text-red-500">*</span></label>
                <Input
                  placeholder="Ví dụ: Bộ Loa Pin Năng Lượng Mặt Trời 500W"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-50/50 border-slate-200 text-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Mã SKU <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={generateAutoSKU}
                    className="text-[11px] font-semibold text-emerald-600 hover:underline"
                  >
                    Tạo mã tự động
                  </button>
                </div>
                <div className="relative">
                  <Barcode className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="ECO-RENT-101"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    className="pl-9 bg-slate-50/50 border-slate-200 text-slate-900 rounded-xl font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Danh Mục Sản Phẩm <span className="text-red-500">*</span></label>
                <Select value={category} onValueChange={(val) => val && setCategory(val)}>
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-slate-900 rounded-xl">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Số Lượng Tồn Kho <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min={1}
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || 1)}
                  required
                  className="bg-slate-50/50 border-slate-200 text-slate-900 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mô Tả Chi Tiết</label>
              <textarea
                rows={3}
                placeholder="Mô tả công dụng, kích thước, tình trạng sản phẩm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Conditional Pricing Mechanism */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              3. Thiết Lập Giá ({listingType === "SALE" ? "BÁN THẲNG" : "CHO THƯÊ & CỌC"})
            </h3>

            {listingType === "SALE" ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-slate-700">Giá Bán Niêm Yết (VNĐ) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Nhập giá bán (VD: 150000)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="pl-10 bg-white border-slate-200 text-slate-900 rounded-xl font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Khách hàng sẽ thanh toán 100% số tiền này khi đặt mua sản phẩm.</p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Giá Thuê / 1 Ngày (VNĐ) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
                    <Input
                      type="number"
                      min={0}
                      placeholder="VD: 50000"
                      value={rentalPricePerDay}
                      onChange={(e) => setRentalPricePerDay(e.target.value)}
                      required
                      className="pl-10 bg-white border-slate-200 text-slate-900 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tiền Tiền Cọc Yêu Cầu (VNĐ) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
                    <Input
                      type="number"
                      min={0}
                      placeholder="VD: 200000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      required
                      className="pl-10 bg-white border-slate-200 text-slate-900 rounded-xl font-medium"
                    />
                  </div>
                </div>
                <p className="md:col-span-2 text-[11px] text-slate-600">
                  * Tiền cọc sẽ được hoàn trả cho người thuê sau khi trả lại sản phẩm đúng hạn và còn nguyên vẹn.
                </p>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Image & Eco Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">4. Hình Ảnh & Đặc Tính Sinh Thái</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tải Lên Hình Ảnh <span className="text-red-500">*</span></label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className="pl-10 bg-slate-50/50 border-slate-200 text-slate-900 rounded-xl text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {imageUploading ? "Đang tải ảnh lên..." : "Hỗ trợ định dạng JPG, PNG, WEBP."}
              </p>
            </div>

            {imageUrl && (
              <div className="mt-2 w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Đặc Tính Bền Vững / Eco Features</label>
              <Input
                placeholder="VD: Nhựa tái chế 100%, Tiết kiệm điện năng 40%"
                value={ecoFeatures}
                onChange={(e) => setEcoFeatures(e.target.value)}
                className="bg-slate-50/50 border-slate-200 text-slate-900 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px] shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Thêm sản phẩm"}
          </Button>

        </form>
      </main>
    </div>
  );
}
