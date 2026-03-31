import { motion } from "framer-motion";
import { Clock, SlidersHorizontal, TrendingDown, CalendarClock, Zap, BadgePercent, Shield, Building2 } from "lucide-react";

const features = [
  { icon: Shield, title: "منافع وشبكات متعددة", desc: "اطلع على تفاصيل وثيقتك وحدود تغطيتها في أي وقت" },
  { icon: SlidersHorizontal, title: "عشر بيدك", desc: "عشر فئات تأمينية تغطي شبكة المستشفيات المختلفة في المملكة" },
  { icon: Zap, title: "سرعة الربط مع نجم", desc: "نربط وثيقتك بأسرع وقت في نظام المرور ونجم" },
  { icon: CalendarClock, title: "إضافة وحذف الأعضاء", desc: "سهل إنك تضيف أو تلغي أي عضو اونلاين" },
  { icon: Clock, title: "تلقانا حولك", desc: "مكاتب موظفينا حولك تخدمك في تأمينك في المستشفيات المتعاقدة معنا" },
  { icon: TrendingDown, title: "فئتك التأمينية", desc: "مرونة تغيير نوع الفئة في أي وقت حسب سياسة الشركة" },
  { icon: Building2, title: "إدارة وثيقتك", desc: "تدير وثيقتك إدارة إلكترونية كاملة وتجددها بشكل مضمون" },
  { icon: BadgePercent, title: "معك لحظة بلحظة", desc: "نتابع مطالباتك ونحرص على تخليص الموافقات لعملاء فئة VIP" },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-4xl font-extrabold text-primary mb-3">
            مع بي كير خذ تأمينك وأنت متطمّن
          </h2>
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
              <h3 className="font-bold text-foreground mb-2 text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
