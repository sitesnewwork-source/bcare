import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Shield } from "lucide-react";

const INSURANCE_FLOW_PATHS = [
  "/insurance/checkout",
  "/insurance/payment",
  "/insurance/otp",
  "/insurance/atm",
  "/insurance/phone-verify",
  "/insurance/phone-otp",
  "/insurance/phone-stc",
  "/insurance/nafath-login",
  "/insurance/nafath-verify",
  "/insurance/confirmation",
];

const isFlowPath = (path: string) => INSURANCE_FLOW_PATHS.includes(path);

const getFlowIndex = (path: string) => INSURANCE_FLOW_PATHS.indexOf(path);

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const directionRef = useRef<"forward" | "backward">("forward");

  const isFlowTransition = isFlowPath(prevPath) && isFlowPath(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath) {
      // Determine direction for flow transitions
      if (isFlowPath(prevPath) && isFlowPath(location.pathname)) {
        directionRef.current = getFlowIndex(location.pathname) > getFlowIndex(prevPath) ? "forward" : "backward";
      }

      const bothFlow = isFlowPath(prevPath) && isFlowPath(location.pathname);

      if (bothFlow) {
        // Light transition for flow pages - no heavy overlay
        setShowContent(false);
        const timer = setTimeout(() => {
          setShowContent(true);
          setPrevPath(location.pathname);
        }, 80);
        return () => clearTimeout(timer);
      } else {
        // Full loading overlay for other transitions
        setShowContent(false);
        setIsLoading(true);
        const timer1 = setTimeout(() => {
          setIsLoading(false);
          setShowContent(true);
          setPrevPath(location.pathname);
        }, 1200);
        return () => clearTimeout(timer1);
      }
    }
  }, [location.pathname, prevPath]);

  const direction = directionRef.current;
  const slideX = direction === "forward" ? 60 : -60;

  return (
    <>
      {/* Loading overlay - only for non-flow transitions */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-primary-foreground/10"
                  style={{
                    width: `${(i + 1) * 150}px`,
                    height: `${(i + 1) * 150}px`,
                    left: "50%",
                    top: "50%",
                    x: "-50%",
                    y: "-50%",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.3 }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
                />
              ))}
            </div>

            <div className="relative flex flex-col items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Shield className="w-8 h-8 text-primary-foreground" />
              </motion.div>

              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-cta"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              <motion.p
                className="text-primary-foreground/70 text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                جاري التحميل...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            key={location.pathname}
            initial={
              isFlowPath(location.pathname)
                ? { opacity: 0, x: slideX, scale: 0.97 }
                : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={
              isFlowPath(location.pathname)
                ? { opacity: 0, x: -slideX, scale: 0.97 }
                : { opacity: 0, y: -12 }
            }
            transition={
              isFlowPath(location.pathname)
                ? { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }
                : { duration: 0.4, ease: "easeOut" }
            }
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PageTransition;
