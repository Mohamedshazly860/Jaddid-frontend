// Jaddid-frontend/src/components/landing/Navbar.jsx
import { useState } from 'react';
import { Menu, X, Globe, Recycle, Bell, User, LogOut, UserCircle, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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



export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [notificationCount] = useState(3); // يمكن تغييره لاحقاً من API

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-sage/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 bg-forest rounded-xl flex items-center justify-center shadow-lg">
              <Recycle className="w-7 h-7 text-white" />
            </div>
            <span className={`text-2xl font-bold text-foreground ${isRTL ? 'font-arabic' : 'font-primary'}`}>
              {isRTL ? 'جدد' : 'Jaddid'}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link to="/" className="text-forest hover:text-orange transition-colors font-medium">
              {t('nav.home')}
            </Link>
            <Link to="/marketplace" className="text-muted-foreground hover:text-forest transition-colors font-medium">
              {t('nav.marketplace')}
            </Link>
            <Link to="/marketplace/orders" className="text-muted-foreground hover:text-forest transition-colors font-medium">
              {t('nav.orders')}
            </Link>
            <Link to="/marketplace/favorites" className="text-muted-foreground hover:text-forest transition-colors font-medium">
              {t('nav.profile')}
            </Link>
          </div>

          {/* Actions */}
          <div className={`hidden md:flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-sage/30 hover:bg-cream transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative p-2 rounded-full hover:bg-cream transition-colors">
                      <Bell className="w-5 h-5 text-forest" />
                      {notificationCount > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange text-white text-xs"
                        >
                          {notificationCount}
                        </Badge>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>
                      {language === 'en' ? 'Notifications' : 'الإشعارات'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      <DropdownMenuItem>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">New order received</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">Payment confirmed</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">Product approved</p>
                          <p className="text-xs text-muted-foreground">3 hours ago</p>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-sage/30 hover:bg-cream transition-colors">
                      <UserCircle className="w-5 h-5 text-forest" />
                      <span className="font-medium text-sm">
                        {user?.first_name || user?.email?.split('@')[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <p className="text-xs text-orange font-medium">{user?.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Profile' : 'الملف الشخصي'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/marketplace/orders')}>
                      <Recycle className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'My Orders' : 'طلباتي'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/marketplace/my-listings')}>
                      <Package className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'My Listings' : 'إعلاناتي'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button className="btn-primary" onClick={() => navigate('/register')}>
                  {t('nav.getStarted')}
                </Button>
                <Button className="btn-primary" onClick={() => navigate('/login')}>
                  {language === 'en' ? 'Login' : 'دخول'}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-sage/20 animate-fade-in-up">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-foreground font-medium py-2">
                {t('nav.home')}
              </Link>
              <Link to="/marketplace" className="text-muted-foreground font-medium py-2">
                {t('nav.marketplace')}
              </Link>
              <Link to="/marketplace/orders" className="text-muted-foreground font-medium py-2">
                {t('nav.orders')}
              </Link>
              <Link to="/marketplace/favorites" className="text-muted-foreground font-medium py-2">
                {t('nav.profile')}
              </Link>

              {/* Mobile Actions */}
              <div className="flex flex-col gap-4 pt-4 border-t border-sage/20">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-sage/30"
                >
                  <Globe className="w-4 h-4" />
                  <span>{language === 'en' ? 'العربية' : 'English'}</span>
                </button>

                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-3 bg-cream rounded-lg">
                      <UserCircle className="w-5 h-5 text-forest" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Button className="btn-secondary w-full" onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Profile' : 'الملف الشخصي'}
                    </Button>
                    <Button 
                      className="btn-primary w-full bg-red-600 hover:bg-red-700" 
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="btn-secondary w-full" onClick={() => navigate('/register')}>
                      {t('nav.getStarted')}
                    </Button>
                    <Button className="btn-primary w-full" onClick={() => navigate('/login')}>
                      {language === 'en' ? 'Login' : 'دخول'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
