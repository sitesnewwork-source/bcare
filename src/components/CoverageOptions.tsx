import { motion } from "framer-motion";
import { Shield, Check, Zap, Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const coverageTypes = [
  {
    id: "comprehensive",
    title: "التأمين الشامل",
    description: "أعلى مستوى من الحماية لقيادة آمنة",
    icon: Shield,
    highlighted: true,
    badge: "الأكثر طلباً",
    features: [
      { text: "خدمات الحل الشامل للمطالبات", free: false },
      { text: "المساعدة على الطريق", free: true },
      { text: "تغطية ضد الكوارث الطبيعية", free: false },
      { text: "تغطية ضد الحريق", free: false },
      { text: "شبكة واسعة النطاق", free: false },
      { text: "جميع الخدمات في التأمين ضد الغير", free: false },
    ],
  },
  {
    id: "third-party",
    title: "ضد الغير",
    description: "تأمين طرف ثالث يحميك ويحمي الغير",
    icon: Zap,
    highlighted: false,
    badge: "الأقل سعراً",
    features: [
      { text: "ضد الغير", free: false },
      { text: "الحوادث الشخصية", free: true },
      { text: "تغطية الاصطدام", free: false },
      { text: "تغطية الإيذاء المتعمد والسرقة", free: false },
      { text: "المساعدة على الطريق", free: false },
      { text: "تغطية الزجاج والمحرك", free: false },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 80, damping: 15 },
  },
};

const CoverageOptions = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute top-20 right-0 w-80 h-80 bg-primary/[0.02] rounded-full translate-x-1/2" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-cta/[0.03] rounded-full -translate-x-1/2" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-cta font-bold text-sm bg-cta/10 px-4 py-1.5 rounded-full mb-4">
            كمّل طريقك، سالم ومتطمّن ومأمّن!
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            خيارات التغطية
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {coverageTypes.map((type) => (
            <motion.div
              key={type.id}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.25 },
              }}
              className={`rounded-3xl p-8 border relative overflow-hidden group ${
                type.highlighted
                  ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20 scale-[1.02]"
                  : "bg-card text-card-foreground border-border hover:shadow-xl hover:border-primary/20"
              }`}
            >
              {/* Badge */}
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold ${
                type.highlighted
                  ? "bg-cta text-cta-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {type.badge}
              </div>

              {/* Decorative circle */}
              <div className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full ${
                type.highlighted ? "bg-cta/10" : "bg-primary/5"
              } group-hover:scale-150 transition-transform duration-500`} />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  type.highlighted
                    ? "bg-cta/20"
                    : "bg-primary/10 group-hover:bg-primary/15"
                } transition-colors`}>
                  <type.icon className={`w-7 h-7 ${type.highlighted ? "text-cta" : "text-primary"}`} />
                </div>

                <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                <p className={`text-sm mb-6 leading-relaxed ${
                  type.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {type.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {type.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        type.highlighted ? "bg-cta/20" : "bg-cta/10"
                      }`}>
                        <Check className="w-3 h-3 text-cta" />
                      </div>
                      <span className="flex-1">
                        {feature.text}
                        {feature.free && (
                          <span className="inline-block mr-2 bg-cta/20 text-cta text-[10px] font-bold px-2 py-0.5 rounded-full">
                            مجانًا!
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate("/insurance-request")}
                  className={`w-full rounded-xl py-5 font-bold gap-2 ${
                    type.highlighted
                      ? "bg-cta text-cta-foreground hover:bg-cta-hover shadow-lg shadow-cta/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  أمّن الحين
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CoverageOptions;
