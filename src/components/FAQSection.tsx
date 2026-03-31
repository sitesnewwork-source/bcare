import { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const categories = [
  { id: "buying", label: "شراء تأمين" },
  { id: "terms", label: "مصطلحات التأمين" },
  { id: "claims", label: "المطالبات" },
];

const faqData: Record<string, { question: string; answer: string }[]> = {
  buying: [
    {
      question: "ايش التغطية اللي توفرها بي كير؟",
      answer: "بي كير توفر مقارنة بين أكثر من 20 شركة تأمين لأنواع متعددة: تأمين المركبات، التأمين الطبي، تأمين السفر، تأمين الأخطاء الطبية، وتأمين العمالة المنزلية.",
    },
    {
      question: "كيف نحسب قيمة التأمين؟",
      answer: "يتم حساب قيمة التأمين بناءً على عدة عوامل منها: نوع السيارة، سنة الصنع، قيمة السيارة، سجل القيادة، والمنطقة الجغرافية.",
    },
    {
      question: "كيف تحصل على تسعيرة تأمين للسيارة؟",
      answer: "يمكنك الحصول على تسعيرة فورية من خلال تعبئة نموذج التأمين في الصفحة الرئيسية. أدخل بياناتك وبيانات سيارتك وستحصل على أفضل العروض.",
    },
    {
      question: "شريت سيارة جديدة كيف أأمن عليها؟",
      answer: 'ببساطة، ادخل على موقعنا واختر "تأمين جديد"، ثم أدخل بيانات السيارة الجديدة وبياناتك الشخصية وستحصل على عروض التأمين المناسبة.',
    },
  ],
  terms: [
    {
      question: "ما هو التأمين الشامل؟",
      answer: "التأمين الشامل يغطي الأضرار التي تلحق بسيارتك وسيارة الطرف الآخر، بالإضافة إلى الحريق والسرقة والكوارث الطبيعية.",
    },
    {
      question: "ما الفرق بين التأمين الشامل وضد الغير؟",
      answer: "التأمين ضد الغير يغطي فقط أضرار الطرف الآخر، بينما الشامل يغطي أضرارك وأضرار الغير معاً.",
    },
    {
      question: "ما هو الخصم؟",
      answer: "الخصم هو المبلغ الذي يتحمله المؤمن له من قيمة المطالبة عند وقوع حادث.",
    },
  ],
  claims: [
    {
      question: "كيف أقدم مطالبة؟",
      answer: "يمكنك تقديم مطالبة أونلاين من خلال تعبئة نموذج المطالبة وإرفاق المستندات المطلوبة. فريقنا سيتواصل معك خلال 24 ساعة.",
    },
    {
      question: "كم مدة معالجة المطالبة؟",
      answer: "عادةً يتم معالجة المطالبات خلال 5-7 أيام عمل من تاريخ تقديم جميع المستندات المطلوبة.",
    },
    {
      question: "ما المستندات المطلوبة لتقديم مطالبة؟",
      answer: "تحتاج تقرير الحادث من نجم أو المرور، صور الأضرار، رخصة القيادة، واستمارة السيارة.",
    },
  ],
};

const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState("buying");

  return (
    <section className="py-20 bg-background">
      <div className="section-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            الأسئلة الشائعة
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-3 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqData[activeCategory]?.map((faq, index) => (
              <AccordionItem
                key={`${activeCategory}-${index}`}
                value={`${activeCategory}-${index}`}
                className="border border-border rounded-2xl px-6 data-[state=open]:bg-secondary/50"
              >
                <AccordionTrigger className="text-right text-base font-bold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
