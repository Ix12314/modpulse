import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layers, Boxes, Palette, Plug } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import ModCard from "@/components/ModCard";
import Empty from "@/components/Empty";
import ErrorState from "@/components/ErrorState";
import MinecraftUpdates from "@/components/MinecraftUpdates";
import ResourceSection from "@/components/ResourceSection";
import { CardGridSkeleton } from "@/components/Skeleton";
import { searchMods, type ModHit } from "@/lib/api";
import { useStore } from "@/store/useStore";

const TYPE_LABELS: Record<string, string> = {
  mod: "模组",
  modpack: "整合包",
  shader: "光影包",
  resourcepack: "资源包",
  plugin: "插件",
};

export default function Home() {
  const query = useStore((s) => s.query);
  const loaders = useStore((s) => s.loaders);
  const projectType = useStore((s) => s.projectType);
  const sort = useStore((s) => s.sort);

  const [hits, setHits] = useState<ModHit[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const reqToken = useRef(0);

  // Build Modrinth facets: different groups are AND, items in a group are OR.
  const facets = useMemo(() => {
    const groups: string[][] = [];
    if (projectType) groups.push([`project_type:${projectType}`]);
    if (loaders.length > 0) groups.push(loaders.map((l) => `categories:${l}`));
    return groups.length > 0 ? groups : undefined;
  }, [projectType, loaders]);

  const runSearch = useCallback(() => {
    const token = ++reqToken.current;
    setLoading(true);
    setError(null);
    searchMods({
      query: query.trim() || undefined,
      index: sort,
      limit: 24,
      facets,
    })
      .then((res) => {
        if (token !== reqToken.current) return;
        setHits(res.hits);
        setTotalHits(res.total_hits);
      })
      .catch((err) => {
        if (token !== reqToken.current) return;
        setError(err?.message ?? "请求失败");
        setHits([]);
        setTotalHits(0);
      })
      .finally(() => {
        if (token !== reqToken.current) return;
        setLoading(false);
      });
  }, [query, sort, facets]);

  // Debounce query changes; immediate for filter/sort changes.
  useEffect(() => {
    const t = setTimeout(runSearch, query ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, facets, refreshKey]);

  const totalDownloads = useMemo(
    () => hits.reduce((sum, h) => sum + (h.downloads || 0), 0),
    [hits],
  );

  const scrollToSearch = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>('input[aria-label="搜索模组"]');
    input?.focus();
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar onSearchClick={scrollToSearch} />

      <Hero
        totalMods={totalHits}
        totalDownloads={totalDownloads}
        onSearch={() => {
          /* search runs via store subscription */
        }}
      />

      <FilterBar />

      <main className="container max-w-6xl py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink-light dark:text-ink-dark">
              {query
                ? `「${query}」的搜索结果`
                : projectType
                  ? `热门${TYPE_LABELS[projectType] ?? projectType}`
                  : "热门模组榜单"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-light dark:text-muted-dark">
              {loading ? "加载中…" : `共 ${totalHits.toLocaleString("en-US")} 个结果`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="text-xs font-medium text-accent-light transition-colors hover:underline dark:text-accent-dark"
          >
            刷新数据
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
        ) : loading ? (
          <CardGridSkeleton count={12} />
        ) : hits.length === 0 ? (
          <Empty />
        ) : (
          <div id="main-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hits.map((mod, i) => (
              <ModCard key={mod.project_id} mod={mod} index={i} />
            ))}
          </div>
        )}

        {/* Curated resource sections — only on the default (unfiltered) view. */}
        {!query && !projectType && loaders.length === 0 && (
          <div className="mt-4">
            <MinecraftUpdates />
            <ResourceSection
              projectType="shader"
              title="热门光影包"
              subtitle="Shaders · 让世界光影流转"
              icon={Palette}
              accentClass="bg-[#af52de]/12 text-[#8a3fc4] dark:text-[#c77eff]"
            />
            <ResourceSection
              projectType="modpack"
              title="热门整合包"
              subtitle="Modpacks · 一键开启全新冒险"
              icon={Boxes}
              accentClass="bg-success-light/12 text-success-light dark:text-success-dark"
            />
            <ResourceSection
              projectType="resourcepack"
              title="热门资源包"
              subtitle="Resource Packs · 视觉风格自定义"
              icon={Layers}
              accentClass="bg-warning-light/12 text-warning-light dark:text-warning-dark"
            />
            <ResourceSection
              projectType="plugin"
              title="热门插件"
              subtitle="Plugins · 服务器功能扩展"
              icon={Plug}
              accentClass="bg-danger-light/12 text-danger-light dark:text-danger-dark"
            />
          </div>
        )}

        <footer className="mt-16 border-t border-line-light/60 pt-6 text-center text-xs text-faint-light dark:border-line-dark/60 dark:text-faint-dark">
          <p>
            数据由{" "}
            <a
              href="https://modrinth.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent-light hover:underline dark:text-accent-dark"
            >
              Modrinth
            </a>{" "}
            实时提供 · ModPulse 不存储任何数据
          </p>
          <p className="mt-1">© {new Date().getFullYear()} ModPulse · Apple 风格设计</p>
        </footer>
      </main>
    </div>
  );
}
