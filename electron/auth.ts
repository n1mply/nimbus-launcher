import { Authflow, Titles } from "prismarine-auth";
import { BrowserWindow, ipcMain, app, shell, protocol } from "electron";
import path from "node:path";
import { promises as fs } from "node:fs";
import { Cape } from "../src/types";


declare module "prismarine-auth" {
  interface MicrosoftAuthFlowOptions {
    doSisuAuth?: boolean;
  }
}

let mainWindowRef: BrowserWindow | null = null;

export function setAuthMainWindow(win: BrowserWindow): void {
  mainWindowRef = win;
}

function getSkinsDir(): string {
  return path.join(app.getPath("userData"), "skins");
}

function getAuthCacheDir(): string {
  return path.join(app.getPath("userData"), "auth-cache");
}

// Единая точка создания Authflow — используется и для полноценного логина,
// и там, где нужен просто актуальный токен (например, при аплоаде скина).
// Параметры (username + cacheDir) те же самые, поэтому prismarine-auth
// подхватывает уже существующую сессию с диска и тихо обновляет токен,
// не требуя повторного входа, пока жив refresh-токен.
function createAuthflow(
  onDeviceCode?: (deviceCode: {
    user_code: string;
    verification_uri: string;
  }) => void,
): Authflow {
  return new Authflow(
    "nimbus-launcher-user",
    getAuthCacheDir(),
    {
      flow: "live",
      authTitle: Titles.MinecraftNintendoSwitch,
      deviceType: "Nintendo",
    },
    onDeviceCode,
  );
}

// Коллбэк, который показывает модалку с device-code — переиспользуется
// везде, где может понадобиться тихая переавторизация без полноценного логина.
function notifyDeviceCode(deviceCode: {
  user_code: string;
  verification_uri: string;
}): void {
  mainWindowRef?.webContents.send("auth:device-code", {
    code: deviceCode.user_code,
    url: deviceCode.verification_uri,
  });
}

// Единственный переиспользуемый Authflow-инстанс на весь main-процесс.
// Раньше каждый вызов (открытие модалки плащей, apply скина, логин)
// создавал НОВЫЙ Authflow — а это заново гоняет цепочку MSA → XSTS →
// Xbox Live → Minecraft Services, у которой свой rate limit на стороне
// Microsoft. Переиспользование одного инстанса резко сокращает число
// таких обращений — internal token-менеджеры Authflow сами кешируют
// валидные токены и не лезут в сеть, пока они не протухли.
let sharedFlow: Authflow | null = null;

function getSharedAuthflow(): Authflow {
  if (!sharedFlow) {
    sharedFlow = createAuthflow(notifyDeviceCode);
  }
  return sharedFlow;
}

function capesFromProfile(profile: any): Cape[] {
  return (profile.capes ?? []).map((c: any) => ({
    id: c.id,
    name: c.alias ?? c.id,
    url: c.url,
    isActive: c.state === "ACTIVE",
  }));
}

// In-memory снимок плащей из последнего успешного профиля + время получения.
// Прогревается прямо из логина/restoreSession (там и так уже есть полный
// профиль — грех не переиспользовать), а дальше троттлится: пока данные
// не старше MIN_REFRESH_INTERVAL_MS, повторный запрос вообще не идёт в сеть.
type CapesSnapshot = { capes: Cape[]; fetchedAt: number };

let capesSnapshot: CapesSnapshot | null = null;
let capesFetchInFlight: Promise<CapesSnapshot> | null = null;

const MIN_CAPES_REFRESH_INTERVAL_MS = 30_000;

async function fetchFreshCapesSnapshot(): Promise<CapesSnapshot> {
  const flow = getSharedAuthflow();
  const result = await flow.getMinecraftJavaToken({ fetchProfile: true });

  if (!result.profile) {
    throw new Error("Не удалось получить профиль аккаунта для списка плащей");
  }

  return { capes: capesFromProfile(result.profile), fetchedAt: Date.now() };
}

// Возвращает актуальный Minecraft access-токен для похода в minecraftservices.com API
// (например, для загрузки скина). Переиспользует общий Authflow — токен
// в нём уже закеширован в памяти, если недавно логинились/делали другие запросы.
export async function getMinecraftAccessToken(): Promise<string> {
  const flow = getSharedAuthflow();
  const result = await flow.getMinecraftJavaToken({ fetchProfile: false });
  return result.token;
}

// Список плащей, которыми владеет аккаунт (выдаются Mojang за ачивменты/события,
// пользователь не может их создавать сам — только выбирать из уже имеющихся
// или снимать текущий).
//
// forceRefresh=false (по умолчанию): если в памяти уже есть снимок младше
// MIN_CAPES_REFRESH_INTERVAL_MS — отдаём его без единого сетевого запроса.
// forceRefresh=true: используется после apply, где нужны гарантированно
// актуальные данные, даже если недавно уже обновлялись.
export async function getMinecraftProfileCapes(
  forceRefresh = false,
): Promise<Cape[]> {
  const isFresh =
    capesSnapshot &&
    Date.now() - capesSnapshot.fetchedAt < MIN_CAPES_REFRESH_INTERVAL_MS;

  if (!forceRefresh && isFresh) {
    return capesSnapshot!.capes;
  }

  // Если несколько вызовов пришли одновременно (например, несколько
  // компонентов дёрнули запрос почти в один момент) — не плодим
  // параллельные сетевые запросы, а переиспользуем один "в полёте".
  if (!capesFetchInFlight) {
    capesFetchInFlight = fetchFreshCapesSnapshot().finally(() => {
      capesFetchInFlight = null;
    });
  }

  try {
    capesSnapshot = await capesFetchInFlight;
  } catch (err) {
    // Обновление не удалось (сеть/рейт-лимит), но старый снимок ещё жив —
    // лучше отдать чуть устаревшие данные, чем остаться совсем без списка.
    if (capesSnapshot) return capesSnapshot.capes;
    throw err;
  }

  return capesSnapshot.capes;
}

