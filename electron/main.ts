process.env.DEBUG = "prismarine-auth";
import { app, BrowserWindow, ipcMain, protocol } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  registerAppFileProtocol,
  registerAuthHandlers,
  setAuthMainWindow,
} from "./auth";
import { registerSkinsHandlers } from "./skins";
import { registerCapesHandlers } from "./capes";
import path from "node:path";
import { registerVersionsHandlers } from "./versions";
import { createInstance, getInstances } from "./instances";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;

function createWindow(): void {
  win = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 1040,
    minHeight: 620,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC, "Logo.png"),
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.cjs"),
      sandbox: false,
    },
  });
  setAuthMainWindow(win);
  registerAuthHandlers();

  ipcMain.on(
    "window-control",
    (_, action: "minimize" | "maximize" | "close") => {
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
    },
  );

  win.on("maximize", () => win?.webContents.send("window-is-maximized", true));
  win.on("unmaximize", () =>
    win?.webContents.send("window-is-maximized", false),
  );

  win.once("ready-to-show", () => {
    win?.show();
    // Консоль(закомитить, если консоль не нужна)
    win?.webContents.openDevTools();
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
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

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app-file",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

app.whenReady().then(() => {
  registerAppFileProtocol();
  registerSkinsHandlers();
  registerCapesHandlers();
  registerVersionsHandlers();
  ipcMain.handle("instances:create", async (_, payload) => {
    return await createInstance(payload);
  });
  ipcMain.handle("instances:getAll", async () => {
    return await getInstances();
  });
  createWindow();
});
