import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Package, Leaf, Upload, X } from "lucide-react";
import api from "../services/api";
import { toast } from "../hooks/use-toast";

const SellItemPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // Redirect if not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  const [itemType, setItemType] = useState(searchParams.get("type") === "material" ? "material" : "product");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showNewMaterialForm, setShowNewMaterialForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: ""
  });

  // Fetch materials and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsRes, categoriesRes] = await Promise.all([
          api.get("/marketplace/materials/"),
          api.get("/marketplace/categories/")
        ]);
        setMaterials(materialsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Update tab when URL parameter changes
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "material") {
      setItemType("material");
    } else if (type === "product") {
      setItemType("product");
    }
  }, [searchParams]);

  // Product fields
  const [productData, setProductData] = useState({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    price: "",
    quantity: 1,
    condition: "good",
    location: "",
    latitude: "",
    longitude: "",
    category: "",
  });

  // Material fields
  const [materialData, setMaterialData] = useState({
    material: "", // Material ID (from backend Material master data)
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    quantity: "",
    unit: "kg",
    price_per_unit: "",
    minimum_order_quantity: "",
    condition: "good",
    location: "",
    latitude: "",
    longitude: "",
    available_from: "",
    available_until: "",
    notes: "",
    custom_material_name: "", // For when user wants to suggest new material
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "يمكنك تحميل 5 صور كحد أقصى"
          : "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewUrls[index]);
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Add product data
      Object.keys(productData).forEach((key) => {
        if (productData[key]) {
          formData.append(key, productData[key]);
        }
      });

      // Add images
      images.forEach((image) => {
        formData.append("uploaded_images", image);
      });

      // Set status as active by default
      formData.append("status", "active");

      const response = await api.post("/marketplace/products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: isArabic ? "تم!" : "Success!",
        description: isArabic
          ? "تم نشر منتجك بنجاح"
          : "Your product has been listed successfully",
      });

      navigate("/marketplace");
    } catch (error) {
      console.error("Product creation error:", error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.message ||
          (isArabic ? "فشل نشر المنتج" : "Failed to create product"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // If user selected "new" material option, add custom material name
      if (showNewMaterialForm && newMaterial.name) {
        formData.append("custom_material_name", newMaterial.name);
        formData.append("notes", `${materialData.notes ? materialData.notes + '\n\n' : ''}Suggested new material: ${newMaterial.name}${newMaterial.description ? '\nDescription: ' + newMaterial.description : ''}`);
      } else {
        // Add selected material ID
        formData.append("material", materialData.material);
      }
      
      // Add material listing data
      Object.keys(materialData).forEach((key) => {
        if (key !== "material" && key !== "custom_material_name" && materialData[key]) {
          formData.append(key, materialData[key]);
        }
      });

      // Add images
      images.forEach((image) => {
        formData.append("uploaded_images", image);
      });

      // Set status as pending_approval if it's a custom material, active otherwise
      formData.append("status", showNewMaterialForm ? "pending_approval" : "active");

      const response = await api.post("/marketplace/material-listings/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: isArabic ? "تم!" : "Success!",
        description: showNewMaterialForm 
          ? (isArabic
              ? "تم إرسال طلبك للمراجعة. سيتم تفعيل المادة بعد الموافقة."
              : "Your listing has been submitted for review. It will be activated after approval.")
          : (isArabic
              ? "تم نشر المادة بنجاح"
              : "Your material has been listed successfully"),
      });

      navigate("/marketplace");
    } catch (error) {
      console.error("Material creation error:", error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.message ||
          (isArabic ? "فشل نشر المادة" : "Failed to create material listing"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-forest mb-8 text-center">
          {isArabic ? "بيع عنصر" : "Sell an Item"}
        </h1>

        <Tabs value={itemType} onValueChange={setItemType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="product" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {isArabic ? "منتج" : "Product"}
            </TabsTrigger>
            <TabsTrigger value="material" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              {isArabic ? "مادة خام" : "Raw Material"}
            </TabsTrigger>
          </TabsList>

          {/* Product Form */}
          <TabsContent value="product">
            <Card>
              <CardHeader>
                <CardTitle className="text-forest">
                  {isArabic ? "تفاصيل المنتج" : "Product Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProductSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        {isArabic ? "العنوان (English)" : "Title (English)"}
                      </Label>
                      <Input
                        id="title"
                        value={productData.title}
                        onChange={(e) =>
                          setProductData({ ...productData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title_ar">
                        {isArabic ? "العنوان (عربي)" : "Title (Arabic)"}
                      </Label>
                      <Input
                        id="title_ar"
                        value={productData.title_ar}
                        onChange={(e) =>
                          setProductData({ ...productData, title_ar: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        {isArabic ? "الوصف (English)" : "Description (English)"}
                      </Label>
                      <Textarea
                        id="description"
                        value={productData.description}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description_ar">
                        {isArabic ? "الوصف (عربي)" : "Description (Arabic)"}
                      </Label>
                      <Textarea
                        id="description_ar"
                        value={productData.description_ar}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            description_ar: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Category & Price & Quantity */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        {isArabic ? "التصنيف *" : "Category *"}
                      </Label>
                      <Select
                        value={productData.category}
                        onValueChange={(value) =>
                          setProductData({ ...productData, category: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isArabic ? "اختر تصنيف" : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {isArabic && cat.name_ar ? cat.name_ar : cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        {isArabic ? "السعر (EGP)" : "Price (EGP)"}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productData.price}
                        onChange={(e) =>
                          setProductData({ ...productData, price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">
                        {isArabic ? "الكمية" : "Quantity"}
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={productData.quantity}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            quantity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="condition">
                      {isArabic ? "الحالة" : "Condition"}
                    </Label>
                    <Select
                      value={productData.condition}
                      onValueChange={(value) =>
                        setProductData({ ...productData, condition: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">
                          {isArabic ? "جديد" : "New"}
                        </SelectItem>
                        <SelectItem value="like_new">
                          {isArabic ? "كالجديد" : "Like New"}
                        </SelectItem>
                        <SelectItem value="good">
                          {isArabic ? "جيد" : "Good"}
                        </SelectItem>
                        <SelectItem value="fair">
                          {isArabic ? "مقبول" : "Fair"}
                        </SelectItem>
                        <SelectItem value="poor">
                          {isArabic ? "ضعيف" : "Poor"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      {isArabic ? "الموقع" : "Location"}
                    </Label>
                    <Input
                      id="location"
                      value={productData.location}
                      onChange={(e) =>
                        setProductData({ ...productData, location: e.target.value })
                      }
                      placeholder={
                        isArabic ? "مثال: القاهرة، مصر" : "e.g., Cairo, Egypt"
                      }
                      required
                    />
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label>{isArabic ? "الصور (حد أقصى 5)" : "Images (Max 5)"}</Label>
                    <div className="border-2 border-dashed border-sage/30 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-sage mb-4" />
                      <Label
                        htmlFor="images"
                        className="cursor-pointer text-forest hover:text-sage"
                      >
                        {isArabic
                          ? "انقر لتحميل الصور"
                          : "Click to upload images"}
                      </Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest hover:bg-forest/90"
                  >
                    {loading
                      ? isArabic
                        ? "جاري النشر..."
                        : "Publishing..."
                      : isArabic
                      ? "نشر المنتج"
                      : "Publish Product"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Material Form */}
          <TabsContent value="material">
            <Card>
              <CardHeader>
                <CardTitle className="text-forest">
                  {isArabic ? "تفاصيل المادة الخام" : "Raw Material Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMaterialSubmit} className="space-y-6">
                  {/* Material Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="material">
                      {isArabic ? "اختر المادة الخام *" : "Select Raw Material *"}
                    </Label>
                    <Select
                      value={materialData.material}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setShowNewMaterialForm(true);
                          setMaterialData({ ...materialData, material: "" });
                        } else {
                          setShowNewMaterialForm(false);
                          setMaterialData({ ...materialData, material: value });
                        }
                      }}
                      required={!showNewMaterialForm}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isArabic ? "اختر مادة خام" : "Select a raw material"} />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((mat) => (
                          <SelectItem key={mat.id} value={mat.id.toString()}>
                            {isArabic && mat.name_ar ? mat.name_ar : mat.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new" className="text-orange font-semibold border-t mt-2 pt-2">
                          + {isArabic ? "أضف مادة خام جديدة" : "Add New Raw Material"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* New Material Form - Show when "Add New" is selected */}
                  {showNewMaterialForm && (
                    <Card className="bg-orange/5 border-orange/30">
                      <CardHeader>
                        <CardTitle className="text-sm text-forest">
                          {isArabic ? "معلومات المادة الخام الجديدة" : "New Raw Material Information"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              {isArabic ? "اسم المادة (English) *" : "Material Name (English) *"}
                            </Label>
                            <Input
                              value={newMaterial.name}
                              onChange={(e) =>
                                setNewMaterial({ ...newMaterial, name: e.target.value })
                              }
                              placeholder="e.g., PET Bottles, Aluminum Cans"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              {isArabic ? "اسم المادة (عربي)" : "Material Name (Arabic)"}
                            </Label>
                            <Input
                              value={newMaterial.name_ar}
                              onChange={(e) =>
                                setNewMaterial({ ...newMaterial, name_ar: e.target.value })
                              }
                              placeholder={isArabic ? "مثال: زجاجات بلاستيك، علب ألومنيوم" : ""}
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              {isArabic ? "وصف المادة (English)" : "Material Description (English)"}
                            </Label>
                            <Textarea
                              value={newMaterial.description}
                              onChange={(e) =>
                                setNewMaterial({ ...newMaterial, description: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              {isArabic ? "وصف المادة (عربي)" : "Material Description (Arabic)"}
                            </Label>
                            <Textarea
                              value={newMaterial.description_ar}
                              onChange={(e) =>
                                setNewMaterial({ ...newMaterial, description_ar: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowNewMaterialForm(false);
                            setNewMaterial({ name: "", name_ar: "", description: "", description_ar: "" });
                          }}
                          className="w-full"
                        >
                          {isArabic ? "إلغاء - اختيار مادة موجودة" : "Cancel - Select Existing Material"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Title */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mat_title">
                        {isArabic ? "العنوان (English)" : "Title (English)"}
                      </Label>
                      <Input
                        id="mat_title"
                        value={materialData.title}
                        onChange={(e) =>
                          setMaterialData({ ...materialData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mat_title_ar">
                        {isArabic ? "العنوان (عربي)" : "Title (Arabic)"}
                      </Label>
                      <Input
                        id="mat_title_ar"
                        value={materialData.title_ar}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            title_ar: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mat_description">
                        {isArabic ? "الوصف (English)" : "Description (English)"}
                      </Label>
                      <Textarea
                        id="mat_description"
                        value={materialData.description}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mat_description_ar">
                        {isArabic ? "الوصف (عربي)" : "Description (Arabic)"}
                      </Label>
                      <Textarea
                        id="mat_description_ar"
                        value={materialData.description_ar}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            description_ar: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Quantity, Unit, Price */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mat_quantity">
                        {isArabic ? "الكمية" : "Quantity"}
                      </Label>
                      <Input
                        id="mat_quantity"
                        type="number"
                        step="0.01"
                        value={materialData.quantity}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            quantity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">
                        {isArabic ? "الوحدة" : "Unit"}
                      </Label>
                      <Select
                        value={materialData.unit}
                        onValueChange={(value) =>
                          setMaterialData({ ...materialData, unit: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">KG</SelectItem>
                          <SelectItem value="ton">Ton</SelectItem>
                          <SelectItem value="bag">Bag</SelectItem>
                          <SelectItem value="item">Item</SelectItem>
                          <SelectItem value="cubic_meter">Cubic Meter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_per_unit">
                        {isArabic ? "السعر لكل وحدة" : "Price per Unit"}
                      </Label>
                      <Input
                        id="price_per_unit"
                        type="number"
                        step="0.01"
                        value={materialData.price_per_unit}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            price_per_unit: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Min Order & Condition */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_order">
                        {isArabic ? "الحد الأدنى للطلب" : "Minimum Order Quantity"}
                      </Label>
                      <Input
                        id="min_order"
                        type="number"
                        step="0.01"
                        value={materialData.minimum_order_quantity}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            minimum_order_quantity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mat_condition">
                        {isArabic ? "الحالة" : "Condition"}
                      </Label>
                      <Select
                        value={materialData.condition}
                        onValueChange={(value) =>
                          setMaterialData({ ...materialData, condition: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">
                            {isArabic ? "ممتاز" : "Excellent"}
                          </SelectItem>
                          <SelectItem value="good">
                            {isArabic ? "جيد" : "Good"}
                          </SelectItem>
                          <SelectItem value="acceptable">
                            {isArabic ? "مقبول" : "Acceptable"}
                          </SelectItem>
                          <SelectItem value="poor">
                            {isArabic ? "ضعيف" : "Poor"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="mat_location">
                      {isArabic ? "الموقع" : "Location"}
                    </Label>
                    <Input
                      id="mat_location"
                      value={materialData.location}
                      onChange={(e) =>
                        setMaterialData({
                          ...materialData,
                          location: e.target.value,
                        })
                      }
                      placeholder={
                        isArabic ? "مثال: القاهرة، مصر" : "e.g., Cairo, Egypt"
                      }
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {isArabic ? "ملاحظات إضافية" : "Additional Notes"}
                    </Label>
                    <Textarea
                      id="notes"
                      value={materialData.notes}
                      onChange={(e) =>
                        setMaterialData({ ...materialData, notes: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label>{isArabic ? "الصور (حد أقصى 5)" : "Images (Max 5)"}</Label>
                    <div className="border-2 border-dashed border-sage/30 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-sage mb-4" />
                      <Label
                        htmlFor="mat_images"
                        className="cursor-pointer text-forest hover:text-sage"
                      >
                        {isArabic
                          ? "انقر لتحميل الصور"
                          : "Click to upload images"}
                      </Label>
                      <Input
                        id="mat_images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest hover:bg-forest/90"
                  >
                    {loading
                      ? isArabic
                        ? "جاري النشر..."
                        : "Publishing..."
                      : isArabic
                      ? "نشر المادة"
                      : "Publish Material"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default SellItemPage;
