import { Link, useLocation } from "react-router-dom";
import { Boxes, Github, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

export default function Navbar({ onSearchClick }: { onSearchClick?: () => void }) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass border-b border-line-light/60 dark:border-line-dark/60">
      <nav className="container flex h-14 max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-2" aria-label="ModPulse 首页">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent-dark to-accent-light shadow-glow transition-transform duration-300 ease-apple group-hover:scale-105">
            <Boxes className="h-5 w-5 text-white" strokeWidth={2.2} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-ink-light dark:text-ink-dark">
            ModPulse
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" label="热门" active={location.pathname === "/"} />
          <a
            href="https://modrinth.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-light transition-colors hover:text-ink-light dark:text-muted-dark dark:hover:text-ink-dark"
          >
            Modrinth
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="搜索模组"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-muted-light transition-colors hover:bg-subtle-light hover:text-ink-light",
              "dark:text-muted-dark dark:hover:bg-elevated-dark dark:hover:text-ink-dark",
            )}
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <ThemeToggle />
          <a
            href="https://github.com/modrinth"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-light transition-colors hover:bg-subtle-light hover:text-ink-light dark:text-muted-dark dark:hover:bg-elevated-dark dark:hover:text-ink-dark sm:flex"
          >
            <Github className="h-[18px] w-[18px]" strokeWidth={2} />
          </a>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "text-ink-light dark:text-ink-dark"
          : "text-muted-light hover:text-ink-light dark:text-muted-dark dark:hover:text-ink-dark",
      )}
    >
      {label}
    </Link>
  );
}
