import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Shield, Car, Zap } from "lucide-react";

const coverageTypes = [
  {
    id: "comprehensive",
    label: "التأمين الشامل",
    icon: Shield,
    title: "التأمين الشامل",
    subtitle: "أعلى مستوى من الحماية لقيادة آمنة",
    features: [
      { text: "خدمات الحل الشامل للمطالبات", included: true },
      { text: "المساعدة على الطريق مجانًا!", included: true },
      { text: "تغطية ضد الكوارث الطبيعية (البرد والفيضانات)", included: true },
      { text: "تغطية ضد الحريق", included: true },
      { text: "شبكة واسعة النطاق", included: true },
      { text: "جميع الخدمات في التأمين ضد الغير", included: true },
    ],
  },
  {
    id: "third-party",
    label: "ضد الغير",
    icon: Car,
    title: "ضد الغير",
    subtitle: "تأمين طرف ثالث يحميك ويحمي الغير ويفزع لك في المواقف الصعبة",
    features: [
      { text: "ضد الغير", included: true },
      { text: "الحوادث الشخصية مجانًا!", included: true },
      { text: "تغطية الاصطدام", included: true },
      { text: "تغطية الإيذاء المتعمد و السرقة", included: false },
      { text: "المساعدة على الطريق", included: false },
      { text: "تغطية الزجاج والمحرك", included: false },
      { text: "التغطية الخليجية", included: false },
      { text: "سيارة بديلة", included: false },
    ],
  },
];

const InsuranceTypes = () => {
  const [activeType, setActiveType] = useState("comprehensive");
  const activeCoverage = coverageTypes.find((c) => c.id === activeType)!;

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-cta font-semibold mb-2">كمّل طريقك، سالم ومتطمّن ومأمّن!</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            خيارات التغطية
          </h2>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-muted rounded-2xl p-1.5 gap-1">
            {coverageTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeType === type.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card rounded-3xl border border-border p-8 card-elevated">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <activeCoverage.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{activeCoverage.title}</h3>
                <p className="text-muted-foreground">{activeCoverage.subtitle}</p>
              </div>

              <div className="space-y-3">
                {activeCoverage.features.map((f) => (
                  <div
                    key={f.text}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      f.included ? "bg-primary/5" : "bg-muted/50"
                    }`}
                  >
                    {f.included ? (
                      <div className="w-6 h-6 rounded-full bg-cta/20 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <span
                      className={`text-sm font-medium ${
                        f.included ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default InsuranceTypes;
