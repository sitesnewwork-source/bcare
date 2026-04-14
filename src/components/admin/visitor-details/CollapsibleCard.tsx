import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  headerBg: string;
  headerBorder: string;
  textColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isActive?: boolean;
}

const CollapsibleCard = React.forwardRef<HTMLDivElement, CollapsibleCardProps>(
  ({ title, icon, borderColor, bgColor, headerBg, headerBorder, textColor, children, defaultOpen = false, isActive = false }, ref) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          ref={ref}
          className={`rounded-xl border overflow-hidden transition-all duration-300 ${
            isActive
              ? "border-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/20"
              : borderColor
          } ${bgColor}`}
        >
          <CollapsibleTrigger asChild>
            <button
              className={`w-full px-3 py-2 flex items-center justify-between cursor-pointer transition-all duration-200 hover:brightness-95 ${
                isActive ? "bg-amber-500/10 border-amber-500/20" : headerBg
              } ${headerBorder} border-b`}
            >
              <p className={`text-[10px] md:text-[11px] font-bold flex items-center gap-1.5 ${
                isActive ? "text-amber-600" : textColor
              }`}>
                {isActive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
                {icon}
                {title}
              </p>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${
                  isActive ? "text-amber-600" : textColor
                } ${open ? "rotate-180" : ""}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            {children}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }
);
CollapsibleCard.displayName = "CollapsibleCard";

export default CollapsibleCard;
