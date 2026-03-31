import { useState, useCallback } from "react";
import heroInsuranceBg from "@/assets/hero-insurance-bg.jpg";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Car, Heart, Stethoscope, Plane, Home, RefreshCw, Info, Calendar } from "lucide-react";
import { sounds } from "@/lib/sounds";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import iaLogo from "@/assets/ia-logo.png";
import tawuniyaLogo from "@/assets/logos/tawuniya.png";
import allianzLogo from "@/assets/logos/allianz.png";
import rajhiLogo from "@/assets/logos/rajhi.png";
import bupaLogo from "@/assets/logos/bupa.png";
import medgulfLogo from "@/assets/logos/medgulf.png";
import gigLogo from "@/assets/logos/gig.png";
import acigLogo from "@/assets/logos/acig.png";
import arabianShieldLogo from "@/assets/logos/arabian-shield.png";
import walaaLogo from "@/assets/logos/walaa.png";
import salamaLogo from "@/assets/logos/salama.png";
import livaLogo from "@/assets/logos/liva.png";
import takafulLogo from "@/assets/logos/takaful.png";
import malathLogo from "@/assets/logos/malath.png";
import unitedLogo from "@/assets/logos/united.png";
import aseigLogo from "@/assets/logos/aseig.png";

const partnerLogos = [
  { key: "tawuniya", name: "التعاونية", src: tawuniyaLogo },
  { key: "alrajhi", name: "الراجحي تكافل", src: rajhiLogo },
  { key: "allianz", name: "أليانز السعودية", src: allianzLogo },
  { key: "medgulf", name: "ميدغلف", src: medgulfLogo },
  { key: "bupa", name: "بوبا العربية", src: bupaLogo },
  { key: "gig", name: "GIG", src: gigLogo },
  { key: "acig", name: "ACIG", src: acigLogo },
  { key: "arabianshield", name: "الدرع العربي", src: arabianShieldLogo },
  { key: "walaa", name: "ولاء للتأمين", src: walaaLogo },
  { key: "salama", name: "سلامة", src: salamaLogo },
  { key: "liva", name: "ليفا للتأمين", src: livaLogo },
  { key: "takaful", name: "التكافل العربي", src: takafulLogo },
  { key: "malath", name: "ملاذ للتأمين", src: malathLogo },
  { key: "united", name: "المتحدة للتأمين", src: unitedLogo },
  { key: "aseig", name: "المتكاملة (أسيج)", src: aseigLogo },
];

const tabIcons = { vehicles: Car, medical: Heart, malpractice: Stethoscope, travel: Plane, domestic: Home };

const captchaColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FB923C", "#34D399", "#F472B6", "#60A5FA"];

interface HeroSectionProps {
  onTabChange?: (tab: string) => void;
}

