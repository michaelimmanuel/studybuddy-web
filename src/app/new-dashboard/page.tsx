"use client";

import { useEffect, useState } from 'react';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { QuizShowcase } from '@/components/QuizShowcase';
import { Statistics } from '@/components/Statistics';
import { Pricing } from '@/components/Pricing';
import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';
import { Cursor } from '@/components/Cursor';
import { Preloader } from '@/components/Preloader';

export default function App() {
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
      <Features />
      <QuizShowcase />
      <Statistics />
      <Pricing />
      
      <Testimonials />
      <Footer />
    </div>
  );
}
