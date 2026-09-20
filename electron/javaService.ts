import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { spawn, execSync } from 'node:child_process';
import { DownloadManager } from './downloadManager';

export class JavaService {
  private javaRootDir: string;
  private dm: DownloadManager;

  constructor() {
    this.javaRootDir = path.join(app.getPath('userData'), 'runtimes');
    this.dm = new DownloadManager(2);
  }

  /**
   * Считывает реальную мажорную версию любого бинарника Java
   */
  public async getExactJavaVersion(executablePath: string): Promise<number | null> {
    if (!fs.existsSync(executablePath)) return null;

    return new Promise((resolve) => {
      const proc = spawn(executablePath, ['-version']);
      let output = '';

      proc.stderr.on('data', (d) => (output += d.toString()));
      proc.stdout.on('data', (d) => (output += d.toString()));

      proc.on('close', () => {
        // Ловит: "1.8.0_..." -> 8, "17.0.2" -> 17, "21.0.1" -> 21, "25-ea" -> 25
        const match = output.match(/version\s+"(?:1\.)?(\d+)/i);
        if (match && match[1]) {
          resolve(parseInt(match[1], 10));
        } else {
          resolve(null);
        }
      });

      proc.on('error', () => resolve(null));
    });
  }

  /**
   * Ищет системную Java ТОЛЬКО если она строго соответствует требуемой версии
   */
  public async getValidSystemJava(targetMajor: number): Promise<string | null> {
    try {
      const cmd = process.platform === 'win32' ? 'where java' : 'which java';
      const output = execSync(cmd, { encoding: 'utf-8' }).trim();
      const paths = output.split(/\r?\n/);

      for (const p of paths) {
        if (fs.existsSync(p)) {
          const version = await this.getExactJavaVersion(p);
          if (version === targetMajor) {
            console.log(`[JavaService] A suitable system component has been found Java ${targetMajor}: ${p}`);
            return p;
          }
        }
      }
    } catch {
      // Игнорируем отсутствие where/which
    }
    return null;
  }

  public getRecommendedJavaVersion(minecraftVersion?: string, versionJson?: any): number {
    if (versionJson?.javaVersion?.majorVersion) {
      return Number(versionJson.javaVersion.majorVersion);
    }

    if (!minecraftVersion) return 21;

    const clean = minecraftVersion.replace(/[^0-9.]/g, '');
    const match = clean.match(/1\.(\d+)(?:\.(\d+))?/);

    if (!match) return 21;

    const minor = parseInt(match[1], 10);
    const patch = match[2] ? parseInt(match[2], 10) : 0;

    if (minor <= 16) return 8;
    if (minor === 17) return 17;
    if (minor >= 18 && minor <= 20) {
      if (minor === 20 && patch >= 5) return 21;
      return 17;
    }

    return 21;
  }

  /**
   * Возвращает локальный путь в nimbus-launcher/runtimes/java-X
   */
  public getLocalJavaPath(majorVersion: number): string {
    const platform = process.platform;
    const binFolder = path.join(this.javaRootDir, `java-${majorVersion}`);

    if (platform === 'win32') {
      return path.join(binFolder, 'bin', 'java.exe');
    } else if (platform === 'darwin') {
      return path.join(binFolder, 'Contents', 'Home', 'bin', 'java');
    }
    return path.join(binFolder, 'bin', 'java');
  }

  /**
   * Гарантирует наличие ТОЧНОЙ мажорной версии Java
   */
  public async ensureJava(
    majorVersion: number,
    onProgress?: (progress: { totalBytes: number; downloadedBytes: number; currentTaskName: string }) => void
  ): Promise<string> {
    await fsp.mkdir(this.javaRootDir, { recursive: true });

    // 1. Проверяем уже скачанную локальную копию
    const localExec = this.getLocalJavaPath(majorVersion);
    const localVer = await this.getExactJavaVersion(localExec);
    if (localVer === majorVersion) {
      console.log(`[JavaService] Local Java ${majorVersion} проверена и готова.`);
      return localExec;
    }

    // 2. Проверяем системную Java (строго по версии)
    const systemJava = await this.getValidSystemJava(majorVersion);
    if (systemJava) {
      return systemJava;
    }

    // 3. Если нужной версии нет нигде — скачиваем портативную с Adoptium
    console.log(`[JavaService] Java ${majorVersion} не найдена. Начинаем загрузку...`);

    const os = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'mac' : 'linux';
    const arch = process.arch === 'x64' ? 'x64' : process.arch === 'arm64' ? 'aarch64' : 'x86';
    const archiveExt = os === 'windows' ? 'zip' : 'tar.gz';
    const archivePath = path.join(this.javaRootDir, `java-${majorVersion}.${archiveExt}`);
    const extractDir = path.join(this.javaRootDir, `temp-java-${majorVersion}`);

    // Пробуем стабильный релиз (ga), если 404 (как для Java 25) — пробуем ранний доступ (ea)
    let downloadUrl = `https://api.adoptium.net/v3/binary/latest/${majorVersion}/ga/${os}/${arch}/jdk/hotspot/normal/eclipse`;
    let res = await fetch(downloadUrl, { method: 'HEAD' });

    if (!res.ok) {
      console.log(`[JavaService] Релиз GA для Java ${majorVersion} недоступен, переключаемся на Early Access (EA)...`);
      downloadUrl = `https://api.adoptium.net/v3/binary/latest/${majorVersion}/ea/${os}/${arch}/jdk/hotspot/normal/eclipse`;
    }

    await this.dm.downloadQueue([{ url: downloadUrl, targetPath: archivePath, size: 0 }], onProgress);

    console.log(`[JavaService] Распаковка архива Java ${majorVersion}...`);
    await fsp.rm(extractDir, { recursive: true, force: true }).catch(() => {});
    await fsp.mkdir(extractDir, { recursive: true });

    if (archiveExt === 'zip') {
      const AdmZip = (await import('adm-zip')).default;
      const zip = new AdmZip(archivePath);
      zip.extractAllTo(extractDir, true);
    } else {
      const tar = await import('tar');
      await tar.x({ file: archivePath, cwd: extractDir });
    }

    // Adoptium упаковывает JDK во вложенную папку вида jdk-25+...
    const items = await fsp.readdir(extractDir);
    const rootInner = path.join(extractDir, items[0]);
    const finalDest = path.join(this.javaRootDir, `java-${majorVersion}`);

    await fsp.rm(finalDest, { recursive: true, force: true }).catch(() => {});
    await fsp.rename(rootInner, finalDest);

    // Удаляем временные файлы
    await fsp.rm(archivePath, { force: true }).catch(() => {});
    await fsp.rm(extractDir, { recursive: true, force: true }).catch(() => {});

    const finalExec = this.getLocalJavaPath(majorVersion);
    console.log(`[JavaService] Java ${majorVersion} успешно установлена в: ${finalExec}`);
    return finalExec;
  }
}