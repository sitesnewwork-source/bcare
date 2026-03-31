import { useState, useCallback } from "react";
import { Trash2, CheckSquare, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UseBulkActionsProps {
  items: { id: string }[];
  onDelete: (ids: string[]) => Promise<void>;
  entityName: string;
  skipConfirm?: boolean;
}

export const useBulkActions = ({ items, onDelete, entityName, skipConfirm = false }: UseBulkActionsProps) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ type: "selected" | "all"; count: number } | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.size === items.length ? new Set() : new Set(items.map((i) => i.id)));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (skipConfirm) {
      setDeleting(true);
      await onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectMode(false);
      setDeleting(false);
      return;
    }
    setConfirmModal({ type: "selected", count: selectedIds.size });
    setConfirmText("");
  };

  const handleDeleteAll = async () => {
    if (items.length === 0) return;
    if (skipConfirm) {
      setDeleting(true);
      await onDelete(items.map((i) => i.id));
      setSelectedIds(new Set());
      setSelectMode(false);
      setDeleting(false);
      return;
    }
    setConfirmModal({ type: "all", count: items.length });
    setConfirmText("");
  };

  const executeDelete = async () => {
    if (confirmText !== "مسح") return;
    setDeleting(true);
    const ids = confirmModal?.type === "all" ? items.map((i) => i.id) : Array.from(selectedIds);
    await onDelete(ids);
    setSelectedIds(new Set());
    setSelectMode(false);
    setDeleting(false);
    setConfirmModal(null);
    setConfirmText("");
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const BulkActions = () => (
    <>
      <div className="flex items-center gap-1.5">
        {selectMode ? (
          <>
            <Button size="sm" variant="ghost" onClick={toggleSelectAll} className="gap-1 text-xs h-8">
              <CheckSquare className="w-3.5 h-3.5" />
              {selectedIds.size === items.length ? "إلغاء الكل" : "تحديد الكل"}
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDeleteSelected} disabled={selectedIds.size === 0 || deleting} className="gap-1 text-xs h-8">
              <Trash2 className="w-3.5 h-3.5" />
              مسح ({selectedIds.size})
            </Button>
            <Button size="sm" variant="ghost" onClick={exitSelectMode} className="text-xs h-8 px-2">
              <XCircle className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => setSelectMode(true)} disabled={items.length === 0} className="gap-1 text-xs h-8">
              <CheckSquare className="w-3.5 h-3.5" />
              تحديد
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDeleteAll} disabled={items.length === 0 || deleting} className="gap-1 text-xs h-8">
              <Trash2 className="w-3.5 h-3.5" />
              مسح الكل
            </Button>
          </>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setConfirmModal(null); setConfirmText(""); }}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-sm w-full p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">تأكيد الحذف</h3>
                <p className="text-xs text-muted-foreground">
                  سيتم حذف {confirmModal.count} {entityName} نهائياً
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                اكتب كلمة "<span className="text-destructive">مسح</span>" للتأكيد
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="اكتب: مسح"
                className="w-full text-sm border-2 border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-destructive placeholder:text-muted-foreground"
                autoFocus
                dir="rtl"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={executeDelete}
                disabled={confirmText !== "مسح" || deleting}
                className="flex-1 gap-1 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? "جاري الحذف..." : "تأكيد الحذف"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setConfirmModal(null); setConfirmText(""); }}
                className="flex-1 text-xs"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return { selectMode, selectedIds, toggleSelect, BulkActions };
};
