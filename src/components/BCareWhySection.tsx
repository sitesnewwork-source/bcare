import { motion } from "framer-motion";
import { MapPin, CreditCard, Zap, Flame, TrendingDown, Headphones } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BCareWhySection = () => {
  const { t } = useLanguage();

  const reasons = [
    { icon: MapPin, title: t.whyBcare.reasons.local, color: "text-primary" },
    { icon: CreditCard, title: t.whyBcare.reasons.offers, color: "text-primary" },
    { icon: TrendingDown, title: t.whyBcare.reasons.price, color: "text-cta" },
    { icon: Zap, title: t.whyBcare.reasons.fast, color: "text-primary" },
    { icon: Flame, title: t.whyBcare.reasons.installments, color: "text-cta" },
    { icon: Headphones, title: t.whyBcare.reasons.support, color: "text-primary" },
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl lg:text-4xl font-extrabold text-primary text-center mb-12"
          dir="auto"
        >
          {t.whyBcare.title}
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <r.icon className={`w-8 h-8 ${r.color} group-hover:text-primary-foreground transition-colors`} />
              </div>
              <h3 className="font-bold text-foreground text-sm">{r.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BCareWhySection;
