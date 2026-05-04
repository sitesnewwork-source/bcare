import React, { forwardRef } from "react";

export const InfoItem = forwardRef<
  HTMLDivElement,
  { label: string; value: string | null; icon?: React.ReactNode; highlight?: boolean }
>(({ label, value, icon, highlight }, ref) => (
  <div
    ref={ref}
    className={`group relative overflow-hidden rounded-xl p-2.5 transition-all duration-300 backdrop-blur-sm ${
      highlight
        ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/25 shadow-[0_2px_10px_-3px_hsl(var(--primary)/0.25)] hover:shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.35)] hover:-translate-y-0.5"
        : "bg-gradient-to-br from-muted/40 via-muted/20 to-transparent border border-border/40 hover:border-border/70 hover:from-muted/60 hover:-translate-y-0.5"
    }`}
  >
    {/* shine accent */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" />

    <div className="flex items-center gap-1.5 mb-1">
      {icon && (
        <span
          className={`inline-flex items-center justify-center w-4 h-4 rounded-md transition-colors ${
            highlight
              ? "bg-primary/15 text-primary"
              : "bg-foreground/5 text-muted-foreground group-hover:text-foreground/80"
          }`}
        >
          {icon}
        </span>
      )}
      <p className="text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground/80 font-semibold">
        {label}
      </p>
    </div>
    <p
      className={`text-[11px] md:text-[12px] font-bold break-all leading-snug ${
        highlight ? "text-primary" : "text-foreground/90"
      }`}
    >
      {value || <span className="text-muted-foreground/40 font-normal">—</span>}
    </p>
  </div>
));
InfoItem.displayName = "InfoItem";
