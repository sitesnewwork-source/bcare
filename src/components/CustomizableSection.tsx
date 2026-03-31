import { motion } from "framer-motion";
import { Settings, Plus, Sliders, Sparkles, Car, Shield } from "lucide-react";

const features = [
  { icon: Settings, label: "تخصيص التغطية", desc: "اختر التغطيات المناسبة" },
  { icon: Sliders, label: "تحكم بالمبلغ", desc: "حدد مبلغ التحمل" },
  { icon: Plus, label: "إضافات اختيارية", desc: "أضف مزايا حسب حاجتك" },
];

const CustomizableSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.03] rounded-full translate-x-1/2 -translate-y-1/2" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 60 }}
            className="order-2 lg:order-1"
          >
            <div className="relative bg-primary rounded-3xl p-10 aspect-square flex items-center justify-center overflow-hidden">
              {/* Animated decorative elements */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-6 right-6 w-24 h-24 bg-cta/20 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute bottom-10 left-10 w-36 h-36 bg-cta/10 rounded-full"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-cta/20 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cta/10 rounded-full" />

              <div className="relative z-10 text-center space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="w-20 h-20 bg-cta/20 rounded-3xl flex items-center justify-center mx-auto"
                >
                  <Sparkles className="w-10 h-10 text-cta" />
                </motion.div>

                <div className="flex justify-center gap-4">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="bg-primary-foreground/10 backdrop-blur-sm p-3 rounded-2xl border border-primary-foreground/10"
                    >
                      <f.icon className="w-6 h-6 text-cta" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-primary-foreground/70 text-sm max-w-[220px] mx-auto">
                  أضف إضافات وخصص تغطيتك حسب احتياجاتك
                </p>
              </div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 60 }}
            className="order-1 lg:order-2 text-right"
          >
            <span className="inline-block text-cta font-bold text-sm bg-cta/10 px-4 py-1.5 rounded-full mb-4">
              مرونة كاملة
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              مرن و قابل <br />للتخصيص
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
              تخصيص تغطيتك حسب الحاجات. أضف إضافات اختيارية. نحن هنا لنتكيف معك.
            </p>

            {/* Feature cards */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border hover:border-primary/20 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:shadow-lg transition-all duration-300">
                    <f.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{f.label}</h4>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CustomizableSection;
