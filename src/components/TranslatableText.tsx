import { useState } from "react";
import { Languages, Loader2, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface TranslatableTextProps {
  text: string;
  className?: string;
  /** Compact mode = small inline button (for cards). */
  compact?: boolean;
}

/**
 * Shows source text with an on-demand "翻译" toggle. First click translates
 * (en -> zh-CN); second click toggles back to the original. Cached translations
 * appear instantly without a network request.
 */
export default function TranslatableText({
  text,
  className,
  compact = false,
}: TranslatableTextProps) {
  const source = text?.trim() || "";
  const { status, translated, error, translate, reset } = useTranslation(source);
  const [showTranslated, setShowTranslated] = useState(false);

  const hasTranslation = status === "done" && translated;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasTranslation) {
      setShowTranslated((v) => !v);
    } else {
      const out = await translate();
      if (out) setShowTranslated(true);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTranslated(false);
    reset();
  };

  return (
    <div className={cn("group/desc", className)}>
      <p className={cn(compact ? "clamp-2 text-xs" : "text-sm", "leading-relaxed text-muted-light dark:text-muted-dark")}>
        {showTranslated && hasTranslation ? translated : source || "暂无描述"}
      </p>

      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={status === "loading"}
          className={cn(
            "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
            compact ? "text-[10px]" : "text-xs",
            "text-accent-light hover:underline disabled:opacity-50 dark:text-accent-dark",
          )}
          aria-label="翻译简介为中文"
        >
          {status === "loading" ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
          ) : (
            <Languages className="h-3 w-3" strokeWidth={2} />
          )}
          {hasTranslation ? (showTranslated ? "显示原文" : "显示译文") : "翻译简介"}
        </button>

        {showTranslated && hasTranslation && (
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              "inline-flex items-center gap-1 rounded-full text-faint-light transition-colors hover:text-ink-light dark:text-faint-dark dark:hover:text-ink-dark",
              compact ? "text-[10px]" : "text-xs",
            )}
            aria-label="重置翻译"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2} />
          </button>
        )}

        {status === "error" && (
          <span className={cn("text-danger-light dark:text-danger-dark", compact ? "text-[10px]" : "text-xs")}>
            翻译失败，请稍后重试
          </span>
        )}
      </div>
    </div>
  );
}