async function downloadAndSaveSkin(
  uuid: string,
  skinUrl: string,
): Promise<string> {
  await fs.mkdir(getSkinsDir(), { recursive: true });
  const res = await fetch(skinUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(getSkinsDir(), `${uuid}.png`);
  await fs.writeFile(filePath, buffer);
  return `${uuid}.png`;
}

// showDeviceCodeUI=false используется при тихом восстановлении сессии при старте
// приложения — если токен протух и нужен новый вход, мы не показываем модалку
// сами по себе, а просто сообщаем "нужен логин" и даём пользователю нажать кнопку сам.
function loginWithPrismarine(showDeviceCodeUI: boolean) {
  return new Promise<any>((resolve, reject) => {
    let codeWasShown = false;

    const flow = createAuthflow((deviceCode) => {
      codeWasShown = true;
      if (!showDeviceCodeUI) {
        reject(new Error("AUTH_REQUIRED"));
        return;
      }
      notifyDeviceCode(deviceCode);
    });

    flow
      .getMinecraftJavaToken({ fetchProfile: true })
      .then((result) => {
        // Переиспользуем этот же инстанс дальше — он уже прошёл полную
        // цепочку авторизации, не нужно создавать новый для скинов/плащей.
        sharedFlow = flow;
        resolve(result);
      })
      .catch((err) => {
        if (!codeWasShown) reject(err);
      });
  });
}

async function processLoginResult(result: any) {
  const profile = result.profile;
  const activeSkin =
    profile.skins?.find((s: any) => s.state === "ACTIVE") ?? profile.skins?.[0];

  let localSkinPath: string | null = null;
  if (activeSkin?.url) {
    localSkinPath = await downloadAndSaveSkin(profile.id, activeSkin.url);
  }

  const activeCape = profile.capes?.find((c: any) => c.state === "ACTIVE");

  const activeCapeUrl: string | null = activeCape?.url ?? null;

  // Профиль уже получен целиком (в том числе капы) — прогреваем кеш,
  // чтобы первое открытие модалки плащей не делало отдельный запрос.
  capesSnapshot = { capes: capesFromProfile(profile), fetchedAt: Date.now() };
  profileSnapshot = { uuid: profile.id, username: profile.name };

  return {
    profile: { uuid: profile.id, username: profile.name },
    localSkinPath,
    activeCapeUrl,
  };
}

export function registerAuthHandlers(): void {
  ipcMain.handle("auth:login", async () => {
    const result = await loginWithPrismarine(true);
    return processLoginResult(result);
  });

  ipcMain.handle("auth:restore-session", async () => {
    try {
      const result = await loginWithPrismarine(false);
      return processLoginResult(result);
    } catch {
      return null; // токена нет/протух — пусть пользователь войдёт вручную
    }
  });

  ipcMain.handle("auth:logout", async () => {
    await fs.rm(getAuthCacheDir(), { recursive: true, force: true });
    profileSnapshot = null;
    capesSnapshot = null;
    sharedFlow = null;
  });

  ipcMain.handle("shell:open-external", (_event, url: string) => {
    shell.openExternal(url);
  });
}

export function registerAppFileProtocol(): void {
  protocol.handle("app-file", async (request) => {
    const url = new URL(request.url);
    const fileName = decodeURIComponent(url.pathname).replace(/^\//, "");
    const filePath = path.join(getSkinsDir(), fileName);

    try {
      const data = await fs.readFile(filePath);
      return new Response(data, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return new Response(null, { status: 404 });
    }
  });
}

export interface AccountCredentials {
  uuid: string;
  username: string;
  accessToken: string;
  userType: "msa" | "mojang";
  xuid?: string | null;
}

export function formatUuidWithDashes(uuid: string): string {
  const clean = uuid.replace(/-/g, "").trim();
  if (clean.length !== 32) return uuid;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

type ProfileSnapshot = { uuid: string; username: string };
let profileSnapshot: ProfileSnapshot | null = null;

export async function getAccountCredentials(): Promise<AccountCredentials> {
  const flow = getSharedAuthflow();

  // Профиля в памяти нет (например, лаунчер только что перезапустили,
  // а restore-session ещё не отработал) — тянем его из сети один раз.
  if (!profileSnapshot) {
    const full = await flow.getMinecraftJavaToken({ fetchProfile: true });
    if (!full.profile?.id || !full.profile?.name) {
      throw new Error("Can not get the Minecraft account data. Login again.");
    }
    profileSnapshot = { uuid: full.profile.id, username: full.profile.name };
    return {
      uuid: formatUuidWithDashes(profileSnapshot.uuid),
      username: profileSnapshot.username,
      accessToken: full.token,
      userType: "msa",
    };
  }

  const tokenResult = await flow.getMinecraftJavaToken({ fetchProfile: false });
  return {
    uuid: formatUuidWithDashes(profileSnapshot.uuid),
    username: profileSnapshot.username,
    accessToken: tokenResult.token,
    userType: "msa",
  };
}

export async function getAccountXuid(): Promise<string | null> {
  try {
    const flow = getSharedAuthflow();
    const xboxToken = await flow.getXboxToken();
    return xboxToken.userXUID ?? null;
  } catch {
    return null; // не критично для запуска — просто не добавляем аргумент
  }
}

export function registerAccountCredentialsHandler(): void {
  ipcMain.handle("auth:get-credentials", async () => {
    return await getAccountCredentials();
  });
}
