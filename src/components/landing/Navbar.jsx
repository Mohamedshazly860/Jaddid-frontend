import { useState } from 'react';
import { Menu, X, Globe, Recycle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
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
              {isRTL ? 'جديد' : 'Jaddid'}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a href="#" className="text-forest hover:text-orange transition-colors font-medium">
              {t('nav.home')}
            </a>
            <a href="#" className="text-muted-foreground hover:text-forest transition-colors font-medium">
              {t('nav.marketplace')}
            </a>
            <a href="#" className="text-muted-foreground hover:text-forest transition-colors font-medium">
              {t('nav.orders')}
            </a>
            <a href="#" className="text-muted-foreground hover:text-forest transition-colors font-medium">
              {t('nav.profile')}
            </a>
          </div>

          {/* Actions */}
          <div className={`hidden md:flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-sage/30 hover:bg-cream transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <Button className="btn-primary">
              {t('nav.getStarted')}
            </Button>
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
              <a href="#" className="text-foreground font-medium py-2">
                {t('nav.home')}
              </a>
              <a href="#" className="text-muted-foreground font-medium py-2">
                {t('nav.marketplace')}
              </a>
              <a href="#" className="text-muted-foreground font-medium py-2">
                {t('nav.orders')}
              </a>
              <a href="#" className="text-muted-foreground font-medium py-2">
                {t('nav.profile')}
              </a>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-sage/30"
                >
                  <Globe className="w-4 h-4" />
                  <span>{language === 'en' ? 'العربية' : 'English'}</span>
                </button>
                <Button className="btn-primary flex-1">
                  {t('nav.getStarted')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
