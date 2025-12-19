// Marketplace Home Page - Browse Products & Materials
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Heart,
  ShoppingCart,
  Search,
  Filter,
  Star,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import marketplaceService from "@/services/marketplaceService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("-created_at");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  console.log("MarketplacePage rendering, loading:", loading);

  useEffect(() => {
    console.log("MarketplacePage useEffect triggered");
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy]);

  const fetchData = async () => {
    console.log("Fetching marketplace data...");
    try {
      setLoading(true);
      const params = {
        ordering: sortBy,
        search: searchTerm,
      };
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      console.log("Making API calls...");
      const [productsRes, materialsRes, categoriesRes] = await Promise.all([
        marketplaceService.products.getAll(params).catch((err) => {
          console.log("Products API error:", err.message, err.response?.status);
          return { data: { results: [] } };
        }),
        marketplaceService.materialListings.getAll(params).catch((err) => {
          console.log(
            "Materials API error:",
            err.message,
            err.response?.status
          );
          return { data: { results: [] } };
        }),
        marketplaceService.categories.getAll().catch((err) => {
          console.log(
            "Categories API error:",
            err.message,
            err.response?.status
          );
          return { data: [] };
        }),
      ]);

      console.log("API responses received:", {
        products: productsRes.data,
        materials: materialsRes.data,
        categories: categoriesRes.data,
      });

      setProducts(productsRes.data.results || productsRes.data || []);
      setMaterials(materialsRes.data.results || materialsRes.data || []);
      setCategories(categoriesRes.data || []);
      console.log("State updated successfully");
    } catch (error) {
      console.error("Marketplace fetch error:", error);
      // Don't show error toast, just set empty arrays
      setProducts([]);
      setMaterials([]);
      setCategories([]);
    } finally {
      setLoading(false);
      console.log("Loading complete");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleToggleFavorite = async (id, type) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to favorites",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    try {
      if (type === "product") {
        await marketplaceService.products.toggleFavorite(id);
      } else {
        await marketplaceService.materialListings.toggleFavorite(id);
      }
      toast({
        title: "Success",
        description: "Favorite updated successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive",
      });
    }
  };

  const ProductCard = ({ item, type = "product" }) => (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 card-hover border-sage/20">
      <div className="relative h-48 bg-gradient-to-br from-cream/50 to-sage/10">
        {item.images && item.images[0] ? (
          <img
            src={item.images[0].image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-sage/40" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
          onClick={() => handleToggleFavorite(item.id, type)}
        >
          <Heart
            className="w-5 h-5"
            fill={item.is_favorited ? "#FFB823" : "none"}
            stroke={item.is_favorited ? "#FFB823" : "currentColor"}
          />
        </Button>
        {item.status === "draft" && (
          <Badge
            className="absolute top-2 left-2 bg-orange text-white"
            variant="secondary"
          >
            Draft
          </Badge>
        )}
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-1 text-forest">{item.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-forest">
              ${type === "material" ? item.price_per_unit : item.price}
            </span>
            {type === "material" && (
              <span className="text-sm text-muted-foreground">
                per {item.unit}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-orange text-orange" />
              <span>{item.average_rating || "0.0"}</span>
            </div>
            <span>•</span>
            <span>{item.reviews_count || 0} reviews</span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>By {item.seller_name}</span>
            <Badge variant="outline" className="border-sage/50 text-forest">
              {item.condition}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          asChild
          className="flex-1 bg-forest hover:bg-forest/80 hover:shadow-lg transition-all text-white"
        >
          <Link to={`/marketplace/${type}/${item.id}`}>View Details</Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
          onClick={() => {
            if (!isAuthenticated) {
              toast({
                title: "Login Required",
                description: "Please login to add items to cart",
                variant: "destructive",
              });
              navigate("/login");
            } else {
              toast({
                title: "Coming Soon",
                description: "Add to cart feature will be available soon",
              });
            }
          }}
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  console.log(
    "Rendering MarketplacePage - products:",
    products.length,
    "materials:",
    materials.length,
    "loading:",
    loading
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-hero border-b border-sage/20 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage/10 text-forest rounded-full text-sm font-semibold mb-4">
              <Leaf className="w-4 h-4" />
              Sustainable Shopping
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
              Jaddid Marketplace
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover eco-friendly products and recycled materials
            </p>
          </div>

          {/* Search & Quick Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/marketplace/favorites")
                    : navigate("/login")
                }
              >
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Button>
              <Button
                variant="outline"
                className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/marketplace/cart")
                    : navigate("/login")
                }
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
              </Button>
              <Button
                variant="outline"
                className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/marketplace/orders")
                    : navigate("/login")
                }
              >
                <Package className="w-4 h-4 mr-2" />
                Orders
              </Button>
              <Button
                className="bg-orange hover:bg-orange/80 hover:shadow-lg transition-all text-white"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast({
                      title: "Login Required",
                      description: "Please login to list items for sale",
                      variant: "destructive",
                    });
                    navigate("/login");
                  } else {
                    toast({
                      title: "Coming Soon",
                      description:
                        "Listing items feature will be available soon",
                    });
                  }
                }}
              >
                + Sell Item
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search products, materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-sage/30 focus-visible:ring-forest"
              />
              <Button
                type="submit"
                className="bg-forest hover:bg-forest/80 hover:shadow-lg transition-all"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48 border-sage/30">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.results?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 border-sage/30">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="created_at">Oldest First</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="-views_count">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-cream/50">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-forest data-[state=active]:text-white"
            >
              All Items
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-forest data-[state=active]:text-white"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="data-[state=active]:bg-forest data-[state=active]:text-white"
            >
              Raw Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sage border-t-forest"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading marketplace...
                </p>
              </div>
            ) : [...products, ...materials].length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-sage/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-forest mb-2">
                  No Items Available
                </h3>
                <p className="text-muted-foreground mb-6">
                  The marketplace is currently empty. Check back soon or be the
                  first to list an item!
                </p>
                <Button
                  className="bg-orange hover:bg-orange/90"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast({
                        title: "Login Required",
                        description: "Please login to list items for sale",
                        variant: "destructive",
                      });
                      navigate("/login");
                    } else {
                      toast({
                        title: "Coming Soon",
                        description:
                          "Listing items feature will be available soon",
                      });
                    }
                  }}
                >
                  + List Your First Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...products, ...materials].map((item, idx) => (
                  <ProductCard
                    key={`${item.id}-${idx}`}
                    item={item}
                    type={item.price_per_unit ? "material" : "product"}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sage border-t-forest"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-sage/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-forest mb-2">
                  No Products Available
                </h3>
                <p className="text-muted-foreground">
                  No products found. Be the first to sell one!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} item={product} type="product" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="materials" className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sage border-t-forest"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading materials...
                </p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-sage/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-forest mb-2">
                  No Materials Available
                </h3>
                <p className="text-muted-foreground">
                  No raw materials found. List your recyclable materials!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {materials.map((material) => (
                  <ProductCard
                    key={material.id}
                    item={material}
                    type="material"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default MarketplacePage;
