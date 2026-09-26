console.log(">>> PRELOAD STARTED");
import { ipcRenderer, contextBridge } from "electron";
import { UpdateInstanceSettingsPayload } from "./instances";
import { webUtils } from "electron";

// --------- Базовый транспорт IPC ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

contextBridge.exposeInMainWorld("auth", {
  login: () => ipcRenderer.invoke("auth:login"),
  restoreSession: () => ipcRenderer.invoke("auth:restore-session"),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getCredentials: () => ipcRenderer.invoke("auth:get-credentials"),
});

contextBridge.exposeInMainWorld("skins", {
  getAll: (uuid: string) => ipcRenderer.invoke("skins:get-all", uuid),
  add: (sourcePath: string) => ipcRenderer.invoke("skins:add", sourcePath),
  delete: (fileName: string) => ipcRenderer.invoke("skins:delete", fileName),
  apply: (uuid: string, fileName: string) =>
    ipcRenderer.invoke("skins:apply", uuid, fileName),
});

contextBridge.exposeInMainWorld("capes", {
  getAll: (forceRefresh?: boolean) =>
    ipcRenderer.invoke("capes:get-all", forceRefresh),
  apply: (capeId: string | null) => ipcRenderer.invoke("capes:apply", capeId),
});

contextBridge.exposeInMainWorld("versions", {
  getGameVersions: () => ipcRenderer.invoke("versions:getGameVersions"),
  getLoaderVersions: (loader: string, mcVersion: string) =>
    ipcRenderer.invoke("versions:getLoaderVersions", loader, mcVersion),
});

// Единый API для инстансов
const instancesApiMethods = {
  create: (payload: any) => ipcRenderer.invoke("instances:create", payload),
  getAll: () => ipcRenderer.invoke("instances:getAll"),
  checkInstalled: (instanceId: string) =>
    ipcRenderer.invoke("instances:checkInstalled", instanceId),

  // Установка, запуск и остановка
  install: (instanceId: string) =>
    ipcRenderer.invoke("instance:install", instanceId),
  cancelInstall: (instanceId: string) =>
    ipcRenderer.invoke("instance:cancel-install", instanceId),
  launch: (instanceId: string) =>
    ipcRenderer.invoke("instance:launch", instanceId),
  stop: (instanceId: string) => ipcRenderer.invoke("instance:stop", instanceId),
  getRunning: () => ipcRenderer.invoke("instances:getRunning"),

  // Изменение сборки
  rename: (instanceId: string, newName: string) =>
    ipcRenderer.invoke("instances:rename", instanceId, newName),
  updateSettings: (instanceId: string, patch: UpdateInstanceSettingsPayload) =>
    ipcRenderer.invoke("instances:updateSettings", instanceId, patch),
  setLoaderVersion: (instanceId: string, version: string) =>
    ipcRenderer.invoke("instances:setLoaderVersion", instanceId, version),

  // Слушатели событий загрузки
  onProgress: (callback: (data: any) => void) => {
    const sub = (_: any, data: any) => callback(data);
    ipcRenderer.on("download:progress", sub);
    return () => ipcRenderer.removeListener("download:progress", sub);
  },
  onComplete: (callback: (data: any) => void) => {
    const sub = (_: any, data: any) => callback(data);
    ipcRenderer.on("download:complete", sub);
    return () => ipcRenderer.removeListener("download:complete", sub);
  },
  onError: (callback: (data: any) => void) => {
    const sub = (_: any, data: any) => callback(data);
    ipcRenderer.on("download:error", sub);
    return () => ipcRenderer.removeListener("download:error", sub);
  },

  // Слушатели событий игры
  onGameLog: (
    callback: (data: {
      instanceId: string;
      log: string;
      error?: boolean;
    }) => void,
  ) => {
    const sub = (_: any, data: any) => callback(data);
    ipcRenderer.on("game:log", sub);
    return () => ipcRenderer.removeListener("game:log", sub);
  },
  onGameCrashed: (
    callback: (data: { instanceId: string; exitCode: number }) => void,
  ) => {
    const sub = (_: any, data: any) => callback(data);
    ipcRenderer.on("game:crashed", sub);
    return () => ipcRenderer.removeListener("game:crashed", sub);
  },
  onGameClosed: (callback: (data: { instanceId: string }) => void) => {
    const sub = (_: any, data: any) => callback(data);
    ipcRenderer.on("game:closed", sub);
    return () => ipcRenderer.removeListener("game:closed", sub);
  },
};

contextBridge.exposeInMainWorld("instancesAPI", instancesApiMethods);
contextBridge.exposeInMainWorld("instanceAPI", instancesApiMethods);

contextBridge.exposeInMainWorld("folderAPI", {
  openInstanceFolder: (folderName: string) =>
    ipcRenderer.invoke("folder:openInstanceFolder", folderName),

  deleteInstanceFolder: (folderName: string, mode: "soft" | "hard") =>
    ipcRenderer.invoke("folder:deleteInstanceFolder", { folderName, mode }),

  openLatestLog: (folderName: string) =>
    ipcRenderer.invoke("folder:openLatestLog", folderName),
});

contextBridge.exposeInMainWorld("systemAPI", {
  getTotalMemoryMb: () => ipcRenderer.invoke("system:getTotalMemoryMb"),
});

contextBridge.exposeInMainWorld("javaAPI", {
  validate: (execPath: string) => ipcRenderer.invoke("java:validate", execPath),
  pickExecutable: () => ipcRenderer.invoke("java:pickExecutable"),
});

contextBridge.exposeInMainWorld("webUtilsAPI", {
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
});
