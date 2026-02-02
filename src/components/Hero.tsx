import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export function Hero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const handleGetStarted = async () => {
    try {
      // Check if user is logged in
      await api.get('/api/users/me');
      // User is logged in, scroll to pricing
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch {
      // User not logged in, redirect to auth page
      router.push('/auth');
    }
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 px-8 py-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <motion.div
            className="text-2xl font-bold tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            <img src="/img/logo.png" alt="" className='w-[60%]'/>
            {/* <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              StudyBuddy
            </span> */}
          </motion.div>
          
          <div className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#quiz" className="text-sm text-gray-400 hover:text-white transition-colors">Quiz</a>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">Stories</a>
            <motion.button
              className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-8 text-center"
        style={{ y, opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-gray-300">
            ✨ Trusted by 10,000+ dental students worldwide
          </span>
        </motion.div>

        <motion.h1
          className="text-7xl md:text-9xl font-bold mb-8 leading-none"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span className="block">Master Your</span>
          <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Dental Future
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Revolutionary quiz platform powered by adaptive learning technology.
          Practice smarter, score higher, achieve excellence.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.button
            className="group relative px-8 py-4 bg-white text-black rounded-full font-medium flex items-center gap-2 overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          {/* <motion.button
            className="px-8 py-4 border border-white/20 rounded-full font-medium hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Watch Demo
          </motion.button> */}
        </motion.div>

        {/* Floating Stats */}
        <motion.div
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {[
            { label: 'Questions', value: '5,000+' },
            { label: 'Pass Rate', value: '98%' },
            { label: 'Students', value: '10k+' },
            { label: 'Rating', value: '4.9/5' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/30 rounded-full p-1"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1 h-3 bg-white/50 rounded-full mx-auto" />
        </motion.div>
      </motion.div>
    </div>
  );
}