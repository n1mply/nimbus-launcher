// modrinthActions.ts
import { ipcMain } from "electron";
import { saveContentToInstance } from "./folderActions";

const MODRINTH_API_BASE = "https://api.modrinth.com/v2";
const USER_AGENT = "n1mply/nimbus-launcher/1.0.0 (n1mply.dev@gmail.com)";

function modrinthHeaders(): HeadersInit {
  return { "User-Agent": USER_AGENT };
}

async function modrinthFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${MODRINTH_API_BASE}${path}`, {
    headers: modrinthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Modrinth API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const searchCache = new Map<string, CacheEntry<ModrinthSearchResult>>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

function getFromCache(key: string): ModrinthSearchResult | null {
  const entry = searchCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    searchCache.delete(key);
    return null;
  }

  return entry.data;
}

function setToCache(key: string, data: ModrinthSearchResult): void {
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }

  searchCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export interface ModrinthCategory {
  icon: string;
  name: string;
  project_type: string;
  header: string;
}

export interface ModrinthSearchHit {
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
}

export interface ModrinthSearchResult {
  hits: ModrinthSearchHit[];
  offset: number;
  limit: number;
  total_hits: number;
}

export interface SearchOptions {
  query?: string;
  projectType?: string;
  loader?: string;
  version?: string;
  category?: string;
  sortBy?: "relevance" | "downloads" | "follows" | "newest" | "updated";
  limit?: number;
  offset?: number;
}

export interface InstallToInstanceOptions {
  projectId: string;
  projectType: string;
  instanceFolderName: string;
  minecraftVersion: string;
  modloader?: string;
}

let categoriesCache: ModrinthCategory[] | null = null;
let categoriesPromise: Promise<ModrinthCategory[]> | null = null;

export async function loadAllCategories(): Promise<ModrinthCategory[]> {
  if (categoriesCache) return categoriesCache;
  if (!categoriesPromise) {
    categoriesPromise = modrinthFetch<ModrinthCategory[]>("/tag/category")
      .then((data) => {
        categoriesCache = data;
        return data;
      })
      .finally(() => {
        categoriesPromise = null;
      });
  }
  return categoriesPromise;
}

export async function getModrinthCategories(
  projectType: string = "mod",
): Promise<ModrinthCategory[]> {
  const all = await loadAllCategories();
  return all.filter((c) => c.project_type === projectType);
}

export async function searchModrinthProjects(
  options: SearchOptions,
): Promise<ModrinthSearchResult> {
  const cacheKey = JSON.stringify(options);
  const facets: string[][] = [];

  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Фильтр по типу проекта
  if (options.projectType) {
    facets.push([`project_type:${options.projectType}`]);
  }

  // Фильтр по модлоадеру
  if (options.loader && options.loader !== "all") {
    facets.push([`categories:${options.loader}`]);
  }

  // Фильтр по версии Minecraft
  if (options.version && options.version.trim() !== "") {
    facets.push([`versions:${options.version.trim()}`]);
  }

  // Фильтр по категории / тегу
  if (options.category && options.category !== "all") {
    facets.push([`categories:${options.category}`]);
  }

  const params = new URLSearchParams();
  if (options.query?.trim()) {
    params.set("query", options.query.trim());
  }
  if (facets.length > 0) {
    params.set("facets", JSON.stringify(facets));
  }
  if (options.sortBy) {
    params.set("index", options.sortBy);
  }
  params.set("limit", String(options.limit ?? 15));
  params.set("offset", String(options.offset ?? 0));

  const result = await modrinthFetch<ModrinthSearchResult>(
    `/search?${params.toString()}`,
  );

  setToCache(cacheKey, result);

  return result;
}

export async function installModrinthProjectToInstance(
  options: InstallToInstanceOptions,
) {
  const {
    projectId,
    projectType,
    instanceFolderName,
    minecraftVersion,
    modloader,
  } = options;

  // Формируем фильтры для версий Modrinth
  const params = new URLSearchParams();

  // Для модов строго указываем и лоадер, и версию игры
  if (projectType === "mod" && modloader && modloader !== "vanilla") {
    params.set("loaders", JSON.stringify([modloader.toLowerCase()]));
  }
  if (minecraftVersion) {
    params.set("game_versions", JSON.stringify([minecraftVersion]));
  }

  // 1. Ищем совместимые версии файла
  let versions = await modrinthFetch<any[]>(
    `/project/${projectId}/version?${params.toString()}`,
  );

  // Если для ресурспака/шейдера нет точного совпадения по версии игры — берем последнюю доступную
  if (
    (!versions || versions.length === 0) &&
    (projectType === "resourcepack" || projectType === "shader")
  ) {
    versions = await modrinthFetch<any[]>(`/project/${projectId}/version`);
  }

  if (!versions || versions.length === 0) {
    throw new Error(
      `No compatible version found for ${modloader ?? ""} ${minecraftVersion}`,
    );
  }

  // 2. Берем самую свежую версию и её primary-файл
  const targetVersion = versions[0];
  const targetFile =
    targetVersion.files.find((f: any) => f.primary) || targetVersion.files[0];

  if (!targetFile || !targetFile.url) {
    throw new Error("No downloadable file found in this version");
  }

  // 3. Скачиваем файл в память
  const response = await fetch(targetFile.url, { headers: modrinthHeaders() });
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  // 4. Сохраняем файл на диск в папку сборки
  const saveResult = await saveContentToInstance(
    instanceFolderName,
    projectType,
    targetFile.filename,
    fileBuffer,
  );

  if (!saveResult.success) {
    throw new Error(saveResult.error || "Failed to save file");
  }

  return {
    success: true,
    fileName: targetFile.filename,
    versionNumber: targetVersion.version_number,
  };
}

export function registerModrinthHandlers(): void {
  ipcMain.handle(
    "modrinthAPI:getCategories",
    async (_, projectType?: string) => {
      return await getModrinthCategories(projectType);
    },
  );

  ipcMain.handle(
    "modrinthAPI:searchProjects",
    async (_, options: SearchOptions) => {
      return await searchModrinthProjects(options);
    },
  );

  ipcMain.handle(
    "modrinthAPI:installToInstance",
    async (_, options: InstallToInstanceOptions) => {
      return await installModrinthProjectToInstance(options);
    },
  );
}
