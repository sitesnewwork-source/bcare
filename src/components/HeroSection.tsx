import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Car, Heart, Stethoscope, Plane, Home, CreditCard, Link2, Lock, RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { sounds } from "@/lib/sounds";
import { toast } from "sonner";

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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((p) => ({ ...p, [f]: true }));
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

  const inputCls = "w-full h-12 px-4 rounded-lg bg-background border-2 border-border text-foreground text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="gradient-hero py-16 lg:py-24">
          <div className="section-container relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground leading-tight mb-4"
            >
              المنصة الأذكى لمقارنة عروض تأمين السيارات في السعودية
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-primary-foreground/80 max-w-2xl mx-auto"
            >
              المنصة الأذكى لمقارنة عروض أكثر من 20 شركة تأمين. احصل على أرخص تأمين سيارات مع إصدار فوري وربط مباشر بنجم.
            </motion.p>
          </div>
        </div>

        {/* Insurance Tabs */}
        <div className="bg-background border-b border-border">
          <div className="section-container">
            <div className="flex items-center justify-center gap-1 -mt-0 overflow-x-auto pb-0">
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
                    className={`flex flex-col items-center gap-1.5 px-5 py-4 text-sm font-bold transition-all border-b-3 min-w-[90px] ${
                      active
                        ? "text-primary border-b-[3px] border-primary"
                        : "text-muted-foreground border-b-[3px] border-transparent hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-background py-8">
          <div className="section-container">
            <AnimatePresence mode="wait">
              {activeInsurance === "vehicles" ? (
                <motion.div
                  key="vehicles-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl mx-auto"
                >
                  {/* Purpose & Registration toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* الغرض من التأمين */}
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">الغرض من التأمين</label>
                      <div className="flex gap-3">
                        <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all flex-1 ${purposeType === "new" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <input type="radio" name="purpose" checked={purposeType === "new"} onChange={() => setPurposeType("new")} className="accent-primary" />
                          <span className="text-sm font-semibold">تأمين جديد</span>
                        </label>
                        <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all flex-1 ${purposeType === "transfer" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <input type="radio" name="purpose" checked={purposeType === "transfer"} onChange={() => setPurposeType("transfer")} className="accent-primary" />
                          <span className="text-sm font-semibold">نقل ملكية</span>
                        </label>
                      </div>
                    </div>

                    {/* رقم الهوية */}
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">رقم الهوية / الإقامة</label>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="رقم الهوية / الإقامة"
                        value={form.national_id}
                        inputMode="numeric"
                        maxLength={10}
                        onChange={(e) => { touch("national_id"); upd("national_id", saudiId(e.target.value)); }}
                      />
                    </div>

                    {/* نوع التسجيل */}
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">نوع تسجيل المركبة</label>
                      <div className="flex gap-3">
                        <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all flex-1 ${registrationType === "form" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <input type="radio" name="reg" checked={registrationType === "form"} onChange={() => setRegistrationType("form")} className="accent-primary" />
                          <span className="text-sm font-semibold">استمارة</span>
                        </label>
                        <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all flex-1 ${registrationType === "customs" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <input type="radio" name="reg" checked={registrationType === "customs"} onChange={() => setRegistrationType("customs")} className="accent-primary" />
                          <span className="text-sm font-semibold">بطاقة جمركية</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Serial + Captcha + Agreement row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* الرقم التسلسلي */}
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 flex items-center gap-1">
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

                    {/* رمز التحقق */}
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">رمز التحقق</label>
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
                        <div className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 h-12">
                          <span className="flex items-center gap-1 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                            {captchaCode.map((d, i) => (
                              <span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>
                            ))}
                          </span>
                          <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-muted-foreground hover:text-primary transition-colors">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Agreement + Button */}
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="w-4 h-4 accent-primary rounded"
                        />
                        <span>أوافق على منح حق الاستعلام</span>
                      </label>
                      <Button
                        onClick={() => { handleSubmit(); sounds.submit(); }}
                        className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg btn-glow"
                      >
                        إظهار العروض
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="other-insurance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-lg mx-auto text-center py-12"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const tab = insuranceTabs.find(t => t.id === activeInsurance);
                      const Icon = tab?.icon || Car;
                      return <Icon className="w-10 h-10 text-primary" />;
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {insuranceTabs.find(t => t.id === activeInsurance)?.label}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    قريباً! نعمل على إضافة هذا النوع من التأمين
                  </p>
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
      </section>
    </>
  );
};

export default HeroSection;