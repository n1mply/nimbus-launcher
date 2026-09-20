"use strict";
const electron = require("electron");
console.log(">>> PRELOAD STARTED");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("auth", {
  login: () => electron.ipcRenderer.invoke("auth:login"),
  restoreSession: () => electron.ipcRenderer.invoke("auth:restore-session"),
  logout: () => electron.ipcRenderer.invoke("auth:logout"),
  getCredentials: () => electron.ipcRenderer.invoke("auth:get-credentials")
});
electron.contextBridge.exposeInMainWorld("skins", {
  getAll: (uuid) => electron.ipcRenderer.invoke("skins:get-all", uuid),
  add: (sourcePath) => electron.ipcRenderer.invoke("skins:add", sourcePath),
  delete: (fileName) => electron.ipcRenderer.invoke("skins:delete", fileName),
  apply: (uuid, fileName) => electron.ipcRenderer.invoke("skins:apply", uuid, fileName)
});
electron.contextBridge.exposeInMainWorld("capes", {
  getAll: (forceRefresh) => electron.ipcRenderer.invoke("capes:get-all", forceRefresh),
  apply: (capeId) => electron.ipcRenderer.invoke("capes:apply", capeId)
});
electron.contextBridge.exposeInMainWorld("versions", {
  getGameVersions: () => electron.ipcRenderer.invoke("versions:getGameVersions"),
  getLoaderVersions: (loader, mcVersion) => electron.ipcRenderer.invoke("versions:getLoaderVersions", loader, mcVersion)
});
const instancesApiMethods = {
  create: (payload) => electron.ipcRenderer.invoke("instances:create", payload),
  getAll: () => electron.ipcRenderer.invoke("instances:getAll"),
  checkInstalled: (instanceId) => electron.ipcRenderer.invoke("instances:checkInstalled", instanceId),
  // Установка и запуск
  install: (instanceId) => electron.ipcRenderer.invoke("instance:install", instanceId),
  cancelInstall: (instanceId) => electron.ipcRenderer.invoke("instance:cancel-install", instanceId),
  launch: (instanceId) => electron.ipcRenderer.invoke("instance:launch", instanceId),
  // Слушатели событий загрузки
  onProgress: (callback) => {
    const sub = (_, data) => callback(data);
    electron.ipcRenderer.on("download:progress", sub);
    return () => electron.ipcRenderer.removeListener("download:progress", sub);
  },
  onComplete: (callback) => {
    const sub = (_, data) => callback(data);
    electron.ipcRenderer.on("download:complete", sub);
    return () => electron.ipcRenderer.removeListener("download:complete", sub);
  },
  onError: (callback) => {
    const sub = (_, data) => callback(data);
    electron.ipcRenderer.on("download:error", sub);
    return () => electron.ipcRenderer.removeListener("download:error", sub);
  },
  // Слушатели событий игры
  onGameLog: (callback) => {
    const sub = (_, data) => callback(data);
    electron.ipcRenderer.on("game:log", sub);
    return () => electron.ipcRenderer.removeListener("game:log", sub);
  },
  onGameCrashed: (callback) => {
    const sub = (_, data) => callback(data);
    electron.ipcRenderer.on("game:crashed", sub);
    return () => electron.ipcRenderer.removeListener("game:crashed", sub);
  },
  onGameClosed: (callback) => {
    const sub = (_, data) => callback(data);
    electron.ipcRenderer.on("game:closed", sub);
    return () => electron.ipcRenderer.removeListener("game:closed", sub);
  }
};
electron.contextBridge.exposeInMainWorld("instancesAPI", instancesApiMethods);
electron.contextBridge.exposeInMainWorld("instanceAPI", instancesApiMethods);
electron.contextBridge.exposeInMainWorld("folderAPI", {
  openInstanceFolder: (folderName) => electron.ipcRenderer.invoke("folder:openInstanceFolder", folderName),
  deleteInstanceFolder: (folderName, mode) => electron.ipcRenderer.invoke("folder:deleteInstanceFolder", { folderName, mode })
});
