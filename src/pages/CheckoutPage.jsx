// src/pages/CheckoutPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import userService from "@/services/userService";
import ordersService from "../services/ordersService"; // Add this import at the top
import marketplaceService from "@/services/marketplaceService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapEffect = () => {
  const map = useMap();

  useEffect(() => {
    // We wait 300ms to ensure the modal's "opening" animation is 100% finished
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    // Small timeout to ensure the modal animation is finished
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
};

const LocationMarker = ({ position, setPosition, setAddress, isArabic }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      reverseGeocode(lat, lng);
    },
  });

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${
          isArabic ? "ar" : "en"
        }`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };
  return position === null ? null : <Marker position={position} />;
};

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === "ar";
  const [position, setPosition] = useState([30.0444, 31.2357]); // Default to Cairo
  const [showMap, setShowMap] = useState(false);
  const handleAddressSelect = (newAddress) => {
    setCustomerInfo((prev) => ({ ...prev, address: newAddress }));
  };
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    address: "",
    phone: "",
    lat: null, // New field
    lng: null, // New field
  });

  const [tempLocation, setTempLocation] = useState({
    lat: 30.0444,
    lng: 31.2357,
    address: "",
  });

  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleConfirmLocation = () => {
    setCustomerInfo((prev) => ({
      ...prev,
      address: tempLocation.address || prev.address,
      lat: tempLocation.lat,
      lng: tempLocation.lng,
    }));
    setIsMapOpen(false);
    toast({
      title: isArabic ? "تم تحديد الموقع" : "Location Set",
      description: isArabic
        ? "تم حفظ موقعك بنجاح"
        : "Your location has been saved.",
    });
  };

  const handleCancelLocation = () => {
    setIsMapOpen(false);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      return imagePath;
    if (imagePath.startsWith("/media"))
      return `http://127.0.0.1:8000${imagePath}`;
    return `http://127.0.0.1:8000/media/${imagePath}`;
  };

  useEffect(() => {
    fetchCart();
    if (user) {
      setCustomerInfo({
        fullName: `${user.first_name} ${user.last_name}`,
        address: user.address || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.cart.get();
      setCart(response.data);
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل تحميل السلة" : "Failed to load cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    // Ensure quantity is a whole number before updating
    const qtyNum = Math.max(1, Math.round(parseFloat(newQuantity) || 0));

    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.id === itemId ? { ...item, quantity: qtyNum } : item
      ),
      total_price: prevCart.items.reduce((sum, item) => {
        const quantity =
          item.id === itemId
            ? qtyNum
            : Math.round(parseFloat(item.quantity) || 0);
        const price =
          parseFloat(
            item.product?.price || item.material_listing?.price_per_unit || 0
          ) || 0;
        return sum + price * quantity;
      }, 0),
    }));

    try {
      await marketplaceService.cart.updateItem({
        item_id: itemId,
        quantity: qtyNum,
      });
      const response = await marketplaceService.cart.get();
      setCart(response.data);
    } catch (error) {
      fetchCart();
      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.error ||
          (isArabic ? "فشل تحديث الكمية" : "Failed to update quantity"),
        variant: "destructive",
      });
    }
  };

  const handleConfirmOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "سلتك فارغة" : "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    // VALIDATION: Ensure location is set
    if (!customerInfo.address || !customerInfo.lat || !customerInfo.lng) {
      toast({
        title: isArabic ? "بيانات ناقصة" : "Missing Info",
        description: isArabic
          ? "يرجى تحديد موقعك على الخريطة أولاً"
          : "Please select your location on the map first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemsBySeller = {};

      // 1. Group items by Seller
      cart.items.forEach((item) => {
        // Check both product and material listing for the seller ID
        const rawSellerId =
          item.product?.seller?.id ||
          item.product?.seller ||
          item.material_listing?.seller?.id ||
          item.material_listing?.seller;

        if (!rawSellerId) {
          console.error("Item missing seller identifier:", item);
          return;
        }

        const sellerKey = String(rawSellerId);
        if (!itemsBySeller[sellerKey]) itemsBySeller[sellerKey] = [];
        itemsBySeller[sellerKey].push(item);
      });

      let firstOrderId = null;

      // 2. Create one order per seller
      for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
        const orderPayload = {
          seller_id: sellerId,
          delivery_address: customerInfo.address,
          customer_lat: customerInfo.lat,
          customer_lng: customerInfo.lng,
          order_type: sellerItems[0].product ? "product" : "material",
          items: sellerItems.map((item) => ({
            product_id: item.product?.id,
            material_listing_id: item.material_listing?.id,
            quantity: Math.round(parseFloat(item.quantity) || 1),
            unit_price: parseFloat(
              item.product?.price || item.material_listing?.price_per_unit || 0
            ),
            unit: item.product ? "piece" : item.material_listing?.unit || "kg",
          })),
        };

        console.log("Sending order payload:", orderPayload);
        const orderResponse = await ordersService.create(orderPayload);

        if (!firstOrderId && orderResponse.data?.id) {
          firstOrderId = orderResponse.data.id;
        }
      }

      // 3. Cleanup
      await marketplaceService.cart.clear();
      toast({
        title: isArabic ? "تم" : "Success",
        description: isArabic
          ? "تم إنشاء الطلبات بنجاح"
          : "Orders created successfully",
      });

      if (firstOrderId) {
        navigate(`/order-tracking/${firstOrderId}`);
      } else {
        navigate("/orders");
      }
    } catch (error) {
      console.error("Order creation failed:", error.response?.data || error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.detail ||
          (isArabic ? "فشل تأكيد الطلب" : "Failed to confirm order"),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 animate-pulse text-green-500" />
          <p className="text-gray-600">
            {isArabic ? "جاري تحميل السلة..." : "Loading cart..."}
          </p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isArabic ? "متابعة التسوق" : "Continue Shopping"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span
                    className={`text-lg sm:text-xl ${
                      isArabic ? "font-arabic" : ""
                    }`}
                  >
                    {isArabic ? "مراجعة السلة" : "Review Cart"} (
                    {cart?.total_items || 0} {isArabic ? "عنصر" : "items"})
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                {isEmpty ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p
                      className={`text-xl font-semibold mb-2 ${
                        isArabic ? "font-arabic" : ""
                      }`}
                    >
                      {isArabic ? "سلتك فارغة" : "Your cart is empty"}
                    </p>
                    <p
                      className={`text-gray-500 mb-6 ${
                        isArabic ? "font-arabic" : ""
                      }`}
                    >
                      {isArabic
                        ? "أضف عناصر للبدء"
                        : "Add items to get started"}
                    </p>
                    <Button asChild>
                      <Link to="/marketplace">
                        {isArabic ? "تصفح السوق" : "Browse Marketplace"}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => {
                      const itemData = item.product || item.material_listing;
                      const itemType = item.product ? "product" : "material";
                      const imagePath =
                        itemData?.images?.[0]?.image || itemData?.primary_image;
                      const imageUrl = getImageUrl(imagePath);

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
                        >
                          {/* Image */}
                          <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={itemData.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/marketplace/${itemType}/${itemData.id}`}
                              className="font-semibold hover:text-green-600 transition-colors block truncate"
                            >
                              {itemData.title}
                            </Link>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {itemData.description}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              $
                              {item.quantity *
                                (item.product?.price ||
                                  item.material_listing?.price_per_unit ||
                                  0)}
                            </p>
                          </div>

                          {/* Quantity */}
                          <div className="flex flex-col items-stretch sm:items-end gap-3 sm:gap-2 w-full sm:w-auto">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.floor(parseFloat(item.quantity)) - 1
                                  )
                                }
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                value={Math.floor(parseFloat(item.quantity))}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val > 0)
                                    updateQuantity(item.id, val);
                                }}
                                className="w-20 text-center"
                                min="1"
                                step="1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.floor(parseFloat(item.quantity)) + 1
                                  )
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customer Info + Order Summary */}
          {!isEmpty && (
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className={isArabic ? "font-arabic" : ""}>
                    {isArabic ? "معلومات العميل" : "Customer Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Address Section with Map Toggle */}
                  <div className="space-y-2">
                    {/* Inside the Customer Information CardContent */}
                    <div className="space-y-4">
                      <Input
                        value={customerInfo.fullName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            fullName: e.target.value,
                          })
                        }
                        placeholder={isArabic ? "الاسم الكامل" : "Full Name"}
                      />

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">
                            {isArabic ? "العنوان" : "Address"}
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex gap-2 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => setIsMapOpen(true)}
                          >
                            <MapPin className="w-4 h-4" />
                            {isArabic
                              ? "تحديد الموقع من الخريطة"
                              : "Select Location on Map"}
                          </Button>
                        </div>

                        <textarea
                          value={customerInfo.address}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              address: e.target.value,
                            })
                          }
                          placeholder={
                            isArabic ? "العنوان بالتفصيل" : "Detailed Address"
                          }
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />

                        {customerInfo.lat && (
                          <p className="text-[10px] text-gray-400">
                            GPS: {customerInfo.lat.toFixed(4)},{" "}
                            {customerInfo.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                      {/* ... Phone input */}
                    </div>

                    {/* FULL SCREEN MAP OVERLAY */}
                    {isMapOpen && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                          <CardHeader className="border-b bg-white">
                            <CardTitle className="flex justify-between items-center text-lg">
                              {isArabic ? "اختر موقعك" : "Select Your Location"}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancelLocation}
                              >
                                ×
                              </Button>
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="p-0 relative h-[400px] w-full">
                            <MapContainer
                              center={[tempLocation.lat, tempLocation.lng]}
                              zoom={13}
                              style={{
                                height: "100%",
                                width: "100%",
                                zIndex: 1,
                              }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap"
                              />
                              <LocationMarker
                                position={[tempLocation.lat, tempLocation.lng]}
                                setPosition={(pos) =>
                                  setTempLocation((prev) => ({
                                    ...prev,
                                    lat: pos[0],
                                    lng: pos[1],
                                  }))
                                }
                                setAddress={(addr) =>
                                  setTempLocation((prev) => ({
                                    ...prev,
                                    address: addr,
                                  }))
                                }
                                isArabic={isArabic}
                              />
                              <MapEffect />
                            </MapContainer>

                            {/* Floating Address Indicator */}
                            <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 p-3 rounded-lg shadow-lg border">
                              <p className="text-sm font-medium text-gray-700 truncate">
                                {tempLocation.address ||
                                  (isArabic
                                    ? "انقر على الخريطة لتحديد الموقع"
                                    : "Click map to set location")}
                              </p>
                            </div>
                          </CardContent>

                          <CardFooter className="border-t p-4 bg-gray-50 flex gap-3 justify-end">
                            <Button
                              variant="outline"
                              onClick={handleCancelLocation}
                            >
                              {isArabic ? "إلغاء" : "Cancel"}
                            </Button>
                            <Button
                              onClick={handleConfirmLocation}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isArabic ? "تأكيد الموقع" : "Confirm Location"}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    )}

                    <textarea
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: e.target.value,
                        })
                      }
                      placeholder={
                        isArabic ? "العنوان بالتفصيل" : "Detailed Address"
                      }
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    placeholder={isArabic ? "رقم التليفون" : "Phone Number"}
                  />
                </CardContent>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className={isArabic ? "font-arabic" : ""}>
                      {isArabic ? "ملخص الطلب" : "Order Summary"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className={`text-gray-600 ${
                            isArabic ? "font-arabic" : ""
                          }`}
                        >
                          {isArabic ? "المجموع الفرعي" : "Subtotal"}
                        </span>
                        <span className="font-semibold">
                          $
                          {cart.items.reduce(
                            (sum, item) =>
                              sum +
                              (item.product?.price ||
                                item.material_listing?.price_per_unit ||
                                0) *
                                item.quantity,
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className={`text-gray-600 ${
                            isArabic ? "font-arabic" : ""
                          }`}
                        >
                          {isArabic ? "الشحن" : "Shipping"}
                        </span>
                        <span className="font-semibold text-green-600">
                          {isArabic ? "مجاني" : "FREE"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className={`font-bold ${
                            isArabic ? "font-arabic" : ""
                          }`}
                        >
                          {isArabic ? "الإجمالي" : "Total"}
                        </span>
                        <span className="font-bold text-green-600">
                          $
                          {cart.items.reduce(
                            (sum, item) =>
                              sum +
                              (item.product?.price ||
                                item.material_listing?.price_per_unit ||
                                0) *
                                item.quantity,
                            0
                          )}
                        </span>
                      </div>
                      <p className="text-orange font-semibold">
                        {isArabic ? "الدفع عند التسليم" : "Cash on Delivery"}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleConfirmOrder}
                    >
                      {isArabic ? "تأكيد الطلب" : "Confirm Order"}
                    </Button>
                  </CardFooter>
                </Card>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
