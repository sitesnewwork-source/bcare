import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Car, Heart, Stethoscope, Plane, Home, RefreshCw, Info, Calendar } from "lucide-react";
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

const heroContent: Record<string, { title: string; subtitle: string }> = {
  vehicles: {
    title: "المنصة الأذكى لمقارنة عروض تأمين السيارات في السعودية",
    subtitle: "المنصة الأذكى لمقارنة عروض أكثر من 20 شركة تأمين. احصل على أرخص تأمين سيارات مع إصدار فوري وربط مباشر بنجم.",
  },
  medical: {
    title: "المنصة الأذكى لمقارنة عروض التأمين الطبي (للشركات والمنشآت) في السعودية",
    subtitle: "المنصة الأذكى لمقارنة أفضل شركات التأمين الطبي. احصل على أرخص تأمين للشركات والمنشآت، مع إصدار فوري وربط مباشر بمجلس الضمان الصحي.",
  },
  malpractice: {
    title: "المنصة الأذكى لمقارنة عروض تأمين الأخطاء الطبية لممارس بلس في السعودية",
    subtitle: "المنصة الأذكى لمقارنة عروض الحماية المهنية. احصل على أرخص تأمين أخطاء طبية (ممارس بلس) مع تغطية شاملة ومعتمدة لدى هيئة التخصصات الطبية.",
  },
  travel: {
    title: "المنصة الأذكى لمقارنة عروض تأمين السفر لشنغن والعالم في السعودية",
    subtitle: "المنصة الأذكى لمقارنة عروض السفر العالمية. احصل على أرخص تأمين سفر (شنغن ودولي) مع شهادة معتمدة للسفارات وتغطية فورية.",
  },
  domestic: {
    title: "المنصة الأذكى لمقارنة عروض التأمين الطبي للعمالة المنزلية في السعودية",
    subtitle: "المنصة الأذكى لمقارنة خيارات تأمين العمالة. احصل على أرخص تأمين طبي للعمالة المنزلية لحفظ حقوقك، مع ربط مباشر بمجلس الضمان الصحي.",
  },
};

const captchaColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FB923C", "#34D399", "#F472B6", "#60A5FA"];

interface HeroSectionProps {
  onTabChange?: (tab: string) => void;
}

