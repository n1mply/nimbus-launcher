import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

/*
 * Рекурсивно мёрджит version.json с родителями по inheritsFrom.
 * Идентична логике из launchService.ts — вынесена сюда, чтобы integrityService
 * и launchService всегда считали "ожидаемый набор файлов" и "чем запускать" одинаково.
 */
export async function loadMergedVersion(
  versionsDir: string,
  versionId: string,
): Promise<any> {
  const p = path.join(versionsDir, versionId, `${versionId}.json`);
  if (!fs.existsSync(p)) {
    throw new Error(`Манифест версии не найден: ${p}. Переустановите инстанс`);
  }
  const child = JSON.parse(await fsp.readFile(p, "utf-8"));
  if (!child.inheritsFrom) return child;

  const parent = await loadMergedVersion(versionsDir, child.inheritsFrom);
  return {
    ...parent,
    ...child,
    mainClass: child.mainClass ?? parent.mainClass,
    assetIndex: child.assetIndex ?? parent.assetIndex,
    libraries: [...(child.libraries ?? []), ...(parent.libraries ?? [])],
    arguments: {
      game: [...(parent.arguments?.game ?? []), ...(child.arguments?.game ?? [])],
      jvm: [...(parent.arguments?.jvm ?? []), ...(child.arguments?.jvm ?? [])],
    },
  };
}