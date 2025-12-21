// Jaddid-frontend/src/components/landing/Navbar.jsx
import { useState } from "react";
import {
  Menu,
  X,
  Globe,
  Recycle,
  Bell,
  User,
  LogOut,
  UserCircle,
  Package,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  /* =========================
     Notifications Queries
  ========================== */

  const { data: countData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () =>
      api.get("/community/notifications/unread-count/").then((res) => res.data),
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/community/notifications/").then((res) => res.data),
    enabled: isAuthenticated,
  });

  const notificationCount = countData?.count || 0;

  const markAsRead = async (id) => {
    await api.post(`/community/notifications/${id}/mark-read/`);
    queryClient.invalidateQueries(["notifications"]);
    queryClient.invalidateQueries(["notifications-count"]);
  };

  /* ========================= */

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-sage/20 font-primary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-12 h-12 bg-forest rounded-xl flex items-center justify-center shadow-lg">
              <Recycle className="w-7 h-7 text-white" />
            </div>
            <span
              className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
            >
              {isRTL ? "جدد" : "Jaddid"}
            </span>
          </div>

          {/* Desktop Nav */}
          <div
            className={`hidden md:flex items-center gap-8 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Link to="/" className="text-forest font-medium">
              {t("nav.home")}
            </Link>
            <Link to="/marketplace" className="text-muted-foreground">
              {t("nav.marketplace")}
            </Link>
            <Link to="/marketplace/orders" className="text-muted-foreground">
              {t("nav.orders")}
            </Link>
            <Link to="/marketplace/favorites" className="text-muted-foreground">
              {t("nav.profile")}
            </Link>
          </div>

          {/* Actions */}
          <div
            className={`hidden md:flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-sage/30"
            >
              <Globe className="w-4 h-4" />
              {language === "en" ? "العربية" : "English"}
            </button>

            {isAuthenticated && (
              <>
                {/* 🔔 Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative p-2 rounded-full hover:bg-cream">
                      <Bell className="w-5 h-5 text-forest" />
                      {notificationCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-orange text-white text-xs">
                          {notificationCount}
                        </Badge>
                      )}
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-96">
                    <DropdownMenuLabel>
                      {language === "en" ? "Notifications" : "الإشعارات"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          {language === "en"
                            ? "No notifications"
                            : "لا توجد إشعارات"}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <DropdownMenuItem
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`flex flex-col gap-1 ${
                              !n.is_read ? "bg-cream/60" : ""
                            }`}
                          >
                            <p className="font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {n.message}
                            </p>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate("/notifications")}
                      className="text-center text-forest font-medium"
                    >
                      {language === "en" ? "View all" : "عرض الكل"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-sage/30">
                      <UserCircle className="w-5 h-5 text-forest" />
                      <span className="text-sm font-medium">
                        {user?.first_name || user?.email?.split("@")[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/marketplace/orders")}
                    >
                      <Recycle className="w-4 h-4 mr-2" /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/marketplace/my-listings")}
                    >
                      <Package className="w-4 h-4 mr-2" /> My Listings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
