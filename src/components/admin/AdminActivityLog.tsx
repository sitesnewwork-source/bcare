import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Clock, User, FileText, MessageSquare, ShieldAlert, Settings, Package, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useBulkActions } from "@/hooks/useBulkActions";

type ActivityLog = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  created_at: string;
};

const actionIcons: Record<string, any> = {
  request: FileText,
  order: Package,
  claim: ShieldAlert,
  chat: MessageSquare,
  user: User,
  settings: Settings,
};

const actionColors: Record<string, string> = {
  approve: "text-emerald-500 bg-emerald-500/10",
  reject: "text-red-500 bg-red-500/10",
  update: "text-blue-500 bg-blue-500/10",
  create: "text-amber-500 bg-amber-500/10",
  delete: "text-red-500 bg-red-500/10",
  login: "text-emerald-500 bg-emerald-500/10",
  logout: "text-gray-500 bg-gray-500/10",
  export: "text-purple-500 bg-purple-500/10",
  clear: "text-red-500 bg-red-500/10",
  password: "text-amber-500 bg-amber-500/10",
};

const getActionColor = (action: string) => {
  const key = Object.keys(actionColors).find((k) => action.toLowerCase().includes(k));
  return key ? actionColors[key] : "text-primary bg-primary/10";
};

const AdminActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const deleteLogs = async (ids: string[]) => {
    for (const id of ids) {
      await (supabase.from("activity_logs" as any) as any).delete().eq("id", id);
    }
    toast.success(`تم مسح ${ids.length} سجل`);
    fetchLogs();
  };

  const bulk = useBulkActions({ items: logs, onDelete: deleteLogs, entityName: "سجل", skipConfirm: true });

  const fetchLogs = async () => {
    setLoading(true);
    let query = (supabase.from("activity_logs" as any) as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter !== "all") {
      query = query.eq("entity_type", filter);
    }

    const { data } = await query;
    setLogs((data as ActivityLog[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    return (
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString("ar-SA");
  };

  const filters = [
    { key: "all", label: "الكل" },
    { key: "request", label: "الطلبات" },
    { key: "order", label: "الأوامر" },
    { key: "claim", label: "المطالبات" },
    { key: "chat", label: "المحادثات" },
    { key: "settings", label: "الإعدادات" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">سجل الأحداث</h1>
            <p className="text-xs text-muted-foreground">تتبع جميع الإجراءات في لوحة التحكم</p>
          </div>
        </div>
        <bulk.BulkActions />
      </div>

      {/* Search & Refresh */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في السجل..."
            className="w-full pr-9 pl-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:border-primary"
          />
        </div>
        <button onClick={fetchLogs} className="p-2 rounded-xl bg-card border border-border hover:bg-secondary/50 transition-colors">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-10">
            <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-xl border border-border">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-muted-foreground">لا توجد أحداث</p>
            <p className="text-xs text-muted-foreground">ستظهر الأحداث هنا عند إجراء أي عملية</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const IconComp = actionIcons[log.entity_type] || Activity;
            const colorClass = getActionColor(log.action);
            return (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:bg-secondary/20 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground leading-relaxed">{log.action}</p>
                  {log.details && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{log.details}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{formatTime(log.created_at)}</span>
                    {log.entity_id && (
                      <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                        #{log.entity_id.slice(0, 8)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminActivityLog;
