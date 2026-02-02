import { motion } from 'motion/react';

export function Preloader() {
  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative">
        <motion.div
          className="text-6xl md:text-8xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/img/logo.png" alt="StudyBuddy Logo" className="" />
        </motion.div>
        
        <motion.div
          className="absolute -bottom-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </motion.div>
  );
}