"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateEventPlan } from "@/app/actions/planner";
import { SlideUp, staggerContainerVariants, staggerItemVariants } from "@/components/ui/animations";

export default function AIPlannerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Form State
  const [eventType, setEventType] = useState("Đám cưới");
  const [customEventType, setCustomEventType] = useState("");
  const [guestCount, setGuestCount] = useState(100);
  const [budget, setBudget] = useState(15000000);
  const [ecoLevel, setEcoLevel] = useState("Nghiêm ngặt Không rác thải");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const plan = await generateEventPlan({
        eventType: eventType === "Khác" ? customEventType : eventType,
        guestCount,
        budget,
        ecoLevel
      });
      setResult(plan);
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Failed to connect to AI Planner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <SlideUp>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-green-900 dark:text-green-400 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            AI Lập Kế Hoạch Sự Kiện Xanh
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hãy cho chúng tôi biết về sự kiện sắp tới của bạn, và Gemini AI sẽ tạo ra một kế hoạch sự kiện bền vững, được cá nhân hóa và so sánh chi phí cho bạn.
          </p>
        </div>
      </SlideUp>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SlideUp delay={0.1}>
          <Card className="border-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Chi tiết Sự kiện</CardTitle>
              <CardDescription>Điền các thông số để AI tạo kế hoạch.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại sự kiện</label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại sự kiện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Đám cưới">Đám cưới</SelectItem>
                      <SelectItem value="Tiệc sinh nhật">Tiệc sinh nhật</SelectItem>
                      <SelectItem value="Hội nghị Công nghệ">Hội nghị Công nghệ</SelectItem>
                      <SelectItem value="Sự kiện Trường học">Sự kiện Trường học</SelectItem>
                      <SelectItem value="Khác">Khác...</SelectItem>
                    </SelectContent>
                  </Select>
                  <AnimatePresence>
                    {eventType === "Khác" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input 
                          placeholder="Nhập loại sự kiện của bạn (vd: Lễ kỷ niệm công ty)" 
                          value={customEventType}
                          onChange={(e) => setCustomEventType(e.target.value)}
                          className="mt-2"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số lượng khách</label>
                  <Input 
                    type="number" 
                    value={guestCount} 
                    onChange={(e) => setGuestCount(Number(e.target.value))} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mục tiêu Ngân sách (VND)</label>
                  <Input 
                    type="number" 
                    value={budget} 
                    onChange={(e) => setBudget(Number(e.target.value))} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mức độ thân thiện môi trường</label>
                  <Select value={ecoLevel} onValueChange={setEcoLevel}>
                    <SelectTrigger className="w-[300px] max-w-full">
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nhẹ (Tái chế cơ bản)">Nhẹ (Tái chế cơ bản)</SelectItem>
                      <SelectItem value="Vừa (Tập trung phân hủy sinh học)">Vừa (Tập trung phân hủy sinh học)</SelectItem>
                      <SelectItem value="Nghiêm ngặt Không rác thải">Nghiêm ngặt Không rác thải</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 mt-4 shadow-md hover:shadow-lg transition-all duration-300" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo Kế hoạch...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Tạo Đề xuất AI</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </SlideUp>

        <div>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-full min-h-[350px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8 bg-muted/20"
              >
                <Sparkles className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p>Kế hoạch do AI tạo sẽ xuất hiện ở đây.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-full min-h-[350px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8 bg-muted/20"
              >
                <Loader2 className="h-12 w-12 mb-4 animate-spin text-green-600" />
                <p className="font-medium text-green-800 dark:text-green-300">Gemini đang tính toán các con số...</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="space-y-6"
              >
                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">So sánh Chi phí</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                        <span>Sự kiện Truyền thống</span>
                        <span className="font-bold">{result.costComparison?.traditional?.toLocaleString() || 0} ₫</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                        <span>Phương pháp Thân thiện môi trường</span>
                        <span className="font-bold">{result.costComparison?.ecoFriendly?.toLocaleString() || 0} ₫</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-bold text-lg text-green-600">
                        <span>Tiết kiệm Ước tính</span>
                        <span>{result.costComparison?.savings?.toLocaleString() || 0} ₫</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Dòng thời gian Sự kiện</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      variants={staggerContainerVariants}
                      initial="hidden"
                      animate="show"
                      className="relative border-l-2 border-green-200 ml-3 space-y-6"
                    >
                      {result.timeline?.map((item: any, i: number) => (
                        <motion.div key={i} variants={staggerItemVariants} className="pl-6 relative">
                          <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1.5 ring-4 ring-background" />
                          <h4 className="font-bold text-sm text-green-600 mb-1">{item.time}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.task}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