const HeroSection = ({ onTabChange }: HeroSectionProps) => {
  const [activeInsurance, setActiveInsurance] = useState("vehicles");
  const [purposeType, setPurposeType] = useState<"new" | "transfer">("new");
  const [registrationType, setRegistrationType] = useState<"form" | "customs">("form");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    national_id: "",
    serial_number: "",
    captcha_input: "",
    start_date: "",
    commercial_reg: "",
    passport_number: "",
    destination: "",
    travel_start: "",
    travel_end: "",
    worker_id: "",
    worker_nationality: "",
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

  const validateAndSubmit = () => {
    if (!form.national_id || form.national_id.length < 10) {
      toast.error("أدخل رقم الهوية / الإقامة");
      return;
    }
    if (activeInsurance === "vehicles" && !form.serial_number) {
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
        insurance_type: activeInsurance,
      },
    });
  };

  const inputCls = "w-full h-12 px-4 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all";

  const hero = heroContent[activeInsurance];

  // Captcha + Agreement + Button — shared across all forms
  const renderCaptchaRow = (cols: number = 3) => (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-5 items-end`}>
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
            onClick={() => { validateAndSubmit(); sounds.submit(); }}
            className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg"
          >
            إظهار العروض
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <input type="checkbox" id={`agree-${activeInsurance}`} checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
        <label htmlFor={`agree-${activeInsurance}`} className="text-xs text-muted-foreground cursor-pointer">أوافق على منح حق الاستعلام</label>
      </div>
    </>
  );

  const renderVehiclesForm = () => (
    <motion.div key="vehicles-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">رقم الهوية / الإقامة</label>
          <input type="text" className={inputCls} placeholder="رقم الهوية / الإقامة" value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">الغرض من التأمين</label>
          <div className="flex gap-2">
            <button onClick={() => setPurposeType("new")} className={`flex-1 h-12 rounded-lg border text-sm font-semibold transition-all ${purposeType === "new" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>تأمين جديد</button>
            <button onClick={() => setPurposeType("transfer")} className={`flex-1 h-12 rounded-lg border text-sm font-semibold transition-all ${purposeType === "transfer" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>نقل ملكية</button>
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">نوع تسجيل المركبة</label>
          <div className="flex gap-2">
            <button onClick={() => setRegistrationType("form")} className={`flex-1 h-12 rounded-lg border text-sm font-semibold transition-all ${registrationType === "form" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>استمارة</button>
            <button onClick={() => setRegistrationType("customs")} className={`flex-1 h-12 rounded-lg border text-sm font-semibold transition-all ${registrationType === "customs" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>بطاقة جمركية</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end mb-0">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-1">الرقم التسلسلي <Info className="w-3.5 h-3.5 text-muted-foreground" /></label>
          <input type="text" className={inputCls} placeholder="الرقم التسلسلي" value={form.serial_number} onChange={(e) => upd("serial_number", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">رمز التحقق</label>
          <div className="flex gap-2">
            <input type="text" className={`${inputCls} flex-1`} placeholder="رمز التحقق" value={form.captcha_input} inputMode="numeric" maxLength={4} onChange={(e) => upd("captcha_input", onlyNumbers(e.target.value, 4))} />
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-3 h-12">
              <span className="flex items-center gap-0.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                {captchaCode.map((d, i) => (<span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>))}
              </span>
              <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-muted-foreground hover:text-primary transition-colors mr-1"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div>
          <Button onClick={() => { validateAndSubmit(); sounds.submit(); }} className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg">إظهار العروض</Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <input type="checkbox" id="agree-vehicles" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
        <label htmlFor="agree-vehicles" className="text-xs text-muted-foreground cursor-pointer">أوافق على منح حق الاستعلام</label>
      </div>
    </motion.div>
  );

  // Medical: السجل التجاري / الرقم الموحد + رمز التحقق
  const renderMedicalForm = () => (
    <motion.div key="medical-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">السجل التجاري/ الرقم الموحد</label>
          <input type="text" className={inputCls} placeholder="السجل التجاري/ الرقم الموحد" value={form.commercial_reg} inputMode="numeric" onChange={(e) => upd("commercial_reg", onlyNumbers(e.target.value, 15))} />
        </div>
        {renderCaptchaRow(3)}
      </div>
    </motion.div>
  );

  // Malpractice: رقم هوية طالب التأمين + تاريخ بداية التأمين + رمز التحقق
  const renderMalpracticeForm = () => (
    <motion.div key="malpractice-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">رقم هوية طالب التأمين</label>
          <input type="text" className={inputCls} placeholder="رقم الهوية / الإقامة" value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">تاريخ بداية التأمين</label>
          <div className="relative">
            <input type="date" className={inputCls} value={form.start_date} onChange={(e) => upd("start_date", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">رمز التحقق</label>
          <div className="flex gap-2">
            <input type="text" className={`${inputCls} flex-1`} placeholder="رمز التحقق" value={form.captcha_input} inputMode="numeric" maxLength={4} onChange={(e) => upd("captcha_input", onlyNumbers(e.target.value, 4))} />
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-3 h-12">
              <span className="flex items-center gap-0.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                {captchaCode.map((d, i) => (<span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>))}
              </span>
              <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-muted-foreground hover:text-primary transition-colors mr-1"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div>
          <Button onClick={() => { validateAndSubmit(); sounds.submit(); }} className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg">إظهار العروض</Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <input type="checkbox" id="agree-malpractice" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
        <label htmlFor="agree-malpractice" className="text-xs text-muted-foreground cursor-pointer">أوافق على منح حق الاستعلام</label>
      </div>
    </motion.div>
  );

  // Travel: رقم الهوية + تاريخ بداية التغطية + تاريخ نهاية التغطية + رمز التحقق
  const renderTravelForm = () => (
    <motion.div key="travel-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">رقم الهوية</label>
          <input type="text" className={inputCls} placeholder="رقم الهوية / الإقامة" value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">تاريخ بداية التغطية</label>
          <input type="date" className={inputCls} value={form.travel_start} onChange={(e) => upd("travel_start", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">تاريخ نهاية التغطية</label>
          <input type="date" className={inputCls} value={form.travel_end} onChange={(e) => upd("travel_end", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">رمز التحقق</label>
          <div className="flex gap-2">
            <input type="text" className={`${inputCls} flex-1`} placeholder="رمز التحقق" value={form.captcha_input} inputMode="numeric" maxLength={4} onChange={(e) => upd("captcha_input", onlyNumbers(e.target.value, 4))} />
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-3 h-12">
              <span className="flex items-center gap-0.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                {captchaCode.map((d, i) => (<span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>))}
              </span>
              <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-muted-foreground hover:text-primary transition-colors mr-1"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div>
          <Button onClick={() => { validateAndSubmit(); sounds.submit(); }} className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg">إظهار العروض</Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <input type="checkbox" id="agree-travel" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
        <label htmlFor="agree-travel" className="text-xs text-muted-foreground cursor-pointer">أوافق على منح حق الاستعلام</label>
      </div>
    </motion.div>
  );

  // Domestic: هوية الكفيل / رقم الإقامة + تاريخ الميلاد (شهر + سنة) + رمز التحقق
  const renderDomesticForm = () => (
    <motion.div key="domestic-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">هوية الكفيل / رقم الإقامة</label>
          <input type="text" className={inputCls} placeholder="هوية الكفيل / رقم الإقامة" value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
        </div>
        <div className="md:col-span-1">
          <label className="text-sm font-bold text-foreground mb-2 block">تاريخ الميلاد</label>
          <div className="flex gap-2">
            <select className={`${inputCls} flex-1`} value={form.worker_nationality} onChange={(e) => upd("worker_nationality", e.target.value)}>
              <option value="">شهر الميلاد</option>
              {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={String(i + 1)}>{i + 1}</option>))}
            </select>
            <input type="text" className={`${inputCls} flex-1`} placeholder="سنة الميلاد" value={form.worker_id} inputMode="numeric" maxLength={4} onChange={(e) => upd("worker_id", onlyNumbers(e.target.value, 4))} />
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">رمز التحقق</label>
          <div className="flex gap-2">
            <input type="text" className={`${inputCls} flex-1`} placeholder="رمز التحقق" value={form.captcha_input} inputMode="numeric" maxLength={4} onChange={(e) => upd("captcha_input", onlyNumbers(e.target.value, 4))} />
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-3 h-12">
              <span className="flex items-center gap-0.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                {captchaCode.map((d, i) => (<span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>))}
              </span>
              <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-muted-foreground hover:text-primary transition-colors mr-1"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div>
          <Button onClick={() => { validateAndSubmit(); sounds.submit(); }} className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg">إظهار العروض</Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <input type="checkbox" id="agree-domestic" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
        <label htmlFor="agree-domestic" className="text-xs text-muted-foreground cursor-pointer">أوافق على منح حق الاستعلام</label>
      </div>
    </motion.div>
  );

  const formRenderers: Record<string, () => JSX.Element> = {
    vehicles: renderVehiclesForm,
    medical: renderMedicalForm,
    malpractice: renderMalpracticeForm,
    travel: renderTravelForm,
    domestic: renderDomesticForm,
  };

  return (
    <section className="relative">
      {/* Hero gradient background */}
      <div className="gradient-hero relative overflow-hidden">
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
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${activeInsurance}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-2xl md:text-3xl lg:text-[2.75rem] font-extrabold text-primary-foreground leading-tight mb-4 max-w-4xl mx-auto"
            >
              {hero.title}
            </motion.h1>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${activeInsurance}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ delay: 0.05 }}
              className="text-sm md:text-base text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed"
            >
              {hero.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* White card */}
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
                  onClick={() => { setActiveInsurance(tab.id); onTabChange?.(tab.id); sounds.tabSwitch(); setAgreed(false); upd("captcha_input", ""); refreshCaptcha(); }}
                  className={`flex flex-col items-center gap-1 px-4 md:px-6 py-3.5 text-xs md:text-sm font-bold transition-all border-b-[3px] min-w-[70px] md:min-w-[90px] ${
                    active ? "text-primary border-primary bg-background" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${active ? "text-primary" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="p-6 md:p-8 bg-card">
            <AnimatePresence mode="wait">
              {formRenderers[activeInsurance]()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Partners strip — BCare style */}
      <div className="relative bg-[hsl(var(--primary)/0.06)] py-10 overflow-hidden">
        {/* Decorative SVG illustrations */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
          {/* Airplane */}
          <svg className="absolute top-4 left-[10%] w-40 h-40 text-primary" viewBox="0 0 100 100" fill="currentColor">
            <path d="M90 45L65 35V20L55 25V35L10 50L55 65V75L65 80V65L90 55L85 50Z" />
          </svg>
          {/* Shield */}
          <svg className="absolute bottom-4 right-[8%] w-48 h-48 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M50 10L15 25V50C15 72 50 90 50 90S85 72 85 50V25L50 10Z" />
            <path d="M50 20L25 32V50C25 66 50 80 50 80S75 66 75 50V32L50 20Z" />
          </svg>
          {/* Heart */}
          <svg className="absolute top-6 right-[35%] w-24 h-24 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M50 85S10 60 10 35C10 20 22 10 35 10C42 10 48 14 50 18C52 14 58 10 65 10C78 10 90 20 90 35C90 60 50 85 50 85Z" />
          </svg>
        </div>

        <div className="section-container relative z-10">
          <div className="max-w-5xl mx-auto bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border px-6 py-5">
            <div className="flex items-center gap-0 flex-row-reverse">
              {/* Right: مصرح من + IA + 23 */}
              <div className="flex items-center gap-4 shrink-0 border-r-0 border-l-2 border-border pl-6">
                <div className="text-center leading-tight">
                  <span className="block text-xs text-muted-foreground font-bold">مصرح من:</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">هيئة التأمين</span>
                </div>
                <img src="/logos/ia.svg" alt="هيئة التأمين" className="h-12" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-primary leading-none">23</span>
                  <span className="text-[10px] text-muted-foreground font-medium">شركة تأمين</span>
                </div>
              </div>

              {/* Left: Scrolling logos with arrow */}
              <div className="flex-1 overflow-hidden relative flex items-center gap-3">
                <button className="shrink-0 w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1 overflow-hidden relative">
                  <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-card/90 to-transparent z-10" />
                  <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-card/90 to-transparent z-10" />
                  <div className="flex animate-marquee gap-8 items-center">
                    {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                      <img key={`${logo.key}-${i}`} src={logo.src} alt={logo.name} className="h-10 shrink-0 opacity-60 hover:opacity-100 transition-opacity" />
                    ))}
                  </div>
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
