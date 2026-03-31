import { motion } from "framer-motion";
import { Shield, SlidersHorizontal, Zap, CalendarClock, Clock, TrendingDown, Building2, BadgePercent, Stethoscope, FileCheck, Scale, Settings2, Gift, FileText } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const iconSet = [Clock, SlidersHorizontal, TrendingDown, CalendarClock, Zap, BadgePercent, Shield, Building2];

interface WhyChooseUsProps {
  activeTab?: string;
}

const WhyChooseUs = ({ activeTab = "vehicles" }: WhyChooseUsProps) => {
  const { t } = useLanguage();
  const tabKey = activeTab as keyof typeof t.whyChooseUs;
  const content = t.whyChooseUs[tabKey] || t.whyChooseUs.vehicles;

  return (
    <section className="py-10 lg:py-14 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-4xl font-extrabold text-primary mb-3">
            {content.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {content.items.map((f, i) => {
            const Icon = iconSet[i % iconSet.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-5 lg:p-6 border border-border text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:shadow-lg transition-all duration-300">
                  <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
