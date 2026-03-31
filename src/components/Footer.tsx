import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import BcareLogo from "@/assets/Bcare-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top: Logo + Phone + Payment + App stores */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-primary-foreground/15">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <img src={BcareLogo} alt="BCare" className="h-10 brightness-0 invert" />
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-cta" />
              <span className="text-xl font-extrabold" dir="ltr">8001180044</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            {["Apple Pay", "Visa", "Mastercard", "مدى", "tabby", "سداد"].map((m) => (
              <span key={m} className="text-[10px] bg-primary-foreground/10 px-2.5 py-1.5 rounded-md text-primary-foreground/70 font-medium">
                {m}
              </span>
            ))}
          </div>

          {/* App Stores */}
          <div className="flex items-center gap-2">
            {["Google Play", "App Store", "AppGallery"].map((store) => (
              <span key={store} className="text-[10px] bg-primary-foreground/10 px-3 py-2 rounded-lg text-primary-foreground/60 font-medium">
                {store}
              </span>
            ))}
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* عن بي كير */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">عن بي كير</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">خصومات وريف</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">الشروط والأحكام</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">وظائف</a></li>
            </ul>
          </div>

          {/* منتجاتنا */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">منتجاتنا</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">تأمين المركبات</Link></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">التأمين الطبي</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">تأمين السفر</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">تأمين الأخطاء الطبية</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">تأمين العمالة المنزلية</a></li>
            </ul>
          </div>

          {/* الدعم الفني */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">الدعم الفني</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">المدونة</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">إلغاء وثيقتك</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">رفع تذكرة</a></li>
            </ul>
          </div>

          {/* روابط مهمة */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">روابط مهمة</h4>
            <ul className="space-y-2.5">
              <li><a href="https://ia.gov.sa" target="_blank" rel="noopener" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">هيئة التأمين</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">طريقة رفع شكوى لهيئة التأمين</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">قواعد ولوائح هيئة التأمين</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">شهادة ضريبة القيمة المضافة</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/15 pt-6 text-center">
          <p className="text-xs text-primary-foreground/50">
            {new Date().getFullYear()} © جميع الحقوق محفوظة، شركة عناية الوسيط لوساطة التأمين
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
