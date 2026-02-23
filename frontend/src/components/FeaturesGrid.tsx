import { motion } from "framer-motion";
import { FileDown, Brain, MessageSquare, Clock, Youtube, BookOpen } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Structured Summaries", desc: "TL;DR, key points, and detailed breakdowns." },
  { icon: MessageSquare, title: "AI Chat", desc: "Ask anything about the video content." },
  { icon: Brain, title: "Interactive Quizzes", desc: "Test your understanding with AI-generated quizzes." },
  { icon: Clock, title: "Timestamped Notes", desc: "Jump to key moments in the video." },
  { icon: FileDown, title: "PDF Export", desc: "Download summaries for offline reading." },
  { icon: Youtube, title: "Related Videos", desc: "Discover more content on the topic." },
];

export default function FeaturesGrid() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            A complete toolkit for understanding video content.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-hover p-6 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-1.5">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
