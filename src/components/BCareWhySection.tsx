import { motion } from "framer-motion";
import { MapPin, CreditCard, Zap, Flame, TrendingDown, Headphones } from "lucide-react";

const reasons = [
  { icon: MapPin, title: "منك وفيك", color: "text-primary" },
  { icon: CreditCard, title: "عروض تفهمك", color: "text-primary" },
  { icon: TrendingDown, title: "سعر يرضيك", color: "text-cta" },
  { icon: Zap, title: "إصدار سريع", color: "text-primary" },
  { icon: Flame, title: "نقّسط تأمينك", color: "text-cta" },
  { icon: Headphones, title: "نفزع لك", color: "text-primary" },
];

const BCareWhySection = () => (
  <section className="py-16 lg:py-24 bg-background">
    <div className="section-container">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl lg:text-4xl font-extrabold text-primary text-center mb-12"
      >
        ليش بي كير خيارك الأول في التأمين؟
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {reasons.map((r, i) => (
          <motion.div
            key={r.title}
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

export default BCareWhySection;