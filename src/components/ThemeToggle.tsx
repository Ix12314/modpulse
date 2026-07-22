import { Sun, Moon } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      title={isDark ? "浅色模式" : "深色模式"}
      className={cn(
        "group relative inline-flex h-9 w-16 items-center rounded-full p-1 transition-colors duration-300 ease-apple",
        isDark ? "bg-elevated-dark/80" : "bg-subtle-light",
        "ring-1 ring-line-light/60 dark:ring-line-dark/60",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ease-apple",
          isDark ? "translate-x-7" : "translate-x-0",
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-accent-dark" strokeWidth={2} />
        ) : (
          <Sun className="h-4 w-4 text-warning-light" strokeWidth={2} />
        )}
      </span>
    </button>
  );
}
