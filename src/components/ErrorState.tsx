import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-apple border border-dashed border-danger-light/40 bg-danger-light/5 py-16 text-center dark:border-danger-dark/40 dark:bg-danger-dark/5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-light/10 dark:bg-danger-dark/10">
        <AlertTriangle className="h-6 w-6 text-danger-light dark:text-danger-dark" strokeWidth={1.8} />
      </div>
      <p className="mt-4 text-sm font-medium text-ink-light dark:text-ink-dark">
        {message ?? "加载失败"}
      </p>
      <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
        请检查网络连接后重试
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent-light px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform duration-200 ease-apple hover:scale-105 active:scale-95 dark:bg-accent-dark"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          重试
        </button>
      )}
    </div>
  );
}
