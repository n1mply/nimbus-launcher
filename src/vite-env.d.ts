/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    on: (...args: any[]) => void
    off: (...args: any[]) => void
    send: (...args: any[]) => void
    invoke: (...args: any[]) => Promise<any>
  }
  auth: {
    login: () => Promise<{ profile: { uuid: string; username: string }; skinDataUrl: string | null; activeCapeUrl: string | null } | null>
    restoreSession: () => Promise<{ profile: { uuid: string; username: string }; skinDataUrl: string | null; activeCapeUrl: string | null } | null>
    logout: () => Promise<void>
  }
}