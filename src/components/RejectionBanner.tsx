import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface RejectionBannerProps {
  show: boolean;
  title?: string;
  message?: string;
  onDismiss?: () => void;
}

/**
 * بانر تنبيه دائم يظهر للزائر عند رفض إجراء التحقق/الدفع من الإدارة،
 * ويوضح أن المعلومات المُدخلة غير صحيحة وأنه يجب إعادة المحاولة ببيانات صحيحة.
 */
export default function RejectionBanner({
  show,
  title = "المعلومات المُدخلة غير صحيحة",
  message = "تم رفض الإجراء لعدم صحة البيانات. يرجى مراجعة المعلومات وإعادة إدخالها بشكل صحيح للمتابعة.",
  onDismiss,
}: RejectionBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="alert"
          dir="rtl"
          className="relative overflow-hidden rounded-xl border-2 border-destructive/30 bg-destructive/5 backdrop-blur-sm p-3 shadow-sm"
        >
          {/* شريط جانبي ملون */}
          <span className="absolute inset-y-0 right-0 w-1 bg-destructive" />

          <div className="flex items-start gap-3 pr-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
              transition={{ duration: 0.6 }}
              className="shrink-0 w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center"
            >
              <AlertTriangle className="w-4 h-4 text-destructive" strokeWidth={2.5} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-destructive leading-tight">{title}</p>
              <p className="mt-1 text-[11px] font-medium text-destructive/85 leading-relaxed">
                {message}
              </p>
            </div>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="إغلاق التنبيه"
                className="shrink-0 w-6 h-6 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
