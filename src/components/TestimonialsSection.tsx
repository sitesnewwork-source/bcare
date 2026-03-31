import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    nameAr: "عبدالله المطيري",
    nameEn: "Abdullah Al-Mutairi",
    roleAr: "صاحب أعمال",
    roleEn: "Business Owner",
    textAr: "أفضل تجربة تأمين مريتها! قارنت بين أكثر من 10 شركات واخترت الأنسب لي بكل سهولة. الأسعار منافسة والخدمة ممتازة.",
    textEn: "Best insurance experience I've had! Compared over 10 companies and chose the best one easily. Competitive prices and excellent service.",
    rating: 5,
    avatar: "ع",
  },
  {
    nameAr: "سارة القحطاني",
    nameEn: "Sarah Al-Qahtani",
    roleAr: "موظفة حكومية",
    roleEn: "Government Employee",
    textAr: "سهولة في الاستخدام وسرعة في الإجراءات. أمنت سيارتي بأقل من 5 دقائق والوثيقة وصلتني فوراً. أنصح الجميع يجربون بي كير.",
    textEn: "Easy to use and fast process. Insured my car in less than 5 minutes and received the policy instantly. Highly recommend BCare.",
    rating: 5,
    avatar: "س",
  },
  {
    nameAr: "فهد العتيبي",
    nameEn: "Fahd Al-Otaibi",
    roleAr: "مهندس",
    roleEn: "Engineer",
    textAr: "الشفافية في الأسعار والعروض هي اللي خلتني أختار بي كير. ما في رسوم خفية وكل شي واضح من البداية. تجربة رائعة فعلاً.",
    textEn: "Price transparency made me choose BCare. No hidden fees and everything is clear from the start. Truly a great experience.",
    rating: 5,
    avatar: "ف",
  },
  {
    nameAr: "نورة الشمري",
    nameEn: "Noura Al-Shammari",
    roleAr: "معلمة",
    roleEn: "Teacher",
    textAr: "خدمة عملاء متميزة ومتعاونة. ساعدوني أختار التأمين المناسب لعائلتي بكل احترافية. شكراً بي كير!",
    textEn: "Outstanding and cooperative customer service. They helped me choose the right insurance for my family professionally. Thank you BCare!",
    rating: 5,
    avatar: "ن",
  },
  {
    nameAr: "محمد الدوسري",
    nameEn: "Mohammed Al-Dosari",
    roleAr: "رجل أعمال",
    roleEn: "Businessman",
    textAr: "أمنت جميع سيارات شركتي عن طريق بي كير ووفرت أكثر من 30% مقارنة بالتأمين المباشر. خدمة احترافية من الدرجة الأولى.",
    textEn: "Insured all my company cars through BCare and saved over 30% compared to direct insurance. First-class professional service.",
    rating: 5,
    avatar: "م",
  },
  {
    nameAr: "ريم الحربي",
    nameEn: "Reem Al-Harbi",
    roleAr: "طبيبة",
    roleEn: "Doctor",
    textAr: "تجربة تأمين طبي ممتازة! الشبكة الطبية واسعة والتغطية شاملة. أفضل قرار اتخذته هو التأمين عبر بي كير.",
    textEn: "Excellent health insurance experience! Wide medical network and comprehensive coverage. Best decision I made was insuring through BCare.",
    rating: 5,
    avatar: "ر",
  },
];

const TestimonialsSection = () => {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Show 3 testimonials at a time on desktop, 1 on mobile
  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(testimonials[(activeIndex + i) % testimonials.length]);
    }
    return result;
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-[hsl(193,72%,28%)]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-cta blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-foreground/5 blur-[80px]" />
      </div>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-4 backdrop-blur-sm border border-white/10">
            ⭐ {lang === "ar" ? "تقييم 4.9 من 5" : "Rated 4.9 out of 5"}
          </span>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-3">
            {lang === "ar" ? "آراء عملائنا" : "What Our Clients Say"}
          </h2>
          <p className="text-white/70 text-sm max-w-xl mx-auto">
            {lang === "ar"
              ? "اكتشف لماذا يختار أكثر من نصف مليون عميل بي كير لتأمينهم"
              : "Discover why over half a million clients choose BCare for their insurance"}
          </p>
        </motion.div>

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {getVisibleTestimonials().map((t, i) => (
            <motion.div
              key={`${t.nameEn}-${activeIndex}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 hover:bg-white/15 hover:border-white/25 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 flex flex-col"
            >
              <Quote className="w-8 h-8 text-cta/40 mb-3" />
              <p className="text-sm text-white/85 leading-relaxed flex-1 mb-4">
                "{lang === "ar" ? t.textAr : t.textEn}"
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-cta text-cta" />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-cta/20 flex items-center justify-center text-cta font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {lang === "ar" ? t.nameAr : t.nameEn}
                  </p>
                  <p className="text-[11px] text-white/50">
                    {lang === "ar" ? t.roleAr : t.roleEn}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: 1 card with swipe dots */}
        <div className="md:hidden">
          <motion.div
            key={`mobile-${activeIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5"
          >
            <Quote className="w-7 h-7 text-cta/40 mb-3" />
            <p className="text-sm text-white/85 leading-relaxed mb-4">
              "{lang === "ar" ? testimonials[activeIndex].textAr : testimonials[activeIndex].textEn}"
            </p>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: testimonials[activeIndex].rating }).map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-cta text-cta" />
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div className="w-10 h-10 rounded-full bg-cta/20 flex items-center justify-center text-cta font-bold text-sm">
                {testimonials[activeIndex].avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {lang === "ar" ? testimonials[activeIndex].nameAr : testimonials[activeIndex].nameEn}
                </p>
                <p className="text-[11px] text-white/50">
                  {lang === "ar" ? testimonials[activeIndex].roleAr : testimonials[activeIndex].roleEn}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-cta w-6"
                    : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
