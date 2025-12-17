// Favorites/Wishlist Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Package, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import marketplaceService from '@/services/marketplaceService';
import { useToast } from '@/hooks/use-toast';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.favorites.getAll();
      setFavorites(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load favorites',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    try {
      await marketplaceService.favorites.remove(id);
      toast({
        title: 'Removed',
        description: 'Item removed from favorites',
      });
      fetchFavorites();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove favorite',
        variant: 'destructive',
      });
    }
  };

  const addToCart = async (item) => {
    try {
      const cartData = item.product
        ? { product_id: item.product.id, quantity: 1 }
        : { material_listing_id: item.material_listing.id, quantity: 1 };
      
      await marketplaceService.cart.addItem(cartData);
      toast({
        title: 'Success',
        description: 'Item added to cart',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 animate-pulse text-red-500" />
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" fill="red" />
            My Favorites
          </h1>
          <p className="text-gray-600">{favorites.length} items</p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold mb-2">No favorites yet</p>
              <p className="text-gray-500 mb-6">
                Start adding items to your wishlist
              </p>
              <Button asChild>
                <Link to="/marketplace">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              const item = favorite.product || favorite.material_listing;
              const itemType = favorite.product ? 'product' : 'material';
              const image = item?.images?.[0]?.image;

              return (
                <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50">
                    {image ? (
                      <img
                        src={image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeFavorite(favorite.id)}
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">
                          ${itemType === 'material' ? item.price_per_unit : item.price}
                        </span>
                        {itemType === 'material' && (
                          <span className="text-sm text-gray-500">per {item.unit}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {item.seller_name}</span>
                        <Badge variant="outline">{item.condition}</Badge>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/marketplace/${itemType}/${item.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToCart(favorite)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
