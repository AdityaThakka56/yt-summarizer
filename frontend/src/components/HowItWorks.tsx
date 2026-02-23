import { motion } from "framer-motion";
import { Link2, Brain, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Paste a Link",
    description: "Drop any YouTube video URL into the input field.",
  },
  {
    icon: Brain,
    title: "AI Summarizes",
    description: "Our AI extracts the transcript and generates a structured summary.",
  },
  {
    icon: MessageSquare,
    title: "Chat & Explore",
    description: "Ask questions, take quizzes, and export your summary as PDF.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three simple steps to understand any video.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card-hover p-8 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <step.icon size={24} className="text-primary" />
              </div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                Step {i + 1}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
