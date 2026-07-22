import { useEffect, useState } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { searchMods, type ModHit } from "@/lib/api";
import { useStore } from "@/store/useStore";
import ModCard from "./ModCard";
import { ModCardSkeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface ResourceSectionProps {
  projectType: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  accentClass: string;
  limit?: number;
}

/**
 * A curated horizontal carousel of the most-downloaded items for a given
 * resource type (shader / modpack / resourcepack / plugin). Clicking the
 * header chevron applies that type as the global filter on the main grid.
 */
export default function ResourceSection({
  projectType,
  title,
  subtitle,
  icon: Icon,
  accentClass,
  limit = 10,
}: ResourceSectionProps) {
  const [hits, setHits] = useState<ModHit[]>([]);
  const [loading, setLoading] = useState(true);
  const setProjectType = useStore((s) => s.setProjectType);
  const setSort = useStore((s) => s.setSort);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchMods({
      index: "downloads",
      limit,
      facets: [[`project_type:${projectType}`]],
    })
      .then((res) => {
        if (!cancelled) setHits(res.hits);
      })
      .catch(() => {
        if (!cancelled) setHits([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectType, limit]);

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-2xl", accentClass)}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink-light dark:text-ink-dark">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-light dark:text-muted-dark">{subtitle}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setProjectType(projectType);
            setSort("downloads");
            document.getElementById("main-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="group inline-flex items-center gap-0.5 text-xs font-medium text-accent-light transition-colors hover:underline dark:text-accent-dark"
        >
          查看全部
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 ease-apple group-hover:translate-x-0.5" strokeWidth={2} />
        </button>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-64 shrink-0">
              <ModCardSkeleton />
            </div>
          ))}
        </div>
      ) : hits.length === 0 ? null : (
        <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-3 [scrollbar-width:thin] snap-x">
          {hits.map((mod, i) => (
            <div key={mod.project_id} className="w-64 shrink-0 snap-start">
              <ModCard mod={mod} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
