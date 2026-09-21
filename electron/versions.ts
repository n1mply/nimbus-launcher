import { ipcMain } from "electron";
import { XMLParser } from "fast-xml-parser";

type VersionManifest = {
  latest: { release: string; snapshot: string };
  versions: { id: string; type: string; releaseTime: string }[];
};

let gameVersionsCache: VersionManifest | null = null;
let gameVersionsPromise: Promise<VersionManifest> | null = null;

const loaderVersionsCache = new Map<string, unknown>();

type Modloader = "vanilla" | "fabric" | "forge" | "neoforge" | "quilt";

async function fetchLoaderVersions(
  loader: Modloader,
  mcVersion: string,
): Promise<string[]> {
  switch (loader) {
    case "vanilla":
      return [];

    case "fabric": {
      const res = await fetch(
        `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}`,
      );
      if (!res.ok) throw new Error(`Fabric meta responded with ${res.status}`);
      const data: { loader: { version: string; stable: boolean } }[] =
        await res.json();
      return data.map((entry) => entry.loader.version);
    }

    case "quilt": {
      const res = await fetch(
        `https://meta.quiltmc.org/v3/versions/loader/${mcVersion}`,
      );
      if (!res.ok) throw new Error(`Quilt meta responded with ${res.status}`);
      const data: { loader: { version: string } }[] = await res.json();
      return data.map((entry) => entry.loader.version);
    }

    case "forge": {
      const res = await fetch(
        "https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json",
      );
      if (!res.ok)
        throw new Error(`Forge maven-metadata responded with ${res.status}`);
      const data: Record<string, string[]> = await res.json();
      const fullVersions = data[mcVersion] ?? [];
      return fullVersions.map((v) => v.slice(mcVersion.length + 1)).reverse();
    }

    case "neoforge": {
      const res = await fetch(
        "https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml",
      );
      if (!res.ok)
        throw new Error(`NeoForge maven-metadata responded with ${res.status}`);
      const xml = await res.text();
      const parser = new XMLParser();
      const parsed = parser.parse(xml);
      const allVersions: string[] = parsed.metadata.versioning.versions.version;
      const m = mcVersion.match(/^1\.(\d+)(?:\.(\d+))?$/);
      const prefix = m ? `${m[1]}.${m[2] ?? 0}.` : `${mcVersion}.`;
      return allVersions.filter((v) => v.startsWith(prefix)).reverse();
    }

    default:
      throw new Error(`Unknown modloader: ${loader}`);
  }
}

async function loadGameVersions(): Promise<VersionManifest> {
  if (gameVersionsCache) return gameVersionsCache;
  if (!gameVersionsPromise) {
    gameVersionsPromise = fetch(
      "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
    )
      .then((res) => res.json())
      .then((data) => {
        gameVersionsCache = data;
        return data;
      })
      .finally(() => {
        gameVersionsPromise = null;
      });
  }
  return gameVersionsPromise;
}

async function loadLoaderVersions(loader: string, mcVersion: string) {
  const key = `${loader}:${mcVersion}`;
  if (loaderVersionsCache.has(key)) return loaderVersionsCache.get(key);

  const data = await fetchLoaderVersions(loader, mcVersion);
  loaderVersionsCache.set(key, data);
  return data;
}

export function registerVersionsHandlers() {
  ipcMain.handle("versions:getGameVersions", () => loadGameVersions());
  ipcMain.handle(
    "versions:getLoaderVersions",
    (_event, loader: string, mcVersion: string) =>
      loadLoaderVersions(loader, mcVersion),
  );
}

export { loadGameVersions };
