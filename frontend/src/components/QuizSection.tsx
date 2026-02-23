import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL
const LETTERS = ["A", "B", "C", "D"];

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizSectionProps {
  videoId: string;
  username: string;
}

export default function QuizSection({ videoId, username }: QuizSectionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const loadQuiz = async () => {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await fetch(`${API}/quiz/${videoId}`);
      const data = await res.json();
      setQuestions(data.questions);
    } catch {
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      return toast.error("Please answer all questions first!");
    }
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    if (username.trim()) {
      try {
        await fetch(`${API}/quiz/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_id: videoId, username: username.trim(), score: correct, total: questions.length }),
        });
        toast.success("Score saved!");
      } catch {
        toast.error("Could not save score");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 md:p-8 col-span-full"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain size={18} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Test Your Understanding</h2>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm mb-4">Generate a 5-question quiz based on this video</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={loadQuiz}
            disabled={loading}
            className="glow-button inline-flex items-center gap-2 text-sm"
          >
            <Brain size={16} />
            {loading ? "Generating..." : "Generate Quiz"}
          </motion.button>
        </div>
      ) : (
        <>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 bg-secondary rounded-2xl border border-border/50 mb-6"
            >
              <div className="text-4xl font-extrabold text-primary">{score}/{questions.length}</div>
              <div className="text-muted-foreground text-sm mt-1">
                {score === questions.length ? "Perfect score! 🎉" : score >= 3 ? "Good job! 👍" : "Keep learning! 📚"}
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.05 }}
                className="pb-6 border-b border-border/30 last:border-0"
              >
                <div className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">
                  Question {qIndex + 1}
                </div>
                <p className="text-foreground font-semibold text-sm mb-3 leading-relaxed">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    let variant = "default";
                    if (submitted) {
                      if (optIndex === q.correct) variant = "correct";
                      else if (answers[qIndex] === optIndex) variant = "wrong";
                    } else if (answers[qIndex] === optIndex) {
                      variant = "selected";
                    }

                    return (
                      <motion.button
                        key={optIndex}
                        whileHover={!submitted ? { scale: 1.01 } : {}}
                        whileTap={!submitted ? { scale: 0.99 } : {}}
                        onClick={() => handleAnswer(qIndex, optIndex)}
                        disabled={submitted}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${
                          variant === "correct"
                            ? "border-success/50 bg-success/5 text-success"
                            : variant === "wrong"
                            ? "border-destructive/50 bg-destructive/5 text-destructive"
                            : variant === "selected"
                            ? "border-primary/50 bg-primary/5 text-primary"
                            : "border-border/50 bg-secondary/30 text-secondary-foreground hover:border-primary/30"
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {LETTERS[optIndex]}
                        </span>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
                {submitted && answers[qIndex] !== q.correct && q.explanation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 px-4 py-3 rounded-xl bg-success/5 border border-success/20 text-success text-xs leading-relaxed"
                  >
                    💡 {q.explanation}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            {!submitted ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} className="glow-button text-sm">
                Submit Quiz
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={loadQuiz} className="glow-button inline-flex items-center gap-2 text-sm">
                <Brain size={14} /> Retry Quiz
              </motion.button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
