process.env.DEBUG = "prismarine-auth";
import { app, BrowserWindow, ipcMain, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  registerAppFileProtocol,
  registerAuthHandlers,
  registerAccountCredentialsHandler,
  setAuthMainWindow,
} from "./auth";
import { registerSkinsHandlers } from "./skins";
import { registerCapesHandlers } from "./capes";
import { registerVersionsHandlers } from "./versions";
import { registerInstanceHandlers } from "./instances";
import { registerFolderHandlers } from "./folderActions";
import { registerDownloadActions } from "./downloadActions";
import { registerLaunchHandlers } from "./launchService";
import { registerModrinthHandlers } from "./modrinthActions";
import { registerWorldHandlers } from "./worlds";
import { registerExternalIpc, attachExternalLinkGuards } from "./externalLinks";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const require = createRequire(import.meta.url);
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
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.cjs"),
      sandbox: false,
    },
  });

  setAuthMainWindow(win);
  attachExternalLinkGuards(win);

  registerDownloadActions(win);
  const launcher = registerLaunchHandlers(win);
  registerInstanceHandlers((id) => launcher.isRunning(id));

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

    if (!VITE_DEV_SERVER_URL) {
      // win?.webContents.openDevTools();
    }

    autoUpdater.checkForUpdatesAndNotify();
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    console.log("APP_ROOT:", process.env.APP_ROOT);
    console.log("MAIN_DIST:", MAIN_DIST);
    console.log("RENDERER_DIST:", RENDERER_DIST);

    const indexPath = path.join(RENDERER_DIST, "index.html");

    console.log("INDEX PATH:", indexPath);
    console.log("INDEX EXISTS:", fs.existsSync(indexPath));

    win.loadFile(indexPath).catch((error) => {
      console.error("LOAD FILE ERROR:", error);
    });
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// win.webContents.on(
//   "did-fail-load",
//   (_, errorCode, errorDescription, validatedURL) => {
//     console.error("Failed to load renderer:", {
//       errorCode,
//       errorDescription,
//       validatedURL,
//     });
//   },
// );

// win.webContents.on("render-process-gone", (_, details) => {
//   console.error("Renderer process gone:", details);
// });

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
  registerAuthHandlers();
  registerAccountCredentialsHandler();
  registerSkinsHandlers();
  registerCapesHandlers();
  registerVersionsHandlers();
  registerFolderHandlers();
  registerModrinthHandlers();
  registerWorldHandlers();
  registerExternalIpc();

  createWindow();
});
