import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

const discounts = [
  { name: "نون", discount: "خصم 15%", color: "bg-[#FEEE00]", textColor: "text-black", initial: "N" },
  { name: "سيفي", discount: "خصم 10%", color: "bg-[#1A1A2E]", textColor: "text-white", initial: "S" },
  { name: "الوزن المثالي", discount: "خصم 50%", color: "bg-[#4CAF50]", textColor: "text-white", initial: "PW" },
  { name: "درايف7", discount: "خصم 20%", color: "bg-[#FF5722]", textColor: "text-white", initial: "D7" },
  { name: "سويتر", discount: "خصم 20%", color: "bg-[#E91E63]", textColor: "text-white", initial: "SW" },
  { name: "فيزيوثيرابيا", discount: "خصم 20%", color: "bg-[#00BCD4]", textColor: "text-white", initial: "FT" },
  { name: "نوفميد", discount: "خصم 15%", color: "bg-[#3F51B5]", textColor: "text-white", initial: "NV" },
  { name: "روش ريحان", discount: "خصم 15%", color: "bg-[#795548]", textColor: "text-white", initial: "RR" },
];

const DiscountsSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl lg:text-4xl font-extrabold text-primary mb-3">
            خصومات وريف
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            خصومات وعروض مباشرة من مختلف المتاجر العالمية والمحلية لعملاء بي كير
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {discounts.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className={`${d.color} h-28 flex items-center justify-center`}>
                <span className={`text-3xl font-extrabold ${d.textColor}`}>{d.initial}</span>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-foreground text-sm mb-1">{d.name}</h3>
                <span className="text-cta font-extrabold text-lg">{d.discount}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <button className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
            عرض المزيد من الخصومات
            <ChevronLeft className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default DiscountsSection;
