import { motion } from "framer-motion";
import { Award, Eye, Zap, Globe, BadgePercent, Headphones } from "lucide-react";

const reasons = [
  {
    icon: Award,
    title: "الأول في المملكة",
    desc: "كمنصة رائدة لجميع أنواع التأمين",
    gradient: "from-primary/10 to-primary/5",
  },
  {
    icon: Globe,
    title: "وجهة واحدة للتأمين",
    desc: "خيارات متعددة من شركات التأمين مع عملية مقارنة سلسة وسريعة",
    gradient: "from-cta/10 to-cta/5",
  },
  {
    icon: Eye,
    title: "الشفافية والوضوح",
    desc: "نضمن استخدام مصطلحات مباشرة وأسعار واضحة بدون رسوم مخفية",
    gradient: "from-accent/30 to-accent/10",
  },
  {
    icon: Zap,
    title: "إصدار فوري",
    desc: "احصل على وثيقة التأمين فوراً بعد إتمام عملية الشراء",
    gradient: "from-primary/10 to-primary/5",
  },
  {
    icon: BadgePercent,
    title: "تسعير موحّد",
    desc: "أسعار مطابقة لشركات التأمين إن لم تكن أقل من خلال عروضنا الحصرية",
    gradient: "from-cta/10 to-cta/5",
  },
  {
    icon: Headphones,
    title: "دعم فني متميز",
    desc: "كفاءة تعتمد عليها وإجابة سريعة لجميع استفساراتك",
    gradient: "from-accent/30 to-accent/10",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

const WhyChooseUs = () => {
  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Decorative bg elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/[0.03] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cta/[0.03] rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-cta font-bold text-sm bg-cta/10 px-4 py-1.5 rounded-full mb-4">لماذا نحن؟</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            ليش تختارنا؟
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اختر شريك تأمينك بذكاء — منصة واحدة تجمع لك أفضل العروض
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reasons.map((r) => (
            <motion.div
              key={r.title}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl p-7 border border-border group cursor-default relative overflow-hidden"
            >
              {/* Gradient bg on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                  <r.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
