import React from "react";
import { User, Phone, CreditCard, Globe, Clock, MapPin, Network } from "lucide-react";
import { InfoItem } from "./InfoItem";
import CollapsibleCard from "./CollapsibleCard";
import type { Visitor, InsuranceRequest, InsuranceOrder } from "./types";
import { countryFlag, formatTime, formatDate } from "./types";

interface Props {
  selectedVisitor: Visitor;
  visitorName: string | null;
  customerName: string | null;
  visitorPhone: string | null;
  visitorNationalId: string | null;
  linkedRequests: InsuranceRequest[];
  linkedOrders: InsuranceOrder[];
  loadingAction: string | null;
  onApprove: (reqId: string) => void;
  onReject: (reqId: string) => void;
  insuranceTypeLabel: Record<string, string>;
  statusLabel: Record<string, { text: string; cls: string }>;
}

const TabIdentity: React.FC<Props> = ({
  selectedVisitor, visitorName, customerName, visitorPhone, visitorNationalId,
  linkedRequests, loadingAction, onApprove, onReject, insuranceTypeLabel, statusLabel,
}) => {
  return (
    <div className="space-y-3">
      {/* Personal Information */}
      <CollapsibleCard
        title="المعلومات الشخصية"
        icon={<User className="w-3.5 h-3.5" />}
        borderColor="border-sky-500/20"
        bgColor="bg-sky-500/[0.02]"
        headerBg="bg-sky-500/8"
        headerBorder="border-sky-500/15"
        textColor="text-sky-600"
        defaultOpen
      >
        {(() => {
          const items = [
            visitorName ? { icon: <User className="w-3 h-3" />, label: "الاسم", value: visitorName } : null,
            customerName && customerName !== visitorName ? { icon: <User className="w-3 h-3" />, label: "اسم العميل", value: customerName } : null,
            visitorPhone ? { icon: <Phone className="w-3 h-3" />, label: "رقم الجوال", value: visitorPhone, highlight: true } : null,
            visitorNationalId ? { icon: <CreditCard className="w-3 h-3" />, label: "رقم الهوية", value: visitorNationalId, highlight: true } : null,
            selectedVisitor.country ? { icon: <Globe className="w-3 h-3" />, label: "الدولة", value: `${countryFlag(selectedVisitor.country_code)} ${selectedVisitor.country}` } : null,
            selectedVisitor.ip_address ? { icon: <Network className="w-3 h-3" />, label: "عنوان IP", value: selectedVisitor.ip_address } : null,
            { icon: <Clock className="w-3 h-3" />, label: "آخر نشاط", value: formatTime(selectedVisitor.last_seen_at) },
            selectedVisitor.current_page ? { icon: <MapPin className="w-3 h-3" />, label: "الصفحة الحالية", value: selectedVisitor.current_page } : null,
            { icon: <Clock className="w-3 h-3" />, label: "تاريخ الزيارة الأولى", value: formatDate(selectedVisitor.created_at) },
          ].filter(Boolean);

          return items.length > 0 ? (
            <div className="px-3 py-2.5 grid grid-cols-2 gap-2">
              {items.map((item, i) => (
                <InfoItem key={i} icon={item!.icon} label={item!.label} value={item!.value} highlight={item!.highlight} />
              ))}
            </div>
          ) : (
            <p className="px-3 py-3 text-xs text-muted-foreground text-center">لا توجد بيانات بعد</p>
          );
        })()}
      </CollapsibleCard>

      {/* Insurance Requests */}
      {linkedRequests.length > 0 && (
        <CollapsibleCard
          title={`طلبات التأمين (${linkedRequests.length})`}
          icon={<span className="text-xs">📋</span>}
          borderColor="border-indigo-500/20"
          bgColor="bg-indigo-500/[0.02]"
          headerBg="bg-indigo-500/8"
          headerBorder="border-indigo-500/15"
          textColor="text-indigo-600"
          defaultOpen
        >
          <div className="px-3 py-2.5 space-y-2">
            {linkedRequests.map(req => (
              <div
                key={req.id}
                data-pending-request={req.status === "pending" ? "true" : undefined}
                className={`rounded-lg border p-2.5 space-y-2 transition-all ${
                  req.status === "pending"
                    ? "border-blue-500/30 bg-blue-500/5 ring-1 ring-blue-500/10"
                    : "border-border/40 bg-muted/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground">
                    طلب {req.request_type === "new" ? "جديد" : "تجديد"} — {insuranceTypeLabel[req.insurance_type || ""] || req.insurance_type || "غير محدد"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusLabel[req.status]?.cls || "bg-muted text-muted-foreground"}`}>
                    {statusLabel[req.status]?.text || req.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {req.national_id && <InfoItem label="رقم الهوية" value={req.national_id} />}
                  {req.phone && <InfoItem label="رقم الجوال" value={req.phone} />}
                  {req.serial_number && <InfoItem label="الرقم التسلسلي" value={req.serial_number} />}
                  {req.estimated_value && <InfoItem label="القيمة التقديرية" value={`${req.estimated_value} ر.س`} />}
                  {req.repair_location && <InfoItem label="مكان التصليح" value={req.repair_location === "agency" ? "الوكالة" : "ورشة"} />}
                  {req.passenger_count && <InfoItem label="عدد الركاب" value={req.passenger_count} />}
                  {req.vehicle_usage && <InfoItem label="غرض الاستخدام" value={req.vehicle_usage === "personal" ? "شخصي" : req.vehicle_usage === "commercial" ? "تجاري" : req.vehicle_usage} />}
                  {req.policy_start_date && <InfoItem label="بداية الوثيقة" value={req.policy_start_date} />}
                  {req.birth_date && <InfoItem label="تاريخ الميلاد" value={req.birth_date} />}
                  <InfoItem label="تاريخ الطلب" value={formatDate(req.created_at)} />
                  {req.notes && <div className="col-span-2"><InfoItem label="ملاحظات" value={req.notes} /></div>}
                </div>
                {req.status === "pending" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <button onClick={() => onApprove(req.id)} disabled={loadingAction !== null} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all disabled:opacity-50">
                      ✓ موافقة
                    </button>
                    <button onClick={() => onReject(req.id)} disabled={loadingAction !== null} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground text-[11px] font-bold transition-all disabled:opacity-50">
                      ✗ رفض
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* No data */}
      {!visitorName && !visitorPhone && !visitorNationalId && linkedRequests.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">لا توجد بيانات مقدمة من الزائر</p>
      )}
    </div>
  );
};

export default TabIdentity;
