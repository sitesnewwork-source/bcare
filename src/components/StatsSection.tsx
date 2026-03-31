import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Users, Shield, Building2, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const stats = [
  { icon: Users, value: 500000, suffix: "+", labelAr: "عميل يثق بنا", labelEn: "Trusted Clients" },
  { icon: Shield, value: 2000000, suffix: "+", labelAr: "وثيقة تأمين صادرة", labelEn: "Policies Issued" },
  { icon: Building2, value: 18, suffix: "", labelAr: "شركة تأمين شريكة", labelEn: "Insurance Partners" },
  { icon: Award, value: 10, suffix: "+", labelAr: "سنوات من الخبرة", labelEn: "Years of Experience" },
];

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{formatNumber(count)}{suffix}</span>;
};

const StatsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-primary/[0.03] to-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-cta blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl lg:text-4xl font-extrabold text-primary mb-3">
            {lang === "ar" ? "بي كير بالأرقام" : "BCare in Numbers"}
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            {lang === "ar"
              ? "أرقام تعكس ثقة عملائنا وخبرتنا الطويلة في سوق التأمين السعودي"
              : "Numbers reflecting our clients' trust and long experience in the Saudi insurance market"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.labelEn}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group text-center"
            >
              <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2 tabular-nums">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {lang === "ar" ? stat.labelAr : stat.labelEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
