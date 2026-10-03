import { ipcMain, shell, type BrowserWindow } from "electron";

function openSafe(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    void shell.openExternal(u.toString());
    return true;
  } catch {
    return false;
  }
}

export function registerExternalIpc() {
  ipcMain.handle("app:openExternal", (_, url: string) => openSafe(url));
}

export function attachExternalLinkGuards(win: BrowserWindow) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    openSafe(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (e, url) => {
    const current = win.webContents.getURL();
    try {
      if (new URL(url).origin !== new URL(current).origin) {
        e.preventDefault();
        openSafe(url);
      }
    } catch {
      e.preventDefault();
    }
  });
}