'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

// Define all exam dates
const examDates = [
  { date: new Date('2026-05-09T00:00:00'), label: 'May 9, 2026' },
  { date: new Date('2026-08-08T00:00:00'), label: 'August 8, 2026' },
  { date: new Date('2026-11-07T00:00:00'), label: 'November 7, 2026' },
];

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ months: 0, days: 0 });
  const [currentExam, setCurrentExam] = useState(examDates[0]);

  useEffect(() => {
    function getNextExamDate() {
      const now = new Date();
      // Find the next upcoming exam date
      for (const exam of examDates) {
        if (exam.date.getTime() > now.getTime()) {
          return exam;
        }
      }
      // If all dates have passed, return the last one
      return examDates[examDates.length - 1];
    }

    function calculateTimeLeft() {
      const nextExam = getNextExamDate();
      setCurrentExam(nextExam);

      const now = new Date();
      const difference = nextExam.date.getTime() - now.getTime();

      if (difference > 0) {
        // Calculate total days
        const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
        
        // Calculate months and remaining days
        const months = Math.floor(totalDays / 30);
        const days = totalDays % 30;

        setTimeLeft({ months, days });
      } else {
        setTimeLeft({ months: 0, days: 0 });
      }
    }

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-20 px-8 bg-gradient-to-b from-black via-blue-950/20 to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Header */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Upcoming Exam</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              UKOMNAS-PPDG 2026
            </span>
          </h2>

          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            The national competency exam starts soon. Prepare yourself and achieve excellence with our comprehensive study materials
          </p>

          {/* Countdown Display */}
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {/* Months */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 md:p-12 min-w-[140px] md:min-w-[180px]">
                <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {timeLeft.months}
                </div>
                <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
                  Months
                </div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl -z-10" />
            </motion.div>

            {/* Separator */}
            <div className="text-4xl md:text-5xl font-bold text-blue-400/50">:</div>

            {/* Days */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-8 md:p-12 min-w-[140px] md:min-w-[180px]">
                <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {timeLeft.days}
                </div>
                <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
                  Days
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl -z-10" />
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>UKOMNAS-PPDG starts on: {currentExam.label}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
