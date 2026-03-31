import { useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import PullToRefresh from "@/components/PullToRefresh";
import { toast } from "sonner";

const Index = () => {
  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("تم تحديث الصفحة", { icon: "🔄", duration: 1500 });
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        <Footer />
      </div>
    </PullToRefresh>
  );
};

export default Index;
