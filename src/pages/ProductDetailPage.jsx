// Product/Material Detail Page
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Package, Heart, ShoppingCart, Share2, Flag, MessageSquare, 
  MapPin, Star, Clock, Eye, ArrowLeft, User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import marketplaceService from '@/services/marketplaceService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductDetailPage = () => {
  const { type, id } = useParams(); // type: 'product' or 'material'
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchItemDetails();
  }, [id, type]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      let itemRes, reviewsRes;
      
      if (type === 'product') {
        itemRes = await marketplaceService.products.getById(id);
        reviewsRes = await marketplaceService.products.getReviews(id);
      } else {
        itemRes = await marketplaceService.materialListings.getById(id);
        reviewsRes = await marketplaceService.materialListings.getReviews(id);
      }
      
      setItem(itemRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load item details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to cart',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      console.log('Adding to cart:', { type, id });
      const cartData = type === 'product' 
        ? { product_id: id, quantity: 1 }
        : { material_listing_id: id, quantity: 1 };
      
      console.log('Cart data:', cartData);
      const response = await marketplaceService.cart.addItem(cartData);
      console.log('Cart response:', response);
      
      toast({
        title: 'Success',
        description: 'Item added to cart',
      });
    } catch (error) {
      console.error('Cart error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to favorites',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      if (type === 'product') {
        await marketplaceService.products.toggleFavorite(id);
      } else {
        await marketplaceService.materialListings.toggleFavorite(id);
      }
      toast({
        title: 'Success',
        description: 'Favorite updated',
      });
      fetchItemDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Please login to add favorites',
        variant: 'destructive',
      });
    }
  };

  const handleOrderNow = () => {
    navigate(`/marketplace/checkout/${type}/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 animate-pulse text-green-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Item not found</p>
          <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  const images = item.images || [];
  const currentImage = images[selectedImage]?.image || null;
  
  // Helper function to get full image URL
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
              {currentImage ? (
                <img
                  src={getImageUrl(currentImage)}
                  alt={type === 'material' && isArabic && item.material?.name_ar ? item.material.name_ar : item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={getImageUrl(img.image)} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleToggleFavorite}>
                    <Heart className="w-5 h-5" fill={item.is_favorited ? "red" : "none"} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Flag className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">
                {type === 'material' && isArabic && item.material?.name_ar ? item.material.name_ar : item.title}
              </h1>
              <p className="text-gray-600">{item.description}</p>
            </div>

            <Separator />

            {/* Price & Stats */}
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">
                  ${type === 'material' ? item.price_per_unit : item.price}
                </span>
                {type === 'material' && (
                  <span className="text-lg text-gray-500">per {item.unit}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-semibold">{item.average_rating || '0.0'}</span>
                      <span className="text-sm text-gray-500">({item.reviews_count} reviews)</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-500" />
                      <span className="text-xl font-semibold">{item.views_count}</span>
                      <span className="text-sm text-gray-500">views</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <Badge variant="outline">{item.condition}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity Available:</span>
                    <span className="font-semibold">{item.quantity} {item.unit || 'units'}</span>
                  </div>
                  {item.material && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Material Type:</span>
                      <span className="font-semibold">{item.material_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{item.location}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seller Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={item.seller_avatar} />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{item.seller_name}</p>
                      <p className="text-sm text-gray-500">{item.seller_email}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={handleOrderNow}>
                Order Now
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>{reviews.length} reviews</CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{review.reviewer_name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold mb-1">{review.title}</p>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetailPage;
