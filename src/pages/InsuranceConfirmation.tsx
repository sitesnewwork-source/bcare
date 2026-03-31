import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Home, FileText, Share2, Shield, Check, PartyPopper } from "lucide-react";

import InsuranceStepper from "@/components/InsuranceStepper";


const InsuranceConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const offer = location.state?.offer;
  const policyNumber = location.state?.policyNumber || "POL-00000000";

  return (
    <div className="min-h-[100dvh] bg-secondary/30">

      <div className="container mx-auto px-3 md:px-4 pt-8 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <InsuranceStepper active={3}  />

          <div className="max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-card rounded-2xl border border-border shadow-sm p-5 text-center">
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 rounded-xl bg-cta/10 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-cta" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-xl font-bold text-foreground mb-1">تم بنجاح! 🎉</h2>
                  <p className="text-xs text-muted-foreground mb-2">تمت عملية الشراء بنجاح وتم إصدار وثيقة التأمين الخاصة بك</p>
                  <p className="text-[11px] text-muted-foreground mb-4">بعد إتمام الدفع وربط البوليصة بحسابك في منصة النفاذ الوطني الموحد</p>
                </motion.div>

                {/* Policy Details */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-primary/5 rounded-lg p-3.5 mb-4 text-right space-y-2">
                  {[
                    { label: "رقم الوثيقة", value: policyNumber, mono: true, highlight: true },
                    ...(offer ? [
                      { label: "شركة التأمين", value: offer.company },
                      { label: "نوع التأمين", value: offer.type },
                      { label: "المبلغ المدفوع", value: `${offer.price?.toLocaleString()} ر.س`, highlight: true },
                    ] : []),
                    {
                      label: "فترة التغطية",
                      value: `${new Date().toLocaleDateString("ar-SA")} - ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("ar-SA")}`,
                    },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5">
                      <span className={`font-bold text-xs ${row.highlight ? "text-primary" : "text-foreground"} ${row.mono ? "font-mono" : ""}`} dir={row.mono ? "ltr" : undefined}>
                        {row.value}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{row.label}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Actions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-4 font-bold text-sm gap-2">
                    <Download className="w-3.5 h-3.5" />
                    تحميل الوثيقة PDF
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-xl gap-1.5 text-xs py-3">
                      <Share2 className="w-3.5 h-3.5" />
                      مشاركة
                    </Button>
                    <Button variant="outline" className="rounded-xl gap-1.5 text-xs py-3">
                      <FileText className="w-3.5 h-3.5" />
                      طباعة
                    </Button>
                  </div>

                  <Button variant="ghost" onClick={() => navigate("/")} className="w-full rounded-xl text-muted-foreground gap-1.5 text-xs">
                    <Home className="w-3.5 h-3.5" />
                    العودة للرئيسية
                  </Button>
                </motion.div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary/60" />
                  <p className="text-[10px] text-muted-foreground">تم إرسال نسخة من الوثيقة إلى بريدك الإلكتروني</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default InsuranceConfirmation;
