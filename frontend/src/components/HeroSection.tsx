import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Zap, Brain, FileDown, Sparkles } from "lucide-react";
import FloatingShapes from "./FloatingShapes";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
];

const TRUST_ITEMS = [
  { icon: Zap, label: "Fast" },
  { icon: Brain, label: "AI Powered" },
  { icon: FileDown, label: "Exportable" },
];

interface HeroSectionProps {
  onSummarize: (url: string, language: string) => void;
  loading: boolean;
}

export default function HeroSection({ onSummarize, loading }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [isFocused, setIsFocused] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const fullText = "Understand any YouTube video in seconds";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (!url.trim() || loading) return;
    onSummarize(url.trim(), language);
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      <FloatingShapes />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
        >
          <Sparkles size={14} />
          AI-Powered Video Intelligence
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground"
        >
          {displayText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle"
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
        >
          Paste any YouTube link — get an AI summary, quiz, chatbot and more.
        </motion.p>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`glass-card p-2 max-w-2xl mx-auto transition-all duration-300 ${
            isFocused ? "border-primary/40 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.3)]" : ""
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
              />
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loading}
              className="px-4 py-3.5 bg-secondary/50 border border-border/50 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 cursor-pointer transition-colors"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading || !url.trim()}
              className="glow-button flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Summarize
                </>
              )}
            </motion.button>
          </div>

          {/* Progress bar when loading */}
          {loading && (
            <div className="mt-3 mx-2">
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "90%" }}
                  transition={{ duration: 30, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Fetching transcript and generating summary...
              </p>
            </div>
          )}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-6 mt-8"
        >
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
              <item.icon size={14} className="text-primary" />
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
