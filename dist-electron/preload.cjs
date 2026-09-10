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
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("auth", {
  login: () => electron.ipcRenderer.invoke("auth:login"),
  restoreSession: () => electron.ipcRenderer.invoke("auth:restore-session"),
  logout: () => electron.ipcRenderer.invoke("auth:logout")
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
electron.contextBridge.exposeInMainWorld("instancesAPI", {
  create: (payload) => electron.ipcRenderer.invoke("instances:create", payload),
  getAll: () => electron.ipcRenderer.invoke("instances:getAll"),
  checkInstalled: (instanceId) => electron.ipcRenderer.invoke("instances:checkInstalled", instanceId)
});
electron.contextBridge.exposeInMainWorld("folderAPI", {
  openInstanceFolder: (folderName) => electron.ipcRenderer.invoke("folder:openInstanceFolder", folderName)
});
