import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileDown, Bookmark, BookmarkCheck, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL

interface SummaryData {
  title_guess?: string;
  quick_summary?: string;
  key_takeaways?: string[];
  keywords?: string[];
  detailed_summary?: string;
  timestamped_summary?: any[];
  related_suggestions?: any[];
}

interface SummaryViewProps {
  summary: SummaryData;
  videoId: string;
  username: string;
  bookmarked: boolean;
  onBookmarkToggle: () => void;
}

export default function SummaryView({ summary, videoId, username, bookmarked, onBookmarkToggle }: SummaryViewProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    const text = `${summary.title_guess}\n\n${summary.quick_summary}\n\n${summary.detailed_summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf" });
      const res = await fetch(`${API}/export-pdf/${videoId}`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video_summary.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!", { id: "pdf" });
    } catch {
      toast.error("PDF export failed", { id: "pdf" });
    }
  };

  const handleBookmark = async () => {
    if (!username) return toast.error("Please set a username first");
    try {
      await fetch(`${API}/bookmark`, {
        method: bookmarked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, username }),
      });
      toast.success(bookmarked ? "Bookmark removed" : "Bookmarked!");
      onBookmarkToggle();
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen size={18} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Summary</h2>
      </div>

      {/* Title */}
      {summary.title_guess && (
        <h3 className="text-xl font-bold text-foreground mb-6 leading-snug">{summary.title_guess}</h3>
      )}

      {/* Quick Summary */}
      <SectionLabel>TL;DR</SectionLabel>
      <p className="text-secondary-foreground leading-relaxed text-sm mb-6">{summary.quick_summary}</p>

      {/* Key Takeaways */}
      {summary.key_takeaways && summary.key_takeaways.length > 0 && (
        <>
          <SectionLabel>Key Takeaways</SectionLabel>
          <ul className="space-y-3 mb-6">
            {summary.key_takeaways.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 items-start"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-secondary-foreground text-sm leading-relaxed">{point}</span>
              </motion.li>
            ))}
          </ul>
        </>
      )}

      {/* Keywords */}
      {summary.keywords && summary.keywords.length > 0 && (
        <>
          <SectionLabel>Keywords</SectionLabel>
          <div className="flex flex-wrap gap-2 mb-6">
            {summary.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 text-xs rounded-full bg-secondary border border-border/50 text-muted-foreground">
                {kw}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Detailed Summary */}
      <SectionLabel>Detailed Summary</SectionLabel>
      <AnimatePresence>
        <motion.div
          className={`overflow-hidden ${!expanded ? "max-h-40" : ""}`}
          layout
        >
          <p className="text-secondary-foreground text-sm leading-relaxed whitespace-pre-line">
            {summary.detailed_summary}
          </p>
        </motion.div>
      </AnimatePresence>
      {summary.detailed_summary && summary.detailed_summary.length > 300 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-primary text-sm font-medium mt-2 hover:underline"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border/50">
        <ActionButton onClick={handleCopy} icon={copied ? <Check size={14} /> : <Copy size={14} />}>
          {copied ? "Copied" : "Copy"}
        </ActionButton>
        <ActionButton onClick={handleExportPDF} icon={<FileDown size={14} />}>
          Export PDF
        </ActionButton>
        <ActionButton
          onClick={handleBookmark}
          icon={bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          active={bookmarked}
        >
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </ActionButton>
      </div>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">
      {children}
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  children,
  active,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
        active
          ? "border-primary/50 text-primary bg-primary/5"
          : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
      }`}
    >
      {icon}
      {children}
    </motion.button>
  );
}
