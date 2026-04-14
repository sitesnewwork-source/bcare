import React, { forwardRef } from "react";

export const InfoItem = forwardRef<HTMLDivElement, { label: string; value: string | null; icon?: React.ReactNode; highlight?: boolean }>(
  ({ label, value, icon, highlight }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg p-2 transition-colors ${
        highlight
          ? "bg-primary/5 border border-primary/20"
          : "bg-muted/30 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-1 mb-0.5">
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
        <p className="text-[8px] md:text-[9px] text-muted-foreground font-medium">{label}</p>
      </div>
      <p className={`text-[11px] md:text-xs font-semibold break-all leading-relaxed ${
        highlight ? "text-primary" : "text-foreground"
      }`}>
        {value || "—"}
      </p>
    </div>
  )
);
InfoItem.displayName = "InfoItem";
