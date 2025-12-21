// My Orders Page - View Purchase & Sales History
import { useState, useEffect } from "react";
import { Package, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import marketplaceService from "@/services/marketplaceService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const OrdersPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [purchasesRes, salesRes] = await Promise.all([
        marketplaceService.orders.getPurchases(),
        marketplaceService.orders.getSales(),
      ]);
      setPurchases(purchasesRes.data);
      setSales(salesRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await marketplaceService.orders.confirm(orderId);
      toast({
        title: "Success",
        description: "Order confirmed",
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm order",
        variant: "destructive",
      });
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await marketplaceService.orders.complete(orderId);
      toast({
        title: "Success",
        description: "Order completed",
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete order",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await marketplaceService.orders.cancel(orderId);
      toast({
        title: "Success",
        description: "Order cancelled",
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "secondary",
      confirmed: "default",
      completed: "default",
      cancelled: "destructive",
    };

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4 text-yellow-500" />,
      confirmed: <CheckCircle className="w-4 h-4 text-blue-500" />,
      completed: <CheckCircle className="w-4 h-4 text-green-500" />,
      cancelled: <XCircle className="w-4 h-4 text-red-500" />,
    };
    return icons[status] || null;
  };

  const OrderCard = ({ order, isSale }) => {
    const itemData = order.product || order.material_listing;
    const itemType = order.product ? "product" : "material";
    const image =
      itemType === "product"
        ? itemData?.images?.[0]?.image
        : itemData?.images?.[0]?.image || itemData?.primary_image;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                Order #{order.id.slice(0, 8)}
                {getStatusIcon(order.status)}
              </CardTitle>
              <CardDescription>
                {new Date(order.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {image ? (
                <img
                  src={image}
                  alt={
                    order.material_listing &&
                    isArabic &&
                    itemData.material?.name_ar
                      ? itemData.material.name_ar
                      : itemData.title
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="font-semibold">
                {order.material_listing &&
                isArabic &&
                itemData.material?.name_ar
                  ? itemData.material.name_ar
                  : itemData.title}
              </p>
              <p className="text-sm text-gray-600">
                Quantity: {order.quantity} {order.unit}
              </p>
              <p className="text-lg font-bold text-green-600 mt-1">
                ${order.total_price}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {isSale ? "Buyer" : "Seller"}:
              </span>
              <span className="font-semibold">
                {isSale ? order.buyer_name : order.seller_name}
              </span>
            </div>
            {order.delivery_address && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Address:</span>
                <span className="text-right">{order.delivery_address}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedOrder(order)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>

            {isSale && order.status === "pending" && (
              <Button size="sm" onClick={() => handleConfirmOrder(order.id)}>
                Confirm
              </Button>
            )}

            {isSale && order.status === "confirmed" && (
              <Button size="sm" onClick={() => handleCompleteOrder(order.id)}>
                Complete
              </Button>
            )}

            {order.status === "pending" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelOrder(order.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 animate-pulse text-green-500" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="purchases">
              Purchases ({purchases.length})
            </TabsTrigger>
            <TabsTrigger value="sales">Sales ({sales.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="mt-6">
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-semibold mb-2">No purchases yet</p>
                  <p className="text-gray-500">
                    Your purchase history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases?.results?.map((order) => (
                  <OrderCard key={order.id} order={order} isSale={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            {sales.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-semibold mb-2">No sales yet</p>
                  <p className="text-gray-500">
                    Your sales history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sales?.results?.map((order) => (
                  <OrderCard key={order.id} order={order} isSale={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">
                    {getStatusBadge(selectedOrder.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold">
                    {selectedOrder.quantity} {selectedOrder.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="font-semibold text-green-600">
                    ${selectedOrder.total_price}
                  </p>
                </div>
              </div>

              <Separator />

              {selectedOrder.notes && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                  <Separator />
                </>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                <p className="text-sm">
                  {selectedOrder.delivery_address || "Not provided"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
