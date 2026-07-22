// Minecraft version + changelog data sources:
//   1. Mojang piston-meta version manifest (real-time version list, no auth, CORS *)
//   2. Minecraft Wiki MediaWiki API (release-note extracts, CORS *)
//
// These are public, CORS-enabled endpoints — safe to call directly from the
// browser on GitHub Pages.

const MANIFEST_URL = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
const WIKI_API = "https://minecraft.wiki/api.php";

export type VersionType = "release" | "snapshot" | "old_beta" | "old_alpha";

export interface ManifestVersion {
  id: string;
  type: VersionType;
  url: string;
  time: string;
  releaseTime: string;
  sha1: string;
  complianceLevel: number;
}

export interface VersionManifest {
  latest: { release: string; snapshot: string };
  versions: ManifestVersion[];
}

/**
 * Fetch the live Mojang version manifest. Contains every Java Edition version
 * with its id, type (release/snapshot), and release time — sorted newest first.
 */
export async function getVersionManifest(): Promise<VersionManifest> {
  const res = await fetch(MANIFEST_URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Mojang manifest ${res.status}`);
  return res.json() as Promise<VersionManifest>;
}

/**
 * Convert a launcher version id (e.g. "26.3-snapshot-5") into the wiki page
 * title format (e.g. "Java Edition 26.3 Snapshot 5").
 */
export function versionIdToWikiTitle(id: string, type: VersionType): string {
  // Snapshots: "26.3-snapshot-5" -> "26.3 Snapshot 5"
  if (type === "snapshot") {
    return `Java Edition ${id.replace(/-snapshot-/i, " Snapshot ")}`;
  }
  // Releases: "26.2" -> "Java Edition 26.2"
  return `Java Edition ${id}`;
}

interface WikiExtractResponse {
  query?: { pages: { title: string; extract?: string; missing?: boolean }[] };
}

/**
 * Fetch the intro extract (plain-text changelog summary) for a Minecraft
 * version from the Minecraft Wiki. Returns null if the page doesn't exist.
 */
export async function getVersionChangelog(
  id: string,
  type: VersionType,
): Promise<string | null> {
  const title = versionIdToWikiTitle(id, type);
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "extracts",
    exintro: "1",
    explaintext: "1",
    titles: title,
  });
  const res = await fetch(`${WIKI_API}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Wiki API ${res.status}`);
  const data = (await res.json()) as WikiExtractResponse;
  const page = data.query?.pages?.[0];
  if (!page || page.missing || !page.extract) return null;
  return page.extract.trim();
}

/** Build the wiki article URL for a version (for "查看完整更新日志" links). */
export function wikiUrlForVersion(id: string, type: VersionType): string {
  const title = versionIdToWikiTitle(id, type).replace(/ /g, "_");
  return `https://minecraft.wiki/w/${title}`;
}
