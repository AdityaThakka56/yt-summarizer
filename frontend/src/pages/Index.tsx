import { useState, useEffect } from "react";
import { toast } from "sonner";
import AppNavbar from "@/components/AppNavbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesGrid from "@/components/FeaturesGrid";
import AppFooter from "@/components/AppFooter";
import SummaryView from "@/components/SummaryView";
import TimestampBreakdown from "@/components/TimestampBreakdown";
import ChatInterface from "@/components/ChatInterface";
import QuizSection from "@/components/QuizSection";
import RelatedVideosList from "@/components/RelatedVideosList";
import RecentHistory from "@/components/RecentHistory";
import BookmarksPage from "@/components/BookmarksPage";
import UsernameModal from "@/components/UsernameModal";
import ScrollProgress from "@/components/ScrollProgress";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:8000";

interface SummaryData {
  title_guess?: string;
  quick_summary?: string;
  key_takeaways?: string[];
  keywords?: string[];
  detailed_summary?: string;
  timestamped_summary?: any[];
  related_suggestions?: any[];
}

interface HistoryItem {
  url: string;
  title_guess?: string;
  summarized_at: string;
}

const Index = () => {
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/search-history`);
      const data = await res.json();
      setHistory(data.history);
    } catch {}
  };

  const checkBookmark = async (vid: string, user: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/is-bookmarked/${vid}/${user}`);
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch {}
  };

  const handleSummarize = async (url: string, language: string = "en") => {
    setLoading(true);
    setSummary(null);
    setVideoId(null);
    setBookmarked(false);
    try {
      const res = await fetch(`${API}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      setSummary(data.summary);
      setVideoId(data.video_id);
      await checkBookmark(data.video_id, username);
      await fetchHistory();
      toast.success("Video summarized!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <UsernameModal
        open={showUsernameModal}
        onSubmit={(name) => {
          setUsername(name);
          setShowUsernameModal(false);
        }}
        onSkip={() => setShowUsernameModal(false)}
      />

      <AppNavbar page={page} setPage={setPage} username={username} />

      <AnimatePresence mode="wait">
        {page === "bookmarks" ? (
          <motion.div key="bookmarks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BookmarksPage username={username} />
          </motion.div>
        ) : (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeroSection onSummarize={handleSummarize} loading={loading} />

            {/* History shown before results */}
            {!summary && !loading && history.length > 0 && (
              <div className="max-w-2xl mx-auto px-6 -mt-8 mb-16">
                <RecentHistory history={history} onSelect={(url) => handleSummarize(url)} />
              </div>
            )}

            {/* Results */}
            {summary && videoId && (
              <div className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-2 gap-6">
                  <SummaryView
                    summary={summary}
                    videoId={videoId}
                    username={username}
                    bookmarked={bookmarked}
                    onBookmarkToggle={() => checkBookmark(videoId, username)}
                  />
                  <div className="space-y-6">
                    <TimestampBreakdown timestamps={summary.timestamped_summary || []} videoId={videoId} />
                    <RelatedVideosList suggestions={summary.related_suggestions || []} />
                  </div>
                  <ChatInterface videoId={videoId} />
                  <QuizSection videoId={videoId} username={username} />
                </div>

                {history.length > 0 && (
                  <div className="mt-8">
                    <RecentHistory history={history} onSelect={(url) => handleSummarize(url)} />
                  </div>
                )}
              </div>
            )}

            {/* Landing sections when no results */}
            {!summary && !loading && (
              <>
                <HowItWorks />
                <FeaturesGrid />
              </>
            )}

            <AppFooter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
