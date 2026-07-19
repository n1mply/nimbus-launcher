import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1080,
    height: 720,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC, "Logo.png"),
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.cjs"),
      sandbox: false
    }
  });
  ipcMain.on("window-control", (_, action) => {
    if (!win) return;
    if (action === "minimize") {
      win.minimize();
    } else if (action === "maximize") {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    } else if (action === "close") {
      win.close();
    }
  });
  win.on("maximize", () => win == null ? void 0 : win.webContents.send("window-is-maximized", true));
  win.on("unmaximize", () => win == null ? void 0 : win.webContents.send("window-is-maximized", false));
  win.once("ready-to-show", () => {
    win == null ? void 0 : win.show();
    win == null ? void 0 : win.webContents.openDevTools();
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
