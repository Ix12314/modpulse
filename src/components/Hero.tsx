import { Search, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";

interface HeroProps {
  totalMods: number;
  totalDownloads: number;
  onSearch: (q: string) => void;
}

export default function Hero({ totalMods, totalDownloads, onSearch }: HeroProps) {
  const query = useStore((s) => s.query);
  const setQuery = useStore((s) => s.setQuery);
  const [local, setLocal] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal(query);
  }, [query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(local);
    onSearch(local);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="hero-mesh absolute inset-0" aria-hidden />
      <div className="container relative max-w-6xl py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-line-light/60 bg-surface-light/70 px-3 py-1 text-xs font-medium text-muted-light backdrop-blur dark:border-line-dark/60 dark:bg-surface-dark/70 dark:text-muted-dark">
            <Sparkles className="h-3.5 w-3.5 text-accent-light dark:text-accent-dark" strokeWidth={2} />
            实时数据 · 来自 Modrinth
          </div>

          <h1
            className="animate-fade-up mt-5 text-balance text-4xl font-bold tracking-tight text-ink-light dark:text-ink-dark sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            探索最热门的
            <span className="bg-gradient-to-r from-accent-light to-[#af52de] bg-clip-text text-transparent dark:from-accent-dark dark:to-[#c77eff]">
              {" "}Minecraft 模组
            </span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-4 max-w-xl text-pretty text-base text-muted-light dark:text-muted-dark sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            实时聚合下载量、关注数与最新版本，以 Apple 风格的优雅体验浏览模组生态。
          </p>

          <form
            onSubmit={submit}
            className="animate-fade-up mx-auto mt-7 flex max-w-xl items-center gap-2"
            style={{ animationDelay: "180ms" }}
          >
            <div className="group relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint-light dark:text-faint-dark" strokeWidth={2} />
              <input
                ref={inputRef}
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="搜索模组名称、作者或关键词…"
                aria-label="搜索模组"
                className="h-12 w-full rounded-full border border-line-light/70 bg-surface-light/80 pl-11 pr-28 text-sm text-ink-light shadow-card outline-none backdrop-blur transition-all duration-300 ease-apple placeholder:text-faint-light focus:border-accent-light focus:shadow-glow dark:border-line-dark/70 dark:bg-surface-dark/80 dark:text-ink-dark dark:placeholder:text-faint-dark dark:focus:border-accent-dark"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-accent-light px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform duration-200 ease-apple hover:scale-105 active:scale-95 dark:bg-accent-dark"
              >
                搜索
              </button>
            </div>
          </form>

          <div
            className="animate-fade-up mx-auto mt-8 flex max-w-md items-center justify-center gap-6"
            style={{ animationDelay: "240ms" }}
          >
            <Stat
              icon={<TrendingUp className="h-4 w-4" strokeWidth={2} />}
              value={totalMods > 0 ? totalMods.toLocaleString("en-US") : "—"}
              label="匹配模组"
            />
            <Divider />
            <Stat
              icon={<span className="text-sm">⬇</span>}
              value={totalDownloads > 0 ? totalDownloads.toLocaleString("en-US") : "—"}
              label="累计下载"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light/10 text-accent-light dark:bg-accent-dark/15 dark:text-accent-dark">
        {icon}
      </span>
      <div className="text-left">
        <div className="text-lg font-semibold tracking-tight text-ink-light dark:text-ink-dark">{value}</div>
        <div className="text-[11px] text-faint-light dark:text-faint-dark">{label}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-line-light/70 dark:bg-line-dark/70" />;
}
