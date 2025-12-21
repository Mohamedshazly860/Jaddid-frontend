// Jaddid-frontend/src/App.jsx
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
// Marketplace Pages
import MarketplacePage from "./pages/MarketplacePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellItemPage from "./pages/SellItemPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import FavoritesPage from "./pages/FavoritesPage";
import MessagesPage from "./pages/MessagesPage";
import ServicesPage from "./pages/ServicesPage";
import MyListingsPage from "./pages/MyListingsPage";
import DebugAuthPage from "./pages/DebugAuthPage";
import UserProfile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
// import Navbar from "./components/landing/Navbar";
// import Footer from "./components/landing/Footer";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/profile/edit" element={<EditProfile />} />

              {/* Marketplace Routes */}
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route
                path="/marketplace/:type/:id"
                element={<ProductDetailPage />}
              />
              <Route path="/marketplace/sell" element={<SellItemPage />} />
              <Route path="/marketplace/cart" element={<CartPage />} />
              <Route path="/marketplace/orders" element={<OrdersPage />} />
              <Route
                path="/marketplace/favorites"
                element={<FavoritesPage />}
              />
              <Route path="/marketplace/messages" element={<MessagesPage />} />
              <Route
                path="/marketplace/my-listings"
                element={<MyListingsPage />}
              />
              <Route path="/debug-auth" element={<DebugAuthPage />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
