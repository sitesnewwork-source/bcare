import { useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PartnersStrip from "@/components/PartnersStrip";
import WhyChooseUs from "@/components/WhyChooseUs";
import DiscountsSection from "@/components/DiscountsSection";
import BCareWhySection from "@/components/BCareWhySection";
import Footer from "@/components/Footer";
import PullToRefresh from "@/components/PullToRefresh";
import { toast } from "sonner";
// ... keep existing code
        <HeroSection onTabChange={setActiveTab} />
        <PartnersStrip />
        <WhyChooseUs activeTab={activeTab} />
        <DiscountsSection />
        <BCareWhySection />
        <Footer />
      </div>
    </PullToRefresh>
  );
};

export default Index;
