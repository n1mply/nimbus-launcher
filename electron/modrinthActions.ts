// modrinthActions.ts
import { ipcMain } from "electron";
import {
  saveContentToInstance,
  getInstalledContent,
  recordInstalledContent,
  InstalledContentRecord,
} from "./folderActions";

import type { ContentItem } from "../src/types";

const MODRINTH_API_BASE = "https://api.modrinth.com/v2";
const USER_AGENT = "n1mply/nimbus-launcher/1.0.0 (n1mply.dev@gmail.com)";

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

export interface CheckEligibilityOptions {
  projectId: string;
  projectType: string;
  instanceFolderName: string;
  minecraftVersion: string;
  modloader?: string;
}

export interface EligibilityResult {
  isDuplicate: boolean;
  existingFileName?: string;
  version: any;
  missingDependencies: ContentItem[];
}

let categoriesCache: ModrinthCategory[] | null = null;
let categoriesPromise: Promise<ModrinthCategory[]> | null = null;

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

export async function checkInstallationEligibility(
  opts: CheckEligibilityOptions,
): Promise<EligibilityResult> {
  const {
    projectId,
    projectType,
    instanceFolderName,
    minecraftVersion,
    modloader,
  } = opts;

  // 1. Проверяем, установлен ли уже этот проект
  const installed = await getInstalledContent(instanceFolderName);
  const existing = installed.find((r) => r.projectId === projectId);

  // 2. Получаем подходящую версию мода
  const params = new URLSearchParams();
  if (projectType === "mod" && modloader && modloader !== "vanilla") {
    params.set("loaders", JSON.stringify([modloader.toLowerCase()]));
  }
  if (minecraftVersion) {
    params.set("game_versions", JSON.stringify([minecraftVersion]));
  }

  let versions = await modrinthFetch<any[]>(
    `/project/${projectId}/version?${params.toString()}`,
  );
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

  const targetVersion = versions[0];

  // 3. Проверяем зависимости (только для модов)
  const missingDeps: any[] = [];
  if (projectType === "mod" && Array.isArray(targetVersion.dependencies)) {
    // Находим обязательные зависимости
    const requiredDeps = targetVersion.dependencies.filter(
      (d: any) => d.dependency_type === "required" && d.project_id,
    );

    // Отсекаем те, что УЖЕ установлены в этой сборке
    const neededProjectIds = requiredDeps
      .map((d: any) => d.project_id)
      .filter((id: string) => !installed.some((inst) => inst.projectId === id));

    // Если есть неустановленные зависимости — запрашиваем инфу о них пакетом
    if (neededProjectIds.length > 0) {
      const projects = await modrinthFetch<any[]>(
        `/projects?ids=${encodeURIComponent(JSON.stringify(neededProjectIds))}`,
      );

      // Преобразуем в ContentItem для карточек
      for (const p of projects) {
        missingDeps.push({
          id: p.id,
          name: p.title,
          author: p.author ?? "Unknown",
          summary: p.description,
          iconUrl: p.icon_url,
          downloads: p.downloads,
          follows: p.follows,
          updatedAt: p.updated,
          type: "mod",
          tags: (p.categories || []).map((cat: string) => ({
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            variant: "generic",
          })),
        });
      }
    }
  }

  return {
    isDuplicate: !!existing,
    existingFileName: existing?.fileName,
    version: targetVersion,
    missingDependencies: missingDeps,
  };
}

/**
 * Установка конкретного файла и запись в реестр
 */
async function downloadAndSaveSingleProject(
  projectId: string,
  projectType: string,
  instanceFolderName: string,
  version: any,
) {
  const file = version.files.find((f: any) => f.primary) || version.files[0];
  if (!file?.url) throw new Error("No downloadable file in version");

  const response = await fetch(file.url, { headers: modrinthHeaders() });
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const res = await saveContentToInstance(
    instanceFolderName,
    projectType,
    file.filename,
    buffer,
  );
  if (!res.success) throw new Error(res.error);

  await recordInstalledContent(instanceFolderName, {
    projectId,
    projectType,
    versionId: version.id,
    fileName: file.filename,
    installedAt: Date.now(),
  });

  return file.filename;
}

/**
 * Пакетная установка: основной мод + выбранные зависимости
 */
export async function installWithDependencies(opts: {
  mainProject: { id: string; type: string; version: any };
  dependencyProjectIds?: string[];
  instanceFolderName: string;
  minecraftVersion: string;
  modloader?: string;
}) {
  const {
    mainProject,
    dependencyProjectIds,
    instanceFolderName,
    minecraftVersion,
    modloader,
  } = opts;

  // 1. Сначала скачиваем зависимости
  if (dependencyProjectIds && dependencyProjectIds.length > 0) {
    for (const depId of dependencyProjectIds) {
      try {
        const params = new URLSearchParams();
        if (modloader && modloader !== "vanilla") {
          params.set("loaders", JSON.stringify([modloader.toLowerCase()]));
        }
        if (minecraftVersion) {
          params.set("game_versions", JSON.stringify([minecraftVersion]));
        }
        const vers = await modrinthFetch<any[]>(
          `/project/${depId}/version?${params.toString()}`,
        );
        if (vers && vers.length > 0) {
          await downloadAndSaveSingleProject(
            depId,
            "mod",
            instanceFolderName,
            vers[0],
          );
        }
      } catch (e) {
        console.warn(`Could not install dependency ${depId}:`, e);
      }
    }
  }

  // 2. Скачиваем целевой мод
  const fileName = await downloadAndSaveSingleProject(
    mainProject.id,
    mainProject.type,
    instanceFolderName,
    mainProject.version,
  );

  return { success: true, fileName };
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

  ipcMain.handle(
    "modrinthAPI:checkEligibility",
    async (_, opts: CheckEligibilityOptions) => {
      return await checkInstallationEligibility(opts);
    },
  );

  ipcMain.handle(
    "modrinthAPI:installWithDependencies",
    async (_, opts: any) => {
      return await installWithDependencies(opts);
    },
  );
}
