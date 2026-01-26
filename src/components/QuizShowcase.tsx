import { motion } from 'motion/react';
import { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const questions = [
  {
    question: 'Which nerve provides sensory innervation to the mandibular teeth?',
    options: [
      'Superior alveolar nerve',
      'Inferior alveolar nerve',
      'Lingual nerve',
      'Mental nerve',
    ],
    correct: 1,
  },
  {
    question: 'What is the primary component of dental enamel?',
    options: [
      'Hydroxyapatite',
      'Collagen',
      'Calcium phosphate',
      'Fluoride',
    ],
    correct: 0,
  },
];

export function QuizShowcase() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % questions.length);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const question = questions[currentQuestion];

  return (
    <section id="quiz" className="relative py-32 px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300">
                Interactive Experience
              </span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="block">Practice</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-8">
              Experience our intelligent quiz system that adapts to your knowledge level. 
              Get instant feedback with detailed explanations for every question.
            </p>

            <div className="space-y-4">
              {[
                'Real exam-style questions',
                'Detailed answer explanations',
                'Performance tracking',
                'Adaptive difficulty',
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Quiz Interface */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-6">{question.question}</h3>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === question.correct;
                    const showCorrect = showResult && isCorrect;
                    const showIncorrect = showResult && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                          showCorrect
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : showIncorrect
                            ? 'bg-red-500/20 border-2 border-red-500'
                            : isSelected
                            ? 'bg-white/20 border-2 border-white/40'
                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                        onClick={() => handleAnswer(index)}
                        whileHover={{ scale: showResult ? 1 : 1.02 }}
                        whileTap={{ scale: showResult ? 1 : 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex-1">{option}</span>
                          {showCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                          {showIncorrect && <XCircle className="w-5 h-5 text-red-400" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Result Message */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-4 ${
                      selectedAnswer === question.correct
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    <p className={`font-medium ${
                      selectedAnswer === question.correct ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {selectedAnswer === question.correct
                        ? '✓ Correct! Great job!'
                        : '✗ Incorrect. The correct answer is highlighted above.'}
                    </p>
                  </motion.div>
                )}

                {/* Next Button */}
                {showResult && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={nextQuestion}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-cyan-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next Question
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 -top-12 -right-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-12 -left-12 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}