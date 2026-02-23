import { motion } from "framer-motion";
import { Home, Bookmark, Sparkles } from "lucide-react";

interface AppNavbarProps {
  page: string;
  setPage: (page: string) => void;
  username: string;
}

export default function AppNavbar({ page, setPage, username }: AppNavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            YT<span className="gradient-text">Sum</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <NavButton
            active={page === "home"}
            onClick={() => setPage("home")}
            icon={<Home size={15} />}
            label="Home"
          />
          <NavButton
            active={page === "bookmarks"}
            onClick={() => setPage("bookmarks")}
            icon={<Bookmark size={15} />}
            label="Bookmarks"
          />
          {username && (
            <div className="ml-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
              👤 {username}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
