import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import BcareLogo from "@/assets/Bcare-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Logo & Contact */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <img src={BcareLogo} alt="BCare" className="h-9 brightness-0 invert" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-cta" />
              <span className="text-sm font-bold" dir="ltr">8001180044</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cta" />
              <span className="text-sm">info@bcare.com.sa</span>
            </div>
          </div>

          {/* عن بي كير */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">عن بي كير</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">عن الشركة</Link></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">الشروط والأحكام</a></li>
            </ul>
          </div>

          {/* منتجاتنا */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">منتجاتنا</h4>
            <ul className="space-y-2.5">
              <li><Link to="/insurance/comprehensive" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">تأمين المركبات</Link></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">التأمين الطبي</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">تأمين السفر</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">تأمين الأخطاء الطبية</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">تأمين العمالة المنزلية</a></li>
            </ul>
          </div>

          {/* الدعم */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">الدعم الفني</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">المدونة</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">رفع تذكرة</a></li>
              <li><Link to="/verify" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">اطبع وثيقتك</Link></li>
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-primary-foreground/15 pt-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["Apple Pay", "Visa", "Mastercard", "مدى", "سداد", "tabby"].map((method) => (
              <span key={method} className="text-xs bg-primary-foreground/10 px-3 py-1.5 rounded-lg text-primary-foreground/70 font-medium">
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} جميع الحقوق محفوظة، شركة عناية الوسيط لوساطة التأمين
          </p>
          <div className="flex gap-4">
            {["facebook", "instagram", "linkedin", "x", "whatsapp", "youtube"].map((s) => (
              <a key={s} href="#" className="text-xs text-primary-foreground/40 hover:text-primary-foreground transition-colors capitalize">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;