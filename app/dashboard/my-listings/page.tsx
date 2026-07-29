"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Trash2, Tag, CalendarClock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SlideUp, staggerContainerVariants, staggerItemVariants } from "@/components/ui/animations";

const MY_LISTINGS = [
  {
    id: "l1",
    name: "Bộ đồ ăn bằng tre (100 người)",
    status: "ĐANG CHO THUÊ",
    listingType: "THUÊ",
    price: 450000,
    activeRentals: 1,
    totalEarned: 1350000,
    image: "https://images.unsplash.com/photo-1584984277717-d2ce0c598007?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "l2",
    name: "Bộ 6 bộ đàm sự kiện",
    status: "CÓ SẴN",
    listingType: "MƯỢN",
    price: 0,
    activeRentals: 0,
    totalEarned: 0,
    image: "https://images.unsplash.com/photo-1563214532-628d011116c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "l3",
    name: "Cổng cưới Vintage",
    status: "BẢN NHÁP",
    listingType: "BÁN",
    price: 1200000,
    activeRentals: 0,
    totalEarned: 0,
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  }
];

export default function MyListingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <SlideUp>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Kho hàng của tôi</h1>
            <p className="text-muted-foreground">Quản lý các mặt hàng đã đăng và theo dõi thu nhập.</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300">
            <Package className="mr-2 h-4 w-4" /> Thêm Sản phẩm Mới
          </Button>
        </div>
      </SlideUp>

      <SlideUp delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Tổng Doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">1,350,000 ₫</div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tin đang hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sản phẩm đang cho thuê</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">1</div>
            </CardContent>
          </Card>
        </div>
      </SlideUp>

      <SlideUp delay={0.2}>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Quản lý Tin đăng</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div 
              variants={staggerContainerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {MY_LISTINGS.map(item => (
                <motion.div 
                  key={item.id} 
                  variants={staggerItemVariants}
                  whileHover={{ scale: 1.005, backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                  className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl items-start sm:items-center transition-all duration-200"
                >
                  <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant="outline" className={
                        item.status === 'ĐANG CHO THUÊ' ? 'border-orange-500 text-orange-600' :
                        item.status === 'CÓ SẴN' ? 'border-green-500 text-green-600' : ''
                      }>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center"><Tag className="mr-1 h-3 w-3" /> {item.listingType}</span>
                      <span className="flex items-center"><CalendarClock className="mr-1 h-3 w-3" /> 
                        {item.price > 0 ? `${item.price.toLocaleString()} ₫` : 'Miễn phí'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Link href={`/shop/${item.id}`}>
                      <Button variant="outline" size="sm" className="hover:bg-green-50 dark:hover:bg-green-950/40">Xem</Button>
                    </Link>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </SlideUp>
    </div>
  );
}
