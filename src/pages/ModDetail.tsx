import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Heart,
  Package2,
  Shield,
  Tag,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ErrorState from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import TranslatableText from "@/components/TranslatableText";
import { getProject, getVersions, type Project, type Version } from "@/lib/api";
import { formatCompact, formatFull, formatDate, formatSize, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const VERSION_TYPE_BADGE: Record<string, { cls: string; label: string }> = {
  release: { cls: "bg-success-light/12 text-success-light dark:text-success-dark", label: "正式版" },
  beta: { cls: "bg-warning-light/12 text-warning-light dark:text-warning-dark", label: "测试版" },
  alpha: { cls: "bg-danger-light/12 text-danger-light dark:text-danger-dark", label: "内测版" },
};

export default function ModDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getProject(id), getVersions(id)])
      .then(([p, v]) => {
        if (cancelled) return;
        setProject(p);
        setVersions(v);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? "加载模组详情失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (error || !project)
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container max-w-5xl py-16">
          <ErrorState
            message={error ?? "未找到该模组"}
            onRetry={() => {
              if (id) {
                setLoading(true);
                setError(null);
                Promise.all([getProject(id), getVersions(id)])
                  .then(([p, v]) => {
                    setProject(p);
                    setVersions(v);
                  })
                  .catch((e) => setError(e?.message ?? "加载失败"))
                  .finally(() => setLoading(false));
              }
            }}
          />
        </div>
      </div>
    );

  const primaryVersion = versions[0];
  const allGameVersions = Array.from(
    new Set(versions.flatMap((v) => v.game_versions)),
  ).slice(0, 12);
  const allLoaders = Array.from(new Set(versions.flatMap((v) => v.loaders)));

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container max-w-5xl py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-light transition-colors hover:text-ink-light dark:text-muted-dark dark:hover:text-ink-dark"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          返回榜单
        </Link>

        {/* Header card */}
        <section className="mt-5 animate-fade-up overflow-hidden rounded-apple-lg border border-line-light/60 bg-surface-light shadow-card dark:border-line-dark/60 dark:bg-surface-dark">
          <div className="hero-mesh h-24 sm:h-32" />
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
              <div className="shrink-0 overflow-hidden rounded-3xl border-4 border-surface-light bg-subtle-light shadow-card dark:border-surface-dark dark:bg-elevated-dark">
                {project.icon_url ? (
                  <img
                    src={project.icon_url}
                    alt={project.title}
                    className="h-24 w-24 object-cover sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
                    <Package2 className="h-10 w-10 text-faint-light dark:text-faint-dark" />
                  </div>
                )}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
                    {project.title}
                  </h1>
                  <span className="rounded-full bg-accent-light/10 px-2 py-0.5 text-xs font-medium capitalize text-accent-light dark:bg-accent-dark/15 dark:text-accent-dark">
                    {project.project_type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">
                  by{" "}
                  <span className="font-medium text-ink-light dark:text-ink-dark">{project.author}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://modrinth.com/${project.project_type}/${project.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform duration-200 ease-apple hover:scale-105 active:scale-95 dark:bg-accent-dark"
                >
                  <ExternalLink className="h-4 w-4" strokeWidth={2} />
                  查看原页
                </a>
              </div>
            </div>

            <TranslatableText
              text={project.description}
              className="mt-4 max-w-3xl"
            />

            {/* Stat grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={<Download className="h-4 w-4" strokeWidth={2} />}
                value={formatCompact(project.downloads)}
                sub={formatFull(project.downloads)}
                label="下载量"
              />
              <StatCard
                icon={<Heart className="h-4 w-4" strokeWidth={2} />}
                value={formatCompact(project.followers)}
                sub={formatFull(project.followers)}
                label="关注数"
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" strokeWidth={2} />}
                value={String(project.versions.length)}
                sub={`${versions.length} 个发布版本`}
                label="版本数"
              />
              <StatCard
                icon={<Calendar className="h-4 w-4" strokeWidth={2} />}
                value={relativeTime(project.updated)}
                sub={formatDate(project.updated)}
                label="最近更新"
              />
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap items-start gap-4 text-xs">
              <TagRow icon={<Shield className="h-3.5 w-3.5" />} label="客户端">
                {sideLabel(project.client_side)}
              </TagRow>
              <TagRow icon={<Shield className="h-3.5 w-3.5" />} label="服务端">
                {sideLabel(project.server_side)}
              </TagRow>
              <TagRow icon={<FileText className="h-3.5 w-3.5" />} label="许可证">
                {project.license?.name ?? "—"}
              </TagRow>
              <TagRow icon={<Calendar className="h-3.5 w-3.5" />} label="发布于">
                {formatDate(project.published)}
              </TagRow>
            </div>

            {/* Categories */}
            {project.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-faint-light dark:text-faint-dark" />
                {project.categories.slice(0, 14).map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-subtle-light px-2 py-0.5 text-[11px] font-medium text-muted-light dark:bg-elevated-dark dark:text-muted-dark"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Game versions & loaders summary */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InfoCard title="支持的游戏版本" subtitle={`${allGameVersions.length} 个版本`}>
            <div className="flex flex-wrap gap-1.5">
              {allGameVersions.map((v) => (
                <span
                  key={v}
                  className="rounded-md bg-subtle-light px-2 py-1 font-mono text-xs text-ink-light dark:bg-elevated-dark dark:text-ink-dark"
                >
                  {v}
                </span>
              ))}
              {versions.flatMap((v) => v.game_versions).length > 12 && (
                <span className="px-2 py-1 text-xs text-faint-light dark:text-faint-dark">更多…</span>
              )}
            </div>
          </InfoCard>
          <InfoCard title="支持的加载器" subtitle={`${allLoaders.length} 个加载器`}>
            <div className="flex flex-wrap gap-1.5">
              {allLoaders.map((l) => (
                <span
                  key={l}
                  className="rounded-full bg-accent-light/10 px-3 py-1 text-xs font-medium capitalize text-accent-light dark:bg-accent-dark/15 dark:text-accent-dark"
                >
                  {l}
                </span>
              ))}
            </div>
          </InfoCard>
        </section>

        {/* Version table */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-ink-light dark:text-ink-dark">
              版本列表
            </h2>
            <span className="text-xs text-muted-light dark:text-muted-dark">
              显示前 {Math.min(versions.length, 12)} 个版本
            </span>
          </div>

          {versions.length === 0 ? (
            <div className="rounded-apple border border-dashed border-line-light py-10 text-center text-sm text-muted-light dark:border-line-dark dark:text-muted-dark">
              暂无版本数据
            </div>
          ) : (
            <div className="overflow-hidden rounded-apple border border-line-light/60 bg-surface-light dark:border-line-dark/60 dark:bg-surface-dark">
              {versions.slice(0, 12).map((v, i) => {
                const file = v.files.find((f) => f.primary) ?? v.files[0];
                const badge = VERSION_TYPE_BADGE[v.version_type] ?? VERSION_TYPE_BADGE.release;
                return (
                  <div
                    key={v.id}
                    className={cn(
                      "flex flex-col gap-3 p-4 transition-colors hover:bg-subtle-light/60 dark:hover:bg-elevated-dark/40 sm:flex-row sm:items-center sm:justify-between",
                      i !== 0 && "border-t border-line-light/50 dark:border-line-dark/50",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-ink-light dark:text-ink-dark">
                          {v.name || v.version_number}
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", badge.cls)}>
                          {badge.label}
                        </span>
                        {file && (
                          <span className="text-[11px] text-faint-light dark:text-faint-dark">
                            {formatSize(file.size)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-light dark:text-muted-dark">
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" /> {formatCompact(v.downloads)}
                        </span>
                        <span>{relativeTime(v.date_published)}</span>
                        <span className="font-mono">
                          {v.game_versions.slice(0, 4).join(", ")}
                          {v.game_versions.length > 4 && "…"}
                        </span>
                        <span className="flex gap-1">
                          {v.loaders.slice(0, 3).map((l) => (
                            <span key={l} className="capitalize">
                              {l}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                    {file && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-subtle-light px-3.5 py-2 text-xs font-medium text-ink-light transition-all duration-200 ease-apple hover:bg-accent-light hover:text-white dark:bg-elevated-dark dark:text-ink-dark dark:hover:bg-accent-dark"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        下载
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-line-light/60 pt-6 text-center text-xs text-faint-light dark:border-line-dark/60 dark:text-faint-dark">
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
            实时提供
          </p>
        </footer>
      </main>
    </div>
  );
}

function sideLabel(side: string): string {
  if (side === "required") return "必需";
  if (side === "optional") return "可选";
  if (side === "unsupported") return "不支持";
  return side;
}

function StatCard({
  icon,
  value,
  sub,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  sub: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-line-light/60 bg-subtle-light/60 p-3 dark:border-line-dark/60 dark:bg-elevated-dark/40">
      <div className="flex items-center gap-1.5 text-accent-light dark:text-accent-dark">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide text-faint-light dark:text-faint-dark">
          {label}
        </span>
      </div>
      <div className="mt-1.5 text-xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
        {value}
      </div>
      <div className="text-[11px] text-muted-light dark:text-muted-dark">{sub}</div>
    </div>
  );
}

function TagRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-faint-light dark:text-faint-dark">{icon}</span>
      <span className="text-faint-light dark:text-faint-dark">{label}:</span>
      <span className="font-medium text-muted-light dark:text-muted-dark">{children}</span>
    </div>
  );
}

function InfoCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-apple border border-line-light/60 bg-surface-light p-5 dark:border-line-dark/60 dark:bg-surface-dark">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-light dark:text-ink-dark">{title}</h3>
        {subtitle && <span className="text-[11px] text-faint-light dark:text-faint-dark">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-5xl py-8">
        <Skeleton className="h-5 w-24" />
        <div className="mt-5 overflow-hidden rounded-apple-lg border border-line-light/60 dark:border-line-dark/60">
          <Skeleton className="h-28 w-full" />
          <div className="p-8">
            <div className="flex gap-5">
              <Skeleton className="h-28 w-28 rounded-3xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <div className="mt-5 space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