const HeroSection = ({ onTabChange }: HeroSectionProps) => {
  const { t, isRTL } = useLanguage();
  const [activeInsurance, setActiveInsurance] = useState("vehicles");
  const [purposeType, setPurposeType] = useState<"new" | "transfer">("new");
  const [registrationType, setRegistrationType] = useState<"form" | "customs">("form");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    national_id: "", serial_number: "", captcha_input: "", start_date: "",
    commercial_reg: "", passport_number: "", destination: "",
    travel_start: "", travel_end: "", worker_id: "", worker_nationality: "",
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
  const generateCaptcha = useCallback(() => Math.floor(1000 + Math.random() * 9000).toString().split(""), []);
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha);
  const refreshCaptcha = () => setCaptchaCode(generateCaptcha());

  const validateAndSubmit = () => {
    if (!form.national_id || form.national_id.length < 10) { toast.error(t.hero.errors.enterNationalId); return; }
    if (activeInsurance === "vehicles" && !form.serial_number) { toast.error(t.hero.errors.enterSerialNumber); return; }
    if (form.captcha_input !== captchaCode.join("")) { toast.error(t.hero.errors.captchaError); refreshCaptcha(); upd("captcha_input", ""); return; }
    if (!agreed) { toast.error(t.hero.errors.agreeRequired); return; }
    navigate(`/insurance-request?type=${purposeType}`, { state: { national_id: form.national_id, serial_number: form.serial_number, insurance_type: activeInsurance } });
  };

  const inputCls = "w-full h-12 px-4 rounded-xl bg-muted/40 border-2 border-border/80 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-background transition-all duration-200";

  const heroContentKey = activeInsurance as keyof typeof t.hero.content;
  const hero = t.hero.content[heroContentKey];

  const insuranceTabs = [
    { id: "vehicles", label: t.hero.tabs.vehicles },
    { id: "medical", label: t.hero.tabs.medical },
    { id: "malpractice", label: t.hero.tabs.malpractice },
    { id: "travel", label: t.hero.tabs.travel },
    { id: "domestic", label: t.hero.tabs.domestic },
  ];

  // Shared captcha row
  const renderCaptchaRow = (cols: number = 3) => (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-5 items-end`}>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.captcha}</label>
          <div className="flex gap-2">
            <input type="text" className={`${inputCls} flex-1`} placeholder={t.hero.form.captcha} value={form.captcha_input} inputMode="numeric" maxLength={4} onChange={(e) => upd("captcha_input", onlyNumbers(e.target.value, 4))} />
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-3 h-12">
              <span className="flex items-center gap-0.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
                {captchaCode.map((d, i) => (<span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>))}
              </span>
              <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-muted-foreground hover:text-primary transition-colors mx-1"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div>
          <Button onClick={() => { validateAndSubmit(); sounds.submit(); }} className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg">{t.hero.form.showOffers}</Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <input type="checkbox" id={`agree-${activeInsurance}`} checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
        <label htmlFor={`agree-${activeInsurance}`} className="text-xs text-muted-foreground cursor-pointer">{t.hero.form.agreeConsent}</label>
      </div>
    </>
  );

  // Inline captcha (for vehicles, malpractice etc where captcha is in same grid)
  const renderInlineCaptcha = () => (
    <>
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.captcha}</label>
        <div className="flex gap-2">
          <input type="text" className={`${inputCls} flex-1`} placeholder={t.hero.form.captcha} value={form.captcha_input} inputMode="numeric" maxLength={4} onChange={(e) => upd("captcha_input", onlyNumbers(e.target.value, 4))} />
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-3 h-12">
            <span className="flex items-center gap-0.5 font-bold text-lg select-none" style={{ direction: "ltr" }}>
              {captchaCode.map((d, i) => (<span key={i} style={{ color: captchaColors[i % captchaColors.length] }}>{d}</span>))}
            </span>
            <button onClick={() => { refreshCaptcha(); sounds.refresh(); }} className="text-muted-foreground hover:text-primary transition-colors mx-1"><RefreshCw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </>
  );

  const renderInlineButton = () => (
    <div>
      <Button onClick={() => { validateAndSubmit(); sounds.submit(); }} className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta-hover text-base font-bold rounded-lg">{t.hero.form.showOffers}</Button>
    </div>
  );

  const renderAgree = () => (
    <div className="mt-4 flex items-center justify-center gap-2">
      <input type="checkbox" id={`agree-${activeInsurance}`} checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
      <label htmlFor={`agree-${activeInsurance}`} className="text-xs text-muted-foreground cursor-pointer">{t.hero.form.agreeConsent}</label>
    </div>
  );

  const renderVehiclesForm = () => (
    <motion.div key={`vehicles-form-${purposeType}-${registrationType}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-6 md:gap-10 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground">{t.hero.form.purposeLabel}</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="purpose" checked={purposeType === "new"} onChange={() => setPurposeType("new")} className="w-4 h-4 accent-primary" />
            <span className={`text-sm ${purposeType === "new" ? "font-bold text-primary" : "text-muted-foreground"}`}>{t.hero.form.newInsurance}</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="purpose" checked={purposeType === "transfer"} onChange={() => setPurposeType("transfer")} className="w-4 h-4 accent-primary" />
            <span className={`text-sm ${purposeType === "transfer" ? "font-bold text-primary" : "text-muted-foreground"}`}>{t.hero.form.transfer}</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground">{t.hero.form.regTypeLabel}</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="regtype" checked={registrationType === "form"} onChange={() => setRegistrationType("form")} className="w-4 h-4 accent-primary" />
            <span className={`text-sm ${registrationType === "form" ? "font-bold text-primary" : "text-muted-foreground"}`}>{t.hero.form.regForm}</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="regtype" checked={registrationType === "customs"} onChange={() => setRegistrationType("customs")} className="w-4 h-4 accent-primary" />
            <span className={`text-sm ${registrationType === "customs" ? "font-bold text-primary" : "text-muted-foreground"}`}>{t.hero.form.regCustoms}</span>
          </label>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`fields-${purposeType}-${registrationType}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {purposeType === "new" ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.nationalId}</label>
                <input type="text" className={inputCls} placeholder={t.hero.form.nationalId} value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-1">
                  {registrationType === "customs" ? t.hero.form.customsCard : t.hero.form.serialNumber} <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </label>
                <input type="text" className={inputCls} placeholder={registrationType === "customs" ? t.hero.form.customsCard : t.hero.form.serialNumber} value={form.serial_number} onChange={(e) => upd("serial_number", e.target.value)} />
              </div>
              {renderInlineCaptcha()}
              {renderInlineButton()}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end mb-5">
                <div>
                  <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.newOwnerId}</label>
                  <input type="text" className={inputCls} placeholder={t.hero.form.newOwnerId} value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.currentOwnerId}</label>
                  <input type="text" className={inputCls} placeholder={t.hero.form.currentOwnerId} value={form.passport_number} inputMode="numeric" maxLength={10} onChange={(e) => upd("passport_number", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-1">
                    {registrationType === "customs" ? t.hero.form.customsCard : t.hero.form.serialNumber} <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </label>
                  <input type="text" className={inputCls} placeholder={registrationType === "customs" ? t.hero.form.customsCard : t.hero.form.serialNumber} value={form.serial_number} onChange={(e) => upd("serial_number", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                {renderInlineCaptcha()}
                {renderInlineButton()}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      {renderAgree()}
    </motion.div>
  );

  const renderMedicalForm = () => (
    <motion.div key="medical-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.commercialReg}</label>
          <input type="text" className={inputCls} placeholder={t.hero.form.commercialReg} value={form.commercial_reg} inputMode="numeric" onChange={(e) => upd("commercial_reg", onlyNumbers(e.target.value, 15))} />
        </div>
        {renderCaptchaRow(3)}
      </div>
    </motion.div>
  );

  const renderMalpracticeForm = () => (
    <motion.div key="malpractice-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.insurerIdLabel}</label>
          <input type="text" className={inputCls} placeholder={t.hero.form.nationalId} value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.insuranceStartDate}</label>
          <input type="date" className={inputCls} value={form.start_date} onChange={(e) => upd("start_date", e.target.value)} />
        </div>
        {renderInlineCaptcha()}
        {renderInlineButton()}
      </div>
      {renderAgree()}
    </motion.div>
  );

  const renderTravelForm = () => (
    <motion.div key="travel-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.idNumber}</label>
          <input type="text" className={inputCls} placeholder={t.hero.form.nationalId} value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.coverageStart}</label>
          <input type="date" className={inputCls} value={form.travel_start} onChange={(e) => upd("travel_start", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.coverageEnd}</label>
          <input type="date" className={inputCls} value={form.travel_end} onChange={(e) => upd("travel_end", e.target.value)} />
        </div>
        {renderInlineCaptcha()}
        {renderInlineButton()}
      </div>
      {renderAgree()}
    </motion.div>
  );

  const renderDomesticForm = () => (
    <motion.div key="domestic-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.sponsorId}</label>
          <input type="text" className={inputCls} placeholder={t.hero.form.sponsorId} value={form.national_id} inputMode="numeric" maxLength={10} onChange={(e) => upd("national_id", saudiId(e.target.value))} />
        </div>
        <div className="md:col-span-1">
          <label className="text-sm font-bold text-foreground mb-2 block">{t.hero.form.birthDate}</label>
          <div className="flex gap-2">
            <select className={`${inputCls} flex-1`} value={form.worker_nationality} onChange={(e) => upd("worker_nationality", e.target.value)}>
              <option value="">{t.hero.form.birthMonth}</option>
              {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={String(i + 1)}>{i + 1}</option>))}
            </select>
            <input type="text" className={`${inputCls} flex-1`} placeholder={t.hero.form.birthYear} value={form.worker_id} inputMode="numeric" maxLength={4} onChange={(e) => upd("worker_id", onlyNumbers(e.target.value, 4))} />
          </div>
        </div>
        {renderInlineCaptcha()}
        {renderInlineButton()}
      </div>
      {renderAgree()}
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
      <div className="relative overflow-hidden">
        {/* Hummer car background image */}
        <img
          src={heroInsuranceBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />
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

      <div className="section-container relative z-20 -mt-6">
        <div className="bg-card rounded-t-2xl shadow-xl border border-border overflow-hidden max-w-4xl mx-auto">
          <div className="flex items-center justify-center border-b border-border bg-muted/30">
            {insuranceTabs.map((tab) => {
              const Icon = tabIcons[tab.id as keyof typeof tabIcons];
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

          <div className="p-6 md:p-8 bg-card">
            <AnimatePresence mode="wait">
              {formRenderers[activeInsurance]()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Partners strip */}
      <div className="relative bg-[hsl(var(--primary)/0.06)] py-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
          <svg className="absolute top-4 left-[10%] w-40 h-40 text-primary" viewBox="0 0 100 100" fill="currentColor">
            <path d="M90 45L65 35V20L55 25V35L10 50L55 65V75L65 80V65L90 55L85 50Z" />
          </svg>
          <svg className="absolute bottom-4 right-[8%] w-48 h-48 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M50 10L15 25V50C15 72 50 90 50 90S85 72 85 50V25L50 10Z" />
            <path d="M50 20L25 32V50C25 66 50 80 50 80S75 66 75 50V32L50 20Z" />
          </svg>
          <svg className="absolute top-6 right-[35%] w-24 h-24 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M50 85S10 60 10 35C10 20 22 10 35 10C42 10 48 14 50 18C52 14 58 10 65 10C78 10 90 20 90 35C90 60 50 85 50 85Z" />
          </svg>
        </div>

        <div className="section-container relative z-10">
          <div className="max-w-5xl mx-auto bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border px-6 py-5">
            <div className="flex items-center gap-0 flex-row-reverse">
              <div className={`flex items-center gap-4 shrink-0 ${isRTL ? "border-l-2 pl-6" : "border-r-2 pr-6"} border-border`}>
                <div className="text-center leading-tight">
                  <span className="block text-xs text-muted-foreground font-bold">{t.hero.partners.authorizedBy}</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">{t.hero.partners.insuranceAuthority}</span>
                </div>
                <img src={iaLogo} alt={t.hero.partners.insuranceAuthority} className="h-14 w-auto" loading="lazy" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-primary leading-none">23</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{t.hero.partners.companies}</span>
                </div>
              </div>

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
