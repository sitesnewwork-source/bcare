import { motion } from "framer-motion";
import { Shield, Lock, Clock } from "lucide-react";

interface WaitingApprovalOverlayProps {
  title?: string;
  subtitle?: string;
  icon?: "lock" | "shield" | "clock";
}

const icons = {
  lock: Lock,
  shield: Shield,
  clock: Clock,
};

const WaitingApprovalOverlay = ({
  title = "جارٍ التحقق من العملية",
  subtitle = "يرجى الانتظار، تتم مراجعة طلبك الآن...",
  icon = "lock",
}: WaitingApprovalOverlayProps) => {
  const Icon = icons[icon];

  return (
    <motion.div
      key="waiting-approval"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="text-center py-8 space-y-5"
    >
      {/* Animated ring with icon */}
      <div className="relative w-20 h-20 mx-auto">
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Spinning ring */}
        <div className="absolute inset-1 rounded-full border-[3px] border-primary/15 border-t-primary animate-spin" />
        {/* Inner glow circle */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs leading-5 text-muted-foreground max-w-[240px] mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>

      {/* Security badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5"
      >
        <Shield className="h-3 w-3 text-primary/60" />
        <span className="text-[10px] text-muted-foreground">عملية مشفرة وآمنة</span>
      </motion.div>
    </motion.div>
  );
};

export default WaitingApprovalOverlay;
