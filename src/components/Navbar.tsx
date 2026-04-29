import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import BcareLogo from "@/assets/Bcare-logo.svg";

const Navbar = () => {
  const { lang, setLang, t } = useLanguage();
  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  return (
    <nav className="sticky top-0 z-50 bg-background border-b-[3px] border-primary">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <img src={BcareLogo} alt="BCare" className="h-11 md:h-12" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {t.nav.langSwitch}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
