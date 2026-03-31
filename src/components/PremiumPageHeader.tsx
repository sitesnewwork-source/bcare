import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroInsuranceBg from "@/assets/hero-insurance-bg.jpg";
import FloatingParticles from "@/components/FloatingParticles";

interface PremiumPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  children?: React.ReactNode;
  compact?: boolean;
}

const PremiumPageHeader = ({ title, subtitle, badge, badgeIcon, children, compact }: PremiumPageHeaderProps) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section ref={ref} className={`relative overflow-hidden ${compact ? "pt-20 pb-12 md:pt-24 md:pb-16" : "pt-20 pb-14 md:pt-24 md:pb-20 lg:pb-28"}`}>
      {/* Background with parallax */}
      <motion.img
        src={heroInsuranceBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={800}
        style={{ y: parallaxY, scale: 1.15 }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/40" />

      {/* Decorative glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-cta/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cta/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary-foreground/5 rounded-full" />
      </div>

      <FloatingParticles count={15} />

      {/* Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {badge && (
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5 border border-primary-foreground/10">
              {badgeIcon}
              <span className="text-xs text-primary-foreground font-bold">{badge}</span>
            </div>
          )}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-primary-foreground mb-3 md:mb-4 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-lg text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumPageHeader;
