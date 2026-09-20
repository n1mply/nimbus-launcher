import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { DownloadTask } from '../src/types';

export interface DownloadProgress {
  totalBytes: number;
  downloadedBytes: number;
  currentTaskName: string;
}

export class DownloadManager {
  private concurrency: number;
  private maxRetries: number;

  constructor(concurrency = 10, maxRetries = 3) {
    this.concurrency = concurrency;
    this.maxRetries = maxRetries;
  }

  public async computeFileSha1(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  public async downloadFile(task: DownloadTask, signal?: AbortSignal): Promise<void> {
    await fsp.mkdir(path.dirname(task.targetPath), { recursive: true });
    const tempPath = `${task.targetPath}.${Date.now()}.tmp`;

    let attempt = 0;
    while (attempt < this.maxRetries) {
      if (signal?.aborted) {
        throw new Error('DOWNLOAD_ABORTED');
      }

      attempt++;
      try {
        const response = await fetch(task.url, { signal });
        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const fileStream = fs.createWriteStream(tempPath);
        const { Readable } = await import('node:stream');
        const readable = Readable.fromWeb(response.body as any);

        await new Promise<void>((resolve, reject) => {
          const onAbort = () => {
            fileStream.destroy();
            reject(new Error('DOWNLOAD_ABORTED'));
          };

          if (signal) {
            signal.addEventListener('abort', onAbort, { once: true });
          }

          const cleanup = () => {
            if (signal) {
              signal.removeEventListener('abort', onAbort);
            }
          };

          readable.pipe(fileStream);

          fileStream.on('finish', () => {
            cleanup();
            resolve();
          });

          fileStream.on('error', (err) => {
            cleanup();
            reject(err);
          });
        });

        // Проверка размера (если размер передан)
        if (task.size > 0) {
          const stat = await fsp.stat(tempPath);
          if (stat.size !== task.size) {
            throw new Error(`Size mismatch: expected ${task.size}, got ${stat.size}`);
          }
        }

        // Проверка SHA1 (если передан)
        if (task.sha1) {
          const actualSha1 = await this.computeFileSha1(tempPath);
          if (actualSha1.toLowerCase() !== task.sha1.toLowerCase()) {
            throw new Error(`SHA1 mismatch: expected ${task.sha1}, got ${actualSha1}`);
          }
        }

        // Атомарное перемещение
        await fsp.rename(tempPath, task.targetPath);
        return;
      } catch (err: any) {
        if (fs.existsSync(tempPath)) {
          await fsp.rm(tempPath, { force: true }).catch(() => {});
        }
        if (signal?.aborted || err.message === 'DOWNLOAD_ABORTED') {
          throw new Error('DOWNLOAD_ABORTED');
        }
        if (attempt >= this.maxRetries) {
          throw new Error(`Ошибка загрузки ${task.url}: ${err.message}`);
        }
        await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 400));
      }
    }
  }

  public async downloadQueue(
    tasks: DownloadTask[],
    onProgress?: (progress: DownloadProgress) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const totalBytes = tasks.reduce((sum, t) => sum + (t.size || 0), 0);
    let downloadedBytes = 0;
    let index = 0;

    const worker = async (): Promise<void> => {
      while (index < tasks.length) {
        if (signal?.aborted) throw new Error('DOWNLOAD_ABORTED');
        const currentIndex = index++;
        const task = tasks[currentIndex];

        await this.downloadFile(task, signal);

        downloadedBytes += task.size || 0;
        if (onProgress) {
          onProgress({
            totalBytes,
            downloadedBytes,
            currentTaskName: path.basename(task.targetPath),
          });
        }
      }
    };

    const workerCount = Math.min(this.concurrency, tasks.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
  }
}