// Shopping Cart Page
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import marketplaceService from '@/services/marketplaceService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Helper function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // If it already starts with /media, prepend the base URL
    if (imagePath.startsWith('/media')) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    // Otherwise, assume it needs /media prefix
    return `http://127.0.0.1:8000/media/${imagePath}`;
  };

  useEffect(() => {
    fetchCart();
  }, []);

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
    
    try {
      console.log('Updating quantity:', { item_id: itemId, quantity: newQuantity });
      const response = await marketplaceService.cart.updateItem({ item_id: itemId, quantity: newQuantity });
      console.log('Update response:', response);
      await fetchCart(); // Wait for cart to refresh
      toast({
        title: isArabic ? 'تم التحديث' : 'Updated',
        description: isArabic ? 'تم تحديث الكمية بنجاح' : 'Quantity updated successfully',
      });
    } catch (error) {
      console.error('Update quantity error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: error.response?.data?.error || JSON.stringify(error.response?.data) || (isArabic ? 'فشل تحديث الكمية' : 'Failed to update quantity'),
        variant: 'destructive',
      });
    }
  };

  const removeItem = async (itemId) => {
    try {
      await marketplaceService.cart.removeItem({ item_id: itemId });
      fetchCart();
      toast({
        title: isArabic ? 'تمت الإزالة' : 'Removed',
        description: isArabic ? 'تم إزالة العنصر من السلة' : 'Item removed from cart',
      });
    } catch (error) {
      console.error('Remove item error:', error);
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: error.response?.data?.detail || error.response?.data?.error || (isArabic ? 'فشلت إزالة العنصر' : 'Failed to remove item'),
        variant: 'destructive',
      });
    }
  };

  const clearCart = async () => {
    try {
      await marketplaceService.cart.clear();
      fetchCart();
      toast({
        title: isArabic ? 'تم التفريغ' : 'Cleared',
        description: isArabic ? 'تم تفريغ السلة بنجاح' : 'Cart cleared successfully',
      });
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل تفريغ السلة' : 'Failed to clear cart',
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
      
      {/* Header */}
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className={`text-lg sm:text-xl ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? 'سلة التسوق' : 'Shopping Cart'} ({cart?.total_items || 0} {isArabic ? 'عنصر' : 'items'})
                    </span>
                  </CardTitle>
                  {!isEmpty && (
                    <Button variant="outline" size="sm" onClick={clearCart} className="w-full sm:w-auto">
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isArabic ? 'تفريغ السلة' : 'Clear Cart'}
                    </Button>
                  )}
                </div>
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
                    {items.map((item) => {
                      const itemData = item.product || item.material_listing;
                      const itemType = item.product ? 'product' : 'material';
                      // Get the image path from the first image in the array or primary_image for materials
                      const imagePath = itemType === 'product'
                        ? itemData?.images?.[0]?.image
                        : (itemData?.images?.[0]?.image || itemData?.primary_image);
                      const imageUrl = getImageUrl(imagePath);

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                          {/* Image */}
                          <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={itemType === 'material' && isArabic && itemData.material?.name_ar ? itemData.material.name_ar : itemData.title}
                                className="w-full h-full object-cover"
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
                              {itemType === 'material' && isArabic && itemData.material?.name_ar ? itemData.material.name_ar : itemData.title}
                            </Link>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {itemData.description}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              ${item.unit_price} {isArabic ? 'لكل' : 'per'} {item.material_listing ? itemData.unit : (isArabic ? 'وحدة' : 'unit')}
                            </p>
                          </div>

                          {/* Quantity & Price */}
                          <div className="flex flex-col sm:flex-col items-stretch sm:items-end gap-3 sm:gap-2 w-full sm:w-auto">
                            <p className="text-lg font-bold text-green-600 text-center sm:text-right">
                              ${item.subtotal}
                            </p>
                            
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
                                  if (!isNaN(val) && val > 0) {
                                    updateQuantity(item.id, val);
                                  }
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

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange hover:text-orange/80 w-full sm:w-auto"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {isArabic ? 'إزالة' : 'Remove'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          {!isEmpty && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
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
                      <span className="font-semibold">${cart?.total_price || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-gray-600 ${isArabic ? 'font-arabic' : ''}`}>
                        {isArabic ? 'الشحن' : 'Shipping'}
                      </span>
                      <span className="font-semibold text-green-600">
                        {isArabic ? 'مجاني' : 'FREE'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-gray-600 ${isArabic ? 'font-arabic' : ''}`}>
                        {isArabic ? 'الضريبة' : 'Tax'}
                      </span>
                      <span className={`font-semibold ${isArabic ? 'font-arabic text-sm' : ''}`}>
                        {isArabic ? 'يحسب عند الدفع' : 'Calculated at checkout'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className={`font-bold ${isArabic ? 'font-arabic' : ''}`}>
                        {isArabic ? 'الإجمالي' : 'Total'}
                      </span>
                      <span className="font-bold text-green-600">${cart?.total_price || 0}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full" size="lg" onClick={() => navigate('/marketplace/checkout')}>
                    {isArabic ? 'متابعة إلى الدفع' : 'Proceed to Checkout'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
