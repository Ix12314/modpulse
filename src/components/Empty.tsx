import { SearchX } from "lucide-react";

export default function Empty({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-apple border border-dashed border-line-light bg-subtle-light/50 py-16 text-center dark:border-line-dark dark:bg-elevated-dark/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-subtle-light dark:bg-elevated-dark">
        <SearchX className="h-6 w-6 text-faint-light dark:text-faint-dark" strokeWidth={1.8} />
      </div>
      <p className="mt-4 text-sm font-medium text-ink-light dark:text-ink-dark">
        {message ?? "没有找到匹配的模组"}
      </p>
      <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
        试试调整筛选条件或更换关键词
      </p>
    </div>
  );
}
