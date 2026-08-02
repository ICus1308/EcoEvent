"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Leaf, ShoppingCart, PackageOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  status: string;
  listingType: "SALE" | "RENT";
  price?: number | null;
  rentalPricePerDay?: number | null;
  depositAmount?: number | null;
  stock: number;
  imageUrl: string;
  ecoFeatures: string;
  owner?: {
    id: string;
    fullname?: string;
    username: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  "ALL": "Tất cả danh mục",
  "DECORATION": "Trang trí",
  "EQUIPMENT": "Thiết bị",
  "TABLEWARE": "Đồ dùng ăn uống",
  "ATTIRE": "Lễ phục",
  "PROJECT_TOOLS": "Dụng cụ"
};

const LISTING_TYPE_LABELS: Record<string, string> = {
  "ALL_TYPES": "Tất cả loại hình",
  "RENT": "Chỉ Thuê",
  "SALE": "Chỉ Bán"
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [listingType, setListingType] = useState("ALL_TYPES");

  // Fetch real items from REST API (Pure Database Single Source of Truth)
  useEffect(() => {
    async function fetchDbProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch shop products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDbProducts();
  }, []);

  // Dynamic Filter Logic over Database Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.ecoFeatures && product.ecoFeatures.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category Filter
      const matchesCategory = category === "ALL" || product.category === category;

      // 3. Listing Type Filter
      const matchesListingType = listingType === "ALL_TYPES" || product.listingType === listingType;

      return matchesSearch && matchesCategory && matchesListingType;
    });
  }, [products, searchQuery, category, listingType]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-900 dark:text-green-400">Chợ Sinh Thái Eco-Gear</h1>
          <p className="text-muted-foreground mt-1">Thuê, mua hoặc mượn thiết bị bền vững cho sự kiện tiếp theo của bạn.</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thiết bị, đồ trang trí..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={category} onValueChange={(val) => val && setCategory(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Danh mục">{CATEGORY_LABELS[category]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={listingType} onValueChange={(val) => val && setListingType(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Loại hình">{LISTING_TYPE_LABELS[listingType]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LISTING_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count Header */}
      {!loading && (
        <div className="mb-4 text-sm text-muted-foreground">
          Đang hiển thị {filteredProducts.length} kết quả từ cơ sở dữ liệu
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Đang tải sản phẩm từ hệ thống...</p>
        </div>
      ) : (
        /* Product Grid */
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                whileHover={{ y: -4 }}
              >
                <Link href={`/shop/${product.id}`} className="group block h-full">
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-green-100 dark:border-green-900">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600"}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          product.listingType === 'SALE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                      >
                        {product.listingType === 'SALE' ? 'BÁN' : 'THUÊ'}
                      </Badge>
                      {product.stock <= 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-slate-900/80 text-white">HẾT HÀNG</Badge>
                      )}
                    </div>

                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-xs mb-2">
                          {CATEGORY_LABELS[product.category] || product.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 pt-0">
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="flex items-center text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-950 dark:text-green-400">
                            <Leaf className="h-3 w-3 mr-1" /> {product.ecoFeatures || "🌱 100% Phân hủy"}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-2 border-t flex justify-between items-center bg-muted/20">
                      <div className="font-semibold text-lg flex flex-col">
                        {product.listingType === 'SALE' && (
                          <span>{product.price?.toLocaleString("vi-VN")} ₫</span>
                        )}
                        {product.listingType === 'RENT' && (
                          <span>
                            {product.rentalPricePerDay?.toLocaleString("vi-VN")} ₫{" "}
                            <span className="text-xs text-muted-foreground font-normal">/ ngày</span>
                          </span>
                        )}
                      </div>
                      {product.listingType === 'SALE' && (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Zero Products Empty State Architecture */}
      {!loading && products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 my-8 flex flex-col items-center justify-center p-8"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mb-4">
            <PackageOpen className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">Chưa có sản phẩm nào trên cửa hàng</h3>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            Cửa hàng hiện đang trống vì tất cả dữ liệu giả đã được dọn dẹp hoàn toàn. Hãy là người đầu tiên đăng niêm yết vật phẩm sinh thái!
          </p>
        </motion.div>
      )}

      {/* Filter No Match Empty State */}
      {!loading && products.length > 0 && filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-muted/30 rounded-xl border border-dashed"
        >
          <p className="text-muted-foreground text-lg mb-4">Không tìm thấy vật phẩm nào khớp với bộ lọc của bạn.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setCategory("ALL");
              setListingType("ALL_TYPES");
            }}
          >
            Xóa bộ lọc tìm kiếm
          </Button>
        </motion.div>
      )}
    </div>
  );
}
