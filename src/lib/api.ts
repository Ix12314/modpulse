// Modrinth API client - public, no auth, CORS enabled
// Docs: https://docs.modrinth.com

const BASE = "https://api.modrinth.com/v2";

export interface ModHit {
  project_id: string;
  project_type: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  categories: string[];
  display_categories: string[];
  versions: string[];
  downloads: number;
  follows: number;
  icon_url: string | null;
  date_modified: string;
  latest_version: string;
  license: string;
  client_side: string;
  server_side: string;
}

export interface SearchResponse {
  hits: ModHit[];
  offset: number;
  limit: number;
  total_hits: number;
}

export type SearchIndex =
  | "relevance"
  | "downloads"
  | "follows"
  | "newest"
  | "updated";

export interface SearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  index?: SearchIndex;
  facets?: string[][]; // outer = AND groups, inner = OR within group
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  project_type: string;
  categories: string[];
  display_categories: string[];
  icon_url: string | null;
  downloads: number;
  followers: number;
  follows: number;
  license: { id: string; name: string; url: string };
  client_side: string;
  server_side: string;
  author: string;
  published: string;
  updated: string;
  versions: string[];
  gallery: { url: string }[];
  color: number | null;
}

export interface VersionFile {
  hashes: { sha1: string; sha512: string };
  url: string;
  filename: string;
  primary: boolean;
  size: number;
  file_type: string | null;
}

export interface Version {
  id: string;
  project_id: string;
  version_number: string;
  name: string;
  version_type: "release" | "beta" | "alpha";
  game_versions: string[];
  loaders: string[];
  featured: boolean;
  status: string;
  files: VersionFile[];
  date_published: string;
  downloads: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": "ModPulse/1.0 (github-pages)",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Modrinth API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function searchMods(params: SearchParams): Promise<SearchResponse> {
  const sp = new URLSearchParams();
  if (params.query) sp.set("query", params.query);
  sp.set("facade", "true");
  sp.set("limit", String(params.limit ?? 20));
  sp.set("offset", String(params.offset ?? 0));
  sp.set("index", params.index ?? "downloads");
  if (params.facets && params.facets.length > 0) {
    sp.set("facets", JSON.stringify(params.facets));
  }
  return request<SearchResponse>(`/search?${sp.toString()}`);
}

export function getProject(idOrSlug: string): Promise<Project> {
  return request<Project>(`/project/${encodeURIComponent(idOrSlug)}`);
}

export function getVersions(idOrSlug: string): Promise<Version[]> {
  return request<Version[]>(
    `/project/${encodeURIComponent(idOrSlug)}/version?game_versions=""`
  ).catch(() => request<Version[]>(`/project/${encodeURIComponent(idOrSlug)}/version`));
}

// Known loaders + categories used for the filter UI
export const LOADERS = ["fabric", "forge", "quilt", "neoforge", "liteloader", "iris"] as const;
export const PROJECT_TYPES = ["mod", "modpack", "shader", "resourcepack", "plugin"] as const;

export type LoaderName = (typeof LOADERS)[number];
export type ProjectTypeName = (typeof PROJECT_TYPES)[number];
