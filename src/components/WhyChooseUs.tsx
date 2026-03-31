import { motion } from "framer-motion";
import { Shield, SlidersHorizontal, Zap, CalendarClock, Clock, TrendingDown, Building2, BadgePercent, Stethoscope, FileCheck, Scale, Settings2, Gift, FileText } from "lucide-react";

const featureSets: Record<string, { title: string; items: { icon: any; title: string; desc: string }[] }> = {
  vehicles: {
    title: "طريقك آمــن مع بي كير",
    items: [
      { icon: Clock, title: "تأمينك في دقيقة", desc: "نُقارن لك كل عروض الأسعار بشكل فوري من كل شركات التأمين" },
      { icon: SlidersHorizontal, title: "فصّل تأمينك", desc: "أنواع تأمين متعددة: تأمين ضد الغير، تأمين مميز، تأمين شامل وقيمة تحمل متنوعة" },
      { icon: TrendingDown, title: "أسعار أقل", desc: "عندنا فريق يراقب كل صغيرة وكبيرة في السوق ويضمن أن سعرك الأقل" },
      { icon: CalendarClock, title: "جدول تأمينك", desc: "نُرسل لك إشعارات تذكيرية لتجديد تأمينك وتقدر تجدول تاريخ بدايته" },
      { icon: Zap, title: "هب ريح", desc: "نُربط وثيقتك في أسرع وقت مع نظام المرور ونجم" },
      { icon: BadgePercent, title: "خصومات تضبطك", desc: "خصومات لبعض القطاعات الحكومية وشبه الحكومية والخاصة" },
      { icon: Shield, title: "منافع تحميك", desc: "خطط تأمين متنوعة مع المرونة في تحديد المنافع الإضافية اللي تناسبك" },
      { icon: Building2, title: "مكان واحد", desc: "تُدير كل وثائقك إدارة إلكترونية كاملة من مكان واحد وتُجددها في أي وقت" },
    ],
  },
  medical: {
    title: "مع بي كير خذ التأمين الطبي لموظفينك وأنت متطمّن",
    items: [
      { icon: Shield, title: "منافع وشبكات متعددة", desc: "اطلع على تفاصيل وثيقتك وحدود تغطيتها في أي وقت" },
      { icon: SlidersHorizontal, title: "عشر بيدك", desc: "عشر فئات تأمينية تغطي شبكة المستشفيات المختلفة في المملكة" },
      { icon: Zap, title: "سرعة الربط مع CCHI", desc: "نربط وثيقتك بأسرع وقت في مجلس الضمان الصحي التعاوني" },
      { icon: CalendarClock, title: "إضافة وحذف الأعضاء", desc: "سهل إنك تضيف أو تلغي أي عضو اونلاين" },
      { icon: Clock, title: "تلقانا حولك", desc: "مكاتب موظفينا حولك تخدمك في تأمينك الطبي في المستشفيات المتعاقدة معنا" },
      { icon: TrendingDown, title: "فئتك التأمينية", desc: "مرونة تغيير نوع الفئة في أي وقت حسب سياسة الشركة" },
      { icon: Building2, title: "إدارة وثيقتك", desc: "تدير وثيقتك إدارة إلكترونية كاملة وتجددها بشكل مضمون" },
      { icon: BadgePercent, title: "معك لحظة بلحظة", desc: "نتابع مطالباتك ونحرص على تخليص الموافقات الطبية لعملاء فئة VIP" },
    ],
  },
  malpractice: {
    title: "مارس مهنتك بكل ثقة",
    items: [
      { icon: Stethoscope, title: "تأمين لكل التخصصات", desc: "نأمن كل التخصصات الصحية وتقدر تضيف أي تخصص جديد مع فريق الدعم الفني" },
      { icon: Zap, title: "عروض أسعار فورية", desc: "نقارن لك عروض أسعار شركات التأمين بشكل فوري" },
      { icon: Scale, title: "حماية مهنتك", desc: "تغطية التكاليف الطبية والقانونية والتعويضات المالية لأي مريض" },
      { icon: SlidersHorizontal, title: "فصل تغطيتك", desc: "تغطيات تناسب احتياجك من سنة إلى خمس سنوات" },
      { icon: Settings2, title: "تحكم مرن", desc: "التحكم في التغطية السنوية وحد المطالبة الوحدة" },
      { icon: BadgePercent, title: "خصومات تضبطك", desc: "خصومات ثابتة لبعض القطاعات الحكومية وشبه الحكومية والخاصة" },
      { icon: Gift, title: "منافع إضافية", desc: "إمكانية تمديد مدة التبليغ عن المطالبة والتأمين بأثر رجعي من سنة إلى سنتين" },
      { icon: FileText, title: "وثيقتك محفوظة", desc: "تقدر من خلالها تطبع وثيقتك في أي وقت" },
    ],
  },
  travel: {
    title: "سافر وأنت مطمّن مع بي كير",
    items: [
      { icon: Shield, title: "تغطية عالمية", desc: "تأمين سفر يغطي جميع أنحاء العالم بتغطية شاملة" },
      { icon: Zap, title: "إصدار فوري", desc: "احصل على وثيقة التأمين فوراً بعد الشراء" },
      { icon: Stethoscope, title: "تغطية طبية", desc: "تغطية المصاريف الطبية الطارئة أثناء السفر" },
      { icon: CalendarClock, title: "مرونة المدة", desc: "اختر مدة التأمين التي تناسب رحلتك" },
      { icon: TrendingDown, title: "أسعار تنافسية", desc: "نقارن لك أفضل الأسعار من شركات التأمين" },
      { icon: FileCheck, title: "تأمين تأشيرة شنغن", desc: "تأمين معتمد لطلبات تأشيرة شنغن الأوروبية" },
      { icon: Building2, title: "إدارة سهلة", desc: "تدير وثيقتك إلكترونياً من أي مكان" },
      { icon: BadgePercent, title: "خصومات جماعية", desc: "خصومات خاصة للمجموعات والعائلات" },
    ],
  },
  domestic: {
    title: "أمّن عمالتك المنزلية مع بي كير",
    items: [
      { icon: Shield, title: "تغطية شاملة", desc: "تغطية تأمينية شاملة للعمالة المنزلية حسب متطلبات النظام" },
      { icon: Zap, title: "إصدار سريع", desc: "إصدار وثيقة التأمين بأسرع وقت ممكن" },
      { icon: TrendingDown, title: "أرخص الأسعار", desc: "نقارن لك الأسعار لنضمن حصولك على أقل سعر" },
      { icon: CalendarClock, title: "تجديد تلقائي", desc: "نذكرك بموعد تجديد التأمين قبل انتهائه" },
      { icon: SlidersHorizontal, title: "خيارات متعددة", desc: "خيارات تأمين متنوعة تناسب احتياجاتك" },
      { icon: Stethoscope, title: "تغطية طبية", desc: "تغطية المصاريف الطبية للعامل/ة المنزلي/ة" },
      { icon: Building2, title: "إدارة إلكترونية", desc: "تدير كل وثائقك إلكترونياً من مكان واحد" },
      { icon: BadgePercent, title: "عروض خاصة", desc: "عروض وخصومات حصرية لعملاء بي كير" },
    ],
  },
};

interface WhyChooseUsProps {
  activeTab?: string;
}

const WhyChooseUs = ({ activeTab = "vehicles" }: WhyChooseUsProps) => {
  const content = featureSets[activeTab] || featureSets.vehicles;

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
            {content.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {content.items.map((f, i) => (
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
