import React, { useEffect, useState } from "react";
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
  ArrowLeft,
  ArrowRight,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Info,
  Clock,
} from "lucide-react";
import orderService from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const { order, tracking, loading, error, refetch } =
    useOrderTracking(orderId);
  const { toast } = useToast();
  const [processingStatus, setProcessingStatus] = useState(false);

  // Auto-assign courier when status changes to IN_PROGRESS
  const statusStr = (s) => (s ? String(s).toLowerCase() : "");

  const isInProgress = (s) => {
    const st = statusStr(s || order?.order_status || order?.status);
    return (
      st === "in_progress" ||
      st === "in progress" ||
      st === "confirmed" ||
      st === "inprogress"
    );
  };

  const isCourierAssigned = (s) => {
    const st = statusStr(s || order?.order_status || order?.status);
    return (
      st === "courier_assigned" ||
      st === "courier-assigned" ||
      st === "assigned" ||
      st.includes("assign")
    );
  };

  const isOnTheWay = (s) => {
    const st = statusStr(s || order?.order_status || order?.status);
    return (
      st === "on_the_way" ||
      st === "on the way" ||
      st === "on-the-way" ||
      st === "in_way" ||
      st === "in-way" ||
      st.includes("way")
    );
  };

  useEffect(() => {
    if (isInProgress(order?.status) && !order?.courier_assignment) {
      assignCourierAutomatically();
    }
  }, [order?.status]);

  // Auto-start delivery after 30 seconds of courier-assigned state
  useEffect(() => {
    if (isCourierAssigned(order?.status)) {
      const timer = setTimeout(() => {
        startDeliveryAutomatically();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  const assignCourierAutomatically = async () => {
    if (processingStatus) return;
    setProcessingStatus(true);
    try {
      await orderService.assignCourier(orderId);
      toast({
        title: isArabic ? "تم تعيين السائق" : "Courier Assigned",
        description: isArabic
          ? "تم تعيين سائق لطلبك"
          : "A courier has been assigned to your order",
      });
      refetch();
    } catch (err) {
      console.error("Failed to assign courier:", err);
    } finally {
      setProcessingStatus(false);
    }
  };

  const startDeliveryAutomatically = async () => {
    if (processingStatus) return;
    setProcessingStatus(true);
    try {
      const assignmentId = order?.courier_assignment?.id;
      if (assignmentId) {
        await orderService.startDelivery(assignmentId);
        toast({
          title: isArabic ? "بدأ التوصيل" : "Delivery Started",
          description: isArabic
            ? "السائق في الطريق إليك"
            : "Courier is on the way",
        });
        refetch();
      }
    } catch (err) {
      console.error("Failed to start delivery:", err);
    } finally {
      setProcessingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#708A58] animate-spin" />
          <p className="text-gray-600 font-medium">
            {isArabic
              ? "جاري تحميل معلومات الطلب..."
              : "Loading order information..."}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
            <Info className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {isArabic ? "خطأ في التحميل" : "Loading Error"}
            </h2>
            <p className="text-gray-500 mb-6">
              {error || (isArabic ? "الطلب غير موجود" : "Order not found")}
            </p>
            <Button
              onClick={() => navigate("/orders")}
              className="w-full bg-[#708A58]"
            >
              {isArabic ? "العودة إلى الطلبات" : "Back to Orders"}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const customerLat = order?.latitude || order?.customer_lat;
  const customerLng = order?.longitude || order?.customer_lng;
  const showMap = isOnTheWay(order?.status) && tracking?.latest_location;

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {isArabic ? "تتبع طلبك" : "Track Your Order"}
            </h1>
            <p className="text-gray-500 text-sm">#{orderId.slice(0, 12)}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="flex gap-2"
          >
            {isArabic ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            {isArabic ? "العودة للطلبات" : "Back to Orders"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Status Cards & Timeline */}
          <div className="lg:col-span-4 space-y-6">
            <OrderStatusCard order={order} isArabic={isArabic} />
            <OrderTimeline order={order} isArabic={isArabic} />
          </div>

          {/* Right Column: Dynamic Map or Info Card */}
          <div className="lg:col-span-8">
            {showMap ? (
              <CourierMap
                tracking={tracking}
                customerLat={customerLat}
                customerLng={customerLng}
                isArabic={isArabic}
              />
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center text-center border-0 shadow-sm">
                <CardContent className="p-12">
                  {order?.status === "PENDING" && (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-10 h-10 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {isArabic
                          ? "في انتظار تأكيد البائع"
                          : "Waiting for Seller Confirmation"}
                      </h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                        {isArabic
                          ? "سيتم إخطارك عند تأكيد البائع لطلبك"
                          : "You will be notified once the seller confirms your order"}
                      </p>
                    </div>
                  )}

                  {order?.status === "CONFIRMED" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {isArabic ? "تم تأكيد الطلب" : "Order Confirmed"}
                      </h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                        {isArabic
                          ? "البائع يقوم بتجهيز طلبك الآن"
                          : "The seller is preparing your order"}
                      </p>
                    </div>
                  )}

                  {order?.status === "IN_PROGRESS" && (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 text-[#708A58] animate-spin mx-auto" />
                      <h3 className="text-xl font-bold">
                        {isArabic ? "جاري التجهيز" : "Being Prepared"}
                      </h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                        {isArabic
                          ? "جاري تعيين سائق لتوصيل طلبك"
                          : "Assigning a courier for your delivery"}
                      </p>
                    </div>
                  )}

                  {order?.status === "COURIER_ASSIGNED" && (
                    <div className="space-y-4">
                      <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Truck className="w-10 h-10 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {isArabic ? "تم تعيين السائق" : "Courier Assigned"}
                      </h3>
                      <p className="text-gray-500 max-w-xs mx-auto mb-4">
                        {isArabic
                          ? "السائق في طريقه لاستلام طلبك"
                          : "The courier is on the way to pick up your order"}
                      </p>
                      <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-xs font-bold text-gray-600 animate-pulse">
                        {isArabic
                          ? "سيبدأ التتبع المباشر قريباً..."
                          : "Live tracking will start soon..."}
                      </div>
                    </div>
                  )}

                  {(order?.status === "DELIVERED" ||
                    order?.status === "COMPLETED") && (
                    <div className="space-y-4">
                      <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {isArabic
                          ? "تم التوصيل بنجاح"
                          : "Successfully Delivered"}
                      </h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                        {isArabic
                          ? "شكراً لاستخدامك منصة جديد"
                          : "Thank you for using Jaddid platform"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
