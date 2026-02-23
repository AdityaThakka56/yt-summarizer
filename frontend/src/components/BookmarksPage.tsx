import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL

interface BookmarkItem {
  video_id: string;
  title_guess?: string;
  url: string;
  bookmarked_at: string;
}

interface BookmarksPageProps {
  username: string;
}

export default function BookmarksPage({ username }: BookmarksPageProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    if (username) fetchBookmarks();
  }, [username]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(`${API}/bookmarks/${username}`);
      const data = await res.json();
      setBookmarks(data.bookmarks);
    } catch {
      toast.error("Failed to load bookmarks");
    }
  };

  const removeBookmark = async (videoId: string) => {
    try {
      await fetch(`${API}/bookmark`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, username }),
      });
      setBookmarks((prev) => prev.filter((b) => b.video_id !== videoId));
      toast.success("Bookmark removed");
    } catch {
      toast.error("Failed to remove bookmark");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Bookmark className="text-primary" size={28} />
          My Bookmarks
        </h1>
        <p className="text-muted-foreground mt-2">Videos you've saved for later</p>
      </motion.div>

      {!username ? (
        <p className="text-primary text-sm">Please set a username to view bookmarks.</p>
      ) : bookmarks.length === 0 ? (
        <p className="text-muted-foreground text-sm">No bookmarks yet. Summarize a video and bookmark it!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((b, i) => (
            <motion.div
              key={b.video_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5"
            >
              <h3 className="text-foreground font-semibold text-sm mb-2 leading-snug">
                {b.title_guess || "Unknown Video"}
              </h3>
              <p className="text-muted-foreground text-xs mb-4">
                Bookmarked on {new Date(b.bookmarked_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.open(b.url, "_blank")}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
                >
                  <ExternalLink size={12} /> Watch
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => removeBookmark(b.video_id)}
                  className="px-3 py-2 rounded-xl border border-border/50 text-muted-foreground text-xs hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  <X size={12} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
