import { Sparkles } from "lucide-react";

export default function AppFooter() {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={14} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">YTSum</span>
        </div>
        <p className="text-muted-foreground text-sm">
          AI-Powered YouTube Summarizer
        </p>
      </div>
    </footer>
  );
}
