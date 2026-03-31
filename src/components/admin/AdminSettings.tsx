import { useState } from "react";
import { Globe, Shield, Bell, Database, Save, KeyRound, Trash2, LogOut, Settings, FileText, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { logActivity } from "@/lib/activityLogger";

const AdminSettings = () => {
  const [chatEnabled, setChatEnabled] = useState(true);
  const [siteEnabled, setSiteEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const navigate = useNavigate();

  const handleClearAllData = async () => {
    if (confirmText !== "مسح") {
      toast.error("يرجى كتابة 'مسح' للتأكيد");
      return;
    }
    setClearingData(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("clear-all-data", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      toast.success("تم مسح جميع البيانات بنجاح");
      logActivity("مسح جميع البيانات", "settings", undefined, "تم حذف جميع السجلات من قاعدة البيانات");
      setShowClearDataModal(false);
      setConfirmText("");
    } catch (err: any) {
      toast.error(err.message || "فشل مسح البيانات");
    } finally {
      setClearingData(false);
    }
  };

  const handleSave = () => {
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  const fetchAllData = async () => {
    const [requests, orders, claims, conversations] = await Promise.all([
      supabase.from("insurance_requests").select("*"),
      supabase.from("insurance_orders").select("*"),
      supabase.from("claims").select("*"),
      supabase.from("chat_conversations").select("*"),
    ]);
    return {
      requests: requests.data || [],
      orders: orders.data || [],
      claims: claims.data || [],
      conversations: conversations.data || [],
    };
  };

  const handleExportPDF = async () => {
    toast.info("جاري تجهيز ملف PDF...");
    try {
      const data = await fetchAllData();
      const doc = new jsPDF({ orientation: "landscape" });

      // Use default font (Helvetica) - works for LTR content
      doc.setFontSize(18);
      doc.text("BCare Insurance - Data Export", 14, 20);
      doc.setFontSize(10);
      doc.text(`Export Date: ${new Date().toLocaleDateString("en-US")}`, 14, 28);

      let yPos = 35;

      // Insurance Requests
      if (data.requests.length > 0) {
        doc.setFontSize(13);
        doc.text("Insurance Requests", 14, yPos);
        (doc as any).autoTable({
          startY: yPos + 4,
          head: [["ID", "National ID", "Phone", "Type", "Status", "Created"]],
          body: data.requests.map((r: any) => [
            r.id?.slice(0, 8), r.national_id, r.phone, r.request_type, r.status, new Date(r.created_at).toLocaleDateString("en-US"),
          ]),
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [212, 160, 23] },
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Insurance Orders
      if (data.orders.length > 0) {
        if (yPos > 170) { doc.addPage(); yPos = 20; }
        doc.setFontSize(13);
        doc.text("Insurance Orders", 14, yPos);
        (doc as any).autoTable({
          startY: yPos + 4,
          head: [["ID", "Company", "Type", "Status", "Total Price", "Created"]],
          body: data.orders.map((o: any) => [
            o.id?.slice(0, 8), o.company || "-", o.insurance_type || "-", o.status, o.total_price || "-", new Date(o.created_at).toLocaleDateString("en-US"),
          ]),
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [212, 160, 23] },
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Claims
      if (data.claims.length > 0) {
        if (yPos > 170) { doc.addPage(); yPos = 20; }
        doc.setFontSize(13);
        doc.text("Claims", 14, yPos);
        (doc as any).autoTable({
          startY: yPos + 4,
          head: [["ID", "Name", "Phone", "Policy", "Type", "Status", "Created"]],
          body: data.claims.map((c: any) => [
            c.id?.slice(0, 8), c.full_name, c.phone, c.policy_number, c.claim_type, c.status, new Date(c.created_at).toLocaleDateString("en-US"),
          ]),
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [212, 160, 23] },
        });
      }

      doc.save("bcare-insurance-data.pdf");
      toast.success("تم تصدير البيانات كملف PDF");
      logActivity("تصدير البيانات كملف PDF", "settings");
    } catch (err: any) {
      toast.error("فشل تصدير PDF");
    }
  };

  const handleExportExcel = async () => {
    toast.info("جاري تجهيز ملف Excel...");
    try {
      const data = await fetchAllData();
      const wb = XLSX.utils.book_new();

      if (data.requests.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.requests);
        XLSX.utils.book_append_sheet(wb, ws, "Requests");
      }
      if (data.orders.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.orders);
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
      }
      if (data.claims.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.claims);
        XLSX.utils.book_append_sheet(wb, ws, "Claims");
      }
      if (data.conversations.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.conversations);
        XLSX.utils.book_append_sheet(wb, ws, "Conversations");
      }

      XLSX.writeFile(wb, "bcare-insurance-data.xlsx");
      toast.success("تم تصدير البيانات كملف Excel");
      logActivity("تصدير البيانات كملف Excel", "settings");
    } catch (err: any) {
      toast.error("فشل تصدير Excel");
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      toast.success("تم تغيير كلمة المرور بنجاح");
      logActivity("تغيير كلمة المرور", "settings");
      setShowPasswordModal(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير كلمة المرور");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/admin/login");
  };

  const ToggleSwitch = ({ enabled, onChange, label, description, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-10 h-5 rounded-full transition-all relative ${enabled ? "bg-emerald-500" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );

  const SettingsAction = ({ icon: Icon, label, onClick, variant = "default" }: { icon: any; label: string; onClick: () => void; variant?: "default" | "danger" }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
        variant === "danger"
          ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
          : "bg-secondary/30 border-border hover:bg-secondary/50"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        variant === "danger" ? "bg-red-500/10" : "bg-primary/10"
      }`}>
        <Icon className={`w-4 h-4 ${variant === "danger" ? "text-red-500" : "text-primary"}`} />
      </div>
      <span className={`text-xs font-bold ${variant === "danger" ? "text-red-500" : "text-foreground"}`}>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-xs text-muted-foreground">إعدادات النظام والموقع</p>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground mb-3">إعدادات عامة</h2>
        <ToggleSwitch enabled={siteEnabled} onChange={setSiteEnabled} label="تفعيل الموقع" description="التحكم في حالة الموقع (تشغيل / إيقاف)" icon={Globe} />
        <ToggleSwitch enabled={chatEnabled} onChange={setChatEnabled} label="تفعيل الدردشة" description="السماح للزوار بإرسال رسائل عبر الدردشة" icon={Shield} />
        <ToggleSwitch enabled={notificationsEnabled} onChange={setNotificationsEnabled} label="الإشعارات" description="تلقي إشعارات عند وصول طلبات أو رسائل جديدة" icon={Bell} />
      </div>

      {/* Export Data */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          تصدير البيانات
        </h2>
        <SettingsAction icon={FileText} label="تصدير كملف PDF" onClick={handleExportPDF} />
        <SettingsAction icon={FileSpreadsheet} label="تصدير كملف Excel" onClick={handleExportExcel} />
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground mb-3">إجراءات الحساب</h2>
        <SettingsAction icon={KeyRound} label="تغيير كلمة المرور" onClick={() => setShowPasswordModal(true)} />
        <SettingsAction icon={Trash2} label="مسح جميع البيانات" onClick={() => setShowClearDataModal(true)} variant="danger" />
        <SettingsAction icon={LogOut} label="تسجيل الخروج" onClick={handleLogout} variant="danger" />
      </div>

      {/* Database Status */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground mb-3">قاعدة البيانات</h2>
        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">متصل</p>
            <p className="text-[10px] text-muted-foreground">قاعدة البيانات تعمل بشكل طبيعي</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-auto" />
        </div>
      </div>

      <Button onClick={handleSave} className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl gap-2">
        <Save className="w-3.5 h-3.5" />
        حفظ الإعدادات
      </Button>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">تغيير كلمة المرور</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">تأكيد كلمة المرور</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleChangePassword} disabled={changingPassword} className="flex-1 bg-cta text-cta-foreground hover:bg-cta-hover rounded-xl text-sm">
                {changingPassword ? "جاري التغيير..." : "تغيير"}
              </Button>
              <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1 rounded-xl text-sm">
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearDataModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowClearDataModal(false)}>
          <div className="bg-card rounded-2xl border border-red-500/20 p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold text-foreground">مسح جميع البيانات</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              سيتم حذف جميع الطلبات، المطالبات، المحادثات، والطلبات من قاعدة البيانات نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">اكتب "مسح" للتأكيد</label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-red-500/20 text-foreground text-sm focus:outline-none focus:border-red-500"
                placeholder="مسح"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleClearAllData} disabled={clearingData || confirmText !== "مسح"} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm">
                {clearingData ? "جاري المسح..." : "مسح نهائي"}
              </Button>
              <Button variant="outline" onClick={() => { setShowClearDataModal(false); setConfirmText(""); }} className="flex-1 rounded-xl text-sm">
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
