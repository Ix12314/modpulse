import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertOctagon, Boxes, Download, Package2, Plug } from "lucide-react";
import {
  collectDependencies,
  getProjects,
  type DependencyType,
  type Project,
  type Version,
} from "@/lib/api";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

interface DependencyListProps {
  versions: Version[];
}

interface DepGroup {
  type: DependencyType;
  label: string;
  icon: typeof Boxes;
  accent: string;
  ids: string[];
}

const GROUPS: Omit<DepGroup, "ids">[] = [
  {
    type: "required",
    label: "前置依赖",
    icon: Boxes,
    accent: "bg-accent-light/12 text-accent-light dark:bg-accent-dark/15 dark:text-accent-dark",
  },
  {
    type: "optional",
    label: "可选依赖",
    icon: Plug,
    accent: "bg-success-light/12 text-success-light dark:text-success-dark",
  },
  {
    type: "embedded",
    label: "内置依赖",
    icon: Package2,
    accent: "bg-warning-light/12 text-warning-light dark:text-warning-dark",
  },
  {
    type: "incompatible",
    label: "冲突模组",
    icon: AlertOctagon,
    accent: "bg-danger-light/12 text-danger-light dark:text-danger-dark",
  },
];

const TYPE_LABEL: Record<string, string> = {
  mod: "Mod",
  modpack: "整合包",
  shader: "光影",
  resourcepack: "资源包",
  plugin: "插件",
};

/**
 * Renders the dependency manifest for a project: groups all dependencies found
 * across versions by type (required / optional / embedded / incompatible) and
 * resolves each project_id to a clickable card with icon, title and downloads.
 */
export default function DependencyList({ versions }: DependencyListProps) {
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [loading, setLoading] = useState(true);

  // Group dependency IDs by type.
  const grouped = collectDependencies(versions);
  const allIds = (Object.values(grouped) as string[][]).flat();

  useEffect(() => {
    let cancelled = false;
    if (allIds.length === 0) {
      setLoading(false);
      setProjects({});
      return;
    }
    setLoading(true);
    getProjects(allIds)
      .then((list) => {
        if (cancelled) return;
        const map: Record<string, Project> = {};
        for (const p of list) map[p.id] = p;
        setProjects(map);
      })
      .catch(() => {
        if (!cancelled) setProjects({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allIds.join(",")]);

  if (allIds.length === 0) {
    return null; // hide the whole section when there are no dependencies
  }

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <Boxes className="h-4 w-4 text-faint-light dark:text-faint-dark" strokeWidth={2} />
        <h2 className="text-lg font-semibold tracking-tight text-ink-light dark:text-ink-dark">
          前置模组清单
        </h2>
        <span className="text-xs text-muted-light dark:text-muted-dark">
          共 {allIds.length} 项
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.min(allIds.length, 6) }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {GROUPS.map((g) => {
            const ids = grouped[g.type];
            if (!ids || ids.length === 0) return null;
            const Icon = g.icon;
            return (
              <div key={g.type}>
                <div className="mb-2 flex items-center gap-1.5">
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg", g.accent)}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <h3 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                    {g.label}
                  </h3>
                  <span className="text-[11px] text-faint-light dark:text-faint-dark">
                    {ids.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ids.map((id) => (
                    <DepCard key={id} project={projects[id]} id={id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DepCard({ project, id }: { project?: Project; id: string }) {
  if (!project) {
    // Fallback when the project lookup failed (deleted/private).
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line-light/60 bg-subtle-light/60 p-3 dark:border-line-dark/60 dark:bg-elevated-dark/40">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-subtle-light dark:bg-elevated-dark">
          <Package2 className="h-5 w-5 text-faint-light dark:text-faint-dark" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-light dark:text-muted-dark">
            未知项目
          </p>
          <p className="truncate font-mono text-[11px] text-faint-light dark:text-faint-dark">
            {id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/mod/${project.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-line-light/60 bg-surface-light p-3 shadow-card transition-all duration-300 ease-apple hover:-translate-y-0.5 hover:border-line-light hover:shadow-card-hover dark:border-line-dark/60 dark:bg-surface-dark dark:hover:border-line-dark"
    >
      <div className="relative shrink-0 overflow-hidden rounded-xl bg-subtle-light dark:bg-elevated-dark">
        {project.icon_url ? (
          <img
            src={project.icon_url}
            alt={project.title}
            loading="lazy"
            className="h-10 w-10 object-cover transition-transform duration-500 ease-apple group-hover:scale-110"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center">
            <Package2 className="h-5 w-5 text-faint-light dark:text-faint-dark" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-light dark:text-ink-dark">
          {project.title}
        </p>
        <p className="truncate text-[11px] text-muted-light dark:text-muted-dark">
          by {project.author} · {TYPE_LABEL[project.project_type] ?? project.project_type}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-light dark:text-muted-dark">
        <Download className="h-3 w-3" strokeWidth={2} />
        <span className="font-medium text-ink-light dark:text-ink-dark">
          {formatCompact(project.downloads)}
        </span>
      </span>
    </Link>
  );
}
