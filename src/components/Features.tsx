import { motion, useScroll, useTransform } from 'motion/react';
import { Brain, TrendingUp, Zap, Award } from 'lucide-react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const features = [
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Real-time insights and detailed performance metrics to track your improvement.',
    color: 'from-purple-400 to-pink-400',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get comprehensive explanations for every question immediately after answering.',
    color: 'from-orange-400 to-red-400',
  },
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <section id="features" ref={containerRef} className="relative py-32 px-8">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="block">Built for</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Excellence
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to dominate your dental exams in one powerful platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="group relative p-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                {/* Gradient Background on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 relative z-10`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-3xl font-bold mb-4 relative z-10">{feature.title}</h3>
                <p className="text-lg text-gray-400 relative z-10">{feature.description}</p>

                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}