// import About from "@/components/section/About";
// import FAQSection from "@/components/section/Faq";
// import Hero from "@/components/section/Hero";     
// import Pricing from "@/components/section/Pricing";
// import Review from "@/components/section/Review";
// import Stats from "@/components/section/Stats";
// import Contact from "@/components/section/Contact";
// import Navbar from "@/components/Navbar";
  "use client";
  
  import { useEffect, useState } from 'react';
  import { Hero } from '@/components/Hero';
  import { Countdown } from '@/components/Countdown';
  import { Features } from '@/components/Features';
  import { QuizShowcase } from '@/components/QuizShowcase';
  import { Statistics } from '@/components/Statistics';
  import { Pricing } from '@/components/Pricing';
  import { Testimonials } from '@/components/Testimonials';
  import { Footer } from '@/components/Footer';
  import { Cursor } from '@/components/Cursor';
  import { Preloader } from '@/components/Preloader';

export default function Home() {
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }, []);
  
    if (loading) {
      return <Preloader />;
    }
  
    return (
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <Cursor />
        <Hero />
        <Countdown />
        <Features />
        <QuizShowcase />
        <Statistics />
        <Pricing />
        
        <Testimonials />
        <Footer />
      </div>
    );
  }
  
    
    // <>
    //   <Navbar />
    //   <Hero />
    //   <About />
    //   <div className="h-48 bg-[#002644]"></div>
    //   {/* <Stats />
    //   <div className="h-48"></div> */}
    //   <Pricing />
    //   <div className="h-48 bg-gradient-to-b from-[#005FAA] to-[#005FAA]/[0.79]"></div>
    //   <Review/>
    //   <div className="h-48"></div>
    //   {/* <FAQSection />
    //   <div className="h-48"></div> */}
    //   <Contact />
    // </>


