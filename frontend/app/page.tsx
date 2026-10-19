import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import OpportunityCategories from "@/components/home/OpportunityCategories";
import LatestJobs from "@/components/home/LatestJobs";
import OnlineTasks from "@/components/home/OnlineTasks";
import HowItWorks from "@/components/home/HowItWorks";
import PlatformBenefits from "@/components/home/PlatformBenefits";
import AboutUs from "@/components/home/AboutUs";
import Reviews from "@/components/home/Reviews";
import CallToAction from "@/components/home/CallToAction";

/**
 * KaziHub KE home page — assembles the sections in order:
 * Navbar → Hero → Categories → Jobs → Tasks → How It Works →
 * Benefits → About → Reviews → CTA → Footer.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <OpportunityCategories />
        <LatestJobs />
        <OnlineTasks />
        <HowItWorks />
        <PlatformBenefits />
        <AboutUs />
        <Reviews />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
