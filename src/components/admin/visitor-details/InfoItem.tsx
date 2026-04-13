import React, { forwardRef } from "react";

export const InfoItem = forwardRef<HTMLDivElement, { label: string; value: string | null }>(({ label, value }, ref) => (
  <div ref={ref} className="bg-muted/30 rounded-xl p-2.5 border border-border/20 hover:bg-muted/40 transition-colors">
    <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">{label}</p>
    <p className="text-[13px] font-bold text-foreground break-all leading-snug">{value || "—"}</p>
  </div>
));
InfoItem.displayName = "InfoItem";
