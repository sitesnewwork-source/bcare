import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Car, Heart, Stethoscope, Plane, Home, RefreshCw, Info } from "lucide-react";
import { sounds } from "@/lib/sounds";
import { toast } from "sonner";

const partnerLogos = [
  { key: "tawuniya", name: "التعاونية", src: "/logos/tawuniya.svg" },
  { key: "alrajhi", name: "الراجحي", src: "/logos/alrajhi.svg" },
  { key: "allianz", name: "أليانز", src: "/logos/allianz.svg" },
  { key: "amana", name: "أمانة", src: "/logos/amana.svg" },
  { key: "aljazira", name: "الجزيرة", src: "/logos/aljazira.svg" },
  { key: "medgulf", name: "ميدغلف", src: "/logos/medgulf.svg" },
  { key: "ggi", name: "GIG", src: "/logos/ggi.svg" },
  { key: "acig", name: "ACIG", src: "/logos/acig.svg" },
  { key: "arabianshield", name: "الدرع العربي", src: "/logos/arabianshield.svg" },
  { key: "uca", name: "UCA", src: "/logos/uca.svg" },
  { key: "axa", name: "AXA", src: "/logos/axa.svg" },
  { key: "bupa", name: "بوبا", src: "/logos/bupa.svg" },
];

const insuranceTabs = [
  { id: "vehicles", label: "مركبات", icon: Car },
  { id: "medical", label: "طبي", icon: Heart },
  { id: "malpractice", label: "اخطاء طبية", icon: Stethoscope },
  { id: "travel", label: "سفر", icon: Plane },
  { id: "domestic", label: "العمالة المنزلية", icon: Home },
];

const captchaColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FB923C", "#34D399", "#F472B6", "#60A5FA"];

