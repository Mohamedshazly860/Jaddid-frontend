// My Orders Page - View Purchase & Sales History
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import ordersService from "@/services/ordersService";
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Use ordersService which contains more robust endpoint handling
      const [purchasesRes, salesRes] = await Promise.all([
        ordersService.getPurchases(),
        ordersService.getSales(),
      ]);
      // Normalize backend statuses: treat backend 'confirmed' as frontend 'in_progress'
      const normalize = (list) => {
        if (!list) return [];

        // Extract the array from the 'results' field if it exists
        const resultsArray = Array.isArray(list.results)
          ? list.results
          : Array.isArray(list)
          ? list
          : [];

        return resultsArray.map((o) => ({
          ...o,
          // Map backend keys to what the frontend expects
          id: o.id || o.order_id,
          status: o.status || o.order_status,
        }));
      };
      setPurchases(normalize(purchasesRes.data));
      setSales(normalize(salesRes.data));
    } catch (error) {
      console.error("Failed fetching orders:", error.response?.data || error);
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
      // Show in-progress state to the user
      toast({
        title: "Success",
        description: "Order is now in progress",
      });
      // Refresh list but the UI will remap confirmed->in_progress in fetchOrders
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
      IN_PROGRESS: "default",
      CONFIRMED: "default",
      completed: "default",
      cancelled: "destructive",
    };

    // Human-friendly labels
    const labels = {
      pending: "pending",
      CONFIRMED: "confirmed",
      IN_PROGRESS: "in progress",
      completed: "completed",
      cancelled: "cancelled",
    };

    const label = labels[status] ?? status;
    return <Badge variant={variants[status] || "secondary"}>{label}</Badge>;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4 text-yellow-500" />,
      CONFIRMED: <CheckCircle className="w-4 h-4 text-blue-500" />,
      IN_PROGRESS: <CheckCircle className="w-4 h-4 text-blue-500" />,
      completed: <CheckCircle className="w-4 h-4 text-green-500" />,
      cancelled: <XCircle className="w-4 h-4 text-red-500" />,
    };
    return icons[status] || null;
  };

  const OrderCard = ({ order }) => {
    const firstItem =
      order.items && order.items.length > 0 ? order.items[0] : null;

    const displayName = firstItem
      ? firstItem.product_title || firstItem.material_name || "Unknown Item"
      : "No items in order";

    const shortId = order.order_id
      ? order.order_id.slice(0, 8).toUpperCase()
      : "N/A";
    const price = parseFloat(order.total_price || 0).toFixed(2);
    const orderDate = new Date(order.created_at).toLocaleDateString();

    return (
      <div className="border rounded-lg p-4 shadow-sm bg-white mb-4">
        <div className="flex justify-between items-start border-b pb-2 mb-3">
          <div>
            <h3 className="font-bold text-lg">Order #{shortId}</h3>
            <p className="text-xs text-gray-500">{orderDate}</p>
          </div>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold capitalize">
            {order.order_status?.replace("_", " ")}
          </span>
        </div>

        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
            {/* Fixed the icon here */}
            <Package className="text-gray-400" size={24} />
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">{displayName}</h4>
            <p className="text-sm text-gray-600">
              Quantity: {firstItem?.quantity || 0} {firstItem?.unit || ""}
            </p>
            <p className="text-green-600 font-bold mt-1">${price}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t text-sm text-gray-600">
          <p>
            <strong>Seller:</strong> {order.seller_email || "Not specified"}
          </p>
          <p className="truncate">
            <strong>Delivery:</strong> {order.delivery_address}
          </p>
        </div>

        {/* FIXED BUTTON: Now routes to your specific tracking path */}
        <button
          onClick={() =>
            navigate(`/order-tracking/${order.order_id || order.id}`)
          }
          className="w-full mt-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View Details & Track
        </button>
      </div>
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
        {/* Normalize counts and lists for both paginated and array responses */}
        {/** purchases/sales may be either an array or an object with `results` */}
        {(() => {
          // no-op IIFE to keep variables local to JSX scope
        })()}

        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            {(() => {
              const purchasesCount = Array.isArray(purchases)
                ? purchases.length
                : Array.isArray(purchases?.results)
                ? purchases.results.length
                : 0;
              const salesCount = Array.isArray(sales)
                ? sales.length
                : Array.isArray(sales?.results)
                ? sales.results.length
                : 0;
              return (
                <>
                  <TabsTrigger value="purchases">
                    Purchases ({purchasesCount})
                  </TabsTrigger>
                  <TabsTrigger value="sales">Sales ({salesCount})</TabsTrigger>
                </>
              );
            })()}
          </TabsList>

          <TabsContent value="purchases" className="mt-6">
            {(() => {
              const list = Array.isArray(purchases)
                ? purchases
                : Array.isArray(purchases?.results)
                ? purchases.results
                : [];
              return list.length === 0 ? true : false;
            })() ? (
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
              (() => {
                const list = Array.isArray(purchases)
                  ? purchases
                  : Array.isArray(purchases?.results)
                  ? purchases.results
                  : [];
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {list.map((order, idx) => (
                      <OrderCard
                        key={order?.id ?? order?.pk ?? order?.uuid ?? idx}
                        order={order}
                        isSale={false}
                      />
                    ))}
                  </div>
                );
              })()
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            {(() => {
              const list = Array.isArray(sales)
                ? sales
                : Array.isArray(sales?.results)
                ? sales.results
                : [];
              return list.length === 0 ? true : false;
            })() ? (
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
              (() => {
                const list = Array.isArray(sales)
                  ? sales
                  : Array.isArray(sales?.results)
                  ? sales.results
                  : [];
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {list.map((order, idx) => (
                      <OrderCard
                        key={order?.id ?? order?.pk ?? order?.uuid ?? idx}
                        order={order}
                        isSale={true}
                      />
                    ))}
                  </div>
                );
              })()
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
