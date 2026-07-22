import { useEffect, useState } from "react";
import {
  Box,
  Calendar,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import {
  getVersionManifest,
  getVersionChangelog,
  wikiUrlForVersion,
  type ManifestVersion,
  type VersionType,
} from "@/lib/minecraft";
import { relativeTime, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface VersionCard {
  v: ManifestVersion;
  extract: string | null;
  loading: boolean;
}

const TYPE_META: Record<
  VersionType,
  { label: string; icon: typeof Package; cls: string }
> = {
  release: {
    label: "正式版",
    icon: Package,
    cls: "bg-accent-light/12 text-accent-light dark:bg-accent-dark/15 dark:text-accent-dark",
  },
  snapshot: {
    label: "快照",
    icon: FlaskConical,
    cls: "bg-warning-light/12 text-warning-light dark:text-warning-dark",
  },
  old_beta: {
    label: "Beta",
    icon: Box,
    cls: "bg-faint-light/12 text-faint-light dark:text-faint-dark",
  },
  old_alpha: {
    label: "Alpha",
    icon: Box,
    cls: "bg-faint-light/12 text-faint-light dark:text-faint-dark",
  },
};

export default function MinecraftUpdates() {
  const [latest, setLatest] = useState<{ release: string; snapshot: string } | null>(null);
  const [cards, setCards] = useState<VersionCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manifestLoading, setManifestLoading] = useState(true);

  // Step 1: fetch the manifest (real-time), pick latest release + snapshot + recent.
  useEffect(() => {
    let cancelled = false;
    setManifestLoading(true);
    getVersionManifest()
      .then((m) => {
        if (cancelled) return;
        setLatest(m.latest);
        // Pick: latest release, latest snapshot, then the next 3 newest snapshots.
        const picked: ManifestVersion[] = [];
        const seen = new Set<string>();
        const push = (v?: ManifestVersion) => {
          if (v && !seen.has(v.id)) {
            seen.add(v.id);
            picked.push(v);
          }
        };
        push(m.versions.find((v) => v.id === m.latest.release));
        push(m.versions.find((v) => v.id === m.latest.snapshot));
        for (const v of m.versions) {
          if (picked.length >= 5) break;
          if (v.type === "snapshot" || v.type === "release") push(v);
        }
        setCards(
          picked.map((v) => ({ v, extract: null, loading: true })),
        );
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "加载版本清单失败");
      })
      .finally(() => {
        if (!cancelled) setManifestLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Step 2: fetch changelog extracts for each picked version (lazy, in parallel).
  useEffect(() => {
    if (cards.length === 0) return;
    let cancelled = false;
    cards.forEach((card, idx) => {
      if (!card.loading) return;
      getVersionChangelog(card.v.id, card.v.type)
        .then((extract) => {
          if (cancelled) return;
          setCards((prev) =>
            prev.map((c, i) => (i === idx ? { ...c, extract, loading: false } : c)),
          );
        })
        .catch(() => {
          if (cancelled) return;
          setCards((prev) =>
            prev.map((c, i) => (i === idx ? { ...c, extract: null, loading: false } : c)),
          );
        });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  if (manifestLoading) {
    return (
      <section className="mt-10">
        <SectionHeader />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-apple" />
          ))}
        </div>
      </section>
    );
  }

  if (error || cards.length === 0) {
    return null; // hide section on failure — don't break the page
  }

  const featured = cards[0];
  const rest = cards.slice(1);

  return (
    <section className="mt-10">
      <SectionHeader />

      {/* Featured: latest release with full changelog preview */}
      <FeaturedCard card={featured} />

      {/* Recent snapshots / versions timeline */}
      {rest.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-3 text-sm font-semibold text-muted-light dark:text-muted-dark">
            近期快照与版本
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((c) => (
              <MiniCard key={c.v.id} card={c} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end">
        <a
          href="https://minecraft.wiki/w/Java_Edition_version_history"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1 text-xs font-medium text-accent-light transition-colors hover:underline dark:text-accent-dark"
        >
          查看完整版本历史
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 ease-apple group-hover:translate-x-0.5" strokeWidth={2} />
        </a>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#5b9bd5]/12 text-[#3a7ab0] dark:text-[#7fb8e8]">
        <Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink-light dark:text-ink-dark">
          Minecraft 更新
        </h2>
        <p className="text-xs text-muted-light dark:text-muted-dark">
          实时版本动态 · 数据来自 Mojang 官方
        </p>
      </div>
    </div>
  );
}

function FeaturedCard({ card }: { card: VersionCard }) {
  const { v, extract, loading } = card;
  const meta = TYPE_META[v.type] ?? TYPE_META.release;
  const Icon = meta.icon;

  return (
    <div className="relative overflow-hidden rounded-apple-lg border border-line-light/60 bg-surface-light shadow-card dark:border-line-dark/60 dark:bg-surface-dark">
      <div className="hero-mesh absolute inset-0 h-20" aria-hidden />
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", meta.cls)}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            {meta.label}
          </span>
          <span className="font-mono text-2xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
            {v.id}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-light dark:text-muted-dark">
            <Calendar className="h-3 w-3" strokeWidth={2} />
            {formatDate(v.releaseTime)} · {relativeTime(v.releaseTime)}
          </span>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-2">
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-5/6 rounded" />
              <div className="skeleton h-3.5 w-4/6 rounded" />
            </div>
          ) : extract ? (
            <p className="text-pretty text-sm leading-relaxed text-muted-light dark:text-muted-dark">
              {extract.length > 320 ? extract.slice(0, 320).trim() + "…" : extract}
            </p>
          ) : (
            <p className="text-sm text-faint-light dark:text-faint-dark">
              暂无更新说明
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={wikiUrlForVersion(v.id, v.type)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-4 py-2 text-xs font-medium text-white shadow-sm transition-transform duration-200 ease-apple hover:scale-105 active:scale-95 dark:bg-accent-dark"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            查看完整更新日志
          </a>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ card }: { card: VersionCard }) {
  const { v, extract, loading } = card;
  const meta = TYPE_META[v.type] ?? TYPE_META.release;
  const Icon = meta.icon;

  return (
    <a
      href={wikiUrlForVersion(v.id, v.type)}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-apple border border-line-light/60 bg-surface-light p-4 shadow-card transition-all duration-300 ease-apple hover:-translate-y-1 hover:border-line-light hover:shadow-card-hover dark:border-line-dark/60 dark:bg-surface-dark dark:hover:border-line-dark"
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg", meta.cls)}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span className="font-mono text-sm font-bold tracking-tight text-ink-light dark:text-ink-dark">
          {v.id}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-light dark:text-muted-dark">
        <Calendar className="h-3 w-3" strokeWidth={2} />
        {relativeTime(v.releaseTime)}
      </div>
      <p className="clamp-2 mt-2 text-xs leading-relaxed text-muted-light dark:text-muted-dark">
        {loading ? (
          <span className="inline-flex items-center gap-1 text-faint-light dark:text-faint-dark">
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
            加载更新内容…
          </span>
        ) : extract ? (
          extract.length > 120 ? extract.slice(0, 120).trim() + "…" : extract
        ) : (
          <span className="text-faint-light dark:text-faint-dark">暂无更新说明</span>
        )}
      </p>
    </a>
  );
}
