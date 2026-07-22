import { Link } from "react-router-dom";
import { Download, Heart, Package2 } from "lucide-react";
import type { ModHit } from "@/lib/api";
import { formatCompact, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

// Visual category badges mapping for loader / type chips.
const LOADER_BADGE: Record<string, string> = {
  fabric: "bg-[#db7a2e]/12 text-[#b8631c] dark:text-[#e8913f]",
  forge: "bg-[#6b5b95]/12 text-[#5a4d7a] dark:text-[#9b8cc0]",
  quilt: "bg-[#9b6dff]/12 text-[#7a4fd6] dark:text-[#b794ff]",
  neoforge: "bg-[#1d1d1f]/8 text-[#1d1d1f] dark:bg-white/10 dark:text-white",
  iris: "bg-[#5b9bd5]/12 text-[#3a7ab0] dark:text-[#7fb8e8]",
};

const TYPE_BADGE: Record<string, string> = {
  mod: "bg-accent-light/10 text-accent-light dark:text-accent-dark",
  modpack: "bg-success-light/12 text-success-light dark:text-success-dark",
  shader: "bg-[#af52de]/12 text-[#8a3fc4] dark:text-[#c77eff]",
  resourcepack: "bg-warning-light/12 text-warning-light dark:text-warning-dark",
  plugin: "bg-danger-light/12 text-danger-light dark:text-danger-dark",
};

export default function ModCard({ mod, index }: { mod: ModHit; index?: number }) {
  const id = mod.project_id || mod.slug;
  const loaders = mod.categories.filter((c) => LOADER_BADGE[c]);
  const types = (mod.display_categories?.length ? mod.display_categories : mod.categories).filter(
    (c) => TYPE_BADGE[c],
  );
  const type = mod.project_type;
  const cover = mod.icon_url;

  return (
    <Link
      to={`/mod/${id}`}
      className="group relative flex flex-col rounded-apple border border-line-light/60 bg-surface-light p-4 shadow-card transition-all duration-300 ease-apple hover:-translate-y-1 hover:border-line-light hover:shadow-card-hover dark:border-line-dark/60 dark:bg-surface-dark dark:hover:border-line-dark"
    >
      {typeof index === "number" && index < 3 && (
        <span className="absolute -left-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent-dark to-accent-light px-2 text-xs font-bold text-white shadow-glow">
          #{index + 1}
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="relative shrink-0 overflow-hidden rounded-2xl bg-subtle-light dark:bg-elevated-dark">
          {cover ? (
            <img
              src={cover}
              alt={mod.title}
              loading="lazy"
              className="h-14 w-14 object-cover transition-transform duration-500 ease-apple group-hover:scale-110"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center">
              <Package2 className="h-6 w-6 text-faint-light dark:text-faint-dark" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-ink-light dark:text-ink-dark">
            {mod.title}
          </h3>
          <p className="truncate text-xs text-muted-light dark:text-muted-dark">
            by {mod.author}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {type && TYPE_BADGE[type] && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize", TYPE_BADGE[type])}>
                {type}
              </span>
            )}
            {types.slice(0, 1).map((t) => (
              <span key={t} className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", TYPE_BADGE[t])}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="clamp-2 mt-3 text-xs leading-relaxed text-muted-light dark:text-muted-dark">
        {mod.description || "暂无描述"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        {loaders.slice(0, 3).map((l) => (
          <span
            key={l}
            className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", LOADER_BADGE[l])}
          >
            {l}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-line-light/50 pt-3 text-xs text-muted-light dark:border-line-dark/50 dark:text-muted-dark">
        <span className="flex items-center gap-1">
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="font-semibold text-ink-light dark:text-ink-dark">
            {formatCompact(mod.downloads)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="font-semibold text-ink-light dark:text-ink-dark">
            {formatCompact(mod.follows)}
          </span>
        </span>
        <span className="text-faint-light dark:text-faint-dark">{relativeTime(mod.date_modified)}</span>
      </div>
    </Link>
  );
}
