import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Calendar, CreditCard, User, Phone, Link2, Lock, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

import shieldLogo from "@/assets/shield-logo.png";

import heroInsuranceBg from "@/assets/hero-insurance-bg.jpg";
import FloatingParticles from "@/components/FloatingParticles";
import { sounds } from "@/lib/sounds";
import { toast } from "sonner";

const tabs = [
  { id: "new", label: "تأمين جديد" },
  { id: "transfer", label: "نقل ملكية" },
  { id: "renew", label: "تجديد الوثيقة" },
];

const inputClasses =
  "w-full px-3 py-2.5 pr-12 rounded-lg bg-[hsl(168_50%_15%/0.06)] backdrop-blur-sm border-2 border-primary-foreground/15 text-primary-foreground text-[13px] font-medium placeholder:text-primary-foreground/60 focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/30 transition-all";

const desktopInputClasses =
  "w-full px-4 py-3.5 rounded-[5px] bg-[hsl(168_50%_15%)] border-2 border-primary-foreground/20 text-primary-foreground text-sm font-medium placeholder:text-primary-foreground/60 focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/30 transition-all";

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [queryType, setQueryType] = useState<"serial" | "customs">("serial");
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  // Form state
  const [heroForm, setHeroForm] = useState({
    national_id: "",
    name: "",
    phone: "",
    serial_number: "",
    seller_id: "",
    birth_date: "",
    policy_start_date: "",
    captcha_input: "",
  });

  const updateHero = (field: string, value: string) =>
    setHeroForm((prev) => ({ ...prev, [field]: value }));

  // Validation helpers
  const onlyNumbers = (val: string, max: number) => val.replace(/\D/g, "").slice(0, max);
  const saudiPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length === 1 && digits !== "0") return heroForm.phone;
    if (digits.length >= 2 && !digits.startsWith("05")) return heroForm.phone;
    return digits.slice(0, 10);
  };
  const saudiId = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (!/^[12]/.test(digits)) return heroForm.national_id; // reject if not starting with 1 or 2
    return digits.slice(0, 10);
  };
  const onlyArabicText = (val: string) => val.replace(/[^a-zA-Zا-يأإآؤئةءًٌٍَُِّْ\s]/g, "");

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((p) => ({ ...p, [f]: true }));

  const getError = (field: string): string | null => {
    if (!touched[field]) return null;
    const v = heroForm[field as keyof typeof heroForm];
    switch (field) {
      case "national_id":
        if (!v) return "مطلوب";
        if (!/^[12]/.test(v)) return "يبدأ بـ 1 أو 2";
        if (v.length < 10) return `${10 - v.length} أرقام متبقية`;
        return null;
      case "name":
        if (!v) return "مطلوب";
        if (v.length < 3) return "قصير جداً";
        return null;
      case "phone":
        if (!v) return "مطلوب";
        if (!/^05/.test(v)) return "يبدأ بـ 05";
        if (v.length < 10) return `${10 - v.length} أرقام متبقية`;
        return null;
      case "seller_id":
        if (!v) return "مطلوب";
        if (!/^[12]/.test(v)) return "يبدأ بـ 1 أو 2";
        if (v.length < 10) return `${10 - v.length} أرقام متبقية`;
        return null;
      default: return null;
    }
  };

  const fieldState = (f: string) => {
    const error = getError(f);
    const valid = !!(touched[f] && !error && heroForm[f as keyof typeof heroForm]);
    return { error, valid };
  };

  const validationMsg = (field: string) => {
    const { error, valid } = fieldState(field);
    if (!touched[field]) return null;
    return (
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-[#FF6B6B] flex items-center gap-1 font-bold mt-1 pr-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            <AlertCircle className="w-3 h-3" />{error}
          </motion.p>
        )}
        {valid && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-[#4ADE80] flex items-center gap-1 font-bold mt-1 pr-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            <CheckCircle2 className="w-3 h-3" />صحيح ✓
          </motion.p>
        )}
      </AnimatePresence>
    );
  };
  const captchaColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FB923C", "#34D399", "#F472B6", "#60A5FA"];
  const generateCaptcha = useCallback(() => {
    return Math.floor(1000 + Math.random() * 9000).toString().split("");
  }, []);
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha);
  const refreshCaptcha = () => setCaptchaCode(generateCaptcha());

  const handleSubmit = () => {
    // Validate captcha
    if (heroForm.captcha_input !== captchaCode.join("")) {
      toast.error("رمز التحقق غير صحيح، حاول مرة أخرى");
      refreshCaptcha();
      updateHero("captcha_input", "");
      return;
    }
    navigate(`/insurance-request?type=${activeTab}`, {
      state: {
        national_id: heroForm.national_id,
        full_name: heroForm.name,
        phone: heroForm.phone,
        serial_number: heroForm.serial_number,
        seller_id: heroForm.seller_id,
        birth_date: heroForm.birth_date,
      },
    });
  };

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] overflow-hidden">
      <motion.img src={heroInsuranceBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1080} height={1920}
        style={{ y: parallaxY, scale: 1.15, objectPosition: "center 0%" }} />
      <div className="absolute inset-0 bg-primary/40" />
      <FloatingParticles count={25} />

      {/* ===== MOBILE: Form directly on dark bg ===== */}
      <div className="lg:hidden relative z-10 pt-14 pb-24 px-4">
        {/* Shield Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-2"
        >
          <img src={shieldLogo} alt="درع الحماية" width={60} height={60} className="drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" style={{ filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.4)) drop-shadow(0 0 30px rgba(212,175,55,0.2))' }} />
        </motion.div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-[hsl(168_50%_15%/0.6)] backdrop-blur-sm border border-primary-foreground/10 overflow-hidden mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); sounds.tabSwitch(); toast.success(`تم اختيار: ${tab.label}`, { icon: "✅", duration: 1500 }); }}
              className={`flex-1 text-sm font-bold py-3 transition-all ${
                activeTab === tab.id
                  ? "bg-cta text-cta-foreground"
                  : "bg-transparent text-primary-foreground/50 hover:text-primary-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-2.5"
          >
          {/* تأمين جديد */}
          {activeTab === "new" && (
            <>
              <div>
                <div className="relative">
                  <input type="text" placeholder="رقم الهوية الوطنية / الإقامة" className={inputClasses}
                    value={heroForm.national_id} inputMode="numeric" maxLength={10}
                    onChange={(e) => { touch("national_id"); updateHero("national_id", saudiId(e.target.value)); }} />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
                </div>
                {validationMsg("national_id")}
              </div>
              <div>
                <div className="relative">
                  <input type="text" placeholder="اسم صاحب المستند" className={inputClasses}
                    value={heroForm.name}
                    onChange={(e) => { touch("name"); updateHero("name", onlyArabicText(e.target.value)); }} />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
                </div>
                {validationMsg("name")}
              </div>
              <div>
                <div className="relative">
                  <input type="tel" placeholder="رقم الجوال" className={`${inputClasses} pl-[4.5rem] text-right`}
                    value={heroForm.phone} inputMode="numeric" maxLength={10}
                    onChange={(e) => { touch("phone"); updateHero("phone", saudiPhone(e.target.value)); }} />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary-foreground/50 border-r border-primary-foreground/15 pr-3">966+</span>
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
                </div>
                {validationMsg("phone")}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setQueryType("serial"); sounds.click(); toast.success("تم اختيار: استعلام", { icon: "✅", duration: 1500 }); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    queryType === "serial"
                      ? "bg-cta text-cta-foreground"
                      : "bg-[hsl(168_50%_15%)] border border-primary-foreground/10 text-primary-foreground/60"
                  }`}
                >
                  استعلام
                </button>
                <button
                  onClick={() => { setQueryType("customs"); sounds.click(); toast.success("تم اختيار: بطاقة جمركية", { icon: "✅", duration: 1500 }); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    queryType === "customs"
                      ? "bg-cta text-cta-foreground"
                      : "bg-[hsl(168_50%_15%)] border border-primary-foreground/10 text-primary-foreground/60"
                  }`}
                >
                  بطاقة جمركية
                </button>
              </div>
              <div className="relative">
                <input type="text" placeholder="الرقم التسلسلي" className={inputClasses}
                  value={heroForm.serial_number}
                  onChange={(e) => updateHero("serial_number", e.target.value)} />
                <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
              </div>
            </>
          )}

          {/* نقل ملكية */}
          {activeTab === "transfer" && (
            <>
              <div className="relative">
                <input type="text" placeholder="الرقم التسلسلي" className={inputClasses}
                  value={heroForm.serial_number}
                  onChange={(e) => updateHero("serial_number", e.target.value)} />
                <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
              </div>
              <div>
                <div className="relative">
                  <input type="text" placeholder="رقم هوية/إقامة البائع" className={inputClasses}
                    value={heroForm.seller_id} inputMode="numeric" maxLength={10}
                    onChange={(e) => { touch("seller_id"); updateHero("seller_id", onlyNumbers(e.target.value, 10)); }} />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
                </div>
                {validationMsg("seller_id")}
              </div>
              <div>
                <div className="relative">
                  <input type="text" placeholder="رقم الهوية/الإقامة الخاصة بك" className={inputClasses}
                    value={heroForm.national_id} inputMode="numeric" maxLength={10}
                    onChange={(e) => { touch("national_id"); updateHero("national_id", saudiId(e.target.value)); }} />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
                </div>
                {validationMsg("national_id")}
              </div>
              <div>
                <div className="relative">
                  <input type="tel" placeholder="رقم الجوال" className={`${inputClasses} pl-[4.5rem] text-right`}
                    value={heroForm.phone} inputMode="numeric" maxLength={10}
                    onChange={(e) => { touch("phone"); updateHero("phone", saudiPhone(e.target.value)); }} />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary-foreground/50 border-r border-primary-foreground/15 pr-3">966+</span>
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
                </div>
                {validationMsg("phone")}
              </div>
              <div className="relative">
                <input type="text" placeholder="تاريخ الميلاد" className={inputClasses}
                  value={heroForm.birth_date}
                  onChange={(e) => updateHero("birth_date", e.target.value)} />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
              </div>
              <div className="relative">
                <input type="text" placeholder="تاريخ بدء الوثيقة" className={inputClasses}
                  value={heroForm.policy_start_date}
                  onChange={(e) => updateHero("policy_start_date", e.target.value)} />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
              </div>
            </>
          )}

          {/* تجديد الوثيقة */}
          {activeTab === "renew" && (
            <>
              <div>
                <div className="relative">
                  <input type="text" placeholder="رقم الهوية/الإقامة الخاصة بك" className={inputClasses}
                    value={heroForm.national_id} inputMode="numeric" maxLength={10}
                    onChange={(e) => { touch("national_id"); updateHero("national_id", saudiId(e.target.value)); }} />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
                </div>
                {validationMsg("national_id")}
              </div>
              <div>
                <div className="relative">
                  <input type="tel" placeholder="رقم الجوال" className={`${inputClasses} pl-[4.5rem] text-right`}
                    value={heroForm.phone} inputMode="numeric" maxLength={10}
                    onChange={(e) => { touch("phone"); updateHero("phone", saudiPhone(e.target.value)); }} />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary-foreground/50 border-r border-primary-foreground/15 pr-3">966+</span>
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
                </div>
                {validationMsg("phone")}
              </div>
              <div className="relative">
                <input type="text" placeholder="تاريخ الميلاد" className={inputClasses}
                  value={heroForm.birth_date}
                  onChange={(e) => updateHero("birth_date", e.target.value)} />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
              </div>
            </>
          )}

          {/* رمز التحقق */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <input type="text" placeholder="رمز التحقق" className={inputClasses}
                value={heroForm.captcha_input} inputMode="numeric" maxLength={4}
                onChange={(e) => updateHero("captcha_input", onlyNumbers(e.target.value, 4))} />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cta/60" />
            </div>
            <div className="flex items-center gap-2 bg-[hsl(168_50%_15%)] border border-cta/40 rounded-xl px-4 py-3">
              <span className="flex items-center gap-1.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                {captchaCode.map((d, i) => <span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>)}
              </span>
              <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-primary-foreground/50 hover:text-cta transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button onClick={() => { handleSubmit(); sounds.submit(); }} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover text-base py-5 rounded-2xl font-bold btn-glow">
            عرض العروض
          </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===== DESKTOP: Right side content ===== */}
      <div className="hidden lg:flex relative z-10 min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:mr-auto lg:w-[52%] lg:pr-8">
            {/* Tawuniya badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end mb-6"
            >
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 px-5 py-2.5 rounded-full">
                <Shield className="w-5 h-5 text-cta" />
                <span className="text-xs text-primary-foreground/80">تابعة ل</span>
                <span className="text-sm font-bold text-primary-foreground">التعاونية</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-right mb-8"
            >
              <p className="text-cta font-semibold text-lg mb-2">تأمين السيارات</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                احمِ مركبتك!
              </h1>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex rounded-xl bg-[hsl(168_50%_15%)] border border-primary-foreground/10 overflow-hidden mb-5"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); sounds.tabSwitch(); toast.success(`تم اختيار: ${tab.label}`, { icon: "✅", duration: 1500 }); }}
                  className={`flex-1 text-sm font-bold py-3 transition-all ${
                    activeTab === tab.id
                      ? "bg-cta text-cta-foreground"
                      : "bg-transparent text-primary-foreground/60 hover:text-primary-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Desktop Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* تأمين جديد */}
              {activeTab === "new" && (
                <>
                  <input type="text" placeholder="الرقم التسلسلي/ بطاقة جمركية" className={desktopInputClasses}
                    value={heroForm.serial_number} onChange={(e) => updateHero("serial_number", e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input type="text" placeholder="رقم الهوية/الإقامة الخاصة بك" className={desktopInputClasses}
                        value={heroForm.national_id} inputMode="numeric" maxLength={10}
                        onChange={(e) => { touch("national_id"); updateHero("national_id", saudiId(e.target.value)); }} />
                      {validationMsg("national_id")}
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="تاريخ الميلاد" className={desktopInputClasses}
                        value={heroForm.birth_date} onChange={(e) => updateHero("birth_date", e.target.value)} />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cta/60" />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <input type="tel" placeholder="رقم الجوال" className={`${desktopInputClasses} pl-[4.5rem] text-right`}
                        value={heroForm.phone} inputMode="numeric" maxLength={10}
                        onChange={(e) => { touch("phone"); updateHero("phone", saudiPhone(e.target.value)); }} />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary-foreground/50 border-r border-primary-foreground/15 pr-3">966+</span>
                    </div>
                    {validationMsg("phone")}
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="تاريخ بدء الوثيقة" className={desktopInputClasses}
                      value={heroForm.policy_start_date} onChange={(e) => updateHero("policy_start_date", e.target.value)} />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cta/60" />
                  </div>
                </>
              )}

              {/* نقل ملكية */}
              {activeTab === "transfer" && (
                <>
                  <input type="text" placeholder="الرقم التسلسلي" className={desktopInputClasses}
                    value={heroForm.serial_number} onChange={(e) => updateHero("serial_number", e.target.value)} />
                  <div>
                    <input type="text" placeholder="رقم هوية/إقامة البائع" className={desktopInputClasses}
                      value={heroForm.seller_id} inputMode="numeric" maxLength={10}
                      onChange={(e) => { touch("seller_id"); updateHero("seller_id", onlyNumbers(e.target.value, 10)); }} />
                    {validationMsg("seller_id")}
                  </div>
                  <div>
                    <input type="text" placeholder="رقم الهوية/الإقامة الخاصة بك" className={desktopInputClasses}
                      value={heroForm.national_id} inputMode="numeric" maxLength={10}
                      onChange={(e) => { touch("national_id"); updateHero("national_id", saudiId(e.target.value)); }} />
                    {validationMsg("national_id")}
                  </div>
                  <div>
                    <div className="relative">
                      <input type="tel" placeholder="رقم الجوال" className={`${desktopInputClasses} pl-[4.5rem] text-right`}
                        value={heroForm.phone} inputMode="numeric" maxLength={10}
                        onChange={(e) => { touch("phone"); updateHero("phone", saudiPhone(e.target.value)); }} />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary-foreground/50 border-r border-primary-foreground/15 pr-3">966+</span>
                    </div>
                    {validationMsg("phone")}
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="تاريخ الميلاد" className={desktopInputClasses}
                      value={heroForm.birth_date} onChange={(e) => updateHero("birth_date", e.target.value)} />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cta/60" />
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="تاريخ بدء الوثيقة" className={desktopInputClasses}
                      value={heroForm.policy_start_date} onChange={(e) => updateHero("policy_start_date", e.target.value)} />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cta/60" />
                  </div>
                </>
              )}

              {/* تجديد الوثيقة */}
              {activeTab === "renew" && (
                <>
                  <div>
                    <input type="text" placeholder="رقم الهوية/الإقامة الخاصة بك" className={desktopInputClasses}
                      value={heroForm.national_id} inputMode="numeric" maxLength={10}
                      onChange={(e) => { touch("national_id"); updateHero("national_id", saudiId(e.target.value)); }} />
                    {validationMsg("national_id")}
                  </div>
                  <div>
                    <div className="relative">
                      <input type="tel" placeholder="رقم الجوال" className={`${desktopInputClasses} pl-[4.5rem] text-right`}
                        value={heroForm.phone} inputMode="numeric" maxLength={10}
                        onChange={(e) => { touch("phone"); updateHero("phone", saudiPhone(e.target.value)); }} />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary-foreground/50 border-r border-primary-foreground/15 pr-3">966+</span>
                    </div>
                    {validationMsg("phone")}
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="تاريخ الميلاد" className={desktopInputClasses}
                      value={heroForm.birth_date} onChange={(e) => updateHero("birth_date", e.target.value)} />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cta/60" />
                  </div>
                </>
              )}

              {/* رمز التحقق */}
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <input type="text" placeholder="رمز التحقق" className={desktopInputClasses}
                    value={heroForm.captcha_input} inputMode="numeric" maxLength={4}
                    onChange={(e) => updateHero("captcha_input", onlyNumbers(e.target.value, 4))} />
                </div>
                <div className="flex items-center gap-2 bg-[hsl(168_50%_15%)] border border-cta/40 rounded-xl px-4 py-3">
                  <span className="flex items-center gap-1.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                    {captchaCode.map((d, i) => <span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>)}
                  </span>
                  <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-primary-foreground/50 hover:text-cta transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-primary-foreground/60 cursor-pointer py-1">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-cta rounded" />
                <span>
                  بالمتابعة، أقر بقراءة وفهم وقبول{" "}
                  <a href="#" className="text-cta underline hover:text-cta-hover">إشعار الخصوصية</a>{" "}
                  لشركة تري الرقمية لوكالة التأمين
                </span>
              </label>

              <Button onClick={() => { handleSubmit(); sounds.submit(); }} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover text-base py-6 rounded-xl font-bold btn-glow">
                عرض العروض
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
