import React, { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import OrderStatusCard from "@/components/order/OrderStatusCard";
import CourierMap from "@/components/order/CourierMap";
import OrderTimeline from "@/components/order/OrderTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Package,
  Truck,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // order contains courier_details from your Serializer
  const { order, tracking, loading, error, refetch } =
    useOrderTracking(orderId);

  const statusStr = (s) => (s ? String(s).toLowerCase() : "");

  // --- 1. Polling Logic (Live Updates) ---
  useEffect(() => {
    if (!orderId) return;

    // Refresh every 5 seconds to track the courier's movement/status
    const interval = setInterval(() => {
      const st = statusStr(order?.order_status);
      if (st === "delivered" || st === "completed") {
        clearInterval(interval);
      } else {
        refetch();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, order?.order_status, refetch]);

  // --- 2. Progress Calculation ---
  const getProgressPercentage = () => {
    const s = statusStr(order?.order_status);
    if (s === "delivered" || s === "completed") return 100;
    // If status contains shipping/way, the truck is moving
    if (s.includes("way") || s.includes("shipping") || s === "shipped")
      return 85;
    // Since you said it's assigned immediately, we are at 65% minimum if not delivered
    if (order?.courier_details || s.includes("assign")) return 65;
    return 25;
  };

  const progressWidth = getProgressPercentage();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#708A58]" />
      </div>
    );
  if (error || !order)
    return <div className="p-20 text-center">Order Not Found</div>;

  return (
    <div
      className="min-h-screen bg-[#F9FAFB] flex flex-col"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black">
            {isArabic ? "تتبع مباشر" : "Live Tracking"}
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="rounded-xl bg-white"
          >
            {isArabic ? (
              <ArrowRight className="ml-2 w-4" />
            ) : (
              <ArrowLeft className="mr-2 w-4" />
            )}
            {isArabic ? "العودة" : "Back"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Status Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <OrderStatusCard order={order} isArabic={isArabic} />
            <OrderTimeline
              order={order}
              isArabic={isArabic}
              progress={progressWidth}
            />
          </div>

          {/* Main Tracking View */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-0">
                {/* 3. Live Map Component */}
                <div className="h-[400px] bg-gray-100 relative">
                  {order?.courier_details ? (
                    <CourierMap
                      order={order}
                      trackingData={tracking}
                      isArabic={isArabic}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 italic text-gray-400">
                      {isArabic
                        ? "جاري تحميل الخريطة..."
                        : "Loading Live Map..."}
                    </div>
                  )}
                </div>

                {/* Progress Bar & Courier Info */}
                <div className="p-8">
                  <div className="relative mb-12 px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-[#708A58] -translate-y-1/2 transition-all duration-1000 rounded-full"
                      style={{ width: `${progressWidth}%` }}
                    />
                    <div className="relative z-10 flex justify-between">
                      <Package
                        className={
                          progressWidth >= 25
                            ? "text-[#708A58]"
                            : "text-gray-300"
                        }
                      />
                      <Truck
                        className={
                          progressWidth >= 65
                            ? "text-[#708A58]"
                            : "text-gray-300"
                        }
                      />
                      <CheckCircle
                        className={
                          progressWidth >= 100
                            ? "text-[#708A58]"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>

                  {/* Driver Card */}
                  <div className="bg-gray-50 rounded-2xl p-6 flex items-center gap-6 border border-gray-100">
                    <div className="w-16 h-16 bg-[#708A58] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {order.courier_details?.name?.[0] || "C"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {order.courier_details?.name || "Courier"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {statusStr(order.order_status) === "preparing"
                          ? isArabic
                            ? "يتم تجهيز الطلب"
                            : "Preparing your order"
                          : isArabic
                          ? "في الطريق إليك"
                          : "On the way"}
                      </p>
                    </div>
                    <Button className="rounded-full px-8 bg-[#708A58] hover:bg-[#5f754a]">
                      {isArabic ? "اتصال" : "Call"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
