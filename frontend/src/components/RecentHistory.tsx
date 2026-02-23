import { motion } from "framer-motion";
import { History } from "lucide-react";

interface HistoryItem {
  url: string;
  title_guess?: string;
  summarized_at: string;
}

interface RecentHistoryProps {
  history: HistoryItem[];
  onSelect: (url: string) => void;
}

export default function RecentHistory({ history, onSelect }: RecentHistoryProps) {
  if (!history || history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <History size={16} className="text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Recent Videos</h3>
      </div>
      <div className="space-y-1">
        {history.map((item, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 4 }}
            onClick={() => onSelect(item.url)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-foreground text-sm font-medium truncate pr-4">
              {item.title_guess || "Unknown Video"}
            </span>
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {new Date(item.summarized_at).toLocaleDateString()}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
