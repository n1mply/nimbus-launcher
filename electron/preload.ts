console.log(">>> PRELOAD STARTED");
import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
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

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("auth", {
  login: () => ipcRenderer.invoke("auth:login"),
  restoreSession: () => ipcRenderer.invoke("auth:restore-session"),
  logout: () => ipcRenderer.invoke("auth:logout"),
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

contextBridge.exposeInMainWorld("instancesAPI", {
  create: (payload: any) => ipcRenderer.invoke("instances:create", payload),
  getAll: () => ipcRenderer.invoke("instances:getAll"),
  checkInstalled: (instanceId: string) =>
    ipcRenderer.invoke("instances:checkInstalled", instanceId),
});

contextBridge.exposeInMainWorld("folderAPI", {
  openInstanceFolder: (folderName: string) =>
    ipcRenderer.invoke("folder:openInstanceFolder", folderName),
});
