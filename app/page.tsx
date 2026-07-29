"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, Calendar, ArrowRight, ShieldCheck, Recycle } from "lucide-react";
import { motion } from "framer-motion";
import { SlideUp, ScrollReveal, staggerContainerVariants, staggerItemVariants } from "@/components/ui/animations";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-green-50 dark:bg-green-950/20">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <SlideUp delay={0.1}>
              <div className="inline-flex items-center rounded-full border border-green-200 bg-green-100 dark:bg-green-900/40 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-300">
                <Leaf className="mr-2 h-4 w-4" />
                Nền tảng sự kiện bền vững đầu tiên tại Việt Nam
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Lên kế hoạch sự kiện <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Xanh hơn</span>.<br />
                Chia sẻ tài nguyên.
              </h1>
            </SlideUp>

            <SlideUp delay={0.3}>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
                Từ các sự kiện câu lạc bộ đại học đến các đám cưới hoành tráng. Sử dụng AI của chúng tôi để lên kế hoạch thân thiện với môi trường và thuê thiết bị bền vững từ cộng đồng.
              </p>
            </SlideUp>

            <SlideUp delay={0.4}>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 w-full">
                <Link href="/shop">
                  <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-full px-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                    Khám phá Thiết bị Eco <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/ai-planner">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300">
                    Dùng thử AI Lập Kế Hoạch
                  </Button>
                </Link>
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Background decorative elements */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-0 right-0 translate-x-1/3 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" 
        />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Cách EcoEvent Hub hoạt động</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Chúng tôi cung cấp một hệ sinh thái toàn diện để giảm thiểu rác thải và tiết kiệm chi phí cho sự kiện tiếp theo của bạn.
              </p>
            </div>
          </ScrollReveal>
          
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={staggerItemVariants} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 group">
              <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Lập Kế Hoạch Sự Kiện</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nhập ngân sách và số lượng khách của bạn. Gemini AI của chúng tôi sẽ tạo ra một dòng thời gian hoàn chỉnh, danh sách kiểm tra không rác thải và phân tích chi phí.
              </p>
            </motion.div>
            
            <motion.div variants={staggerItemVariants} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 group">
              <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Recycle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chia Sẻ Ngang Hàng (P2P)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Đừng mua mới. Hãy thuê hoặc mượn thiết bị sự kiện (máy ảnh, đồ trang trí, đồ dùng ăn uống) trực tiếp từ các câu lạc bộ hoặc nhà cung cấp địa phương.
              </p>
            </motion.div>
            
            <motion.div variants={staggerItemVariants} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 group">
              <div className="h-16 w-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hệ Thống Xác Thực Đáng Tin Cậy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Thanh toán VietQR an toàn, đặt cọc ký quỹ kỹ thuật số và yêu cầu xác minh sinh viên/nhà cung cấp giúp cộng đồng luôn an toàn.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-900 text-white text-center relative overflow-hidden">
        <ScrollReveal>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Sẵn sàng tham gia nền kinh tế chia sẻ?</h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto text-lg">
              Đăng các thiết bị nhàn rỗi của bạn ngay hôm nay để kiếm thu nhập thụ động, hoặc bắt đầu lên kế hoạch cho một sự kiện không rác thải giúp tiết kiệm tiền.
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-white text-green-900 hover:bg-green-50 rounded-full px-8 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Khám phá Chợ Sinh Thái
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
