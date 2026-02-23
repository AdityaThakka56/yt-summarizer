import { motion } from "framer-motion";
import { ExternalLink, Youtube, Play } from "lucide-react";

interface Suggestion {
  title: string;
  channel: string;
  reason: string;
  url: string;
}

interface RelatedVideosListProps {
  suggestions: Suggestion[];
}

export default function RelatedVideosList({ suggestions }: RelatedVideosListProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Youtube size={18} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Recommended Videos</h2>
      </div>

      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <motion.a
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40 transition-all group"
          >
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Play size={12} />
            </span>
            <div className="flex-1 min-w-0">
              {/* Video title */}
              <div className="text-foreground text-sm font-semibold group-hover:text-primary transition-colors leading-snug">
                {s.title}
              </div>
              {/* Channel name */}
              <div className="text-primary text-xs font-medium mt-0.5">
                {s.channel}
              </div>
              {/* Reason */}
              <div className="text-muted-foreground text-xs mt-1 leading-relaxed">
                {s.reason}
              </div>
            </div>
            <ExternalLink size={14} className="text-muted-foreground mt-1 flex-shrink-0 group-hover:text-primary transition-colors" />
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}