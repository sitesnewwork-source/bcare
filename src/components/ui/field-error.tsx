import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldErrorProps {
  message?: string | null;
  className?: string;
  align?: "right" | "left";
}

/**
 * مكوّن موحّد لرسائل الخطأ في كافة النماذج.
 * يعرض: نقطة دلالية + أيقونة AlertCircle + النص بنفس الوزن والحجم.
 */
export function FieldError({ message, className, align = "right" }: FieldErrorProps) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={cn(
        "mt-1.5 text-[11px] font-semibold leading-none text-destructive flex items-center gap-1.5",
        align === "right" && "justify-start text-right",
        align === "left" && "justify-start text-left",
        className,
      )}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
      <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={2.5} />
      <span className="leading-none">{message}</span>
    </motion.p>
  );
}

export default FieldError;
