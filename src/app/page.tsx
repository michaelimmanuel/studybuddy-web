import About from "@/components/section/About";
import FAQSection from "@/components/section/Faq";
import Hero from "@/components/section/Hero";     
import Pricing from "@/components/section/Pricing";
import Review from "@/components/section/Review";
import Stats from "@/components/section/Stats";
import Contact from "@/components/section/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <div className="h-48"></div>
      <Stats />
      <div className="h-48"></div>
      <Pricing />
      <div className="h-48"></div>
      <Review/>
      <div className="h-48"></div>
      <FAQSection />
      <div className="h-48"></div>
      <Contact />
    </>
  );
}
