import { ArrowUpDown, Package, Package2, Layers, X } from "lucide-react";
import { useStore, type SortIndex } from "@/store/useStore";
import { LOADERS, PROJECT_TYPES } from "@/lib/api";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<SortIndex, string> = {
  downloads: "下载量",
  follows: "关注数",
  updated: "最近更新",
  newest: "最新发布",
  relevance: "相关度",
};

const SORT_OPTIONS: SortIndex[] = ["downloads", "follows", "updated", "newest", "relevance"];

const TYPE_LABELS: Record<string, string> = {
  mod: "Mod",
  modpack: "整合包",
  shader: "光影",
  resourcepack: "资源包",
  plugin: "插件",
};

export default function FilterBar() {
  const { loaders, toggleLoader, clearLoaders, projectType, setProjectType, sort, setSort } =
    useStore();

  return (
    <div className="sticky top-14 z-40 border-b border-line-light/60 bg-canvas-light/80 backdrop-blur-xl dark:border-line-dark/60 dark:bg-canvas-dark/80">
      <div className="container max-w-6xl py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Project type segmented control */}
          <div className="flex items-center gap-1 rounded-full bg-subtle-light p-1 dark:bg-elevated-dark">
            <TypeChip
              active={projectType === null}
              onClick={() => setProjectType(null)}
              label="全部"
            />
            {PROJECT_TYPES.map((t) => (
              <TypeChip
                key={t}
                active={projectType === t}
                onClick={() => setProjectType(t)}
                label={TYPE_LABELS[t] ?? t}
              />
            ))}
          </div>

          {/* Loader filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {LOADERS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => toggleLoader(l)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 ease-apple",
                  loaders.includes(l)
                    ? "bg-accent-light text-white shadow-sm dark:bg-accent-dark"
                    : "bg-subtle-light text-muted-light hover:text-ink-light dark:bg-elevated-dark dark:text-muted-dark dark:hover:text-ink-dark",
                )}
              >
                {l}
              </button>
            ))}
            {loaders.length > 0 && (
              <button
                type="button"
                onClick={clearLoaders}
                className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-faint-light transition-colors hover:text-danger-light dark:text-faint-dark dark:hover:text-danger-dark"
                aria-label="清除加载器筛选"
              >
                <X className="h-3 w-3" strokeWidth={2.5} />
                清除
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="ml-auto flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-faint-light dark:text-faint-dark" strokeWidth={2} />
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortIndex)}
                aria-label="排序方式"
                className="cursor-pointer appearance-none rounded-full border border-line-light/70 bg-surface-light py-1.5 pl-3 pr-7 text-xs font-medium text-ink-light outline-none transition-colors hover:border-line-light dark:border-line-dark/70 dark:bg-surface-dark dark:text-ink-dark dark:hover:border-line-dark"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint-light dark:text-faint-dark">
                ▾
              </span>
            </div>
          </div>
        </div>

        {/* Active type indicator row */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-faint-light dark:text-faint-dark">
          <span className="flex items-center gap-1">
            {projectType ? (
              <>
                <Layers className="h-3 w-3" /> {TYPE_LABELS[projectType] ?? projectType}
              </>
            ) : (
              <>
                <Package className="h-3 w-3" /> 全部类型
              </>
            )}
          </span>
          {loaders.length > 0 && (
            <span className="flex items-center gap-1">
              <Package2 className="h-3 w-3" /> {loaders.join(" · ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TypeChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-apple",
        active
          ? "bg-surface-light text-ink-light shadow-sm dark:bg-surface-dark dark:text-ink-dark"
          : "text-muted-light hover:text-ink-light dark:text-muted-dark dark:hover:text-ink-dark",
      )}
    >
      {label}
    </button>
  );
}
