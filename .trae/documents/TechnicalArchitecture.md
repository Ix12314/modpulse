# 热门模组网站 技术架构文档

## 1. 架构设计

```mermaid
flowchart TD
    subgraph "前端层"
        "React 18 SPA" --> "React Router"
        "React Router" --> "首页 /"
        "React Router" --> "详情页 /mod/:id"
    end
    subgraph "状态管理"
        "Zustand Store" --> "主题状态"
        "Zustand Store" --> "筛选/排序状态"
    end
    subgraph "数据获取层"
        "Modrinth API Client" --> "searchMods"
        "Modrinth API Client" --> "getProject"
        "Modrinth API Client" --> "getVersions"
    end
    subgraph "外部服务"
        "Modrinth REST API v2"
    end
    "首页 /" --> "Modrinth API Client"
    "详情页 /mod/:id" --> "Modrinth API Client"
    "Modrinth API Client" --> "Modrinth REST API v2"
```

## 2. 技术栈

- **前端**：React@18 + TypeScript + Vite
- **样式**：Tailwind CSS 3（含 dark mode `class` 策略）
- **路由**：react-router-dom@6
- **状态管理**：Zustand
- **图标**：lucide-react
- **HTTP**：原生 fetch（Modrinth API 公开免鉴权）
- **初始化工具**：vite-init（react-ts 模板）
- **后端**：无（纯前端，直连 Modrinth API）
- **数据库**：无
- **部署**：GitHub Pages（静态托管）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 首页：热门模组列表、搜索、筛选、排序 |
| `/mod/:id` | 模组详情页：基础信息、统计、版本列表 |

## 4. API 定义

### 4.1 Modrinth Search API

```typescript
// GET https://api.modrinth.com/v2/search
interface SearchParams {
  query?: string;          // 搜索关键词
  facade?: 'true';         // 固定
  limit?: number;          // 默认 10
  offset?: number;
  index?: 'relevance' | 'downloads' | 'follows' | 'newest' | 'updated';
  facets?: string[];       // 例如 ['categories:fabric']
}

interface SearchResponse {
  hits: ModHit[];
  offset: number;
  limit: number;
  total_hits: number;
}

interface ModHit {
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
```

### 4.2 Modrinth Project API

```typescript
// GET https://api.modrinth.com/v2/project/{id|slug}
interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;            // markdown
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
}
```

### 4.3 Modrinth Version API

```typescript
// GET https://api.modrinth.com/v2/project/{id|slug}/version
interface Version {
  id: string;
  project_id: string;
  version_number: string;
  name: string;
  version_type: 'release' | 'beta' | 'alpha';
  game_versions: string[];
  loaders: string[];
  files: { url: string; filename: string; primary: boolean; size: number }[];
  date_published: string;
  downloads: number;
}
```

## 5. 服务器架构

无后端，纯前端 SPA 直连 Modrinth REST API。

## 6. 数据模型

无本地数据库。所有数据实时来自 Modrinth API。Zustand 仅缓存 UI 状态（主题、筛选条件）。

## 7. 部署架构

```mermaid
flowchart LR
    "pnpm build" --> "dist/ 静态文件"
    "dist/ 静态文件" --> "GitHub Pages"
    "GitHub Pages" --> "https://<user>.github.io/<repo>/"
```

- Vite `base` 配置为 `/<repo>/` 以适配 GitHub Pages 子路径
- 使用 `gh-pages` npm 包或直接 `git push` 到 `gh-pages` 分支
- SPA 路由需配置 404 重定向（使用 GitHub Pages 的 catch-all trick 或 HashRouter）
