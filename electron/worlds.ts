// worlds.ts
import { app, ipcMain } from "electron";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import zlib from "zlib";
import type { World, GameMode, WorldDifficulty } from "..//src/types";

// --- МИНИ-ПАРСЕР NBT ДЛЯ LEVEL.DAT ---
function parseNBT(buf: Buffer): any {
  let offset = 0;

  function readTag(tagType: number): any {
    switch (tagType) {
      case 1: { const v = buf.readInt8(offset); offset += 1; return v; }
      case 2: { const v = buf.readInt16BE(offset); offset += 2; return v; }
      case 3: { const v = buf.readInt32BE(offset); offset += 4; return v; }
      case 4: { const v = buf.readBigInt64BE(offset); offset += 8; return Number(v); }
      case 5: { const v = buf.readFloatBE(offset); offset += 4; return v; }
      case 6: { const v = buf.readDoubleBE(offset); offset += 8; return v; }
      case 7: {
        const len = buf.readInt32BE(offset); offset += 4;
        offset += len;
        return null;
      }
      case 8: {
        const len = buf.readUInt16BE(offset); offset += 2;
        const str = buf.toString("utf8", offset, offset + len);
        offset += len;
        return str;
      }
      case 9: {
        const itemType = buf.readUInt8(offset); offset += 1;
        const len = buf.readInt32BE(offset); offset += 4;
        const list = [];
        for (let i = 0; i < len; i++) list.push(readTag(itemType));
        return list;
      }
      case 10: {
        const obj: Record<string, any> = {};
        while (offset < buf.length) {
          const type = buf.readUInt8(offset); offset += 1;
          if (type === 0) break; // TAG_End
          const nameLen = buf.readUInt16BE(offset); offset += 2;
          const name = buf.toString("utf8", offset, offset + nameLen); offset += nameLen;
          obj[name] = readTag(type);
        }
        return obj;
      }
      case 11: {
        const len = buf.readInt32BE(offset); offset += 4;
        offset += len * 4;
        return null;
      }
      case 12: {
        const len = buf.readInt32BE(offset); offset += 4;
        offset += len * 8;
        return null;
      }
      default:
        return null;
    }
  }

  const rootType = buf.readUInt8(offset); offset += 1;
  if (rootType !== 10) return null;
  const rootNameLen = buf.readUInt16BE(offset); offset += 2;
  offset += rootNameLen;
  return readTag(10);
}

const GAME_MODES: Record<number, GameMode> = {
  0: "survival",
  1: "creative",
  2: "adventure",
  3: "spectator",
};

const DIFFICULTIES: Record<number, WorldDifficulty> = {
  0: "peaceful",
  1: "easy",
  2: "normal",
  3: "hard",
};

export async function getWorlds(instanceFolderName: string): Promise<World[]> {
  const savesDir = path.join(
    app.getPath("userData"),
    "instances",
    instanceFolderName,
    "minecraft",
    "saves"
  );

  if (!existsSync(savesDir)) {
    return [];
  }

  const entries = await fs.readdir(savesDir, { withFileTypes: true });
  const worlds: World[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const worldFolder = path.join(savesDir, entry.name);
    const levelDatPath = path.join(worldFolder, "level.dat");

    if (!existsSync(levelDatPath)) continue;

    let worldName = entry.name;
    let gameMode: GameMode = "survival";
    let difficulty: WorldDifficulty = "normal";
    let lastPlayed: number | undefined;
    let versionName: string | undefined;
    let iconPath: string | null = null;

    const iconFile = path.join(worldFolder, "icon.png");
    if (existsSync(iconFile)) {
      try {
        const iconBuf = await fs.readFile(iconFile);
        iconPath = `data:image/png;base64,${iconBuf.toString("base64")}`;
      } catch (e) {
        console.warn(`Could not load icon for world ${entry.name}:`, e);
      }
    }

    try {
      const gzipped = await fs.readFile(levelDatPath);
      const unzipped = zlib.gunzipSync(gzipped);
      const nbt = parseNBT(unzipped);
      const data = nbt?.Data ?? nbt;

      if (data) {
        if (data.LevelName) worldName = data.LevelName;
        if (data.hardcore === 1) {
          gameMode = "hardcore";
        } else if (typeof data.GameType === "number") {
          gameMode = GAME_MODES[data.GameType] ?? "survival";
        }

        if (typeof data.Difficulty === "number") {
          difficulty = DIFFICULTIES[data.Difficulty] ?? "normal";
        }

        if (data.LastPlayed) lastPlayed = data.LastPlayed;
        if (data.Version?.Name) versionName = data.Version.Name;
      }
    } catch (e) {
      console.warn(`Could not parse level.dat for ${entry.name}:`, e);
    }

    worlds.push({
      folderName: entry.name,
      name: worldName,
      instanceFolderName,
      gameMode,
      difficulty,
      lastPlayed,
      iconPath,
      versionName,
    });
  }

  return worlds.sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
}

export function registerWorldHandlers(): void {
  ipcMain.handle("worlds:getByInstance", async (_, instanceFolderName: string) => {
    return await getWorlds(instanceFolderName);
  });
}