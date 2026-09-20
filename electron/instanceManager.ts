import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { InstanceStatus, Instance } from '../src/types';

export function getInstancesDir(): string {
  return path.join(app.getPath('userData'), 'instances');
}

export function getInstanceDir(instanceId: string): string {
  return path.join(getInstancesDir(), instanceId);
}

export function getInstanceConfigPath(instanceId: string): string {
  return path.join(getInstanceDir(instanceId), 'instance.json');
}

export function getMinecraftDir(instanceId: string): string {
  return path.join(getInstanceDir(instanceId), 'minecraft');
}

/**
 * Читает конфигурацию instance.json
 */
export async function readInstance(instanceId: string): Promise<Instance> {
  const filePath = getInstanceConfigPath(instanceId);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data) as Instance;
}

/**
 * Атомарно перезаписывает instance.json (запись в .tmp -> rename)
 */
export async function writeInstance(instanceId: string, data: Partial<Instance>): Promise<Instance> {
  const dir = getInstanceDir(instanceId);
  await fs.mkdir(dir, { recursive: true });

  const filePath = getInstanceConfigPath(instanceId);
  let current: Partial<Instance> = {};

  if (existsSync(filePath)) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      current = JSON.parse(content);
    } catch {
      current = {};
    }
  }

  const updated: Instance = {
    ...current,
    ...data,
    id: instanceId,
    updatedAt: Date.now(),
  } as Instance;

  const tempPath = path.join(dir, `instance.${Date.now()}.tmp`);
  await fs.writeFile(tempPath, JSON.stringify(updated, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);

  return updated;
}

export async function setInstanceStatus(instanceId: string, status: InstanceStatus): Promise<void> {
  await writeInstance(instanceId, { status });
}