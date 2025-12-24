// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import marketplaceService from '@/services/marketplaceService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === 'ar';

  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    address: '',
    phone: '',
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/media')) return `http://127.0.0.1:8000${imagePath}`;
    return `http://127.0.0.1:8000/media/${imagePath}`;
  };

  useEffect(() => {
    fetchCart();
    if (user) {
      setCustomerInfo({
        fullName: `${user.first_name} ${user.last_name}`,
        address: user.address || '',
        phone: user.phone || '',
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
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل تحميل السلة' : 'Failed to load cart',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
      total_price: prevCart.items.reduce((sum, item) => {
        const quantity = item.id === itemId ? newQuantity : item.quantity;
        const price = item.product?.price || item.material_listing?.price_per_unit || 0;
        return sum + (price * quantity);
      }, 0)
    }));

    try {
      await marketplaceService.cart.updateItem({ item_id: itemId, quantity: newQuantity });
      const response = await marketplaceService.cart.get();
      setCart(response.data);
    } catch (error) {
      fetchCart();
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: error.response?.data?.error || (isArabic ? 'فشل تحديث الكمية' : 'Failed to update quantity'),
        variant: 'destructive',
      });
    }
  };

  const handleConfirmOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'سلتك فارغة' : 'Your cart is empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const itemsBySeller = {};
      cart.items.forEach(item => {
        const sellerId = item.product?.seller_id || item.material_listing?.seller_id;
        if (!sellerId) {
          console.error('Item missing seller_id:', item);
          return;
        }
        if (!itemsBySeller[sellerId]) itemsBySeller[sellerId] = [];
        itemsBySeller[sellerId].push(item);
      });

      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        for (const item of items) {
          const orderPayload = {
            buyer_id: user.id,
            seller_id: sellerId,
            product_id: item.product?.id || null,
            material_listing_id: item.material_listing?.id || null,
            quantity: item.quantity,
            unit_price: item.product?.price || item.material_listing?.price_per_unit || 0,
            delivery_address: customerInfo.address,
            unit: item.product ? 'piece' : item.material_listing?.unit,
          };

          console.log('Sending order payload:', orderPayload);
          await marketplaceService.orders.create(orderPayload);
        }
      }

      await marketplaceService.cart.clear();

      toast({
        title: isArabic ? 'تم' : 'Success',
        description: isArabic ? 'تم إنشاء الطلبات بنجاح' : 'Orders created successfully',
        variant: 'default',
      });
      navigate('/orders');
    } catch (error) {
      console.error('Order creation failed:', error.response?.data || error);
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: error.response?.data?.detail || (isArabic ? 'فشل تأكيد الطلب' : 'Failed to confirm order'),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 animate-pulse text-green-500" />
          <p className="text-gray-600">{isArabic ? 'جاري تحميل السلة...' : 'Loading cart...'}</p>
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
          <Button variant="ghost" onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isArabic ? 'متابعة التسوق' : 'Continue Shopping'}
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
                  <span className={`text-lg sm:text-xl ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? 'مراجعة السلة' : 'Review Cart'} ({cart?.total_items || 0} {isArabic ? 'عنصر' : 'items'})
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                {isEmpty ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className={`text-xl font-semibold mb-2 ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? 'سلتك فارغة' : 'Your cart is empty'}
                    </p>
                    <p className={`text-gray-500 mb-6 ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? 'أضف عناصر للبدء' : 'Add items to get started'}
                    </p>
                    <Button asChild>
                      <Link to="/marketplace">{isArabic ? 'تصفح السوق' : 'Browse Marketplace'}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map(item => {
                      const itemData = item.product || item.material_listing;
                      const itemType = item.product ? 'product' : 'material';
                      const imagePath = itemData?.images?.[0]?.image || itemData?.primary_image;
                      const imageUrl = getImageUrl(imagePath);

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                          {/* Image */}
                          <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={itemData.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
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
                              ${item.quantity * (item.product?.price || item.material_listing?.price_per_unit || 0)}
                            </p>
                          </div>

                          {/* Quantity */}
                          <div className="flex flex-col items-stretch sm:items-end gap-3 sm:gap-2 w-full sm:w-auto">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => updateQuantity(item.id, Math.floor(parseFloat(item.quantity)) - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                value={Math.floor(parseFloat(item.quantity))}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val > 0) updateQuantity(item.id, val);
                                }}
                                className="w-20 text-center"
                                min="1"
                                step="1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => updateQuantity(item.id, Math.floor(parseFloat(item.quantity)) + 1)}
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
                  <CardTitle className={isArabic ? 'font-arabic' : ''}>
                    {isArabic ? 'معلومات العميل' : 'Customer Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                    placeholder={isArabic ? 'الاسم الكامل' : 'Full Name'}
                    className="mb-2"
                  />
                  <Input
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder={isArabic ? 'العنوان' : 'Address'}
                    className="mb-2 h-24"
                  />
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder={isArabic ? 'رقم التليفون' : 'Phone Number'}
                  />
                </CardContent>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className={isArabic ? 'font-arabic' : ''}>
                      {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-gray-600 ${isArabic ? 'font-arabic' : ''}`}>
                          {isArabic ? 'المجموع الفرعي' : 'Subtotal'}
                        </span>
                        <span className="font-semibold">
                          ${cart.items.reduce((sum, item) => sum + ((item.product?.price || item.material_listing?.price_per_unit || 0) * item.quantity), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-gray-600 ${isArabic ? 'font-arabic' : ''}`}>
                          {isArabic ? 'الشحن' : 'Shipping'}
                        </span>
                        <span className="font-semibold text-green-600">{isArabic ? 'مجاني' : 'FREE'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`font-bold ${isArabic ? 'font-arabic' : ''}`}>
                          {isArabic ? 'الإجمالي' : 'Total'}
                        </span>
                        <span className="font-bold text-green-600">
                          ${cart.items.reduce((sum, item) => sum + ((item.product?.price || item.material_listing?.price_per_unit || 0) * item.quantity), 0)}
                        </span>
                      </div>
                      <p className="text-orange font-semibold">{isArabic ? 'الدفع عند التسليم' : 'Cash on Delivery'}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="lg" onClick={handleConfirmOrder}>
                      {isArabic ? 'تأكيد الطلب' : 'Confirm Order'}
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