const HeroSection = () => {
  const [activeInsurance, setActiveInsurance] = useState("vehicles");
  const [purposeType, setPurposeType] = useState<"new" | "transfer">("new");
  const [registrationType, setRegistrationType] = useState<"form" | "customs">("form");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    national_id: "",
    serial_number: "",
    captcha_input: "",
  });

  const upd = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  const onlyNumbers = (val: string, max: number) => val.replace(/\D/g, "").slice(0, max);
  const saudiId = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (!/^[12]/.test(digits)) return form.national_id;
    return digits.slice(0, 10);
  };

  const [agreed, setAgreed] = useState(false);

  const generateCaptcha = useCallback(() => {
    return Math.floor(1000 + Math.random() * 9000).toString().split("");
  }, []);
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha);
  const refreshCaptcha = () => setCaptchaCode(generateCaptcha());

  const handleSubmit = () => {
    if (!form.national_id || form.national_id.length < 10) {
      toast.error("أدخل رقم الهوية / الإقامة");
      return;
    }
    if (!form.serial_number) {
      toast.error("أدخل الرقم التسلسلي");
      return;
    }
    if (form.captcha_input !== captchaCode.join("")) {
      toast.error("رمز التحقق غير صحيح");
      refreshCaptcha();
      upd("captcha_input", "");
      return;
    }
    if (!agreed) {
      toast.error("يرجى الموافقة على منح حق الاستعلام");
      return;
    }

    navigate(`/insurance-request?type=${purposeType}`, {
      state: {
        national_id: form.national_id,
        serial_number: form.serial_number,
      },
    });
  };

  const inputCls = "w-full h-12 px-4 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  return (
    <section className="relative">
      {/* Hero gradient background with SVG decorations */}
      <div className="gradient-hero relative overflow-hidden">
        {/* Decorative SVG shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="absolute top-8 right-8 w-64 h-64 text-primary-foreground" viewBox="0 0 200 200" fill="currentColor">
            <circle cx="100" cy="100" r="80" fillOpacity="0.15" />
            <circle cx="100" cy="100" r="60" fillOpacity="0.1" />
          </svg>
          <svg className="absolute bottom-8 left-8 w-48 h-48 text-primary-foreground" viewBox="0 0 200 200" fill="currentColor">
            <circle cx="100" cy="100" r="70" fillOpacity="0.12" />
          </svg>
        </div>

        <div className="section-container relative z-10 py-14 lg:py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl lg:text-[2.75rem] font-extrabold text-primary-foreground leading-tight mb-4 max-w-4xl mx-auto"
          >
            المنصة الأذكى لمقارنة عروض تأمين السيارات في السعودية
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed"
          >
            المنصة الأذكى لمقارنة عروض أكثر من 20 شركة تأمين. احصل على أرخص تأمين سيارات مع إصدار فوري وربط مباشر بنجم.
          </motion.p>
        </div>
      </div>

      {/* White card overlapping hero */}
      <div className="section-container relative z-20 -mt-6">
        <div className="bg-card rounded-t-2xl shadow-xl border border-border overflow-hidden max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center justify-center border-b border-border bg-muted/30">
            {insuranceTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeInsurance === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveInsurance(tab.id);
                    sounds.tabSwitch();
                  }}
                  className={`flex flex-col items-center gap-1 px-4 md:px-6 py-3.5 text-xs md:text-sm font-bold transition-all border-b-[3px] min-w-[70px] md:min-w-[90px] ${
                    active
                      ? "text-primary border-primary bg-background"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${active ? "text-primary" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form area */}
          <div className="p-6 md:p-8 bg-card">
            <AnimatePresence mode="wait">
              {activeInsurance === "vehicles" ? (
                <motion.div
                  key="vehicles-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {/* Row 1: ID + Purpose + Registration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <div>
                      <label className="text-sm font-bold text-foreground mb-2 block">رقم الهوية / الإقامة</label>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="رقم الهوية / الإقامة"
                        value={form.national_id}
                        inputMode="numeric"
                        maxLength={10}
                        onChange={(e) => upd("national_id", saudiId(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-foreground mb-2 block">الغرض من التأمين</label>
                      <div className="flex gap-2">
                        <button onClick={() => setPurposeType("new")} className={`flex-1 h-12 rounded-lg border text-sm font-semibold transition-all ${purposeType === "new" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                          تأمين جديد
                        </button>
                        <button onClick={() => setPurposeType("transfer")} className={`flex-1 h-12 rounded-lg border text-sm font-semibold transition-all ${purposeType === "transfer" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                          نقل ملكية
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-foreground mb-2 block">نوع تسجيل المركبة</label>
                      <div className="flex gap-2">
                        <button onClick={() => setRegistrationType("form")} className={`flex-1 h-12 rounded-lg border text-sm font-semibold transition-all ${registrationType === "form" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                          استمارة
                        </button>
                        <button onClick={() => setRegistrationType("customs")} className={`flex-1 h-12 rounded-lg border text-sm font-semibold transition-all ${registrationType === "customs" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                          بطاقة جمركية
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Serial + Captcha + Button */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                    <div>
                      <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-1">
                        الرقم التسلسلي
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </label>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="الرقم التسلسلي"
                        value={form.serial_number}
                        onChange={(e) => upd("serial_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-foreground mb-2 block">رمز التحقق</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className={`${inputCls} flex-1`}
                          placeholder="رمز التحقق"
                          value={form.captcha_input}
                          inputMode="numeric"
                          maxLength={4}
                          onChange={(e) => upd("captcha_input", onlyNumbers(e.target.value, 4))}
                        />
                        <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-3 h-12">
                          <span className="flex items-center gap-0.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                            {captchaCode.map((d, i) => (
                              <span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>
                            ))}
                          </span>
                          <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-muted-foreground hover:text-primary transition-colors mr-1">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        onClick={() => { handleSubmit(); sounds.submit(); }}
                        className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg"
                      >
                        إظهار العروض
                      </Button>
                    </div>
                  </div>

                  {/* Agreement */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <label htmlFor="agree" className="text-xs text-muted-foreground cursor-pointer">
                      أوافق على منح حق الاستعلام
                    </label>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="other-insurance"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const tab = insuranceTabs.find(t => t.id === activeInsurance);
                      const Icon = tab?.icon || Car;
                      return <Icon className="w-8 h-8 text-primary" />;
                    })()}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {insuranceTabs.find(t => t.id === activeInsurance)?.label}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5">قريباً! نعمل على إضافة هذا النوع من التأمين</p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveInsurance("vehicles")}
                    className="rounded-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    العودة لتأمين المركبات
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Partners strip integrated below the form card */}
      <div className="bg-background pt-0 pb-4">
        <div className="section-container">
          <div className="max-w-4xl mx-auto bg-card rounded-b-2xl shadow-xl border border-t-0 border-border px-6 py-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* مصرح من */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-sm text-foreground">مصرح من:</span>
                <div className="flex items-center gap-2">
                  <img src="/logos/ia.svg" alt="هيئة التأمين" className="h-10" />
                  <img src="/logos/23companies.svg" alt="23 شركة تأمين" className="h-10" />
                </div>
              </div>

              {/* Company logos marquee */}
              <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent z-10" />
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent z-10" />
                <div className="flex animate-marquee gap-4 items-center">
                  {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                    <img key={`${logo.key}-${i}`} src={logo.src} alt={logo.name} className="h-9 shrink-0 opacity-70 hover:opacity-100 transition-opacity" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
