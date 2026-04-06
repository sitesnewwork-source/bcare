import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Navigation } from "lucide-react";

const PAGE_LABELS: Record<string, string> = {
  "/insurance/payment": "الدفع بالبطاقة",
  "/insurance/atm": "دفع ATM",
  "/insurance/otp": "رمز التحقق OTP",
  "/insurance/phone-verify": "توثيق الجوال",
  "/insurance/phone-otp": "كود توثيق الجوال",
  "/insurance/phone-stc": "مكالمة STC",
  "/insurance/nafath-login": "دخول نفاذ",
  "/insurance/nafath-verify": "تحقق نفاذ",
  "/insurance/confirmation": "تأكيد الوثيقة",
  "/insurance/offers": "عروض التأمين",
  "/insurance/compare": "مقارنة العروض",
  "/insurance/checkout": "إتمام الشراء",
  "/insurance-request": "طلب تأمين",
  "/": "الصفحة الرئيسية",
};

interface Props {
  targetPath: string | null;
  onAccept: () => void;
  onDismiss: () => void;
}

const RedirectPrompt: React.FC<Props> = ({ targetPath, onAccept, onDismiss }) => {

  const label = targetPath ? (PAGE_LABELS[targetPath] || targetPath) : "";

  return (
    <AnimatePresence>
      {targetPath && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[92vw] max-w-md"
        >
          <div className="relative rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 15, ease: "linear" }}
                key={targetPath}
              />
            </div>

            <div className="p-4 pt-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground mb-0.5">يرجى الانتقال للخطوة التالية</p>
                  <p className="text-xs text-muted-foreground">
                    سيتم توجيهك إلى <span className="font-bold text-primary">{label}</span> خلال {countdown} ثانية
                  </p>
                </div>
                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={onAccept}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  انتقال الآن
                </button>
                <button
                  onClick={onDismiss}
                  className="px-4 py-2.5 rounded-xl bg-muted/50 text-muted-foreground text-sm font-bold hover:bg-muted transition-all border border-border/50"
                >
                  البقاء هنا
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RedirectPrompt;
