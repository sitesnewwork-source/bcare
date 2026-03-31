import { motion } from "framer-motion";
import { Clock, SlidersHorizontal, TrendingDown, CalendarClock, Zap, BadgePercent, Shield, Building2 } from "lucide-react";

const features = [
  { icon: Clock, title: "تأمينك في دقيقة", desc: "نُقارن لك كل عروض الأسعار بشكل فوري من كل شركات التأمين" },
  { icon: SlidersHorizontal, title: "فصّل تأمينك", desc: "أنواع تأمين متعددة: تأمين ضد الغير، تأمين مميز، تأمين شامل وقيمة تحمل متنوعة" },
  { icon: TrendingDown, title: "أسعار أقل", desc: "عندنا فريق يراقب كل صغيرة وكبيرة في السوق ويضمن أن سعرك الأقل" },
  { icon: CalendarClock, title: "جدول تأمينك", desc: "نُرسل لك إشعارات تذكيرية لتجديد تأمينك وتقدر تجدول تاريخ بدايته" },
  { icon: Zap, title: "هب ريح", desc: "نُربط وثيقتك في أسرع وقت مع نظام المرور ونجم" },
  { icon: BadgePercent, title: "خصومات تضبطك", desc: "خصومات لبعض القطاعات الحكومية وشبه الحكومية والخاصة" },
  { icon: Shield, title: "منافع تحميك", desc: "خطط تأمين متنوعة مع المرونة في تحديد المنافع الإضافية اللي تناسبك" },
  { icon: Building2, title: "مكان واحد", desc: "تُدير كل وثائقك إدارة إلكترونية كاملة من مكان واحد وتُجددها في أي وقت" },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-primary mb-3">
            طريقك آمــن مع بي كير
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            منصة واحدة تجمع لك كل ما تحتاجه في التأمين
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-5 lg:p-6 border border-border text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:shadow-lg transition-all duration-300">
                <f.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;