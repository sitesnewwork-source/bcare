import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import BcareLogo from "@/assets/Bcare-logo.svg";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top: Logo + Phone + Payment + App stores */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-primary-foreground/15">
          <div className="flex items-center gap-6">
            <img src={BcareLogo} alt="BCare" className="h-10 brightness-0 invert" />
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-cta" />
              <span className="text-xl font-extrabold" dir="ltr">{t.footer.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {["Apple Pay", "Visa", "Mastercard", "مدى", "tabby", "سداد"].map((m) => (
              <span key={m} className="text-[10px] bg-primary-foreground/10 px-2.5 py-1.5 rounded-md text-primary-foreground/70 font-medium">
                {m}
              </span>
            ))}
          </div>

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
          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">{t.footer.aboutBcare}</h4>
            <ul className="space-y-2.5">
              
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.aboutLinks.privacy}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.aboutLinks.terms}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.aboutLinks.careers}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">{t.footer.products}</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.vehicles}</Link></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.medical}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.travel}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.malpractice}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.productLinks.domestic}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">{t.footer.support}</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.supportLinks.blog}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.supportLinks.cancelPolicy}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.supportLinks.ticket}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-cta">{t.footer.importantLinks}</h4>
            <ul className="space-y-2.5">
              <li><a href="https://ia.gov.sa" target="_blank" rel="noopener" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.importantLinksItems.authority}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.importantLinksItems.complaint}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.importantLinksItems.rules}</a></li>
              <li><a href="#" className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors">{t.footer.importantLinksItems.vat}</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/15 pt-6 text-center">
          <p className="text-xs text-primary-foreground/50">
            {new Date().getFullYear()} © {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
