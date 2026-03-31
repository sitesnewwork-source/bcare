import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { ShieldCheck, Award, BadgeCheck, Landmark, FileCheck2, Handshake } from "lucide-react";

const achievements = [
  {
    icon: Landmark,
    titleAr: "مرخصة من البنك المركزي",
    titleEn: "Licensed by SAMA",
    descAr: "مرخصة ومعتمدة من البنك المركزي السعودي (ساما) كوسيط تأمين إلكتروني",
    descEn: "Licensed and approved by the Saudi Central Bank (SAMA) as an electronic insurance broker",
    color: "from-primary/15 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: ShieldCheck,
    titleAr: "معتمدة من نجم",
    titleEn: "Najm Certified",
    descAr: "شريك معتمد مع شركة نجم لخدمات التأمين لتسهيل إجراءات الحوادث المرورية",
    descEn: "Certified partner with Najm Insurance Services for streamlined accident processing",
    color: "from-emerald-500/15 to-emerald-500/5",
    iconColor: "text-emerald-600",
  },
  {
    icon: Award,
    titleAr: "جائزة التميز الرقمي",
    titleEn: "Digital Excellence Award",
    descAr: "حاصلة على جائزة التميز في التحول الرقمي لقطاع التأمين في المملكة",
    descEn: "Awarded for digital transformation excellence in the Saudi insurance sector",
    color: "from-cta/15 to-cta/5",
    iconColor: "text-cta",
  },
  {
    icon: BadgeCheck,
    titleAr: "شهادة ISO 27001",
    titleEn: "ISO 27001 Certified",
    descAr: "حاصلة على شهادة أمن المعلومات الدولية لضمان حماية بيانات العملاء",
    descEn: "Certified in international information security to ensure client data protection",
    color: "from-blue-500/15 to-blue-500/5",
    iconColor: "text-blue-600",
  },
  {
    icon: Handshake,
    titleAr: "18+ شركة تأمين شريكة",
    titleEn: "18+ Insurance Partners",
    descAr: "شراكات استراتيجية مع أكبر شركات التأمين في المملكة العربية السعودية",
    descEn: "Strategic partnerships with the largest insurance companies in Saudi Arabia",
    color: "from-violet-500/15 to-violet-500/5",
    iconColor: "text-violet-600",
  },
  {
    icon: FileCheck2,
    titleAr: "تسوية مطالبات سريعة",
    titleEn: "Fast Claims Settlement",
    descAr: "نسبة تسوية مطالبات تتجاوز 95% خلال 48 ساعة من تقديم الطلب",
    descEn: "Claims settlement rate exceeding 95% within 48 hours of submission",
    color: "from-rose-500/15 to-rose-500/5",
    iconColor: "text-rose-600",
  },
];

const AchievementsSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/[0.03] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-cta blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-4xl font-extrabold text-primary mb-3">
            {lang === "ar" ? "شركاء النجاح والاعتمادات" : "Partners & Certifications"}
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            {lang === "ar"
              ? "اعتمادات رسمية وشراكات استراتيجية تضمن لك تجربة تأمين موثوقة وآمنة"
              : "Official certifications and strategic partnerships ensuring a trusted and secure insurance experience"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((item, i) => (
            <motion.div
              key={item.titleEn}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group"
            >
              <div className="bg-card border border-border/60 rounded-2xl p-5 md:p-6 h-full hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {lang === "ar" ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "ar" ? item.descAr : item.descEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
