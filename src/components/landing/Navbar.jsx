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
import communityService from "@/services/communityService";

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
      communityService.notifications.getUnreadCount().then((res) => res.data),
    enabled: isAuthenticated,
    refetchInterval: 60000,
    retry: false,
    onError: (error) => {
      console.warn("Failed to fetch notification count:", error);
    },
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      communityService.notifications.getAll().then((res) => res.data),
    enabled: isAuthenticated,
    retry: false,
    onError: (error) => {
      console.warn("Failed to fetch notifications:", error);
    },
  });

  const notifications = notificationsData?.results || [];
  const notificationCount = countData?.count || 0;

  const handleNotificationClick = async (id) => {
    try {
      await markAsRead(id);
      navigate("/notifications");
    } catch (error) {
      console.error("Failed to handle notification click:", error);
      navigate("/notifications");
    }
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

            {isAuthenticated ? (
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
                          <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                          {language === "en"
                            ? "No notifications"
                            : "لا توجد إشعارات"}
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <DropdownMenuItem
                            key={n.id}
                            onClick={() => handleNotificationClick(n.id)}
                            className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-cream/50 ${
                              !n.is_read
                                ? "bg-orange/10 border-l-2 border-orange"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                !n.is_read ? "bg-orange" : "bg-transparent"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {n.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {n.message?.length > 60
                                  ? `${n.message.substring(0, 60)}...`
                                  : n.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(n.created_at).toLocaleDateString(
                                  language === "en" ? "en-US" : "ar-EG"
                                )}
                              </p>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate("/notifications")}
                      className="text-center text-forest font-medium hover:bg-forest/10"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {language === "en"
                        ? "View all notifications"
                        : "عرض جميع الإشعارات"}
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
            ) : (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="px-4 py-2"
                >
                  {language === "en" ? "Login" : "تسجيل الدخول"}
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 bg-forest text-white hover:bg-forest/90"
                >
                  {language === "en" ? "Register" : "إنشاء حساب"}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-background border-t border-sage/20">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className="block text-forest font-medium"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/marketplace"
                className="block text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.marketplace")}
              </Link>
              <Link
                to="/marketplace/orders"
                className="block text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.orders")}
              </Link>
              <Link
                to="/marketplace/favorites"
                className="block text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                {t("nav.profile")}
              </Link>

              <div className="border-t border-sage/20 pt-4">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-sage/30 mb-4"
                >
                  <Globe className="w-4 h-4" />
                  {language === "en" ? "العربية" : "English"}
                </button>

                {isAuthenticated ? (
                  <>
                    {/* Mobile Notifications */}
                    <div className="mb-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-cream">
                            <Bell className="w-5 h-5 text-forest" />
                            <span>
                              {language === "en"
                                ? "Notifications"
                                : "الإشعارات"}
                            </span>
                            {notificationCount > 0 && (
                              <Badge className="bg-orange text-white text-xs">
                                {notificationCount}
                              </Badge>
                            )}
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="w-80">
                          <DropdownMenuLabel>
                            {language === "en" ? "Notifications" : "الإشعارات"}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <div className="max-h-64 overflow-y-auto">
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
                            onClick={() => {
                              navigate("/notifications");
                              setIsOpen(false);
                            }}
                            className="text-center text-forest font-medium"
                          >
                            {language === "en" ? "View all" : "عرض الكل"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mobile User Menu */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-cream"
                      >
                        <User className="w-4 h-4" />
                        {language === "en" ? "Profile" : "الملف الشخصي"}
                      </button>
                      <button
                        onClick={() => {
                          navigate("/marketplace/orders");
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-cream"
                      >
                        <Recycle className="w-4 h-4" />
                        {language === "en" ? "My Orders" : "طلباتي"}
                      </button>
                      <button
                        onClick={() => {
                          navigate("/marketplace/my-listings");
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-cream"
                      >
                        <Package className="w-4 h-4" />
                        {language === "en" ? "My Listings" : "قوائمي"}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        {language === "en" ? "Logout" : "تسجيل الخروج"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-cream border border-sage/30"
                    >
                      <User className="w-4 h-4" />
                      {language === "en" ? "Login" : "تسجيل الدخول"}
                    </button>
                    <button
                      onClick={() => {
                        navigate("/register");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-forest text-white hover:bg-forest/90"
                    >
                      <User className="w-4 h-4" />
                      {language === "en" ? "Register" : "إنشاء حساب"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
