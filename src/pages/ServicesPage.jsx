import { Recycle, Package, Truck, CheckCircle, Leaf, Factory, Heart } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesPage = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const processSteps = [
    {
      icon: Package,
      title: isArabic ? 'جمع المواد' : 'Collect Materials',
      description: isArabic 
        ? 'اجمع المواد القابلة لإعادة التدوير من منزلك أو عملك'
        : 'Gather recyclable materials from your home or business',
      svg: '/Asset 7.svg'
    },
    {
      icon: Truck,
      title: isArabic ? 'التسليم أو الشحن' : 'Drop-off or Shipping',
      description: isArabic
        ? 'سلم المواد في نقاط التجميع أو اشحنها إلينا'
        : 'Drop materials at collection points or ship them to us',
      svg: '/Asset 4.svg'
    },
    {
      icon: Factory,
      title: isArabic ? 'إعادة التدوير والتحويل' : 'Recycle & Transform',
      description: isArabic
        ? 'نقوم بمعالجة وتحويل المواد إلى منتجات جديدة'
        : 'We process and transform materials into new products',
      svg: '/Asset 7.svg'
    },
    {
      icon: CheckCircle,
      title: isArabic ? 'البيع والشراء' : 'Buy & Sell',
      description: isArabic
        ? 'تصفح واشترِ منتجات مُعاد تدويرها أو بع موادك'
        : 'Browse and buy recycled products or sell your materials',
      svg: '/Asset 4.svg'
    }
  ];

  const supportedMaterials = [
    {
      name: isArabic ? 'البلاستيك' : 'Plastics',
      description: isArabic 
        ? 'زجاجات، حاويات، أكياس بلاستيكية'
        : 'Bottles, containers, plastic bags',
      image: 'https://images.unsplash.com/photo-1591203376378-8c2b2c5b3c5d?w=500&h=300&fit=crop',
      color: 'bg-blue-100 border-blue-300',
      textColor: 'text-blue-700'
    },
    {
      name: isArabic ? 'الورق والكرتون' : 'Paper & Cardboard',
      description: isArabic
        ? 'جرائد، مجلات، صناديق كرتون'
        : 'Newspapers, magazines, cardboard boxes',
      image: 'https://images.unsplash.com/photo-1594843310804-5946f9f2c7f1?w=500&h=300&fit=crop',
      color: 'bg-amber-100 border-amber-300',
      textColor: 'text-amber-700'
    },
    {
      name: isArabic ? 'المعادن' : 'Metals',
      description: isArabic
        ? 'علب الألمنيوم، النحاس، الحديد'
        : 'Aluminum cans, copper, iron, steel',
      image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&h=300&fit=crop',
      color: 'bg-gray-100 border-gray-400',
      textColor: 'text-gray-700'
    },
    {
      name: isArabic ? 'الزجاج' : 'Glass',
      description: isArabic
        ? 'زجاجات، برطمانات، نوافذ'
        : 'Bottles, jars, windows',
      image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=500&h=300&fit=crop',
      color: 'bg-teal-100 border-teal-300',
      textColor: 'text-teal-700'
    },
    {
      name: isArabic ? 'الإلكترونيات' : 'Electronics',
      description: isArabic
        ? 'هواتف، حواسيب، أجهزة كهربائية'
        : 'Phones, computers, appliances',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&h=300&fit=crop',
      color: 'bg-purple-100 border-purple-300',
      textColor: 'text-purple-700'
    },
    {
      name: isArabic ? 'المنسوجات' : 'Textiles',
      description: isArabic
        ? 'ملابس، أقمشة، سجاد'
        : 'Clothes, fabrics, carpets',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea1c8cce?w=500&h=300&fit=crop',
      color: 'bg-pink-100 border-pink-300',
      textColor: 'text-pink-700'
    }
  ];

  const benefits = [
    {
      icon: Leaf,
      title: isArabic ? 'حماية البيئة' : 'Protect Environment',
      description: isArabic
        ? 'ساهم في تقليل النفايات والحفاظ على كوكبنا'
        : 'Reduce waste and preserve our planet'
    },
    {
      icon: Heart,
      title: isArabic ? 'دعم المجتمع' : 'Support Community',
      description: isArabic
        ? 'شارك في اقتصاد دائري ومستدام'
        : 'Participate in circular, sustainable economy'
    },
    {
      icon: Recycle,
      title: isArabic ? 'اكسب المال' : 'Earn Money',
      description: isArabic
        ? 'احصل على مقابل مادي لموادك القابلة لإعادة التدوير'
        : 'Get paid for your recyclable materials'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-orange text-white px-6 py-2 text-lg">
            {isArabic ? 'خدماتنا' : 'Our Services'}
          </Badge>
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 text-forest ${isArabic ? 'font-arabic' : 'font-primary'}`}>
            {isArabic ? 'كيف نعمل' : 'How We Work'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isArabic 
              ? 'نحن نسهل عملية إعادة التدوير ونحول النفايات إلى قيمة'
              : 'We make recycling easy and turn waste into value'}
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 text-forest ${isArabic ? 'font-arabic' : 'font-primary'}`}>
            {isArabic ? 'عمليتنا' : 'Our Process'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-sage/30">
                <div className="absolute top-4 right-4 w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange">{index + 1}</span>
                </div>
                
                <CardHeader className="pt-8">
                  <div className="mb-4">
                    <img 
                      src={step.svg} 
                      alt={step.title}
                      className="w-32 h-32 mx-auto object-contain"
                    />
                  </div>
                  <CardTitle className={`text-xl text-center ${isArabic ? 'font-arabic' : ''}`}>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-center">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Supported Materials */}
      <div className="py-16 px-4 bg-gradient-to-b from-cream/30 to-white">
        <div className="container mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 text-forest ${isArabic ? 'font-arabic' : 'font-primary'}`}>
            {isArabic ? 'المواد المدعومة' : 'Supported Materials'}
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {isArabic
              ? 'نقبل مجموعة واسعة من المواد القابلة لإعادة التدوير'
              : 'We accept a wide range of recyclable materials'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportedMaterials.map((material, index) => (
              <Card 
                key={index} 
                className={`overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 ${material.color}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={material.image}
                    alt={material.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className={`absolute bottom-4 left-4 ${material.textColor} ${material.color} border-0 text-lg px-4 py-2`}>
                    {material.name}
                  </Badge>
                </div>
                
                <CardContent className="pt-6">
                  <p className="text-gray-600 text-center">
                    {material.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-4 bg-forest text-white">
        <div className="container mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isArabic ? 'font-arabic' : 'font-primary'}`}>
            {isArabic ? 'لماذا جدد؟' : 'Why Jaddid?'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="text-center p-8 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-20 h-20 bg-orange rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${isArabic ? 'font-arabic' : ''}`}>
                    {benefit.title}
                  </h3>
                  <p className="text-cream">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-orange to-yellow-accent text-white">
        <div className="container mx-auto text-center">
          <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${isArabic ? 'font-arabic' : 'font-primary'}`}>
            {isArabic ? 'جاهز للبدء؟' : 'Ready to Start?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {isArabic
              ? 'انضم إلى مجتمعنا وابدأ في تحويل النفايات إلى قيمة'
              : 'Join our community and start turning waste into value'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="/marketplace"
              className="btn-primary bg-forest hover:bg-forest/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              {isArabic ? 'تصفح السوق' : 'Browse Marketplace'}
            </a>
            <a 
              href="/marketplace/sell"
              className="btn-secondary bg-white text-forest px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              {isArabic ? 'ابدأ البيع' : 'Start Selling'}
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServicesPage;
