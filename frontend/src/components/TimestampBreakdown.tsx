import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface TimestampItem {
  timestamp: string;
  summary: string;
}

interface TimestampBreakdownProps {
  timestamps: TimestampItem[];
  videoId: string;
}

export default function TimestampBreakdown({ timestamps, videoId }: TimestampBreakdownProps) {
  if (!timestamps || timestamps.length === 0) return null;

  const handleClick = (timestamp: string) => {
    const parts = timestamp.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    window.open(`https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock size={18} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Timestamps</h2>
      </div>

      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-2">
        {timestamps.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ x: 4 }}
            onClick={() => handleClick(item.timestamp)}
            className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left group"
          >
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-mono font-bold border border-primary/20 whitespace-nowrap mt-0.5">
              {item.timestamp}
            </span>
            <span className="text-secondary-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors">
              {item.summary}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
