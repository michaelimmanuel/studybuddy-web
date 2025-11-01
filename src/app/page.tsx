import About from "@/components/section/About";
import FAQSection from "@/components/section/Faq";
import Hero from "@/components/section/Hero";     
import Pricing from "@/components/section/Pricing";
import Review from "@/components/section/Review";
import Stats from "@/components/section/Stats";
import Contact from "@/components/section/Contact";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <div className="h-48 bg-[#002644]"></div>
      {/* <Stats />
      <div className="h-48"></div> */}
      <Pricing />
      <div className="h-48 bg-gradient-to-b from-[#005FAA] to-[#005FAA]/[0.79]"></div>
      <Review/>
      <div className="h-48"></div>
      <FAQSection />
      <div className="h-48"></div>
      <Contact />
    </>
  );
}
