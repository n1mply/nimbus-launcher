import { protocol, ipcMain, shell, app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import require$$0$1 from "fs";
import require$$6 from "path";
import crypto$6 from "crypto";
import require$$1 from "tty";
import require$$5 from "util";
import require$$0 from "os";
import require$$0$2 from "buffer";
import require$$0$3 from "child_process";
import require$$0$4 from "http";
import require$$1$1 from "https";
import require$$3 from "stream";
import path$1 from "node:path";
import { promises } from "node:fs";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var src = { exports: {} };
var browser = { exports: {} };
var ms$1;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms$1;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  ms$1 = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse2(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
  }
  return ms$1;
}
var common;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce2;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args) {
        if (!debug2.enabled) {
          return;
        }
        const self2 = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce2(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common = setup;
  return common;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error2) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error2) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error2) {
      }
    }
    module.exports = requireCommon()(exports);
    const { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error2) {
        return "[UnexpectedJSONParseError]: " + error2.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag) return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os = require$$0;
  const tty = require$$1;
  const hasFlag2 = requireHasFlag();
  const { env } = process;
  let forceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
    forceColor = 0;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
      return 3;
    }
    if (hasFlag2("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign3) => sign3 in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version2 = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version2 >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min;
  }
  function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports) {
    const tty = require$$1;
    const util2 = require$$5;
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util2.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error2) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util2.formatWithOptions(exports.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys2 = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys2.length; i++) {
        debug2.inspectOpts[keys2[i]] = exports.inspectOpts[keys2[i]];
      }
    }
    module.exports = requireCommon()(exports);
    const { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}
var srcExports = src.exports;
var Titles$1 = {
  MinecraftNintendoSwitch: "00000000441cc96b"
};
const debug$a = srcExports("prismarine-auth");
const crypto$5 = crypto$6;
async function checkStatus$4(res) {
  if (res.ok) {
    return res.json();
  } else {
    const resp = await res.text();
    debug$a("Request fail", resp);
    throw Error(`${res.status} ${res.statusText} ${resp}`);
  }
}
function checkStatusWithHelp$1(errorDict) {
  return async function(res) {
    if (res.ok) return res.json();
    const resp = await res.text();
    debug$a("Request fail", resp);
    throw new Error(`${res.status} ${res.statusText} ${resp} ${errorDict[res.status] ?? ""}`);
  };
}
function createHash$2(input) {
  return crypto$5.createHash("sha1").update(input ?? "", "binary").digest("hex").substr(0, 6);
}
var Util = { checkStatus: checkStatus$4, checkStatusWithHelp: checkStatusWithHelp$1, createHash: createHash$2 };
var Constants = {
  Endpoints: {
    minecraftJava: {
      XSTSRelyingParty: "rp://api.minecraftservices.com/",
      loginWithXbox: "https://api.minecraftservices.com/authentication/login_with_xbox",
      profile: "https://api.minecraftservices.com/minecraft/profile",
      license: "https://api.minecraftservices.com/entitlements/license",
      entitlements: "https://api.minecraftservices.com/entitlements/mcstore",
      attributes: "https://api.minecraftservices.com/player/attributes",
      certificates: "https://api.minecraftservices.com/player/certificates",
      reportPlayer: "https://api.minecraftservices.com/player/report"
    },
    minecraftBedrock: {
      XSTSRelyingParty: "https://multiplayer.minecraft.net/",
      authenticate: "https://multiplayer.minecraft.net/authentication",
      servicesSessionStart: "https://authorization.franchise.minecraft-services.net/api/v1.0/session/start",
      multiplayerSessionStart: "https://authorization.franchise.minecraft-services.net/api/v1.0/multiplayer/session/start"
    },
    xbox: {
      authRelyingParty: "http://auth.xboxlive.com",
      relyingParty: "http://xboxlive.com",
      deviceAuth: "https://device.auth.xboxlive.com/device/authenticate",
      titleAuth: "https://title.auth.xboxlive.com/title/authenticate",
      userAuth: "https://user.auth.xboxlive.com/user/authenticate",
      sisuAuthorize: "https://sisu.xboxlive.com/authorize",
      xstsAuthorize: "https://xsts.auth.xboxlive.com/xsts/authorize"
    },
    live: {
      deviceCodeRequest: "https://login.live.com/oauth20_connect.srf",
      tokenRequest: "https://login.live.com/oauth20_token.srf"
    },
    PlayfabRelyingParty: "https://b980a380.minecraft.playfabapi.com/",
    PlayfabLoginWithXbox: "https://20ca2.playfabapi.com/Client/LoginWithXbox"
  },
  msalConfig: {
    // Initialize msal
    // Docs: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md#usage
    auth: {
      // the minecraft client:
      // clientId: "000000004C12AE6F",
      clientId: "389b1b32-b5d5-43b2-bddc-84ce938d6737",
      // token from https://github.com/microsoft/Office365APIEditor
      authority: "https://login.microsoftonline.com/consumers"
    }
  },
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "MinecraftLauncher/2.2.10675"
    }
  },
  xboxLiveErrors: {
    2148916227: "Your account was banned by Xbox for violating one or more Community Standards for Xbox and is unable to be used.",
    2148916229: "Your account is currently restricted and your guardian has not given you permission to play online. Login to https://account.microsoft.com/family/ and have your guardian change your permissions.",
    2148916233: "Your account currently does not have an Xbox profile. Please create one at https://signup.live.com/signup",
    2148916234: "Your account has not accepted Xbox's Terms of Service. Please login and accept them.",
    2148916235: "Your account resides in a region that Xbox has not authorized use from. Xbox has blocked your attempt at logging in.",
    2148916236: "Your account requires proof of age. Please login to https://login.live.com/login.srf and provide proof of age.",
    2148916237: "Your account has reached the its limit for playtime. Your account has been blocked from logging in.",
    2148916238: "The account date of birth is under 18 years and cannot proceed unless the account is added to a family by an adult."
  }
};
const fs$1 = require$$0$1;
let FileCache$1 = class FileCache {
  constructor(cacheLocation) {
    this.cacheLocation = cacheLocation;
  }
  async reset() {
    const cached = {};
    fs$1.writeFileSync(this.cacheLocation, JSON.stringify(cached));
    return cached;
  }
  async loadInitialValue() {
    try {
      return JSON.parse(fs$1.readFileSync(this.cacheLocation, "utf8"));
    } catch (e) {
      return this.reset();
    }
  }
  async getCached() {
    if (this.cache === void 0) {
      this.cache = await this.loadInitialValue();
    }
    return this.cache;
  }
  async setCached(cached) {
    this.cache = cached;
    fs$1.writeFileSync(this.cacheLocation, JSON.stringify(this.cache));
  }
  async setCachedPartial(cached) {
    await this.setCached({
      ...this.cache,
      ...cached
    });
  }
};
var FileCache_1 = FileCache$1;
const debug$9 = srcExports("prismarine-auth");
const { Endpoints: Endpoints$6 } = Constants;
const { checkStatus: checkStatus$3 } = Util;
let LiveTokenManager$1 = class LiveTokenManager {
  constructor(clientId, scopes, cache) {
    this.clientId = clientId;
    this.scopes = scopes;
    this.cache = cache;
  }
  async verifyTokens() {
    if (this.forceRefresh) try {
      await this.refreshTokens();
    } catch {
    }
    const at = await this.getAccessToken();
    const rt = await this.getRefreshToken();
    if (!at || !rt) {
      return false;
    }
    debug$9("[live] have at, rt", at, rt);
    if (at.valid && rt) {
      return true;
    } else {
      try {
        await this.refreshTokens();
        return true;
      } catch (e) {
        console.warn("Error refreshing token", e);
        return false;
      }
    }
  }
  async refreshTokens() {
    const rtoken = await this.getRefreshToken();
    if (!rtoken) {
      throw new Error("Cannot refresh without refresh token");
    }
    const codeRequest = {
      method: "post",
      body: new URLSearchParams({ scope: this.scopes, client_id: this.clientId, grant_type: "refresh_token", refresh_token: rtoken.token }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      credentials: "include"
      // This cookie handler does not work on node-fetch ...
    };
    const token = await fetch(Endpoints$6.live.tokenRequest, codeRequest).then(checkStatus$3);
    this.updateCache(token);
    return token;
  }
  async getAccessToken() {
    const { token } = await this.cache.getCached();
    if (!token) return;
    const until = new Date(token.obtainedOn + token.expires_in) - Date.now();
    const valid2 = until > 1e3;
    return { valid: valid2, until, token: token.access_token };
  }
  async getRefreshToken() {
    const { token } = await this.cache.getCached();
    if (!token) return;
    const until = new Date(token.obtainedOn + token.expires_in) - Date.now();
    const valid2 = until > 1e3;
    return { valid: valid2, until, token: token.refresh_token };
  }
  async updateCache(data) {
    await this.cache.setCachedPartial({
      token: {
        ...data,
        obtainedOn: Date.now()
      }
    });
  }
  async authDeviceCode(deviceCodeCallback) {
    const acquireTime = Date.now();
    const codeRequest = {
      method: "post",
      body: new URLSearchParams({ scope: this.scopes, client_id: this.clientId, response_type: "device_code" }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      credentials: "include"
      // This cookie handler does not work on node-fetch ...
    };
    debug$9("Requesting live device token", codeRequest);
    const cookies = [];
    const res = await fetch(Endpoints$6.live.deviceCodeRequest, codeRequest).then((res2) => {
      if (res2.status !== 200) {
        res2.text().then(console.warn);
        throw Error("Failed to request live.com device code");
      }
      if (res2.headers.get("set-cookie")) {
        const cookie = res2.headers.get("set-cookie");
        const [keyval] = cookie.split(";");
        cookies.push(keyval);
      }
      return res2;
    }).then(checkStatus$3).then((resp) => {
      resp.message = `To sign in, use a web browser to open the page ${resp.verification_uri} and use the code ${resp.user_code} or visit http://microsoft.com/link?otc=${resp.user_code}`;
      deviceCodeCallback(resp);
      return resp;
    });
    const expireTime = acquireTime + res.expires_in * 1e3 - 100;
    this.polling = true;
    while (this.polling && expireTime > Date.now()) {
      await new Promise((resolve) => setTimeout(resolve, res.interval * 1e3));
      try {
        const verifi = {
          method: "post",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookies.join("; ")
          },
          body: new URLSearchParams({
            client_id: this.clientId,
            device_code: res.device_code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code"
          }).toString()
        };
        const token = await fetch(Endpoints$6.live.tokenRequest + "?client_id=" + this.clientId, verifi).then((res2) => res2.json()).then((res2) => {
          if (res2.error) {
            if (res2.error === "authorization_pending") {
              debug$9("[live] Still waiting:", res2.error_description);
            } else {
              throw Error(`Failed to acquire authorization code from device token (${res2.error}) - ${res2.error_description}`);
            }
          } else {
            return res2;
          }
        });
        if (!token) continue;
        this.updateCache(token);
        this.polling = false;
        return { accessToken: token.access_token };
      } catch (e) {
        console.debug(e);
      }
    }
    this.polling = false;
    throw Error("Authentication failed, timed out");
  }
};
var LiveTokenManager_1 = LiveTokenManager$1;
const debug$8 = srcExports("prismarine-auth");
const crypto$4 = crypto$6;
const { Endpoints: Endpoints$5, fetchOptions } = Constants;
const { checkStatus: checkStatus$2 } = Util;
const reportLimits = {
  maxOpinionCommentsLength: 1e3,
  maxReportedMessageCount: 4,
  maxEvidenceMessageCount: 40
};
const reportReasons = {
  FALSE_REPORTING: 2,
  HATE_SPEECH: 5,
  TERRORISM_OR_VIOLENT_EXTREMISM: 16,
  CHILD_SEXUAL_EXPLOITATION_OR_ABUSE: 17,
  IMMINENT_HARM: 18,
  NON_CONSENSUAL_INTIMATE_IMAGERY: 19,
  HARASSMENT_OR_BULLYING: 21,
  DEFAMATION_IMPERSONATION_FALSE_INFORMATION: 27,
  SELF_HARM_OR_SUICIDE: 31,
  ALCOHOL_TOBACCO_DRUGS: 39
};
const toDER = (pem) => pem.split("\n").slice(1, -1).reduce((acc, cur) => Buffer.concat([acc, Buffer.from(cur, "base64")]), Buffer.alloc(0));
class MinecraftJavaTokenManager {
  constructor(cache) {
    this.cache = cache;
  }
  async getCachedAccessToken() {
    const { mca: token } = await this.cache.getCached();
    debug$8("[mc] token cache", token);
    if (!token) return;
    const expires = token.obtainedOn + token.expires_in * 1e3;
    const remaining = expires - Date.now();
    const valid2 = remaining > 1e3;
    return { valid: valid2, until: expires, token: token.access_token, data: token };
  }
  async setCachedAccessToken(data) {
    await this.cache.setCachedPartial({
      mca: {
        ...data,
        obtainedOn: Date.now()
      }
    });
  }
  async verifyTokens() {
    const at = await this.getCachedAccessToken();
    if (!at || this.forceRefresh) {
      return false;
    }
    debug$8("[mc] have user access token", at);
    if (at.valid) {
      return true;
    }
    return false;
  }
  async getAccessToken(xsts) {
    debug$8("[mc] authing to minecraft", xsts);
    const MineServicesResponse = await fetch(Endpoints$5.minecraftJava.loginWithXbox, {
      method: "post",
      ...fetchOptions,
      body: JSON.stringify({ identityToken: `XBL3.0 x=${xsts.userHash};${xsts.XSTSToken}` })
    }).then(checkStatus$2);
    debug$8("[mc] mc auth response", MineServicesResponse);
    await this.setCachedAccessToken(MineServicesResponse);
    return MineServicesResponse.access_token;
  }
  async fetchProfile(accessToken) {
    debug$8(`[mc] fetching minecraft profile with ${accessToken.slice(0, 16)}`);
    const headers = { ...fetchOptions.headers, Authorization: `Bearer ${accessToken}` };
    const profile = await fetch(Endpoints$5.minecraftJava.profile, { headers }).then(checkStatus$2);
    debug$8(`[mc] got profile response: ${profile}`);
    return profile;
  }
  /**
  * Fetches any product licenses attached to this accesstoken
  * @param {string} accessToken
  * @returns {object}
  */
  async fetchEntitlements(accessToken) {
    debug$8(`[mc] fetching entitlements with ${accessToken.slice(0, 16)}`);
    const headers = { ...fetchOptions.headers, Authorization: `Bearer ${accessToken}` };
    const entitlements = await fetch(Endpoints$5.minecraftJava.entitlements + `?requestId=${crypto$4.randomUUID()}`, { headers }).then(checkStatus$2);
    debug$8(`[mc] got entitlement response: ${entitlements}`);
    return entitlements;
  }
  async fetchCertificates(accessToken) {
    debug$8(`[mc] fetching key-pair with ${accessToken.slice(0, 16)}`);
    const headers = { ...fetchOptions.headers, Authorization: `Bearer ${accessToken}` };
    const cert = await fetch(Endpoints$5.minecraftJava.certificates, { method: "post", headers }).then(checkStatus$2);
    debug$8("[mc] got key-pair");
    const profileKeys = {
      publicPEM: cert.keyPair.publicKey,
      privatePEM: cert.keyPair.privateKey,
      publicDER: toDER(cert.keyPair.publicKey),
      privateDER: toDER(cert.keyPair.privateKey),
      signature: Buffer.from(cert.publicKeySignature, "base64"),
      signatureV2: Buffer.from(cert.publicKeySignatureV2, "base64"),
      expiresOn: new Date(cert.expiresAt),
      refreshAfter: new Date(cert.refreshedAfter)
    };
    profileKeys.public = crypto$4.createPublicKey({ key: profileKeys.publicDER, format: "der", type: "spki" });
    profileKeys.private = crypto$4.createPrivateKey({ key: profileKeys.privateDER, format: "der", type: "pkcs8" });
    return { profileKeys };
  }
  async reportPlayerChat(report) {
    const accessToken = await this.getCachedAccessToken();
    const headers = { ...fetchOptions.headers, Authorization: `Bearer ${accessToken}` };
    const createdTime = report.time || Date.now();
    const id = report.id || Date.now();
    const reportedMessagesCount = report.message.reduce((acc, cur) => {
      acc += cur.reported ? 1 : 0;
      return acc;
    }, 0);
    if (report.comments > reportLimits.maxOpinionCommentsLength) throw Error(`Report comment is too long, max allowed length is ${reportLimits.maxOpinionCommentsLength}`);
    if (!report.messages.length) throw Error("No messages were provided as evidence for report");
    if (report.messages.length > reportLimits.report.maxEvidenceMessageCount) throw Error(`Too many messages provided as evidence, max allowed is ${reportLimits.maxEvidenceMessageCount}`);
    if (reportedMessagesCount > reportLimits.maxReportedMessageCount) throw Error(`Too many reported messages, max allowed is ${reportLimits.maxReportedMessageCount}`);
    if (!report.reason) throw Error("Report reason was not specified");
    if (!(report.reason in reportReasons)) throw Error(`Invalid report reason: ${report.reason}`);
    const body = {
      id,
      report: {
        reason: report.reason,
        opinionComments: report.comments,
        evidence: report.messages.map((e) => {
          return {
            header: {
              signatureOfPreviousHeader: e.previousHeaderSignature,
              profileId: e.uuid,
              hashOfBody: e.hash,
              signature: e.signature
            },
            body: e.timestamp ? {
              timestamp: e.timestamp,
              salt: e.salt,
              lastSeenSignatures: e.lastSeen.map((m) => ({
                profileId: m.uuid,
                lastSignature: m.signature
              })),
              message: e.message
            } : null,
            overridenMessage: e.originalMessage,
            // if it was modified by the server, ChatTrustLevel.java
            messageReported: e.reported
          };
        }),
        reportedEntity: {
          profileId: report.reportedPlayer
        },
        createdTime
      },
      clientInfo: {
        clientVersion: report.clientVersion
      },
      thirdPartyServerInfo: {
        address: report.serverAddress
      },
      realmInfo: report.realmInfo
    };
    debug$8("[mc] reporting player with payload", body);
    const reportResponse = await fetch(Endpoints$5.minecraftJava.reportPlayer, { method: "post", headers, body }).then(checkStatus$2);
    debug$8("[mc] server response for report", reportResponse);
    return true;
  }
}
var MinecraftJavaTokenManager_1 = MinecraftJavaTokenManager;
var dist = {};
var Clients = {};
var Fetch = {};
var XRFetchClientException$1 = {};
var XRException = {};
var utils$1 = {};
Object.defineProperty(utils$1, "__esModule", { value: true });
utils$1.isObject = void 0;
const isObject$4 = (item) => !!item && typeof item === "object" && Array.isArray(item) === false && Object.getPrototypeOf(item) === Object.prototype;
utils$1.isObject = isObject$4;
Object.defineProperty(XRException, "__esModule", { value: true });
const utils_1$1 = utils$1;
class XRBaseException extends Error {
  /**
   * Creates a new XRBaseException.
   * @param stringOrError - Error message or an Error object to wrap.
   * @param data - Optional additional error data.
   */
  constructor(stringOrError, data = {}) {
    super(typeof stringOrError === "string" ? stringOrError : stringOrError.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
    this.data = { ...data };
    if (stringOrError instanceof Error) {
      const attributes = this.data.attributes || {};
      this.data.attributes = {
        ...attributes,
        _originalError: stringOrError,
        // Preserve original stack if available
        ...stringOrError.stack ? { _originalStack: stringOrError.stack } : {}
      };
      const originalErrorProps = Object.getOwnPropertyNames(stringOrError).filter((prop) => !["name", "message", "stack"].includes(prop));
      for (const prop of originalErrorProps) {
        const value = stringOrError[prop];
        this.data.attributes[`_original_${prop}`] = value;
      }
    }
  }
  /**
   * Gets the error attributes.
   * @returns Current error attributes.
   */
  getAttributes() {
    return this.data.attributes || {};
  }
  /**
   * Extends the current attributes with new ones.
   * @param attributes - Partial attributes to add.
   * @returns This instance for chaining.
   */
  extendAttributes(attributes) {
    this.data.attributes = {
      ...this.data.attributes || {},
      ...attributes
    };
    return this;
  }
  /**
   * Creates a JSON representation of the error.
   * @returns Object with message and data properties.
   */
  toJSON() {
    return { name: this.name, message: this.message, data: this.data };
  }
  /**
   * Creates a copy of the exception with a new message.
   * @param message - New error message.
   */
  withMessage(message) {
    return new XRBaseException(message, this.data);
  }
  /**
   * Factory method to create an exception from any error.
   * @param err - Error to convert to an XRBaseException.
   * @param defaultMessage - Optional message to use if the error doesn't have one.
   * @example
   * const ex = XRBaseException.from(new Error('fail'));
   */
  static from(err, defaultMessage = "An unknown error occurred") {
    if (err instanceof XRBaseException) {
      return err;
    } else if (err instanceof Error) {
      return new XRBaseException(err);
    }
    if ((0, utils_1$1.isObject)(err) === true) {
      const errorObj = err;
      const message = typeof errorObj.message === "string" ? errorObj.message : defaultMessage;
      return new XRBaseException(message, {
        attributes: { _originalError: err }
      });
    }
    return new XRBaseException(defaultMessage, {
      attributes: { _originalError: err }
    });
  }
}
XRException.default = XRBaseException;
var __importDefault$4 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(XRFetchClientException$1, "__esModule", { value: true });
const XRException_1$1 = __importDefault$4(XRException);
class XRFetchClientException extends XRException_1$1.default {
  /**
   * Creates a new fetch exception.
   * @param stringOrError - Error message or an Error object to wrap
   * @param data - Additional error data
   */
  constructor(stringOrError, data = {}) {
    super(stringOrError, data);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
  /**
   * Creates an exception from a fetch response
   * @param response - Fetch Response object
   */
  static async fromResponse(response) {
    const responseBody = await response.clone().json().catch(() => response.clone().text().catch(() => null));
    return new XRFetchClientException(response.statusText, {
      attributes: {
        code: "REQUEST_ERROR",
        extra: {
          url: response.url,
          statusCode: response.status,
          response: {
            body: responseBody,
            headers: Object.fromEntries(response.headers.entries())
          }
        }
      }
    });
  }
  /**
   * Creates an exception from a network error
   * @param error - Original error that occurred
   * @param url - Request URL if known
   */
  static fromNetworkError(error2, url) {
    return new XRFetchClientException(error2, {
      attributes: { code: "NETWORK_ERROR", extra: { url } }
    });
  }
}
XRFetchClientException$1.default = XRFetchClientException;
(function(exports) {
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DEFAULT_OPTIONS = exports.DEFAULT_TIMEOUT = exports.MAX_TIMEOUT = exports.MIN_TIMEOUT = void 0;
  const XRFetchClientException_1 = __importDefault2(XRFetchClientException$1);
  const utils_12 = utils$1;
  exports.MIN_TIMEOUT = 1e3;
  exports.MAX_TIMEOUT = 3e4;
  exports.DEFAULT_TIMEOUT = 1e4;
  exports.DEFAULT_OPTIONS = {
    parseJson: true,
    throwOnError: true,
    timeout: exports.DEFAULT_TIMEOUT
  };
  class XRFetch {
    /**
     * Makes a GET request to an endpoint
     * @template T - The expected response data type
     * @param {string} url - The URL to make the request to
     * @param {Omit<FetchRequestConfig, 'method' | 'body'>} [config={}] - Request config excluding method and body
     * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
     * @throws {FetchClientException} If the request fails
     */
    static async get(url, init = {}) {
      return this.fetch(url, { ...init, method: "GET" });
    }
    /**
     * Makes a POST request to an endpoint
     * @template T - The expected response data type
     * @param {string} url - The URL to make the request to
     * @param {any} [body] - The request body (will be automatically stringified if an object)
     * @param {Omit<FetchRequestConfig, 'method' | 'body'>} [init={}] - Request config excluding method and body
     * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
     * @throws {FetchClientException} If the request fails
     */
    static async post(url, body, init = {}) {
      return this.fetch(url, { ...init, method: "POST", body });
    }
    /**
     * Makes a PUT request to an endpoint
     * @template T - The expected response data type
     * @param {string} url - The URL to make the request to
     * @param {any} [body] - The request body (will be automatically stringified if an object)
     * @param {Omit<FetchRequestConfig, 'method' | 'body'>} [config={}] - Request config excluding method and body
     * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
     * @throws {FetchClientException} If the request fails
     */
    static async put(url, body, init = {}) {
      return this.fetch(url, { ...init, method: "PUT", body });
    }
    /**
     * Makes a DELETE request to an endpoint
     * @template T - The expected response data type
     * @param {string} url - The URL to make the request to
     * @param {Omit<FetchRequestConfig, 'method'>} [init={}] - Request config excluding method
     * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
     * @throws {FetchClientException} If the request fails
     */
    static async delete(url, init = {}) {
      return this.fetch(url, { ...init, method: "DELETE" });
    }
    /**
     * Runs a fetch request
     * @template T - The expected response data type
     * @param {string} url - The URL to request
     * @param {FetchRequestConfig} [config={}] - Fetch options
     * @returns {Promise<FetchResponse<T>>} Promise resolving to the response data
     * @throws {FetchClientException} If the request fails
     */
    static async fetch(url, config2 = {}) {
      const options = this.mergeOptions(config2.options);
      const timeout = this.calculateTimeout(options.timeout);
      const headers = this.createHeaders(config2);
      if (options.additionalHeaders !== void 0) {
        Object.entries(options.additionalHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
      }
      const processedBody = this.processBody(config2.body);
      delete config2.options;
      const resp = await this.performFetch(url, {
        ...config2,
        headers,
        body: processedBody,
        signal: timeout !== void 0 ? AbortSignal.timeout(timeout) : void 0
      }).catch((err) => {
        throw this.createErrorFromNetworkError(err, url);
      });
      const responseHeaders = this.extractHeaders(resp);
      if (options.throwOnError === true && resp.ok === false) {
        if (resp.status >= 300 && resp.status < 400) {
          return this.createResponse(null, resp, responseHeaders);
        } else
          throw await this.createErrorFromResponse(resp);
      }
      const data = await this.parseResponseData(resp, options).catch((err) => {
        throw new XRFetchClientException_1.default(err);
      });
      return this.createResponse(data, resp, responseHeaders);
    }
    /**
     * Merges provided options with defaults
     * @param {FetchRequestConfig['options']} [options={}] - The options to merge
     * @returns {FetchRequestConfig['options']} Merged options
     * @protected
     */
    static mergeOptions(options = {}) {
      return { ...exports.DEFAULT_OPTIONS, ...options };
    }
    /**
     * Creates headers for the request
     * @param {FetchRequestConfig} config - The request config
     * @returns {Headers} The headers object
     * @protected
     */
    static createHeaders(config2) {
      var _a;
      const headers = new Headers(config2.headers);
      if (((_a = config2.options) == null ? void 0 : _a.includeDefaultHeaders) !== false) {
        headers.set("Accept", headers.get("Accept") || "*/*");
        headers.set("Accept-Language", headers.get("Accept-Language") || "en-US,en;q=0.9");
        headers.set("Cache-Control", headers.get("Cache-Control") || "no-cache");
        headers.set("Accept-Encoding", headers.get("Accept-Encoding") || "gzip, deflate, br");
        headers.set("User-Agent", headers.get("User-Agent") || this.USER_AGENT);
      }
      if ((0, utils_12.isObject)(config2.body) === true) {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    }
    /**
     * Processes the request body
     * @param {any} body - The request body
     * @returns {any} The processed body
     * @protected
     */
    static processBody(body) {
      if ((0, utils_12.isObject)(body) === true) {
        return JSON.stringify(body);
      } else
        return body;
    }
    /**
     * Calculates the appropriate timeout value
     * @param {number} [timeout] - The provided timeout
     * @returns {number|undefined} The calculated timeout
     * @protected
     */
    static calculateTimeout(timeout) {
      if (timeout !== void 0) {
        return Math.max(exports.MIN_TIMEOUT, Math.min(exports.MAX_TIMEOUT, timeout));
      } else
        return void 0;
    }
    /**
     * Performs the actual fetch request
     * @param {string} url - The URL to fetch
     * @param {RequestInit} init - The fetch request config
     * @returns {Promise<Response>} The fetch response
     * @protected
     */
    static async performFetch(url, init) {
      return fetch(url, init);
    }
    /**
     * Extracts headers from the response
     * @param {Response} response - The fetch response
     * @returns {Record<string, string>} The headers as an object
     * @protected
     */
    static extractHeaders(response) {
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          if (responseHeaders[key]) {
            responseHeaders[key] += "," + value;
          } else
            responseHeaders[key] = value;
        } else
          responseHeaders[key] = value;
      });
      return responseHeaders;
    }
    /**
     * Creates an error from a failed response
     * @param {Response} response - The fetch response
     * @returns {Promise<FetchClientException>} The created error
     * @protected
     */
    static async createErrorFromResponse(response) {
      return XRFetchClientException_1.default.fromResponse(response);
    }
    /**
     * Creates an error from a network error
     * @param {any} error - The original error
     * @param {string} url - The request URL
     * @returns {FetchClientException} The created error
     * @protected
     */
    static createErrorFromNetworkError(error2, url) {
      return XRFetchClientException_1.default.fromNetworkError(error2 instanceof Error ? error2 : new Error(String(error2)), url);
    }
    /**
     * Parses the response data based on content type
     * @template T - The expected data type
     * @param {Response} response - The fetch response
     * @param {FetchRequestConfig['options']} [options={}] - The fetch options
     * @returns {Promise<T>} The parsed data
     * @protected
     */
    static async parseResponseData(response, options = {}) {
      const data = options.parseJson === true && response.status !== 204 ? await response.json() : await response.text();
      return data;
    }
    /**
     * Creates the final response object
     * @template T - The expected data type
     * @param {T} data - The response data
     * @param {Response} response - The original fetch response
     * @param {Record<string, string>} headers - The extracted headers
     * @returns {FetchResponse<T>} The final response object
     * @protected
     */
    static createResponse(data, response, headers) {
      return { data, response, headers, statusCode: response.status };
    }
  }
  XRFetch.USER_AGENT = "XboxLive-Auth/5.0 (Node; +https://github.com/XboxReplay/xboxlive-auth) XboxReplay/AuthClient";
  exports.default = XRFetch;
})(Fetch);
var __importDefault$3 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(Clients, "__esModule", { value: true });
const __1$1 = __importDefault$3(Fetch);
class FetchClient extends __1$1.default {
  /**
   * Creates headers for the request
   * @param {FetchRequestConfig} config - The request config
   * @returns {Headers} The headers object
   * @protected
   */
  static createHeaders(config2) {
    const headers = super.createHeaders(config2);
    return headers;
  }
}
FetchClient.USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.3240.64";
Clients.default = FetchClient;
var XSAPIFetchClient$1 = {};
var __importDefault$2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(XSAPIFetchClient$1, "__esModule", { value: true });
const __1 = __importDefault$2(Fetch);
class XSAPIFetchClient extends __1.default {
  /**
   * Makes a GET request to an Xbox Network API endpoint
   * @template T - The expected response data type
   * @param {string} url - The URL to make the request to
   * @param {Omit<XSAPIFetchRequestConfig, 'method' | 'body'>} [config={}] - Request config excluding method and body
   * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
   * @throws {FetchClientException} If the request fails
   *
   * @example
   * const response = await XSAPIFetchClient.get('https://xbl.xboxlive.com/resource');
   */
  static async get(url, config2 = {}) {
    return this.fetch(url, { ...config2, method: "GET" });
  }
  /**
   * Makes a POST request to an Xbox Network API endpoint
   * @template T - The expected response data type
   * @param {string} url - The URL to make the request to
   * @param {any} [body] - The request body (will be automatically stringified if an object)
   * @param {Omit<XSAPIFetchRequestConfig, 'method' | 'body'>} [config={}] - Request config excluding method and body
   * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
   * @throws {FetchClientException} If the request fails
   *
   * @example
   * const response = await XSAPIFetchClient.post('https://service.xboxlive.com/resource', { foo: 'bar' });
   */
  static async post(url, body, config2 = {}) {
    return this.fetch(url, { ...config2, method: "POST", body });
  }
  /**
   * Makes a PUT request to an Xbox Network API endpoint
   * @template T - The expected response data type
   * @param {string} url - The URL to make the request to
   * @param {any} [body] - The request body (will be automatically stringified if an object)
   * @param {Omit<XSAPIFetchRequestConfig, 'method' | 'body'>} [config={}] - Request config excluding method and body
   * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
   * @throws {FetchClientException} If the request fails
   *
   * @example
   * const response = await XSAPIFetchClient.put('https://service.xboxlive.com/resource', { foo: 'bar' });
   */
  static async put(url, body, config2 = {}) {
    return this.fetch(url, { ...config2, method: "PUT", body });
  }
  /**
   * Makes a DELETE request to an Xbox Network API endpoint
   * @template T - The expected response data type
   * @param {string} url - The URL to make the request to
   * @param {Omit<XSAPIFetchRequestConfig, 'method'>} [config={}] - Request config excluding method
   * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
   * @throws {FetchClientException} If the request fails
   *
   * @example
   * const response = await XSAPIFetchClient.delete('https://service.xboxlive.com/resource');
   */
  static async delete(url, config2 = {}) {
    return this.fetch(url, { ...config2, method: "DELETE" });
  }
  /**
   * Merges provided options with defaults, adding Xbox-specific defaults
   * @param {XSAPIFetchRequestConfig["options"]} [options={}] - The options to merge
   * @returns {XSAPIFetchRequestConfig["options"]} Merged options
   * @protected
   */
  static mergeOptions(options = {}) {
    return { ...super.mergeOptions(options) };
  }
  /**
   * Creates headers for the request, adding Xbox-specific headers
   * @param {XSAPIFetchRequestConfig} config - The request config
   * @returns {Headers} The headers object
   * @protected
   */
  static createHeaders(config2) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const headers = super.createHeaders(config2);
    headers.set("Accept", "application/json");
    headers.set("X-XBL-Contract-Version", String(((_a = config2.options) == null ? void 0 : _a.contractVersion) || "0"));
    if (((_b = config2.options) == null ? void 0 : _b.XSTSToken) !== void 0) {
      headers.set("Authorization", `XBL3.0 x=${((_c = config2.options) == null ? void 0 : _c.userHash) || "*"};${(_d = config2.options) == null ? void 0 : _d.XSTSToken}`);
    }
    if (((_e = config2.options) == null ? void 0 : _e.signature) !== void 0) {
      headers.set("Signature", (_f = config2.options) == null ? void 0 : _f.signature);
    }
    if (((_g = config2.options) == null ? void 0 : _g.mscv) !== void 0) {
      headers.set("MS-CV", (_h = config2.options) == null ? void 0 : _h.mscv);
    }
    return headers;
  }
}
XSAPIFetchClient$1.default = XSAPIFetchClient;
var experimental = {};
var config$3 = {};
Object.defineProperty(config$3, "__esModule", { value: true });
config$3.config = void 0;
const config$2 = {
  urls: {
    deviceAuthenticate: "https://device.auth.xboxlive.com/device/authenticate",
    titleAuthenticate: "https://title.auth.xboxlive.com/device/authenticate",
    userAuthenticate: "https://user.auth.xboxlive.com/user/authenticate",
    XSTSAuthorize: "https://xsts.auth.xboxlive.com/xsts/authorize"
  },
  sandboxIds: {
    RETAIL: "RETAIL",
    XDKS_1: "XDKS.1"
    // DevKit
  },
  relyingParties: {
    ACCOUNTS: "http://accounts.xboxlive.com",
    ATTESTATION: "http://attestation.xboxlive.com",
    BANNING: "http://banning.xboxlive.com",
    DEVICE_MGT: "http://device.mgt.xboxlive.com",
    EVENTS: "http://events.xboxlive.com",
    EXPERIMENTATION: "http://experimentation.xboxlive.com/",
    GAME_SERVICES: "https://gameservices.xboxlive.com/",
    INSTANCE_MGT: "http://instance.mgt.xboxlive.com",
    LICENSING: "http://licensing.xboxlive.com",
    MP_MS: "http://mp.microsoft.com/",
    PLAYFAB: "http://playfab.xboxlive.com/",
    SISU: "http://sisu.xboxlive.com/",
    STREAMING: "rp://streaming.xboxlive.com/",
    UNLOCK_DEVICE: "http://unlock.device.mgt.xboxlive.com",
    UPDATE: "http://update.xboxlive.com",
    UX_SERVICES: "http://uxservices.xboxlive.com",
    XBOX_LIVE: "http://xboxlive.com",
    XDES: "http://xdes.xboxlive.com/",
    XFLIGHT: "http://xflight.xboxlive.com/",
    XKMS: "http://xkms.xboxlive.com",
    XLINK: "http://xlink.xboxlive.com"
  },
  displayClaims: ["gtg", "xid", "uhs", "agg", "usr", "utr", "prv", "mgt", "umg", "mgs"]
};
config$3.config = config$2;
var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(experimental, "__esModule", { value: true });
experimental.createDummyWin32DeviceToken = void 0;
const XSAPIFetchClient_1 = __importDefault$1(XSAPIFetchClient$1);
const config_1 = config$3;
const createDummyWin32DeviceToken = async () => {
  const signature = "AAAAAQHcFbBVEuAAHfvqYcbt4rhMgxAKtPiOJgct4UTCX2HqbQNLTHsnwjp9zcYNZMKHEknpyGWNqsIhyXaAd2v8ADmGrfh11oMS1g==";
  const properties = {
    AuthMethod: "ProofOfPossession",
    Id: "91dc36cd-080a-4493-8234-3b585c78b0d5",
    DeviceType: "Win32",
    Version: "10.0.19042",
    ProofKey: {
      crv: "P-256",
      alg: "ES256",
      use: "sig",
      kty: "EC",
      x: "qMKczrK1b5opLCIX-tzyqOWztlbERh1i5sxDzdHrdxs",
      y: "23uwwgd2oSnWzyjHflRKaLxFsxX0-oE-mECf6c0gOaE"
    }
  };
  return XSAPIFetchClient_1.default.post(config_1.config.urls.deviceAuthenticate, {
    RelyingParty: "http://auth.xboxlive.com",
    TokenType: "JWT",
    Properties: properties
  }, { options: { signature } }).then((res) => res.data);
};
experimental.createDummyWin32DeviceToken = createDummyWin32DeviceToken;
var requests$1 = {};
(function(exports) {
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.exchangeTokenForXSTSToken = exports.exchangeTokensForXSTSToken = exports.exchangeRpsTicketForUserToken = void 0;
  const XSAPIFetchClient_12 = __importDefault2(XSAPIFetchClient$1);
  const config_12 = config$3;
  const exchangeRpsTicketForUserToken = async (rpsTicket, preamble = "t", additionalHeaders = {}) => {
    const match = rpsTicket.match(/^([d|t]=)/g);
    if (match === null) {
      rpsTicket = `${preamble}=${rpsTicket}`;
    }
    return XSAPIFetchClient_12.default.post(config_12.config.urls.userAuthenticate, {
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT",
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: rpsTicket
      }
    }, { options: { additionalHeaders } }).then((res) => res.data);
  };
  exports.exchangeRpsTicketForUserToken = exchangeRpsTicketForUserToken;
  const exchangeTokensForXSTSToken = async (tokens, options = {}, additionalHeaders = {}) => {
    return XSAPIFetchClient_12.default.post(config_12.config.urls.XSTSAuthorize, {
      RelyingParty: options.XSTSRelyingParty || config_12.config.relyingParties.XBOX_LIVE,
      TokenType: "JWT",
      Properties: {
        UserTokens: tokens.userTokens,
        DeviceToken: tokens.deviceToken,
        TitleToken: tokens.titleToken,
        OptionalDisplayClaims: options.optionalDisplayClaims,
        SandboxId: options.sandboxId || config_12.config.sandboxIds.RETAIL
      }
    }, { options: { additionalHeaders } }).then((res) => res.data);
  };
  exports.exchangeTokensForXSTSToken = exchangeTokensForXSTSToken;
  const exchangeTokenForXSTSToken = (userToken, options = {}, additionalHeaders = {}) => (0, exports.exchangeTokensForXSTSToken)({ userTokens: [userToken] }, options, additionalHeaders);
  exports.exchangeTokenForXSTSToken = exchangeTokenForXSTSToken;
})(requests$1);
var requests = {};
var XRLiveLibraryException$1 = {};
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(XRLiveLibraryException$1, "__esModule", { value: true });
const XRException_1 = __importDefault(XRException);
class XRLiveLibraryException extends XRException_1.default {
  /**
   * Creates a new library exception
   * @param stringOrError - Error message or an Error object to wrap
   * @param data - Additional error data
   */
  constructor(stringOrError, data = {}) {
    super(stringOrError, data);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
XRLiveLibraryException$1.default = XRLiveLibraryException;
var config$1 = {};
Object.defineProperty(config$1, "__esModule", { value: true });
config$1.config = void 0;
const config = {
  urls: {
    authorize: "https://login.live.com/oauth20_authorize.srf",
    token: "https://login.live.com/oauth20_token.srf"
  },
  clients: {
    xboxApp: {
      id: "000000004C12AE6F",
      redirectUri: "https://login.live.com/oauth20_desktop.srf",
      scope: "service::user.auth.xboxlive.com::MBI_SSL",
      responseType: "token"
    }
  }
};
config$1.config = config;
(function(exports) {
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.authenticate = exports.preAuth = exports.refreshAccessToken = exports.exchangeCodeForAccessToken = exports.getAuthorizeUrl = void 0;
  const Clients_1 = __importDefault2(Clients);
  const XRLiveLibraryException_1 = __importDefault2(XRLiveLibraryException$1);
  const config_12 = config$1;
  const getAuthorizeUrl = (clientId = config_12.config.clients.xboxApp.id, scope = config_12.config.clients.xboxApp.scope, responseType = config_12.config.clients.xboxApp.responseType, redirectUri = config_12.config.clients.xboxApp.redirectUri) => `${config_12.config.urls.authorize}?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope
  }).toString()}`;
  exports.getAuthorizeUrl = getAuthorizeUrl;
  const exchangeCodeForAccessToken = async (code, clientId, scope, redirectUri, clientSecret) => {
    const payload = {
      code,
      client_id: clientId,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      scope
    };
    if (clientSecret !== void 0) {
      payload.client_secret = clientSecret;
    }
    return Clients_1.default.post(config_12.config.urls.token, new URLSearchParams(payload).toString(), {
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }
    }).then((res) => res.data);
  };
  exports.exchangeCodeForAccessToken = exchangeCodeForAccessToken;
  const refreshAccessToken = async (refreshToken, clientId = config_12.config.clients.xboxApp.id, scope = config_12.config.clients.xboxApp.scope, clientSecret) => {
    const payload = {
      client_id: clientId,
      scope,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    };
    if (clientSecret !== void 0) {
      payload.client_secret = clientSecret;
    }
    return Clients_1.default.post(config_12.config.urls.token, new URLSearchParams(payload).toString(), {
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }
    }).then((res) => res.data);
  };
  exports.refreshAccessToken = refreshAccessToken;
  const preAuth = async (options) => {
    const url = (0, exports.getAuthorizeUrl)(options == null ? void 0 : options.clientId, options == null ? void 0 : options.scope, options == null ? void 0 : options.responseType, options == null ? void 0 : options.redirectUri);
    const resp = await Clients_1.default.get(url, {
      options: { parseJson: false }
    });
    const body = resp.data;
    const cookies = resp.headers["set-cookie"] || "";
    const cookie = cookies.split(",").map((c) => c.trim().split(";")[0]).filter(Boolean).join("; ");
    const matches = {
      PPFT: extractPPFT(body) ?? void 0,
      urlPost: extractUrlPost(body) ?? void 0
    };
    if (matches.PPFT !== void 0 && matches.urlPost !== void 0) {
      return { cookie, matches };
    }
    throw new XRLiveLibraryException_1.default(`Could not match required "preAuth" parameters`, {
      attributes: { code: "PRE_AUTH_ERROR", extra: { matches } }
    });
  };
  exports.preAuth = preAuth;
  const authenticate = async (credentials) => {
    const preAuthResponse = await (0, exports.preAuth)();
    const resp = await Clients_1.default.post(preAuthResponse.matches.urlPost, new URLSearchParams({
      login: credentials.email,
      loginfmt: credentials.email,
      passwd: credentials.password,
      PPFT: preAuthResponse.matches.PPFT
    }).toString(), {
      headers: {
        ["Content-Type"]: "application/x-www-form-urlencoded",
        ["Cookie"]: preAuthResponse.cookie
      },
      redirect: "manual",
      options: { parseJson: false }
    });
    if (resp.statusCode !== 302) {
      throw new XRLiveLibraryException_1.default(`The authentication has failed`, {
        attributes: { code: "INVALID_CREDENTIALS_OR_2FA_ENABLED" }
      });
    }
    const hash = (resp.headers.location || "").split("#")[1] || null;
    if (hash === null) {
      throw new XRLiveLibraryException_1.default(`The authentication has failed`, {
        attributes: { code: "MISSING_HASH_PARAMETERS" }
      });
    }
    const params = new URLSearchParams(hash);
    const formatted = {};
    for (const [key, value] of params.entries()) {
      if (key === "expires_in") {
        formatted[key] = Number(value);
      } else
        formatted[key] = value;
    }
    const output = formatted;
    if (output.refresh_token === void 0 || output.refresh_token === "") {
      output.refresh_token = null;
    }
    return output;
  };
  exports.authenticate = authenticate;
  const extractPPFT = (htmlContent) => {
    const ppftRegex = /name=\\?"PPFT\\?"[^>]*value=\\?"([^"\\]+)\\?"/i;
    const match = htmlContent.match(ppftRegex);
    return match !== null && match[1] !== void 0 ? match[1] : null;
  };
  const extractUrlPost = (htmlContent) => {
    const urlPostRegex = /\\?['"]?urlPost\\?['"]?:\s*\\?['"]([^'"\\]+)\\?['"]/i;
    const match = htmlContent.match(urlPostRegex);
    return match !== null && match[1] !== void 0 ? match[1] : null;
  };
})(requests);
var lib_types = {};
Object.defineProperty(lib_types, "__esModule", { value: true });
var Fetch_types = {};
Object.defineProperty(Fetch_types, "__esModule", { value: true });
var requests_types$1 = {};
Object.defineProperty(requests_types$1, "__esModule", { value: true });
var requests_types = {};
Object.defineProperty(requests_types, "__esModule", { value: true });
(function(exports) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
  };
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.XSAPIClient = exports.HTTPClient = exports.xnet = exports.live = exports.authenticate = void 0;
  const Clients_1 = __importDefault2(Clients);
  exports.HTTPClient = Clients_1.default;
  const XSAPIFetchClient_12 = __importDefault2(XSAPIFetchClient$1);
  exports.XSAPIClient = XSAPIFetchClient_12.default;
  const experimental_1 = experimental;
  const requests_1 = requests$1;
  const requests_2 = requests;
  const authenticate = async (email, password, options = {}) => {
    const authResponse = await (0, requests_2.authenticate)({ email, password });
    const userTokenResponse = await (0, requests_1.exchangeRpsTicketForUserToken)(authResponse.access_token, "t");
    const reqTokens = { userTokens: [userTokenResponse.Token] };
    const XSTSResponse = await (0, requests_1.exchangeTokensForXSTSToken)(reqTokens, {
      XSTSRelyingParty: options.XSTSRelyingParty,
      optionalDisplayClaims: options.optionalDisplayClaims,
      sandboxId: options.sandboxId
    });
    if (options.raw === true) {
      return {
        "login.live.com": authResponse,
        "user.auth.xboxlive.com": userTokenResponse,
        "xsts.auth.xboxlive.com": XSTSResponse
      };
    }
    return {
      xuid: XSTSResponse.DisplayClaims.xui[0].xid || null,
      user_hash: XSTSResponse.DisplayClaims.xui[0].uhs,
      xsts_token: XSTSResponse.Token,
      display_claims: XSTSResponse.DisplayClaims,
      expires_on: XSTSResponse.NotAfter
    };
  };
  exports.authenticate = authenticate;
  exports.live = {
    preAuth: requests_2.preAuth,
    getAuthorizeUrl: requests_2.getAuthorizeUrl,
    refreshAccessToken: requests_2.refreshAccessToken,
    authenticateWithCredentials: requests_2.authenticate,
    exchangeCodeForAccessToken: requests_2.exchangeCodeForAccessToken
  };
  exports.xnet = {
    exchangeTokenForXSTSToken: requests_1.exchangeTokenForXSTSToken,
    exchangeTokensForXSTSToken: requests_1.exchangeTokensForXSTSToken,
    exchangeCodeForAccessToken: requests_2.exchangeCodeForAccessToken,
    exchangeRpsTicketForUserToken: requests_1.exchangeRpsTicketForUserToken,
    experimental: {
      createDummyWin32DeviceToken: experimental_1.createDummyWin32DeviceToken
    }
  };
  __exportStar(lib_types, exports);
  __exportStar(Fetch_types, exports);
  __exportStar(requests_types$1, exports);
  __exportStar(requests_types, exports);
})(dist);
var smartbuffer = {};
var utils = {};
Object.defineProperty(utils, "__esModule", { value: true });
const buffer_1 = require$$0$2;
const ERRORS = {
  INVALID_ENCODING: "Invalid encoding provided. Please specify a valid encoding the internal Node.js Buffer supports.",
  INVALID_SMARTBUFFER_SIZE: "Invalid size provided. Size must be a valid integer greater than zero.",
  INVALID_SMARTBUFFER_BUFFER: "Invalid Buffer provided in SmartBufferOptions.",
  INVALID_SMARTBUFFER_OBJECT: "Invalid SmartBufferOptions object supplied to SmartBuffer constructor or factory methods.",
  INVALID_OFFSET: "An invalid offset value was provided.",
  INVALID_OFFSET_NON_NUMBER: "An invalid offset value was provided. A numeric value is required.",
  INVALID_LENGTH: "An invalid length value was provided.",
  INVALID_LENGTH_NON_NUMBER: "An invalid length value was provived. A numeric value is required.",
  INVALID_TARGET_OFFSET: "Target offset is beyond the bounds of the internal SmartBuffer data.",
  INVALID_TARGET_LENGTH: "Specified length value moves cursor beyong the bounds of the internal SmartBuffer data.",
  INVALID_READ_BEYOND_BOUNDS: "Attempted to read beyond the bounds of the managed data.",
  INVALID_WRITE_BEYOND_BOUNDS: "Attempted to write beyond the bounds of the managed data."
};
utils.ERRORS = ERRORS;
function checkEncoding(encoding) {
  if (!buffer_1.Buffer.isEncoding(encoding)) {
    throw new Error(ERRORS.INVALID_ENCODING);
  }
}
utils.checkEncoding = checkEncoding;
function isFiniteInteger(value) {
  return typeof value === "number" && isFinite(value) && isInteger$2(value);
}
utils.isFiniteInteger = isFiniteInteger;
function checkOffsetOrLengthValue(value, offset) {
  if (typeof value === "number") {
    if (!isFiniteInteger(value) || value < 0) {
      throw new Error(offset ? ERRORS.INVALID_OFFSET : ERRORS.INVALID_LENGTH);
    }
  } else {
    throw new Error(offset ? ERRORS.INVALID_OFFSET_NON_NUMBER : ERRORS.INVALID_LENGTH_NON_NUMBER);
  }
}
function checkLengthValue(length) {
  checkOffsetOrLengthValue(length, false);
}
utils.checkLengthValue = checkLengthValue;
function checkOffsetValue(offset) {
  checkOffsetOrLengthValue(offset, true);
}
utils.checkOffsetValue = checkOffsetValue;
function checkTargetOffset(offset, buff) {
  if (offset < 0 || offset > buff.length) {
    throw new Error(ERRORS.INVALID_TARGET_OFFSET);
  }
}
utils.checkTargetOffset = checkTargetOffset;
function isInteger$2(value) {
  return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
}
function bigIntAndBufferInt64Check(bufferMethod) {
  if (typeof BigInt === "undefined") {
    throw new Error("Platform does not support JS BigInt type.");
  }
  if (typeof buffer_1.Buffer.prototype[bufferMethod] === "undefined") {
    throw new Error(`Platform does not support Buffer.prototype.${bufferMethod}.`);
  }
}
utils.bigIntAndBufferInt64Check = bigIntAndBufferInt64Check;
Object.defineProperty(smartbuffer, "__esModule", { value: true });
const utils_1 = utils;
const DEFAULT_SMARTBUFFER_SIZE = 4096;
const DEFAULT_SMARTBUFFER_ENCODING = "utf8";
let SmartBuffer$1 = class SmartBuffer {
  /**
   * Creates a new SmartBuffer instance.
   *
   * @param options { SmartBufferOptions } The SmartBufferOptions to apply to this instance.
   */
  constructor(options) {
    this.length = 0;
    this._encoding = DEFAULT_SMARTBUFFER_ENCODING;
    this._writeOffset = 0;
    this._readOffset = 0;
    if (SmartBuffer.isSmartBufferOptions(options)) {
      if (options.encoding) {
        utils_1.checkEncoding(options.encoding);
        this._encoding = options.encoding;
      }
      if (options.size) {
        if (utils_1.isFiniteInteger(options.size) && options.size > 0) {
          this._buff = Buffer.allocUnsafe(options.size);
        } else {
          throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_SIZE);
        }
      } else if (options.buff) {
        if (Buffer.isBuffer(options.buff)) {
          this._buff = options.buff;
          this.length = options.buff.length;
        } else {
          throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_BUFFER);
        }
      } else {
        this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
      }
    } else {
      if (typeof options !== "undefined") {
        throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_OBJECT);
      }
      this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
    }
  }
  /**
   * Creates a new SmartBuffer instance with the provided internal Buffer size and optional encoding.
   *
   * @param size { Number } The size of the internal Buffer.
   * @param encoding { String } The BufferEncoding to use for strings.
   *
   * @return { SmartBuffer }
   */
  static fromSize(size, encoding) {
    return new this({
      size,
      encoding
    });
  }
  /**
   * Creates a new SmartBuffer instance with the provided Buffer and optional encoding.
   *
   * @param buffer { Buffer } The Buffer to use as the internal Buffer value.
   * @param encoding { String } The BufferEncoding to use for strings.
   *
   * @return { SmartBuffer }
   */
  static fromBuffer(buff, encoding) {
    return new this({
      buff,
      encoding
    });
  }
  /**
   * Creates a new SmartBuffer instance with the provided SmartBufferOptions options.
   *
   * @param options { SmartBufferOptions } The options to use when creating the SmartBuffer instance.
   */
  static fromOptions(options) {
    return new this(options);
  }
  /**
   * Type checking function that determines if an object is a SmartBufferOptions object.
   */
  static isSmartBufferOptions(options) {
    const castOptions = options;
    return castOptions && (castOptions.encoding !== void 0 || castOptions.size !== void 0 || castOptions.buff !== void 0);
  }
  // Signed integers
  /**
   * Reads an Int8 value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readInt8(offset) {
    return this._readNumberValue(Buffer.prototype.readInt8, 1, offset);
  }
  /**
   * Reads an Int16BE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readInt16BE(offset) {
    return this._readNumberValue(Buffer.prototype.readInt16BE, 2, offset);
  }
  /**
   * Reads an Int16LE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readInt16LE(offset) {
    return this._readNumberValue(Buffer.prototype.readInt16LE, 2, offset);
  }
  /**
   * Reads an Int32BE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readInt32BE(offset) {
    return this._readNumberValue(Buffer.prototype.readInt32BE, 4, offset);
  }
  /**
   * Reads an Int32LE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readInt32LE(offset) {
    return this._readNumberValue(Buffer.prototype.readInt32LE, 4, offset);
  }
  /**
   * Reads a BigInt64BE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { BigInt }
   */
  readBigInt64BE(offset) {
    utils_1.bigIntAndBufferInt64Check("readBigInt64BE");
    return this._readNumberValue(Buffer.prototype.readBigInt64BE, 8, offset);
  }
  /**
   * Reads a BigInt64LE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { BigInt }
   */
  readBigInt64LE(offset) {
    utils_1.bigIntAndBufferInt64Check("readBigInt64LE");
    return this._readNumberValue(Buffer.prototype.readBigInt64LE, 8, offset);
  }
  /**
   * Writes an Int8 value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeInt8(value, offset) {
    this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
    return this;
  }
  /**
   * Inserts an Int8 value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertInt8(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
  }
  /**
   * Writes an Int16BE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeInt16BE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
  }
  /**
   * Inserts an Int16BE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertInt16BE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
  }
  /**
   * Writes an Int16LE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeInt16LE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
  }
  /**
   * Inserts an Int16LE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertInt16LE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
  }
  /**
   * Writes an Int32BE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeInt32BE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
  }
  /**
   * Inserts an Int32BE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertInt32BE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
  }
  /**
   * Writes an Int32LE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeInt32LE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
  }
  /**
   * Inserts an Int32LE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertInt32LE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
  }
  /**
   * Writes a BigInt64BE value to the current write position (or at optional offset).
   *
   * @param value { BigInt } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeBigInt64BE(value, offset) {
    utils_1.bigIntAndBufferInt64Check("writeBigInt64BE");
    return this._writeNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
  }
  /**
   * Inserts a BigInt64BE value at the given offset value.
   *
   * @param value { BigInt } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertBigInt64BE(value, offset) {
    utils_1.bigIntAndBufferInt64Check("writeBigInt64BE");
    return this._insertNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
  }
  /**
   * Writes a BigInt64LE value to the current write position (or at optional offset).
   *
   * @param value { BigInt } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeBigInt64LE(value, offset) {
    utils_1.bigIntAndBufferInt64Check("writeBigInt64LE");
    return this._writeNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
  }
  /**
   * Inserts a Int64LE value at the given offset value.
   *
   * @param value { BigInt } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertBigInt64LE(value, offset) {
    utils_1.bigIntAndBufferInt64Check("writeBigInt64LE");
    return this._insertNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
  }
  // Unsigned Integers
  /**
   * Reads an UInt8 value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readUInt8(offset) {
    return this._readNumberValue(Buffer.prototype.readUInt8, 1, offset);
  }
  /**
   * Reads an UInt16BE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readUInt16BE(offset) {
    return this._readNumberValue(Buffer.prototype.readUInt16BE, 2, offset);
  }
  /**
   * Reads an UInt16LE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readUInt16LE(offset) {
    return this._readNumberValue(Buffer.prototype.readUInt16LE, 2, offset);
  }
  /**
   * Reads an UInt32BE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readUInt32BE(offset) {
    return this._readNumberValue(Buffer.prototype.readUInt32BE, 4, offset);
  }
  /**
   * Reads an UInt32LE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readUInt32LE(offset) {
    return this._readNumberValue(Buffer.prototype.readUInt32LE, 4, offset);
  }
  /**
   * Reads a BigUInt64BE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { BigInt }
   */
  readBigUInt64BE(offset) {
    utils_1.bigIntAndBufferInt64Check("readBigUInt64BE");
    return this._readNumberValue(Buffer.prototype.readBigUInt64BE, 8, offset);
  }
  /**
   * Reads a BigUInt64LE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { BigInt }
   */
  readBigUInt64LE(offset) {
    utils_1.bigIntAndBufferInt64Check("readBigUInt64LE");
    return this._readNumberValue(Buffer.prototype.readBigUInt64LE, 8, offset);
  }
  /**
   * Writes an UInt8 value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeUInt8(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
  }
  /**
   * Inserts an UInt8 value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertUInt8(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
  }
  /**
   * Writes an UInt16BE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeUInt16BE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
  }
  /**
   * Inserts an UInt16BE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertUInt16BE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
  }
  /**
   * Writes an UInt16LE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeUInt16LE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
  }
  /**
   * Inserts an UInt16LE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertUInt16LE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
  }
  /**
   * Writes an UInt32BE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeUInt32BE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
  }
  /**
   * Inserts an UInt32BE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertUInt32BE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
  }
  /**
   * Writes an UInt32LE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeUInt32LE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
  }
  /**
   * Inserts an UInt32LE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertUInt32LE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
  }
  /**
   * Writes a BigUInt64BE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeBigUInt64BE(value, offset) {
    utils_1.bigIntAndBufferInt64Check("writeBigUInt64BE");
    return this._writeNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
  }
  /**
   * Inserts a BigUInt64BE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertBigUInt64BE(value, offset) {
    utils_1.bigIntAndBufferInt64Check("writeBigUInt64BE");
    return this._insertNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
  }
  /**
   * Writes a BigUInt64LE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeBigUInt64LE(value, offset) {
    utils_1.bigIntAndBufferInt64Check("writeBigUInt64LE");
    return this._writeNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
  }
  /**
   * Inserts a BigUInt64LE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertBigUInt64LE(value, offset) {
    utils_1.bigIntAndBufferInt64Check("writeBigUInt64LE");
    return this._insertNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
  }
  // Floating Point
  /**
   * Reads an FloatBE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readFloatBE(offset) {
    return this._readNumberValue(Buffer.prototype.readFloatBE, 4, offset);
  }
  /**
   * Reads an FloatLE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readFloatLE(offset) {
    return this._readNumberValue(Buffer.prototype.readFloatLE, 4, offset);
  }
  /**
   * Writes a FloatBE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeFloatBE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
  }
  /**
   * Inserts a FloatBE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertFloatBE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
  }
  /**
   * Writes a FloatLE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeFloatLE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
  }
  /**
   * Inserts a FloatLE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertFloatLE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
  }
  // Double Floating Point
  /**
   * Reads an DoublEBE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readDoubleBE(offset) {
    return this._readNumberValue(Buffer.prototype.readDoubleBE, 8, offset);
  }
  /**
   * Reads an DoubleLE value from the current read position or an optionally provided offset.
   *
   * @param offset { Number } The offset to read data from (optional)
   * @return { Number }
   */
  readDoubleLE(offset) {
    return this._readNumberValue(Buffer.prototype.readDoubleLE, 8, offset);
  }
  /**
   * Writes a DoubleBE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeDoubleBE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
  }
  /**
   * Inserts a DoubleBE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertDoubleBE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
  }
  /**
   * Writes a DoubleLE value to the current write position (or at optional offset).
   *
   * @param value { Number } The value to write.
   * @param offset { Number } The offset to write the value at.
   *
   * @return this
   */
  writeDoubleLE(value, offset) {
    return this._writeNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
  }
  /**
   * Inserts a DoubleLE value at the given offset value.
   *
   * @param value { Number } The value to insert.
   * @param offset { Number } The offset to insert the value at.
   *
   * @return this
   */
  insertDoubleLE(value, offset) {
    return this._insertNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
  }
  // Strings
  /**
   * Reads a String from the current read position.
   *
   * @param arg1 { Number | String } The number of bytes to read as a String, or the BufferEncoding to use for
   *             the string (Defaults to instance level encoding).
   * @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
   *
   * @return { String }
   */
  readString(arg1, encoding) {
    let lengthVal;
    if (typeof arg1 === "number") {
      utils_1.checkLengthValue(arg1);
      lengthVal = Math.min(arg1, this.length - this._readOffset);
    } else {
      encoding = arg1;
      lengthVal = this.length - this._readOffset;
    }
    if (typeof encoding !== "undefined") {
      utils_1.checkEncoding(encoding);
    }
    const value = this._buff.slice(this._readOffset, this._readOffset + lengthVal).toString(encoding || this._encoding);
    this._readOffset += lengthVal;
    return value;
  }
  /**
   * Inserts a String
   *
   * @param value { String } The String value to insert.
   * @param offset { Number } The offset to insert the string at.
   * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
   *
   * @return this
   */
  insertString(value, offset, encoding) {
    utils_1.checkOffsetValue(offset);
    return this._handleString(value, true, offset, encoding);
  }
  /**
   * Writes a String
   *
   * @param value { String } The String value to write.
   * @param arg2 { Number | String } The offset to write the string at, or the BufferEncoding to use.
   * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
   *
   * @return this
   */
  writeString(value, arg2, encoding) {
    return this._handleString(value, false, arg2, encoding);
  }
  /**
   * Reads a null-terminated String from the current read position.
   *
   * @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
   *
   * @return { String }
   */
  readStringNT(encoding) {
    if (typeof encoding !== "undefined") {
      utils_1.checkEncoding(encoding);
    }
    let nullPos = this.length;
    for (let i = this._readOffset; i < this.length; i++) {
      if (this._buff[i] === 0) {
        nullPos = i;
        break;
      }
    }
    const value = this._buff.slice(this._readOffset, nullPos);
    this._readOffset = nullPos + 1;
    return value.toString(encoding || this._encoding);
  }
  /**
   * Inserts a null-terminated String.
   *
   * @param value { String } The String value to write.
   * @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
   * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
   *
   * @return this
   */
  insertStringNT(value, offset, encoding) {
    utils_1.checkOffsetValue(offset);
    this.insertString(value, offset, encoding);
    this.insertUInt8(0, offset + value.length);
    return this;
  }
  /**
   * Writes a null-terminated String.
   *
   * @param value { String } The String value to write.
   * @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
   * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
   *
   * @return this
   */
  writeStringNT(value, arg2, encoding) {
    this.writeString(value, arg2, encoding);
    this.writeUInt8(0, typeof arg2 === "number" ? arg2 + value.length : this.writeOffset);
    return this;
  }
  // Buffers
  /**
   * Reads a Buffer from the internal read position.
   *
   * @param length { Number } The length of data to read as a Buffer.
   *
   * @return { Buffer }
   */
  readBuffer(length) {
    if (typeof length !== "undefined") {
      utils_1.checkLengthValue(length);
    }
    const lengthVal = typeof length === "number" ? length : this.length;
    const endPoint = Math.min(this.length, this._readOffset + lengthVal);
    const value = this._buff.slice(this._readOffset, endPoint);
    this._readOffset = endPoint;
    return value;
  }
  /**
   * Writes a Buffer to the current write position.
   *
   * @param value { Buffer } The Buffer to write.
   * @param offset { Number } The offset to write the Buffer to.
   *
   * @return this
   */
  insertBuffer(value, offset) {
    utils_1.checkOffsetValue(offset);
    return this._handleBuffer(value, true, offset);
  }
  /**
   * Writes a Buffer to the current write position.
   *
   * @param value { Buffer } The Buffer to write.
   * @param offset { Number } The offset to write the Buffer to.
   *
   * @return this
   */
  writeBuffer(value, offset) {
    return this._handleBuffer(value, false, offset);
  }
  /**
   * Reads a null-terminated Buffer from the current read poisiton.
   *
   * @return { Buffer }
   */
  readBufferNT() {
    let nullPos = this.length;
    for (let i = this._readOffset; i < this.length; i++) {
      if (this._buff[i] === 0) {
        nullPos = i;
        break;
      }
    }
    const value = this._buff.slice(this._readOffset, nullPos);
    this._readOffset = nullPos + 1;
    return value;
  }
  /**
   * Inserts a null-terminated Buffer.
   *
   * @param value { Buffer } The Buffer to write.
   * @param offset { Number } The offset to write the Buffer to.
   *
   * @return this
   */
  insertBufferNT(value, offset) {
    utils_1.checkOffsetValue(offset);
    this.insertBuffer(value, offset);
    this.insertUInt8(0, offset + value.length);
    return this;
  }
  /**
   * Writes a null-terminated Buffer.
   *
   * @param value { Buffer } The Buffer to write.
   * @param offset { Number } The offset to write the Buffer to.
   *
   * @return this
   */
  writeBufferNT(value, offset) {
    if (typeof offset !== "undefined") {
      utils_1.checkOffsetValue(offset);
    }
    this.writeBuffer(value, offset);
    this.writeUInt8(0, typeof offset === "number" ? offset + value.length : this._writeOffset);
    return this;
  }
  /**
   * Clears the SmartBuffer instance to its original empty state.
   */
  clear() {
    this._writeOffset = 0;
    this._readOffset = 0;
    this.length = 0;
    return this;
  }
  /**
   * Gets the remaining data left to be read from the SmartBuffer instance.
   *
   * @return { Number }
   */
  remaining() {
    return this.length - this._readOffset;
  }
  /**
   * Gets the current read offset value of the SmartBuffer instance.
   *
   * @return { Number }
   */
  get readOffset() {
    return this._readOffset;
  }
  /**
   * Sets the read offset value of the SmartBuffer instance.
   *
   * @param offset { Number } - The offset value to set.
   */
  set readOffset(offset) {
    utils_1.checkOffsetValue(offset);
    utils_1.checkTargetOffset(offset, this);
    this._readOffset = offset;
  }
  /**
   * Gets the current write offset value of the SmartBuffer instance.
   *
   * @return { Number }
   */
  get writeOffset() {
    return this._writeOffset;
  }
  /**
   * Sets the write offset value of the SmartBuffer instance.
   *
   * @param offset { Number } - The offset value to set.
   */
  set writeOffset(offset) {
    utils_1.checkOffsetValue(offset);
    utils_1.checkTargetOffset(offset, this);
    this._writeOffset = offset;
  }
  /**
   * Gets the currently set string encoding of the SmartBuffer instance.
   *
   * @return { BufferEncoding } The string Buffer encoding currently set.
   */
  get encoding() {
    return this._encoding;
  }
  /**
   * Sets the string encoding of the SmartBuffer instance.
   *
   * @param encoding { BufferEncoding } The string Buffer encoding to set.
   */
  set encoding(encoding) {
    utils_1.checkEncoding(encoding);
    this._encoding = encoding;
  }
  /**
   * Gets the underlying internal Buffer. (This includes unmanaged data in the Buffer)
   *
   * @return { Buffer } The Buffer value.
   */
  get internalBuffer() {
    return this._buff;
  }
  /**
   * Gets the value of the internal managed Buffer (Includes managed data only)
   *
   * @param { Buffer }
   */
  toBuffer() {
    return this._buff.slice(0, this.length);
  }
  /**
   * Gets the String value of the internal managed Buffer
   *
   * @param encoding { String } The BufferEncoding to display the Buffer as (defaults to instance level encoding).
   */
  toString(encoding) {
    const encodingVal = typeof encoding === "string" ? encoding : this._encoding;
    utils_1.checkEncoding(encodingVal);
    return this._buff.toString(encodingVal, 0, this.length);
  }
  /**
   * Destroys the SmartBuffer instance.
   */
  destroy() {
    this.clear();
    return this;
  }
  /**
   * Handles inserting and writing strings.
   *
   * @param value { String } The String value to insert.
   * @param isInsert { Boolean } True if inserting a string, false if writing.
   * @param arg2 { Number | String } The offset to insert the string at, or the BufferEncoding to use.
   * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
   */
  _handleString(value, isInsert, arg3, encoding) {
    let offsetVal = this._writeOffset;
    let encodingVal = this._encoding;
    if (typeof arg3 === "number") {
      offsetVal = arg3;
    } else if (typeof arg3 === "string") {
      utils_1.checkEncoding(arg3);
      encodingVal = arg3;
    }
    if (typeof encoding === "string") {
      utils_1.checkEncoding(encoding);
      encodingVal = encoding;
    }
    const byteLength = Buffer.byteLength(value, encodingVal);
    if (isInsert) {
      this.ensureInsertable(byteLength, offsetVal);
    } else {
      this._ensureWriteable(byteLength, offsetVal);
    }
    this._buff.write(value, offsetVal, byteLength, encodingVal);
    if (isInsert) {
      this._writeOffset += byteLength;
    } else {
      if (typeof arg3 === "number") {
        this._writeOffset = Math.max(this._writeOffset, offsetVal + byteLength);
      } else {
        this._writeOffset += byteLength;
      }
    }
    return this;
  }
  /**
   * Handles writing or insert of a Buffer.
   *
   * @param value { Buffer } The Buffer to write.
   * @param offset { Number } The offset to write the Buffer to.
   */
  _handleBuffer(value, isInsert, offset) {
    const offsetVal = typeof offset === "number" ? offset : this._writeOffset;
    if (isInsert) {
      this.ensureInsertable(value.length, offsetVal);
    } else {
      this._ensureWriteable(value.length, offsetVal);
    }
    value.copy(this._buff, offsetVal);
    if (isInsert) {
      this._writeOffset += value.length;
    } else {
      if (typeof offset === "number") {
        this._writeOffset = Math.max(this._writeOffset, offsetVal + value.length);
      } else {
        this._writeOffset += value.length;
      }
    }
    return this;
  }
  /**
   * Ensures that the internal Buffer is large enough to read data.
   *
   * @param length { Number } The length of the data that needs to be read.
   * @param offset { Number } The offset of the data that needs to be read.
   */
  ensureReadable(length, offset) {
    let offsetVal = this._readOffset;
    if (typeof offset !== "undefined") {
      utils_1.checkOffsetValue(offset);
      offsetVal = offset;
    }
    if (offsetVal < 0 || offsetVal + length > this.length) {
      throw new Error(utils_1.ERRORS.INVALID_READ_BEYOND_BOUNDS);
    }
  }
  /**
   * Ensures that the internal Buffer is large enough to insert data.
   *
   * @param dataLength { Number } The length of the data that needs to be written.
   * @param offset { Number } The offset of the data to be written.
   */
  ensureInsertable(dataLength, offset) {
    utils_1.checkOffsetValue(offset);
    this._ensureCapacity(this.length + dataLength);
    if (offset < this.length) {
      this._buff.copy(this._buff, offset + dataLength, offset, this._buff.length);
    }
    if (offset + dataLength > this.length) {
      this.length = offset + dataLength;
    } else {
      this.length += dataLength;
    }
  }
  /**
   * Ensures that the internal Buffer is large enough to write data.
   *
   * @param dataLength { Number } The length of the data that needs to be written.
   * @param offset { Number } The offset of the data to be written (defaults to writeOffset).
   */
  _ensureWriteable(dataLength, offset) {
    const offsetVal = typeof offset === "number" ? offset : this._writeOffset;
    this._ensureCapacity(offsetVal + dataLength);
    if (offsetVal + dataLength > this.length) {
      this.length = offsetVal + dataLength;
    }
  }
  /**
   * Ensures that the internal Buffer is large enough to write at least the given amount of data.
   *
   * @param minLength { Number } The minimum length of the data needs to be written.
   */
  _ensureCapacity(minLength) {
    const oldLength = this._buff.length;
    if (minLength > oldLength) {
      let data = this._buff;
      let newLength = oldLength * 3 / 2 + 1;
      if (newLength < minLength) {
        newLength = minLength;
      }
      this._buff = Buffer.allocUnsafe(newLength);
      data.copy(this._buff, 0, 0, oldLength);
    }
  }
  /**
   * Reads a numeric number value using the provided function.
   *
   * @typeparam T { number | bigint } The type of the value to be read
   *
   * @param func { Function(offset: number) => number } The function to read data on the internal Buffer with.
   * @param byteSize { Number } The number of bytes read.
   * @param offset { Number } The offset to read from (optional). When this is not provided, the managed readOffset is used instead.
   *
   * @returns { T } the number value
   */
  _readNumberValue(func, byteSize, offset) {
    this.ensureReadable(byteSize, offset);
    const value = func.call(this._buff, typeof offset === "number" ? offset : this._readOffset);
    if (typeof offset === "undefined") {
      this._readOffset += byteSize;
    }
    return value;
  }
  /**
   * Inserts a numeric number value based on the given offset and value.
   *
   * @typeparam T { number | bigint } The type of the value to be written
   *
   * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
   * @param byteSize { Number } The number of bytes written.
   * @param value { T } The number value to write.
   * @param offset { Number } the offset to write the number at (REQUIRED).
   *
   * @returns SmartBuffer this buffer
   */
  _insertNumberValue(func, byteSize, value, offset) {
    utils_1.checkOffsetValue(offset);
    this.ensureInsertable(byteSize, offset);
    func.call(this._buff, value, offset);
    this._writeOffset += byteSize;
    return this;
  }
  /**
   * Writes a numeric number value based on the given offset and value.
   *
   * @typeparam T { number | bigint } The type of the value to be written
   *
   * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
   * @param byteSize { Number } The number of bytes written.
   * @param value { T } The number value to write.
   * @param offset { Number } the offset to write the number at (REQUIRED).
   *
   * @returns SmartBuffer this buffer
   */
  _writeNumberValue(func, byteSize, value, offset) {
    if (typeof offset === "number") {
      if (offset < 0) {
        throw new Error(utils_1.ERRORS.INVALID_WRITE_BEYOND_BOUNDS);
      }
      utils_1.checkOffsetValue(offset);
    }
    const offsetVal = typeof offset === "number" ? offset : this._writeOffset;
    this._ensureWriteable(byteSize, offsetVal);
    func.call(this._buff, value, offsetVal);
    if (typeof offset === "number") {
      this._writeOffset = Math.max(this._writeOffset, offsetVal + byteSize);
    } else {
      this._writeOffset += byteSize;
    }
    return this;
  }
};
smartbuffer.SmartBuffer = SmartBuffer$1;
var util$4;
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util$4;
  hasRequiredUtil = 1;
  var lib = {};
  var nextTick = process.nextTick || commonjsGlobal.setImmediate || commonjsGlobal.setTimeout;
  lib.nextTick = function(func) {
    nextTick(func);
  };
  lib.parallel = function(tasks, done) {
    var results = [];
    var errs = [];
    var length = 0;
    var doneLength = 0;
    function doneIt(ix, err, result) {
      if (err) {
        errs[ix] = err;
      } else {
        results[ix] = result;
      }
      doneLength += 1;
      if (doneLength >= length) {
        done(errs.length > 0 ? errs : errs, results);
      }
    }
    Object.keys(tasks).forEach(function(key) {
      length += 1;
      var task = tasks[key];
      lib.nextTick(function() {
        task(doneIt.bind(null, key), 1);
      });
    });
  };
  lib.promisify = function(func) {
    return new Promise(function(resolve, reject) {
      func(function(err, data) {
        if (err) {
          if (!(err instanceof Error)) {
            err = new Error(err);
          }
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  };
  lib.iterate = function(args, func, callback) {
    var errors = [];
    var f = function() {
      if (args.length === 0) {
        lib.nextTick(callback.bind(null, errors));
        return;
      }
      var arg = args.shift();
      if (typeof arg === "function") {
        arg(function(err, res) {
          if (err) {
            errors.push(err);
          } else {
            while (res.length > 0) {
              args.unshift(res.pop());
            }
          }
          f();
        });
        return;
      }
      func(arg, function(err, res) {
        if (err) {
          errors.push(err);
          f();
        } else {
          lib.nextTick(callback.bind(null, null, res));
        }
      });
    };
    lib.nextTick(f);
  };
  util$4 = lib;
  return util$4;
}
var getmacaddress_windows;
var hasRequiredGetmacaddress_windows;
function requireGetmacaddress_windows() {
  if (hasRequiredGetmacaddress_windows) return getmacaddress_windows;
  hasRequiredGetmacaddress_windows = 1;
  var execFile = require$$0$3.execFile;
  var regexRegex = /[-\/\\^$*+?.()|[\]{}]/g;
  function escape(string) {
    return string.replace(regexRegex, "\\$&");
  }
  getmacaddress_windows = function(iface, callback) {
    execFile("ipconfig", ["/all"], function(err, out) {
      if (err) {
        callback(err, null);
        return;
      }
      var match = new RegExp(escape(iface)).exec(out);
      if (!match) {
        callback("did not find interface in `ipconfig /all`", null);
        return;
      }
      out = out.substring(match.index + iface.length);
      match = /[A-Fa-f0-9]{2}(\-[A-Fa-f0-9]{2}){5}/.exec(out);
      if (!match) {
        callback("did not find a mac address", null);
        return;
      }
      callback(null, match[0].toLowerCase().replace(/\-/g, ":"));
    });
  };
  return getmacaddress_windows;
}
var getmacaddress_linux;
var hasRequiredGetmacaddress_linux;
function requireGetmacaddress_linux() {
  if (hasRequiredGetmacaddress_linux) return getmacaddress_linux;
  hasRequiredGetmacaddress_linux = 1;
  var execFile = require$$0$3.execFile;
  getmacaddress_linux = function(iface, callback) {
    execFile("/bin/cat", ["/sys/class/net/" + iface + "/address"], function(err, out) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, out.trim().toLowerCase());
    });
  };
  return getmacaddress_linux;
}
var getmacaddress_unix;
var hasRequiredGetmacaddress_unix;
function requireGetmacaddress_unix() {
  if (hasRequiredGetmacaddress_unix) return getmacaddress_unix;
  hasRequiredGetmacaddress_unix = 1;
  var execFile = require$$0$3.execFile;
  getmacaddress_unix = function(iface, callback) {
    execFile("ifconfig", [iface], function(err, out) {
      if (err) {
        callback(err, null);
        return;
      }
      var match = /[a-f0-9]{2}(:[a-f0-9]{2}){5}/.exec(out.toLowerCase());
      if (!match) {
        callback("did not find a mac address", null);
        return;
      }
      callback(null, match[0].toLowerCase());
    });
  };
  return getmacaddress_unix;
}
var getmacaddress;
var hasRequiredGetmacaddress;
function requireGetmacaddress() {
  if (hasRequiredGetmacaddress) return getmacaddress;
  hasRequiredGetmacaddress = 1;
  var os = require$$0;
  var _getMacAddress;
  var _validIfaceRegExp = "^[a-z0-9]+$";
  switch (os.platform()) {
    case "win32":
      _validIfaceRegExp = "^[a-z0-9 -]+$";
      _getMacAddress = requireGetmacaddress_windows();
      break;
    case "linux":
      _getMacAddress = requireGetmacaddress_linux();
      break;
    case "darwin":
    case "sunos":
    case "freebsd":
      _getMacAddress = requireGetmacaddress_unix();
      break;
    default:
      console.warn("node-macaddress: Unknown os.platform(), defaulting to 'unix'.");
      _getMacAddress = requireGetmacaddress_unix();
      break;
  }
  var validIfaceRegExp = new RegExp(_validIfaceRegExp, "i");
  getmacaddress = function(iface, callback) {
    if (!validIfaceRegExp.test(iface)) {
      callback(new Error([
        "invalid iface: '",
        iface,
        "' (must conform to reg exp /",
        validIfaceRegExp,
        "/)"
      ].join("")), null);
      return;
    }
    _getMacAddress(iface, callback);
  };
  return getmacaddress;
}
var getallinterfaces_windows;
var hasRequiredGetallinterfaces_windows;
function requireGetallinterfaces_windows() {
  if (hasRequiredGetallinterfaces_windows) return getallinterfaces_windows;
  hasRequiredGetallinterfaces_windows = 1;
  var execFile = require$$0$3.execFile;
  getallinterfaces_windows = function(callback) {
    execFile("wmic", ["nic", "get", "NetConnectionID"], function(err, out) {
      if (err) {
        callback(err, null);
        return;
      }
      var ifaces = out.trim().replace(/\s{2,}/g, "\n").split("\n").slice(1);
      var result = [];
      for (var i = 0; i < ifaces.length; i += 1) {
        var iface = ifaces[i].trim();
        if (iface !== "") {
          result.push(iface);
        }
      }
      callback(null, result);
    });
  };
  return getallinterfaces_windows;
}
var getallinterfaces_linux;
var hasRequiredGetallinterfaces_linux;
function requireGetallinterfaces_linux() {
  if (hasRequiredGetallinterfaces_linux) return getallinterfaces_linux;
  hasRequiredGetallinterfaces_linux = 1;
  var execFile = require$$0$3.execFile;
  getallinterfaces_linux = function(callback) {
    execFile("/bin/ls", ["/sys/class/net"], function(err, out) {
      if (err) {
        callback(err, null);
        return;
      }
      var ifaces = out.split(/[ \t\n]+/);
      var result = [];
      for (var i = 0; i < ifaces.length; i += 1) {
        var iface = ifaces[i].trim();
        if (iface !== "") {
          result.push(iface);
        }
      }
      callback(null, result);
    });
  };
  return getallinterfaces_linux;
}
var getallinterfaces_unix;
var hasRequiredGetallinterfaces_unix;
function requireGetallinterfaces_unix() {
  if (hasRequiredGetallinterfaces_unix) return getallinterfaces_unix;
  hasRequiredGetallinterfaces_unix = 1;
  var execFile = require$$0$3.execFile;
  getallinterfaces_unix = function(callback) {
    execFile("/sbin/ifconfig", ["-l"], function(err, out) {
      if (err) {
        callback(err, null);
        return;
      }
      var ifaces = out.split(/[ \t]+/);
      var result = [];
      for (var i = 0; i < ifaces.length; i += 1) {
        var iface = ifaces[i].trim();
        if (iface !== "") {
          result.push(iface);
        }
      }
      callback(null, result);
    });
  };
  return getallinterfaces_unix;
}
var getallinterfaces;
var hasRequiredGetallinterfaces;
function requireGetallinterfaces() {
  if (hasRequiredGetallinterfaces) return getallinterfaces;
  hasRequiredGetallinterfaces = 1;
  var os = require$$0;
  var _getAllInterfaces;
  switch (os.platform()) {
    case "win32":
      _getAllInterfaces = requireGetallinterfaces_windows();
      break;
    case "linux":
      _getAllInterfaces = requireGetallinterfaces_linux();
      break;
    case "darwin":
    case "sunos":
    case "freebsd":
      _getAllInterfaces = requireGetallinterfaces_unix();
      break;
    default:
      console.warn("node-macaddress: Unknown os.platform(), defaulting to 'unix'.");
      _getAllInterfaces = requireGetallinterfaces_unix();
      break;
  }
  getallinterfaces = _getAllInterfaces;
  return getallinterfaces;
}
var networkinterfaces;
var hasRequiredNetworkinterfaces;
function requireNetworkinterfaces() {
  if (hasRequiredNetworkinterfaces) return networkinterfaces;
  hasRequiredNetworkinterfaces = 1;
  var os = require$$0;
  networkinterfaces = function() {
    var allAddresses = {};
    try {
      var ifaces = os.networkInterfaces();
    } catch (e) {
      if (e.syscall === "uv_interface_addresses") {
        return allAddresses;
      } else {
        throw e;
      }
    }
    Object.keys(ifaces).forEach(function(iface) {
      var addresses = {};
      var hasAddresses = false;
      ifaces[iface].forEach(function(address) {
        if (!address.internal) {
          var family = typeof address.family === "number" ? "ipv" + address.family : (address.family || "").toLowerCase();
          addresses[family] = address.address;
          hasAddresses = true;
          if (address.mac && address.mac !== "00:00:00:00:00:00") {
            addresses.mac = address.mac;
          }
        }
      });
      if (hasAddresses) {
        allAddresses[iface] = addresses;
      }
    });
    return allAddresses;
  };
  return networkinterfaces;
}
var macaddress;
var hasRequiredMacaddress;
function requireMacaddress() {
  if (hasRequiredMacaddress) return macaddress;
  hasRequiredMacaddress = 1;
  var util2 = requireUtil();
  var lib = {};
  lib.getMacAddress = requireGetmacaddress();
  lib.getAllInterfaces = requireGetallinterfaces();
  lib.networkInterfaces = requireNetworkinterfaces();
  var goodIfaces = new RegExp("^((en|eth)[0-9]+|ethernet)$", "i");
  var badIfaces = new RegExp("^(vboxnet[0-9]+)$", "i");
  lib.one = function() {
    var iface = null;
    var callback = null;
    if (arguments.length >= 1) {
      if (typeof arguments[0] === "function") {
        callback = arguments[0];
      } else if (typeof arguments[0] === "string") {
        iface = arguments[0];
      }
      if (arguments.length >= 2) {
        if (typeof arguments[1] === "function") {
          callback = arguments[1];
        }
      }
    }
    if (!callback) {
      return util2.promisify(function(callback2) {
        lib.one(iface, callback2);
      });
    }
    if (iface) {
      lib.getMacAddress(iface, callback);
      return;
    }
    var ifaces = lib.networkInterfaces();
    var addresses = {};
    var best = [];
    var args = [];
    Object.keys(ifaces).forEach(function(name) {
      args.push(name);
      var score = 0;
      var iface2 = ifaces[name];
      if (typeof iface2.mac === "string" && iface2.mac !== "00:00:00:00:00:00") {
        addresses[name] = iface2.mac;
        if (iface2.ipv4) {
          score += 1;
        }
        if (iface2.ipv6) {
          score += 1;
        }
        if (goodIfaces.test(name)) {
          score += 2;
        }
        if (badIfaces.test(name)) {
          score -= 3;
        }
        best.push({
          name,
          score,
          mac: iface2.mac
        });
      }
    });
    if (best.length > 0) {
      best.sort(function(left, right) {
        var comparison = right.score - left.score;
        if (comparison !== 0) {
          return comparison;
        }
        if (left.name < right.name) {
          return -1;
        }
        if (left.name > right.name) {
          return 1;
        }
        return 0;
      });
      util2.nextTick(callback.bind(null, null, best[0].mac));
      return;
    }
    args.push(lib.getAllInterfaces);
    var getMacAddress = function(d, cb) {
      if (addresses[d]) {
        cb(null, addresses[d]);
        return;
      }
      lib.getMacAddress(d, cb);
    };
    util2.iterate(args, getMacAddress, callback);
  };
  lib.all = function(callback) {
    if (typeof callback !== "function") {
      return util2.promisify(lib.all);
    }
    var ifaces = lib.networkInterfaces();
    var resolve = {};
    Object.keys(ifaces).forEach(function(iface) {
      if (!ifaces[iface].mac) {
        resolve[iface] = lib.getMacAddress.bind(null, iface);
      }
    });
    if (Object.keys(resolve).length === 0) {
      if (typeof callback === "function") {
        util2.nextTick(callback.bind(null, null, ifaces));
      }
      return ifaces;
    }
    util2.parallel(resolve, function(err, result) {
      Object.keys(result).forEach(function(iface) {
        ifaces[iface].mac = result[iface];
      });
      if (typeof callback === "function") {
        callback(null, ifaces);
      }
    });
    return null;
  };
  macaddress = lib;
  return macaddress;
}
var crypto$3 = crypto$6;
var invalidNamespace = "options.namespace must be a string or a Buffer containing a valid UUID, or a UUID object";
var invalidName = "options.name must be either a string or a Buffer";
var moreThan10000 = "can not generate more than 10000 UUIDs per second";
var randomHost = crypto$3.randomBytes(16);
randomHost[0] = randomHost[0] | 1;
var seed = crypto$3.randomBytes(2);
var clockSeq = (seed[0] | seed[1] << 8) & 16383;
var lastMTime = 0;
var lastNTime = 0;
var hex2byte = {};
var byte2hex = [];
for (var i = 0; i < 256; i++) {
  var hex = (i + 256).toString(16).substr(1);
  hex2byte[hex] = i;
  byte2hex[i] = hex;
}
var newBufferFromSize;
var newBufferFromBuffer;
if (Buffer.allocUnsafe) {
  newBufferFromSize = function newBufferFromSize2(size) {
    return Buffer.allocUnsafe(size);
  };
  newBufferFromBuffer = function newBufferFromBuffer2(buf) {
    return Buffer.from(buf);
  };
} else {
  newBufferFromSize = function(size) {
    return new Buffer(size);
  };
  newBufferFromBuffer = function(buf) {
    return new Buffer(buf);
  };
}
function parseMacAddress(address) {
  var buffer = newBufferFromSize(6);
  buffer[0] = hex2byte[address[0] + address[1]];
  buffer[1] = hex2byte[address[3] + address[4]];
  buffer[2] = hex2byte[address[6] + address[7]];
  buffer[3] = hex2byte[address[9] + address[10]];
  buffer[4] = hex2byte[address[12] + address[13]];
  buffer[5] = hex2byte[address[15] + address[16]];
  return buffer;
}
var macAddress = randomHost;
var macAddressLoaded = false;
function loadMacAddress() {
  requireMacaddress().one(function(err, result) {
    if (!err) {
      macAddress = parseMacAddress(result);
    }
    macAddressLoaded = true;
  });
}
var UUID$1 = function(uuid) {
  var check2 = UUID$1.check(uuid);
  if (!check2) {
    throw "not a UUID";
  }
  this.version = check2.version;
  this.variant = check2.variant;
  this[check2.format] = uuid;
};
UUID$1.prototype.toString = function() {
  if (!this.ascii) {
    this.ascii = UUID$1.stringify(this.binary);
  }
  return this.ascii;
};
UUID$1.prototype.toBuffer = function() {
  if (!this.binary) {
    this.binary = UUID$1.parse(this.ascii);
  }
  return newBufferFromBuffer(this.binary);
};
UUID$1.prototype.inspect = function() {
  return "UUID v" + this.version + " " + this.toString();
};
function error(message, callback) {
  if (callback) {
    callback(message, null);
  } else {
    throw new Error(message);
  }
}
function parse$9(string) {
  var buffer = newBufferFromSize(16);
  var j = 0;
  for (var i = 0; i < 16; i++) {
    buffer[i] = hex2byte[string[j++] + string[j++]];
    if (i === 3 || i === 5 || i === 7 || i === 9) {
      j += 1;
    }
  }
  return buffer;
}
function getVariant(bits) {
  switch (bits) {
    case 0:
    case 1:
    case 3:
      return "ncs";
    case 4:
    case 5:
      return "rfc4122";
    case 6:
      return "microsoft";
    default:
      return "future";
  }
}
function check(uuid, offset) {
  if (typeof uuid === "string") {
    uuid = uuid.toLowerCase();
    if (!/^[a-f0-9]{8}(\-[a-f0-9]{4}){3}\-([a-f0-9]{12})$/.test(uuid)) {
      return false;
    }
    if (uuid === "00000000-0000-0000-0000-000000000000") {
      return { version: void 0, variant: "nil", format: "ascii" };
    }
    return {
      version: (hex2byte[uuid[14] + uuid[15]] & 240) >> 4,
      variant: getVariant((hex2byte[uuid[19] + uuid[20]] & 224) >> 5),
      format: "ascii"
    };
  }
  if (uuid instanceof Buffer) {
    offset = offset || 0;
    if (uuid.length < offset + 16) {
      return false;
    }
    for (var i = 0; i < 16; i++) {
      if (uuid[offset + i] !== 0) {
        break;
      }
    }
    if (i === 16) {
      return { version: void 0, variant: "nil", format: "binary" };
    }
    return {
      version: (uuid[offset + 6] & 240) >> 4,
      variant: getVariant((uuid[offset + 8] & 224) >> 5),
      format: "binary"
    };
  }
}
function uuidTimeBased(nodeId, options, callback) {
  var mTime = Date.now();
  var nTime = lastNTime + 1;
  var delta = mTime - lastMTime + (nTime - lastNTime) / 1e4;
  if (delta < 0) {
    clockSeq = clockSeq + 1 & 16383;
    nTime = 0;
  } else if (mTime > lastMTime) {
    nTime = 0;
  } else if (nTime >= 1e4) {
    return moreThan10000;
  }
  lastMTime = mTime;
  lastNTime = nTime;
  mTime += 122192928e5;
  var buffer = newBufferFromSize(16);
  var myClockSeq = options.clockSeq === void 0 ? clockSeq : options.clockSeq & 16383;
  var timeLow = ((mTime & 268435455) * 1e4 + nTime) % 4294967296;
  var timeHigh = mTime / 4294967296 * 1e4 & 268435455;
  buffer[0] = timeLow >>> 24 & 255;
  buffer[1] = timeLow >>> 16 & 255;
  buffer[2] = timeLow >>> 8 & 255;
  buffer[3] = timeLow & 255;
  buffer[4] = timeHigh >>> 8 & 255;
  buffer[5] = timeHigh & 255;
  buffer[6] = timeHigh >>> 24 & 15 | 16;
  buffer[7] = timeHigh >>> 16 & 63 | 128;
  buffer[8] = myClockSeq >>> 8;
  buffer[9] = myClockSeq & 255;
  var result;
  switch (options.encoding && options.encoding[0]) {
    case "b":
    case "B":
      buffer[10] = nodeId[0];
      buffer[11] = nodeId[1];
      buffer[12] = nodeId[2];
      buffer[13] = nodeId[3];
      buffer[14] = nodeId[4];
      buffer[15] = nodeId[5];
      result = buffer;
      break;
    case "o":
    case "U":
      buffer[10] = nodeId[0];
      buffer[11] = nodeId[1];
      buffer[12] = nodeId[2];
      buffer[13] = nodeId[3];
      buffer[14] = nodeId[4];
      buffer[15] = nodeId[5];
      result = new UUID$1(buffer);
      break;
    default:
      result = byte2hex[buffer[0]] + byte2hex[buffer[1]] + byte2hex[buffer[2]] + byte2hex[buffer[3]] + "-" + byte2hex[buffer[4]] + byte2hex[buffer[5]] + "-" + byte2hex[buffer[6]] + byte2hex[buffer[7]] + "-" + byte2hex[buffer[8]] + byte2hex[buffer[9]] + "-" + byte2hex[nodeId[0]] + byte2hex[nodeId[1]] + byte2hex[nodeId[2]] + byte2hex[nodeId[3]] + byte2hex[nodeId[4]] + byte2hex[nodeId[5]];
      break;
  }
  if (callback) {
    setImmediate(function() {
      callback(null, result);
    });
  }
  return result;
}
function uuidNamed(hashFunc, version2, arg1, arg2) {
  var options = arg1 || {};
  var callback = typeof arg1 === "function" ? arg1 : arg2;
  var namespace = options.namespace;
  var name = options.name;
  var hash = crypto$3.createHash(hashFunc);
  if (typeof namespace === "string") {
    if (!check(namespace)) {
      return error(invalidNamespace, callback);
    }
    namespace = parse$9(namespace);
  } else if (namespace instanceof UUID$1) {
    namespace = namespace.toBuffer();
  } else if (!(namespace instanceof Buffer) || namespace.length !== 16) {
    return error(invalidNamespace, callback);
  }
  var nameIsNotAString = typeof name !== "string";
  if (nameIsNotAString && !(name instanceof Buffer)) {
    return error(invalidName, callback);
  }
  hash.update(namespace);
  hash.update(options.name, nameIsNotAString ? "binary" : "utf8");
  var buffer = hash.digest();
  var result;
  switch (options.encoding && options.encoding[0]) {
    case "b":
    case "B":
      buffer[6] = buffer[6] & 15 | version2;
      buffer[8] = buffer[8] & 63 | 128;
      result = buffer;
      break;
    case "o":
    case "U":
      buffer[6] = buffer[6] & 15 | version2;
      buffer[8] = buffer[8] & 63 | 128;
      result = new UUID$1(buffer);
      break;
    default:
      result = byte2hex[buffer[0]] + byte2hex[buffer[1]] + byte2hex[buffer[2]] + byte2hex[buffer[3]] + "-" + byte2hex[buffer[4]] + byte2hex[buffer[5]] + "-" + byte2hex[buffer[6] & 15 | version2] + byte2hex[buffer[7]] + "-" + byte2hex[buffer[8] & 63 | 128] + byte2hex[buffer[9]] + "-" + byte2hex[buffer[10]] + byte2hex[buffer[11]] + byte2hex[buffer[12]] + byte2hex[buffer[13]] + byte2hex[buffer[14]] + byte2hex[buffer[15]];
      break;
  }
  if (callback) {
    setImmediate(function() {
      callback(null, result);
    });
  } else {
    return result;
  }
}
function uuidRandom(arg1, arg2) {
  var options = arg1 || {};
  var callback = typeof arg1 === "function" ? arg1 : arg2;
  var buffer = crypto$3.randomBytes(16);
  buffer[6] = buffer[6] & 15 | 64;
  buffer[8] = buffer[8] & 63 | 128;
  var result;
  switch (options.encoding && options.encoding[0]) {
    case "b":
    case "B":
      result = buffer;
      break;
    case "o":
    case "U":
      result = new UUID$1(buffer);
      break;
    default:
      result = byte2hex[buffer[0]] + byte2hex[buffer[1]] + byte2hex[buffer[2]] + byte2hex[buffer[3]] + "-" + byte2hex[buffer[4]] + byte2hex[buffer[5]] + "-" + byte2hex[buffer[6] & 15 | 64] + byte2hex[buffer[7]] + "-" + byte2hex[buffer[8] & 63 | 128] + byte2hex[buffer[9]] + "-" + byte2hex[buffer[10]] + byte2hex[buffer[11]] + byte2hex[buffer[12]] + byte2hex[buffer[13]] + byte2hex[buffer[14]] + byte2hex[buffer[15]];
      break;
  }
  if (callback) {
    setImmediate(function() {
      callback(null, result);
    });
  } else {
    return result;
  }
}
function uuidRandomFast() {
  var r1 = Math.random() * 4294967296;
  var r2 = Math.random() * 4294967296;
  var r3 = Math.random() * 4294967296;
  var r4 = Math.random() * 4294967296;
  return byte2hex[r1 & 255] + byte2hex[r1 >>> 8 & 255] + byte2hex[r1 >>> 16 & 255] + byte2hex[r1 >>> 24 & 255] + "-" + byte2hex[r2 & 255] + byte2hex[r2 >>> 8 & 255] + "-" + byte2hex[r2 >>> 16 & 15 | 64] + byte2hex[r2 >>> 24 & 255] + "-" + byte2hex[r3 & 63 | 128] + byte2hex[r3 >>> 8 & 255] + "-" + byte2hex[r3 >>> 16 & 255] + byte2hex[r3 >>> 24 & 255] + byte2hex[r4 & 255] + byte2hex[r4 >>> 8 & 255] + byte2hex[r4 >>> 16 & 255] + byte2hex[r4 >>> 24 & 255];
}
function stringify$1(buffer) {
  return byte2hex[buffer[0]] + byte2hex[buffer[1]] + byte2hex[buffer[2]] + byte2hex[buffer[3]] + "-" + byte2hex[buffer[4]] + byte2hex[buffer[5]] + "-" + byte2hex[buffer[6]] + byte2hex[buffer[7]] + "-" + byte2hex[buffer[8]] + byte2hex[buffer[9]] + "-" + byte2hex[buffer[10]] + byte2hex[buffer[11]] + byte2hex[buffer[12]] + byte2hex[buffer[13]] + byte2hex[buffer[14]] + byte2hex[buffer[15]];
}
UUID$1.stringify = stringify$1;
UUID$1.parse = parse$9;
UUID$1.check = check;
UUID$1.nil = new UUID$1("00000000-0000-0000-0000-000000000000");
UUID$1.namespace = {
  dns: new UUID$1("6ba7b810-9dad-11d1-80b4-00c04fd430c8"),
  url: new UUID$1("6ba7b811-9dad-11d1-80b4-00c04fd430c8"),
  oid: new UUID$1("6ba7b812-9dad-11d1-80b4-00c04fd430c8"),
  x500: new UUID$1("6ba7b814-9dad-11d1-80b4-00c04fd430c8")
};
UUID$1.v1 = function v1(arg1, arg2) {
  var options = arg1 || {};
  var callback = typeof arg1 === "function" ? arg1 : arg2;
  var nodeId = options.mac;
  if (nodeId === void 0) {
    if (!macAddressLoaded) {
      loadMacAddress();
    }
    if (!macAddressLoaded && callback) {
      setImmediate(function() {
        UUID$1.v1(options, callback);
      });
      return;
    }
    return uuidTimeBased(macAddress, options, callback);
  }
  if (nodeId === false) {
    return uuidTimeBased(randomHost, options, callback);
  }
  return uuidTimeBased(parseMacAddress(nodeId), options, callback);
};
UUID$1.v4 = uuidRandom;
UUID$1.v4fast = uuidRandomFast;
UUID$1.v3 = function(options, callback) {
  return uuidNamed("md5", 48, options, callback);
};
UUID$1.v5 = function(options, callback) {
  return uuidNamed("sha1", 80, options, callback);
};
var uuid1345 = UUID$1;
const crypto$2 = crypto$6;
const { live, xnet } = dist;
const debug$7 = srcExports("prismarine-auth");
const { SmartBuffer: SmartBuffer2 } = smartbuffer;
const { Endpoints: Endpoints$4, xboxLiveErrors } = Constants;
const { checkStatus: checkStatus$1, createHash: createHash$1 } = Util;
const UUID = uuid1345;
const nextUUID = () => UUID.v3({ namespace: "6ba7b811-9dad-11d1-80b4-00c04fd430c8", name: Date.now().toString() });
const checkIfValid = (expires) => {
  const remainingMs = new Date(expires) - Date.now();
  const valid2 = remainingMs > 1e3;
  return valid2;
};
let XboxTokenManager$1 = class XboxTokenManager {
  constructor(ecKey, cache) {
    this.key = ecKey;
    this.jwk = { ...ecKey.publicKey.export({ format: "jwk" }), alg: "ES256", use: "sig" };
    this.cache = cache;
    this.headers = { "Cache-Control": "no-store, must-revalidate, no-cache", "x-xbl-contract-version": 1 };
  }
  async setCachedToken(data) {
    await this.cache.setCachedPartial(data);
  }
  async getCachedTokens(relyingParty) {
    const cachedTokens = await this.cache.getCached();
    const xstsHash = createHash$1(relyingParty);
    const result = {};
    for (const token of ["userToken", "titleToken", "deviceToken"]) {
      const cached = cachedTokens[token];
      result[token] = cached && checkIfValid(cached.NotAfter) ? { valid: true, token: cached.Token, data: cached } : { valid: false };
    }
    result.xstsToken = cachedTokens[xstsHash] && checkIfValid(cachedTokens[xstsHash].expiresOn) ? { valid: true, data: cachedTokens[xstsHash] } : { valid: false };
    return result;
  }
  checkTokenError(errorCode, response) {
    if (errorCode in xboxLiveErrors) throw new Error(xboxLiveErrors[errorCode]);
    else throw new Error(`Xbox Live authentication failed to obtain a XSTS token. XErr: ${errorCode}
${JSON.stringify(response)}`);
  }
  async getUserToken(accessToken, azure) {
    debug$7("[xbl] obtaining xbox token with ms token", accessToken);
    const preamble = azure ? "d=" : "t=";
    const payload = {
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT",
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: `${preamble}${accessToken}`
      }
    };
    const body = JSON.stringify(payload);
    const signature = this.sign(Endpoints$4.xbox.userAuth, "", body).toString("base64");
    const headers = { ...this.headers, signature, "Content-Type": "application/json", accept: "application/json", "x-xbl-contract-version": "2" };
    const ret = await fetch(Endpoints$4.xbox.userAuth, { method: "post", headers, body }).then(checkStatus$1);
    await this.setCachedToken({ userToken: ret });
    debug$7("[xbl] user token:", ret);
    return ret.Token;
  }
  // Make signature for the data being sent to server with our private key; server is sent our public key in plaintext
  sign(url, authorizationToken, payload) {
    const windowsTimestamp = (BigInt(Date.now() / 1e3 | 0) + 11644473600n) * 10000000n;
    const pathAndQuery = new URL(url).pathname;
    const allocSize = (
      /* sig */
      5 + /* ts */
      9 + /* POST */
      5 + pathAndQuery.length + 1 + authorizationToken.length + 1 + payload.length + 1
    );
    const buf = SmartBuffer2.fromSize(allocSize);
    buf.writeInt32BE(1);
    buf.writeUInt8(0);
    buf.writeBigUInt64BE(windowsTimestamp);
    buf.writeUInt8(0);
    buf.writeStringNT("POST");
    buf.writeStringNT(pathAndQuery);
    buf.writeStringNT(authorizationToken);
    buf.writeStringNT(payload);
    const signature = crypto$2.sign("SHA256", buf.toBuffer(), { key: this.key.privateKey, dsaEncoding: "ieee-p1363" });
    const header = SmartBuffer2.fromSize(signature.length + 12);
    header.writeInt32BE(1);
    header.writeBigUInt64BE(windowsTimestamp);
    header.writeBuffer(signature);
    return header.toBuffer();
  }
  async doReplayAuth(email, password, options = {}) {
    try {
      const logUserResponse = await live.authenticateWithCredentials({ email, password });
      const xblUserToken = await xnet.exchangeRpsTicketForUserToken(logUserResponse.access_token);
      await this.setCachedToken({ userToken: xblUserToken });
      debug$7("[xbl] user token:", xblUserToken);
      const xsts = await this.getXSTSToken({ userToken: xblUserToken.Token }, options);
      return xsts;
    } catch (error2) {
      debug$7("Authentication using a password has failed.");
      debug$7(error2);
      throw error2;
    }
  }
  async doSisuAuth(accessToken, deviceToken, options = {}) {
    const payload = {
      AccessToken: "t=" + accessToken,
      AppId: options.authTitle,
      DeviceToken: deviceToken,
      Sandbox: "RETAIL",
      UseModernGamertag: true,
      SiteName: "user.auth.xboxlive.com",
      RelyingParty: options.relyingParty,
      ProofKey: this.jwk
    };
    const body = JSON.stringify(payload);
    const signature = this.sign(Endpoints$4.xbox.sisuAuthorize, "", body).toString("base64");
    const headers = { Signature: signature };
    const req = await fetch(Endpoints$4.xbox.sisuAuthorize, { method: "post", headers, body });
    const ret = await req.json();
    if (!req.ok) this.checkTokenError(parseInt(req.headers.get("x-err")), ret);
    debug$7("Sisu Auth Response", ret);
    const xsts = {
      userXUID: ret.AuthorizationToken.DisplayClaims.xui[0].xid || null,
      userHash: ret.AuthorizationToken.DisplayClaims.xui[0].uhs,
      XSTSToken: ret.AuthorizationToken.Token,
      expiresOn: ret.AuthorizationToken.NotAfter
    };
    await this.setCachedToken({ userToken: ret.UserToken, titleToken: ret.TitleToken, [createHash$1(options.relyingParty)]: xsts });
    debug$7("[xbl] xsts", xsts);
    return xsts;
  }
  async getXSTSToken(tokens, options = {}) {
    debug$7("[xbl] obtaining xsts token", { userToken: tokens.userToken, deviceToken: tokens.deviceToken, titleToken: tokens.titleToken });
    const payload = {
      RelyingParty: options.relyingParty,
      TokenType: "JWT",
      Properties: {
        UserTokens: [tokens.userToken],
        DeviceToken: tokens.deviceToken,
        TitleToken: tokens.titleToken,
        OptionalDisplayClaims: options.optionalDisplayClaims,
        ProofKey: this.jwk,
        SandboxId: "RETAIL"
      }
    };
    const body = JSON.stringify(payload);
    const signature = this.sign(Endpoints$4.xbox.xstsAuthorize, "", body).toString("base64");
    const headers = { ...this.headers, Signature: signature };
    const req = await fetch(Endpoints$4.xbox.xstsAuthorize, { method: "post", headers, body });
    const ret = await req.json();
    if (!req.ok) this.checkTokenError(ret.XErr, ret);
    const xsts = {
      userXUID: ret.DisplayClaims.xui[0].xid || null,
      userHash: ret.DisplayClaims.xui[0].uhs,
      XSTSToken: ret.Token,
      expiresOn: ret.NotAfter
    };
    await this.setCachedToken({ [createHash$1(options.relyingParty)]: xsts });
    debug$7("[xbl] xsts", xsts);
    return xsts;
  }
  /**
   * Requests an Xbox Live-related device token that uniquely links the XToken (aka xsts token)
   * @param {{ DeviceType, Version }} asDevice The hardware type and version to auth as, for example Android or Nintendo
   */
  async getDeviceToken(asDevice) {
    const payload = {
      Properties: {
        AuthMethod: "ProofOfPossession",
        Id: `{${nextUUID()}}`,
        DeviceType: asDevice.deviceType || "Nintendo",
        SerialNumber: `{${nextUUID()}}`,
        Version: asDevice.deviceVersion || "0.0.0",
        ProofKey: this.jwk
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT"
    };
    const body = JSON.stringify(payload);
    const signature = this.sign(Endpoints$4.xbox.deviceAuth, "", body).toString("base64");
    const headers = { ...this.headers, Signature: signature };
    const ret = await fetch(Endpoints$4.xbox.deviceAuth, { method: "post", headers, body }).then(checkStatus$1);
    await this.setCachedToken({ deviceToken: ret });
    debug$7("Xbox Device Token", ret);
    return ret.Token;
  }
  // This *only* works with live.com auth
  async getTitleToken(msaAccessToken, deviceToken) {
    const payload = {
      Properties: {
        AuthMethod: "RPS",
        DeviceToken: deviceToken,
        RpsTicket: "t=" + msaAccessToken,
        SiteName: "user.auth.xboxlive.com",
        ProofKey: this.jwk
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT"
    };
    const body = JSON.stringify(payload);
    const signature = this.sign(Endpoints$4.xbox.titleAuth, "", body).toString("base64");
    const headers = { ...this.headers, Signature: signature };
    const ret = await fetch(Endpoints$4.xbox.titleAuth, { method: "post", headers, body }).then(checkStatus$1);
    await this.setCachedToken({ titleToken: ret });
    debug$7("Xbox Title Token", ret);
    return ret.Token;
  }
};
var XboxTokenManager_1 = XboxTokenManager$1;
var msalNode = {};
const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto$6.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function validate$1(uuid) {
  return typeof uuid === "string" && REGEX.test(uuid);
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).substr(1));
}
function stringify(arr, offset = 0) {
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate$1(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
let _nodeId;
let _clockseq;
let _lastMSecs = 0;
let _lastNSecs = 0;
function v12(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node2 = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node2 == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node2 == null) {
      node2 = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node2[n];
  }
  return buf || stringify(b);
}
function parse$8(uuid) {
  if (!validate$1(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
const DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const URL$1 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse$8(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return stringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL$1;
  return generateUUID;
}
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto$6.createHash("md5").update(bytes).digest();
}
const v3 = v35("v3", 48, md5);
function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify(rnds);
}
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto$6.createHash("sha1").update(bytes).digest();
}
const v5 = v35("v5", 80, sha1);
const nil = "00000000-0000-0000-0000-000000000000";
function version(uuid) {
  if (!validate$1(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.substr(14, 1), 16);
}
const esmNode = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NIL: nil,
  parse: parse$8,
  stringify,
  v1: v12,
  v3,
  v4,
  v5,
  validate: validate$1,
  version
}, Symbol.toStringTag, { value: "Module" }));
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(esmNode);
var jws$3 = {};
var safeBuffer = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
(function(module, exports) {
  var buffer = require$$0$2;
  var Buffer2 = buffer.Buffer;
  function copyProps(src2, dst) {
    for (var key in src2) {
      dst[key] = src2[key];
    }
  }
  if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer2(arg, encodingOrOffset, length);
  }
  SafeBuffer.prototype = Object.create(Buffer2.prototype);
  copyProps(Buffer2, SafeBuffer);
  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer2(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer2(size);
    if (fill !== void 0) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer2(size);
  };
  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer.SlowBuffer(size);
  };
})(safeBuffer, safeBuffer.exports);
var safeBufferExports = safeBuffer.exports;
var Buffer$6 = safeBufferExports.Buffer;
var Stream$2 = require$$3;
var util$3 = require$$5;
function DataStream$2(data) {
  this.buffer = null;
  this.writable = true;
  this.readable = true;
  if (!data) {
    this.buffer = Buffer$6.alloc(0);
    return this;
  }
  if (typeof data.pipe === "function") {
    this.buffer = Buffer$6.alloc(0);
    data.pipe(this);
    return this;
  }
  if (data.length || typeof data === "object") {
    this.buffer = data;
    this.writable = false;
    process.nextTick((function() {
      this.emit("end", data);
      this.readable = false;
      this.emit("close");
    }).bind(this));
    return this;
  }
  throw new TypeError("Unexpected data type (" + typeof data + ")");
}
util$3.inherits(DataStream$2, Stream$2);
DataStream$2.prototype.write = function write(data) {
  this.buffer = Buffer$6.concat([this.buffer, Buffer$6.from(data)]);
  this.emit("data", data);
};
DataStream$2.prototype.end = function end(data) {
  if (data)
    this.write(data);
  this.emit("end", data);
  this.emit("close");
  this.writable = false;
  this.readable = false;
};
var dataStream = DataStream$2;
function getParamSize(keySize) {
  var result = (keySize / 8 | 0) + (keySize % 8 === 0 ? 0 : 1);
  return result;
}
var paramBytesForAlg = {
  ES256: getParamSize(256),
  ES384: getParamSize(384),
  ES512: getParamSize(521)
};
function getParamBytesForAlg$1(alg) {
  var paramBytes = paramBytesForAlg[alg];
  if (paramBytes) {
    return paramBytes;
  }
  throw new Error('Unknown algorithm "' + alg + '"');
}
var paramBytesForAlg_1 = getParamBytesForAlg$1;
var Buffer$5 = safeBufferExports.Buffer;
var getParamBytesForAlg = paramBytesForAlg_1;
var MAX_OCTET = 128, CLASS_UNIVERSAL = 0, PRIMITIVE_BIT = 32, TAG_SEQ = 16, TAG_INT = 2, ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | CLASS_UNIVERSAL << 6, ENCODED_TAG_INT = TAG_INT | CLASS_UNIVERSAL << 6;
function base64Url(base64) {
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function signatureAsBuffer(signature) {
  if (Buffer$5.isBuffer(signature)) {
    return signature;
  } else if ("string" === typeof signature) {
    return Buffer$5.from(signature, "base64");
  }
  throw new TypeError("ECDSA signature must be a Base64 string or a Buffer");
}
function derToJose(signature, alg) {
  signature = signatureAsBuffer(signature);
  var paramBytes = getParamBytesForAlg(alg);
  var maxEncodedParamLength = paramBytes + 1;
  var inputLength = signature.length;
  var offset = 0;
  if (signature[offset++] !== ENCODED_TAG_SEQ) {
    throw new Error('Could not find expected "seq"');
  }
  var seqLength = signature[offset++];
  if (seqLength === (MAX_OCTET | 1)) {
    seqLength = signature[offset++];
  }
  if (inputLength - offset < seqLength) {
    throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
  }
  if (signature[offset++] !== ENCODED_TAG_INT) {
    throw new Error('Could not find expected "int" for "r"');
  }
  var rLength = signature[offset++];
  if (inputLength - offset - 2 < rLength) {
    throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
  }
  if (maxEncodedParamLength < rLength) {
    throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
  }
  var rOffset = offset;
  offset += rLength;
  if (signature[offset++] !== ENCODED_TAG_INT) {
    throw new Error('Could not find expected "int" for "s"');
  }
  var sLength = signature[offset++];
  if (inputLength - offset !== sLength) {
    throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
  }
  if (maxEncodedParamLength < sLength) {
    throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
  }
  var sOffset = offset;
  offset += sLength;
  if (offset !== inputLength) {
    throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
  }
  var rPadding = paramBytes - rLength, sPadding = paramBytes - sLength;
  var dst = Buffer$5.allocUnsafe(rPadding + rLength + sPadding + sLength);
  for (offset = 0; offset < rPadding; ++offset) {
    dst[offset] = 0;
  }
  signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);
  offset = paramBytes;
  for (var o = offset; offset < o + sPadding; ++offset) {
    dst[offset] = 0;
  }
  signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);
  dst = dst.toString("base64");
  dst = base64Url(dst);
  return dst;
}
function countPadding(buf, start, stop) {
  var padding = 0;
  while (start + padding < stop && buf[start + padding] === 0) {
    ++padding;
  }
  var needsSign = buf[start + padding] >= MAX_OCTET;
  if (needsSign) {
    --padding;
  }
  return padding;
}
function joseToDer(signature, alg) {
  signature = signatureAsBuffer(signature);
  var paramBytes = getParamBytesForAlg(alg);
  var signatureBytes = signature.length;
  if (signatureBytes !== paramBytes * 2) {
    throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
  }
  var rPadding = countPadding(signature, 0, paramBytes);
  var sPadding = countPadding(signature, paramBytes, signature.length);
  var rLength = paramBytes - rPadding;
  var sLength = paramBytes - sPadding;
  var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;
  var shortLength = rsBytes < MAX_OCTET;
  var dst = Buffer$5.allocUnsafe((shortLength ? 2 : 3) + rsBytes);
  var offset = 0;
  dst[offset++] = ENCODED_TAG_SEQ;
  if (shortLength) {
    dst[offset++] = rsBytes;
  } else {
    dst[offset++] = MAX_OCTET | 1;
    dst[offset++] = rsBytes & 255;
  }
  dst[offset++] = ENCODED_TAG_INT;
  dst[offset++] = rLength;
  if (rPadding < 0) {
    dst[offset++] = 0;
    offset += signature.copy(dst, offset, 0, paramBytes);
  } else {
    offset += signature.copy(dst, offset, rPadding, paramBytes);
  }
  dst[offset++] = ENCODED_TAG_INT;
  dst[offset++] = sLength;
  if (sPadding < 0) {
    dst[offset++] = 0;
    signature.copy(dst, offset, paramBytes);
  } else {
    signature.copy(dst, offset, paramBytes + sPadding);
  }
  return dst;
}
var ecdsaSigFormatter = {
  derToJose,
  joseToDer
};
var bufferEqualConstantTime;
var hasRequiredBufferEqualConstantTime;
function requireBufferEqualConstantTime() {
  if (hasRequiredBufferEqualConstantTime) return bufferEqualConstantTime;
  hasRequiredBufferEqualConstantTime = 1;
  var Buffer2 = require$$0$2.Buffer;
  var SlowBuffer = require$$0$2.SlowBuffer;
  bufferEqualConstantTime = bufferEq;
  function bufferEq(a, b) {
    if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    var c = 0;
    for (var i = 0; i < a.length; i++) {
      c |= a[i] ^ b[i];
    }
    return c === 0;
  }
  bufferEq.install = function() {
    Buffer2.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
      return bufferEq(this, that);
    };
  };
  var origBufEqual = Buffer2.prototype.equal;
  var origSlowBufEqual = SlowBuffer.prototype.equal;
  bufferEq.restore = function() {
    Buffer2.prototype.equal = origBufEqual;
    SlowBuffer.prototype.equal = origSlowBufEqual;
  };
  return bufferEqualConstantTime;
}
var Buffer$4 = safeBufferExports.Buffer;
var crypto$1 = crypto$6;
var formatEcdsa = ecdsaSigFormatter;
var util$2 = require$$5;
var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
var MSG_INVALID_SECRET = "secret must be a string or buffer";
var MSG_INVALID_VERIFIER_KEY = "key must be a string or a buffer";
var MSG_INVALID_SIGNER_KEY = "key must be a string, a buffer or an object";
var supportsKeyObjects = typeof crypto$1.createPublicKey === "function";
if (supportsKeyObjects) {
  MSG_INVALID_VERIFIER_KEY += " or a KeyObject";
  MSG_INVALID_SECRET += "or a KeyObject";
}
function checkIsPublicKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }
  if (typeof key === "string") {
    return;
  }
  if (!supportsKeyObjects) {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }
  if (typeof key !== "object") {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }
  if (typeof key.type !== "string") {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }
  if (typeof key.asymmetricKeyType !== "string") {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }
  if (typeof key.export !== "function") {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }
}
function checkIsPrivateKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }
  if (typeof key === "string") {
    return;
  }
  if (typeof key === "object") {
    return;
  }
  throw typeError(MSG_INVALID_SIGNER_KEY);
}
function checkIsSecretKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }
  if (typeof key === "string") {
    return key;
  }
  if (!supportsKeyObjects) {
    throw typeError(MSG_INVALID_SECRET);
  }
  if (typeof key !== "object") {
    throw typeError(MSG_INVALID_SECRET);
  }
  if (key.type !== "secret") {
    throw typeError(MSG_INVALID_SECRET);
  }
  if (typeof key.export !== "function") {
    throw typeError(MSG_INVALID_SECRET);
  }
}
function fromBase64(base64) {
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function toBase64(base64url2) {
  base64url2 = base64url2.toString();
  var padding = 4 - base64url2.length % 4;
  if (padding !== 4) {
    for (var i = 0; i < padding; ++i) {
      base64url2 += "=";
    }
  }
  return base64url2.replace(/\-/g, "+").replace(/_/g, "/");
}
function typeError(template) {
  var args = [].slice.call(arguments, 1);
  var errMsg = util$2.format.bind(util$2, template).apply(null, args);
  return new TypeError(errMsg);
}
function bufferOrString(obj) {
  return Buffer$4.isBuffer(obj) || typeof obj === "string";
}
function normalizeInput(thing) {
  if (!bufferOrString(thing))
    thing = JSON.stringify(thing);
  return thing;
}
function createHmacSigner(bits) {
  return function sign3(thing, secret) {
    checkIsSecretKey(secret);
    thing = normalizeInput(thing);
    var hmac = crypto$1.createHmac("sha" + bits, secret);
    var sig = (hmac.update(thing), hmac.digest("base64"));
    return fromBase64(sig);
  };
}
var bufferEqual;
var timingSafeEqual = "timingSafeEqual" in crypto$1 ? function timingSafeEqual2(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  return crypto$1.timingSafeEqual(a, b);
} : function timingSafeEqual3(a, b) {
  if (!bufferEqual) {
    bufferEqual = requireBufferEqualConstantTime();
  }
  return bufferEqual(a, b);
};
function createHmacVerifier(bits) {
  return function verify3(thing, signature, secret) {
    var computedSig = createHmacSigner(bits)(thing, secret);
    return timingSafeEqual(Buffer$4.from(signature), Buffer$4.from(computedSig));
  };
}
function createKeySigner(bits) {
  return function sign3(thing, privateKey) {
    checkIsPrivateKey(privateKey);
    thing = normalizeInput(thing);
    var signer = crypto$1.createSign("RSA-SHA" + bits);
    var sig = (signer.update(thing), signer.sign(privateKey, "base64"));
    return fromBase64(sig);
  };
}
function createKeyVerifier(bits) {
  return function verify3(thing, signature, publicKey) {
    checkIsPublicKey(publicKey);
    thing = normalizeInput(thing);
    signature = toBase64(signature);
    var verifier = crypto$1.createVerify("RSA-SHA" + bits);
    verifier.update(thing);
    return verifier.verify(publicKey, signature, "base64");
  };
}
function createPSSKeySigner(bits) {
  return function sign3(thing, privateKey) {
    checkIsPrivateKey(privateKey);
    thing = normalizeInput(thing);
    var signer = crypto$1.createSign("RSA-SHA" + bits);
    var sig = (signer.update(thing), signer.sign({
      key: privateKey,
      padding: crypto$1.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto$1.constants.RSA_PSS_SALTLEN_DIGEST
    }, "base64"));
    return fromBase64(sig);
  };
}
function createPSSKeyVerifier(bits) {
  return function verify3(thing, signature, publicKey) {
    checkIsPublicKey(publicKey);
    thing = normalizeInput(thing);
    signature = toBase64(signature);
    var verifier = crypto$1.createVerify("RSA-SHA" + bits);
    verifier.update(thing);
    return verifier.verify({
      key: publicKey,
      padding: crypto$1.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto$1.constants.RSA_PSS_SALTLEN_DIGEST
    }, signature, "base64");
  };
}
function createECDSASigner(bits) {
  var inner = createKeySigner(bits);
  return function sign3() {
    var signature = inner.apply(null, arguments);
    signature = formatEcdsa.derToJose(signature, "ES" + bits);
    return signature;
  };
}
function createECDSAVerifer(bits) {
  var inner = createKeyVerifier(bits);
  return function verify3(thing, signature, publicKey) {
    signature = formatEcdsa.joseToDer(signature, "ES" + bits).toString("base64");
    var result = inner(thing, signature, publicKey);
    return result;
  };
}
function createNoneSigner() {
  return function sign3() {
    return "";
  };
}
function createNoneVerifier() {
  return function verify3(thing, signature) {
    return signature === "";
  };
}
var jwa$2 = function jwa(algorithm) {
  var signerFactories = {
    hs: createHmacSigner,
    rs: createKeySigner,
    ps: createPSSKeySigner,
    es: createECDSASigner,
    none: createNoneSigner
  };
  var verifierFactories = {
    hs: createHmacVerifier,
    rs: createKeyVerifier,
    ps: createPSSKeyVerifier,
    es: createECDSAVerifer,
    none: createNoneVerifier
  };
  var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/);
  if (!match)
    throw typeError(MSG_INVALID_ALGORITHM, algorithm);
  var algo = (match[1] || match[3]).toLowerCase();
  var bits = match[2];
  return {
    sign: signerFactories[algo](bits),
    verify: verifierFactories[algo](bits)
  };
};
var Buffer$3 = require$$0$2.Buffer;
var tostring = function toString(obj) {
  if (typeof obj === "string")
    return obj;
  if (typeof obj === "number" || Buffer$3.isBuffer(obj))
    return obj.toString();
  return JSON.stringify(obj);
};
var Buffer$2 = safeBufferExports.Buffer;
var DataStream$1 = dataStream;
var jwa$1 = jwa$2;
var Stream$1 = require$$3;
var toString$1 = tostring;
var util$1 = require$$5;
function base64url(string, encoding) {
  return Buffer$2.from(string, encoding).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function jwsSecuredInput(header, payload, encoding) {
  encoding = encoding || "utf8";
  var encodedHeader = base64url(toString$1(header), "binary");
  var encodedPayload = base64url(toString$1(payload), encoding);
  return util$1.format("%s.%s", encodedHeader, encodedPayload);
}
function jwsSign(opts) {
  var header = opts.header;
  var payload = opts.payload;
  var secretOrKey = opts.secret || opts.privateKey;
  var encoding = opts.encoding;
  var algo = jwa$1(header.alg);
  var securedInput = jwsSecuredInput(header, payload, encoding);
  var signature = algo.sign(securedInput, secretOrKey);
  return util$1.format("%s.%s", securedInput, signature);
}
function SignStream$1(opts) {
  var secret = opts.secret;
  secret = secret == null ? opts.privateKey : secret;
  secret = secret == null ? opts.key : secret;
  if (/^hs/i.test(opts.header.alg) === true && secret == null) {
    throw new TypeError("secret must be a string or buffer or a KeyObject");
  }
  var secretStream = new DataStream$1(secret);
  this.readable = true;
  this.header = opts.header;
  this.encoding = opts.encoding;
  this.secret = this.privateKey = this.key = secretStream;
  this.payload = new DataStream$1(opts.payload);
  this.secret.once("close", (function() {
    if (!this.payload.writable && this.readable)
      this.sign();
  }).bind(this));
  this.payload.once("close", (function() {
    if (!this.secret.writable && this.readable)
      this.sign();
  }).bind(this));
}
util$1.inherits(SignStream$1, Stream$1);
SignStream$1.prototype.sign = function sign() {
  try {
    var signature = jwsSign({
      header: this.header,
      payload: this.payload.buffer,
      secret: this.secret.buffer,
      encoding: this.encoding
    });
    this.emit("done", signature);
    this.emit("data", signature);
    this.emit("end");
    this.readable = false;
    return signature;
  } catch (e) {
    this.readable = false;
    this.emit("error", e);
    this.emit("close");
  }
};
SignStream$1.sign = jwsSign;
var signStream = SignStream$1;
var Buffer$1 = safeBufferExports.Buffer;
var DataStream = dataStream;
var jwa2 = jwa$2;
var Stream = require$$3;
var toString2 = tostring;
var util = require$$5;
var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
function isObject$3(thing) {
  return Object.prototype.toString.call(thing) === "[object Object]";
}
function safeJsonParse(thing) {
  if (isObject$3(thing))
    return thing;
  try {
    return JSON.parse(thing);
  } catch (e) {
    return void 0;
  }
}
function headerFromJWS(jwsSig) {
  var encodedHeader = jwsSig.split(".", 1)[0];
  return safeJsonParse(Buffer$1.from(encodedHeader, "base64").toString("binary"));
}
function securedInputFromJWS(jwsSig) {
  return jwsSig.split(".", 2).join(".");
}
function signatureFromJWS(jwsSig) {
  return jwsSig.split(".")[2];
}
function payloadFromJWS(jwsSig, encoding) {
  encoding = encoding || "utf8";
  var payload = jwsSig.split(".")[1];
  return Buffer$1.from(payload, "base64").toString(encoding);
}
function isValidJws(string) {
  return JWS_REGEX.test(string) && !!headerFromJWS(string);
}
function jwsVerify(jwsSig, algorithm, secretOrKey) {
  if (!algorithm) {
    var err = new Error("Missing algorithm parameter for jws.verify");
    err.code = "MISSING_ALGORITHM";
    throw err;
  }
  jwsSig = toString2(jwsSig);
  var signature = signatureFromJWS(jwsSig);
  var securedInput = securedInputFromJWS(jwsSig);
  var algo = jwa2(algorithm);
  return algo.verify(securedInput, signature, secretOrKey);
}
function jwsDecode(jwsSig, opts) {
  opts = opts || {};
  jwsSig = toString2(jwsSig);
  if (!isValidJws(jwsSig))
    return null;
  var header = headerFromJWS(jwsSig);
  if (!header)
    return null;
  var payload = payloadFromJWS(jwsSig);
  if (header.typ === "JWT" || opts.json)
    payload = JSON.parse(payload, opts.encoding);
  return {
    header,
    payload,
    signature: signatureFromJWS(jwsSig)
  };
}
function VerifyStream$1(opts) {
  opts = opts || {};
  var secretOrKey = opts.secret;
  secretOrKey = secretOrKey == null ? opts.publicKey : secretOrKey;
  secretOrKey = secretOrKey == null ? opts.key : secretOrKey;
  if (/^hs/i.test(opts.algorithm) === true && secretOrKey == null) {
    throw new TypeError("secret must be a string or buffer or a KeyObject");
  }
  var secretStream = new DataStream(secretOrKey);
  this.readable = true;
  this.algorithm = opts.algorithm;
  this.encoding = opts.encoding;
  this.secret = this.publicKey = this.key = secretStream;
  this.signature = new DataStream(opts.signature);
  this.secret.once("close", (function() {
    if (!this.signature.writable && this.readable)
      this.verify();
  }).bind(this));
  this.signature.once("close", (function() {
    if (!this.secret.writable && this.readable)
      this.verify();
  }).bind(this));
}
util.inherits(VerifyStream$1, Stream);
VerifyStream$1.prototype.verify = function verify() {
  try {
    var valid2 = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
    var obj = jwsDecode(this.signature.buffer, this.encoding);
    this.emit("done", valid2, obj);
    this.emit("data", valid2);
    this.emit("end");
    this.readable = false;
    return valid2;
  } catch (e) {
    this.readable = false;
    this.emit("error", e);
    this.emit("close");
  }
};
VerifyStream$1.decode = jwsDecode;
VerifyStream$1.isValid = isValidJws;
VerifyStream$1.verify = jwsVerify;
var verifyStream = VerifyStream$1;
var SignStream = signStream;
var VerifyStream = verifyStream;
var ALGORITHMS = [
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "PS256",
  "PS384",
  "PS512",
  "ES256",
  "ES384",
  "ES512"
];
jws$3.ALGORITHMS = ALGORITHMS;
jws$3.sign = SignStream.sign;
jws$3.verify = VerifyStream.verify;
jws$3.decode = VerifyStream.decode;
jws$3.isValid = VerifyStream.isValid;
jws$3.createSign = function createSign(opts) {
  return new SignStream(opts);
};
jws$3.createVerify = function createVerify(opts) {
  return new VerifyStream(opts);
};
var jws$2 = jws$3;
var decode$1 = function(jwt, options) {
  options = options || {};
  var decoded = jws$2.decode(jwt, options);
  if (!decoded) {
    return null;
  }
  var payload = decoded.payload;
  if (typeof payload === "string") {
    try {
      var obj = JSON.parse(payload);
      if (obj !== null && typeof obj === "object") {
        payload = obj;
      }
    } catch (e) {
    }
  }
  if (options.complete === true) {
    return {
      header: decoded.header,
      payload,
      signature: decoded.signature
    };
  }
  return payload;
};
var JsonWebTokenError$3 = function(message, error2) {
  Error.call(this, message);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  this.name = "JsonWebTokenError";
  this.message = message;
  if (error2) this.inner = error2;
};
JsonWebTokenError$3.prototype = Object.create(Error.prototype);
JsonWebTokenError$3.prototype.constructor = JsonWebTokenError$3;
var JsonWebTokenError_1 = JsonWebTokenError$3;
var JsonWebTokenError$2 = JsonWebTokenError_1;
var NotBeforeError$1 = function(message, date) {
  JsonWebTokenError$2.call(this, message);
  this.name = "NotBeforeError";
  this.date = date;
};
NotBeforeError$1.prototype = Object.create(JsonWebTokenError$2.prototype);
NotBeforeError$1.prototype.constructor = NotBeforeError$1;
var NotBeforeError_1 = NotBeforeError$1;
var JsonWebTokenError$1 = JsonWebTokenError_1;
var TokenExpiredError$1 = function(message, expiredAt) {
  JsonWebTokenError$1.call(this, message);
  this.name = "TokenExpiredError";
  this.expiredAt = expiredAt;
};
TokenExpiredError$1.prototype = Object.create(JsonWebTokenError$1.prototype);
TokenExpiredError$1.prototype.constructor = TokenExpiredError$1;
var TokenExpiredError_1 = TokenExpiredError$1;
var ms = requireMs();
var timespan$2 = function(time, iat) {
  var timestamp = iat || Math.floor(Date.now() / 1e3);
  if (typeof time === "string") {
    var milliseconds = ms(time);
    if (typeof milliseconds === "undefined") {
      return;
    }
    return Math.floor(timestamp + milliseconds / 1e3);
  } else if (typeof time === "number") {
    return timestamp + time;
  } else {
    return;
  }
};
var re$2 = { exports: {} };
const SEMVER_SPEC_VERSION = "2.0.0";
const MAX_LENGTH$1 = 256;
const MAX_SAFE_INTEGER$2 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991;
const MAX_SAFE_COMPONENT_LENGTH = 16;
const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH$1 - 6;
const RELEASE_TYPES = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var constants$2 = {
  MAX_LENGTH: MAX_LENGTH$1,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$2,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const debug$6 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
};
var debug_1 = debug$6;
(function(module, exports) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH2,
    MAX_SAFE_BUILD_LENGTH: MAX_SAFE_BUILD_LENGTH2,
    MAX_LENGTH: MAX_LENGTH2
  } = constants$2;
  const debug2 = debug_1;
  exports = module.exports = {};
  const re2 = exports.re = [];
  const safeRe = exports.safeRe = [];
  const src2 = exports.src = [];
  const safeSrc = exports.safeSrc = [];
  const t2 = exports.t = {};
  let R = 0;
  const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  const safeRegexReplacements = [
    ["\\s", 1],
    ["\\d", MAX_LENGTH2],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH2]
  ];
  const makeSafeRegex = (value) => {
    for (const [token, max] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
  };
  const createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug2(name, index, value);
    t2[name] = index;
    src2[index] = value;
    safeSrc[index] = safe;
    re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src2[t2.NUMERICIDENTIFIER]})\\.(${src2[t2.NUMERICIDENTIFIER]})\\.(${src2[t2.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src2[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src2[t2.NONNUMERICIDENTIFIER]}|${src2[t2.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src2[t2.NONNUMERICIDENTIFIER]}|${src2[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src2[t2.PRERELEASEIDENTIFIER]}(?:\\.${src2[t2.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src2[t2.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src2[t2.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src2[t2.BUILDIDENTIFIER]}(?:\\.${src2[t2.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src2[t2.MAINVERSION]}${src2[t2.PRERELEASE]}?${src2[t2.BUILD]}?`);
  createToken("FULL", `^${src2[t2.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src2[t2.MAINVERSIONLOOSE]}${src2[t2.PRERELEASELOOSE]}?${src2[t2.BUILD]}?`);
  createToken("LOOSE", `^${src2[t2.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src2[t2.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src2[t2.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src2[t2.XRANGEIDENTIFIER]})(?:\\.(${src2[t2.XRANGEIDENTIFIER]})(?:\\.(${src2[t2.XRANGEIDENTIFIER]})(?:${src2[t2.PRERELEASE]})?${src2[t2.BUILD]}?)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:${src2[t2.PRERELEASELOOSE]})?${src2[t2.BUILD]}?)?)?`);
  createToken("XRANGE", `^${src2[t2.GTLT]}\\s*${src2[t2.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src2[t2.GTLT]}\\s*${src2[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH2}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?`);
  createToken("COERCE", `${src2[t2.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src2[t2.COERCEPLAIN] + `(?:${src2[t2.PRERELEASE]})?(?:${src2[t2.BUILD]})?(?:$|[^\\d])`);
  createToken("COERCERTL", src2[t2.COERCE], true);
  createToken("COERCERTLFULL", src2[t2.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src2[t2.LONETILDE]}\\s+`, true);
  exports.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src2[t2.LONETILDE]}${src2[t2.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src2[t2.LONETILDE]}${src2[t2.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src2[t2.LONECARET]}\\s+`, true);
  exports.caretTrimReplace = "$1^";
  createToken("CARET", `^${src2[t2.LONECARET]}${src2[t2.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src2[t2.LONECARET]}${src2[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src2[t2.GTLT]}\\s*(${src2[t2.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src2[t2.GTLT]}\\s*(${src2[t2.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src2[t2.GTLT]}\\s*(${src2[t2.LOOSEPLAIN]}|${src2[t2.XRANGEPLAIN]})`, true);
  exports.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src2[t2.XRANGEPLAIN]})\\s+-\\s+(${src2[t2.XRANGEPLAIN]})\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src2[t2.XRANGEPLAINLOOSE]})\\s+-\\s+(${src2[t2.XRANGEPLAINLOOSE]})\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(re$2, re$2.exports);
var reExports = re$2.exports;
const looseOption = Object.freeze({ loose: true });
const emptyOpts = Object.freeze({});
const parseOptions$1 = (options) => {
  if (!options) {
    return emptyOpts;
  }
  if (typeof options !== "object") {
    return looseOption;
  }
  return options;
};
var parseOptions_1 = parseOptions$1;
const numeric = /^[0-9]+$/;
const compareIdentifiers$1 = (a, b) => {
  if (typeof a === "number" && typeof b === "number") {
    return a === b ? 0 : a < b ? -1 : 1;
  }
  const anum = numeric.test(a);
  const bnum = numeric.test(b);
  if (anum && bnum) {
    a = +a;
    b = +b;
  }
  return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
};
const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);
var identifiers$1 = {
  compareIdentifiers: compareIdentifiers$1,
  rcompareIdentifiers
};
const debug$5 = debug_1;
const { MAX_LENGTH, MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1 } = constants$2;
const { safeRe: re$1, t: t$1 } = reExports;
const parseOptions = parseOptions_1;
const { compareIdentifiers } = identifiers$1;
const isPrereleaseIdentifier = (prerelease2, identifier) => {
  const identifiers2 = identifier.split(".");
  if (identifiers2.length > prerelease2.length) {
    return false;
  }
  for (let i = 0; i < identifiers2.length; i++) {
    if (compareIdentifiers(prerelease2[i], identifiers2[i]) !== 0) {
      return false;
    }
  }
  return true;
};
let SemVer$e = class SemVer {
  constructor(version2, options) {
    options = parseOptions(options);
    if (version2 instanceof SemVer) {
      if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
        return version2;
      } else {
        version2 = version2.version;
      }
    } else if (typeof version2 !== "string") {
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
    }
    if (version2.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      );
    }
    debug$5("SemVer", version2, options);
    this.options = options;
    this.loose = !!options.loose;
    this.includePrerelease = !!options.includePrerelease;
    const m = version2.trim().match(options.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL]);
    if (!m) {
      throw new TypeError(`Invalid Version: ${version2}`);
    }
    this.raw = version2;
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];
    if (this.major > MAX_SAFE_INTEGER$1 || this.major < 0) {
      throw new TypeError("Invalid major version");
    }
    if (this.minor > MAX_SAFE_INTEGER$1 || this.minor < 0) {
      throw new TypeError("Invalid minor version");
    }
    if (this.patch > MAX_SAFE_INTEGER$1 || this.patch < 0) {
      throw new TypeError("Invalid patch version");
    }
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split(".").map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id;
          if (num >= 0 && num < MAX_SAFE_INTEGER$1) {
            return num;
          }
        }
        return id;
      });
    }
    this.build = m[5] ? m[5].split(".") : [];
    this.format();
  }
  format() {
    this.version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join(".")}`;
    }
    return this.version;
  }
  toString() {
    return this.version;
  }
  compare(other) {
    debug$5("SemVer.compare", this.version, this.options, other);
    if (!(other instanceof SemVer)) {
      if (typeof other === "string" && other === this.version) {
        return 0;
      }
      other = new SemVer(other, this.options);
    }
    if (other.version === this.version) {
      return 0;
    }
    return this.compareMain(other) || this.comparePre(other);
  }
  compareMain(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    if (this.major < other.major) {
      return -1;
    }
    if (this.major > other.major) {
      return 1;
    }
    if (this.minor < other.minor) {
      return -1;
    }
    if (this.minor > other.minor) {
      return 1;
    }
    if (this.patch < other.patch) {
      return -1;
    }
    if (this.patch > other.patch) {
      return 1;
    }
    return 0;
  }
  comparePre(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    if (this.prerelease.length && !other.prerelease.length) {
      return -1;
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1;
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0;
    }
    let i = 0;
    do {
      const a = this.prerelease[i];
      const b = other.prerelease[i];
      debug$5("prerelease compare", i, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }
  compareBuild(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    let i = 0;
    do {
      const a = this.build[i];
      const b = other.build[i];
      debug$5("build compare", i, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(release, identifier, identifierBase) {
    if (release.startsWith("pre")) {
      if (!identifier && identifierBase === false) {
        throw new Error("invalid increment argument: identifier is empty");
      }
      if (identifier) {
        const match = `-${identifier}`.match(this.options.loose ? re$1[t$1.PRERELEASELOOSE] : re$1[t$1.PRERELEASE]);
        if (!match || match[1] !== identifier) {
          throw new Error(`invalid identifier: ${identifier}`);
        }
      }
    }
    switch (release) {
      case "premajor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc("pre", identifier, identifierBase);
        break;
      case "preminor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc("pre", identifier, identifierBase);
        break;
      case "prepatch":
        this.prerelease.length = 0;
        this.inc("patch", identifier, identifierBase);
        this.inc("pre", identifier, identifierBase);
        break;
      case "prerelease":
        if (this.prerelease.length === 0) {
          this.inc("patch", identifier, identifierBase);
        }
        this.inc("pre", identifier, identifierBase);
        break;
      case "release":
        if (this.prerelease.length === 0) {
          throw new Error(`version ${this.raw} is not a prerelease`);
        }
        this.prerelease.length = 0;
        break;
      case "major":
        if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
          this.major++;
        }
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;
      case "minor":
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }
        this.patch = 0;
        this.prerelease = [];
        break;
      case "patch":
        if (this.prerelease.length === 0) {
          this.patch++;
        }
        this.prerelease = [];
        break;
      case "pre": {
        const base = Number(identifierBase) ? 1 : 0;
        if (this.prerelease.length === 0) {
          this.prerelease = [base];
        } else {
          let i = this.prerelease.length;
          while (--i >= 0) {
            if (typeof this.prerelease[i] === "number") {
              this.prerelease[i]++;
              i = -2;
            }
          }
          if (i === -1) {
            if (identifier === this.prerelease.join(".") && identifierBase === false) {
              throw new Error("invalid increment argument: identifier already exists");
            }
            this.prerelease.push(base);
          }
        }
        if (identifier) {
          let prerelease2 = [identifier, base];
          if (identifierBase === false) {
            prerelease2 = [identifier];
          }
          if (isPrereleaseIdentifier(this.prerelease, identifier)) {
            const prereleaseBase = this.prerelease[identifier.split(".").length];
            if (isNaN(prereleaseBase)) {
              this.prerelease = prerelease2;
            }
          } else {
            this.prerelease = prerelease2;
          }
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${release}`);
    }
    this.raw = this.format();
    if (this.build.length) {
      this.raw += `+${this.build.join(".")}`;
    }
    return this;
  }
};
var semver$4 = SemVer$e;
const SemVer$d = semver$4;
const parse$7 = (version2, options, throwErrors = false) => {
  if (version2 instanceof SemVer$d) {
    return version2;
  }
  try {
    return new SemVer$d(version2, options);
  } catch (er) {
    if (!throwErrors) {
      return null;
    }
    throw er;
  }
};
var parse_1 = parse$7;
const parse$6 = parse_1;
const valid$2 = (version2, options) => {
  const v = parse$6(version2, options);
  return v ? v.version : null;
};
var valid_1 = valid$2;
const parse$5 = parse_1;
const clean$1 = (version2, options) => {
  const s = parse$5(version2.trim().replace(/^[=v]+/, ""), options);
  return s ? s.version : null;
};
var clean_1 = clean$1;
const SemVer$c = semver$4;
const inc$1 = (version2, release, options, identifier, identifierBase) => {
  if (typeof options === "string") {
    identifierBase = identifier;
    identifier = options;
    options = void 0;
  }
  try {
    return new SemVer$c(
      version2 instanceof SemVer$c ? version2.version : version2,
      options
    ).inc(release, identifier, identifierBase).version;
  } catch (er) {
    return null;
  }
};
var inc_1 = inc$1;
const parse$4 = parse_1;
const diff$1 = (version1, version2) => {
  const v13 = parse$4(version1, null, true);
  const v2 = parse$4(version2, null, true);
  const comparison = v13.compare(v2);
  if (comparison === 0) {
    return null;
  }
  const v1Higher = comparison > 0;
  const highVersion = v1Higher ? v13 : v2;
  const lowVersion = v1Higher ? v2 : v13;
  const highHasPre = !!highVersion.prerelease.length;
  const lowHasPre = !!lowVersion.prerelease.length;
  if (lowHasPre && !highHasPre) {
    if (!lowVersion.patch && !lowVersion.minor) {
      return "major";
    }
    if (lowVersion.compareMain(highVersion) === 0) {
      if (lowVersion.minor && !lowVersion.patch) {
        return "minor";
      }
      return "patch";
    }
  }
  const prefix = highHasPre ? "pre" : "";
  if (v13.major !== v2.major) {
    return prefix + "major";
  }
  if (v13.minor !== v2.minor) {
    return prefix + "minor";
  }
  if (v13.patch !== v2.patch) {
    return prefix + "patch";
  }
  return "prerelease";
};
var diff_1 = diff$1;
const SemVer$b = semver$4;
const major$1 = (a, loose) => new SemVer$b(a, loose).major;
var major_1 = major$1;
const SemVer$a = semver$4;
const minor$1 = (a, loose) => new SemVer$a(a, loose).minor;
var minor_1 = minor$1;
const SemVer$9 = semver$4;
const patch$1 = (a, loose) => new SemVer$9(a, loose).patch;
var patch_1 = patch$1;
const parse$3 = parse_1;
const prerelease$1 = (version2, options) => {
  const parsed = parse$3(version2, options);
  return parsed && parsed.prerelease.length ? parsed.prerelease : null;
};
var prerelease_1 = prerelease$1;
const SemVer$8 = semver$4;
const compare$b = (a, b, loose) => new SemVer$8(a, loose).compare(new SemVer$8(b, loose));
var compare_1 = compare$b;
const compare$a = compare_1;
const rcompare$1 = (a, b, loose) => compare$a(b, a, loose);
var rcompare_1 = rcompare$1;
const compare$9 = compare_1;
const compareLoose$1 = (a, b) => compare$9(a, b, true);
var compareLoose_1 = compareLoose$1;
const SemVer$7 = semver$4;
const compareBuild$3 = (a, b, loose) => {
  const versionA = new SemVer$7(a, loose);
  const versionB = new SemVer$7(b, loose);
  return versionA.compare(versionB) || versionA.compareBuild(versionB);
};
var compareBuild_1 = compareBuild$3;
const compareBuild$2 = compareBuild_1;
const sort$1 = (list, loose) => list.sort((a, b) => compareBuild$2(a, b, loose));
var sort_1 = sort$1;
const compareBuild$1 = compareBuild_1;
const rsort$1 = (list, loose) => list.sort((a, b) => compareBuild$1(b, a, loose));
var rsort_1 = rsort$1;
const compare$8 = compare_1;
const gt$4 = (a, b, loose) => compare$8(a, b, loose) > 0;
var gt_1 = gt$4;
const compare$7 = compare_1;
const lt$3 = (a, b, loose) => compare$7(a, b, loose) < 0;
var lt_1 = lt$3;
const compare$6 = compare_1;
const eq$2 = (a, b, loose) => compare$6(a, b, loose) === 0;
var eq_1 = eq$2;
const compare$5 = compare_1;
const neq$2 = (a, b, loose) => compare$5(a, b, loose) !== 0;
var neq_1 = neq$2;
const compare$4 = compare_1;
const gte$3 = (a, b, loose) => compare$4(a, b, loose) >= 0;
var gte_1 = gte$3;
const compare$3 = compare_1;
const lte$3 = (a, b, loose) => compare$3(a, b, loose) <= 0;
var lte_1 = lte$3;
const eq$1 = eq_1;
const neq$1 = neq_1;
const gt$3 = gt_1;
const gte$2 = gte_1;
const lt$2 = lt_1;
const lte$2 = lte_1;
const cmp$1 = (a, op, b, loose) => {
  switch (op) {
    case "===":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a === b;
    case "!==":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a !== b;
    case "":
    case "=":
    case "==":
      return eq$1(a, b, loose);
    case "!=":
      return neq$1(a, b, loose);
    case ">":
      return gt$3(a, b, loose);
    case ">=":
      return gte$2(a, b, loose);
    case "<":
      return lt$2(a, b, loose);
    case "<=":
      return lte$2(a, b, loose);
    default:
      throw new TypeError(`Invalid operator: ${op}`);
  }
};
var cmp_1 = cmp$1;
const SemVer$6 = semver$4;
const parse$2 = parse_1;
const { safeRe: re, t } = reExports;
const coerce$1 = (version2, options) => {
  if (version2 instanceof SemVer$6) {
    return version2;
  }
  if (typeof version2 === "number") {
    version2 = String(version2);
  }
  if (typeof version2 !== "string") {
    return null;
  }
  options = options || {};
  let match = null;
  if (!options.rtl) {
    match = version2.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
  } else {
    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
    let next;
    while ((next = coerceRtlRegex.exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
      if (!match || next.index + next[0].length !== match.index + match[0].length) {
        match = next;
      }
      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
    }
    coerceRtlRegex.lastIndex = -1;
  }
  if (match === null) {
    return null;
  }
  const major2 = match[2];
  const minor2 = match[3] || "0";
  const patch2 = match[4] || "0";
  const prerelease2 = options.includePrerelease && match[5] ? `-${match[5]}` : "";
  const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
  return parse$2(`${major2}.${minor2}.${patch2}${prerelease2}${build}`, options);
};
var coerce_1 = coerce$1;
const parse$1 = parse_1;
const constants$1 = constants$2;
const SemVer$5 = semver$4;
const truncate$1 = (version2, truncation, options) => {
  if (!constants$1.RELEASE_TYPES.includes(truncation)) {
    return null;
  }
  const clonedVersion = cloneInputVersion(version2, options);
  return clonedVersion && doTruncation(clonedVersion, truncation);
};
const cloneInputVersion = (version2, options) => {
  const versionStringToParse = version2 instanceof SemVer$5 ? version2.version : version2;
  return parse$1(versionStringToParse, options);
};
const doTruncation = (version2, truncation) => {
  if (isPrerelease(truncation)) {
    return version2.version;
  }
  version2.prerelease = [];
  switch (truncation) {
    case "major":
      version2.minor = 0;
      version2.patch = 0;
      break;
    case "minor":
      version2.patch = 0;
      break;
  }
  return version2.format();
};
const isPrerelease = (type) => {
  return type.startsWith("pre");
};
var truncate_1 = truncate$1;
class LRUCache {
  constructor() {
    this.max = 1e3;
    this.map = /* @__PURE__ */ new Map();
  }
  get(key) {
    const value = this.map.get(key);
    if (value === void 0) {
      return void 0;
    } else {
      this.map.delete(key);
      this.map.set(key, value);
      return value;
    }
  }
  delete(key) {
    return this.map.delete(key);
  }
  set(key, value) {
    const deleted = this.delete(key);
    if (!deleted && value !== void 0) {
      if (this.map.size >= this.max) {
        const firstKey = this.map.keys().next().value;
        this.delete(firstKey);
      }
      this.map.set(key, value);
    }
    return this;
  }
}
var lrucache = LRUCache;
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  const SPACE_CHARACTERS = /\s+/g;
  class Range2 {
    constructor(range2, options) {
      options = parseOptions2(options);
      if (range2 instanceof Range2) {
        if (range2.loose === !!options.loose && range2.includePrerelease === !!options.includePrerelease) {
          return range2;
        } else {
          return new Range2(range2.raw, options);
        }
      }
      if (range2 instanceof Comparator2) {
        this.raw = range2.value;
        this.set = [[range2]];
        this.formatted = void 0;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range2.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let i = 0; i < this.set.length; i++) {
          if (i > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i];
          for (let k = 0; k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range2) {
      range2 = range2.replace(BUILDSTRIPRE, "");
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range2;
      const cached = cache.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re2[t2.HYPHENRANGELOOSE] : re2[t2.HYPHENRANGE];
      range2 = range2.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug2("hyphen replace", range2);
      range2 = range2.replace(re2[t2.COMPARATORTRIM], comparatorTrimReplace);
      debug2("comparator trim", range2);
      range2 = range2.replace(re2[t2.TILDETRIM], tildeTrimReplace);
      debug2("tilde trim", range2);
      range2 = range2.replace(re2[t2.CARETTRIM], caretTrimReplace);
      debug2("caret trim", range2);
      let rangeList = range2.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug2("loose invalid filter", comp, this.options);
          return !!comp.match(re2[t2.COMPARATORLOOSE]);
        });
      }
      debug2("range list", rangeList);
      const rangeMap = /* @__PURE__ */ new Map();
      const comparators = rangeList.map((comp) => new Comparator2(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache.set(memoKey, result);
      return result;
    }
    intersects(range2, options) {
      if (!(range2 instanceof Range2)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range2.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(version2) {
      if (!version2) {
        return false;
      }
      if (typeof version2 === "string") {
        try {
          version2 = new SemVer3(version2, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version2, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  range = Range2;
  const LRU = lrucache;
  const cache = new LRU();
  const parseOptions2 = parseOptions_1;
  const Comparator2 = requireComparator();
  const debug2 = debug_1;
  const SemVer3 = semver$4;
  const {
    safeRe: re2,
    src: src2,
    t: t2,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = reExports;
  const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = constants$2;
  const BUILDSTRIPRE = new RegExp(src2[t2.BUILD], "g");
  const isNullSet = (c) => c.value === "<0.0.0-0";
  const isAny = (c) => c.value === "";
  const isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  const parseComparator = (comp, options) => {
    comp = comp.replace(re2[t2.BUILD], "");
    debug2("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug2("caret", comp);
    comp = replaceTildes(comp, options);
    debug2("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug2("xrange", comp);
    comp = replaceStars(comp, options);
    debug2("stars", comp);
    return comp;
  };
  const isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  const invalidXRangeOrder = (M, m, p) => isX(M) && !isX(m) || isX(m) && p && !isX(p);
  const replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  const replaceTilde = (comp, options) => {
    const r = options.loose ? re2[t2.TILDELOOSE] : re2[t2.TILDE];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug2("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug2("tilde return", ret);
      return ret;
    });
  };
  const replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  const replaceCaret = (comp, options) => {
    debug2("caret", comp, options);
    const r = options.loose ? re2[t2.CARETLOOSE] : re2[t2.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug2("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug2("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug2("caret return", ret);
      return ret;
    });
  };
  const replaceXRanges = (comp, options) => {
    debug2("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  const replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re2[t2.XRANGELOOSE] : re2[t2.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug2("xRange", comp, ret, gtlt, M, m, p, pr);
      if (invalidXRangeOrder(M, m, p)) {
        return comp;
      }
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug2("xRange return", ret);
      return ret;
    });
  };
  const replaceStars = (comp, options) => {
    debug2("replaceStars", comp, options);
    return comp.trim().replace(re2[t2.STAR], "");
  };
  const replaceGTE0 = (comp, options) => {
    debug2("replaceGTE0", comp, options);
    return comp.trim().replace(re2[options.includePrerelease ? t2.GTE0PRE : t2.GTE0], "");
  };
  const hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  const testSet = (set, version2, options) => {
    for (let i = 0; i < set.length; i++) {
      if (!set[i].test(version2)) {
        return false;
      }
    }
    if (version2.prerelease.length && !options.includePrerelease) {
      for (let i = 0; i < set.length; i++) {
        debug2(set[i].semver);
        if (set[i].semver === Comparator2.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
  return range;
}
var comparator;
var hasRequiredComparator;
function requireComparator() {
  if (hasRequiredComparator) return comparator;
  hasRequiredComparator = 1;
  const ANY2 = Symbol("SemVer ANY");
  class Comparator2 {
    static get ANY() {
      return ANY2;
    }
    constructor(comp, options) {
      options = parseOptions2(options);
      if (comp instanceof Comparator2) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug2("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY2) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug2("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re2[t2.COMPARATORLOOSE] : re2[t2.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== void 0 ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY2;
      } else {
        this.semver = new SemVer3(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version2) {
      debug2("Comparator.test", version2, this.options.loose);
      if (this.semver === ANY2 || version2 === ANY2) {
        return true;
      }
      if (typeof version2 === "string") {
        try {
          version2 = new SemVer3(version2, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp2(version2, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator2)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range2(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range2(this.value, options).test(comp.semver);
      }
      options = parseOptions2(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp2(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp2(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  comparator = Comparator2;
  const parseOptions2 = parseOptions_1;
  const { safeRe: re2, t: t2 } = reExports;
  const cmp2 = cmp_1;
  const debug2 = debug_1;
  const SemVer3 = semver$4;
  const Range2 = requireRange();
  return comparator;
}
const Range$9 = requireRange();
const satisfies$4 = (version2, range2, options) => {
  try {
    range2 = new Range$9(range2, options);
  } catch (er) {
    return false;
  }
  return range2.test(version2);
};
var satisfies_1 = satisfies$4;
const Range$8 = requireRange();
const toComparators$1 = (range2, options) => new Range$8(range2, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
var toComparators_1 = toComparators$1;
const SemVer$4 = semver$4;
const Range$7 = requireRange();
const maxSatisfying$1 = (versions, range2, options) => {
  let max = null;
  let maxSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$7(range2, options);
  } catch (er) {
    return null;
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      if (!max || maxSV.compare(v) === -1) {
        max = v;
        maxSV = new SemVer$4(max, options);
      }
    }
  });
  return max;
};
var maxSatisfying_1 = maxSatisfying$1;
const SemVer$3 = semver$4;
const Range$6 = requireRange();
const minSatisfying$1 = (versions, range2, options) => {
  let min = null;
  let minSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$6(range2, options);
  } catch (er) {
    return null;
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      if (!min || minSV.compare(v) === 1) {
        min = v;
        minSV = new SemVer$3(min, options);
      }
    }
  });
  return min;
};
var minSatisfying_1 = minSatisfying$1;
const SemVer$2 = semver$4;
const Range$5 = requireRange();
const gt$2 = gt_1;
const minVersion$1 = (range2, loose) => {
  range2 = new Range$5(range2, loose);
  let minver = new SemVer$2("0.0.0");
  if (range2.test(minver)) {
    return minver;
  }
  minver = new SemVer$2("0.0.0-0");
  if (range2.test(minver)) {
    return minver;
  }
  minver = null;
  for (let i = 0; i < range2.set.length; ++i) {
    const comparators = range2.set[i];
    let setMin = null;
    comparators.forEach((comparator2) => {
      const compver = new SemVer$2(comparator2.semver.version);
      switch (comparator2.operator) {
        case ">":
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
        case "":
        case ">=":
          if (!setMin || gt$2(compver, setMin)) {
            setMin = compver;
          }
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${comparator2.operator}`);
      }
    });
    if (setMin && (!minver || gt$2(minver, setMin))) {
      minver = setMin;
    }
  }
  if (minver && range2.test(minver)) {
    return minver;
  }
  return null;
};
var minVersion_1 = minVersion$1;
const Range$4 = requireRange();
const validRange$1 = (range2, options) => {
  try {
    return new Range$4(range2, options).range || "*";
  } catch (er) {
    return null;
  }
};
var valid$1 = validRange$1;
const SemVer$1 = semver$4;
const Comparator$2 = requireComparator();
const { ANY: ANY$1 } = Comparator$2;
const Range$3 = requireRange();
const satisfies$3 = satisfies_1;
const gt$1 = gt_1;
const lt$1 = lt_1;
const lte$1 = lte_1;
const gte$1 = gte_1;
const outside$3 = (version2, range2, hilo, options) => {
  version2 = new SemVer$1(version2, options);
  range2 = new Range$3(range2, options);
  let gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case ">":
      gtfn = gt$1;
      ltefn = lte$1;
      ltfn = lt$1;
      comp = ">";
      ecomp = ">=";
      break;
    case "<":
      gtfn = lt$1;
      ltefn = gte$1;
      ltfn = gt$1;
      comp = "<";
      ecomp = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (satisfies$3(version2, range2, options)) {
    return false;
  }
  for (let i = 0; i < range2.set.length; ++i) {
    const comparators = range2.set[i];
    let high = null;
    let low = null;
    comparators.forEach((comparator2) => {
      if (comparator2.semver === ANY$1) {
        comparator2 = new Comparator$2(">=0.0.0");
      }
      high = high || comparator2;
      low = low || comparator2;
      if (gtfn(comparator2.semver, high.semver, options)) {
        high = comparator2;
      } else if (ltfn(comparator2.semver, low.semver, options)) {
        low = comparator2;
      }
    });
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }
    if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
      return false;
    }
  }
  return true;
};
var outside_1 = outside$3;
const outside$2 = outside_1;
const gtr$1 = (version2, range2, options) => outside$2(version2, range2, ">", options);
var gtr_1 = gtr$1;
const outside$1 = outside_1;
const ltr$1 = (version2, range2, options) => outside$1(version2, range2, "<", options);
var ltr_1 = ltr$1;
const Range$2 = requireRange();
const intersects$1 = (r1, r2, options) => {
  r1 = new Range$2(r1, options);
  r2 = new Range$2(r2, options);
  return r1.intersects(r2, options);
};
var intersects_1 = intersects$1;
const satisfies$2 = satisfies_1;
const compare$2 = compare_1;
var simplify = (versions, range2, options) => {
  const set = [];
  let first = null;
  let prev = null;
  const v = versions.sort((a, b) => compare$2(a, b, options));
  for (const version2 of v) {
    const included = satisfies$2(version2, range2, options);
    if (included) {
      prev = version2;
      if (!first) {
        first = version2;
      }
    } else {
      if (prev) {
        set.push([first, prev]);
      }
      prev = null;
      first = null;
    }
  }
  if (first) {
    set.push([first, null]);
  }
  const ranges = [];
  for (const [min, max] of set) {
    if (min === max) {
      ranges.push(min);
    } else if (!max && min === v[0]) {
      ranges.push("*");
    } else if (!max) {
      ranges.push(`>=${min}`);
    } else if (min === v[0]) {
      ranges.push(`<=${max}`);
    } else {
      ranges.push(`${min} - ${max}`);
    }
  }
  const simplified = ranges.join(" || ");
  const original = typeof range2.raw === "string" ? range2.raw : String(range2);
  return simplified.length < original.length ? simplified : range2;
};
const Range$1 = requireRange();
const Comparator$1 = requireComparator();
const { ANY } = Comparator$1;
const satisfies$1 = satisfies_1;
const compare$1 = compare_1;
const subset$1 = (sub, dom, options = {}) => {
  if (sub === dom) {
    return true;
  }
  sub = new Range$1(sub, options);
  dom = new Range$1(dom, options);
  let sawNonNull = false;
  OUTER: for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const isSub = simpleSubset(simpleSub, simpleDom, options);
      sawNonNull = sawNonNull || isSub !== null;
      if (isSub) {
        continue OUTER;
      }
    }
    if (sawNonNull) {
      return false;
    }
  }
  return true;
};
const minimumVersionWithPreRelease = [new Comparator$1(">=0.0.0-0")];
const minimumVersion = [new Comparator$1(">=0.0.0")];
const simpleSubset = (sub, dom, options) => {
  if (sub === dom) {
    return true;
  }
  if (sub.length === 1 && sub[0].semver === ANY) {
    if (dom.length === 1 && dom[0].semver === ANY) {
      return true;
    } else if (options.includePrerelease) {
      sub = minimumVersionWithPreRelease;
    } else {
      sub = minimumVersion;
    }
  }
  if (dom.length === 1 && dom[0].semver === ANY) {
    if (options.includePrerelease) {
      return true;
    } else {
      dom = minimumVersion;
    }
  }
  const eqSet = /* @__PURE__ */ new Set();
  let gt2, lt2;
  for (const c of sub) {
    if (c.operator === ">" || c.operator === ">=") {
      gt2 = higherGT(gt2, c, options);
    } else if (c.operator === "<" || c.operator === "<=") {
      lt2 = lowerLT(lt2, c, options);
    } else {
      eqSet.add(c.semver);
    }
  }
  if (eqSet.size > 1) {
    return null;
  }
  let gtltComp;
  if (gt2 && lt2) {
    gtltComp = compare$1(gt2.semver, lt2.semver, options);
    if (gtltComp > 0) {
      return null;
    } else if (gtltComp === 0 && (gt2.operator !== ">=" || lt2.operator !== "<=")) {
      return null;
    }
  }
  for (const eq2 of eqSet) {
    if (gt2 && !satisfies$1(eq2, String(gt2), options)) {
      return null;
    }
    if (lt2 && !satisfies$1(eq2, String(lt2), options)) {
      return null;
    }
    for (const c of dom) {
      if (!satisfies$1(eq2, String(c), options)) {
        return false;
      }
    }
    return true;
  }
  let higher, lower;
  let hasDomLT, hasDomGT;
  let needDomLTPre = lt2 && !options.includePrerelease && lt2.semver.prerelease.length ? lt2.semver : false;
  let needDomGTPre = gt2 && !options.includePrerelease && gt2.semver.prerelease.length ? gt2.semver : false;
  if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt2.operator === "<" && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false;
  }
  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
    hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
    if (gt2) {
      if (needDomGTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false;
        }
      }
      if (c.operator === ">" || c.operator === ">=") {
        higher = higherGT(gt2, c, options);
        if (higher === c && higher !== gt2) {
          return false;
        }
      } else if (gt2.operator === ">=" && !c.test(gt2.semver)) {
        return false;
      }
    }
    if (lt2) {
      if (needDomLTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false;
        }
      }
      if (c.operator === "<" || c.operator === "<=") {
        lower = lowerLT(lt2, c, options);
        if (lower === c && lower !== lt2) {
          return false;
        }
      } else if (lt2.operator === "<=" && !c.test(lt2.semver)) {
        return false;
      }
    }
    if (!c.operator && (lt2 || gt2) && gtltComp !== 0) {
      return false;
    }
  }
  if (gt2 && hasDomLT && !lt2 && gtltComp !== 0) {
    return false;
  }
  if (lt2 && hasDomGT && !gt2 && gtltComp !== 0) {
    return false;
  }
  if (needDomGTPre || needDomLTPre) {
    return false;
  }
  return true;
};
const higherGT = (a, b, options) => {
  if (!a) {
    return b;
  }
  const comp = compare$1(a.semver, b.semver, options);
  return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
};
const lowerLT = (a, b, options) => {
  if (!a) {
    return b;
  }
  const comp = compare$1(a.semver, b.semver, options);
  return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
};
var subset_1 = subset$1;
const internalRe = reExports;
const constants = constants$2;
const SemVer2 = semver$4;
const identifiers = identifiers$1;
const parse = parse_1;
const valid = valid_1;
const clean = clean_1;
const inc = inc_1;
const diff = diff_1;
const major = major_1;
const minor = minor_1;
const patch = patch_1;
const prerelease = prerelease_1;
const compare = compare_1;
const rcompare = rcompare_1;
const compareLoose = compareLoose_1;
const compareBuild = compareBuild_1;
const sort = sort_1;
const rsort = rsort_1;
const gt = gt_1;
const lt = lt_1;
const eq = eq_1;
const neq = neq_1;
const gte = gte_1;
const lte = lte_1;
const cmp = cmp_1;
const coerce = coerce_1;
const truncate = truncate_1;
const Comparator = requireComparator();
const Range = requireRange();
const satisfies = satisfies_1;
const toComparators = toComparators_1;
const maxSatisfying = maxSatisfying_1;
const minSatisfying = minSatisfying_1;
const minVersion = minVersion_1;
const validRange = valid$1;
const outside = outside_1;
const gtr = gtr_1;
const ltr = ltr_1;
const intersects = intersects_1;
const simplifyRange = simplify;
const subset = subset_1;
var semver$3 = {
  parse,
  valid,
  clean,
  inc,
  diff,
  major,
  minor,
  patch,
  prerelease,
  compare,
  rcompare,
  compareLoose,
  compareBuild,
  sort,
  rsort,
  gt,
  lt,
  eq,
  neq,
  gte,
  lte,
  cmp,
  coerce,
  truncate,
  Comparator,
  Range,
  satisfies,
  toComparators,
  maxSatisfying,
  minSatisfying,
  minVersion,
  validRange,
  outside,
  gtr,
  ltr,
  intersects,
  simplifyRange,
  subset,
  SemVer: SemVer2,
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: constants.RELEASE_TYPES,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers
};
const semver$2 = semver$3;
var asymmetricKeyDetailsSupported = semver$2.satisfies(process.version, ">=15.7.0");
const semver$1 = semver$3;
var rsaPssKeyDetailsSupported = semver$1.satisfies(process.version, ">=16.9.0");
const ASYMMETRIC_KEY_DETAILS_SUPPORTED = asymmetricKeyDetailsSupported;
const RSA_PSS_KEY_DETAILS_SUPPORTED = rsaPssKeyDetailsSupported;
const allowedAlgorithmsForKeys = {
  "ec": ["ES256", "ES384", "ES512"],
  "rsa": ["RS256", "PS256", "RS384", "PS384", "RS512", "PS512"],
  "rsa-pss": ["PS256", "PS384", "PS512"]
};
const allowedCurves = {
  ES256: "prime256v1",
  ES384: "secp384r1",
  ES512: "secp521r1"
};
var validateAsymmetricKey$2 = function(algorithm, key) {
  if (!algorithm || !key) return;
  const keyType = key.asymmetricKeyType;
  if (!keyType) return;
  const allowedAlgorithms = allowedAlgorithmsForKeys[keyType];
  if (!allowedAlgorithms) {
    throw new Error(`Unknown key type "${keyType}".`);
  }
  if (!allowedAlgorithms.includes(algorithm)) {
    throw new Error(`"alg" parameter for "${keyType}" key type must be one of: ${allowedAlgorithms.join(", ")}.`);
  }
  if (ASYMMETRIC_KEY_DETAILS_SUPPORTED) {
    switch (keyType) {
      case "ec":
        const keyCurve = key.asymmetricKeyDetails.namedCurve;
        const allowedCurve = allowedCurves[algorithm];
        if (keyCurve !== allowedCurve) {
          throw new Error(`"alg" parameter "${algorithm}" requires curve "${allowedCurve}".`);
        }
        break;
      case "rsa-pss":
        if (RSA_PSS_KEY_DETAILS_SUPPORTED) {
          const length = parseInt(algorithm.slice(-3), 10);
          const { hashAlgorithm, mgf1HashAlgorithm, saltLength } = key.asymmetricKeyDetails;
          if (hashAlgorithm !== `sha${length}` || mgf1HashAlgorithm !== hashAlgorithm) {
            throw new Error(`Invalid key for this operation, its RSA-PSS parameters do not meet the requirements of "alg" ${algorithm}.`);
          }
          if (saltLength !== void 0 && saltLength > length >> 3) {
            throw new Error(`Invalid key for this operation, its RSA-PSS parameter saltLength does not meet the requirements of "alg" ${algorithm}.`);
          }
        }
        break;
    }
  }
};
var semver = semver$3;
var psSupported = semver.satisfies(process.version, "^6.12.0 || >=8.0.0");
const JsonWebTokenError = JsonWebTokenError_1;
const NotBeforeError = NotBeforeError_1;
const TokenExpiredError = TokenExpiredError_1;
const decode = decode$1;
const timespan$1 = timespan$2;
const validateAsymmetricKey$1 = validateAsymmetricKey$2;
const PS_SUPPORTED$1 = psSupported;
const jws$1 = jws$3;
const { KeyObject: KeyObject$1, createSecretKey: createSecretKey$1, createPublicKey } = crypto$6;
const PUB_KEY_ALGS = ["RS256", "RS384", "RS512"];
const EC_KEY_ALGS = ["ES256", "ES384", "ES512"];
const RSA_KEY_ALGS = ["RS256", "RS384", "RS512"];
const HS_ALGS = ["HS256", "HS384", "HS512"];
if (PS_SUPPORTED$1) {
  PUB_KEY_ALGS.splice(PUB_KEY_ALGS.length, 0, "PS256", "PS384", "PS512");
  RSA_KEY_ALGS.splice(RSA_KEY_ALGS.length, 0, "PS256", "PS384", "PS512");
}
var verify2 = function(jwtString, secretOrPublicKey, options, callback) {
  if (typeof options === "function" && !callback) {
    callback = options;
    options = {};
  }
  if (!options) {
    options = {};
  }
  options = Object.assign({}, options);
  let done;
  if (callback) {
    done = callback;
  } else {
    done = function(err, data) {
      if (err) throw err;
      return data;
    };
  }
  if (options.clockTimestamp && typeof options.clockTimestamp !== "number") {
    return done(new JsonWebTokenError("clockTimestamp must be a number"));
  }
  if (options.nonce !== void 0 && (typeof options.nonce !== "string" || options.nonce.trim() === "")) {
    return done(new JsonWebTokenError("nonce must be a non-empty string"));
  }
  if (options.allowInvalidAsymmetricKeyTypes !== void 0 && typeof options.allowInvalidAsymmetricKeyTypes !== "boolean") {
    return done(new JsonWebTokenError("allowInvalidAsymmetricKeyTypes must be a boolean"));
  }
  const clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1e3);
  if (!jwtString) {
    return done(new JsonWebTokenError("jwt must be provided"));
  }
  if (typeof jwtString !== "string") {
    return done(new JsonWebTokenError("jwt must be a string"));
  }
  const parts = jwtString.split(".");
  if (parts.length !== 3) {
    return done(new JsonWebTokenError("jwt malformed"));
  }
  let decodedToken;
  try {
    decodedToken = decode(jwtString, { complete: true });
  } catch (err) {
    return done(err);
  }
  if (!decodedToken) {
    return done(new JsonWebTokenError("invalid token"));
  }
  const header = decodedToken.header;
  let getSecret;
  if (typeof secretOrPublicKey === "function") {
    if (!callback) {
      return done(new JsonWebTokenError("verify must be called asynchronous if secret or public key is provided as a callback"));
    }
    getSecret = secretOrPublicKey;
  } else {
    getSecret = function(header2, secretCallback) {
      return secretCallback(null, secretOrPublicKey);
    };
  }
  return getSecret(header, function(err, secretOrPublicKey2) {
    if (err) {
      return done(new JsonWebTokenError("error in secret or public key callback: " + err.message));
    }
    const hasSignature = parts[2].trim() !== "";
    if (!hasSignature && secretOrPublicKey2) {
      return done(new JsonWebTokenError("jwt signature is required"));
    }
    if (hasSignature && !secretOrPublicKey2) {
      return done(new JsonWebTokenError("secret or public key must be provided"));
    }
    if (!hasSignature && !options.algorithms) {
      return done(new JsonWebTokenError('please specify "none" in "algorithms" to verify unsigned tokens'));
    }
    if (secretOrPublicKey2 != null && !(secretOrPublicKey2 instanceof KeyObject$1)) {
      try {
        secretOrPublicKey2 = createPublicKey(secretOrPublicKey2);
      } catch (_) {
        try {
          secretOrPublicKey2 = createSecretKey$1(typeof secretOrPublicKey2 === "string" ? Buffer.from(secretOrPublicKey2) : secretOrPublicKey2);
        } catch (_2) {
          return done(new JsonWebTokenError("secretOrPublicKey is not valid key material"));
        }
      }
    }
    if (!options.algorithms) {
      if (secretOrPublicKey2.type === "secret") {
        options.algorithms = HS_ALGS;
      } else if (["rsa", "rsa-pss"].includes(secretOrPublicKey2.asymmetricKeyType)) {
        options.algorithms = RSA_KEY_ALGS;
      } else if (secretOrPublicKey2.asymmetricKeyType === "ec") {
        options.algorithms = EC_KEY_ALGS;
      } else {
        options.algorithms = PUB_KEY_ALGS;
      }
    }
    if (options.algorithms.indexOf(decodedToken.header.alg) === -1) {
      return done(new JsonWebTokenError("invalid algorithm"));
    }
    if (header.alg.startsWith("HS") && secretOrPublicKey2.type !== "secret") {
      return done(new JsonWebTokenError(`secretOrPublicKey must be a symmetric key when using ${header.alg}`));
    } else if (/^(?:RS|PS|ES)/.test(header.alg) && secretOrPublicKey2.type !== "public") {
      return done(new JsonWebTokenError(`secretOrPublicKey must be an asymmetric key when using ${header.alg}`));
    }
    if (!options.allowInvalidAsymmetricKeyTypes) {
      try {
        validateAsymmetricKey$1(header.alg, secretOrPublicKey2);
      } catch (e) {
        return done(e);
      }
    }
    let valid2;
    try {
      valid2 = jws$1.verify(jwtString, decodedToken.header.alg, secretOrPublicKey2);
    } catch (e) {
      return done(e);
    }
    if (!valid2) {
      return done(new JsonWebTokenError("invalid signature"));
    }
    const payload = decodedToken.payload;
    if (typeof payload.nbf !== "undefined" && !options.ignoreNotBefore) {
      if (typeof payload.nbf !== "number") {
        return done(new JsonWebTokenError("invalid nbf value"));
      }
      if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
        return done(new NotBeforeError("jwt not active", new Date(payload.nbf * 1e3)));
      }
    }
    if (typeof payload.exp !== "undefined" && !options.ignoreExpiration) {
      if (typeof payload.exp !== "number") {
        return done(new JsonWebTokenError("invalid exp value"));
      }
      if (clockTimestamp >= payload.exp + (options.clockTolerance || 0)) {
        return done(new TokenExpiredError("jwt expired", new Date(payload.exp * 1e3)));
      }
    }
    if (options.audience) {
      const audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
      const target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      const match = target.some(function(targetAudience) {
        return audiences.some(function(audience) {
          return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
        });
      });
      if (!match) {
        return done(new JsonWebTokenError("jwt audience invalid. expected: " + audiences.join(" or ")));
      }
    }
    if (options.issuer) {
      const invalid_issuer = typeof options.issuer === "string" && payload.iss !== options.issuer || Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1;
      if (invalid_issuer) {
        return done(new JsonWebTokenError("jwt issuer invalid. expected: " + options.issuer));
      }
    }
    if (options.subject) {
      if (payload.sub !== options.subject) {
        return done(new JsonWebTokenError("jwt subject invalid. expected: " + options.subject));
      }
    }
    if (options.jwtid) {
      if (payload.jti !== options.jwtid) {
        return done(new JsonWebTokenError("jwt jwtid invalid. expected: " + options.jwtid));
      }
    }
    if (options.nonce) {
      if (payload.nonce !== options.nonce) {
        return done(new JsonWebTokenError("jwt nonce invalid. expected: " + options.nonce));
      }
    }
    if (options.maxAge) {
      if (typeof payload.iat !== "number") {
        return done(new JsonWebTokenError("iat required when maxAge is specified"));
      }
      const maxAgeTimestamp = timespan$1(options.maxAge, payload.iat);
      if (typeof maxAgeTimestamp === "undefined") {
        return done(new JsonWebTokenError('"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
      }
      if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0)) {
        return done(new TokenExpiredError("maxAge exceeded", new Date(maxAgeTimestamp * 1e3)));
      }
    }
    if (options.complete === true) {
      const signature = decodedToken.signature;
      return done(null, {
        header,
        payload,
        signature
      });
    }
    return done(null, payload);
  });
};
var INFINITY$2 = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER$2 = 17976931348623157e292, NAN$2 = 0 / 0;
var argsTag = "[object Arguments]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", stringTag$1 = "[object String]", symbolTag$2 = "[object Symbol]";
var reTrim$2 = /^\s+|\s+$/g;
var reIsBadHex$2 = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary$2 = /^0b[01]+$/i;
var reIsOctal$2 = /^0o[0-7]+$/i;
var reIsUint = /^(?:0|[1-9]\d*)$/;
var freeParseInt$2 = parseInt;
function arrayMap(array, iteratee) {
  var index = -1, length = array ? array.length : 0, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length, index = fromIndex + -1;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1, length = array.length;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}
function baseIsNaN(value) {
  return value !== value;
}
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
function baseValues(object, props) {
  return arrayMap(props, function(key) {
    return object[key];
  });
}
function overArg$1(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var objectProto$6 = Object.prototype;
var hasOwnProperty$1 = objectProto$6.hasOwnProperty;
var objectToString$6 = objectProto$6.toString;
var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;
var nativeKeys = overArg$1(Object.keys, Object), nativeMax = Math.max;
function arrayLikeKeys(value, inherited) {
  var result = isArray$1(value) || isArguments(value) ? baseTimes(value.length, String) : [];
  var length = result.length, skipIndexes = !!length;
  for (var key in value) {
    if (hasOwnProperty$1.call(value, key) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$1.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$6;
  return value === proto;
}
function includes$1(collection, value, fromIndex, guard) {
  collection = isArrayLike(collection) ? collection : values(collection);
  fromIndex = fromIndex && !guard ? toInteger$2(fromIndex) : 0;
  var length = collection.length;
  if (fromIndex < 0) {
    fromIndex = nativeMax(length + fromIndex, 0);
  }
  return isString$2(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
}
function isArguments(value) {
  return isArrayLikeObject(value) && hasOwnProperty$1.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString$6.call(value) == argsTag);
}
var isArray$1 = Array.isArray;
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
function isArrayLikeObject(value) {
  return isObjectLike$6(value) && isArrayLike(value);
}
function isFunction(value) {
  var tag = isObject$2(value) ? objectToString$6.call(value) : "";
  return tag == funcTag || tag == genTag;
}
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isObject$2(value) {
  var type = typeof value;
  return !!value && (type == "object" || type == "function");
}
function isObjectLike$6(value) {
  return !!value && typeof value == "object";
}
function isString$2(value) {
  return typeof value == "string" || !isArray$1(value) && isObjectLike$6(value) && objectToString$6.call(value) == stringTag$1;
}
function isSymbol$2(value) {
  return typeof value == "symbol" || isObjectLike$6(value) && objectToString$6.call(value) == symbolTag$2;
}
function toFinite$2(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber$2(value);
  if (value === INFINITY$2 || value === -INFINITY$2) {
    var sign3 = value < 0 ? -1 : 1;
    return sign3 * MAX_INTEGER$2;
  }
  return value === value ? value : 0;
}
function toInteger$2(value) {
  var result = toFinite$2(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
function toNumber$2(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol$2(value)) {
    return NAN$2;
  }
  if (isObject$2(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject$2(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim$2, "");
  var isBinary = reIsBinary$2.test(value);
  return isBinary || reIsOctal$2.test(value) ? freeParseInt$2(value.slice(2), isBinary ? 2 : 8) : reIsBadHex$2.test(value) ? NAN$2 : +value;
}
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
function values(object) {
  return object ? baseValues(object, keys(object)) : [];
}
var lodash_includes = includes$1;
var boolTag = "[object Boolean]";
var objectProto$5 = Object.prototype;
var objectToString$5 = objectProto$5.toString;
function isBoolean$1(value) {
  return value === true || value === false || isObjectLike$5(value) && objectToString$5.call(value) == boolTag;
}
function isObjectLike$5(value) {
  return !!value && typeof value == "object";
}
var lodash_isboolean = isBoolean$1;
var INFINITY$1 = 1 / 0, MAX_INTEGER$1 = 17976931348623157e292, NAN$1 = 0 / 0;
var symbolTag$1 = "[object Symbol]";
var reTrim$1 = /^\s+|\s+$/g;
var reIsBadHex$1 = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary$1 = /^0b[01]+$/i;
var reIsOctal$1 = /^0o[0-7]+$/i;
var freeParseInt$1 = parseInt;
var objectProto$4 = Object.prototype;
var objectToString$4 = objectProto$4.toString;
function isInteger$1(value) {
  return typeof value == "number" && value == toInteger$1(value);
}
function isObject$1(value) {
  var type = typeof value;
  return !!value && (type == "object" || type == "function");
}
function isObjectLike$4(value) {
  return !!value && typeof value == "object";
}
function isSymbol$1(value) {
  return typeof value == "symbol" || isObjectLike$4(value) && objectToString$4.call(value) == symbolTag$1;
}
function toFinite$1(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber$1(value);
  if (value === INFINITY$1 || value === -INFINITY$1) {
    var sign3 = value < 0 ? -1 : 1;
    return sign3 * MAX_INTEGER$1;
  }
  return value === value ? value : 0;
}
function toInteger$1(value) {
  var result = toFinite$1(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
function toNumber$1(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol$1(value)) {
    return NAN$1;
  }
  if (isObject$1(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject$1(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim$1, "");
  var isBinary = reIsBinary$1.test(value);
  return isBinary || reIsOctal$1.test(value) ? freeParseInt$1(value.slice(2), isBinary ? 2 : 8) : reIsBadHex$1.test(value) ? NAN$1 : +value;
}
var lodash_isinteger = isInteger$1;
var numberTag = "[object Number]";
var objectProto$3 = Object.prototype;
var objectToString$3 = objectProto$3.toString;
function isObjectLike$3(value) {
  return !!value && typeof value == "object";
}
function isNumber$1(value) {
  return typeof value == "number" || isObjectLike$3(value) && objectToString$3.call(value) == numberTag;
}
var lodash_isnumber = isNumber$1;
var objectTag = "[object Object]";
function isHostObject(value) {
  var result = false;
  if (value != null && typeof value.toString != "function") {
    try {
      result = !!(value + "");
    } catch (e) {
    }
  }
  return result;
}
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var funcProto = Function.prototype, objectProto$2 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto$2.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
var objectToString$2 = objectProto$2.toString;
var getPrototype = overArg(Object.getPrototypeOf, Object);
function isObjectLike$2(value) {
  return !!value && typeof value == "object";
}
function isPlainObject$1(value) {
  if (!isObjectLike$2(value) || objectToString$2.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
var lodash_isplainobject = isPlainObject$1;
var stringTag = "[object String]";
var objectProto$1 = Object.prototype;
var objectToString$1 = objectProto$1.toString;
var isArray = Array.isArray;
function isObjectLike$1(value) {
  return !!value && typeof value == "object";
}
function isString$1(value) {
  return typeof value == "string" || !isArray(value) && isObjectLike$1(value) && objectToString$1.call(value) == stringTag;
}
var lodash_isstring = isString$1;
var FUNC_ERROR_TEXT = "Expected a function";
var INFINITY = 1 / 0, MAX_INTEGER = 17976931348623157e292, NAN = 0 / 0;
var symbolTag = "[object Symbol]";
var reTrim = /^\s+|\s+$/g;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
var objectProto = Object.prototype;
var objectToString = objectProto.toString;
function before(n, func) {
  var result;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  n = toInteger(n);
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = void 0;
    }
    return result;
  };
}
function once$1(func) {
  return before(2, func);
}
function isObject(value) {
  var type = typeof value;
  return !!value && (type == "object" || type == "function");
}
function isObjectLike(value) {
  return !!value && typeof value == "object";
}
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
}
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign3 = value < 0 ? -1 : 1;
    return sign3 * MAX_INTEGER;
  }
  return value === value ? value : 0;
}
function toInteger(value) {
  var result = toFinite(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, "");
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var lodash_once = once$1;
const timespan = timespan$2;
const PS_SUPPORTED = psSupported;
const validateAsymmetricKey = validateAsymmetricKey$2;
const jws = jws$3;
const includes = lodash_includes;
const isBoolean = lodash_isboolean;
const isInteger = lodash_isinteger;
const isNumber = lodash_isnumber;
const isPlainObject = lodash_isplainobject;
const isString = lodash_isstring;
const once = lodash_once;
const { KeyObject, createSecretKey, createPrivateKey } = crypto$6;
const SUPPORTED_ALGS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "HS256", "HS384", "HS512", "none"];
if (PS_SUPPORTED) {
  SUPPORTED_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
}
const sign_options_schema = {
  expiresIn: { isValid: function(value) {
    return isInteger(value) || isString(value) && value;
  }, message: '"expiresIn" should be a number of seconds or string representing a timespan' },
  notBefore: { isValid: function(value) {
    return isInteger(value) || isString(value) && value;
  }, message: '"notBefore" should be a number of seconds or string representing a timespan' },
  audience: { isValid: function(value) {
    return isString(value) || Array.isArray(value);
  }, message: '"audience" must be a string or array' },
  algorithm: { isValid: includes.bind(null, SUPPORTED_ALGS), message: '"algorithm" must be a valid string enum value' },
  header: { isValid: isPlainObject, message: '"header" must be an object' },
  encoding: { isValid: isString, message: '"encoding" must be a string' },
  issuer: { isValid: isString, message: '"issuer" must be a string' },
  subject: { isValid: isString, message: '"subject" must be a string' },
  jwtid: { isValid: isString, message: '"jwtid" must be a string' },
  noTimestamp: { isValid: isBoolean, message: '"noTimestamp" must be a boolean' },
  keyid: { isValid: isString, message: '"keyid" must be a string' },
  mutatePayload: { isValid: isBoolean, message: '"mutatePayload" must be a boolean' },
  allowInsecureKeySizes: { isValid: isBoolean, message: '"allowInsecureKeySizes" must be a boolean' },
  allowInvalidAsymmetricKeyTypes: { isValid: isBoolean, message: '"allowInvalidAsymmetricKeyTypes" must be a boolean' }
};
const registered_claims_schema = {
  iat: { isValid: isNumber, message: '"iat" should be a number of seconds' },
  exp: { isValid: isNumber, message: '"exp" should be a number of seconds' },
  nbf: { isValid: isNumber, message: '"nbf" should be a number of seconds' }
};
function validate(schema, allowUnknown, object, parameterName) {
  if (!isPlainObject(object)) {
    throw new Error('Expected "' + parameterName + '" to be a plain object.');
  }
  Object.keys(object).forEach(function(key) {
    const validator = schema[key];
    if (!validator) {
      if (!allowUnknown) {
        throw new Error('"' + key + '" is not allowed in "' + parameterName + '"');
      }
      return;
    }
    if (!validator.isValid(object[key])) {
      throw new Error(validator.message);
    }
  });
}
function validateOptions(options) {
  return validate(sign_options_schema, false, options, "options");
}
function validatePayload(payload) {
  return validate(registered_claims_schema, true, payload, "payload");
}
const options_to_payload = {
  "audience": "aud",
  "issuer": "iss",
  "subject": "sub",
  "jwtid": "jti"
};
const options_for_objects = [
  "expiresIn",
  "notBefore",
  "noTimestamp",
  "audience",
  "issuer",
  "subject",
  "jwtid"
];
var sign2 = function(payload, secretOrPrivateKey, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  } else {
    options = options || {};
  }
  const isObjectPayload = typeof payload === "object" && !Buffer.isBuffer(payload);
  const header = Object.assign({
    alg: options.algorithm || "HS256",
    typ: isObjectPayload ? "JWT" : void 0,
    kid: options.keyid
  }, options.header);
  function failure(err) {
    if (callback) {
      return callback(err);
    }
    throw err;
  }
  if (!secretOrPrivateKey && options.algorithm !== "none") {
    return failure(new Error("secretOrPrivateKey must have a value"));
  }
  if (secretOrPrivateKey != null && !(secretOrPrivateKey instanceof KeyObject)) {
    try {
      secretOrPrivateKey = createPrivateKey(secretOrPrivateKey);
    } catch (_) {
      try {
        secretOrPrivateKey = createSecretKey(typeof secretOrPrivateKey === "string" ? Buffer.from(secretOrPrivateKey) : secretOrPrivateKey);
      } catch (_2) {
        return failure(new Error("secretOrPrivateKey is not valid key material"));
      }
    }
  }
  if (header.alg.startsWith("HS") && secretOrPrivateKey.type !== "secret") {
    return failure(new Error(`secretOrPrivateKey must be a symmetric key when using ${header.alg}`));
  } else if (/^(?:RS|PS|ES)/.test(header.alg)) {
    if (secretOrPrivateKey.type !== "private") {
      return failure(new Error(`secretOrPrivateKey must be an asymmetric key when using ${header.alg}`));
    }
    if (!options.allowInsecureKeySizes && !header.alg.startsWith("ES") && secretOrPrivateKey.asymmetricKeyDetails !== void 0 && //KeyObject.asymmetricKeyDetails is supported in Node 15+
    secretOrPrivateKey.asymmetricKeyDetails.modulusLength < 2048) {
      return failure(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`));
    }
  }
  if (typeof payload === "undefined") {
    return failure(new Error("payload is required"));
  } else if (isObjectPayload) {
    try {
      validatePayload(payload);
    } catch (error2) {
      return failure(error2);
    }
    if (!options.mutatePayload) {
      payload = Object.assign({}, payload);
    }
  } else {
    const invalid_options = options_for_objects.filter(function(opt) {
      return typeof options[opt] !== "undefined";
    });
    if (invalid_options.length > 0) {
      return failure(new Error("invalid " + invalid_options.join(",") + " option for " + typeof payload + " payload"));
    }
  }
  if (typeof payload.exp !== "undefined" && typeof options.expiresIn !== "undefined") {
    return failure(new Error('Bad "options.expiresIn" option the payload already has an "exp" property.'));
  }
  if (typeof payload.nbf !== "undefined" && typeof options.notBefore !== "undefined") {
    return failure(new Error('Bad "options.notBefore" option the payload already has an "nbf" property.'));
  }
  try {
    validateOptions(options);
  } catch (error2) {
    return failure(error2);
  }
  if (!options.allowInvalidAsymmetricKeyTypes) {
    try {
      validateAsymmetricKey(header.alg, secretOrPrivateKey);
    } catch (error2) {
      return failure(error2);
    }
  }
  const timestamp = payload.iat || Math.floor(Date.now() / 1e3);
  if (options.noTimestamp) {
    delete payload.iat;
  } else if (isObjectPayload) {
    payload.iat = timestamp;
  }
  if (typeof options.notBefore !== "undefined") {
    try {
      payload.nbf = timespan(options.notBefore, timestamp);
    } catch (err) {
      return failure(err);
    }
    if (typeof payload.nbf === "undefined") {
      return failure(new Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
    }
  }
  if (typeof options.expiresIn !== "undefined" && typeof payload === "object") {
    try {
      payload.exp = timespan(options.expiresIn, timestamp);
    } catch (err) {
      return failure(err);
    }
    if (typeof payload.exp === "undefined") {
      return failure(new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
    }
  }
  Object.keys(options_to_payload).forEach(function(key) {
    const claim = options_to_payload[key];
    if (typeof options[key] !== "undefined") {
      if (typeof payload[claim] !== "undefined") {
        return failure(new Error('Bad "options.' + key + '" option. The payload already has an "' + claim + '" property.'));
      }
      payload[claim] = options[key];
    }
  });
  const encoding = options.encoding || "utf8";
  if (typeof callback === "function") {
    callback = callback && once(callback);
    jws.createSign({
      header,
      privateKey: secretOrPrivateKey,
      payload,
      encoding
    }).once("error", callback).once("done", function(signature) {
      if (!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256) {
        return callback(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`));
      }
      callback(null, signature);
    });
  } else {
    let signature = jws.sign({ header, payload, secret: secretOrPrivateKey, encoding });
    if (!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256) {
      throw new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`);
    }
    return signature;
  }
};
var jsonwebtoken = {
  decode: decode$1,
  verify: verify2,
  sign: sign2,
  JsonWebTokenError: JsonWebTokenError_1,
  NotBeforeError: NotBeforeError_1,
  TokenExpiredError: TokenExpiredError_1
};
(function(exports) {
  /*! @azure/msal-node v2.16.3 2025-08-05 */
  var http = require$$0$4;
  var https = require$$1$1;
  var uuid = require$$2;
  var crypto2 = crypto$6;
  var jwt = jsonwebtoken;
  var fs2 = require$$0$1;
  var path2 = require$$6;
  class Serializer {
    /**
     * serialize the JSON blob
     * @param data - JSON blob cache
     */
    static serializeJSONBlob(data) {
      return JSON.stringify(data);
    }
    /**
     * Serialize Accounts
     * @param accCache - cache of accounts
     */
    static serializeAccounts(accCache) {
      const accounts = {};
      Object.keys(accCache).map(function(key) {
        var _a;
        const accountEntity = accCache[key];
        accounts[key] = {
          home_account_id: accountEntity.homeAccountId,
          environment: accountEntity.environment,
          realm: accountEntity.realm,
          local_account_id: accountEntity.localAccountId,
          username: accountEntity.username,
          authority_type: accountEntity.authorityType,
          name: accountEntity.name,
          client_info: accountEntity.clientInfo,
          last_modification_time: accountEntity.lastModificationTime,
          last_modification_app: accountEntity.lastModificationApp,
          tenantProfiles: (_a = accountEntity.tenantProfiles) == null ? void 0 : _a.map((tenantProfile) => {
            return JSON.stringify(tenantProfile);
          })
        };
      });
      return accounts;
    }
    /**
     * Serialize IdTokens
     * @param idTCache - cache of ID tokens
     */
    static serializeIdTokens(idTCache) {
      const idTokens = {};
      Object.keys(idTCache).map(function(key) {
        const idTEntity = idTCache[key];
        idTokens[key] = {
          home_account_id: idTEntity.homeAccountId,
          environment: idTEntity.environment,
          credential_type: idTEntity.credentialType,
          client_id: idTEntity.clientId,
          secret: idTEntity.secret,
          realm: idTEntity.realm
        };
      });
      return idTokens;
    }
    /**
     * Serializes AccessTokens
     * @param atCache - cache of access tokens
     */
    static serializeAccessTokens(atCache) {
      const accessTokens = {};
      Object.keys(atCache).map(function(key) {
        const atEntity = atCache[key];
        accessTokens[key] = {
          home_account_id: atEntity.homeAccountId,
          environment: atEntity.environment,
          credential_type: atEntity.credentialType,
          client_id: atEntity.clientId,
          secret: atEntity.secret,
          realm: atEntity.realm,
          target: atEntity.target,
          cached_at: atEntity.cachedAt,
          expires_on: atEntity.expiresOn,
          extended_expires_on: atEntity.extendedExpiresOn,
          refresh_on: atEntity.refreshOn,
          key_id: atEntity.keyId,
          token_type: atEntity.tokenType,
          requestedClaims: atEntity.requestedClaims,
          requestedClaimsHash: atEntity.requestedClaimsHash,
          userAssertionHash: atEntity.userAssertionHash
        };
      });
      return accessTokens;
    }
    /**
     * Serialize refreshTokens
     * @param rtCache - cache of refresh tokens
     */
    static serializeRefreshTokens(rtCache) {
      const refreshTokens = {};
      Object.keys(rtCache).map(function(key) {
        const rtEntity = rtCache[key];
        refreshTokens[key] = {
          home_account_id: rtEntity.homeAccountId,
          environment: rtEntity.environment,
          credential_type: rtEntity.credentialType,
          client_id: rtEntity.clientId,
          secret: rtEntity.secret,
          family_id: rtEntity.familyId,
          target: rtEntity.target,
          realm: rtEntity.realm
        };
      });
      return refreshTokens;
    }
    /**
     * Serialize amdtCache
     * @param amdtCache - cache of app metadata
     */
    static serializeAppMetadata(amdtCache) {
      const appMetadata = {};
      Object.keys(amdtCache).map(function(key) {
        const amdtEntity = amdtCache[key];
        appMetadata[key] = {
          client_id: amdtEntity.clientId,
          environment: amdtEntity.environment,
          family_id: amdtEntity.familyId
        };
      });
      return appMetadata;
    }
    /**
     * Serialize the cache
     * @param inMemCache - itemised cache read from the JSON
     */
    static serializeAllCache(inMemCache) {
      return {
        Account: this.serializeAccounts(inMemCache.accounts),
        IdToken: this.serializeIdTokens(inMemCache.idTokens),
        AccessToken: this.serializeAccessTokens(inMemCache.accessTokens),
        RefreshToken: this.serializeRefreshTokens(inMemCache.refreshTokens),
        AppMetadata: this.serializeAppMetadata(inMemCache.appMetadata)
      };
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const Constants$1 = {
    LIBRARY_NAME: "MSAL.JS",
    SKU: "msal.js.common",
    // Prefix for all library cache entries
    CACHE_PREFIX: "msal",
    // default authority
    DEFAULT_AUTHORITY: "https://login.microsoftonline.com/common/",
    DEFAULT_AUTHORITY_HOST: "login.microsoftonline.com",
    DEFAULT_COMMON_TENANT: "common",
    // ADFS String
    ADFS: "adfs",
    DSTS: "dstsv2",
    // Default AAD Instance Discovery Endpoint
    AAD_INSTANCE_DISCOVERY_ENDPT: "https://login.microsoftonline.com/common/discovery/instance?api-version=1.1&authorization_endpoint=",
    // CIAM URL
    CIAM_AUTH_URL: ".ciamlogin.com",
    AAD_TENANT_DOMAIN_SUFFIX: ".onmicrosoft.com",
    // Resource delimiter - used for certain cache entries
    RESOURCE_DELIM: "|",
    // Placeholder for non-existent account ids/objects
    NO_ACCOUNT: "NO_ACCOUNT",
    // Claims
    CLAIMS: "claims",
    // Consumer UTID
    CONSUMER_UTID: "9188040d-6c67-4c5b-b112-36a304b66dad",
    // Default scopes
    OPENID_SCOPE: "openid",
    PROFILE_SCOPE: "profile",
    OFFLINE_ACCESS_SCOPE: "offline_access",
    EMAIL_SCOPE: "email",
    // Default response type for authorization code flow
    CODE_RESPONSE_TYPE: "code",
    CODE_GRANT_TYPE: "authorization_code",
    RT_GRANT_TYPE: "refresh_token",
    FRAGMENT_RESPONSE_MODE: "fragment",
    S256_CODE_CHALLENGE_METHOD: "S256",
    URL_FORM_CONTENT_TYPE: "application/x-www-form-urlencoded;charset=utf-8",
    AUTHORIZATION_PENDING: "authorization_pending",
    NOT_DEFINED: "not_defined",
    EMPTY_STRING: "",
    NOT_APPLICABLE: "N/A",
    NOT_AVAILABLE: "Not Available",
    FORWARD_SLASH: "/",
    IMDS_ENDPOINT: "http://169.254.169.254/metadata/instance/compute/location",
    IMDS_VERSION: "2020-06-01",
    IMDS_TIMEOUT: 2e3,
    AZURE_REGION_AUTO_DISCOVER_FLAG: "TryAutoDetect",
    REGIONAL_AUTH_PUBLIC_CLOUD_SUFFIX: "login.microsoft.com",
    KNOWN_PUBLIC_CLOUDS: [
      "login.microsoftonline.com",
      "login.windows.net",
      "login.microsoft.com",
      "sts.windows.net"
    ],
    TOKEN_RESPONSE_TYPE: "token",
    ID_TOKEN_RESPONSE_TYPE: "id_token",
    SHR_NONCE_VALIDITY: 240,
    INVALID_INSTANCE: "invalid_instance"
  };
  const HttpStatus = {
    SUCCESS_RANGE_START: 200,
    SUCCESS_RANGE_END: 299,
    REDIRECT: 302,
    CLIENT_ERROR_RANGE_START: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    REQUEST_TIMEOUT: 408,
    TOO_MANY_REQUESTS: 429,
    CLIENT_ERROR_RANGE_END: 499,
    SERVER_ERROR: 500,
    SERVER_ERROR_RANGE_START: 500,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    SERVER_ERROR_RANGE_END: 599
  };
  const OIDC_DEFAULT_SCOPES = [
    Constants$1.OPENID_SCOPE,
    Constants$1.PROFILE_SCOPE,
    Constants$1.OFFLINE_ACCESS_SCOPE
  ];
  const OIDC_SCOPES = [...OIDC_DEFAULT_SCOPES, Constants$1.EMAIL_SCOPE];
  const HeaderNames = {
    CONTENT_TYPE: "Content-Type",
    CONTENT_LENGTH: "Content-Length",
    RETRY_AFTER: "Retry-After",
    CCS_HEADER: "X-AnchorMailbox",
    WWWAuthenticate: "WWW-Authenticate",
    AuthenticationInfo: "Authentication-Info",
    X_MS_REQUEST_ID: "x-ms-request-id",
    X_MS_HTTP_VERSION: "x-ms-httpver"
  };
  const AADAuthorityConstants = {
    COMMON: "common",
    ORGANIZATIONS: "organizations",
    CONSUMERS: "consumers"
  };
  const ClaimsRequestKeys = {
    ACCESS_TOKEN: "access_token",
    XMS_CC: "xms_cc"
  };
  const PromptValue = {
    LOGIN: "login",
    SELECT_ACCOUNT: "select_account",
    CONSENT: "consent",
    NONE: "none",
    CREATE: "create",
    NO_SESSION: "no_session"
  };
  const CodeChallengeMethodValues = {
    PLAIN: "plain",
    S256: "S256"
  };
  const ServerResponseType = {
    QUERY: "query",
    FRAGMENT: "fragment"
  };
  const ResponseMode = {
    ...ServerResponseType,
    FORM_POST: "form_post"
  };
  const GrantType = {
    AUTHORIZATION_CODE_GRANT: "authorization_code",
    CLIENT_CREDENTIALS_GRANT: "client_credentials",
    RESOURCE_OWNER_PASSWORD_GRANT: "password",
    REFRESH_TOKEN_GRANT: "refresh_token",
    DEVICE_CODE_GRANT: "device_code",
    JWT_BEARER: "urn:ietf:params:oauth:grant-type:jwt-bearer"
  };
  const CacheAccountType = {
    MSSTS_ACCOUNT_TYPE: "MSSTS",
    ADFS_ACCOUNT_TYPE: "ADFS",
    GENERIC_ACCOUNT_TYPE: "Generic"
    // NTLM, Kerberos, FBA, Basic etc
  };
  const Separators = {
    CACHE_KEY_SEPARATOR: "-",
    CLIENT_INFO_SEPARATOR: "."
  };
  const CredentialType = {
    ID_TOKEN: "IdToken",
    ACCESS_TOKEN: "AccessToken",
    ACCESS_TOKEN_WITH_AUTH_SCHEME: "AccessToken_With_AuthScheme",
    REFRESH_TOKEN: "RefreshToken"
  };
  const APP_METADATA = "appmetadata";
  const CLIENT_INFO = "client_info";
  const THE_FAMILY_ID = "1";
  const AUTHORITY_METADATA_CONSTANTS = {
    CACHE_KEY: "authority-metadata",
    REFRESH_TIME_SECONDS: 3600 * 24
    // 24 Hours
  };
  const AuthorityMetadataSource = {
    CONFIG: "config",
    CACHE: "cache",
    NETWORK: "network",
    HARDCODED_VALUES: "hardcoded_values"
  };
  const SERVER_TELEM_CONSTANTS = {
    SCHEMA_VERSION: 5,
    MAX_LAST_HEADER_BYTES: 330,
    MAX_CACHED_ERRORS: 50,
    CACHE_KEY: "server-telemetry",
    CATEGORY_SEPARATOR: "|",
    VALUE_SEPARATOR: ",",
    OVERFLOW_TRUE: "1",
    OVERFLOW_FALSE: "0",
    UNKNOWN_ERROR: "unknown_error"
  };
  const AuthenticationScheme = {
    BEARER: "Bearer",
    POP: "pop",
    SSH: "ssh-cert"
  };
  const ThrottlingConstants = {
    // Default time to throttle RequestThumbprint in seconds
    DEFAULT_THROTTLE_TIME_SECONDS: 60,
    // Default maximum time to throttle in seconds, overrides what the server sends back
    DEFAULT_MAX_THROTTLE_TIME_SECONDS: 3600,
    // Prefix for storing throttling entries
    THROTTLING_PREFIX: "throttling",
    // Value assigned to the x-ms-lib-capability header to indicate to the server the library supports throttling
    X_MS_LIB_CAPABILITY_VALUE: "retry-after, h429"
  };
  const Errors = {
    INVALID_GRANT_ERROR: "invalid_grant",
    CLIENT_MISMATCH_ERROR: "client_mismatch"
  };
  const PasswordGrantConstants = {
    username: "username",
    password: "password"
  };
  const ResponseCodes = {
    httpSuccess: 200,
    httpBadRequest: 400
  };
  const RegionDiscoverySources = {
    FAILED_AUTO_DETECTION: "1",
    INTERNAL_CACHE: "2",
    ENVIRONMENT_VARIABLE: "3",
    IMDS: "4"
  };
  const RegionDiscoveryOutcomes = {
    CONFIGURED_NO_AUTO_DETECTION: "2",
    AUTO_DETECTION_REQUESTED_SUCCESSFUL: "4",
    AUTO_DETECTION_REQUESTED_FAILED: "5"
  };
  const CacheOutcome = {
    // When a token is found in the cache or the cache is not supposed to be hit when making the request
    NOT_APPLICABLE: "0",
    // When the token request goes to the identity provider because force_refresh was set to true. Also occurs if claims were requested
    FORCE_REFRESH_OR_CLAIMS: "1",
    // When the token request goes to the identity provider because no cached access token exists
    NO_CACHED_ACCESS_TOKEN: "2",
    // When the token request goes to the identity provider because cached access token expired
    CACHED_ACCESS_TOKEN_EXPIRED: "3",
    // When the token request goes to the identity provider because refresh_in was used and the existing token needs to be refreshed
    PROACTIVELY_REFRESHED: "4"
  };
  const DEFAULT_TOKEN_RENEWAL_OFFSET_SEC = 300;
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const unexpectedError = "unexpected_error";
  const postRequestFailed = "post_request_failed";
  var AuthErrorCodes = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    postRequestFailed,
    unexpectedError
  });
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const AuthErrorMessages = {
    [unexpectedError]: "Unexpected error in authentication.",
    [postRequestFailed]: "Post request failed from the network, could be a 4xx/5xx or a network unavailability. Please check the exact error code for details."
  };
  const AuthErrorMessage = {
    unexpectedError: {
      code: unexpectedError,
      desc: AuthErrorMessages[unexpectedError]
    },
    postRequestFailed: {
      code: postRequestFailed,
      desc: AuthErrorMessages[postRequestFailed]
    }
  };
  class AuthError extends Error {
    constructor(errorCode, errorMessage, suberror) {
      const errorString = errorMessage ? `${errorCode}: ${errorMessage}` : errorCode;
      super(errorString);
      Object.setPrototypeOf(this, AuthError.prototype);
      this.errorCode = errorCode || Constants$1.EMPTY_STRING;
      this.errorMessage = errorMessage || Constants$1.EMPTY_STRING;
      this.subError = suberror || Constants$1.EMPTY_STRING;
      this.name = "AuthError";
    }
    setCorrelationId(correlationId) {
      this.correlationId = correlationId;
    }
  }
  function createAuthError(code, additionalMessage) {
    return new AuthError(code, additionalMessage ? `${AuthErrorMessages[code]} ${additionalMessage}` : AuthErrorMessages[code]);
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const clientInfoDecodingError = "client_info_decoding_error";
  const clientInfoEmptyError = "client_info_empty_error";
  const tokenParsingError = "token_parsing_error";
  const nullOrEmptyToken = "null_or_empty_token";
  const endpointResolutionError = "endpoints_resolution_error";
  const networkError = "network_error";
  const openIdConfigError = "openid_config_error";
  const hashNotDeserialized = "hash_not_deserialized";
  const invalidState = "invalid_state";
  const stateMismatch = "state_mismatch";
  const stateNotFound = "state_not_found";
  const nonceMismatch = "nonce_mismatch";
  const authTimeNotFound = "auth_time_not_found";
  const maxAgeTranspired = "max_age_transpired";
  const multipleMatchingTokens = "multiple_matching_tokens";
  const multipleMatchingAccounts = "multiple_matching_accounts";
  const multipleMatchingAppMetadata = "multiple_matching_appMetadata";
  const requestCannotBeMade = "request_cannot_be_made";
  const cannotRemoveEmptyScope = "cannot_remove_empty_scope";
  const cannotAppendScopeSet = "cannot_append_scopeset";
  const emptyInputScopeSet = "empty_input_scopeset";
  const deviceCodePollingCancelled = "device_code_polling_cancelled";
  const deviceCodeExpired = "device_code_expired";
  const deviceCodeUnknownError = "device_code_unknown_error";
  const noAccountInSilentRequest = "no_account_in_silent_request";
  const invalidCacheRecord = "invalid_cache_record";
  const invalidCacheEnvironment = "invalid_cache_environment";
  const noAccountFound = "no_account_found";
  const noCryptoObject = "no_crypto_object";
  const unexpectedCredentialType = "unexpected_credential_type";
  const invalidAssertion = "invalid_assertion";
  const invalidClientCredential = "invalid_client_credential";
  const tokenRefreshRequired = "token_refresh_required";
  const userTimeoutReached = "user_timeout_reached";
  const tokenClaimsCnfRequiredForSignedJwt = "token_claims_cnf_required_for_signedjwt";
  const authorizationCodeMissingFromServerResponse = "authorization_code_missing_from_server_response";
  const bindingKeyNotRemoved = "binding_key_not_removed";
  const endSessionEndpointNotSupported = "end_session_endpoint_not_supported";
  const keyIdMissing = "key_id_missing";
  const noNetworkConnectivity = "no_network_connectivity";
  const userCanceled = "user_canceled";
  const missingTenantIdError = "missing_tenant_id_error";
  const methodNotImplemented = "method_not_implemented";
  const nestedAppAuthBridgeDisabled = "nested_app_auth_bridge_disabled";
  var ClientAuthErrorCodes = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    authTimeNotFound,
    authorizationCodeMissingFromServerResponse,
    bindingKeyNotRemoved,
    cannotAppendScopeSet,
    cannotRemoveEmptyScope,
    clientInfoDecodingError,
    clientInfoEmptyError,
    deviceCodeExpired,
    deviceCodePollingCancelled,
    deviceCodeUnknownError,
    emptyInputScopeSet,
    endSessionEndpointNotSupported,
    endpointResolutionError,
    hashNotDeserialized,
    invalidAssertion,
    invalidCacheEnvironment,
    invalidCacheRecord,
    invalidClientCredential,
    invalidState,
    keyIdMissing,
    maxAgeTranspired,
    methodNotImplemented,
    missingTenantIdError,
    multipleMatchingAccounts,
    multipleMatchingAppMetadata,
    multipleMatchingTokens,
    nestedAppAuthBridgeDisabled,
    networkError,
    noAccountFound,
    noAccountInSilentRequest,
    noCryptoObject,
    noNetworkConnectivity,
    nonceMismatch,
    nullOrEmptyToken,
    openIdConfigError,
    requestCannotBeMade,
    stateMismatch,
    stateNotFound,
    tokenClaimsCnfRequiredForSignedJwt,
    tokenParsingError,
    tokenRefreshRequired,
    unexpectedCredentialType,
    userCanceled,
    userTimeoutReached
  });
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const ClientAuthErrorMessages = {
    [clientInfoDecodingError]: "The client info could not be parsed/decoded correctly",
    [clientInfoEmptyError]: "The client info was empty",
    [tokenParsingError]: "Token cannot be parsed",
    [nullOrEmptyToken]: "The token is null or empty",
    [endpointResolutionError]: "Endpoints cannot be resolved",
    [networkError]: "Network request failed",
    [openIdConfigError]: "Could not retrieve endpoints. Check your authority and verify the .well-known/openid-configuration endpoint returns the required endpoints.",
    [hashNotDeserialized]: "The hash parameters could not be deserialized",
    [invalidState]: "State was not the expected format",
    [stateMismatch]: "State mismatch error",
    [stateNotFound]: "State not found",
    [nonceMismatch]: "Nonce mismatch error",
    [authTimeNotFound]: "Max Age was requested and the ID token is missing the auth_time variable. auth_time is an optional claim and is not enabled by default - it must be enabled. See https://aka.ms/msaljs/optional-claims for more information.",
    [maxAgeTranspired]: "Max Age is set to 0, or too much time has elapsed since the last end-user authentication.",
    [multipleMatchingTokens]: "The cache contains multiple tokens satisfying the requirements. Call AcquireToken again providing more requirements such as authority or account.",
    [multipleMatchingAccounts]: "The cache contains multiple accounts satisfying the given parameters. Please pass more info to obtain the correct account",
    [multipleMatchingAppMetadata]: "The cache contains multiple appMetadata satisfying the given parameters. Please pass more info to obtain the correct appMetadata",
    [requestCannotBeMade]: "Token request cannot be made without authorization code or refresh token.",
    [cannotRemoveEmptyScope]: "Cannot remove null or empty scope from ScopeSet",
    [cannotAppendScopeSet]: "Cannot append ScopeSet",
    [emptyInputScopeSet]: "Empty input ScopeSet cannot be processed",
    [deviceCodePollingCancelled]: "Caller has cancelled token endpoint polling during device code flow by setting DeviceCodeRequest.cancel = true.",
    [deviceCodeExpired]: "Device code is expired.",
    [deviceCodeUnknownError]: "Device code stopped polling for unknown reasons.",
    [noAccountInSilentRequest]: "Please pass an account object, silent flow is not supported without account information",
    [invalidCacheRecord]: "Cache record object was null or undefined.",
    [invalidCacheEnvironment]: "Invalid environment when attempting to create cache entry",
    [noAccountFound]: "No account found in cache for given key.",
    [noCryptoObject]: "No crypto object detected.",
    [unexpectedCredentialType]: "Unexpected credential type.",
    [invalidAssertion]: "Client assertion must meet requirements described in https://tools.ietf.org/html/rfc7515",
    [invalidClientCredential]: "Client credential (secret, certificate, or assertion) must not be empty when creating a confidential client. An application should at most have one credential",
    [tokenRefreshRequired]: "Cannot return token from cache because it must be refreshed. This may be due to one of the following reasons: forceRefresh parameter is set to true, claims have been requested, there is no cached access token or it is expired.",
    [userTimeoutReached]: "User defined timeout for device code polling reached",
    [tokenClaimsCnfRequiredForSignedJwt]: "Cannot generate a POP jwt if the token_claims are not populated",
    [authorizationCodeMissingFromServerResponse]: "Server response does not contain an authorization code to proceed",
    [bindingKeyNotRemoved]: "Could not remove the credential's binding key from storage.",
    [endSessionEndpointNotSupported]: "The provided authority does not support logout",
    [keyIdMissing]: "A keyId value is missing from the requested bound token's cache record and is required to match the token to it's stored binding key.",
    [noNetworkConnectivity]: "No network connectivity. Check your internet connection.",
    [userCanceled]: "User cancelled the flow.",
    [missingTenantIdError]: "A tenant id - not common, organizations, or consumers - must be specified when using the client_credentials flow.",
    [methodNotImplemented]: "This method has not been implemented",
    [nestedAppAuthBridgeDisabled]: "The nested app auth bridge is disabled"
  };
  const ClientAuthErrorMessage = {
    clientInfoDecodingError: {
      code: clientInfoDecodingError,
      desc: ClientAuthErrorMessages[clientInfoDecodingError]
    },
    clientInfoEmptyError: {
      code: clientInfoEmptyError,
      desc: ClientAuthErrorMessages[clientInfoEmptyError]
    },
    tokenParsingError: {
      code: tokenParsingError,
      desc: ClientAuthErrorMessages[tokenParsingError]
    },
    nullOrEmptyToken: {
      code: nullOrEmptyToken,
      desc: ClientAuthErrorMessages[nullOrEmptyToken]
    },
    endpointResolutionError: {
      code: endpointResolutionError,
      desc: ClientAuthErrorMessages[endpointResolutionError]
    },
    networkError: {
      code: networkError,
      desc: ClientAuthErrorMessages[networkError]
    },
    unableToGetOpenidConfigError: {
      code: openIdConfigError,
      desc: ClientAuthErrorMessages[openIdConfigError]
    },
    hashNotDeserialized: {
      code: hashNotDeserialized,
      desc: ClientAuthErrorMessages[hashNotDeserialized]
    },
    invalidStateError: {
      code: invalidState,
      desc: ClientAuthErrorMessages[invalidState]
    },
    stateMismatchError: {
      code: stateMismatch,
      desc: ClientAuthErrorMessages[stateMismatch]
    },
    stateNotFoundError: {
      code: stateNotFound,
      desc: ClientAuthErrorMessages[stateNotFound]
    },
    nonceMismatchError: {
      code: nonceMismatch,
      desc: ClientAuthErrorMessages[nonceMismatch]
    },
    authTimeNotFoundError: {
      code: authTimeNotFound,
      desc: ClientAuthErrorMessages[authTimeNotFound]
    },
    maxAgeTranspired: {
      code: maxAgeTranspired,
      desc: ClientAuthErrorMessages[maxAgeTranspired]
    },
    multipleMatchingTokens: {
      code: multipleMatchingTokens,
      desc: ClientAuthErrorMessages[multipleMatchingTokens]
    },
    multipleMatchingAccounts: {
      code: multipleMatchingAccounts,
      desc: ClientAuthErrorMessages[multipleMatchingAccounts]
    },
    multipleMatchingAppMetadata: {
      code: multipleMatchingAppMetadata,
      desc: ClientAuthErrorMessages[multipleMatchingAppMetadata]
    },
    tokenRequestCannotBeMade: {
      code: requestCannotBeMade,
      desc: ClientAuthErrorMessages[requestCannotBeMade]
    },
    removeEmptyScopeError: {
      code: cannotRemoveEmptyScope,
      desc: ClientAuthErrorMessages[cannotRemoveEmptyScope]
    },
    appendScopeSetError: {
      code: cannotAppendScopeSet,
      desc: ClientAuthErrorMessages[cannotAppendScopeSet]
    },
    emptyInputScopeSetError: {
      code: emptyInputScopeSet,
      desc: ClientAuthErrorMessages[emptyInputScopeSet]
    },
    DeviceCodePollingCancelled: {
      code: deviceCodePollingCancelled,
      desc: ClientAuthErrorMessages[deviceCodePollingCancelled]
    },
    DeviceCodeExpired: {
      code: deviceCodeExpired,
      desc: ClientAuthErrorMessages[deviceCodeExpired]
    },
    DeviceCodeUnknownError: {
      code: deviceCodeUnknownError,
      desc: ClientAuthErrorMessages[deviceCodeUnknownError]
    },
    NoAccountInSilentRequest: {
      code: noAccountInSilentRequest,
      desc: ClientAuthErrorMessages[noAccountInSilentRequest]
    },
    invalidCacheRecord: {
      code: invalidCacheRecord,
      desc: ClientAuthErrorMessages[invalidCacheRecord]
    },
    invalidCacheEnvironment: {
      code: invalidCacheEnvironment,
      desc: ClientAuthErrorMessages[invalidCacheEnvironment]
    },
    noAccountFound: {
      code: noAccountFound,
      desc: ClientAuthErrorMessages[noAccountFound]
    },
    noCryptoObj: {
      code: noCryptoObject,
      desc: ClientAuthErrorMessages[noCryptoObject]
    },
    unexpectedCredentialType: {
      code: unexpectedCredentialType,
      desc: ClientAuthErrorMessages[unexpectedCredentialType]
    },
    invalidAssertion: {
      code: invalidAssertion,
      desc: ClientAuthErrorMessages[invalidAssertion]
    },
    invalidClientCredential: {
      code: invalidClientCredential,
      desc: ClientAuthErrorMessages[invalidClientCredential]
    },
    tokenRefreshRequired: {
      code: tokenRefreshRequired,
      desc: ClientAuthErrorMessages[tokenRefreshRequired]
    },
    userTimeoutReached: {
      code: userTimeoutReached,
      desc: ClientAuthErrorMessages[userTimeoutReached]
    },
    tokenClaimsRequired: {
      code: tokenClaimsCnfRequiredForSignedJwt,
      desc: ClientAuthErrorMessages[tokenClaimsCnfRequiredForSignedJwt]
    },
    noAuthorizationCodeFromServer: {
      code: authorizationCodeMissingFromServerResponse,
      desc: ClientAuthErrorMessages[authorizationCodeMissingFromServerResponse]
    },
    bindingKeyNotRemovedError: {
      code: bindingKeyNotRemoved,
      desc: ClientAuthErrorMessages[bindingKeyNotRemoved]
    },
    logoutNotSupported: {
      code: endSessionEndpointNotSupported,
      desc: ClientAuthErrorMessages[endSessionEndpointNotSupported]
    },
    keyIdMissing: {
      code: keyIdMissing,
      desc: ClientAuthErrorMessages[keyIdMissing]
    },
    noNetworkConnectivity: {
      code: noNetworkConnectivity,
      desc: ClientAuthErrorMessages[noNetworkConnectivity]
    },
    userCanceledError: {
      code: userCanceled,
      desc: ClientAuthErrorMessages[userCanceled]
    },
    missingTenantIdError: {
      code: missingTenantIdError,
      desc: ClientAuthErrorMessages[missingTenantIdError]
    },
    nestedAppAuthBridgeDisabled: {
      code: nestedAppAuthBridgeDisabled,
      desc: ClientAuthErrorMessages[nestedAppAuthBridgeDisabled]
    }
  };
  class ClientAuthError extends AuthError {
    constructor(errorCode, additionalMessage) {
      super(errorCode, additionalMessage ? `${ClientAuthErrorMessages[errorCode]}: ${additionalMessage}` : ClientAuthErrorMessages[errorCode]);
      this.name = "ClientAuthError";
      Object.setPrototypeOf(this, ClientAuthError.prototype);
    }
  }
  function createClientAuthError(errorCode, additionalMessage) {
    return new ClientAuthError(errorCode, additionalMessage);
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const DEFAULT_CRYPTO_IMPLEMENTATION = {
    createNewGuid: () => {
      throw createClientAuthError(methodNotImplemented);
    },
    base64Decode: () => {
      throw createClientAuthError(methodNotImplemented);
    },
    base64Encode: () => {
      throw createClientAuthError(methodNotImplemented);
    },
    base64UrlEncode: () => {
      throw createClientAuthError(methodNotImplemented);
    },
    encodeKid: () => {
      throw createClientAuthError(methodNotImplemented);
    },
    async getPublicKeyThumbprint() {
      throw createClientAuthError(methodNotImplemented);
    },
    async removeTokenBindingKey() {
      throw createClientAuthError(methodNotImplemented);
    },
    async clearKeystore() {
      throw createClientAuthError(methodNotImplemented);
    },
    async signJwt() {
      throw createClientAuthError(methodNotImplemented);
    },
    async hashString() {
      throw createClientAuthError(methodNotImplemented);
    }
  };
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  exports.LogLevel = void 0;
  (function(LogLevel) {
    LogLevel[LogLevel["Error"] = 0] = "Error";
    LogLevel[LogLevel["Warning"] = 1] = "Warning";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Verbose"] = 3] = "Verbose";
    LogLevel[LogLevel["Trace"] = 4] = "Trace";
  })(exports.LogLevel || (exports.LogLevel = {}));
  class Logger {
    constructor(loggerOptions, packageName, packageVersion) {
      this.level = exports.LogLevel.Info;
      const defaultLoggerCallback = () => {
        return;
      };
      const setLoggerOptions = loggerOptions || Logger.createDefaultLoggerOptions();
      this.localCallback = setLoggerOptions.loggerCallback || defaultLoggerCallback;
      this.piiLoggingEnabled = setLoggerOptions.piiLoggingEnabled || false;
      this.level = typeof setLoggerOptions.logLevel === "number" ? setLoggerOptions.logLevel : exports.LogLevel.Info;
      this.correlationId = setLoggerOptions.correlationId || Constants$1.EMPTY_STRING;
      this.packageName = packageName || Constants$1.EMPTY_STRING;
      this.packageVersion = packageVersion || Constants$1.EMPTY_STRING;
    }
    static createDefaultLoggerOptions() {
      return {
        loggerCallback: () => {
        },
        piiLoggingEnabled: false,
        logLevel: exports.LogLevel.Info
      };
    }
    /**
     * Create new Logger with existing configurations.
     */
    clone(packageName, packageVersion, correlationId) {
      return new Logger({
        loggerCallback: this.localCallback,
        piiLoggingEnabled: this.piiLoggingEnabled,
        logLevel: this.level,
        correlationId: correlationId || this.correlationId
      }, packageName, packageVersion);
    }
    /**
     * Log message with required options.
     */
    logMessage(logMessage, options) {
      if (options.logLevel > this.level || !this.piiLoggingEnabled && options.containsPii) {
        return;
      }
      const timestamp = (/* @__PURE__ */ new Date()).toUTCString();
      const logHeader = `[${timestamp}] : [${options.correlationId || this.correlationId || ""}]`;
      const log = `${logHeader} : ${this.packageName}@${this.packageVersion} : ${exports.LogLevel[options.logLevel]} - ${logMessage}`;
      this.executeCallback(options.logLevel, log, options.containsPii || false);
    }
    /**
     * Execute callback with message.
     */
    executeCallback(level, message, containsPii) {
      if (this.localCallback) {
        this.localCallback(level, message, containsPii);
      }
    }
    /**
     * Logs error messages.
     */
    error(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Error,
        containsPii: false,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs error messages with PII.
     */
    errorPii(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Error,
        containsPii: true,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs warning messages.
     */
    warning(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Warning,
        containsPii: false,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs warning messages with PII.
     */
    warningPii(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Warning,
        containsPii: true,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs info messages.
     */
    info(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Info,
        containsPii: false,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs info messages with PII.
     */
    infoPii(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Info,
        containsPii: true,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs verbose messages.
     */
    verbose(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Verbose,
        containsPii: false,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs verbose messages with PII.
     */
    verbosePii(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Verbose,
        containsPii: true,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs trace messages.
     */
    trace(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Trace,
        containsPii: false,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Logs trace messages with PII.
     */
    tracePii(message, correlationId) {
      this.logMessage(message, {
        logLevel: exports.LogLevel.Trace,
        containsPii: true,
        correlationId: correlationId || Constants$1.EMPTY_STRING
      });
    }
    /**
     * Returns whether PII Logging is enabled or not.
     */
    isPiiLoggingEnabled() {
      return this.piiLoggingEnabled || false;
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const name$1 = "@azure/msal-common";
  const version$1 = "14.16.1";
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const AzureCloudInstance = {
    // AzureCloudInstance is not specified.
    None: "none",
    // Microsoft Azure public cloud
    AzurePublic: "https://login.microsoftonline.com",
    // Microsoft PPE
    AzurePpe: "https://login.windows-ppe.net",
    // Microsoft Chinese national/regional cloud
    AzureChina: "https://login.chinacloudapi.cn",
    // Microsoft German national/regional cloud ("Black Forest")
    AzureGermany: "https://login.microsoftonline.de",
    // US Government cloud
    AzureUsGovernment: "https://login.microsoftonline.us"
  };
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function extractTokenClaims(encodedToken, base64Decode) {
    const jswPayload = getJWSPayload(encodedToken);
    try {
      const base64Decoded = base64Decode(jswPayload);
      return JSON.parse(base64Decoded);
    } catch (err) {
      throw createClientAuthError(tokenParsingError);
    }
  }
  function getJWSPayload(authToken) {
    if (!authToken) {
      throw createClientAuthError(nullOrEmptyToken);
    }
    const tokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;
    const matches = tokenPartsRegex.exec(authToken);
    if (!matches || matches.length < 4) {
      throw createClientAuthError(tokenParsingError);
    }
    return matches[2];
  }
  function checkMaxAge(authTime, maxAge) {
    const fiveMinuteSkew = 3e5;
    if (maxAge === 0 || Date.now() - fiveMinuteSkew > authTime + maxAge) {
      throw createClientAuthError(maxAgeTranspired);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function nowSeconds() {
    return Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
  }
  function isTokenExpired(expiresOn, offset) {
    const expirationSec = Number(expiresOn) || 0;
    const offsetCurrentTimeSec = nowSeconds() + offset;
    return offsetCurrentTimeSec > expirationSec;
  }
  function wasClockTurnedBack(cachedAt) {
    const cachedAtSec = Number(cachedAt);
    return cachedAtSec > nowSeconds();
  }
  function delay(t2, value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), t2));
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function generateCredentialKey(credentialEntity) {
    const credentialKey = [
      generateAccountId(credentialEntity),
      generateCredentialId(credentialEntity),
      generateTarget(credentialEntity),
      generateClaimsHash(credentialEntity),
      generateScheme(credentialEntity)
    ];
    return credentialKey.join(Separators.CACHE_KEY_SEPARATOR).toLowerCase();
  }
  function createIdTokenEntity(homeAccountId, environment, idToken, clientId, tenantId) {
    const idTokenEntity = {
      credentialType: CredentialType.ID_TOKEN,
      homeAccountId,
      environment,
      clientId,
      secret: idToken,
      realm: tenantId
    };
    return idTokenEntity;
  }
  function createAccessTokenEntity(homeAccountId, environment, accessToken, clientId, tenantId, scopes, expiresOn, extExpiresOn, base64Decode, refreshOn, tokenType, userAssertionHash, keyId, requestedClaims, requestedClaimsHash) {
    var _a, _b;
    const atEntity = {
      homeAccountId,
      credentialType: CredentialType.ACCESS_TOKEN,
      secret: accessToken,
      cachedAt: nowSeconds().toString(),
      expiresOn: expiresOn.toString(),
      extendedExpiresOn: extExpiresOn.toString(),
      environment,
      clientId,
      realm: tenantId,
      target: scopes,
      tokenType: tokenType || AuthenticationScheme.BEARER
    };
    if (userAssertionHash) {
      atEntity.userAssertionHash = userAssertionHash;
    }
    if (refreshOn) {
      atEntity.refreshOn = refreshOn.toString();
    }
    if (requestedClaims) {
      atEntity.requestedClaims = requestedClaims;
      atEntity.requestedClaimsHash = requestedClaimsHash;
    }
    if (((_a = atEntity.tokenType) == null ? void 0 : _a.toLowerCase()) !== AuthenticationScheme.BEARER.toLowerCase()) {
      atEntity.credentialType = CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME;
      switch (atEntity.tokenType) {
        case AuthenticationScheme.POP:
          const tokenClaims = extractTokenClaims(accessToken, base64Decode);
          if (!((_b = tokenClaims == null ? void 0 : tokenClaims.cnf) == null ? void 0 : _b.kid)) {
            throw createClientAuthError(tokenClaimsCnfRequiredForSignedJwt);
          }
          atEntity.keyId = tokenClaims.cnf.kid;
          break;
        case AuthenticationScheme.SSH:
          atEntity.keyId = keyId;
      }
    }
    return atEntity;
  }
  function createRefreshTokenEntity(homeAccountId, environment, refreshToken, clientId, familyId, userAssertionHash, expiresOn) {
    const rtEntity = {
      credentialType: CredentialType.REFRESH_TOKEN,
      homeAccountId,
      environment,
      clientId,
      secret: refreshToken
    };
    if (userAssertionHash) {
      rtEntity.userAssertionHash = userAssertionHash;
    }
    if (familyId) {
      rtEntity.familyId = familyId;
    }
    if (expiresOn) {
      rtEntity.expiresOn = expiresOn.toString();
    }
    return rtEntity;
  }
  function isCredentialEntity(entity) {
    return entity.hasOwnProperty("homeAccountId") && entity.hasOwnProperty("environment") && entity.hasOwnProperty("credentialType") && entity.hasOwnProperty("clientId") && entity.hasOwnProperty("secret");
  }
  function isAccessTokenEntity(entity) {
    if (!entity) {
      return false;
    }
    return isCredentialEntity(entity) && entity.hasOwnProperty("realm") && entity.hasOwnProperty("target") && (entity["credentialType"] === CredentialType.ACCESS_TOKEN || entity["credentialType"] === CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME);
  }
  function isIdTokenEntity(entity) {
    if (!entity) {
      return false;
    }
    return isCredentialEntity(entity) && entity.hasOwnProperty("realm") && entity["credentialType"] === CredentialType.ID_TOKEN;
  }
  function isRefreshTokenEntity(entity) {
    if (!entity) {
      return false;
    }
    return isCredentialEntity(entity) && entity["credentialType"] === CredentialType.REFRESH_TOKEN;
  }
  function generateAccountId(credentialEntity) {
    const accountId = [
      credentialEntity.homeAccountId,
      credentialEntity.environment
    ];
    return accountId.join(Separators.CACHE_KEY_SEPARATOR).toLowerCase();
  }
  function generateCredentialId(credentialEntity) {
    const clientOrFamilyId = credentialEntity.credentialType === CredentialType.REFRESH_TOKEN ? credentialEntity.familyId || credentialEntity.clientId : credentialEntity.clientId;
    const credentialId = [
      credentialEntity.credentialType,
      clientOrFamilyId,
      credentialEntity.realm || ""
    ];
    return credentialId.join(Separators.CACHE_KEY_SEPARATOR).toLowerCase();
  }
  function generateTarget(credentialEntity) {
    return (credentialEntity.target || "").toLowerCase();
  }
  function generateClaimsHash(credentialEntity) {
    return (credentialEntity.requestedClaimsHash || "").toLowerCase();
  }
  function generateScheme(credentialEntity) {
    return credentialEntity.tokenType && credentialEntity.tokenType.toLowerCase() !== AuthenticationScheme.BEARER.toLowerCase() ? credentialEntity.tokenType.toLowerCase() : "";
  }
  function isServerTelemetryEntity(key, entity) {
    const validateKey = key.indexOf(SERVER_TELEM_CONSTANTS.CACHE_KEY) === 0;
    let validateEntity = true;
    if (entity) {
      validateEntity = entity.hasOwnProperty("failedRequests") && entity.hasOwnProperty("errors") && entity.hasOwnProperty("cacheHits");
    }
    return validateKey && validateEntity;
  }
  function isThrottlingEntity(key, entity) {
    let validateKey = false;
    if (key) {
      validateKey = key.indexOf(ThrottlingConstants.THROTTLING_PREFIX) === 0;
    }
    let validateEntity = true;
    if (entity) {
      validateEntity = entity.hasOwnProperty("throttleTime");
    }
    return validateKey && validateEntity;
  }
  function generateAppMetadataKey({ environment, clientId }) {
    const appMetaDataKeyArray = [
      APP_METADATA,
      environment,
      clientId
    ];
    return appMetaDataKeyArray.join(Separators.CACHE_KEY_SEPARATOR).toLowerCase();
  }
  function isAppMetadataEntity(key, entity) {
    if (!entity) {
      return false;
    }
    return key.indexOf(APP_METADATA) === 0 && entity.hasOwnProperty("clientId") && entity.hasOwnProperty("environment");
  }
  function isAuthorityMetadataEntity(key, entity) {
    if (!entity) {
      return false;
    }
    return key.indexOf(AUTHORITY_METADATA_CONSTANTS.CACHE_KEY) === 0 && entity.hasOwnProperty("aliases") && entity.hasOwnProperty("preferred_cache") && entity.hasOwnProperty("preferred_network") && entity.hasOwnProperty("canonical_authority") && entity.hasOwnProperty("authorization_endpoint") && entity.hasOwnProperty("token_endpoint") && entity.hasOwnProperty("issuer") && entity.hasOwnProperty("aliasesFromNetwork") && entity.hasOwnProperty("endpointsFromNetwork") && entity.hasOwnProperty("expiresAt") && entity.hasOwnProperty("jwks_uri");
  }
  function generateAuthorityMetadataExpiresAt() {
    return nowSeconds() + AUTHORITY_METADATA_CONSTANTS.REFRESH_TIME_SECONDS;
  }
  function updateAuthorityEndpointMetadata(authorityMetadata, updatedValues, fromNetwork) {
    authorityMetadata.authorization_endpoint = updatedValues.authorization_endpoint;
    authorityMetadata.token_endpoint = updatedValues.token_endpoint;
    authorityMetadata.end_session_endpoint = updatedValues.end_session_endpoint;
    authorityMetadata.issuer = updatedValues.issuer;
    authorityMetadata.endpointsFromNetwork = fromNetwork;
    authorityMetadata.jwks_uri = updatedValues.jwks_uri;
  }
  function updateCloudDiscoveryMetadata(authorityMetadata, updatedValues, fromNetwork) {
    authorityMetadata.aliases = updatedValues.aliases;
    authorityMetadata.preferred_cache = updatedValues.preferred_cache;
    authorityMetadata.preferred_network = updatedValues.preferred_network;
    authorityMetadata.aliasesFromNetwork = fromNetwork;
  }
  function isAuthorityMetadataExpired(metadata) {
    return metadata.expiresAt <= nowSeconds();
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const redirectUriEmpty = "redirect_uri_empty";
  const claimsRequestParsingError = "claims_request_parsing_error";
  const authorityUriInsecure = "authority_uri_insecure";
  const urlParseError = "url_parse_error";
  const urlEmptyError = "empty_url_error";
  const emptyInputScopesError = "empty_input_scopes_error";
  const invalidPromptValue = "invalid_prompt_value";
  const invalidClaims = "invalid_claims";
  const tokenRequestEmpty = "token_request_empty";
  const logoutRequestEmpty = "logout_request_empty";
  const invalidCodeChallengeMethod = "invalid_code_challenge_method";
  const pkceParamsMissing = "pkce_params_missing";
  const invalidCloudDiscoveryMetadata = "invalid_cloud_discovery_metadata";
  const invalidAuthorityMetadata = "invalid_authority_metadata";
  const untrustedAuthority = "untrusted_authority";
  const missingSshJwk = "missing_ssh_jwk";
  const missingSshKid = "missing_ssh_kid";
  const missingNonceAuthenticationHeader = "missing_nonce_authentication_header";
  const invalidAuthenticationHeader = "invalid_authentication_header";
  const cannotSetOIDCOptions = "cannot_set_OIDCOptions";
  const cannotAllowNativeBroker = "cannot_allow_native_broker";
  const authorityMismatch = "authority_mismatch";
  var ClientConfigurationErrorCodes = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    authorityMismatch,
    authorityUriInsecure,
    cannotAllowNativeBroker,
    cannotSetOIDCOptions,
    claimsRequestParsingError,
    emptyInputScopesError,
    invalidAuthenticationHeader,
    invalidAuthorityMetadata,
    invalidClaims,
    invalidCloudDiscoveryMetadata,
    invalidCodeChallengeMethod,
    invalidPromptValue,
    logoutRequestEmpty,
    missingNonceAuthenticationHeader,
    missingSshJwk,
    missingSshKid,
    pkceParamsMissing,
    redirectUriEmpty,
    tokenRequestEmpty,
    untrustedAuthority,
    urlEmptyError,
    urlParseError
  });
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const ClientConfigurationErrorMessages = {
    [redirectUriEmpty]: "A redirect URI is required for all calls, and none has been set.",
    [claimsRequestParsingError]: "Could not parse the given claims request object.",
    [authorityUriInsecure]: "Authority URIs must use https.  Please see here for valid authority configuration options: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications#configuration-options",
    [urlParseError]: "URL could not be parsed into appropriate segments.",
    [urlEmptyError]: "URL was empty or null.",
    [emptyInputScopesError]: "Scopes cannot be passed as null, undefined or empty array because they are required to obtain an access token.",
    [invalidPromptValue]: "Please see here for valid configuration options: https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_common.html#commonauthorizationurlrequest",
    [invalidClaims]: "Given claims parameter must be a stringified JSON object.",
    [tokenRequestEmpty]: "Token request was empty and not found in cache.",
    [logoutRequestEmpty]: "The logout request was null or undefined.",
    [invalidCodeChallengeMethod]: 'code_challenge_method passed is invalid. Valid values are "plain" and "S256".',
    [pkceParamsMissing]: "Both params: code_challenge and code_challenge_method are to be passed if to be sent in the request",
    [invalidCloudDiscoveryMetadata]: "Invalid cloudDiscoveryMetadata provided. Must be a stringified JSON object containing tenant_discovery_endpoint and metadata fields",
    [invalidAuthorityMetadata]: "Invalid authorityMetadata provided. Must by a stringified JSON object containing authorization_endpoint, token_endpoint, issuer fields.",
    [untrustedAuthority]: "The provided authority is not a trusted authority. Please include this authority in the knownAuthorities config parameter.",
    [missingSshJwk]: "Missing sshJwk in SSH certificate request. A stringified JSON Web Key is required when using the SSH authentication scheme.",
    [missingSshKid]: "Missing sshKid in SSH certificate request. A string that uniquely identifies the public SSH key is required when using the SSH authentication scheme.",
    [missingNonceAuthenticationHeader]: "Unable to find an authentication header containing server nonce. Either the Authentication-Info or WWW-Authenticate headers must be present in order to obtain a server nonce.",
    [invalidAuthenticationHeader]: "Invalid authentication header provided",
    [cannotSetOIDCOptions]: "Cannot set OIDCOptions parameter. Please change the protocol mode to OIDC or use a non-Microsoft authority.",
    [cannotAllowNativeBroker]: "Cannot set allowNativeBroker parameter to true when not in AAD protocol mode.",
    [authorityMismatch]: "Authority mismatch error. Authority provided in login request or PublicClientApplication config does not match the environment of the provided account. Please use a matching account or make an interactive request to login to this authority."
  };
  const ClientConfigurationErrorMessage = {
    redirectUriNotSet: {
      code: redirectUriEmpty,
      desc: ClientConfigurationErrorMessages[redirectUriEmpty]
    },
    claimsRequestParsingError: {
      code: claimsRequestParsingError,
      desc: ClientConfigurationErrorMessages[claimsRequestParsingError]
    },
    authorityUriInsecure: {
      code: authorityUriInsecure,
      desc: ClientConfigurationErrorMessages[authorityUriInsecure]
    },
    urlParseError: {
      code: urlParseError,
      desc: ClientConfigurationErrorMessages[urlParseError]
    },
    urlEmptyError: {
      code: urlEmptyError,
      desc: ClientConfigurationErrorMessages[urlEmptyError]
    },
    emptyScopesError: {
      code: emptyInputScopesError,
      desc: ClientConfigurationErrorMessages[emptyInputScopesError]
    },
    invalidPrompt: {
      code: invalidPromptValue,
      desc: ClientConfigurationErrorMessages[invalidPromptValue]
    },
    invalidClaimsRequest: {
      code: invalidClaims,
      desc: ClientConfigurationErrorMessages[invalidClaims]
    },
    tokenRequestEmptyError: {
      code: tokenRequestEmpty,
      desc: ClientConfigurationErrorMessages[tokenRequestEmpty]
    },
    logoutRequestEmptyError: {
      code: logoutRequestEmpty,
      desc: ClientConfigurationErrorMessages[logoutRequestEmpty]
    },
    invalidCodeChallengeMethod: {
      code: invalidCodeChallengeMethod,
      desc: ClientConfigurationErrorMessages[invalidCodeChallengeMethod]
    },
    invalidCodeChallengeParams: {
      code: pkceParamsMissing,
      desc: ClientConfigurationErrorMessages[pkceParamsMissing]
    },
    invalidCloudDiscoveryMetadata: {
      code: invalidCloudDiscoveryMetadata,
      desc: ClientConfigurationErrorMessages[invalidCloudDiscoveryMetadata]
    },
    invalidAuthorityMetadata: {
      code: invalidAuthorityMetadata,
      desc: ClientConfigurationErrorMessages[invalidAuthorityMetadata]
    },
    untrustedAuthority: {
      code: untrustedAuthority,
      desc: ClientConfigurationErrorMessages[untrustedAuthority]
    },
    missingSshJwk: {
      code: missingSshJwk,
      desc: ClientConfigurationErrorMessages[missingSshJwk]
    },
    missingSshKid: {
      code: missingSshKid,
      desc: ClientConfigurationErrorMessages[missingSshKid]
    },
    missingNonceAuthenticationHeader: {
      code: missingNonceAuthenticationHeader,
      desc: ClientConfigurationErrorMessages[missingNonceAuthenticationHeader]
    },
    invalidAuthenticationHeader: {
      code: invalidAuthenticationHeader,
      desc: ClientConfigurationErrorMessages[invalidAuthenticationHeader]
    },
    cannotSetOIDCOptions: {
      code: cannotSetOIDCOptions,
      desc: ClientConfigurationErrorMessages[cannotSetOIDCOptions]
    },
    cannotAllowNativeBroker: {
      code: cannotAllowNativeBroker,
      desc: ClientConfigurationErrorMessages[cannotAllowNativeBroker]
    },
    authorityMismatch: {
      code: authorityMismatch,
      desc: ClientConfigurationErrorMessages[authorityMismatch]
    }
  };
  class ClientConfigurationError extends AuthError {
    constructor(errorCode) {
      super(errorCode, ClientConfigurationErrorMessages[errorCode]);
      this.name = "ClientConfigurationError";
      Object.setPrototypeOf(this, ClientConfigurationError.prototype);
    }
  }
  function createClientConfigurationError(errorCode) {
    return new ClientConfigurationError(errorCode);
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class StringUtils {
    /**
     * Check if stringified object is empty
     * @param strObj
     */
    static isEmptyObj(strObj) {
      if (strObj) {
        try {
          const obj = JSON.parse(strObj);
          return Object.keys(obj).length === 0;
        } catch (e) {
        }
      }
      return true;
    }
    static startsWith(str, search) {
      return str.indexOf(search) === 0;
    }
    static endsWith(str, search) {
      return str.length >= search.length && str.lastIndexOf(search) === str.length - search.length;
    }
    /**
     * Parses string into an object.
     *
     * @param query
     */
    static queryStringToObject(query) {
      const obj = {};
      const params = query.split("&");
      const decode2 = (s) => decodeURIComponent(s.replace(/\+/g, " "));
      params.forEach((pair) => {
        if (pair.trim()) {
          const [key, value] = pair.split(/=(.+)/g, 2);
          if (key && value) {
            obj[decode2(key)] = decode2(value);
          }
        }
      });
      return obj;
    }
    /**
     * Trims entries in an array.
     *
     * @param arr
     */
    static trimArrayEntries(arr) {
      return arr.map((entry) => entry.trim());
    }
    /**
     * Removes empty strings from array
     * @param arr
     */
    static removeEmptyStringsFromArray(arr) {
      return arr.filter((entry) => {
        return !!entry;
      });
    }
    /**
     * Attempts to parse a string into JSON
     * @param str
     */
    static jsonParseHelper(str) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return null;
      }
    }
    /**
     * Tests if a given string matches a given pattern, with support for wildcards and queries.
     * @param pattern Wildcard pattern to string match. Supports "*" for wildcards and "?" for queries
     * @param input String to match against
     */
    static matchPattern(pattern, input) {
      const regex = new RegExp(pattern.replace(/\\/g, "\\\\").replace(/\*/g, "[^ ]*").replace(/\?/g, "\\?"));
      return regex.test(input);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class ScopeSet {
    constructor(inputScopes) {
      const scopeArr = inputScopes ? StringUtils.trimArrayEntries([...inputScopes]) : [];
      const filteredInput = scopeArr ? StringUtils.removeEmptyStringsFromArray(scopeArr) : [];
      this.validateInputScopes(filteredInput);
      this.scopes = /* @__PURE__ */ new Set();
      filteredInput.forEach((scope) => this.scopes.add(scope));
    }
    /**
     * Factory method to create ScopeSet from space-delimited string
     * @param inputScopeString
     * @param appClientId
     * @param scopesRequired
     */
    static fromString(inputScopeString) {
      const scopeString = inputScopeString || Constants$1.EMPTY_STRING;
      const inputScopes = scopeString.split(" ");
      return new ScopeSet(inputScopes);
    }
    /**
     * Creates the set of scopes to search for in cache lookups
     * @param inputScopeString
     * @returns
     */
    static createSearchScopes(inputScopeString) {
      const scopeSet = new ScopeSet(inputScopeString);
      if (!scopeSet.containsOnlyOIDCScopes()) {
        scopeSet.removeOIDCScopes();
      } else {
        scopeSet.removeScope(Constants$1.OFFLINE_ACCESS_SCOPE);
      }
      return scopeSet;
    }
    /**
     * Used to validate the scopes input parameter requested  by the developer.
     * @param {Array<string>} inputScopes - Developer requested permissions. Not all scopes are guaranteed to be included in the access token returned.
     * @param {boolean} scopesRequired - Boolean indicating whether the scopes array is required or not
     */
    validateInputScopes(inputScopes) {
      if (!inputScopes || inputScopes.length < 1) {
        throw createClientConfigurationError(emptyInputScopesError);
      }
    }
    /**
     * Check if a given scope is present in this set of scopes.
     * @param scope
     */
    containsScope(scope) {
      const lowerCaseScopes = this.printScopesLowerCase().split(" ");
      const lowerCaseScopesSet = new ScopeSet(lowerCaseScopes);
      return scope ? lowerCaseScopesSet.scopes.has(scope.toLowerCase()) : false;
    }
    /**
     * Check if a set of scopes is present in this set of scopes.
     * @param scopeSet
     */
    containsScopeSet(scopeSet) {
      if (!scopeSet || scopeSet.scopes.size <= 0) {
        return false;
      }
      return this.scopes.size >= scopeSet.scopes.size && scopeSet.asArray().every((scope) => this.containsScope(scope));
    }
    /**
     * Check if set of scopes contains only the defaults
     */
    containsOnlyOIDCScopes() {
      let defaultScopeCount = 0;
      OIDC_SCOPES.forEach((defaultScope) => {
        if (this.containsScope(defaultScope)) {
          defaultScopeCount += 1;
        }
      });
      return this.scopes.size === defaultScopeCount;
    }
    /**
     * Appends single scope if passed
     * @param newScope
     */
    appendScope(newScope) {
      if (newScope) {
        this.scopes.add(newScope.trim());
      }
    }
    /**
     * Appends multiple scopes if passed
     * @param newScopes
     */
    appendScopes(newScopes) {
      try {
        newScopes.forEach((newScope) => this.appendScope(newScope));
      } catch (e) {
        throw createClientAuthError(cannotAppendScopeSet);
      }
    }
    /**
     * Removes element from set of scopes.
     * @param scope
     */
    removeScope(scope) {
      if (!scope) {
        throw createClientAuthError(cannotRemoveEmptyScope);
      }
      this.scopes.delete(scope.trim());
    }
    /**
     * Removes default scopes from set of scopes
     * Primarily used to prevent cache misses if the default scopes are not returned from the server
     */
    removeOIDCScopes() {
      OIDC_SCOPES.forEach((defaultScope) => {
        this.scopes.delete(defaultScope);
      });
    }
    /**
     * Combines an array of scopes with the current set of scopes.
     * @param otherScopes
     */
    unionScopeSets(otherScopes) {
      if (!otherScopes) {
        throw createClientAuthError(emptyInputScopeSet);
      }
      const unionScopes = /* @__PURE__ */ new Set();
      otherScopes.scopes.forEach((scope) => unionScopes.add(scope.toLowerCase()));
      this.scopes.forEach((scope) => unionScopes.add(scope.toLowerCase()));
      return unionScopes;
    }
    /**
     * Check if scopes intersect between this set and another.
     * @param otherScopes
     */
    intersectingScopeSets(otherScopes) {
      if (!otherScopes) {
        throw createClientAuthError(emptyInputScopeSet);
      }
      if (!otherScopes.containsOnlyOIDCScopes()) {
        otherScopes.removeOIDCScopes();
      }
      const unionScopes = this.unionScopeSets(otherScopes);
      const sizeOtherScopes = otherScopes.getScopeCount();
      const sizeThisScopes = this.getScopeCount();
      const sizeUnionScopes = unionScopes.size;
      return sizeUnionScopes < sizeThisScopes + sizeOtherScopes;
    }
    /**
     * Returns size of set of scopes.
     */
    getScopeCount() {
      return this.scopes.size;
    }
    /**
     * Returns the scopes as an array of string values
     */
    asArray() {
      const array = [];
      this.scopes.forEach((val) => array.push(val));
      return array;
    }
    /**
     * Prints scopes into a space-delimited string
     */
    printScopes() {
      if (this.scopes) {
        const scopeArr = this.asArray();
        return scopeArr.join(" ");
      }
      return Constants$1.EMPTY_STRING;
    }
    /**
     * Prints scopes into a space-delimited lower-case string (used for caching)
     */
    printScopesLowerCase() {
      return this.printScopes().toLowerCase();
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function buildClientInfo(rawClientInfo, base64Decode) {
    if (!rawClientInfo) {
      throw createClientAuthError(clientInfoEmptyError);
    }
    try {
      const decodedClientInfo = base64Decode(rawClientInfo);
      return JSON.parse(decodedClientInfo);
    } catch (e) {
      throw createClientAuthError(clientInfoDecodingError);
    }
  }
  function buildClientInfoFromHomeAccountId(homeAccountId) {
    if (!homeAccountId) {
      throw createClientAuthError(clientInfoDecodingError);
    }
    const clientInfoParts = homeAccountId.split(Separators.CLIENT_INFO_SEPARATOR, 2);
    return {
      uid: clientInfoParts[0],
      utid: clientInfoParts.length < 2 ? Constants$1.EMPTY_STRING : clientInfoParts[1]
    };
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function tenantIdMatchesHomeTenant(tenantId, homeAccountId) {
    return !!tenantId && !!homeAccountId && tenantId === homeAccountId.split(".")[1];
  }
  function buildTenantProfile(homeAccountId, localAccountId, tenantId, idTokenClaims) {
    if (idTokenClaims) {
      const { oid, sub, tid, name: name2, tfp, acr } = idTokenClaims;
      const tenantId2 = tid || tfp || acr || "";
      return {
        tenantId: tenantId2,
        localAccountId: oid || sub || "",
        name: name2,
        isHomeTenant: tenantIdMatchesHomeTenant(tenantId2, homeAccountId)
      };
    } else {
      return {
        tenantId,
        localAccountId,
        isHomeTenant: tenantIdMatchesHomeTenant(tenantId, homeAccountId)
      };
    }
  }
  function updateAccountTenantProfileData(baseAccountInfo, tenantProfile, idTokenClaims, idTokenSecret) {
    let updatedAccountInfo = baseAccountInfo;
    if (tenantProfile) {
      const { isHomeTenant, ...tenantProfileOverride } = tenantProfile;
      updatedAccountInfo = { ...baseAccountInfo, ...tenantProfileOverride };
    }
    if (idTokenClaims) {
      const { isHomeTenant, ...claimsSourcedTenantProfile } = buildTenantProfile(baseAccountInfo.homeAccountId, baseAccountInfo.localAccountId, baseAccountInfo.tenantId, idTokenClaims);
      updatedAccountInfo = {
        ...updatedAccountInfo,
        ...claimsSourcedTenantProfile,
        idTokenClaims,
        idToken: idTokenSecret
      };
      return updatedAccountInfo;
    }
    return updatedAccountInfo;
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const AuthorityType = {
    Default: 0,
    Adfs: 1,
    Dsts: 2,
    Ciam: 3
  };
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function getTenantIdFromIdTokenClaims(idTokenClaims) {
    if (idTokenClaims) {
      const tenantId = idTokenClaims.tid || idTokenClaims.tfp || idTokenClaims.acr;
      return tenantId || null;
    }
    return null;
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const ProtocolMode = {
    AAD: "AAD",
    OIDC: "OIDC"
  };
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class AccountEntity {
    /**
     * Generate Account Id key component as per the schema: <home_account_id>-<environment>
     */
    generateAccountId() {
      const accountId = [this.homeAccountId, this.environment];
      return accountId.join(Separators.CACHE_KEY_SEPARATOR).toLowerCase();
    }
    /**
     * Generate Account Cache Key as per the schema: <home_account_id>-<environment>-<realm*>
     */
    generateAccountKey() {
      return AccountEntity.generateAccountCacheKey({
        homeAccountId: this.homeAccountId,
        environment: this.environment,
        tenantId: this.realm,
        username: this.username,
        localAccountId: this.localAccountId
      });
    }
    /**
     * Returns the AccountInfo interface for this account.
     */
    getAccountInfo() {
      return {
        homeAccountId: this.homeAccountId,
        environment: this.environment,
        tenantId: this.realm,
        username: this.username,
        localAccountId: this.localAccountId,
        name: this.name,
        nativeAccountId: this.nativeAccountId,
        authorityType: this.authorityType,
        // Deserialize tenant profiles array into a Map
        tenantProfiles: new Map((this.tenantProfiles || []).map((tenantProfile) => {
          return [tenantProfile.tenantId, tenantProfile];
        }))
      };
    }
    /**
     * Returns true if the account entity is in single tenant format (outdated), false otherwise
     */
    isSingleTenant() {
      return !this.tenantProfiles;
    }
    /**
     * Generates account key from interface
     * @param accountInterface
     */
    static generateAccountCacheKey(accountInterface) {
      const homeTenantId = accountInterface.homeAccountId.split(".")[1];
      const accountKey = [
        accountInterface.homeAccountId,
        accountInterface.environment || "",
        homeTenantId || accountInterface.tenantId || ""
      ];
      return accountKey.join(Separators.CACHE_KEY_SEPARATOR).toLowerCase();
    }
    /**
     * Build Account cache from IdToken, clientInfo and authority/policy. Associated with AAD.
     * @param accountDetails
     */
    static createAccount(accountDetails, authority, base64Decode) {
      var _a, _b, _c, _d, _e, _f;
      const account = new AccountEntity();
      if (authority.authorityType === AuthorityType.Adfs) {
        account.authorityType = CacheAccountType.ADFS_ACCOUNT_TYPE;
      } else if (authority.protocolMode === ProtocolMode.AAD) {
        account.authorityType = CacheAccountType.MSSTS_ACCOUNT_TYPE;
      } else {
        account.authorityType = CacheAccountType.GENERIC_ACCOUNT_TYPE;
      }
      let clientInfo;
      if (accountDetails.clientInfo && base64Decode) {
        clientInfo = buildClientInfo(accountDetails.clientInfo, base64Decode);
      }
      account.clientInfo = accountDetails.clientInfo;
      account.homeAccountId = accountDetails.homeAccountId;
      account.nativeAccountId = accountDetails.nativeAccountId;
      const env = accountDetails.environment || authority && authority.getPreferredCache();
      if (!env) {
        throw createClientAuthError(invalidCacheEnvironment);
      }
      account.environment = env;
      account.realm = (clientInfo == null ? void 0 : clientInfo.utid) || getTenantIdFromIdTokenClaims(accountDetails.idTokenClaims) || "";
      account.localAccountId = (clientInfo == null ? void 0 : clientInfo.uid) || ((_a = accountDetails.idTokenClaims) == null ? void 0 : _a.oid) || ((_b = accountDetails.idTokenClaims) == null ? void 0 : _b.sub) || "";
      const preferredUsername = ((_c = accountDetails.idTokenClaims) == null ? void 0 : _c.preferred_username) || ((_d = accountDetails.idTokenClaims) == null ? void 0 : _d.upn);
      const email = ((_e = accountDetails.idTokenClaims) == null ? void 0 : _e.emails) ? accountDetails.idTokenClaims.emails[0] : null;
      account.username = preferredUsername || email || "";
      account.name = ((_f = accountDetails.idTokenClaims) == null ? void 0 : _f.name) || "";
      account.cloudGraphHostName = accountDetails.cloudGraphHostName;
      account.msGraphHost = accountDetails.msGraphHost;
      if (accountDetails.tenantProfiles) {
        account.tenantProfiles = accountDetails.tenantProfiles;
      } else {
        const tenantProfile = buildTenantProfile(accountDetails.homeAccountId, account.localAccountId, account.realm, accountDetails.idTokenClaims);
        account.tenantProfiles = [tenantProfile];
      }
      return account;
    }
    /**
     * Creates an AccountEntity object from AccountInfo
     * @param accountInfo
     * @param cloudGraphHostName
     * @param msGraphHost
     * @returns
     */
    static createFromAccountInfo(accountInfo, cloudGraphHostName, msGraphHost) {
      var _a;
      const account = new AccountEntity();
      account.authorityType = accountInfo.authorityType || CacheAccountType.GENERIC_ACCOUNT_TYPE;
      account.homeAccountId = accountInfo.homeAccountId;
      account.localAccountId = accountInfo.localAccountId;
      account.nativeAccountId = accountInfo.nativeAccountId;
      account.realm = accountInfo.tenantId;
      account.environment = accountInfo.environment;
      account.username = accountInfo.username;
      account.name = accountInfo.name;
      account.cloudGraphHostName = cloudGraphHostName;
      account.msGraphHost = msGraphHost;
      account.tenantProfiles = Array.from(((_a = accountInfo.tenantProfiles) == null ? void 0 : _a.values()) || []);
      return account;
    }
    /**
     * Generate HomeAccountId from server response
     * @param serverClientInfo
     * @param authType
     */
    static generateHomeAccountId(serverClientInfo, authType, logger, cryptoObj, idTokenClaims) {
      if (!(authType === AuthorityType.Adfs || authType === AuthorityType.Dsts)) {
        if (serverClientInfo) {
          try {
            const clientInfo = buildClientInfo(serverClientInfo, cryptoObj.base64Decode);
            if (clientInfo.uid && clientInfo.utid) {
              return `${clientInfo.uid}.${clientInfo.utid}`;
            }
          } catch (e) {
          }
        }
        logger.warning("No client info in response");
      }
      return (idTokenClaims == null ? void 0 : idTokenClaims.sub) || "";
    }
    /**
     * Validates an entity: checks for all expected params
     * @param entity
     */
    static isAccountEntity(entity) {
      if (!entity) {
        return false;
      }
      return entity.hasOwnProperty("homeAccountId") && entity.hasOwnProperty("environment") && entity.hasOwnProperty("realm") && entity.hasOwnProperty("localAccountId") && entity.hasOwnProperty("username") && entity.hasOwnProperty("authorityType");
    }
    /**
     * Helper function to determine whether 2 accountInfo objects represent the same account
     * @param accountA
     * @param accountB
     * @param compareClaims - If set to true idTokenClaims will also be compared to determine account equality
     */
    static accountInfoIsEqual(accountA, accountB, compareClaims) {
      if (!accountA || !accountB) {
        return false;
      }
      let claimsMatch = true;
      if (compareClaims) {
        const accountAClaims = accountA.idTokenClaims || {};
        const accountBClaims = accountB.idTokenClaims || {};
        claimsMatch = accountAClaims.iat === accountBClaims.iat && accountAClaims.nonce === accountBClaims.nonce;
      }
      return accountA.homeAccountId === accountB.homeAccountId && accountA.localAccountId === accountB.localAccountId && accountA.username === accountB.username && accountA.tenantId === accountB.tenantId && accountA.environment === accountB.environment && accountA.nativeAccountId === accountB.nativeAccountId && claimsMatch;
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function stripLeadingHashOrQuery(responseString) {
    if (responseString.startsWith("#/")) {
      return responseString.substring(2);
    } else if (responseString.startsWith("#") || responseString.startsWith("?")) {
      return responseString.substring(1);
    }
    return responseString;
  }
  function getDeserializedResponse(responseString) {
    if (!responseString || responseString.indexOf("=") < 0) {
      return null;
    }
    try {
      const normalizedResponse = stripLeadingHashOrQuery(responseString);
      const deserializedHash = Object.fromEntries(new URLSearchParams(normalizedResponse));
      if (deserializedHash.code || deserializedHash.error || deserializedHash.error_description || deserializedHash.state) {
        return deserializedHash;
      }
    } catch (e) {
      throw createClientAuthError(hashNotDeserialized);
    }
    return null;
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class UrlString {
    get urlString() {
      return this._urlString;
    }
    constructor(url) {
      this._urlString = url;
      if (!this._urlString) {
        throw createClientConfigurationError(urlEmptyError);
      }
      if (!url.includes("#")) {
        this._urlString = UrlString.canonicalizeUri(url);
      }
    }
    /**
     * Ensure urls are lower case and end with a / character.
     * @param url
     */
    static canonicalizeUri(url) {
      if (url) {
        let lowerCaseUrl = url.toLowerCase();
        if (StringUtils.endsWith(lowerCaseUrl, "?")) {
          lowerCaseUrl = lowerCaseUrl.slice(0, -1);
        } else if (StringUtils.endsWith(lowerCaseUrl, "?/")) {
          lowerCaseUrl = lowerCaseUrl.slice(0, -2);
        }
        if (!StringUtils.endsWith(lowerCaseUrl, "/")) {
          lowerCaseUrl += "/";
        }
        return lowerCaseUrl;
      }
      return url;
    }
    /**
     * Throws if urlString passed is not a valid authority URI string.
     */
    validateAsUri() {
      let components;
      try {
        components = this.getUrlComponents();
      } catch (e) {
        throw createClientConfigurationError(urlParseError);
      }
      if (!components.HostNameAndPort || !components.PathSegments) {
        throw createClientConfigurationError(urlParseError);
      }
      if (!components.Protocol || components.Protocol.toLowerCase() !== "https:") {
        throw createClientConfigurationError(authorityUriInsecure);
      }
    }
    /**
     * Given a url and a query string return the url with provided query string appended
     * @param url
     * @param queryString
     */
    static appendQueryString(url, queryString) {
      if (!queryString) {
        return url;
      }
      return url.indexOf("?") < 0 ? `${url}?${queryString}` : `${url}&${queryString}`;
    }
    /**
     * Returns a url with the hash removed
     * @param url
     */
    static removeHashFromUrl(url) {
      return UrlString.canonicalizeUri(url.split("#")[0]);
    }
    /**
     * Given a url like https://a:b/common/d?e=f#g, and a tenantId, returns https://a:b/tenantId/d
     * @param href The url
     * @param tenantId The tenant id to replace
     */
    replaceTenantPath(tenantId) {
      const urlObject = this.getUrlComponents();
      const pathArray = urlObject.PathSegments;
      if (tenantId && pathArray.length !== 0 && (pathArray[0] === AADAuthorityConstants.COMMON || pathArray[0] === AADAuthorityConstants.ORGANIZATIONS)) {
        pathArray[0] = tenantId;
      }
      return UrlString.constructAuthorityUriFromObject(urlObject);
    }
    /**
     * Parses out the components from a url string.
     * @returns An object with the various components. Please cache this value insted of calling this multiple times on the same url.
     */
    getUrlComponents() {
      const regEx = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
      const match = this.urlString.match(regEx);
      if (!match) {
        throw createClientConfigurationError(urlParseError);
      }
      const urlComponents = {
        Protocol: match[1],
        HostNameAndPort: match[4],
        AbsolutePath: match[5],
        QueryString: match[7]
      };
      let pathSegments = urlComponents.AbsolutePath.split("/");
      pathSegments = pathSegments.filter((val) => val && val.length > 0);
      urlComponents.PathSegments = pathSegments;
      if (urlComponents.QueryString && urlComponents.QueryString.endsWith("/")) {
        urlComponents.QueryString = urlComponents.QueryString.substring(0, urlComponents.QueryString.length - 1);
      }
      return urlComponents;
    }
    static getDomainFromUrl(url) {
      const regEx = RegExp("^([^:/?#]+://)?([^/?#]*)");
      const match = url.match(regEx);
      if (!match) {
        throw createClientConfigurationError(urlParseError);
      }
      return match[2];
    }
    static getAbsoluteUrl(relativeUrl, baseUrl) {
      if (relativeUrl[0] === Constants$1.FORWARD_SLASH) {
        const url = new UrlString(baseUrl);
        const baseComponents = url.getUrlComponents();
        return baseComponents.Protocol + "//" + baseComponents.HostNameAndPort + relativeUrl;
      }
      return relativeUrl;
    }
    static constructAuthorityUriFromObject(urlObject) {
      return new UrlString(urlObject.Protocol + "//" + urlObject.HostNameAndPort + "/" + urlObject.PathSegments.join("/"));
    }
    /**
     * Check if the hash of the URL string contains known properties
     * @deprecated This API will be removed in a future version
     */
    static hashContainsKnownProperties(response) {
      return !!getDeserializedResponse(response);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const rawMetdataJSON = {
    endpointMetadata: {
      "login.microsoftonline.com": {
        token_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/token",
        jwks_uri: "https://login.microsoftonline.com/{tenantid}/discovery/v2.0/keys",
        issuer: "https://login.microsoftonline.com/{tenantid}/v2.0",
        authorization_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/authorize",
        end_session_endpoint: "https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/logout"
      },
      "login.chinacloudapi.cn": {
        token_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/token",
        jwks_uri: "https://login.chinacloudapi.cn/{tenantid}/discovery/v2.0/keys",
        issuer: "https://login.partner.microsoftonline.cn/{tenantid}/v2.0",
        authorization_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/authorize",
        end_session_endpoint: "https://login.chinacloudapi.cn/{tenantid}/oauth2/v2.0/logout"
      },
      "login.microsoftonline.us": {
        token_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/token",
        jwks_uri: "https://login.microsoftonline.us/{tenantid}/discovery/v2.0/keys",
        issuer: "https://login.microsoftonline.us/{tenantid}/v2.0",
        authorization_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/authorize",
        end_session_endpoint: "https://login.microsoftonline.us/{tenantid}/oauth2/v2.0/logout"
      }
    },
    instanceDiscoveryMetadata: {
      metadata: [
        {
          preferred_network: "login.microsoftonline.com",
          preferred_cache: "login.windows.net",
          aliases: [
            "login.microsoftonline.com",
            "login.windows.net",
            "login.microsoft.com",
            "sts.windows.net"
          ]
        },
        {
          preferred_network: "login.partner.microsoftonline.cn",
          preferred_cache: "login.partner.microsoftonline.cn",
          aliases: [
            "login.partner.microsoftonline.cn",
            "login.chinacloudapi.cn"
          ]
        },
        {
          preferred_network: "login.microsoftonline.de",
          preferred_cache: "login.microsoftonline.de",
          aliases: ["login.microsoftonline.de"]
        },
        {
          preferred_network: "login.microsoftonline.us",
          preferred_cache: "login.microsoftonline.us",
          aliases: [
            "login.microsoftonline.us",
            "login.usgovcloudapi.net"
          ]
        },
        {
          preferred_network: "login-us.microsoftonline.com",
          preferred_cache: "login-us.microsoftonline.com",
          aliases: ["login-us.microsoftonline.com"]
        }
      ]
    }
  };
  const EndpointMetadata = rawMetdataJSON.endpointMetadata;
  const InstanceDiscoveryMetadata = rawMetdataJSON.instanceDiscoveryMetadata;
  const InstanceDiscoveryMetadataAliases = /* @__PURE__ */ new Set();
  InstanceDiscoveryMetadata.metadata.forEach((metadataEntry) => {
    metadataEntry.aliases.forEach((alias) => {
      InstanceDiscoveryMetadataAliases.add(alias);
    });
  });
  function getAliasesFromStaticSources(staticAuthorityOptions, logger) {
    var _a;
    let staticAliases;
    const canonicalAuthority = staticAuthorityOptions.canonicalAuthority;
    if (canonicalAuthority) {
      const authorityHost = new UrlString(canonicalAuthority).getUrlComponents().HostNameAndPort;
      staticAliases = getAliasesFromMetadata(authorityHost, (_a = staticAuthorityOptions.cloudDiscoveryMetadata) == null ? void 0 : _a.metadata, AuthorityMetadataSource.CONFIG, logger) || getAliasesFromMetadata(authorityHost, InstanceDiscoveryMetadata.metadata, AuthorityMetadataSource.HARDCODED_VALUES, logger) || staticAuthorityOptions.knownAuthorities;
    }
    return staticAliases || [];
  }
  function getAliasesFromMetadata(authorityHost, cloudDiscoveryMetadata, source, logger) {
    logger == null ? void 0 : logger.trace(`getAliasesFromMetadata called with source: ${source}`);
    if (authorityHost && cloudDiscoveryMetadata) {
      const metadata = getCloudDiscoveryMetadataFromNetworkResponse(cloudDiscoveryMetadata, authorityHost);
      if (metadata) {
        logger == null ? void 0 : logger.trace(`getAliasesFromMetadata: found cloud discovery metadata in ${source}, returning aliases`);
        return metadata.aliases;
      } else {
        logger == null ? void 0 : logger.trace(`getAliasesFromMetadata: did not find cloud discovery metadata in ${source}`);
      }
    }
    return null;
  }
  function getCloudDiscoveryMetadataFromHardcodedValues(authorityHost) {
    const metadata = getCloudDiscoveryMetadataFromNetworkResponse(InstanceDiscoveryMetadata.metadata, authorityHost);
    return metadata;
  }
  function getCloudDiscoveryMetadataFromNetworkResponse(response, authorityHost) {
    for (let i = 0; i < response.length; i++) {
      const metadata = response[i];
      if (metadata.aliases.includes(authorityHost)) {
        return metadata;
      }
    }
    return null;
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const cacheQuotaExceeded = "cache_quota_exceeded";
  const cacheErrorUnknown = "cache_error_unknown";
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const CacheErrorMessages = {
    [cacheQuotaExceeded]: "Exceeded cache storage capacity.",
    [cacheErrorUnknown]: "Unexpected error occurred when using cache storage."
  };
  class CacheError extends Error {
    constructor(errorCode, errorMessage) {
      const message = errorMessage || (CacheErrorMessages[errorCode] ? CacheErrorMessages[errorCode] : CacheErrorMessages[cacheErrorUnknown]);
      super(`${errorCode}: ${message}`);
      Object.setPrototypeOf(this, CacheError.prototype);
      this.name = "CacheError";
      this.errorCode = errorCode;
      this.errorMessage = message;
    }
  }
  function createCacheError(e) {
    if (!(e instanceof Error)) {
      return new CacheError(cacheErrorUnknown);
    }
    if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.message.includes("exceeded the quota")) {
      return new CacheError(cacheQuotaExceeded);
    } else {
      return new CacheError(e.name, e.message);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class CacheManager {
    constructor(clientId, cryptoImpl, logger, staticAuthorityOptions) {
      this.clientId = clientId;
      this.cryptoImpl = cryptoImpl;
      this.commonLogger = logger.clone(name$1, version$1);
      this.staticAuthorityOptions = staticAuthorityOptions;
    }
    /**
     * Returns all the accounts in the cache that match the optional filter. If no filter is provided, all accounts are returned.
     * @param accountFilter - (Optional) filter to narrow down the accounts returned
     * @returns Array of AccountInfo objects in cache
     */
    getAllAccounts(correlationId, accountFilter) {
      return this.buildTenantProfiles(this.getAccountsFilteredBy(accountFilter || {}, correlationId), correlationId, accountFilter);
    }
    /**
     * Gets first tenanted AccountInfo object found based on provided filters
     */
    getAccountInfoFilteredBy(accountFilter, correlationId) {
      const allAccounts = this.getAllAccounts(correlationId, accountFilter);
      if (allAccounts.length > 1) {
        const sortedAccounts = allAccounts.sort((account) => {
          return account.idTokenClaims ? -1 : 1;
        });
        return sortedAccounts[0];
      } else if (allAccounts.length === 1) {
        return allAccounts[0];
      } else {
        return null;
      }
    }
    /**
     * Returns a single matching
     * @param accountFilter
     * @returns
     */
    getBaseAccountInfo(accountFilter, correlationId) {
      const accountEntities = this.getAccountsFilteredBy(accountFilter, correlationId);
      if (accountEntities.length > 0) {
        return accountEntities[0].getAccountInfo();
      } else {
        return null;
      }
    }
    /**
     * Matches filtered account entities with cached ID tokens that match the tenant profile-specific account filters
     * and builds the account info objects from the matching ID token's claims
     * @param cachedAccounts
     * @param accountFilter
     * @returns Array of AccountInfo objects that match account and tenant profile filters
     */
    buildTenantProfiles(cachedAccounts, correlationId, accountFilter) {
      return cachedAccounts.flatMap((accountEntity) => {
        return this.getTenantProfilesFromAccountEntity(accountEntity, correlationId, accountFilter == null ? void 0 : accountFilter.tenantId, accountFilter);
      });
    }
    getTenantedAccountInfoByFilter(accountInfo, tokenKeys, tenantProfile, correlationId, tenantProfileFilter) {
      let tenantedAccountInfo = null;
      let idTokenClaims;
      if (tenantProfileFilter) {
        if (!this.tenantProfileMatchesFilter(tenantProfile, tenantProfileFilter)) {
          return null;
        }
      }
      const idToken = this.getIdToken(accountInfo, correlationId, tokenKeys, tenantProfile.tenantId);
      if (idToken) {
        idTokenClaims = extractTokenClaims(idToken.secret, this.cryptoImpl.base64Decode);
        if (!this.idTokenClaimsMatchTenantProfileFilter(idTokenClaims, tenantProfileFilter)) {
          return null;
        }
      }
      tenantedAccountInfo = updateAccountTenantProfileData(accountInfo, tenantProfile, idTokenClaims, idToken == null ? void 0 : idToken.secret);
      return tenantedAccountInfo;
    }
    getTenantProfilesFromAccountEntity(accountEntity, correlationId, targetTenantId, tenantProfileFilter) {
      const accountInfo = accountEntity.getAccountInfo();
      let searchTenantProfiles = accountInfo.tenantProfiles || /* @__PURE__ */ new Map();
      const tokenKeys = this.getTokenKeys();
      if (targetTenantId) {
        const tenantProfile = searchTenantProfiles.get(targetTenantId);
        if (tenantProfile) {
          searchTenantProfiles = /* @__PURE__ */ new Map([
            [targetTenantId, tenantProfile]
          ]);
        } else {
          return [];
        }
      }
      const matchingTenantProfiles = [];
      searchTenantProfiles.forEach((tenantProfile) => {
        const tenantedAccountInfo = this.getTenantedAccountInfoByFilter(accountInfo, tokenKeys, tenantProfile, correlationId, tenantProfileFilter);
        if (tenantedAccountInfo) {
          matchingTenantProfiles.push(tenantedAccountInfo);
        }
      });
      return matchingTenantProfiles;
    }
    tenantProfileMatchesFilter(tenantProfile, tenantProfileFilter) {
      if (!!tenantProfileFilter.localAccountId && !this.matchLocalAccountIdFromTenantProfile(tenantProfile, tenantProfileFilter.localAccountId)) {
        return false;
      }
      if (!!tenantProfileFilter.name && !(tenantProfile.name === tenantProfileFilter.name)) {
        return false;
      }
      if (tenantProfileFilter.isHomeTenant !== void 0 && !(tenantProfile.isHomeTenant === tenantProfileFilter.isHomeTenant)) {
        return false;
      }
      return true;
    }
    idTokenClaimsMatchTenantProfileFilter(idTokenClaims, tenantProfileFilter) {
      if (tenantProfileFilter) {
        if (!!tenantProfileFilter.localAccountId && !this.matchLocalAccountIdFromTokenClaims(idTokenClaims, tenantProfileFilter.localAccountId)) {
          return false;
        }
        if (!!tenantProfileFilter.loginHint && !this.matchLoginHintFromTokenClaims(idTokenClaims, tenantProfileFilter.loginHint)) {
          return false;
        }
        if (!!tenantProfileFilter.username && !this.matchUsername(idTokenClaims.preferred_username, tenantProfileFilter.username)) {
          return false;
        }
        if (!!tenantProfileFilter.name && !this.matchName(idTokenClaims, tenantProfileFilter.name)) {
          return false;
        }
        if (!!tenantProfileFilter.sid && !this.matchSid(idTokenClaims, tenantProfileFilter.sid)) {
          return false;
        }
      }
      return true;
    }
    /**
     * saves a cache record
     * @param cacheRecord {CacheRecord}
     * @param storeInCache {?StoreInCache}
     * @param correlationId {?string} correlation id
     */
    async saveCacheRecord(cacheRecord, correlationId, storeInCache) {
      var _a;
      if (!cacheRecord) {
        throw createClientAuthError(invalidCacheRecord);
      }
      try {
        if (!!cacheRecord.account) {
          this.setAccount(cacheRecord.account, correlationId);
        }
        if (!!cacheRecord.idToken && (storeInCache == null ? void 0 : storeInCache.idToken) !== false) {
          this.setIdTokenCredential(cacheRecord.idToken, correlationId);
        }
        if (!!cacheRecord.accessToken && (storeInCache == null ? void 0 : storeInCache.accessToken) !== false) {
          await this.saveAccessToken(cacheRecord.accessToken, correlationId);
        }
        if (!!cacheRecord.refreshToken && (storeInCache == null ? void 0 : storeInCache.refreshToken) !== false) {
          this.setRefreshTokenCredential(cacheRecord.refreshToken, correlationId);
        }
        if (!!cacheRecord.appMetadata) {
          this.setAppMetadata(cacheRecord.appMetadata, correlationId);
        }
      } catch (e) {
        (_a = this.commonLogger) == null ? void 0 : _a.error(`CacheManager.saveCacheRecord: failed`);
        if (e instanceof AuthError) {
          throw e;
        } else {
          throw createCacheError(e);
        }
      }
    }
    /**
     * saves access token credential
     * @param credential
     */
    async saveAccessToken(credential, correlationId) {
      const accessTokenFilter = {
        clientId: credential.clientId,
        credentialType: credential.credentialType,
        environment: credential.environment,
        homeAccountId: credential.homeAccountId,
        realm: credential.realm,
        tokenType: credential.tokenType,
        requestedClaimsHash: credential.requestedClaimsHash
      };
      const tokenKeys = this.getTokenKeys();
      const currentScopes = ScopeSet.fromString(credential.target);
      tokenKeys.accessToken.forEach((key) => {
        if (!this.accessTokenKeyMatchesFilter(key, accessTokenFilter, false)) {
          return;
        }
        const tokenEntity = this.getAccessTokenCredential(key, correlationId);
        if (tokenEntity && this.credentialMatchesFilter(tokenEntity, accessTokenFilter)) {
          const tokenScopeSet = ScopeSet.fromString(tokenEntity.target);
          if (tokenScopeSet.intersectingScopeSets(currentScopes)) {
            this.removeAccessToken(key, correlationId);
          }
        }
      });
      this.setAccessTokenCredential(credential, correlationId);
    }
    /**
     * Retrieve account entities matching all provided tenant-agnostic filters; if no filter is set, get all account entities in the cache
     * Not checking for casing as keys are all generated in lower case, remember to convert to lower case if object properties are compared
     * @param accountFilter - An object containing Account properties to filter by
     */
    getAccountsFilteredBy(accountFilter, correlationId) {
      const allAccountKeys = this.getAccountKeys();
      const matchingAccounts = [];
      allAccountKeys.forEach((cacheKey) => {
        var _a;
        if (!this.isAccountKey(cacheKey, accountFilter.homeAccountId)) {
          return;
        }
        const entity = this.getAccount(cacheKey, correlationId, this.commonLogger);
        if (!entity) {
          return;
        }
        if (!!accountFilter.homeAccountId && !this.matchHomeAccountId(entity, accountFilter.homeAccountId)) {
          return;
        }
        if (!!accountFilter.username && !this.matchUsername(entity.username, accountFilter.username)) {
          return;
        }
        if (!!accountFilter.environment && !this.matchEnvironment(entity, accountFilter.environment)) {
          return;
        }
        if (!!accountFilter.realm && !this.matchRealm(entity, accountFilter.realm)) {
          return;
        }
        if (!!accountFilter.nativeAccountId && !this.matchNativeAccountId(entity, accountFilter.nativeAccountId)) {
          return;
        }
        if (!!accountFilter.authorityType && !this.matchAuthorityType(entity, accountFilter.authorityType)) {
          return;
        }
        const tenantProfileFilter = {
          localAccountId: accountFilter == null ? void 0 : accountFilter.localAccountId,
          name: accountFilter == null ? void 0 : accountFilter.name
        };
        const matchingTenantProfiles = (_a = entity.tenantProfiles) == null ? void 0 : _a.filter((tenantProfile) => {
          return this.tenantProfileMatchesFilter(tenantProfile, tenantProfileFilter);
        });
        if (matchingTenantProfiles && matchingTenantProfiles.length === 0) {
          return;
        }
        matchingAccounts.push(entity);
      });
      return matchingAccounts;
    }
    /**
     * Returns true if the given key matches our account key schema. Also matches homeAccountId and/or tenantId if provided
     * @param key
     * @param homeAccountId
     * @param tenantId
     * @returns
     */
    isAccountKey(key, homeAccountId, tenantId) {
      if (key.split(Separators.CACHE_KEY_SEPARATOR).length < 3) {
        return false;
      }
      if (homeAccountId && !key.toLowerCase().includes(homeAccountId.toLowerCase())) {
        return false;
      }
      if (tenantId && !key.toLowerCase().includes(tenantId.toLowerCase())) {
        return false;
      }
      return true;
    }
    /**
     * Returns true if the given key matches our credential key schema.
     * @param key
     */
    isCredentialKey(key) {
      if (key.split(Separators.CACHE_KEY_SEPARATOR).length < 6) {
        return false;
      }
      const lowerCaseKey = key.toLowerCase();
      if (lowerCaseKey.indexOf(CredentialType.ID_TOKEN.toLowerCase()) === -1 && lowerCaseKey.indexOf(CredentialType.ACCESS_TOKEN.toLowerCase()) === -1 && lowerCaseKey.indexOf(CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME.toLowerCase()) === -1 && lowerCaseKey.indexOf(CredentialType.REFRESH_TOKEN.toLowerCase()) === -1) {
        return false;
      }
      if (lowerCaseKey.indexOf(CredentialType.REFRESH_TOKEN.toLowerCase()) > -1) {
        const clientIdValidation = `${CredentialType.REFRESH_TOKEN}${Separators.CACHE_KEY_SEPARATOR}${this.clientId}${Separators.CACHE_KEY_SEPARATOR}`;
        const familyIdValidation = `${CredentialType.REFRESH_TOKEN}${Separators.CACHE_KEY_SEPARATOR}${THE_FAMILY_ID}${Separators.CACHE_KEY_SEPARATOR}`;
        if (lowerCaseKey.indexOf(clientIdValidation.toLowerCase()) === -1 && lowerCaseKey.indexOf(familyIdValidation.toLowerCase()) === -1) {
          return false;
        }
      } else if (lowerCaseKey.indexOf(this.clientId.toLowerCase()) === -1) {
        return false;
      }
      return true;
    }
    /**
     * Returns whether or not the given credential entity matches the filter
     * @param entity
     * @param filter
     * @returns
     */
    credentialMatchesFilter(entity, filter) {
      if (!!filter.clientId && !this.matchClientId(entity, filter.clientId)) {
        return false;
      }
      if (!!filter.userAssertionHash && !this.matchUserAssertionHash(entity, filter.userAssertionHash)) {
        return false;
      }
      if (typeof filter.homeAccountId === "string" && !this.matchHomeAccountId(entity, filter.homeAccountId)) {
        return false;
      }
      if (!!filter.environment && !this.matchEnvironment(entity, filter.environment)) {
        return false;
      }
      if (!!filter.realm && !this.matchRealm(entity, filter.realm)) {
        return false;
      }
      if (!!filter.credentialType && !this.matchCredentialType(entity, filter.credentialType)) {
        return false;
      }
      if (!!filter.familyId && !this.matchFamilyId(entity, filter.familyId)) {
        return false;
      }
      if (!!filter.target && !this.matchTarget(entity, filter.target)) {
        return false;
      }
      if (filter.requestedClaimsHash || entity.requestedClaimsHash) {
        if (entity.requestedClaimsHash !== filter.requestedClaimsHash) {
          return false;
        }
      }
      if (entity.credentialType === CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME) {
        if (!!filter.tokenType && !this.matchTokenType(entity, filter.tokenType)) {
          return false;
        }
        if (filter.tokenType === AuthenticationScheme.SSH) {
          if (filter.keyId && !this.matchKeyId(entity, filter.keyId)) {
            return false;
          }
        }
      }
      return true;
    }
    /**
     * retrieve appMetadata matching all provided filters; if no filter is set, get all appMetadata
     * @param filter
     */
    getAppMetadataFilteredBy(filter) {
      const allCacheKeys = this.getKeys();
      const matchingAppMetadata = {};
      allCacheKeys.forEach((cacheKey) => {
        if (!this.isAppMetadata(cacheKey)) {
          return;
        }
        const entity = this.getAppMetadata(cacheKey);
        if (!entity) {
          return;
        }
        if (!!filter.environment && !this.matchEnvironment(entity, filter.environment)) {
          return;
        }
        if (!!filter.clientId && !this.matchClientId(entity, filter.clientId)) {
          return;
        }
        matchingAppMetadata[cacheKey] = entity;
      });
      return matchingAppMetadata;
    }
    /**
     * retrieve authorityMetadata that contains a matching alias
     * @param filter
     */
    getAuthorityMetadataByAlias(host) {
      const allCacheKeys = this.getAuthorityMetadataKeys();
      let matchedEntity = null;
      allCacheKeys.forEach((cacheKey) => {
        if (!this.isAuthorityMetadata(cacheKey) || cacheKey.indexOf(this.clientId) === -1) {
          return;
        }
        const entity = this.getAuthorityMetadata(cacheKey);
        if (!entity) {
          return;
        }
        if (entity.aliases.indexOf(host) === -1) {
          return;
        }
        matchedEntity = entity;
      });
      return matchedEntity;
    }
    /**
     * Removes all accounts and related tokens from cache.
     */
    async removeAllAccounts(correlationId) {
      const allAccountKeys = this.getAccountKeys();
      const removedAccounts = [];
      allAccountKeys.forEach((cacheKey) => {
        removedAccounts.push(this.removeAccount(cacheKey, correlationId));
      });
      await Promise.all(removedAccounts);
    }
    /**
     * Removes the account and related tokens for a given account key
     * @param account
     */
    async removeAccount(accountKey, correlationId) {
      const account = this.getAccount(accountKey, correlationId, this.commonLogger);
      if (!account) {
        return;
      }
      await this.removeAccountContext(account, correlationId);
      this.removeItem(accountKey, correlationId);
    }
    /**
     * Removes credentials associated with the provided account
     * @param account
     */
    async removeAccountContext(account, correlationId) {
      const allTokenKeys = this.getTokenKeys();
      const accountId = account.generateAccountId();
      allTokenKeys.idToken.forEach((key) => {
        if (key.indexOf(accountId) === 0) {
          this.removeIdToken(key, correlationId);
        }
      });
      allTokenKeys.accessToken.forEach((key) => {
        if (key.indexOf(accountId) === 0) {
          this.removeAccessToken(key, correlationId);
        }
      });
      allTokenKeys.refreshToken.forEach((key) => {
        if (key.indexOf(accountId) === 0) {
          this.removeRefreshToken(key, correlationId);
        }
      });
      this.getKeys().forEach((key) => {
        if (key.includes(accountId)) {
          this.removeItem(key, correlationId);
        }
      });
    }
    /**
     * Migrates a single-tenant account and all it's associated alternate cross-tenant account objects in the
     * cache into a condensed multi-tenant account object with tenant profiles.
     * @param accountKey
     * @param accountEntity
     * @param logger
     * @returns
     */
    updateOutdatedCachedAccount(accountKey, accountEntity, correlationId, logger) {
      var _a;
      if (accountEntity && accountEntity.isSingleTenant()) {
        (_a = this.commonLogger) == null ? void 0 : _a.verbose("updateOutdatedCachedAccount: Found a single-tenant (outdated) account entity in the cache, migrating to multi-tenant account entity");
        const matchingAccountKeys = this.getAccountKeys().filter((key) => {
          return key.startsWith(accountEntity.homeAccountId);
        });
        const accountsToMerge = [];
        matchingAccountKeys.forEach((key) => {
          const account = this.getCachedAccountEntity(key, correlationId);
          if (account) {
            accountsToMerge.push(account);
          }
        });
        const baseAccount = accountsToMerge.find((account) => {
          return tenantIdMatchesHomeTenant(account.realm, account.homeAccountId);
        }) || accountsToMerge[0];
        baseAccount.tenantProfiles = accountsToMerge.map((account) => {
          return {
            tenantId: account.realm,
            localAccountId: account.localAccountId,
            name: account.name,
            isHomeTenant: tenantIdMatchesHomeTenant(account.realm, account.homeAccountId)
          };
        });
        const updatedAccount = CacheManager.toObject(new AccountEntity(), {
          ...baseAccount
        });
        const newAccountKey = updatedAccount.generateAccountKey();
        matchingAccountKeys.forEach((key) => {
          if (key !== newAccountKey) {
            this.removeOutdatedAccount(accountKey, correlationId);
          }
        });
        this.setAccount(updatedAccount, correlationId);
        logger == null ? void 0 : logger.verbose("Updated an outdated account entity in the cache");
        return updatedAccount;
      }
      return accountEntity;
    }
    /**
     * returns a boolean if the given credential is removed
     * @param credential
     */
    removeAccessToken(key, correlationId) {
      const credential = this.getAccessTokenCredential(key, correlationId);
      this.removeItem(key, correlationId);
      if (!credential || credential.credentialType.toLowerCase() !== CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME.toLowerCase() || credential.tokenType !== AuthenticationScheme.POP) {
        return;
      }
      const kid = credential.keyId;
      if (kid) {
        void this.cryptoImpl.removeTokenBindingKey(kid).catch(() => {
          this.commonLogger.error("Binding key could not be removed");
        });
      }
    }
    /**
     * Removes all app metadata objects from cache.
     */
    removeAppMetadata(correlationId) {
      const allCacheKeys = this.getKeys();
      allCacheKeys.forEach((cacheKey) => {
        if (this.isAppMetadata(cacheKey)) {
          this.removeItem(cacheKey, correlationId);
        }
      });
      return true;
    }
    /**
     * Retrieve AccountEntity from cache
     * @param account
     */
    readAccountFromCache(account, correlationId) {
      const accountKey = AccountEntity.generateAccountCacheKey(account);
      return this.getAccount(accountKey, correlationId, this.commonLogger);
    }
    /**
     * Retrieve IdTokenEntity from cache
     * @param account {AccountInfo}
     * @param tokenKeys {?TokenKeys}
     * @param targetRealm {?string}
     * @param performanceClient {?IPerformanceClient}
     * @param correlationId {?string}
     */
    getIdToken(account, correlationId, tokenKeys, targetRealm, performanceClient) {
      this.commonLogger.trace("CacheManager - getIdToken called");
      const idTokenFilter = {
        homeAccountId: account.homeAccountId,
        environment: account.environment,
        credentialType: CredentialType.ID_TOKEN,
        clientId: this.clientId,
        realm: targetRealm
      };
      const idTokenMap = this.getIdTokensByFilter(idTokenFilter, correlationId, tokenKeys);
      const numIdTokens = idTokenMap.size;
      if (numIdTokens < 1) {
        this.commonLogger.info("CacheManager:getIdToken - No token found");
        return null;
      } else if (numIdTokens > 1) {
        let tokensToBeRemoved = idTokenMap;
        if (!targetRealm) {
          const homeIdTokenMap = /* @__PURE__ */ new Map();
          idTokenMap.forEach((idToken, key) => {
            if (idToken.realm === account.tenantId) {
              homeIdTokenMap.set(key, idToken);
            }
          });
          const numHomeIdTokens = homeIdTokenMap.size;
          if (numHomeIdTokens < 1) {
            this.commonLogger.info("CacheManager:getIdToken - Multiple ID tokens found for account but none match account entity tenant id, returning first result");
            return idTokenMap.values().next().value;
          } else if (numHomeIdTokens === 1) {
            this.commonLogger.info("CacheManager:getIdToken - Multiple ID tokens found for account, defaulting to home tenant profile");
            return homeIdTokenMap.values().next().value;
          } else {
            tokensToBeRemoved = homeIdTokenMap;
          }
        }
        this.commonLogger.info("CacheManager:getIdToken - Multiple matching ID tokens found, clearing them");
        tokensToBeRemoved.forEach((idToken, key) => {
          this.removeIdToken(key, correlationId);
        });
        if (performanceClient && correlationId) {
          performanceClient.addFields({ multiMatchedID: idTokenMap.size }, correlationId);
        }
        return null;
      }
      this.commonLogger.info("CacheManager:getIdToken - Returning ID token");
      return idTokenMap.values().next().value;
    }
    /**
     * Gets all idTokens matching the given filter
     * @param filter
     * @returns
     */
    getIdTokensByFilter(filter, correlationId, tokenKeys) {
      const idTokenKeys = tokenKeys && tokenKeys.idToken || this.getTokenKeys().idToken;
      const idTokens = /* @__PURE__ */ new Map();
      idTokenKeys.forEach((key) => {
        if (!this.idTokenKeyMatchesFilter(key, {
          clientId: this.clientId,
          ...filter
        })) {
          return;
        }
        const idToken = this.getIdTokenCredential(key, correlationId);
        if (idToken && this.credentialMatchesFilter(idToken, filter)) {
          idTokens.set(key, idToken);
        }
      });
      return idTokens;
    }
    /**
     * Validate the cache key against filter before retrieving and parsing cache value
     * @param key
     * @param filter
     * @returns
     */
    idTokenKeyMatchesFilter(inputKey, filter) {
      const key = inputKey.toLowerCase();
      if (filter.clientId && key.indexOf(filter.clientId.toLowerCase()) === -1) {
        return false;
      }
      if (filter.homeAccountId && key.indexOf(filter.homeAccountId.toLowerCase()) === -1) {
        return false;
      }
      return true;
    }
    /**
     * Removes idToken from the cache
     * @param key
     */
    removeIdToken(key, correlationId) {
      this.removeItem(key, correlationId);
    }
    /**
     * Removes refresh token from the cache
     * @param key
     */
    removeRefreshToken(key, correlationId) {
      this.removeItem(key, correlationId);
    }
    /**
     * Retrieve AccessTokenEntity from cache
     * @param account {AccountInfo}
     * @param request {BaseAuthRequest}
     * @param tokenKeys {?TokenKeys}
     * @param performanceClient {?IPerformanceClient}
     * @param correlationId {?string}
     */
    getAccessToken(account, request, tokenKeys, targetRealm, performanceClient) {
      this.commonLogger.trace("CacheManager - getAccessToken called");
      const scopes = ScopeSet.createSearchScopes(request.scopes);
      const authScheme = request.authenticationScheme || AuthenticationScheme.BEARER;
      const credentialType = authScheme.toLowerCase() !== AuthenticationScheme.BEARER.toLowerCase() ? CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME : CredentialType.ACCESS_TOKEN;
      const accessTokenFilter = {
        homeAccountId: account.homeAccountId,
        environment: account.environment,
        credentialType,
        clientId: this.clientId,
        realm: targetRealm || account.tenantId,
        target: scopes,
        tokenType: authScheme,
        keyId: request.sshKid,
        requestedClaimsHash: request.requestedClaimsHash
      };
      const accessTokenKeys = tokenKeys && tokenKeys.accessToken || this.getTokenKeys().accessToken;
      const accessTokens = [];
      accessTokenKeys.forEach((key) => {
        if (this.accessTokenKeyMatchesFilter(key, accessTokenFilter, true)) {
          const accessToken = this.getAccessTokenCredential(key, request.correlationId);
          if (accessToken && this.credentialMatchesFilter(accessToken, accessTokenFilter)) {
            accessTokens.push(accessToken);
          }
        }
      });
      const numAccessTokens = accessTokens.length;
      if (numAccessTokens < 1) {
        this.commonLogger.info("CacheManager:getAccessToken - No token found");
        return null;
      } else if (numAccessTokens > 1) {
        this.commonLogger.info("CacheManager:getAccessToken - Multiple access tokens found, clearing them");
        accessTokens.forEach((accessToken) => {
          void this.removeAccessToken(generateCredentialKey(accessToken), request.correlationId);
        });
        if (performanceClient && request.correlationId) {
          performanceClient.addFields({ multiMatchedAT: accessTokens.length }, request.correlationId);
        }
        return null;
      }
      this.commonLogger.info("CacheManager:getAccessToken - Returning access token");
      return accessTokens[0];
    }
    /**
     * Validate the cache key against filter before retrieving and parsing cache value
     * @param key
     * @param filter
     * @param keyMustContainAllScopes
     * @returns
     */
    accessTokenKeyMatchesFilter(inputKey, filter, keyMustContainAllScopes) {
      const key = inputKey.toLowerCase();
      if (filter.clientId && key.indexOf(filter.clientId.toLowerCase()) === -1) {
        return false;
      }
      if (filter.homeAccountId && key.indexOf(filter.homeAccountId.toLowerCase()) === -1) {
        return false;
      }
      if (filter.realm && key.indexOf(filter.realm.toLowerCase()) === -1) {
        return false;
      }
      if (filter.requestedClaimsHash && key.indexOf(filter.requestedClaimsHash.toLowerCase()) === -1) {
        return false;
      }
      if (filter.target) {
        const scopes = filter.target.asArray();
        for (let i = 0; i < scopes.length; i++) {
          if (keyMustContainAllScopes && !key.includes(scopes[i].toLowerCase())) {
            return false;
          } else if (!keyMustContainAllScopes && key.includes(scopes[i].toLowerCase())) {
            return true;
          }
        }
      }
      return true;
    }
    /**
     * Gets all access tokens matching the filter
     * @param filter
     * @returns
     */
    getAccessTokensByFilter(filter, correlationId) {
      const tokenKeys = this.getTokenKeys();
      const accessTokens = [];
      tokenKeys.accessToken.forEach((key) => {
        if (!this.accessTokenKeyMatchesFilter(key, filter, true)) {
          return;
        }
        const accessToken = this.getAccessTokenCredential(key, correlationId);
        if (accessToken && this.credentialMatchesFilter(accessToken, filter)) {
          accessTokens.push(accessToken);
        }
      });
      return accessTokens;
    }
    /**
     * Helper to retrieve the appropriate refresh token from cache
     * @param account {AccountInfo}
     * @param familyRT {boolean}
     * @param tokenKeys {?TokenKeys}
     * @param performanceClient {?IPerformanceClient}
     * @param correlationId {?string}
     */
    getRefreshToken(account, familyRT, correlationId, tokenKeys, performanceClient) {
      this.commonLogger.trace("CacheManager - getRefreshToken called");
      const id = familyRT ? THE_FAMILY_ID : void 0;
      const refreshTokenFilter = {
        homeAccountId: account.homeAccountId,
        environment: account.environment,
        credentialType: CredentialType.REFRESH_TOKEN,
        clientId: this.clientId,
        familyId: id
      };
      const refreshTokenKeys = tokenKeys && tokenKeys.refreshToken || this.getTokenKeys().refreshToken;
      const refreshTokens = [];
      refreshTokenKeys.forEach((key) => {
        if (this.refreshTokenKeyMatchesFilter(key, refreshTokenFilter)) {
          const refreshToken = this.getRefreshTokenCredential(key, correlationId);
          if (refreshToken && this.credentialMatchesFilter(refreshToken, refreshTokenFilter)) {
            refreshTokens.push(refreshToken);
          }
        }
      });
      const numRefreshTokens = refreshTokens.length;
      if (numRefreshTokens < 1) {
        this.commonLogger.info("CacheManager:getRefreshToken - No refresh token found.");
        return null;
      }
      if (numRefreshTokens > 1 && performanceClient && correlationId) {
        performanceClient.addFields({ multiMatchedRT: numRefreshTokens }, correlationId);
      }
      this.commonLogger.info("CacheManager:getRefreshToken - returning refresh token");
      return refreshTokens[0];
    }
    /**
     * Validate the cache key against filter before retrieving and parsing cache value
     * @param key
     * @param filter
     */
    refreshTokenKeyMatchesFilter(inputKey, filter) {
      const key = inputKey.toLowerCase();
      if (filter.familyId && key.indexOf(filter.familyId.toLowerCase()) === -1) {
        return false;
      }
      if (!filter.familyId && filter.clientId && key.indexOf(filter.clientId.toLowerCase()) === -1) {
        return false;
      }
      if (filter.homeAccountId && key.indexOf(filter.homeAccountId.toLowerCase()) === -1) {
        return false;
      }
      return true;
    }
    /**
     * Retrieve AppMetadataEntity from cache
     */
    readAppMetadataFromCache(environment) {
      const appMetadataFilter = {
        environment,
        clientId: this.clientId
      };
      const appMetadata = this.getAppMetadataFilteredBy(appMetadataFilter);
      const appMetadataEntries = Object.keys(appMetadata).map((key) => appMetadata[key]);
      const numAppMetadata = appMetadataEntries.length;
      if (numAppMetadata < 1) {
        return null;
      } else if (numAppMetadata > 1) {
        throw createClientAuthError(multipleMatchingAppMetadata);
      }
      return appMetadataEntries[0];
    }
    /**
     * Return the family_id value associated  with FOCI
     * @param environment
     * @param clientId
     */
    isAppMetadataFOCI(environment) {
      const appMetadata = this.readAppMetadataFromCache(environment);
      return !!(appMetadata && appMetadata.familyId === THE_FAMILY_ID);
    }
    /**
     * helper to match account ids
     * @param value
     * @param homeAccountId
     */
    matchHomeAccountId(entity, homeAccountId) {
      return !!(typeof entity.homeAccountId === "string" && homeAccountId === entity.homeAccountId);
    }
    /**
     * helper to match account ids
     * @param entity
     * @param localAccountId
     * @returns
     */
    matchLocalAccountIdFromTokenClaims(tokenClaims, localAccountId) {
      const idTokenLocalAccountId = tokenClaims.oid || tokenClaims.sub;
      return localAccountId === idTokenLocalAccountId;
    }
    matchLocalAccountIdFromTenantProfile(tenantProfile, localAccountId) {
      return tenantProfile.localAccountId === localAccountId;
    }
    /**
     * helper to match names
     * @param entity
     * @param name
     * @returns true if the downcased name properties are present and match in the filter and the entity
     */
    matchName(claims, name2) {
      var _a;
      return !!(name2.toLowerCase() === ((_a = claims.name) == null ? void 0 : _a.toLowerCase()));
    }
    /**
     * helper to match usernames
     * @param entity
     * @param username
     * @returns
     */
    matchUsername(cachedUsername, filterUsername) {
      return !!(cachedUsername && typeof cachedUsername === "string" && (filterUsername == null ? void 0 : filterUsername.toLowerCase()) === cachedUsername.toLowerCase());
    }
    /**
     * helper to match assertion
     * @param value
     * @param oboAssertion
     */
    matchUserAssertionHash(entity, userAssertionHash) {
      return !!(entity.userAssertionHash && userAssertionHash === entity.userAssertionHash);
    }
    /**
     * helper to match environment
     * @param value
     * @param environment
     */
    matchEnvironment(entity, environment) {
      if (this.staticAuthorityOptions) {
        const staticAliases = getAliasesFromStaticSources(this.staticAuthorityOptions, this.commonLogger);
        if (staticAliases.includes(environment) && staticAliases.includes(entity.environment)) {
          return true;
        }
      }
      const cloudMetadata = this.getAuthorityMetadataByAlias(environment);
      if (cloudMetadata && cloudMetadata.aliases.indexOf(entity.environment) > -1) {
        return true;
      }
      return false;
    }
    /**
     * helper to match credential type
     * @param entity
     * @param credentialType
     */
    matchCredentialType(entity, credentialType) {
      return entity.credentialType && credentialType.toLowerCase() === entity.credentialType.toLowerCase();
    }
    /**
     * helper to match client ids
     * @param entity
     * @param clientId
     */
    matchClientId(entity, clientId) {
      return !!(entity.clientId && clientId === entity.clientId);
    }
    /**
     * helper to match family ids
     * @param entity
     * @param familyId
     */
    matchFamilyId(entity, familyId) {
      return !!(entity.familyId && familyId === entity.familyId);
    }
    /**
     * helper to match realm
     * @param entity
     * @param realm
     */
    matchRealm(entity, realm) {
      var _a;
      return !!(((_a = entity.realm) == null ? void 0 : _a.toLowerCase()) === realm.toLowerCase());
    }
    /**
     * helper to match nativeAccountId
     * @param entity
     * @param nativeAccountId
     * @returns boolean indicating the match result
     */
    matchNativeAccountId(entity, nativeAccountId) {
      return !!(entity.nativeAccountId && nativeAccountId === entity.nativeAccountId);
    }
    /**
     * helper to match loginHint which can be either:
     * 1. login_hint ID token claim
     * 2. username in cached account object
     * 3. upn in ID token claims
     * @param entity
     * @param loginHint
     * @returns
     */
    matchLoginHintFromTokenClaims(tokenClaims, loginHint) {
      if (tokenClaims.login_hint === loginHint) {
        return true;
      }
      if (tokenClaims.preferred_username === loginHint) {
        return true;
      }
      if (tokenClaims.upn === loginHint) {
        return true;
      }
      return false;
    }
    /**
     * Helper to match sid
     * @param entity
     * @param sid
     * @returns true if the sid claim is present and matches the filter
     */
    matchSid(idTokenClaims, sid) {
      return idTokenClaims.sid === sid;
    }
    matchAuthorityType(entity, authorityType) {
      return !!(entity.authorityType && authorityType.toLowerCase() === entity.authorityType.toLowerCase());
    }
    /**
     * Returns true if the target scopes are a subset of the current entity's scopes, false otherwise.
     * @param entity
     * @param target
     */
    matchTarget(entity, target) {
      const isNotAccessTokenCredential = entity.credentialType !== CredentialType.ACCESS_TOKEN && entity.credentialType !== CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME;
      if (isNotAccessTokenCredential || !entity.target) {
        return false;
      }
      const entityScopeSet = ScopeSet.fromString(entity.target);
      return entityScopeSet.containsScopeSet(target);
    }
    /**
     * Returns true if the credential's tokenType or Authentication Scheme matches the one in the request, false otherwise
     * @param entity
     * @param tokenType
     */
    matchTokenType(entity, tokenType) {
      return !!(entity.tokenType && entity.tokenType === tokenType);
    }
    /**
     * Returns true if the credential's keyId matches the one in the request, false otherwise
     * @param entity
     * @param keyId
     */
    matchKeyId(entity, keyId) {
      return !!(entity.keyId && entity.keyId === keyId);
    }
    /**
     * returns if a given cache entity is of the type appmetadata
     * @param key
     */
    isAppMetadata(key) {
      return key.indexOf(APP_METADATA) !== -1;
    }
    /**
     * returns if a given cache entity is of the type authoritymetadata
     * @param key
     */
    isAuthorityMetadata(key) {
      return key.indexOf(AUTHORITY_METADATA_CONSTANTS.CACHE_KEY) !== -1;
    }
    /**
     * returns cache key used for cloud instance metadata
     */
    generateAuthorityMetadataCacheKey(authority) {
      return `${AUTHORITY_METADATA_CONSTANTS.CACHE_KEY}-${this.clientId}-${authority}`;
    }
    /**
     * Helper to convert serialized data to object
     * @param obj
     * @param json
     */
    static toObject(obj, json) {
      for (const propertyName in json) {
        obj[propertyName] = json[propertyName];
      }
      return obj;
    }
  }
  class DefaultStorageClass extends CacheManager {
    setAccount() {
      throw createClientAuthError(methodNotImplemented);
    }
    getAccount() {
      throw createClientAuthError(methodNotImplemented);
    }
    getCachedAccountEntity() {
      throw createClientAuthError(methodNotImplemented);
    }
    setIdTokenCredential() {
      throw createClientAuthError(methodNotImplemented);
    }
    getIdTokenCredential() {
      throw createClientAuthError(methodNotImplemented);
    }
    setAccessTokenCredential() {
      throw createClientAuthError(methodNotImplemented);
    }
    getAccessTokenCredential() {
      throw createClientAuthError(methodNotImplemented);
    }
    setRefreshTokenCredential() {
      throw createClientAuthError(methodNotImplemented);
    }
    getRefreshTokenCredential() {
      throw createClientAuthError(methodNotImplemented);
    }
    setAppMetadata() {
      throw createClientAuthError(methodNotImplemented);
    }
    getAppMetadata() {
      throw createClientAuthError(methodNotImplemented);
    }
    setServerTelemetry() {
      throw createClientAuthError(methodNotImplemented);
    }
    getServerTelemetry() {
      throw createClientAuthError(methodNotImplemented);
    }
    setAuthorityMetadata() {
      throw createClientAuthError(methodNotImplemented);
    }
    getAuthorityMetadata() {
      throw createClientAuthError(methodNotImplemented);
    }
    getAuthorityMetadataKeys() {
      throw createClientAuthError(methodNotImplemented);
    }
    setThrottlingCache() {
      throw createClientAuthError(methodNotImplemented);
    }
    getThrottlingCache() {
      throw createClientAuthError(methodNotImplemented);
    }
    removeItem() {
      throw createClientAuthError(methodNotImplemented);
    }
    getKeys() {
      throw createClientAuthError(methodNotImplemented);
    }
    getAccountKeys() {
      throw createClientAuthError(methodNotImplemented);
    }
    getTokenKeys() {
      throw createClientAuthError(methodNotImplemented);
    }
    updateCredentialCacheKey() {
      throw createClientAuthError(methodNotImplemented);
    }
    removeOutdatedAccount() {
      throw createClientAuthError(methodNotImplemented);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const DEFAULT_SYSTEM_OPTIONS$1 = {
    tokenRenewalOffsetSeconds: DEFAULT_TOKEN_RENEWAL_OFFSET_SEC,
    preventCorsPreflight: false
  };
  const DEFAULT_LOGGER_IMPLEMENTATION = {
    loggerCallback: () => {
    },
    piiLoggingEnabled: false,
    logLevel: exports.LogLevel.Info,
    correlationId: Constants$1.EMPTY_STRING
  };
  const DEFAULT_CACHE_OPTIONS$1 = {
    claimsBasedCachingEnabled: false
  };
  const DEFAULT_NETWORK_IMPLEMENTATION = {
    async sendGetRequestAsync() {
      throw createClientAuthError(methodNotImplemented);
    },
    async sendPostRequestAsync() {
      throw createClientAuthError(methodNotImplemented);
    }
  };
  const DEFAULT_LIBRARY_INFO = {
    sku: Constants$1.SKU,
    version: version$1,
    cpu: Constants$1.EMPTY_STRING,
    os: Constants$1.EMPTY_STRING
  };
  const DEFAULT_CLIENT_CREDENTIALS = {
    clientSecret: Constants$1.EMPTY_STRING,
    clientAssertion: void 0
  };
  const DEFAULT_AZURE_CLOUD_OPTIONS = {
    azureCloudInstance: AzureCloudInstance.None,
    tenant: `${Constants$1.DEFAULT_COMMON_TENANT}`
  };
  const DEFAULT_TELEMETRY_OPTIONS$1 = {
    application: {
      appName: "",
      appVersion: ""
    }
  };
  function buildClientConfiguration({ authOptions: userAuthOptions, systemOptions: userSystemOptions, loggerOptions: userLoggerOption, cacheOptions: userCacheOptions, storageInterface: storageImplementation, networkInterface: networkImplementation, cryptoInterface: cryptoImplementation, clientCredentials, libraryInfo, telemetry, serverTelemetryManager, persistencePlugin, serializableCache }) {
    const loggerOptions = {
      ...DEFAULT_LOGGER_IMPLEMENTATION,
      ...userLoggerOption
    };
    return {
      authOptions: buildAuthOptions(userAuthOptions),
      systemOptions: { ...DEFAULT_SYSTEM_OPTIONS$1, ...userSystemOptions },
      loggerOptions,
      cacheOptions: { ...DEFAULT_CACHE_OPTIONS$1, ...userCacheOptions },
      storageInterface: storageImplementation || new DefaultStorageClass(userAuthOptions.clientId, DEFAULT_CRYPTO_IMPLEMENTATION, new Logger(loggerOptions)),
      networkInterface: networkImplementation || DEFAULT_NETWORK_IMPLEMENTATION,
      cryptoInterface: cryptoImplementation || DEFAULT_CRYPTO_IMPLEMENTATION,
      clientCredentials: clientCredentials || DEFAULT_CLIENT_CREDENTIALS,
      libraryInfo: { ...DEFAULT_LIBRARY_INFO, ...libraryInfo },
      telemetry: { ...DEFAULT_TELEMETRY_OPTIONS$1, ...telemetry },
      serverTelemetryManager: serverTelemetryManager || null,
      persistencePlugin: persistencePlugin || null,
      serializableCache: serializableCache || null
    };
  }
  function buildAuthOptions(authOptions) {
    return {
      clientCapabilities: [],
      azureCloudOptions: DEFAULT_AZURE_CLOUD_OPTIONS,
      skipAuthorityMetadataCache: false,
      instanceAware: false,
      ...authOptions
    };
  }
  function isOidcProtocolMode(config2) {
    return config2.authOptions.authority.options.protocolMode === ProtocolMode.OIDC;
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const CcsCredentialType = {
    HOME_ACCOUNT_ID: "home_account_id",
    UPN: "UPN"
  };
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const CLIENT_ID = "client_id";
  const REDIRECT_URI = "redirect_uri";
  const RESPONSE_TYPE = "response_type";
  const RESPONSE_MODE = "response_mode";
  const GRANT_TYPE = "grant_type";
  const CLAIMS = "claims";
  const SCOPE = "scope";
  const REFRESH_TOKEN = "refresh_token";
  const STATE = "state";
  const NONCE = "nonce";
  const PROMPT = "prompt";
  const CODE = "code";
  const CODE_CHALLENGE = "code_challenge";
  const CODE_CHALLENGE_METHOD = "code_challenge_method";
  const CODE_VERIFIER = "code_verifier";
  const CLIENT_REQUEST_ID = "client-request-id";
  const X_CLIENT_SKU = "x-client-SKU";
  const X_CLIENT_VER = "x-client-VER";
  const X_CLIENT_OS = "x-client-OS";
  const X_CLIENT_CPU = "x-client-CPU";
  const X_CLIENT_CURR_TELEM = "x-client-current-telemetry";
  const X_CLIENT_LAST_TELEM = "x-client-last-telemetry";
  const X_MS_LIB_CAPABILITY = "x-ms-lib-capability";
  const X_APP_NAME = "x-app-name";
  const X_APP_VER = "x-app-ver";
  const POST_LOGOUT_URI = "post_logout_redirect_uri";
  const ID_TOKEN_HINT = "id_token_hint";
  const DEVICE_CODE = "device_code";
  const CLIENT_SECRET = "client_secret";
  const CLIENT_ASSERTION = "client_assertion";
  const CLIENT_ASSERTION_TYPE = "client_assertion_type";
  const TOKEN_TYPE = "token_type";
  const REQ_CNF = "req_cnf";
  const OBO_ASSERTION = "assertion";
  const REQUESTED_TOKEN_USE = "requested_token_use";
  const ON_BEHALF_OF = "on_behalf_of";
  const RETURN_SPA_CODE = "return_spa_code";
  const NATIVE_BROKER = "nativebroker";
  const LOGOUT_HINT = "logout_hint";
  const SID = "sid";
  const LOGIN_HINT = "login_hint";
  const DOMAIN_HINT = "domain_hint";
  const X_CLIENT_EXTRA_SKU = "x-client-xtra-sku";
  const BROKER_CLIENT_ID = "brk_client_id";
  const BROKER_REDIRECT_URI = "brk_redirect_uri";
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class RequestValidator {
    /**
     * Utility to check if the `redirectUri` in the request is a non-null value
     * @param redirectUri
     */
    static validateRedirectUri(redirectUri) {
      if (!redirectUri) {
        throw createClientConfigurationError(redirectUriEmpty);
      }
    }
    /**
     * Utility to validate prompt sent by the user in the request
     * @param prompt
     */
    static validatePrompt(prompt) {
      const promptValues = [];
      for (const value in PromptValue) {
        promptValues.push(PromptValue[value]);
      }
      if (promptValues.indexOf(prompt) < 0) {
        throw createClientConfigurationError(invalidPromptValue);
      }
    }
    static validateClaims(claims) {
      try {
        JSON.parse(claims);
      } catch (e) {
        throw createClientConfigurationError(invalidClaims);
      }
    }
    /**
     * Utility to validate code_challenge and code_challenge_method
     * @param codeChallenge
     * @param codeChallengeMethod
     */
    static validateCodeChallengeParams(codeChallenge, codeChallengeMethod) {
      if (!codeChallenge || !codeChallengeMethod) {
        throw createClientConfigurationError(pkceParamsMissing);
      } else {
        this.validateCodeChallengeMethod(codeChallengeMethod);
      }
    }
    /**
     * Utility to validate code_challenge_method
     * @param codeChallengeMethod
     */
    static validateCodeChallengeMethod(codeChallengeMethod) {
      if ([
        CodeChallengeMethodValues.PLAIN,
        CodeChallengeMethodValues.S256
      ].indexOf(codeChallengeMethod) < 0) {
        throw createClientConfigurationError(invalidCodeChallengeMethod);
      }
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function instrumentBrokerParams(parameters, correlationId, performanceClient) {
    if (!correlationId) {
      return;
    }
    const clientId = parameters.get(CLIENT_ID);
    if (clientId && parameters.has(BROKER_CLIENT_ID)) {
      performanceClient == null ? void 0 : performanceClient.addFields({
        embeddedClientId: clientId,
        embeddedRedirectUri: parameters.get(REDIRECT_URI)
      }, correlationId);
    }
  }
  class RequestParameterBuilder {
    constructor(correlationId, performanceClient) {
      this.parameters = /* @__PURE__ */ new Map();
      this.performanceClient = performanceClient;
      this.correlationId = correlationId;
    }
    /**
     * add response_type = code
     */
    addResponseTypeCode() {
      this.parameters.set(RESPONSE_TYPE, encodeURIComponent(Constants$1.CODE_RESPONSE_TYPE));
    }
    /**
     * add response_type = token id_token
     */
    addResponseTypeForTokenAndIdToken() {
      this.parameters.set(RESPONSE_TYPE, encodeURIComponent(`${Constants$1.TOKEN_RESPONSE_TYPE} ${Constants$1.ID_TOKEN_RESPONSE_TYPE}`));
    }
    /**
     * add response_mode. defaults to query.
     * @param responseMode
     */
    addResponseMode(responseMode) {
      this.parameters.set(RESPONSE_MODE, encodeURIComponent(responseMode ? responseMode : ResponseMode.QUERY));
    }
    /**
     * Add flag to indicate STS should attempt to use WAM if available
     */
    addNativeBroker() {
      this.parameters.set(NATIVE_BROKER, encodeURIComponent("1"));
    }
    /**
     * add scopes. set addOidcScopes to false to prevent default scopes in non-user scenarios
     * @param scopeSet
     * @param addOidcScopes
     */
    addScopes(scopes, addOidcScopes = true, defaultScopes = OIDC_DEFAULT_SCOPES) {
      if (addOidcScopes && !defaultScopes.includes("openid") && !scopes.includes("openid")) {
        defaultScopes.push("openid");
      }
      const requestScopes = addOidcScopes ? [...scopes || [], ...defaultScopes] : scopes || [];
      const scopeSet = new ScopeSet(requestScopes);
      this.parameters.set(SCOPE, encodeURIComponent(scopeSet.printScopes()));
    }
    /**
     * add clientId
     * @param clientId
     */
    addClientId(clientId) {
      this.parameters.set(CLIENT_ID, encodeURIComponent(clientId));
    }
    /**
     * add redirect_uri
     * @param redirectUri
     */
    addRedirectUri(redirectUri) {
      RequestValidator.validateRedirectUri(redirectUri);
      this.parameters.set(REDIRECT_URI, encodeURIComponent(redirectUri));
    }
    /**
     * add post logout redirectUri
     * @param redirectUri
     */
    addPostLogoutRedirectUri(redirectUri) {
      RequestValidator.validateRedirectUri(redirectUri);
      this.parameters.set(POST_LOGOUT_URI, encodeURIComponent(redirectUri));
    }
    /**
     * add id_token_hint to logout request
     * @param idTokenHint
     */
    addIdTokenHint(idTokenHint) {
      this.parameters.set(ID_TOKEN_HINT, encodeURIComponent(idTokenHint));
    }
    /**
     * add domain_hint
     * @param domainHint
     */
    addDomainHint(domainHint) {
      this.parameters.set(DOMAIN_HINT, encodeURIComponent(domainHint));
    }
    /**
     * add login_hint
     * @param loginHint
     */
    addLoginHint(loginHint) {
      this.parameters.set(LOGIN_HINT, encodeURIComponent(loginHint));
    }
    /**
     * Adds the CCS (Cache Credential Service) query parameter for login_hint
     * @param loginHint
     */
    addCcsUpn(loginHint) {
      this.parameters.set(HeaderNames.CCS_HEADER, encodeURIComponent(`UPN:${loginHint}`));
    }
    /**
     * Adds the CCS (Cache Credential Service) query parameter for account object
     * @param loginHint
     */
    addCcsOid(clientInfo) {
      this.parameters.set(HeaderNames.CCS_HEADER, encodeURIComponent(`Oid:${clientInfo.uid}@${clientInfo.utid}`));
    }
    /**
     * add sid
     * @param sid
     */
    addSid(sid) {
      this.parameters.set(SID, encodeURIComponent(sid));
    }
    /**
     * add claims
     * @param claims
     */
    addClaims(claims, clientCapabilities) {
      const mergedClaims = this.addClientCapabilitiesToClaims(claims, clientCapabilities);
      RequestValidator.validateClaims(mergedClaims);
      this.parameters.set(CLAIMS, encodeURIComponent(mergedClaims));
    }
    /**
     * add correlationId
     * @param correlationId
     */
    addCorrelationId(correlationId) {
      this.parameters.set(CLIENT_REQUEST_ID, encodeURIComponent(correlationId));
    }
    /**
     * add library info query params
     * @param libraryInfo
     */
    addLibraryInfo(libraryInfo) {
      this.parameters.set(X_CLIENT_SKU, libraryInfo.sku);
      this.parameters.set(X_CLIENT_VER, libraryInfo.version);
      if (libraryInfo.os) {
        this.parameters.set(X_CLIENT_OS, libraryInfo.os);
      }
      if (libraryInfo.cpu) {
        this.parameters.set(X_CLIENT_CPU, libraryInfo.cpu);
      }
    }
    /**
     * Add client telemetry parameters
     * @param appTelemetry
     */
    addApplicationTelemetry(appTelemetry) {
      if (appTelemetry == null ? void 0 : appTelemetry.appName) {
        this.parameters.set(X_APP_NAME, appTelemetry.appName);
      }
      if (appTelemetry == null ? void 0 : appTelemetry.appVersion) {
        this.parameters.set(X_APP_VER, appTelemetry.appVersion);
      }
    }
    /**
     * add prompt
     * @param prompt
     */
    addPrompt(prompt) {
      RequestValidator.validatePrompt(prompt);
      this.parameters.set(`${PROMPT}`, encodeURIComponent(prompt));
    }
    /**
     * add state
     * @param state
     */
    addState(state) {
      if (state) {
        this.parameters.set(STATE, encodeURIComponent(state));
      }
    }
    /**
     * add nonce
     * @param nonce
     */
    addNonce(nonce) {
      this.parameters.set(NONCE, encodeURIComponent(nonce));
    }
    /**
     * add code_challenge and code_challenge_method
     * - throw if either of them are not passed
     * @param codeChallenge
     * @param codeChallengeMethod
     */
    addCodeChallengeParams(codeChallenge, codeChallengeMethod) {
      RequestValidator.validateCodeChallengeParams(codeChallenge, codeChallengeMethod);
      if (codeChallenge && codeChallengeMethod) {
        this.parameters.set(CODE_CHALLENGE, encodeURIComponent(codeChallenge));
        this.parameters.set(CODE_CHALLENGE_METHOD, encodeURIComponent(codeChallengeMethod));
      } else {
        throw createClientConfigurationError(pkceParamsMissing);
      }
    }
    /**
     * add the `authorization_code` passed by the user to exchange for a token
     * @param code
     */
    addAuthorizationCode(code) {
      this.parameters.set(CODE, encodeURIComponent(code));
    }
    /**
     * add the `authorization_code` passed by the user to exchange for a token
     * @param code
     */
    addDeviceCode(code) {
      this.parameters.set(DEVICE_CODE, encodeURIComponent(code));
    }
    /**
     * add the `refreshToken` passed by the user
     * @param refreshToken
     */
    addRefreshToken(refreshToken) {
      this.parameters.set(REFRESH_TOKEN, encodeURIComponent(refreshToken));
    }
    /**
     * add the `code_verifier` passed by the user to exchange for a token
     * @param codeVerifier
     */
    addCodeVerifier(codeVerifier) {
      this.parameters.set(CODE_VERIFIER, encodeURIComponent(codeVerifier));
    }
    /**
     * add client_secret
     * @param clientSecret
     */
    addClientSecret(clientSecret) {
      this.parameters.set(CLIENT_SECRET, encodeURIComponent(clientSecret));
    }
    /**
     * add clientAssertion for confidential client flows
     * @param clientAssertion
     */
    addClientAssertion(clientAssertion) {
      if (clientAssertion) {
        this.parameters.set(CLIENT_ASSERTION, encodeURIComponent(clientAssertion));
      }
    }
    /**
     * add clientAssertionType for confidential client flows
     * @param clientAssertionType
     */
    addClientAssertionType(clientAssertionType) {
      if (clientAssertionType) {
        this.parameters.set(CLIENT_ASSERTION_TYPE, encodeURIComponent(clientAssertionType));
      }
    }
    /**
     * add OBO assertion for confidential client flows
     * @param clientAssertion
     */
    addOboAssertion(oboAssertion) {
      this.parameters.set(OBO_ASSERTION, encodeURIComponent(oboAssertion));
    }
    /**
     * add grant type
     * @param grantType
     */
    addRequestTokenUse(tokenUse) {
      this.parameters.set(REQUESTED_TOKEN_USE, encodeURIComponent(tokenUse));
    }
    /**
     * add grant type
     * @param grantType
     */
    addGrantType(grantType) {
      this.parameters.set(GRANT_TYPE, encodeURIComponent(grantType));
    }
    /**
     * add client info
     *
     */
    addClientInfo() {
      this.parameters.set(CLIENT_INFO, "1");
    }
    /**
     * add extraQueryParams
     * @param eQParams
     */
    addExtraQueryParameters(eQParams) {
      Object.entries(eQParams).forEach(([key, value]) => {
        if (!this.parameters.has(key) && value) {
          this.parameters.set(key, value);
        }
      });
    }
    addClientCapabilitiesToClaims(claims, clientCapabilities) {
      let mergedClaims;
      if (!claims) {
        mergedClaims = {};
      } else {
        try {
          mergedClaims = JSON.parse(claims);
        } catch (e) {
          throw createClientConfigurationError(invalidClaims);
        }
      }
      if (clientCapabilities && clientCapabilities.length > 0) {
        if (!mergedClaims.hasOwnProperty(ClaimsRequestKeys.ACCESS_TOKEN)) {
          mergedClaims[ClaimsRequestKeys.ACCESS_TOKEN] = {};
        }
        mergedClaims[ClaimsRequestKeys.ACCESS_TOKEN][ClaimsRequestKeys.XMS_CC] = {
          values: clientCapabilities
        };
      }
      return JSON.stringify(mergedClaims);
    }
    /**
     * adds `username` for Password Grant flow
     * @param username
     */
    addUsername(username) {
      this.parameters.set(PasswordGrantConstants.username, encodeURIComponent(username));
    }
    /**
     * adds `password` for Password Grant flow
     * @param password
     */
    addPassword(password) {
      this.parameters.set(PasswordGrantConstants.password, encodeURIComponent(password));
    }
    /**
     * add pop_jwk to query params
     * @param cnfString
     */
    addPopToken(cnfString) {
      if (cnfString) {
        this.parameters.set(TOKEN_TYPE, AuthenticationScheme.POP);
        this.parameters.set(REQ_CNF, encodeURIComponent(cnfString));
      }
    }
    /**
     * add SSH JWK and key ID to query params
     */
    addSshJwk(sshJwkString) {
      if (sshJwkString) {
        this.parameters.set(TOKEN_TYPE, AuthenticationScheme.SSH);
        this.parameters.set(REQ_CNF, encodeURIComponent(sshJwkString));
      }
    }
    /**
     * add server telemetry fields
     * @param serverTelemetryManager
     */
    addServerTelemetry(serverTelemetryManager) {
      this.parameters.set(X_CLIENT_CURR_TELEM, serverTelemetryManager.generateCurrentRequestHeaderValue());
      this.parameters.set(X_CLIENT_LAST_TELEM, serverTelemetryManager.generateLastRequestHeaderValue());
    }
    /**
     * Adds parameter that indicates to the server that throttling is supported
     */
    addThrottling() {
      this.parameters.set(X_MS_LIB_CAPABILITY, ThrottlingConstants.X_MS_LIB_CAPABILITY_VALUE);
    }
    /**
     * Adds logout_hint parameter for "silent" logout which prevent server account picker
     */
    addLogoutHint(logoutHint) {
      this.parameters.set(LOGOUT_HINT, encodeURIComponent(logoutHint));
    }
    addBrokerParameters(params) {
      const brokerParams = {};
      brokerParams[BROKER_CLIENT_ID] = params.brokerClientId;
      brokerParams[BROKER_REDIRECT_URI] = params.brokerRedirectUri;
      this.addExtraQueryParameters(brokerParams);
    }
    /**
     * Utility to create a URL from the params map
     */
    createQueryString() {
      const queryParameterArray = new Array();
      this.parameters.forEach((value, key) => {
        queryParameterArray.push(`${key}=${value}`);
      });
      instrumentBrokerParams(this.parameters, this.correlationId, this.performanceClient);
      return queryParameterArray.join("&");
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function isOpenIdConfigResponse(response) {
    return response.hasOwnProperty("authorization_endpoint") && response.hasOwnProperty("token_endpoint") && response.hasOwnProperty("issuer") && response.hasOwnProperty("jwks_uri");
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function isCloudInstanceDiscoveryResponse(response) {
    return response.hasOwnProperty("tenant_discovery_endpoint") && response.hasOwnProperty("metadata");
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function isCloudInstanceDiscoveryErrorResponse(response) {
    return response.hasOwnProperty("error") && response.hasOwnProperty("error_description");
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const PerformanceEvents = {
    /**
     * acquireTokenByCode API (msal-browser and msal-node).
     * Used to acquire tokens by trading an authorization code against the token endpoint.
     */
    AcquireTokenByCode: "acquireTokenByCode",
    /**
     * acquireTokenByRefreshToken API (msal-browser and msal-node).
     * Used to renew an access token using a refresh token against the token endpoint.
     */
    AcquireTokenByRefreshToken: "acquireTokenByRefreshToken",
    /**
     * acquireTokenSilent API (msal-browser and msal-node).
     * Used to silently acquire a new access token (from the cache or the network).
     */
    AcquireTokenSilent: "acquireTokenSilent",
    /**
     * acquireTokenSilentAsync (msal-browser).
     * Internal API for acquireTokenSilent.
     */
    AcquireTokenSilentAsync: "acquireTokenSilentAsync",
    /**
     * acquireTokenPopup (msal-browser).
     * Used to acquire a new access token interactively through pop ups
     */
    AcquireTokenPopup: "acquireTokenPopup",
    /**
     * acquireTokenPreRedirect (msal-browser).
     * First part of the redirect flow.
     * Used to acquire a new access token interactively through redirects.
     */
    AcquireTokenPreRedirect: "acquireTokenPreRedirect",
    /**
     * acquireTokenRedirect (msal-browser).
     * Second part of the redirect flow.
     * Used to acquire a new access token interactively through redirects.
     */
    AcquireTokenRedirect: "acquireTokenRedirect",
    /**
     * getPublicKeyThumbprint API in CryptoOpts class (msal-browser).
     * Used to generate a public/private keypair and generate a public key thumbprint for pop requests.
     */
    CryptoOptsGetPublicKeyThumbprint: "cryptoOptsGetPublicKeyThumbprint",
    /**
     * signJwt API in CryptoOpts class (msal-browser).
     * Used to signed a pop token.
     */
    CryptoOptsSignJwt: "cryptoOptsSignJwt",
    /**
     * acquireToken API in the SilentCacheClient class (msal-browser).
     * Used to read access tokens from the cache.
     */
    SilentCacheClientAcquireToken: "silentCacheClientAcquireToken",
    /**
     * acquireToken API in the SilentIframeClient class (msal-browser).
     * Used to acquire a new set of tokens from the authorize endpoint in a hidden iframe.
     */
    SilentIframeClientAcquireToken: "silentIframeClientAcquireToken",
    AwaitConcurrentIframe: "awaitConcurrentIframe",
    /**
     * acquireToken API in SilentRereshClient (msal-browser).
     * Used to acquire a new set of tokens from the token endpoint using a refresh token.
     */
    SilentRefreshClientAcquireToken: "silentRefreshClientAcquireToken",
    /**
     * ssoSilent API (msal-browser).
     * Used to silently acquire an authorization code and set of tokens using a hidden iframe.
     */
    SsoSilent: "ssoSilent",
    /**
     * getDiscoveredAuthority API in StandardInteractionClient class (msal-browser).
     * Used to load authority metadata for a request.
     */
    StandardInteractionClientGetDiscoveredAuthority: "standardInteractionClientGetDiscoveredAuthority",
    /**
     * acquireToken APIs in msal-browser.
     * Used to make an /authorize endpoint call with native brokering enabled.
     */
    FetchAccountIdWithNativeBroker: "fetchAccountIdWithNativeBroker",
    /**
     * acquireToken API in NativeInteractionClient class (msal-browser).
     * Used to acquire a token from Native component when native brokering is enabled.
     */
    NativeInteractionClientAcquireToken: "nativeInteractionClientAcquireToken",
    /**
     * Time spent creating default headers for requests to token endpoint
     */
    BaseClientCreateTokenRequestHeaders: "baseClientCreateTokenRequestHeaders",
    /**
     * Time spent sending/waiting for the response of a request to the token endpoint
     */
    NetworkClientSendPostRequestAsync: "networkClientSendPostRequestAsync",
    RefreshTokenClientExecutePostToTokenEndpoint: "refreshTokenClientExecutePostToTokenEndpoint",
    AuthorizationCodeClientExecutePostToTokenEndpoint: "authorizationCodeClientExecutePostToTokenEndpoint",
    /**
     * Used to measure the time taken for completing embedded-broker handshake (PW-Broker).
     */
    BrokerHandhshake: "brokerHandshake",
    /**
     * acquireTokenByRefreshToken API in BrokerClientApplication (PW-Broker) .
     */
    AcquireTokenByRefreshTokenInBroker: "acquireTokenByRefreshTokenInBroker",
    /**
     * Time taken for token acquisition by broker
     */
    AcquireTokenByBroker: "acquireTokenByBroker",
    /**
     * Time spent on the network for refresh token acquisition
     */
    RefreshTokenClientExecuteTokenRequest: "refreshTokenClientExecuteTokenRequest",
    /**
     * Time taken for acquiring refresh token , records RT size
     */
    RefreshTokenClientAcquireToken: "refreshTokenClientAcquireToken",
    /**
     * Time taken for acquiring cached refresh token
     */
    RefreshTokenClientAcquireTokenWithCachedRefreshToken: "refreshTokenClientAcquireTokenWithCachedRefreshToken",
    /**
     * acquireTokenByRefreshToken API in RefreshTokenClient (msal-common).
     */
    RefreshTokenClientAcquireTokenByRefreshToken: "refreshTokenClientAcquireTokenByRefreshToken",
    /**
     * Helper function to create token request body in RefreshTokenClient (msal-common).
     */
    RefreshTokenClientCreateTokenRequestBody: "refreshTokenClientCreateTokenRequestBody",
    /**
     * acquireTokenFromCache (msal-browser).
     * Internal API for acquiring token from cache
     */
    AcquireTokenFromCache: "acquireTokenFromCache",
    SilentFlowClientAcquireCachedToken: "silentFlowClientAcquireCachedToken",
    SilentFlowClientGenerateResultFromCacheRecord: "silentFlowClientGenerateResultFromCacheRecord",
    /**
     * acquireTokenBySilentIframe (msal-browser).
     * Internal API for acquiring token by silent Iframe
     */
    AcquireTokenBySilentIframe: "acquireTokenBySilentIframe",
    /**
     * Internal API for initializing base request in BaseInteractionClient (msal-browser)
     */
    InitializeBaseRequest: "initializeBaseRequest",
    /**
     * Internal API for initializing silent request in SilentCacheClient (msal-browser)
     */
    InitializeSilentRequest: "initializeSilentRequest",
    InitializeClientApplication: "initializeClientApplication",
    /**
     * Helper function in SilentIframeClient class (msal-browser).
     */
    SilentIframeClientTokenHelper: "silentIframeClientTokenHelper",
    /**
     * SilentHandler
     */
    SilentHandlerInitiateAuthRequest: "silentHandlerInitiateAuthRequest",
    SilentHandlerMonitorIframeForHash: "silentHandlerMonitorIframeForHash",
    SilentHandlerLoadFrame: "silentHandlerLoadFrame",
    SilentHandlerLoadFrameSync: "silentHandlerLoadFrameSync",
    /**
     * Helper functions in StandardInteractionClient class (msal-browser)
     */
    StandardInteractionClientCreateAuthCodeClient: "standardInteractionClientCreateAuthCodeClient",
    StandardInteractionClientGetClientConfiguration: "standardInteractionClientGetClientConfiguration",
    StandardInteractionClientInitializeAuthorizationRequest: "standardInteractionClientInitializeAuthorizationRequest",
    StandardInteractionClientInitializeAuthorizationCodeRequest: "standardInteractionClientInitializeAuthorizationCodeRequest",
    /**
     * getAuthCodeUrl API (msal-browser and msal-node).
     */
    GetAuthCodeUrl: "getAuthCodeUrl",
    /**
     * Functions from InteractionHandler (msal-browser)
     */
    HandleCodeResponseFromServer: "handleCodeResponseFromServer",
    HandleCodeResponse: "handleCodeResponse",
    UpdateTokenEndpointAuthority: "updateTokenEndpointAuthority",
    /**
     * APIs in Authorization Code Client (msal-common)
     */
    AuthClientAcquireToken: "authClientAcquireToken",
    AuthClientExecuteTokenRequest: "authClientExecuteTokenRequest",
    AuthClientCreateTokenRequestBody: "authClientCreateTokenRequestBody",
    AuthClientCreateQueryString: "authClientCreateQueryString",
    /**
     * Generate functions in PopTokenGenerator (msal-common)
     */
    PopTokenGenerateCnf: "popTokenGenerateCnf",
    PopTokenGenerateKid: "popTokenGenerateKid",
    /**
     * handleServerTokenResponse API in ResponseHandler (msal-common)
     */
    HandleServerTokenResponse: "handleServerTokenResponse",
    DeserializeResponse: "deserializeResponse",
    /**
     * Authority functions
     */
    AuthorityFactoryCreateDiscoveredInstance: "authorityFactoryCreateDiscoveredInstance",
    AuthorityResolveEndpointsAsync: "authorityResolveEndpointsAsync",
    AuthorityResolveEndpointsFromLocalSources: "authorityResolveEndpointsFromLocalSources",
    AuthorityGetCloudDiscoveryMetadataFromNetwork: "authorityGetCloudDiscoveryMetadataFromNetwork",
    AuthorityUpdateCloudDiscoveryMetadata: "authorityUpdateCloudDiscoveryMetadata",
    AuthorityGetEndpointMetadataFromNetwork: "authorityGetEndpointMetadataFromNetwork",
    AuthorityUpdateEndpointMetadata: "authorityUpdateEndpointMetadata",
    AuthorityUpdateMetadataWithRegionalInformation: "authorityUpdateMetadataWithRegionalInformation",
    /**
     * Region Discovery functions
     */
    RegionDiscoveryDetectRegion: "regionDiscoveryDetectRegion",
    RegionDiscoveryGetRegionFromIMDS: "regionDiscoveryGetRegionFromIMDS",
    RegionDiscoveryGetCurrentVersion: "regionDiscoveryGetCurrentVersion",
    AcquireTokenByCodeAsync: "acquireTokenByCodeAsync",
    GetEndpointMetadataFromNetwork: "getEndpointMetadataFromNetwork",
    GetCloudDiscoveryMetadataFromNetworkMeasurement: "getCloudDiscoveryMetadataFromNetworkMeasurement",
    HandleRedirectPromiseMeasurement: "handleRedirectPromise",
    HandleNativeRedirectPromiseMeasurement: "handleNativeRedirectPromise",
    UpdateCloudDiscoveryMetadataMeasurement: "updateCloudDiscoveryMetadataMeasurement",
    UsernamePasswordClientAcquireToken: "usernamePasswordClientAcquireToken",
    NativeMessageHandlerHandshake: "nativeMessageHandlerHandshake",
    NativeGenerateAuthResult: "nativeGenerateAuthResult",
    RemoveHiddenIframe: "removeHiddenIframe",
    /**
     * Cache operations
     */
    ClearTokensAndKeysWithClaims: "clearTokensAndKeysWithClaims",
    CacheManagerGetRefreshToken: "cacheManagerGetRefreshToken",
    /**
     * Crypto Operations
     */
    GeneratePkceCodes: "generatePkceCodes",
    GenerateCodeVerifier: "generateCodeVerifier",
    GenerateCodeChallengeFromVerifier: "generateCodeChallengeFromVerifier",
    Sha256Digest: "sha256Digest",
    GetRandomValues: "getRandomValues"
  };
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const invoke = (callback, eventName, logger, telemetryClient, correlationId) => {
    return (...args) => {
      logger.trace(`Executing function ${eventName}`);
      const inProgressEvent = telemetryClient == null ? void 0 : telemetryClient.startMeasurement(eventName, correlationId);
      if (correlationId) {
        const eventCount = eventName + "CallCount";
        telemetryClient == null ? void 0 : telemetryClient.incrementFields({ [eventCount]: 1 }, correlationId);
      }
      try {
        const result = callback(...args);
        inProgressEvent == null ? void 0 : inProgressEvent.end({
          success: true
        });
        logger.trace(`Returning result from ${eventName}`);
        return result;
      } catch (e) {
        logger.trace(`Error occurred in ${eventName}`);
        try {
          logger.trace(JSON.stringify(e));
        } catch (e2) {
          logger.trace("Unable to print error message.");
        }
        inProgressEvent == null ? void 0 : inProgressEvent.end({
          success: false
        }, e);
        throw e;
      }
    };
  };
  const invokeAsync = (callback, eventName, logger, telemetryClient, correlationId) => {
    return (...args) => {
      logger.trace(`Executing function ${eventName}`);
      const inProgressEvent = telemetryClient == null ? void 0 : telemetryClient.startMeasurement(eventName, correlationId);
      if (correlationId) {
        const eventCount = eventName + "CallCount";
        telemetryClient == null ? void 0 : telemetryClient.incrementFields({ [eventCount]: 1 }, correlationId);
      }
      telemetryClient == null ? void 0 : telemetryClient.setPreQueueTime(eventName, correlationId);
      return callback(...args).then((response) => {
        logger.trace(`Returning result from ${eventName}`);
        inProgressEvent == null ? void 0 : inProgressEvent.end({
          success: true
        });
        return response;
      }).catch((e) => {
        logger.trace(`Error occurred in ${eventName}`);
        try {
          logger.trace(JSON.stringify(e));
        } catch (e2) {
          logger.trace("Unable to print error message.");
        }
        inProgressEvent == null ? void 0 : inProgressEvent.end({
          success: false
        }, e);
        throw e;
      });
    };
  };
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class RegionDiscovery {
    constructor(networkInterface, logger, performanceClient, correlationId) {
      this.networkInterface = networkInterface;
      this.logger = logger;
      this.performanceClient = performanceClient;
      this.correlationId = correlationId;
    }
    /**
     * Detect the region from the application's environment.
     *
     * @returns Promise<string | null>
     */
    async detectRegion(environmentRegion, regionDiscoveryMetadata) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.RegionDiscoveryDetectRegion, this.correlationId);
      let autodetectedRegionName = environmentRegion;
      if (!autodetectedRegionName) {
        const options = RegionDiscovery.IMDS_OPTIONS;
        try {
          const localIMDSVersionResponse = await invokeAsync(this.getRegionFromIMDS.bind(this), PerformanceEvents.RegionDiscoveryGetRegionFromIMDS, this.logger, this.performanceClient, this.correlationId)(Constants$1.IMDS_VERSION, options);
          if (localIMDSVersionResponse.status === ResponseCodes.httpSuccess) {
            autodetectedRegionName = localIMDSVersionResponse.body;
            regionDiscoveryMetadata.region_source = RegionDiscoverySources.IMDS;
          }
          if (localIMDSVersionResponse.status === ResponseCodes.httpBadRequest) {
            const currentIMDSVersion = await invokeAsync(this.getCurrentVersion.bind(this), PerformanceEvents.RegionDiscoveryGetCurrentVersion, this.logger, this.performanceClient, this.correlationId)(options);
            if (!currentIMDSVersion) {
              regionDiscoveryMetadata.region_source = RegionDiscoverySources.FAILED_AUTO_DETECTION;
              return null;
            }
            const currentIMDSVersionResponse = await invokeAsync(this.getRegionFromIMDS.bind(this), PerformanceEvents.RegionDiscoveryGetRegionFromIMDS, this.logger, this.performanceClient, this.correlationId)(currentIMDSVersion, options);
            if (currentIMDSVersionResponse.status === ResponseCodes.httpSuccess) {
              autodetectedRegionName = currentIMDSVersionResponse.body;
              regionDiscoveryMetadata.region_source = RegionDiscoverySources.IMDS;
            }
          }
        } catch (e) {
          regionDiscoveryMetadata.region_source = RegionDiscoverySources.FAILED_AUTO_DETECTION;
          return null;
        }
      } else {
        regionDiscoveryMetadata.region_source = RegionDiscoverySources.ENVIRONMENT_VARIABLE;
      }
      if (!autodetectedRegionName) {
        regionDiscoveryMetadata.region_source = RegionDiscoverySources.FAILED_AUTO_DETECTION;
      }
      return autodetectedRegionName || null;
    }
    /**
     * Make the call to the IMDS endpoint
     *
     * @param imdsEndpointUrl
     * @returns Promise<NetworkResponse<string>>
     */
    async getRegionFromIMDS(version22, options) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.RegionDiscoveryGetRegionFromIMDS, this.correlationId);
      return this.networkInterface.sendGetRequestAsync(`${Constants$1.IMDS_ENDPOINT}?api-version=${version22}&format=text`, options, Constants$1.IMDS_TIMEOUT);
    }
    /**
     * Get the most recent version of the IMDS endpoint available
     *
     * @returns Promise<string | null>
     */
    async getCurrentVersion(options) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.RegionDiscoveryGetCurrentVersion, this.correlationId);
      try {
        const response = await this.networkInterface.sendGetRequestAsync(`${Constants$1.IMDS_ENDPOINT}?format=json`, options);
        if (response.status === ResponseCodes.httpBadRequest && response.body && response.body["newest-versions"] && response.body["newest-versions"].length > 0) {
          return response.body["newest-versions"][0];
        }
        return null;
      } catch (e) {
        return null;
      }
    }
  }
  RegionDiscovery.IMDS_OPTIONS = {
    headers: {
      Metadata: "true"
    }
  };
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class Authority {
    constructor(authority, networkInterface, cacheManager, authorityOptions, logger, correlationId, performanceClient, managedIdentity) {
      this.canonicalAuthority = authority;
      this._canonicalAuthority.validateAsUri();
      this.networkInterface = networkInterface;
      this.cacheManager = cacheManager;
      this.authorityOptions = authorityOptions;
      this.regionDiscoveryMetadata = {
        region_used: void 0,
        region_source: void 0,
        region_outcome: void 0
      };
      this.logger = logger;
      this.performanceClient = performanceClient;
      this.correlationId = correlationId;
      this.managedIdentity = managedIdentity || false;
      this.regionDiscovery = new RegionDiscovery(networkInterface, this.logger, this.performanceClient, this.correlationId);
    }
    /**
     * Get {@link AuthorityType}
     * @param authorityUri {@link IUri}
     * @private
     */
    getAuthorityType(authorityUri) {
      if (authorityUri.HostNameAndPort.endsWith(Constants$1.CIAM_AUTH_URL)) {
        return AuthorityType.Ciam;
      }
      const pathSegments = authorityUri.PathSegments;
      if (pathSegments.length) {
        switch (pathSegments[0].toLowerCase()) {
          case Constants$1.ADFS:
            return AuthorityType.Adfs;
          case Constants$1.DSTS:
            return AuthorityType.Dsts;
        }
      }
      return AuthorityType.Default;
    }
    // See above for AuthorityType
    get authorityType() {
      return this.getAuthorityType(this.canonicalAuthorityUrlComponents);
    }
    /**
     * ProtocolMode enum representing the way endpoints are constructed.
     */
    get protocolMode() {
      return this.authorityOptions.protocolMode;
    }
    /**
     * Returns authorityOptions which can be used to reinstantiate a new authority instance
     */
    get options() {
      return this.authorityOptions;
    }
    /**
     * A URL that is the authority set by the developer
     */
    get canonicalAuthority() {
      return this._canonicalAuthority.urlString;
    }
    /**
     * Sets canonical authority.
     */
    set canonicalAuthority(url) {
      this._canonicalAuthority = new UrlString(url);
      this._canonicalAuthority.validateAsUri();
      this._canonicalAuthorityUrlComponents = null;
    }
    /**
     * Get authority components.
     */
    get canonicalAuthorityUrlComponents() {
      if (!this._canonicalAuthorityUrlComponents) {
        this._canonicalAuthorityUrlComponents = this._canonicalAuthority.getUrlComponents();
      }
      return this._canonicalAuthorityUrlComponents;
    }
    /**
     * Get hostname and port i.e. login.microsoftonline.com
     */
    get hostnameAndPort() {
      return this.canonicalAuthorityUrlComponents.HostNameAndPort.toLowerCase();
    }
    /**
     * Get tenant for authority.
     */
    get tenant() {
      return this.canonicalAuthorityUrlComponents.PathSegments[0];
    }
    /**
     * OAuth /authorize endpoint for requests
     */
    get authorizationEndpoint() {
      if (this.discoveryComplete()) {
        return this.replacePath(this.metadata.authorization_endpoint);
      } else {
        throw createClientAuthError(endpointResolutionError);
      }
    }
    /**
     * OAuth /token endpoint for requests
     */
    get tokenEndpoint() {
      if (this.discoveryComplete()) {
        return this.replacePath(this.metadata.token_endpoint);
      } else {
        throw createClientAuthError(endpointResolutionError);
      }
    }
    get deviceCodeEndpoint() {
      if (this.discoveryComplete()) {
        return this.replacePath(this.metadata.token_endpoint.replace("/token", "/devicecode"));
      } else {
        throw createClientAuthError(endpointResolutionError);
      }
    }
    /**
     * OAuth logout endpoint for requests
     */
    get endSessionEndpoint() {
      if (this.discoveryComplete()) {
        if (!this.metadata.end_session_endpoint) {
          throw createClientAuthError(endSessionEndpointNotSupported);
        }
        return this.replacePath(this.metadata.end_session_endpoint);
      } else {
        throw createClientAuthError(endpointResolutionError);
      }
    }
    /**
     * OAuth issuer for requests
     */
    get selfSignedJwtAudience() {
      if (this.discoveryComplete()) {
        return this.replacePath(this.metadata.issuer);
      } else {
        throw createClientAuthError(endpointResolutionError);
      }
    }
    /**
     * Jwks_uri for token signing keys
     */
    get jwksUri() {
      if (this.discoveryComplete()) {
        return this.replacePath(this.metadata.jwks_uri);
      } else {
        throw createClientAuthError(endpointResolutionError);
      }
    }
    /**
     * Returns a flag indicating that tenant name can be replaced in authority {@link IUri}
     * @param authorityUri {@link IUri}
     * @private
     */
    canReplaceTenant(authorityUri) {
      return authorityUri.PathSegments.length === 1 && !Authority.reservedTenantDomains.has(authorityUri.PathSegments[0]) && this.getAuthorityType(authorityUri) === AuthorityType.Default && this.protocolMode === ProtocolMode.AAD;
    }
    /**
     * Replaces tenant in url path with current tenant. Defaults to common.
     * @param urlString
     */
    replaceTenant(urlString) {
      return urlString.replace(/{tenant}|{tenantid}/g, this.tenant);
    }
    /**
     * Replaces path such as tenant or policy with the current tenant or policy.
     * @param urlString
     */
    replacePath(urlString) {
      let endpoint = urlString;
      const cachedAuthorityUrl = new UrlString(this.metadata.canonical_authority);
      const cachedAuthorityUrlComponents = cachedAuthorityUrl.getUrlComponents();
      const cachedAuthorityParts = cachedAuthorityUrlComponents.PathSegments;
      const currentAuthorityParts = this.canonicalAuthorityUrlComponents.PathSegments;
      currentAuthorityParts.forEach((currentPart, index) => {
        let cachedPart = cachedAuthorityParts[index];
        if (index === 0 && this.canReplaceTenant(cachedAuthorityUrlComponents)) {
          const tenantId = new UrlString(this.metadata.authorization_endpoint).getUrlComponents().PathSegments[0];
          if (cachedPart !== tenantId) {
            this.logger.verbose(`Replacing tenant domain name ${cachedPart} with id ${tenantId}`);
            cachedPart = tenantId;
          }
        }
        if (currentPart !== cachedPart) {
          endpoint = endpoint.replace(`/${cachedPart}/`, `/${currentPart}/`);
        }
      });
      return this.replaceTenant(endpoint);
    }
    /**
     * The default open id configuration endpoint for any canonical authority.
     */
    get defaultOpenIdConfigurationEndpoint() {
      const canonicalAuthorityHost = this.hostnameAndPort;
      if (this.canonicalAuthority.endsWith("v2.0/") || this.authorityType === AuthorityType.Adfs || this.protocolMode !== ProtocolMode.AAD && !this.isAliasOfKnownMicrosoftAuthority(canonicalAuthorityHost)) {
        return `${this.canonicalAuthority}.well-known/openid-configuration`;
      }
      return `${this.canonicalAuthority}v2.0/.well-known/openid-configuration`;
    }
    /**
     * Boolean that returns whether or not tenant discovery has been completed.
     */
    discoveryComplete() {
      return !!this.metadata;
    }
    /**
     * Perform endpoint discovery to discover aliases, preferred_cache, preferred_network
     * and the /authorize, /token and logout endpoints.
     */
    async resolveEndpointsAsync() {
      var _a, _b;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthorityResolveEndpointsAsync, this.correlationId);
      const metadataEntity = this.getCurrentMetadataEntity();
      const cloudDiscoverySource = await invokeAsync(this.updateCloudDiscoveryMetadata.bind(this), PerformanceEvents.AuthorityUpdateCloudDiscoveryMetadata, this.logger, this.performanceClient, this.correlationId)(metadataEntity);
      this.canonicalAuthority = this.canonicalAuthority.replace(this.hostnameAndPort, metadataEntity.preferred_network);
      const endpointSource = await invokeAsync(this.updateEndpointMetadata.bind(this), PerformanceEvents.AuthorityUpdateEndpointMetadata, this.logger, this.performanceClient, this.correlationId)(metadataEntity);
      this.updateCachedMetadata(metadataEntity, cloudDiscoverySource, {
        source: endpointSource
      });
      (_b = this.performanceClient) == null ? void 0 : _b.addFields({
        cloudDiscoverySource,
        authorityEndpointSource: endpointSource
      }, this.correlationId);
    }
    /**
     * Returns metadata entity from cache if it exists, otherwiser returns a new metadata entity built
     * from the configured canonical authority
     * @returns
     */
    getCurrentMetadataEntity() {
      let metadataEntity = this.cacheManager.getAuthorityMetadataByAlias(this.hostnameAndPort);
      if (!metadataEntity) {
        metadataEntity = {
          aliases: [],
          preferred_cache: this.hostnameAndPort,
          preferred_network: this.hostnameAndPort,
          canonical_authority: this.canonicalAuthority,
          authorization_endpoint: "",
          token_endpoint: "",
          end_session_endpoint: "",
          issuer: "",
          aliasesFromNetwork: false,
          endpointsFromNetwork: false,
          expiresAt: generateAuthorityMetadataExpiresAt(),
          jwks_uri: ""
        };
      }
      return metadataEntity;
    }
    /**
     * Updates cached metadata based on metadata source and sets the instance's metadata
     * property to the same value
     * @param metadataEntity
     * @param cloudDiscoverySource
     * @param endpointMetadataResult
     */
    updateCachedMetadata(metadataEntity, cloudDiscoverySource, endpointMetadataResult) {
      if (cloudDiscoverySource !== AuthorityMetadataSource.CACHE && (endpointMetadataResult == null ? void 0 : endpointMetadataResult.source) !== AuthorityMetadataSource.CACHE) {
        metadataEntity.expiresAt = generateAuthorityMetadataExpiresAt();
        metadataEntity.canonical_authority = this.canonicalAuthority;
      }
      const cacheKey = this.cacheManager.generateAuthorityMetadataCacheKey(metadataEntity.preferred_cache);
      this.cacheManager.setAuthorityMetadata(cacheKey, metadataEntity);
      this.metadata = metadataEntity;
    }
    /**
     * Update AuthorityMetadataEntity with new endpoints and return where the information came from
     * @param metadataEntity
     */
    async updateEndpointMetadata(metadataEntity) {
      var _a, _b, _c;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthorityUpdateEndpointMetadata, this.correlationId);
      const localMetadata = this.updateEndpointMetadataFromLocalSources(metadataEntity);
      if (localMetadata) {
        if (localMetadata.source === AuthorityMetadataSource.HARDCODED_VALUES) {
          if ((_b = this.authorityOptions.azureRegionConfiguration) == null ? void 0 : _b.azureRegion) {
            if (localMetadata.metadata) {
              const hardcodedMetadata = await invokeAsync(this.updateMetadataWithRegionalInformation.bind(this), PerformanceEvents.AuthorityUpdateMetadataWithRegionalInformation, this.logger, this.performanceClient, this.correlationId)(localMetadata.metadata);
              updateAuthorityEndpointMetadata(metadataEntity, hardcodedMetadata, false);
              metadataEntity.canonical_authority = this.canonicalAuthority;
            }
          }
        }
        return localMetadata.source;
      }
      let metadata = await invokeAsync(this.getEndpointMetadataFromNetwork.bind(this), PerformanceEvents.AuthorityGetEndpointMetadataFromNetwork, this.logger, this.performanceClient, this.correlationId)();
      if (metadata) {
        if ((_c = this.authorityOptions.azureRegionConfiguration) == null ? void 0 : _c.azureRegion) {
          metadata = await invokeAsync(this.updateMetadataWithRegionalInformation.bind(this), PerformanceEvents.AuthorityUpdateMetadataWithRegionalInformation, this.logger, this.performanceClient, this.correlationId)(metadata);
        }
        updateAuthorityEndpointMetadata(metadataEntity, metadata, true);
        return AuthorityMetadataSource.NETWORK;
      } else {
        throw createClientAuthError(openIdConfigError, this.defaultOpenIdConfigurationEndpoint);
      }
    }
    /**
     * Updates endpoint metadata from local sources and returns where the information was retrieved from and the metadata config
     * response if the source is hardcoded metadata
     * @param metadataEntity
     * @returns
     */
    updateEndpointMetadataFromLocalSources(metadataEntity) {
      this.logger.verbose("Attempting to get endpoint metadata from authority configuration");
      const configMetadata = this.getEndpointMetadataFromConfig();
      if (configMetadata) {
        this.logger.verbose("Found endpoint metadata in authority configuration");
        updateAuthorityEndpointMetadata(metadataEntity, configMetadata, false);
        return {
          source: AuthorityMetadataSource.CONFIG
        };
      }
      this.logger.verbose("Did not find endpoint metadata in the config... Attempting to get endpoint metadata from the hardcoded values.");
      if (this.authorityOptions.skipAuthorityMetadataCache) {
        this.logger.verbose("Skipping hardcoded metadata cache since skipAuthorityMetadataCache is set to true. Attempting to get endpoint metadata from the network metadata cache.");
      } else {
        const hardcodedMetadata = this.getEndpointMetadataFromHardcodedValues();
        if (hardcodedMetadata) {
          updateAuthorityEndpointMetadata(metadataEntity, hardcodedMetadata, false);
          return {
            source: AuthorityMetadataSource.HARDCODED_VALUES,
            metadata: hardcodedMetadata
          };
        } else {
          this.logger.verbose("Did not find endpoint metadata in hardcoded values... Attempting to get endpoint metadata from the network metadata cache.");
        }
      }
      const metadataEntityExpired = isAuthorityMetadataExpired(metadataEntity);
      if (this.isAuthoritySameType(metadataEntity) && metadataEntity.endpointsFromNetwork && !metadataEntityExpired) {
        this.logger.verbose("Found endpoint metadata in the cache.");
        return { source: AuthorityMetadataSource.CACHE };
      } else if (metadataEntityExpired) {
        this.logger.verbose("The metadata entity is expired.");
      }
      return null;
    }
    /**
     * Compares the number of url components after the domain to determine if the cached
     * authority metadata can be used for the requested authority. Protects against same domain different
     * authority such as login.microsoftonline.com/tenant and login.microsoftonline.com/tfp/tenant/policy
     * @param metadataEntity
     */
    isAuthoritySameType(metadataEntity) {
      const cachedAuthorityUrl = new UrlString(metadataEntity.canonical_authority);
      const cachedParts = cachedAuthorityUrl.getUrlComponents().PathSegments;
      return cachedParts.length === this.canonicalAuthorityUrlComponents.PathSegments.length;
    }
    /**
     * Parse authorityMetadata config option
     */
    getEndpointMetadataFromConfig() {
      if (this.authorityOptions.authorityMetadata) {
        try {
          return JSON.parse(this.authorityOptions.authorityMetadata);
        } catch (e) {
          throw createClientConfigurationError(invalidAuthorityMetadata);
        }
      }
      return null;
    }
    /**
     * Gets OAuth endpoints from the given OpenID configuration endpoint.
     *
     * @param hasHardcodedMetadata boolean
     */
    async getEndpointMetadataFromNetwork() {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthorityGetEndpointMetadataFromNetwork, this.correlationId);
      const options = {};
      const openIdConfigurationEndpoint = this.defaultOpenIdConfigurationEndpoint;
      this.logger.verbose(`Authority.getEndpointMetadataFromNetwork: attempting to retrieve OAuth endpoints from ${openIdConfigurationEndpoint}`);
      try {
        const response = await this.networkInterface.sendGetRequestAsync(openIdConfigurationEndpoint, options);
        const isValidResponse = isOpenIdConfigResponse(response.body);
        if (isValidResponse) {
          return response.body;
        } else {
          this.logger.verbose(`Authority.getEndpointMetadataFromNetwork: could not parse response as OpenID configuration`);
          return null;
        }
      } catch (e) {
        this.logger.verbose(`Authority.getEndpointMetadataFromNetwork: ${e}`);
        return null;
      }
    }
    /**
     * Get OAuth endpoints for common authorities.
     */
    getEndpointMetadataFromHardcodedValues() {
      if (this.hostnameAndPort in EndpointMetadata) {
        return EndpointMetadata[this.hostnameAndPort];
      }
      return null;
    }
    /**
     * Update the retrieved metadata with regional information.
     * User selected Azure region will be used if configured.
     */
    async updateMetadataWithRegionalInformation(metadata) {
      var _a, _b, _c;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthorityUpdateMetadataWithRegionalInformation, this.correlationId);
      const userConfiguredAzureRegion = (_b = this.authorityOptions.azureRegionConfiguration) == null ? void 0 : _b.azureRegion;
      if (userConfiguredAzureRegion) {
        if (userConfiguredAzureRegion !== Constants$1.AZURE_REGION_AUTO_DISCOVER_FLAG) {
          this.regionDiscoveryMetadata.region_outcome = RegionDiscoveryOutcomes.CONFIGURED_NO_AUTO_DETECTION;
          this.regionDiscoveryMetadata.region_used = userConfiguredAzureRegion;
          return Authority.replaceWithRegionalInformation(metadata, userConfiguredAzureRegion);
        }
        const autodetectedRegionName = await invokeAsync(this.regionDiscovery.detectRegion.bind(this.regionDiscovery), PerformanceEvents.RegionDiscoveryDetectRegion, this.logger, this.performanceClient, this.correlationId)((_c = this.authorityOptions.azureRegionConfiguration) == null ? void 0 : _c.environmentRegion, this.regionDiscoveryMetadata);
        if (autodetectedRegionName) {
          this.regionDiscoveryMetadata.region_outcome = RegionDiscoveryOutcomes.AUTO_DETECTION_REQUESTED_SUCCESSFUL;
          this.regionDiscoveryMetadata.region_used = autodetectedRegionName;
          return Authority.replaceWithRegionalInformation(metadata, autodetectedRegionName);
        }
        this.regionDiscoveryMetadata.region_outcome = RegionDiscoveryOutcomes.AUTO_DETECTION_REQUESTED_FAILED;
      }
      return metadata;
    }
    /**
     * Updates the AuthorityMetadataEntity with new aliases, preferred_network and preferred_cache
     * and returns where the information was retrieved from
     * @param metadataEntity
     * @returns AuthorityMetadataSource
     */
    async updateCloudDiscoveryMetadata(metadataEntity) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthorityUpdateCloudDiscoveryMetadata, this.correlationId);
      const localMetadataSource = this.updateCloudDiscoveryMetadataFromLocalSources(metadataEntity);
      if (localMetadataSource) {
        return localMetadataSource;
      }
      const metadata = await invokeAsync(this.getCloudDiscoveryMetadataFromNetwork.bind(this), PerformanceEvents.AuthorityGetCloudDiscoveryMetadataFromNetwork, this.logger, this.performanceClient, this.correlationId)();
      if (metadata) {
        updateCloudDiscoveryMetadata(metadataEntity, metadata, true);
        return AuthorityMetadataSource.NETWORK;
      }
      throw createClientConfigurationError(untrustedAuthority);
    }
    updateCloudDiscoveryMetadataFromLocalSources(metadataEntity) {
      this.logger.verbose("Attempting to get cloud discovery metadata  from authority configuration");
      this.logger.verbosePii(`Known Authorities: ${this.authorityOptions.knownAuthorities || Constants$1.NOT_APPLICABLE}`);
      this.logger.verbosePii(`Authority Metadata: ${this.authorityOptions.authorityMetadata || Constants$1.NOT_APPLICABLE}`);
      this.logger.verbosePii(`Canonical Authority: ${metadataEntity.canonical_authority || Constants$1.NOT_APPLICABLE}`);
      const metadata = this.getCloudDiscoveryMetadataFromConfig();
      if (metadata) {
        this.logger.verbose("Found cloud discovery metadata in authority configuration");
        updateCloudDiscoveryMetadata(metadataEntity, metadata, false);
        return AuthorityMetadataSource.CONFIG;
      }
      this.logger.verbose("Did not find cloud discovery metadata in the config... Attempting to get cloud discovery metadata from the hardcoded values.");
      if (this.options.skipAuthorityMetadataCache) {
        this.logger.verbose("Skipping hardcoded cloud discovery metadata cache since skipAuthorityMetadataCache is set to true. Attempting to get cloud discovery metadata from the network metadata cache.");
      } else {
        const hardcodedMetadata = getCloudDiscoveryMetadataFromHardcodedValues(this.hostnameAndPort);
        if (hardcodedMetadata) {
          this.logger.verbose("Found cloud discovery metadata from hardcoded values.");
          updateCloudDiscoveryMetadata(metadataEntity, hardcodedMetadata, false);
          return AuthorityMetadataSource.HARDCODED_VALUES;
        }
        this.logger.verbose("Did not find cloud discovery metadata in hardcoded values... Attempting to get cloud discovery metadata from the network metadata cache.");
      }
      const metadataEntityExpired = isAuthorityMetadataExpired(metadataEntity);
      if (this.isAuthoritySameType(metadataEntity) && metadataEntity.aliasesFromNetwork && !metadataEntityExpired) {
        this.logger.verbose("Found cloud discovery metadata in the cache.");
        return AuthorityMetadataSource.CACHE;
      } else if (metadataEntityExpired) {
        this.logger.verbose("The metadata entity is expired.");
      }
      return null;
    }
    /**
     * Parse cloudDiscoveryMetadata config or check knownAuthorities
     */
    getCloudDiscoveryMetadataFromConfig() {
      if (this.authorityType === AuthorityType.Ciam) {
        this.logger.verbose("CIAM authorities do not support cloud discovery metadata, generate the aliases from authority host.");
        return Authority.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort);
      }
      if (this.authorityOptions.cloudDiscoveryMetadata) {
        this.logger.verbose("The cloud discovery metadata has been provided as a network response, in the config.");
        try {
          this.logger.verbose("Attempting to parse the cloud discovery metadata.");
          const parsedResponse = JSON.parse(this.authorityOptions.cloudDiscoveryMetadata);
          const metadata = getCloudDiscoveryMetadataFromNetworkResponse(parsedResponse.metadata, this.hostnameAndPort);
          this.logger.verbose("Parsed the cloud discovery metadata.");
          if (metadata) {
            this.logger.verbose("There is returnable metadata attached to the parsed cloud discovery metadata.");
            return metadata;
          } else {
            this.logger.verbose("There is no metadata attached to the parsed cloud discovery metadata.");
          }
        } catch (e) {
          this.logger.verbose("Unable to parse the cloud discovery metadata. Throwing Invalid Cloud Discovery Metadata Error.");
          throw createClientConfigurationError(invalidCloudDiscoveryMetadata);
        }
      }
      if (this.isInKnownAuthorities()) {
        this.logger.verbose("The host is included in knownAuthorities. Creating new cloud discovery metadata from the host.");
        return Authority.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort);
      }
      return null;
    }
    /**
     * Called to get metadata from network if CloudDiscoveryMetadata was not populated by config
     *
     * @param hasHardcodedMetadata boolean
     */
    async getCloudDiscoveryMetadataFromNetwork() {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthorityGetCloudDiscoveryMetadataFromNetwork, this.correlationId);
      const instanceDiscoveryEndpoint = `${Constants$1.AAD_INSTANCE_DISCOVERY_ENDPT}${this.canonicalAuthority}oauth2/v2.0/authorize`;
      const options = {};
      let match = null;
      try {
        const response = await this.networkInterface.sendGetRequestAsync(instanceDiscoveryEndpoint, options);
        let typedResponseBody;
        let metadata;
        if (isCloudInstanceDiscoveryResponse(response.body)) {
          typedResponseBody = response.body;
          metadata = typedResponseBody.metadata;
          this.logger.verbosePii(`tenant_discovery_endpoint is: ${typedResponseBody.tenant_discovery_endpoint}`);
        } else if (isCloudInstanceDiscoveryErrorResponse(response.body)) {
          this.logger.warning(`A CloudInstanceDiscoveryErrorResponse was returned. The cloud instance discovery network request's status code is: ${response.status}`);
          typedResponseBody = response.body;
          if (typedResponseBody.error === Constants$1.INVALID_INSTANCE) {
            this.logger.error("The CloudInstanceDiscoveryErrorResponse error is invalid_instance.");
            return null;
          }
          this.logger.warning(`The CloudInstanceDiscoveryErrorResponse error is ${typedResponseBody.error}`);
          this.logger.warning(`The CloudInstanceDiscoveryErrorResponse error description is ${typedResponseBody.error_description}`);
          this.logger.warning("Setting the value of the CloudInstanceDiscoveryMetadata (returned from the network) to []");
          metadata = [];
        } else {
          this.logger.error("AAD did not return a CloudInstanceDiscoveryResponse or CloudInstanceDiscoveryErrorResponse");
          return null;
        }
        this.logger.verbose("Attempting to find a match between the developer's authority and the CloudInstanceDiscoveryMetadata returned from the network request.");
        match = getCloudDiscoveryMetadataFromNetworkResponse(metadata, this.hostnameAndPort);
      } catch (error2) {
        if (error2 instanceof AuthError) {
          this.logger.error(`There was a network error while attempting to get the cloud discovery instance metadata.
Error: ${error2.errorCode}
Error Description: ${error2.errorMessage}`);
        } else {
          const typedError = error2;
          this.logger.error(`A non-MSALJS error was thrown while attempting to get the cloud instance discovery metadata.
Error: ${typedError.name}
Error Description: ${typedError.message}`);
        }
        return null;
      }
      if (!match) {
        this.logger.warning("The developer's authority was not found within the CloudInstanceDiscoveryMetadata returned from the network request.");
        this.logger.verbose("Creating custom Authority for custom domain scenario.");
        match = Authority.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort);
      }
      return match;
    }
    /**
     * Helper function to determine if this host is included in the knownAuthorities config option
     */
    isInKnownAuthorities() {
      const matches = this.authorityOptions.knownAuthorities.filter((authority) => {
        return authority && UrlString.getDomainFromUrl(authority).toLowerCase() === this.hostnameAndPort;
      });
      return matches.length > 0;
    }
    /**
     * helper function to populate the authority based on azureCloudOptions
     * @param authorityString
     * @param azureCloudOptions
     */
    static generateAuthority(authorityString, azureCloudOptions) {
      let authorityAzureCloudInstance;
      if (azureCloudOptions && azureCloudOptions.azureCloudInstance !== AzureCloudInstance.None) {
        const tenant = azureCloudOptions.tenant ? azureCloudOptions.tenant : Constants$1.DEFAULT_COMMON_TENANT;
        authorityAzureCloudInstance = `${azureCloudOptions.azureCloudInstance}/${tenant}/`;
      }
      return authorityAzureCloudInstance ? authorityAzureCloudInstance : authorityString;
    }
    /**
     * Creates cloud discovery metadata object from a given host
     * @param host
     */
    static createCloudDiscoveryMetadataFromHost(host) {
      return {
        preferred_network: host,
        preferred_cache: host,
        aliases: [host]
      };
    }
    /**
     * helper function to generate environment from authority object
     */
    getPreferredCache() {
      if (this.managedIdentity) {
        return Constants$1.DEFAULT_AUTHORITY_HOST;
      } else if (this.discoveryComplete()) {
        return this.metadata.preferred_cache;
      } else {
        throw createClientAuthError(endpointResolutionError);
      }
    }
    /**
     * Returns whether or not the provided host is an alias of this authority instance
     * @param host
     */
    isAlias(host) {
      return this.metadata.aliases.indexOf(host) > -1;
    }
    /**
     * Returns whether or not the provided host is an alias of a known Microsoft authority for purposes of endpoint discovery
     * @param host
     */
    isAliasOfKnownMicrosoftAuthority(host) {
      return InstanceDiscoveryMetadataAliases.has(host);
    }
    /**
     * Checks whether the provided host is that of a public cloud authority
     *
     * @param authority string
     * @returns bool
     */
    static isPublicCloudAuthority(host) {
      return Constants$1.KNOWN_PUBLIC_CLOUDS.indexOf(host) >= 0;
    }
    /**
     * Rebuild the authority string with the region
     *
     * @param host string
     * @param region string
     */
    static buildRegionalAuthorityString(host, region, queryString) {
      const authorityUrlInstance = new UrlString(host);
      authorityUrlInstance.validateAsUri();
      const authorityUrlParts = authorityUrlInstance.getUrlComponents();
      let hostNameAndPort = `${region}.${authorityUrlParts.HostNameAndPort}`;
      if (this.isPublicCloudAuthority(authorityUrlParts.HostNameAndPort)) {
        hostNameAndPort = `${region}.${Constants$1.REGIONAL_AUTH_PUBLIC_CLOUD_SUFFIX}`;
      }
      const url = UrlString.constructAuthorityUriFromObject({
        ...authorityUrlInstance.getUrlComponents(),
        HostNameAndPort: hostNameAndPort
      }).urlString;
      if (queryString)
        return `${url}?${queryString}`;
      return url;
    }
    /**
     * Replace the endpoints in the metadata object with their regional equivalents.
     *
     * @param metadata OpenIdConfigResponse
     * @param azureRegion string
     */
    static replaceWithRegionalInformation(metadata, azureRegion) {
      const regionalMetadata = { ...metadata };
      regionalMetadata.authorization_endpoint = Authority.buildRegionalAuthorityString(regionalMetadata.authorization_endpoint, azureRegion);
      regionalMetadata.token_endpoint = Authority.buildRegionalAuthorityString(regionalMetadata.token_endpoint, azureRegion);
      if (regionalMetadata.end_session_endpoint) {
        regionalMetadata.end_session_endpoint = Authority.buildRegionalAuthorityString(regionalMetadata.end_session_endpoint, azureRegion);
      }
      return regionalMetadata;
    }
    /**
     * Transform CIAM_AUTHORIY as per the below rules:
     * If no path segments found and it is a CIAM authority (hostname ends with .ciamlogin.com), then transform it
     *
     * NOTE: The transformation path should go away once STS supports CIAM with the format: `tenantIdorDomain.ciamlogin.com`
     * `ciamlogin.com` can also change in the future and we should accommodate the same
     *
     * @param authority
     */
    static transformCIAMAuthority(authority) {
      let ciamAuthority = authority;
      const authorityUrl = new UrlString(authority);
      const authorityUrlComponents = authorityUrl.getUrlComponents();
      if (authorityUrlComponents.PathSegments.length === 0 && authorityUrlComponents.HostNameAndPort.endsWith(Constants$1.CIAM_AUTH_URL)) {
        const tenantIdOrDomain = authorityUrlComponents.HostNameAndPort.split(".")[0];
        ciamAuthority = `${ciamAuthority}${tenantIdOrDomain}${Constants$1.AAD_TENANT_DOMAIN_SUFFIX}`;
      }
      return ciamAuthority;
    }
  }
  Authority.reservedTenantDomains = /* @__PURE__ */ new Set([
    "{tenant}",
    "{tenantid}",
    AADAuthorityConstants.COMMON,
    AADAuthorityConstants.CONSUMERS,
    AADAuthorityConstants.ORGANIZATIONS
  ]);
  function getTenantFromAuthorityString(authority) {
    var _a;
    const authorityUrl = new UrlString(authority);
    const authorityUrlComponents = authorityUrl.getUrlComponents();
    const tenantId = (_a = authorityUrlComponents.PathSegments.slice(-1)[0]) == null ? void 0 : _a.toLowerCase();
    switch (tenantId) {
      case AADAuthorityConstants.COMMON:
      case AADAuthorityConstants.ORGANIZATIONS:
      case AADAuthorityConstants.CONSUMERS:
        return void 0;
      default:
        return tenantId;
    }
  }
  function formatAuthorityUri(authorityUri) {
    return authorityUri.endsWith(Constants$1.FORWARD_SLASH) ? authorityUri : `${authorityUri}${Constants$1.FORWARD_SLASH}`;
  }
  function buildStaticAuthorityOptions(authOptions) {
    const rawCloudDiscoveryMetadata = authOptions.cloudDiscoveryMetadata;
    let cloudDiscoveryMetadata = void 0;
    if (rawCloudDiscoveryMetadata) {
      try {
        cloudDiscoveryMetadata = JSON.parse(rawCloudDiscoveryMetadata);
      } catch (e) {
        throw createClientConfigurationError(invalidCloudDiscoveryMetadata);
      }
    }
    return {
      canonicalAuthority: authOptions.authority ? formatAuthorityUri(authOptions.authority) : void 0,
      knownAuthorities: authOptions.knownAuthorities,
      cloudDiscoveryMetadata
    };
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  async function createDiscoveredInstance(authorityUri, networkClient, cacheManager, authorityOptions, logger, correlationId, performanceClient) {
    performanceClient == null ? void 0 : performanceClient.addQueueMeasurement(PerformanceEvents.AuthorityFactoryCreateDiscoveredInstance, correlationId);
    const authorityUriFinal = Authority.transformCIAMAuthority(formatAuthorityUri(authorityUri));
    const acquireTokenAuthority = new Authority(authorityUriFinal, networkClient, cacheManager, authorityOptions, logger, correlationId, performanceClient);
    try {
      await invokeAsync(acquireTokenAuthority.resolveEndpointsAsync.bind(acquireTokenAuthority), PerformanceEvents.AuthorityResolveEndpointsAsync, logger, performanceClient, correlationId)();
      return acquireTokenAuthority;
    } catch (e) {
      throw createClientAuthError(endpointResolutionError);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class ServerError extends AuthError {
    constructor(errorCode, errorMessage, subError, errorNo, status) {
      super(errorCode, errorMessage, subError);
      this.name = "ServerError";
      this.errorNo = errorNo;
      this.status = status;
      Object.setPrototypeOf(this, ServerError.prototype);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class ThrottlingUtils {
    /**
     * Prepares a RequestThumbprint to be stored as a key.
     * @param thumbprint
     */
    static generateThrottlingStorageKey(thumbprint) {
      return `${ThrottlingConstants.THROTTLING_PREFIX}.${JSON.stringify(thumbprint)}`;
    }
    /**
     * Performs necessary throttling checks before a network request.
     * @param cacheManager
     * @param thumbprint
     */
    static preProcess(cacheManager, thumbprint, correlationId) {
      var _a;
      const key = ThrottlingUtils.generateThrottlingStorageKey(thumbprint);
      const value = cacheManager.getThrottlingCache(key);
      if (value) {
        if (value.throttleTime < Date.now()) {
          cacheManager.removeItem(key, correlationId);
          return;
        }
        throw new ServerError(((_a = value.errorCodes) == null ? void 0 : _a.join(" ")) || Constants$1.EMPTY_STRING, value.errorMessage, value.subError);
      }
    }
    /**
     * Performs necessary throttling checks after a network request.
     * @param cacheManager
     * @param thumbprint
     * @param response
     */
    static postProcess(cacheManager, thumbprint, response, correlationId) {
      if (ThrottlingUtils.checkResponseStatus(response) || ThrottlingUtils.checkResponseForRetryAfter(response)) {
        const thumbprintValue = {
          throttleTime: ThrottlingUtils.calculateThrottleTime(parseInt(response.headers[HeaderNames.RETRY_AFTER])),
          error: response.body.error,
          errorCodes: response.body.error_codes,
          errorMessage: response.body.error_description,
          subError: response.body.suberror
        };
        cacheManager.setThrottlingCache(ThrottlingUtils.generateThrottlingStorageKey(thumbprint), thumbprintValue, correlationId);
      }
    }
    /**
     * Checks a NetworkResponse object's status codes against 429 or 5xx
     * @param response
     */
    static checkResponseStatus(response) {
      return response.status === 429 || response.status >= 500 && response.status < 600;
    }
    /**
     * Checks a NetworkResponse object's RetryAfter header
     * @param response
     */
    static checkResponseForRetryAfter(response) {
      if (response.headers) {
        return response.headers.hasOwnProperty(HeaderNames.RETRY_AFTER) && (response.status < 200 || response.status >= 300);
      }
      return false;
    }
    /**
     * Calculates the Unix-time value for a throttle to expire given throttleTime in seconds.
     * @param throttleTime
     */
    static calculateThrottleTime(throttleTime) {
      const time = throttleTime <= 0 ? 0 : throttleTime;
      const currentSeconds = Date.now() / 1e3;
      return Math.floor(Math.min(currentSeconds + (time || ThrottlingConstants.DEFAULT_THROTTLE_TIME_SECONDS), currentSeconds + ThrottlingConstants.DEFAULT_MAX_THROTTLE_TIME_SECONDS) * 1e3);
    }
    static removeThrottle(cacheManager, clientId, request, homeAccountIdentifier) {
      const thumbprint = {
        clientId,
        authority: request.authority,
        scopes: request.scopes,
        homeAccountIdentifier,
        claims: request.claims,
        authenticationScheme: request.authenticationScheme,
        resourceRequestMethod: request.resourceRequestMethod,
        resourceRequestUri: request.resourceRequestUri,
        shrClaims: request.shrClaims,
        sshKid: request.sshKid
      };
      const key = this.generateThrottlingStorageKey(thumbprint);
      cacheManager.removeItem(key, request.correlationId);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class NetworkError extends AuthError {
    constructor(error2, httpStatus, responseHeaders) {
      super(error2.errorCode, error2.errorMessage, error2.subError);
      Object.setPrototypeOf(this, NetworkError.prototype);
      this.name = "NetworkError";
      this.error = error2;
      this.httpStatus = httpStatus;
      this.responseHeaders = responseHeaders;
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class BaseClient {
    constructor(configuration, performanceClient) {
      this.config = buildClientConfiguration(configuration);
      this.logger = new Logger(this.config.loggerOptions, name$1, version$1);
      this.cryptoUtils = this.config.cryptoInterface;
      this.cacheManager = this.config.storageInterface;
      this.networkClient = this.config.networkInterface;
      this.serverTelemetryManager = this.config.serverTelemetryManager;
      this.authority = this.config.authOptions.authority;
      this.performanceClient = performanceClient;
    }
    /**
     * Creates default headers for requests to token endpoint
     */
    createTokenRequestHeaders(ccsCred) {
      const headers = {};
      headers[HeaderNames.CONTENT_TYPE] = Constants$1.URL_FORM_CONTENT_TYPE;
      if (!this.config.systemOptions.preventCorsPreflight && ccsCred) {
        switch (ccsCred.type) {
          case CcsCredentialType.HOME_ACCOUNT_ID:
            try {
              const clientInfo = buildClientInfoFromHomeAccountId(ccsCred.credential);
              headers[HeaderNames.CCS_HEADER] = `Oid:${clientInfo.uid}@${clientInfo.utid}`;
            } catch (e) {
              this.logger.verbose("Could not parse home account ID for CCS Header: " + e);
            }
            break;
          case CcsCredentialType.UPN:
            headers[HeaderNames.CCS_HEADER] = `UPN: ${ccsCred.credential}`;
            break;
        }
      }
      return headers;
    }
    /**
     * Http post to token endpoint
     * @param tokenEndpoint
     * @param queryString
     * @param headers
     * @param thumbprint
     */
    async executePostToTokenEndpoint(tokenEndpoint, queryString, headers, thumbprint, correlationId, queuedEvent) {
      var _a;
      if (queuedEvent) {
        (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(queuedEvent, correlationId);
      }
      const response = await this.sendPostRequest(thumbprint, tokenEndpoint, { body: queryString, headers }, correlationId);
      if (this.config.serverTelemetryManager && response.status < 500 && response.status !== 429) {
        this.config.serverTelemetryManager.clearTelemetryCache();
      }
      return response;
    }
    /**
     * Wraps sendPostRequestAsync with necessary preflight and postflight logic
     * @param thumbprint - Request thumbprint for throttling
     * @param tokenEndpoint - Endpoint to make the POST to
     * @param options - Body and Headers to include on the POST request
     * @param correlationId - CorrelationId for telemetry
     */
    async sendPostRequest(thumbprint, tokenEndpoint, options, correlationId) {
      var _a, _b, _c;
      ThrottlingUtils.preProcess(this.cacheManager, thumbprint, correlationId);
      let response;
      try {
        response = await invokeAsync(this.networkClient.sendPostRequestAsync.bind(this.networkClient), PerformanceEvents.NetworkClientSendPostRequestAsync, this.logger, this.performanceClient, correlationId)(tokenEndpoint, options);
        const responseHeaders = response.headers || {};
        (_b = this.performanceClient) == null ? void 0 : _b.addFields({
          refreshTokenSize: ((_a = response.body.refresh_token) == null ? void 0 : _a.length) || 0,
          httpVerToken: responseHeaders[HeaderNames.X_MS_HTTP_VERSION] || "",
          requestId: responseHeaders[HeaderNames.X_MS_REQUEST_ID] || ""
        }, correlationId);
      } catch (e) {
        if (e instanceof NetworkError) {
          const responseHeaders = e.responseHeaders;
          if (responseHeaders) {
            (_c = this.performanceClient) == null ? void 0 : _c.addFields({
              httpVerToken: responseHeaders[HeaderNames.X_MS_HTTP_VERSION] || "",
              requestId: responseHeaders[HeaderNames.X_MS_REQUEST_ID] || "",
              contentTypeHeader: responseHeaders[HeaderNames.CONTENT_TYPE] || void 0,
              contentLengthHeader: responseHeaders[HeaderNames.CONTENT_LENGTH] || void 0,
              httpStatus: e.httpStatus
            }, correlationId);
          }
          throw e.error;
        }
        if (e instanceof AuthError) {
          throw e;
        } else {
          throw createClientAuthError(networkError);
        }
      }
      ThrottlingUtils.postProcess(this.cacheManager, thumbprint, response, correlationId);
      return response;
    }
    /**
     * Updates the authority object of the client. Endpoint discovery must be completed.
     * @param updatedAuthority
     */
    async updateAuthority(cloudInstanceHostname, correlationId) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.UpdateTokenEndpointAuthority, correlationId);
      const cloudInstanceAuthorityUri = `https://${cloudInstanceHostname}/${this.authority.tenant}/`;
      const cloudInstanceAuthority = await createDiscoveredInstance(cloudInstanceAuthorityUri, this.networkClient, this.cacheManager, this.authority.options, this.logger, correlationId, this.performanceClient);
      this.authority = cloudInstanceAuthority;
    }
    /**
     * Creates query string for the /token request
     * @param request
     */
    createTokenQueryParameters(request) {
      const parameterBuilder = new RequestParameterBuilder(request.correlationId, this.performanceClient);
      if (request.embeddedClientId) {
        parameterBuilder.addBrokerParameters({
          brokerClientId: this.config.authOptions.clientId,
          brokerRedirectUri: this.config.authOptions.redirectUri
        });
      }
      if (request.tokenQueryParameters) {
        parameterBuilder.addExtraQueryParameters(request.tokenQueryParameters);
      }
      parameterBuilder.addCorrelationId(request.correlationId);
      return parameterBuilder.createQueryString();
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const noTokensFound = "no_tokens_found";
  const nativeAccountUnavailable = "native_account_unavailable";
  const refreshTokenExpired = "refresh_token_expired";
  const interactionRequired = "interaction_required";
  const consentRequired = "consent_required";
  const loginRequired = "login_required";
  const badToken = "bad_token";
  var InteractionRequiredAuthErrorCodes = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    badToken,
    consentRequired,
    interactionRequired,
    loginRequired,
    nativeAccountUnavailable,
    noTokensFound,
    refreshTokenExpired
  });
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const InteractionRequiredServerErrorMessage = [
    interactionRequired,
    consentRequired,
    loginRequired,
    badToken
  ];
  const InteractionRequiredAuthSubErrorMessage = [
    "message_only",
    "additional_action",
    "basic_action",
    "user_password_expired",
    "consent_required",
    "bad_token"
  ];
  const InteractionRequiredAuthErrorMessages = {
    [noTokensFound]: "No refresh token found in the cache. Please sign-in.",
    [nativeAccountUnavailable]: "The requested account is not available in the native broker. It may have been deleted or logged out. Please sign-in again using an interactive API.",
    [refreshTokenExpired]: "Refresh token has expired.",
    [badToken]: "Identity provider returned bad_token due to an expired or invalid refresh token. Please invoke an interactive API to resolve."
  };
  const InteractionRequiredAuthErrorMessage = {
    noTokensFoundError: {
      code: noTokensFound,
      desc: InteractionRequiredAuthErrorMessages[noTokensFound]
    },
    native_account_unavailable: {
      code: nativeAccountUnavailable,
      desc: InteractionRequiredAuthErrorMessages[nativeAccountUnavailable]
    },
    bad_token: {
      code: badToken,
      desc: InteractionRequiredAuthErrorMessages[badToken]
    }
  };
  class InteractionRequiredAuthError extends AuthError {
    constructor(errorCode, errorMessage, subError, timestamp, traceId, correlationId, claims, errorNo) {
      super(errorCode, errorMessage, subError);
      Object.setPrototypeOf(this, InteractionRequiredAuthError.prototype);
      this.timestamp = timestamp || Constants$1.EMPTY_STRING;
      this.traceId = traceId || Constants$1.EMPTY_STRING;
      this.correlationId = correlationId || Constants$1.EMPTY_STRING;
      this.claims = claims || Constants$1.EMPTY_STRING;
      this.name = "InteractionRequiredAuthError";
      this.errorNo = errorNo;
    }
  }
  function isInteractionRequiredError(errorCode, errorString, subError) {
    const isInteractionRequiredErrorCode = !!errorCode && InteractionRequiredServerErrorMessage.indexOf(errorCode) > -1;
    const isInteractionRequiredSubError = !!subError && InteractionRequiredAuthSubErrorMessage.indexOf(subError) > -1;
    const isInteractionRequiredErrorDesc = !!errorString && InteractionRequiredServerErrorMessage.some((irErrorCode) => {
      return errorString.indexOf(irErrorCode) > -1;
    });
    return isInteractionRequiredErrorCode || isInteractionRequiredErrorDesc || isInteractionRequiredSubError;
  }
  function createInteractionRequiredAuthError(errorCode) {
    return new InteractionRequiredAuthError(errorCode, InteractionRequiredAuthErrorMessages[errorCode]);
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class ProtocolUtils {
    /**
     * Appends user state with random guid, or returns random guid.
     * @param userState
     * @param randomGuid
     */
    static setRequestState(cryptoObj, userState, meta) {
      const libraryState = ProtocolUtils.generateLibraryState(cryptoObj, meta);
      return userState ? `${libraryState}${Constants$1.RESOURCE_DELIM}${userState}` : libraryState;
    }
    /**
     * Generates the state value used by the common library.
     * @param randomGuid
     * @param cryptoObj
     */
    static generateLibraryState(cryptoObj, meta) {
      if (!cryptoObj) {
        throw createClientAuthError(noCryptoObject);
      }
      const stateObj = {
        id: cryptoObj.createNewGuid()
      };
      if (meta) {
        stateObj.meta = meta;
      }
      const stateString = JSON.stringify(stateObj);
      return cryptoObj.base64Encode(stateString);
    }
    /**
     * Parses the state into the RequestStateObject, which contains the LibraryState info and the state passed by the user.
     * @param state
     * @param cryptoObj
     */
    static parseRequestState(cryptoObj, state) {
      if (!cryptoObj) {
        throw createClientAuthError(noCryptoObject);
      }
      if (!state) {
        throw createClientAuthError(invalidState);
      }
      try {
        const splitState = state.split(Constants$1.RESOURCE_DELIM);
        const libraryState = splitState[0];
        const userState = splitState.length > 1 ? splitState.slice(1).join(Constants$1.RESOURCE_DELIM) : Constants$1.EMPTY_STRING;
        const libraryStateString = cryptoObj.base64Decode(libraryState);
        const libraryStateObj = JSON.parse(libraryStateString);
        return {
          userRequestState: userState || Constants$1.EMPTY_STRING,
          libraryState: libraryStateObj
        };
      } catch (e) {
        throw createClientAuthError(invalidState);
      }
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const KeyLocation = {
    SW: "sw"
  };
  class PopTokenGenerator {
    constructor(cryptoUtils, performanceClient) {
      this.cryptoUtils = cryptoUtils;
      this.performanceClient = performanceClient;
    }
    /**
     * Generates the req_cnf validated at the RP in the POP protocol for SHR parameters
     * and returns an object containing the keyid, the full req_cnf string and the req_cnf string hash
     * @param request
     * @returns
     */
    async generateCnf(request, logger) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.PopTokenGenerateCnf, request.correlationId);
      const reqCnf = await invokeAsync(this.generateKid.bind(this), PerformanceEvents.PopTokenGenerateCnf, logger, this.performanceClient, request.correlationId)(request);
      const reqCnfString = this.cryptoUtils.base64UrlEncode(JSON.stringify(reqCnf));
      return {
        kid: reqCnf.kid,
        reqCnfString
      };
    }
    /**
     * Generates key_id for a SHR token request
     * @param request
     * @returns
     */
    async generateKid(request) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.PopTokenGenerateKid, request.correlationId);
      const kidThumbprint = await this.cryptoUtils.getPublicKeyThumbprint(request);
      return {
        kid: kidThumbprint,
        xms_ksl: KeyLocation.SW
      };
    }
    /**
     * Signs the POP access_token with the local generated key-pair
     * @param accessToken
     * @param request
     * @returns
     */
    async signPopToken(accessToken, keyId, request) {
      return this.signPayload(accessToken, keyId, request);
    }
    /**
     * Utility function to generate the signed JWT for an access_token
     * @param payload
     * @param kid
     * @param request
     * @param claims
     * @returns
     */
    async signPayload(payload, keyId, request, claims) {
      const { resourceRequestMethod, resourceRequestUri, shrClaims, shrNonce, shrOptions } = request;
      const resourceUrlString = resourceRequestUri ? new UrlString(resourceRequestUri) : void 0;
      const resourceUrlComponents = resourceUrlString == null ? void 0 : resourceUrlString.getUrlComponents();
      return this.cryptoUtils.signJwt({
        at: payload,
        ts: nowSeconds(),
        m: resourceRequestMethod == null ? void 0 : resourceRequestMethod.toUpperCase(),
        u: resourceUrlComponents == null ? void 0 : resourceUrlComponents.HostNameAndPort,
        nonce: shrNonce || this.cryptoUtils.createNewGuid(),
        p: resourceUrlComponents == null ? void 0 : resourceUrlComponents.AbsolutePath,
        q: (resourceUrlComponents == null ? void 0 : resourceUrlComponents.QueryString) ? [[], resourceUrlComponents.QueryString] : void 0,
        client_claims: shrClaims || void 0,
        ...claims
      }, keyId, shrOptions, request.correlationId);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class TokenCacheContext {
    constructor(tokenCache, hasChanged) {
      this.cache = tokenCache;
      this.hasChanged = hasChanged;
    }
    /**
     * boolean which indicates the changes in cache
     */
    get cacheHasChanged() {
      return this.hasChanged;
    }
    /**
     * function to retrieve the token cache
     */
    get tokenCache() {
      return this.cache;
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  function parseServerErrorNo(serverResponse) {
    var _a, _b;
    const errorCodePrefix = "code=";
    const errorCodePrefixIndex = (_a = serverResponse.error_uri) == null ? void 0 : _a.lastIndexOf(errorCodePrefix);
    return errorCodePrefixIndex && errorCodePrefixIndex >= 0 ? (_b = serverResponse.error_uri) == null ? void 0 : _b.substring(errorCodePrefixIndex + errorCodePrefix.length) : void 0;
  }
  class ResponseHandler {
    constructor(clientId, cacheStorage, cryptoObj, logger, serializableCache, persistencePlugin, performanceClient) {
      this.clientId = clientId;
      this.cacheStorage = cacheStorage;
      this.cryptoObj = cryptoObj;
      this.logger = logger;
      this.serializableCache = serializableCache;
      this.persistencePlugin = persistencePlugin;
      this.performanceClient = performanceClient;
    }
    /**
     * Function which validates server authorization code response.
     * @param serverResponseHash
     * @param requestState
     * @param cryptoObj
     */
    validateServerAuthorizationCodeResponse(serverResponse, requestState) {
      if (!serverResponse.state || !requestState) {
        throw serverResponse.state ? createClientAuthError(stateNotFound, "Cached State") : createClientAuthError(stateNotFound, "Server State");
      }
      let decodedServerResponseState;
      let decodedRequestState;
      try {
        decodedServerResponseState = decodeURIComponent(serverResponse.state);
      } catch (e) {
        throw createClientAuthError(invalidState, serverResponse.state);
      }
      try {
        decodedRequestState = decodeURIComponent(requestState);
      } catch (e) {
        throw createClientAuthError(invalidState, serverResponse.state);
      }
      if (decodedServerResponseState !== decodedRequestState) {
        throw createClientAuthError(stateMismatch);
      }
      if (serverResponse.error || serverResponse.error_description || serverResponse.suberror) {
        const serverErrorNo = parseServerErrorNo(serverResponse);
        if (isInteractionRequiredError(serverResponse.error, serverResponse.error_description, serverResponse.suberror)) {
          throw new InteractionRequiredAuthError(serverResponse.error || "", serverResponse.error_description, serverResponse.suberror, serverResponse.timestamp || "", serverResponse.trace_id || "", serverResponse.correlation_id || "", serverResponse.claims || "", serverErrorNo);
        }
        throw new ServerError(serverResponse.error || "", serverResponse.error_description, serverResponse.suberror, serverErrorNo);
      }
    }
    /**
     * Function which validates server authorization token response.
     * @param serverResponse
     * @param refreshAccessToken
     */
    validateTokenResponse(serverResponse, refreshAccessToken) {
      var _a;
      if (serverResponse.error || serverResponse.error_description || serverResponse.suberror) {
        const errString = `Error(s): ${serverResponse.error_codes || Constants$1.NOT_AVAILABLE} - Timestamp: ${serverResponse.timestamp || Constants$1.NOT_AVAILABLE} - Description: ${serverResponse.error_description || Constants$1.NOT_AVAILABLE} - Correlation ID: ${serverResponse.correlation_id || Constants$1.NOT_AVAILABLE} - Trace ID: ${serverResponse.trace_id || Constants$1.NOT_AVAILABLE}`;
        const serverErrorNo = ((_a = serverResponse.error_codes) == null ? void 0 : _a.length) ? serverResponse.error_codes[0] : void 0;
        const serverError = new ServerError(serverResponse.error, errString, serverResponse.suberror, serverErrorNo, serverResponse.status);
        if (refreshAccessToken && serverResponse.status && serverResponse.status >= HttpStatus.SERVER_ERROR_RANGE_START && serverResponse.status <= HttpStatus.SERVER_ERROR_RANGE_END) {
          this.logger.warning(`executeTokenRequest:validateTokenResponse - AAD is currently unavailable and the access token is unable to be refreshed.
${serverError}`);
          return;
        } else if (refreshAccessToken && serverResponse.status && serverResponse.status >= HttpStatus.CLIENT_ERROR_RANGE_START && serverResponse.status <= HttpStatus.CLIENT_ERROR_RANGE_END) {
          this.logger.warning(`executeTokenRequest:validateTokenResponse - AAD is currently available but is unable to refresh the access token.
${serverError}`);
          return;
        }
        if (isInteractionRequiredError(serverResponse.error, serverResponse.error_description, serverResponse.suberror)) {
          throw new InteractionRequiredAuthError(serverResponse.error, serverResponse.error_description, serverResponse.suberror, serverResponse.timestamp || Constants$1.EMPTY_STRING, serverResponse.trace_id || Constants$1.EMPTY_STRING, serverResponse.correlation_id || Constants$1.EMPTY_STRING, serverResponse.claims || Constants$1.EMPTY_STRING, serverErrorNo);
        }
        throw serverError;
      }
    }
    /**
     * Returns a constructed token response based on given string. Also manages the cache updates and cleanups.
     * @param serverTokenResponse
     * @param authority
     */
    async handleServerTokenResponse(serverTokenResponse, authority, reqTimestamp, request, authCodePayload, userAssertionHash, handlingRefreshTokenResponse, forceCacheRefreshTokenResponse, serverRequestId) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.HandleServerTokenResponse, serverTokenResponse.correlation_id);
      let idTokenClaims;
      if (serverTokenResponse.id_token) {
        idTokenClaims = extractTokenClaims(serverTokenResponse.id_token || Constants$1.EMPTY_STRING, this.cryptoObj.base64Decode);
        if (authCodePayload && authCodePayload.nonce) {
          if (idTokenClaims.nonce !== authCodePayload.nonce) {
            throw createClientAuthError(nonceMismatch);
          }
        }
        if (request.maxAge || request.maxAge === 0) {
          const authTime = idTokenClaims.auth_time;
          if (!authTime) {
            throw createClientAuthError(authTimeNotFound);
          }
          checkMaxAge(authTime, request.maxAge);
        }
      }
      this.homeAccountIdentifier = AccountEntity.generateHomeAccountId(serverTokenResponse.client_info || Constants$1.EMPTY_STRING, authority.authorityType, this.logger, this.cryptoObj, idTokenClaims);
      let requestStateObj;
      if (!!authCodePayload && !!authCodePayload.state) {
        requestStateObj = ProtocolUtils.parseRequestState(this.cryptoObj, authCodePayload.state);
      }
      serverTokenResponse.key_id = serverTokenResponse.key_id || request.sshKid || void 0;
      const cacheRecord = this.generateCacheRecord(serverTokenResponse, authority, reqTimestamp, request, idTokenClaims, userAssertionHash, authCodePayload);
      let cacheContext;
      try {
        if (this.persistencePlugin && this.serializableCache) {
          this.logger.verbose("Persistence enabled, calling beforeCacheAccess");
          cacheContext = new TokenCacheContext(this.serializableCache, true);
          await this.persistencePlugin.beforeCacheAccess(cacheContext);
        }
        if (handlingRefreshTokenResponse && !forceCacheRefreshTokenResponse && cacheRecord.account) {
          const key = cacheRecord.account.generateAccountKey();
          const account = this.cacheStorage.getAccount(key, request.correlationId, this.logger);
          if (!account) {
            this.logger.warning("Account used to refresh tokens not in persistence, refreshed tokens will not be stored in the cache");
            return await ResponseHandler.generateAuthenticationResult(this.cryptoObj, authority, cacheRecord, false, request, idTokenClaims, requestStateObj, void 0, serverRequestId);
          }
        }
        await this.cacheStorage.saveCacheRecord(cacheRecord, request.correlationId, request.storeInCache);
      } finally {
        if (this.persistencePlugin && this.serializableCache && cacheContext) {
          this.logger.verbose("Persistence enabled, calling afterCacheAccess");
          await this.persistencePlugin.afterCacheAccess(cacheContext);
        }
      }
      return ResponseHandler.generateAuthenticationResult(this.cryptoObj, authority, cacheRecord, false, request, idTokenClaims, requestStateObj, serverTokenResponse, serverRequestId);
    }
    /**
     * Generates CacheRecord
     * @param serverTokenResponse
     * @param idTokenObj
     * @param authority
     */
    generateCacheRecord(serverTokenResponse, authority, reqTimestamp, request, idTokenClaims, userAssertionHash, authCodePayload) {
      const env = authority.getPreferredCache();
      if (!env) {
        throw createClientAuthError(invalidCacheEnvironment);
      }
      const claimsTenantId = getTenantIdFromIdTokenClaims(idTokenClaims);
      let cachedIdToken;
      let cachedAccount;
      if (serverTokenResponse.id_token && !!idTokenClaims) {
        cachedIdToken = createIdTokenEntity(this.homeAccountIdentifier, env, serverTokenResponse.id_token, this.clientId, claimsTenantId || "");
        cachedAccount = buildAccountToCache(
          this.cacheStorage,
          authority,
          this.homeAccountIdentifier,
          this.cryptoObj.base64Decode,
          request.correlationId,
          idTokenClaims,
          serverTokenResponse.client_info,
          env,
          claimsTenantId,
          authCodePayload,
          void 0,
          // nativeAccountId
          this.logger
        );
      }
      let cachedAccessToken = null;
      if (serverTokenResponse.access_token) {
        const responseScopes = serverTokenResponse.scope ? ScopeSet.fromString(serverTokenResponse.scope) : new ScopeSet(request.scopes || []);
        const expiresIn = (typeof serverTokenResponse.expires_in === "string" ? parseInt(serverTokenResponse.expires_in, 10) : serverTokenResponse.expires_in) || 0;
        const extExpiresIn = (typeof serverTokenResponse.ext_expires_in === "string" ? parseInt(serverTokenResponse.ext_expires_in, 10) : serverTokenResponse.ext_expires_in) || 0;
        const refreshIn = (typeof serverTokenResponse.refresh_in === "string" ? parseInt(serverTokenResponse.refresh_in, 10) : serverTokenResponse.refresh_in) || void 0;
        const tokenExpirationSeconds = reqTimestamp + expiresIn;
        const extendedTokenExpirationSeconds = tokenExpirationSeconds + extExpiresIn;
        const refreshOnSeconds = refreshIn && refreshIn > 0 ? reqTimestamp + refreshIn : void 0;
        cachedAccessToken = createAccessTokenEntity(this.homeAccountIdentifier, env, serverTokenResponse.access_token, this.clientId, claimsTenantId || authority.tenant || "", responseScopes.printScopes(), tokenExpirationSeconds, extendedTokenExpirationSeconds, this.cryptoObj.base64Decode, refreshOnSeconds, serverTokenResponse.token_type, userAssertionHash, serverTokenResponse.key_id, request.claims, request.requestedClaimsHash);
      }
      let cachedRefreshToken = null;
      if (serverTokenResponse.refresh_token) {
        let rtExpiresOn;
        if (serverTokenResponse.refresh_token_expires_in) {
          const rtExpiresIn = typeof serverTokenResponse.refresh_token_expires_in === "string" ? parseInt(serverTokenResponse.refresh_token_expires_in, 10) : serverTokenResponse.refresh_token_expires_in;
          rtExpiresOn = reqTimestamp + rtExpiresIn;
        }
        cachedRefreshToken = createRefreshTokenEntity(this.homeAccountIdentifier, env, serverTokenResponse.refresh_token, this.clientId, serverTokenResponse.foci, userAssertionHash, rtExpiresOn);
      }
      let cachedAppMetadata = null;
      if (serverTokenResponse.foci) {
        cachedAppMetadata = {
          clientId: this.clientId,
          environment: env,
          familyId: serverTokenResponse.foci
        };
      }
      return {
        account: cachedAccount,
        idToken: cachedIdToken,
        accessToken: cachedAccessToken,
        refreshToken: cachedRefreshToken,
        appMetadata: cachedAppMetadata
      };
    }
    /**
     * Creates an @AuthenticationResult from @CacheRecord , @IdToken , and a boolean that states whether or not the result is from cache.
     *
     * Optionally takes a state string that is set as-is in the response.
     *
     * @param cacheRecord
     * @param idTokenObj
     * @param fromTokenCache
     * @param stateString
     */
    static async generateAuthenticationResult(cryptoObj, authority, cacheRecord, fromTokenCache, request, idTokenClaims, requestState, serverTokenResponse, requestId) {
      var _a, _b, _c, _d, _e;
      let accessToken = Constants$1.EMPTY_STRING;
      let responseScopes = [];
      let expiresOn = null;
      let extExpiresOn;
      let refreshOn;
      let familyId = Constants$1.EMPTY_STRING;
      if (cacheRecord.accessToken) {
        if (cacheRecord.accessToken.tokenType === AuthenticationScheme.POP && !request.popKid) {
          const popTokenGenerator = new PopTokenGenerator(cryptoObj);
          const { secret, keyId } = cacheRecord.accessToken;
          if (!keyId) {
            throw createClientAuthError(keyIdMissing);
          }
          accessToken = await popTokenGenerator.signPopToken(secret, keyId, request);
        } else {
          accessToken = cacheRecord.accessToken.secret;
        }
        responseScopes = ScopeSet.fromString(cacheRecord.accessToken.target).asArray();
        expiresOn = new Date(Number(cacheRecord.accessToken.expiresOn) * 1e3);
        extExpiresOn = new Date(Number(cacheRecord.accessToken.extendedExpiresOn) * 1e3);
        if (cacheRecord.accessToken.refreshOn) {
          refreshOn = new Date(Number(cacheRecord.accessToken.refreshOn) * 1e3);
        }
      }
      if (cacheRecord.appMetadata) {
        familyId = cacheRecord.appMetadata.familyId === THE_FAMILY_ID ? THE_FAMILY_ID : "";
      }
      const uid = (idTokenClaims == null ? void 0 : idTokenClaims.oid) || (idTokenClaims == null ? void 0 : idTokenClaims.sub) || "";
      const tid = (idTokenClaims == null ? void 0 : idTokenClaims.tid) || "";
      if ((serverTokenResponse == null ? void 0 : serverTokenResponse.spa_accountid) && !!cacheRecord.account) {
        cacheRecord.account.nativeAccountId = serverTokenResponse == null ? void 0 : serverTokenResponse.spa_accountid;
      }
      const accountInfo = cacheRecord.account ? updateAccountTenantProfileData(
        cacheRecord.account.getAccountInfo(),
        void 0,
        // tenantProfile optional
        idTokenClaims,
        (_a = cacheRecord.idToken) == null ? void 0 : _a.secret
      ) : null;
      return {
        authority: authority.canonicalAuthority,
        uniqueId: uid,
        tenantId: tid,
        scopes: responseScopes,
        account: accountInfo,
        idToken: ((_b = cacheRecord == null ? void 0 : cacheRecord.idToken) == null ? void 0 : _b.secret) || "",
        idTokenClaims: idTokenClaims || {},
        accessToken,
        fromCache: fromTokenCache,
        expiresOn,
        extExpiresOn,
        refreshOn,
        correlationId: request.correlationId,
        requestId: requestId || Constants$1.EMPTY_STRING,
        familyId,
        tokenType: ((_c = cacheRecord.accessToken) == null ? void 0 : _c.tokenType) || Constants$1.EMPTY_STRING,
        state: requestState ? requestState.userRequestState : Constants$1.EMPTY_STRING,
        cloudGraphHostName: ((_d = cacheRecord.account) == null ? void 0 : _d.cloudGraphHostName) || Constants$1.EMPTY_STRING,
        msGraphHost: ((_e = cacheRecord.account) == null ? void 0 : _e.msGraphHost) || Constants$1.EMPTY_STRING,
        code: serverTokenResponse == null ? void 0 : serverTokenResponse.spa_code,
        fromNativeBroker: false
      };
    }
  }
  function buildAccountToCache(cacheStorage, authority, homeAccountId, base64Decode, correlationId, idTokenClaims, clientInfo, environment, claimsTenantId, authCodePayload, nativeAccountId, logger) {
    logger == null ? void 0 : logger.verbose("setCachedAccount called");
    const accountKeys = cacheStorage.getAccountKeys();
    const baseAccountKey = accountKeys.find((accountKey) => {
      return accountKey.startsWith(homeAccountId);
    });
    let cachedAccount = null;
    if (baseAccountKey) {
      cachedAccount = cacheStorage.getAccount(baseAccountKey, correlationId, logger);
    }
    const baseAccount = cachedAccount || AccountEntity.createAccount({
      homeAccountId,
      idTokenClaims,
      clientInfo,
      environment,
      cloudGraphHostName: authCodePayload == null ? void 0 : authCodePayload.cloud_graph_host_name,
      msGraphHost: authCodePayload == null ? void 0 : authCodePayload.msgraph_host,
      nativeAccountId
    }, authority, base64Decode);
    const tenantProfiles = baseAccount.tenantProfiles || [];
    const tenantId = claimsTenantId || baseAccount.realm;
    if (tenantId && !tenantProfiles.find((tenantProfile) => {
      return tenantProfile.tenantId === tenantId;
    })) {
      const newTenantProfile = buildTenantProfile(homeAccountId, baseAccount.localAccountId, tenantId, idTokenClaims);
      tenantProfiles.push(newTenantProfile);
    }
    baseAccount.tenantProfiles = tenantProfiles;
    return baseAccount;
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  async function getClientAssertion(clientAssertion, clientId, tokenEndpoint) {
    if (typeof clientAssertion === "string") {
      return clientAssertion;
    } else {
      const config2 = {
        clientId,
        tokenEndpoint
      };
      return clientAssertion(config2);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class AuthorizationCodeClient extends BaseClient {
    constructor(configuration, performanceClient) {
      var _a;
      super(configuration, performanceClient);
      this.includeRedirectUri = true;
      this.oidcDefaultScopes = (_a = this.config.authOptions.authority.options.OIDCOptions) == null ? void 0 : _a.defaultScopes;
    }
    /**
     * Creates the URL of the authorization request letting the user input credentials and consent to the
     * application. The URL target the /authorize endpoint of the authority configured in the
     * application object.
     *
     * Once the user inputs their credentials and consents, the authority will send a response to the redirect URI
     * sent in the request and should contain an authorization code, which can then be used to acquire tokens via
     * acquireToken(AuthorizationCodeRequest)
     * @param request
     */
    async getAuthCodeUrl(request) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.GetAuthCodeUrl, request.correlationId);
      const queryString = await invokeAsync(this.createAuthCodeUrlQueryString.bind(this), PerformanceEvents.AuthClientCreateQueryString, this.logger, this.performanceClient, request.correlationId)(request);
      return UrlString.appendQueryString(this.authority.authorizationEndpoint, queryString);
    }
    /**
     * API to acquire a token in exchange of 'authorization_code` acquired by the user in the first leg of the
     * authorization_code_grant
     * @param request
     */
    async acquireToken(request, authCodePayload) {
      var _a, _b;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthClientAcquireToken, request.correlationId);
      if (!request.code) {
        throw createClientAuthError(requestCannotBeMade);
      }
      const reqTimestamp = nowSeconds();
      const response = await invokeAsync(this.executeTokenRequest.bind(this), PerformanceEvents.AuthClientExecuteTokenRequest, this.logger, this.performanceClient, request.correlationId)(this.authority, request);
      const requestId = (_b = response.headers) == null ? void 0 : _b[HeaderNames.X_MS_REQUEST_ID];
      const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin, this.performanceClient);
      responseHandler.validateTokenResponse(response.body);
      return invokeAsync(responseHandler.handleServerTokenResponse.bind(responseHandler), PerformanceEvents.HandleServerTokenResponse, this.logger, this.performanceClient, request.correlationId)(response.body, this.authority, reqTimestamp, request, authCodePayload, void 0, void 0, void 0, requestId);
    }
    /**
     * Handles the hash fragment response from public client code request. Returns a code response used by
     * the client to exchange for a token in acquireToken.
     * @param hashFragment
     */
    handleFragmentResponse(serverParams, cachedState) {
      const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, null, null);
      responseHandler.validateServerAuthorizationCodeResponse(serverParams, cachedState);
      if (!serverParams.code) {
        throw createClientAuthError(authorizationCodeMissingFromServerResponse);
      }
      return serverParams;
    }
    /**
     * Used to log out the current user, and redirect the user to the postLogoutRedirectUri.
     * Default behaviour is to redirect the user to `window.location.href`.
     * @param authorityUri
     */
    getLogoutUri(logoutRequest) {
      if (!logoutRequest) {
        throw createClientConfigurationError(logoutRequestEmpty);
      }
      const queryString = this.createLogoutUrlQueryString(logoutRequest);
      return UrlString.appendQueryString(this.authority.endSessionEndpoint, queryString);
    }
    /**
     * Executes POST request to token endpoint
     * @param authority
     * @param request
     */
    async executeTokenRequest(authority, request) {
      var _a, _b;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthClientExecuteTokenRequest, request.correlationId);
      const queryParametersString = this.createTokenQueryParameters(request);
      const endpoint = UrlString.appendQueryString(authority.tokenEndpoint, queryParametersString);
      const requestBody = await invokeAsync(this.createTokenRequestBody.bind(this), PerformanceEvents.AuthClientCreateTokenRequestBody, this.logger, this.performanceClient, request.correlationId)(request);
      let ccsCredential = void 0;
      if (request.clientInfo) {
        try {
          const clientInfo = buildClientInfo(request.clientInfo, this.cryptoUtils.base64Decode);
          ccsCredential = {
            credential: `${clientInfo.uid}${Separators.CLIENT_INFO_SEPARATOR}${clientInfo.utid}`,
            type: CcsCredentialType.HOME_ACCOUNT_ID
          };
        } catch (e) {
          this.logger.verbose("Could not parse client info for CCS Header: " + e);
        }
      }
      const headers = this.createTokenRequestHeaders(ccsCredential || request.ccsCredential);
      const thumbprint = {
        clientId: ((_b = request.tokenBodyParameters) == null ? void 0 : _b.clientId) || this.config.authOptions.clientId,
        authority: authority.canonicalAuthority,
        scopes: request.scopes,
        claims: request.claims,
        authenticationScheme: request.authenticationScheme,
        resourceRequestMethod: request.resourceRequestMethod,
        resourceRequestUri: request.resourceRequestUri,
        shrClaims: request.shrClaims,
        sshKid: request.sshKid
      };
      return invokeAsync(this.executePostToTokenEndpoint.bind(this), PerformanceEvents.AuthorizationCodeClientExecutePostToTokenEndpoint, this.logger, this.performanceClient, request.correlationId)(endpoint, requestBody, headers, thumbprint, request.correlationId, PerformanceEvents.AuthorizationCodeClientExecutePostToTokenEndpoint);
    }
    /**
     * Generates a map for all the params to be sent to the service
     * @param request
     */
    async createTokenRequestBody(request) {
      var _a, _b;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthClientCreateTokenRequestBody, request.correlationId);
      const parameterBuilder = new RequestParameterBuilder(request.correlationId, this.performanceClient);
      parameterBuilder.addClientId(request.embeddedClientId || ((_b = request.tokenBodyParameters) == null ? void 0 : _b[CLIENT_ID]) || this.config.authOptions.clientId);
      if (!this.includeRedirectUri) {
        RequestValidator.validateRedirectUri(request.redirectUri);
      } else {
        parameterBuilder.addRedirectUri(request.redirectUri);
      }
      parameterBuilder.addScopes(request.scopes, true, this.oidcDefaultScopes);
      parameterBuilder.addAuthorizationCode(request.code);
      parameterBuilder.addLibraryInfo(this.config.libraryInfo);
      parameterBuilder.addApplicationTelemetry(this.config.telemetry.application);
      parameterBuilder.addThrottling();
      if (this.serverTelemetryManager && !isOidcProtocolMode(this.config)) {
        parameterBuilder.addServerTelemetry(this.serverTelemetryManager);
      }
      if (request.codeVerifier) {
        parameterBuilder.addCodeVerifier(request.codeVerifier);
      }
      if (this.config.clientCredentials.clientSecret) {
        parameterBuilder.addClientSecret(this.config.clientCredentials.clientSecret);
      }
      if (this.config.clientCredentials.clientAssertion) {
        const clientAssertion = this.config.clientCredentials.clientAssertion;
        parameterBuilder.addClientAssertion(await getClientAssertion(clientAssertion.assertion, this.config.authOptions.clientId, request.resourceRequestUri));
        parameterBuilder.addClientAssertionType(clientAssertion.assertionType);
      }
      parameterBuilder.addGrantType(GrantType.AUTHORIZATION_CODE_GRANT);
      parameterBuilder.addClientInfo();
      if (request.authenticationScheme === AuthenticationScheme.POP) {
        const popTokenGenerator = new PopTokenGenerator(this.cryptoUtils, this.performanceClient);
        let reqCnfData;
        if (!request.popKid) {
          const generatedReqCnfData = await invokeAsync(popTokenGenerator.generateCnf.bind(popTokenGenerator), PerformanceEvents.PopTokenGenerateCnf, this.logger, this.performanceClient, request.correlationId)(request, this.logger);
          reqCnfData = generatedReqCnfData.reqCnfString;
        } else {
          reqCnfData = this.cryptoUtils.encodeKid(request.popKid);
        }
        parameterBuilder.addPopToken(reqCnfData);
      } else if (request.authenticationScheme === AuthenticationScheme.SSH) {
        if (request.sshJwk) {
          parameterBuilder.addSshJwk(request.sshJwk);
        } else {
          throw createClientConfigurationError(missingSshJwk);
        }
      }
      if (!StringUtils.isEmptyObj(request.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
        parameterBuilder.addClaims(request.claims, this.config.authOptions.clientCapabilities);
      }
      let ccsCred = void 0;
      if (request.clientInfo) {
        try {
          const clientInfo = buildClientInfo(request.clientInfo, this.cryptoUtils.base64Decode);
          ccsCred = {
            credential: `${clientInfo.uid}${Separators.CLIENT_INFO_SEPARATOR}${clientInfo.utid}`,
            type: CcsCredentialType.HOME_ACCOUNT_ID
          };
        } catch (e) {
          this.logger.verbose("Could not parse client info for CCS Header: " + e);
        }
      } else {
        ccsCred = request.ccsCredential;
      }
      if (this.config.systemOptions.preventCorsPreflight && ccsCred) {
        switch (ccsCred.type) {
          case CcsCredentialType.HOME_ACCOUNT_ID:
            try {
              const clientInfo = buildClientInfoFromHomeAccountId(ccsCred.credential);
              parameterBuilder.addCcsOid(clientInfo);
            } catch (e) {
              this.logger.verbose("Could not parse home account ID for CCS Header: " + e);
            }
            break;
          case CcsCredentialType.UPN:
            parameterBuilder.addCcsUpn(ccsCred.credential);
            break;
        }
      }
      if (request.embeddedClientId) {
        parameterBuilder.addBrokerParameters({
          brokerClientId: this.config.authOptions.clientId,
          brokerRedirectUri: this.config.authOptions.redirectUri
        });
      }
      if (request.tokenBodyParameters) {
        parameterBuilder.addExtraQueryParameters(request.tokenBodyParameters);
      }
      if (request.enableSpaAuthorizationCode && (!request.tokenBodyParameters || !request.tokenBodyParameters[RETURN_SPA_CODE])) {
        parameterBuilder.addExtraQueryParameters({
          [RETURN_SPA_CODE]: "1"
        });
      }
      return parameterBuilder.createQueryString();
    }
    /**
     * This API validates the `AuthorizationCodeUrlRequest` and creates a URL
     * @param request
     */
    async createAuthCodeUrlQueryString(request) {
      var _a, _b;
      const correlationId = request.correlationId || this.config.cryptoInterface.createNewGuid();
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.AuthClientCreateQueryString, correlationId);
      const parameterBuilder = new RequestParameterBuilder(correlationId, this.performanceClient);
      parameterBuilder.addClientId(request.embeddedClientId || ((_b = request.extraQueryParameters) == null ? void 0 : _b[CLIENT_ID]) || this.config.authOptions.clientId);
      const requestScopes = [
        ...request.scopes || [],
        ...request.extraScopesToConsent || []
      ];
      parameterBuilder.addScopes(requestScopes, true, this.oidcDefaultScopes);
      parameterBuilder.addRedirectUri(request.redirectUri);
      parameterBuilder.addCorrelationId(correlationId);
      parameterBuilder.addResponseMode(request.responseMode);
      parameterBuilder.addResponseTypeCode();
      parameterBuilder.addLibraryInfo(this.config.libraryInfo);
      if (!isOidcProtocolMode(this.config)) {
        parameterBuilder.addApplicationTelemetry(this.config.telemetry.application);
      }
      parameterBuilder.addClientInfo();
      if (request.codeChallenge && request.codeChallengeMethod) {
        parameterBuilder.addCodeChallengeParams(request.codeChallenge, request.codeChallengeMethod);
      }
      if (request.prompt) {
        parameterBuilder.addPrompt(request.prompt);
      }
      if (request.domainHint) {
        parameterBuilder.addDomainHint(request.domainHint);
      }
      if (request.prompt !== PromptValue.SELECT_ACCOUNT) {
        if (request.sid && request.prompt === PromptValue.NONE) {
          this.logger.verbose("createAuthCodeUrlQueryString: Prompt is none, adding sid from request");
          parameterBuilder.addSid(request.sid);
        } else if (request.account) {
          const accountSid = this.extractAccountSid(request.account);
          let accountLoginHintClaim = this.extractLoginHint(request.account);
          if (accountLoginHintClaim && request.domainHint) {
            this.logger.warning(`AuthorizationCodeClient.createAuthCodeUrlQueryString: "domainHint" param is set, skipping opaque "login_hint" claim. Please consider not passing domainHint`);
            accountLoginHintClaim = null;
          }
          if (accountLoginHintClaim) {
            this.logger.verbose("createAuthCodeUrlQueryString: login_hint claim present on account");
            parameterBuilder.addLoginHint(accountLoginHintClaim);
            try {
              const clientInfo = buildClientInfoFromHomeAccountId(request.account.homeAccountId);
              parameterBuilder.addCcsOid(clientInfo);
            } catch (e) {
              this.logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
            }
          } else if (accountSid && request.prompt === PromptValue.NONE) {
            this.logger.verbose("createAuthCodeUrlQueryString: Prompt is none, adding sid from account");
            parameterBuilder.addSid(accountSid);
            try {
              const clientInfo = buildClientInfoFromHomeAccountId(request.account.homeAccountId);
              parameterBuilder.addCcsOid(clientInfo);
            } catch (e) {
              this.logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
            }
          } else if (request.loginHint) {
            this.logger.verbose("createAuthCodeUrlQueryString: Adding login_hint from request");
            parameterBuilder.addLoginHint(request.loginHint);
            parameterBuilder.addCcsUpn(request.loginHint);
          } else if (request.account.username) {
            this.logger.verbose("createAuthCodeUrlQueryString: Adding login_hint from account");
            parameterBuilder.addLoginHint(request.account.username);
            try {
              const clientInfo = buildClientInfoFromHomeAccountId(request.account.homeAccountId);
              parameterBuilder.addCcsOid(clientInfo);
            } catch (e) {
              this.logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
            }
          }
        } else if (request.loginHint) {
          this.logger.verbose("createAuthCodeUrlQueryString: No account, adding login_hint from request");
          parameterBuilder.addLoginHint(request.loginHint);
          parameterBuilder.addCcsUpn(request.loginHint);
        }
      } else {
        this.logger.verbose("createAuthCodeUrlQueryString: Prompt is select_account, ignoring account hints");
      }
      if (request.nonce) {
        parameterBuilder.addNonce(request.nonce);
      }
      if (request.state) {
        parameterBuilder.addState(request.state);
      }
      if (request.claims || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
        parameterBuilder.addClaims(request.claims, this.config.authOptions.clientCapabilities);
      }
      if (request.embeddedClientId) {
        parameterBuilder.addBrokerParameters({
          brokerClientId: this.config.authOptions.clientId,
          brokerRedirectUri: this.config.authOptions.redirectUri
        });
      }
      this.addExtraQueryParams(request, parameterBuilder);
      if (request.nativeBroker) {
        parameterBuilder.addNativeBroker();
        if (request.authenticationScheme === AuthenticationScheme.POP) {
          const popTokenGenerator = new PopTokenGenerator(this.cryptoUtils);
          let reqCnfData;
          if (!request.popKid) {
            const generatedReqCnfData = await invokeAsync(popTokenGenerator.generateCnf.bind(popTokenGenerator), PerformanceEvents.PopTokenGenerateCnf, this.logger, this.performanceClient, request.correlationId)(request, this.logger);
            reqCnfData = generatedReqCnfData.reqCnfString;
          } else {
            reqCnfData = this.cryptoUtils.encodeKid(request.popKid);
          }
          parameterBuilder.addPopToken(reqCnfData);
        }
      }
      return parameterBuilder.createQueryString();
    }
    /**
     * This API validates the `EndSessionRequest` and creates a URL
     * @param request
     */
    createLogoutUrlQueryString(request) {
      const parameterBuilder = new RequestParameterBuilder(request.correlationId, this.performanceClient);
      if (request.postLogoutRedirectUri) {
        parameterBuilder.addPostLogoutRedirectUri(request.postLogoutRedirectUri);
      }
      if (request.correlationId) {
        parameterBuilder.addCorrelationId(request.correlationId);
      }
      if (request.idTokenHint) {
        parameterBuilder.addIdTokenHint(request.idTokenHint);
      }
      if (request.state) {
        parameterBuilder.addState(request.state);
      }
      if (request.logoutHint) {
        parameterBuilder.addLogoutHint(request.logoutHint);
      }
      this.addExtraQueryParams(request, parameterBuilder);
      return parameterBuilder.createQueryString();
    }
    addExtraQueryParams(request, parameterBuilder) {
      const hasRequestInstanceAware = request.extraQueryParameters && request.extraQueryParameters.hasOwnProperty("instance_aware");
      if (!hasRequestInstanceAware && this.config.authOptions.instanceAware) {
        request.extraQueryParameters = request.extraQueryParameters || {};
        request.extraQueryParameters["instance_aware"] = "true";
      }
      if (request.extraQueryParameters) {
        parameterBuilder.addExtraQueryParameters(request.extraQueryParameters);
      }
    }
    /**
     * Helper to get sid from account. Returns null if idTokenClaims are not present or sid is not present.
     * @param account
     */
    extractAccountSid(account) {
      var _a;
      return ((_a = account.idTokenClaims) == null ? void 0 : _a.sid) || null;
    }
    extractLoginHint(account) {
      var _a;
      return ((_a = account.idTokenClaims) == null ? void 0 : _a.login_hint) || null;
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const DEFAULT_REFRESH_TOKEN_EXPIRATION_OFFSET_SECONDS = 300;
  class RefreshTokenClient extends BaseClient {
    constructor(configuration, performanceClient) {
      super(configuration, performanceClient);
    }
    async acquireToken(request) {
      var _a, _b;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.RefreshTokenClientAcquireToken, request.correlationId);
      const reqTimestamp = nowSeconds();
      const response = await invokeAsync(this.executeTokenRequest.bind(this), PerformanceEvents.RefreshTokenClientExecuteTokenRequest, this.logger, this.performanceClient, request.correlationId)(request, this.authority);
      const requestId = (_b = response.headers) == null ? void 0 : _b[HeaderNames.X_MS_REQUEST_ID];
      const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin);
      responseHandler.validateTokenResponse(response.body);
      return invokeAsync(responseHandler.handleServerTokenResponse.bind(responseHandler), PerformanceEvents.HandleServerTokenResponse, this.logger, this.performanceClient, request.correlationId)(response.body, this.authority, reqTimestamp, request, void 0, void 0, true, request.forceCache, requestId);
    }
    /**
     * Gets cached refresh token and attaches to request, then calls acquireToken API
     * @param request
     */
    async acquireTokenByRefreshToken(request) {
      var _a;
      if (!request) {
        throw createClientConfigurationError(tokenRequestEmpty);
      }
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.RefreshTokenClientAcquireTokenByRefreshToken, request.correlationId);
      if (!request.account) {
        throw createClientAuthError(noAccountInSilentRequest);
      }
      const isFOCI = this.cacheManager.isAppMetadataFOCI(request.account.environment);
      if (isFOCI) {
        try {
          return await invokeAsync(this.acquireTokenWithCachedRefreshToken.bind(this), PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken, this.logger, this.performanceClient, request.correlationId)(request, true);
        } catch (e) {
          const noFamilyRTInCache = e instanceof InteractionRequiredAuthError && e.errorCode === noTokensFound;
          const clientMismatchErrorWithFamilyRT = e instanceof ServerError && e.errorCode === Errors.INVALID_GRANT_ERROR && e.subError === Errors.CLIENT_MISMATCH_ERROR;
          if (noFamilyRTInCache || clientMismatchErrorWithFamilyRT) {
            return invokeAsync(this.acquireTokenWithCachedRefreshToken.bind(this), PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken, this.logger, this.performanceClient, request.correlationId)(request, false);
          } else {
            throw e;
          }
        }
      }
      return invokeAsync(this.acquireTokenWithCachedRefreshToken.bind(this), PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken, this.logger, this.performanceClient, request.correlationId)(request, false);
    }
    /**
     * makes a network call to acquire tokens by exchanging RefreshToken available in userCache; throws if refresh token is not cached
     * @param request
     */
    async acquireTokenWithCachedRefreshToken(request, foci) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.RefreshTokenClientAcquireTokenWithCachedRefreshToken, request.correlationId);
      const refreshToken = invoke(this.cacheManager.getRefreshToken.bind(this.cacheManager), PerformanceEvents.CacheManagerGetRefreshToken, this.logger, this.performanceClient, request.correlationId)(request.account, foci, request.correlationId, void 0, this.performanceClient);
      if (!refreshToken) {
        throw createInteractionRequiredAuthError(noTokensFound);
      }
      if (refreshToken.expiresOn && isTokenExpired(refreshToken.expiresOn, request.refreshTokenExpirationOffsetSeconds || DEFAULT_REFRESH_TOKEN_EXPIRATION_OFFSET_SECONDS)) {
        throw createInteractionRequiredAuthError(refreshTokenExpired);
      }
      const refreshTokenRequest = {
        ...request,
        refreshToken: refreshToken.secret,
        authenticationScheme: request.authenticationScheme || AuthenticationScheme.BEARER,
        ccsCredential: {
          credential: request.account.homeAccountId,
          type: CcsCredentialType.HOME_ACCOUNT_ID
        }
      };
      try {
        return await invokeAsync(this.acquireToken.bind(this), PerformanceEvents.RefreshTokenClientAcquireToken, this.logger, this.performanceClient, request.correlationId)(refreshTokenRequest);
      } catch (e) {
        if (e instanceof InteractionRequiredAuthError && e.subError === badToken) {
          this.logger.verbose("acquireTokenWithRefreshToken: bad refresh token, removing from cache");
          const badRefreshTokenKey = generateCredentialKey(refreshToken);
          this.cacheManager.removeRefreshToken(badRefreshTokenKey, request.correlationId);
        }
        throw e;
      }
    }
    /**
     * Constructs the network message and makes a NW call to the underlying secure token service
     * @param request
     * @param authority
     */
    async executeTokenRequest(request, authority) {
      var _a, _b;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.RefreshTokenClientExecuteTokenRequest, request.correlationId);
      const queryParametersString = this.createTokenQueryParameters(request);
      const endpoint = UrlString.appendQueryString(authority.tokenEndpoint, queryParametersString);
      const requestBody = await invokeAsync(this.createTokenRequestBody.bind(this), PerformanceEvents.RefreshTokenClientCreateTokenRequestBody, this.logger, this.performanceClient, request.correlationId)(request);
      const headers = this.createTokenRequestHeaders(request.ccsCredential);
      const thumbprint = {
        clientId: ((_b = request.tokenBodyParameters) == null ? void 0 : _b.clientId) || this.config.authOptions.clientId,
        authority: authority.canonicalAuthority,
        scopes: request.scopes,
        claims: request.claims,
        authenticationScheme: request.authenticationScheme,
        resourceRequestMethod: request.resourceRequestMethod,
        resourceRequestUri: request.resourceRequestUri,
        shrClaims: request.shrClaims,
        sshKid: request.sshKid
      };
      return invokeAsync(this.executePostToTokenEndpoint.bind(this), PerformanceEvents.RefreshTokenClientExecutePostToTokenEndpoint, this.logger, this.performanceClient, request.correlationId)(endpoint, requestBody, headers, thumbprint, request.correlationId, PerformanceEvents.RefreshTokenClientExecutePostToTokenEndpoint);
    }
    /**
     * Helper function to create the token request body
     * @param request
     */
    async createTokenRequestBody(request) {
      var _a, _b, _c;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.RefreshTokenClientCreateTokenRequestBody, request.correlationId);
      const correlationId = request.correlationId;
      const parameterBuilder = new RequestParameterBuilder(correlationId, this.performanceClient);
      parameterBuilder.addClientId(request.embeddedClientId || ((_b = request.tokenBodyParameters) == null ? void 0 : _b[CLIENT_ID]) || this.config.authOptions.clientId);
      if (request.redirectUri) {
        parameterBuilder.addRedirectUri(request.redirectUri);
      }
      parameterBuilder.addScopes(request.scopes, true, (_c = this.config.authOptions.authority.options.OIDCOptions) == null ? void 0 : _c.defaultScopes);
      parameterBuilder.addGrantType(GrantType.REFRESH_TOKEN_GRANT);
      parameterBuilder.addClientInfo();
      parameterBuilder.addLibraryInfo(this.config.libraryInfo);
      parameterBuilder.addApplicationTelemetry(this.config.telemetry.application);
      parameterBuilder.addThrottling();
      if (this.serverTelemetryManager && !isOidcProtocolMode(this.config)) {
        parameterBuilder.addServerTelemetry(this.serverTelemetryManager);
      }
      parameterBuilder.addRefreshToken(request.refreshToken);
      if (this.config.clientCredentials.clientSecret) {
        parameterBuilder.addClientSecret(this.config.clientCredentials.clientSecret);
      }
      if (this.config.clientCredentials.clientAssertion) {
        const clientAssertion = this.config.clientCredentials.clientAssertion;
        parameterBuilder.addClientAssertion(await getClientAssertion(clientAssertion.assertion, this.config.authOptions.clientId, request.resourceRequestUri));
        parameterBuilder.addClientAssertionType(clientAssertion.assertionType);
      }
      if (request.authenticationScheme === AuthenticationScheme.POP) {
        const popTokenGenerator = new PopTokenGenerator(this.cryptoUtils, this.performanceClient);
        let reqCnfData;
        if (!request.popKid) {
          const generatedReqCnfData = await invokeAsync(popTokenGenerator.generateCnf.bind(popTokenGenerator), PerformanceEvents.PopTokenGenerateCnf, this.logger, this.performanceClient, request.correlationId)(request, this.logger);
          reqCnfData = generatedReqCnfData.reqCnfString;
        } else {
          reqCnfData = this.cryptoUtils.encodeKid(request.popKid);
        }
        parameterBuilder.addPopToken(reqCnfData);
      } else if (request.authenticationScheme === AuthenticationScheme.SSH) {
        if (request.sshJwk) {
          parameterBuilder.addSshJwk(request.sshJwk);
        } else {
          throw createClientConfigurationError(missingSshJwk);
        }
      }
      if (!StringUtils.isEmptyObj(request.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
        parameterBuilder.addClaims(request.claims, this.config.authOptions.clientCapabilities);
      }
      if (this.config.systemOptions.preventCorsPreflight && request.ccsCredential) {
        switch (request.ccsCredential.type) {
          case CcsCredentialType.HOME_ACCOUNT_ID:
            try {
              const clientInfo = buildClientInfoFromHomeAccountId(request.ccsCredential.credential);
              parameterBuilder.addCcsOid(clientInfo);
            } catch (e) {
              this.logger.verbose("Could not parse home account ID for CCS Header: " + e);
            }
            break;
          case CcsCredentialType.UPN:
            parameterBuilder.addCcsUpn(request.ccsCredential.credential);
            break;
        }
      }
      if (request.embeddedClientId) {
        parameterBuilder.addBrokerParameters({
          brokerClientId: this.config.authOptions.clientId,
          brokerRedirectUri: this.config.authOptions.redirectUri
        });
      }
      if (request.tokenBodyParameters) {
        parameterBuilder.addExtraQueryParameters(request.tokenBodyParameters);
      }
      return parameterBuilder.createQueryString();
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  class SilentFlowClient extends BaseClient {
    constructor(configuration, performanceClient) {
      super(configuration, performanceClient);
    }
    /**
     * Retrieves a token from cache if it is still valid, or uses the cached refresh token to renew
     * the given token and returns the renewed token
     * @param request
     */
    async acquireToken(request) {
      var _a;
      try {
        const [authResponse, cacheOutcome] = await this.acquireCachedToken({
          ...request,
          scopes: ((_a = request.scopes) == null ? void 0 : _a.length) ? request.scopes : [...OIDC_DEFAULT_SCOPES]
        });
        if (cacheOutcome === CacheOutcome.PROACTIVELY_REFRESHED) {
          this.logger.info("SilentFlowClient:acquireCachedToken - Cached access token's refreshOn property has been exceeded'. It's not expired, but must be refreshed.");
          const refreshTokenClient = new RefreshTokenClient(this.config, this.performanceClient);
          refreshTokenClient.acquireTokenByRefreshToken(request).catch(() => {
          });
        }
        return authResponse;
      } catch (e) {
        if (e instanceof ClientAuthError && e.errorCode === tokenRefreshRequired) {
          const refreshTokenClient = new RefreshTokenClient(this.config, this.performanceClient);
          return refreshTokenClient.acquireTokenByRefreshToken(request);
        } else {
          throw e;
        }
      }
    }
    /**
     * Retrieves token from cache or throws an error if it must be refreshed.
     * @param request
     */
    async acquireCachedToken(request) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.SilentFlowClientAcquireCachedToken, request.correlationId);
      let lastCacheOutcome = CacheOutcome.NOT_APPLICABLE;
      if (request.forceRefresh || !this.config.cacheOptions.claimsBasedCachingEnabled && !StringUtils.isEmptyObj(request.claims)) {
        this.setCacheOutcome(CacheOutcome.FORCE_REFRESH_OR_CLAIMS, request.correlationId);
        throw createClientAuthError(tokenRefreshRequired);
      }
      if (!request.account) {
        throw createClientAuthError(noAccountInSilentRequest);
      }
      const requestTenantId = request.account.tenantId || getTenantFromAuthorityString(request.authority);
      const tokenKeys = this.cacheManager.getTokenKeys();
      const cachedAccessToken = this.cacheManager.getAccessToken(request.account, request, tokenKeys, requestTenantId, this.performanceClient);
      if (!cachedAccessToken) {
        this.setCacheOutcome(CacheOutcome.NO_CACHED_ACCESS_TOKEN, request.correlationId);
        throw createClientAuthError(tokenRefreshRequired);
      } else if (wasClockTurnedBack(cachedAccessToken.cachedAt) || isTokenExpired(cachedAccessToken.expiresOn, this.config.systemOptions.tokenRenewalOffsetSeconds)) {
        this.setCacheOutcome(CacheOutcome.CACHED_ACCESS_TOKEN_EXPIRED, request.correlationId);
        throw createClientAuthError(tokenRefreshRequired);
      } else if (cachedAccessToken.refreshOn && isTokenExpired(cachedAccessToken.refreshOn, 0)) {
        lastCacheOutcome = CacheOutcome.PROACTIVELY_REFRESHED;
      }
      const environment = request.authority || this.authority.getPreferredCache();
      const cacheRecord = {
        account: this.cacheManager.readAccountFromCache(request.account, request.correlationId),
        accessToken: cachedAccessToken,
        idToken: this.cacheManager.getIdToken(request.account, request.correlationId, tokenKeys, requestTenantId, this.performanceClient),
        refreshToken: null,
        appMetadata: this.cacheManager.readAppMetadataFromCache(environment)
      };
      this.setCacheOutcome(lastCacheOutcome, request.correlationId);
      if (this.config.serverTelemetryManager) {
        this.config.serverTelemetryManager.incrementCacheHits();
      }
      return [
        await invokeAsync(this.generateResultFromCacheRecord.bind(this), PerformanceEvents.SilentFlowClientGenerateResultFromCacheRecord, this.logger, this.performanceClient, request.correlationId)(cacheRecord, request),
        lastCacheOutcome
      ];
    }
    setCacheOutcome(cacheOutcome, correlationId) {
      var _a, _b;
      (_a = this.serverTelemetryManager) == null ? void 0 : _a.setCacheOutcome(cacheOutcome);
      (_b = this.performanceClient) == null ? void 0 : _b.addFields({
        cacheOutcome
      }, correlationId);
      if (cacheOutcome !== CacheOutcome.NOT_APPLICABLE) {
        this.logger.info(`Token refresh is required due to cache outcome: ${cacheOutcome}`);
      }
    }
    /**
     * Helper function to build response object from the CacheRecord
     * @param cacheRecord
     */
    async generateResultFromCacheRecord(cacheRecord, request) {
      var _a;
      (_a = this.performanceClient) == null ? void 0 : _a.addQueueMeasurement(PerformanceEvents.SilentFlowClientGenerateResultFromCacheRecord, request.correlationId);
      let idTokenClaims;
      if (cacheRecord.idToken) {
        idTokenClaims = extractTokenClaims(cacheRecord.idToken.secret, this.config.cryptoInterface.base64Decode);
      }
      if (request.maxAge || request.maxAge === 0) {
        const authTime = idTokenClaims == null ? void 0 : idTokenClaims.auth_time;
        if (!authTime) {
          throw createClientAuthError(authTimeNotFound);
        }
        checkMaxAge(authTime, request.maxAge);
      }
      return ResponseHandler.generateAuthenticationResult(this.cryptoUtils, this.authority, cacheRecord, true, request, idTokenClaims);
    }
  }
  /*! @azure/msal-common v14.16.1 2025-08-05 */
  const skuGroupSeparator = ",";
  const skuValueSeparator = "|";
  function makeExtraSkuString(params) {
    const { skus, libraryName, libraryVersion, extensionName, extensionVersion } = params;
    const skuMap = /* @__PURE__ */ new Map([
      [0, [libraryName, libraryVersion]],
      [2, [extensionName, extensionVersion]]
    ]);
    let skuArr = [];
    if (skus == null ? void 0 : skus.length) {
      skuArr = skus.split(skuGroupSeparator);
      if (skuArr.length < 4) {
        return skus;
      }
    } else {
      skuArr = Array.from({ length: 4 }, () => skuValueSeparator);
    }
    skuMap.forEach((value, key) => {
      var _a, _b;
      if (value.length === 2 && ((_a = value[0]) == null ? void 0 : _a.length) && ((_b = value[1]) == null ? void 0 : _b.length)) {
        setSku({
          skuArr,
          index: key,
          skuName: value[0],
          skuVersion: value[1]
        });
      }
    });
    return skuArr.join(skuGroupSeparator);
  }
  function setSku(params) {
    const { skuArr, index, skuName, skuVersion } = params;
    if (index >= skuArr.length) {
      return;
    }
    skuArr[index] = [skuName, skuVersion].join(skuValueSeparator);
  }
  class ServerTelemetryManager {
    constructor(telemetryRequest, cacheManager) {
      this.cacheOutcome = CacheOutcome.NOT_APPLICABLE;
      this.cacheManager = cacheManager;
      this.apiId = telemetryRequest.apiId;
      this.correlationId = telemetryRequest.correlationId;
      this.wrapperSKU = telemetryRequest.wrapperSKU || Constants$1.EMPTY_STRING;
      this.wrapperVer = telemetryRequest.wrapperVer || Constants$1.EMPTY_STRING;
      this.telemetryCacheKey = SERVER_TELEM_CONSTANTS.CACHE_KEY + Separators.CACHE_KEY_SEPARATOR + telemetryRequest.clientId;
    }
    /**
     * API to add MSER Telemetry to request
     */
    generateCurrentRequestHeaderValue() {
      const request = `${this.apiId}${SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR}${this.cacheOutcome}`;
      const platformFieldsArr = [this.wrapperSKU, this.wrapperVer];
      const nativeBrokerErrorCode = this.getNativeBrokerErrorCode();
      if (nativeBrokerErrorCode == null ? void 0 : nativeBrokerErrorCode.length) {
        platformFieldsArr.push(`broker_error=${nativeBrokerErrorCode}`);
      }
      const platformFields = platformFieldsArr.join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
      const regionDiscoveryFields = this.getRegionDiscoveryFields();
      const requestWithRegionDiscoveryFields = [
        request,
        regionDiscoveryFields
      ].join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
      return [
        SERVER_TELEM_CONSTANTS.SCHEMA_VERSION,
        requestWithRegionDiscoveryFields,
        platformFields
      ].join(SERVER_TELEM_CONSTANTS.CATEGORY_SEPARATOR);
    }
    /**
     * API to add MSER Telemetry for the last failed request
     */
    generateLastRequestHeaderValue() {
      const lastRequests = this.getLastRequests();
      const maxErrors = ServerTelemetryManager.maxErrorsToSend(lastRequests);
      const failedRequests = lastRequests.failedRequests.slice(0, 2 * maxErrors).join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
      const errors = lastRequests.errors.slice(0, maxErrors).join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
      const errorCount = lastRequests.errors.length;
      const overflow = maxErrors < errorCount ? SERVER_TELEM_CONSTANTS.OVERFLOW_TRUE : SERVER_TELEM_CONSTANTS.OVERFLOW_FALSE;
      const platformFields = [errorCount, overflow].join(SERVER_TELEM_CONSTANTS.VALUE_SEPARATOR);
      return [
        SERVER_TELEM_CONSTANTS.SCHEMA_VERSION,
        lastRequests.cacheHits,
        failedRequests,
        errors,
        platformFields
      ].join(SERVER_TELEM_CONSTANTS.CATEGORY_SEPARATOR);
    }
    /**
     * API to cache token failures for MSER data capture
     * @param error
     */
    cacheFailedRequest(error2) {
      const lastRequests = this.getLastRequests();
      if (lastRequests.errors.length >= SERVER_TELEM_CONSTANTS.MAX_CACHED_ERRORS) {
        lastRequests.failedRequests.shift();
        lastRequests.failedRequests.shift();
        lastRequests.errors.shift();
      }
      lastRequests.failedRequests.push(this.apiId, this.correlationId);
      if (error2 instanceof Error && !!error2 && error2.toString()) {
        if (error2 instanceof AuthError) {
          if (error2.subError) {
            lastRequests.errors.push(error2.subError);
          } else if (error2.errorCode) {
            lastRequests.errors.push(error2.errorCode);
          } else {
            lastRequests.errors.push(error2.toString());
          }
        } else {
          lastRequests.errors.push(error2.toString());
        }
      } else {
        lastRequests.errors.push(SERVER_TELEM_CONSTANTS.UNKNOWN_ERROR);
      }
      this.cacheManager.setServerTelemetry(this.telemetryCacheKey, lastRequests, this.correlationId);
      return;
    }
    /**
     * Update server telemetry cache entry by incrementing cache hit counter
     */
    incrementCacheHits() {
      const lastRequests = this.getLastRequests();
      lastRequests.cacheHits += 1;
      this.cacheManager.setServerTelemetry(this.telemetryCacheKey, lastRequests, this.correlationId);
      return lastRequests.cacheHits;
    }
    /**
     * Get the server telemetry entity from cache or initialize a new one
     */
    getLastRequests() {
      const initialValue = {
        failedRequests: [],
        errors: [],
        cacheHits: 0
      };
      const lastRequests = this.cacheManager.getServerTelemetry(this.telemetryCacheKey);
      return lastRequests || initialValue;
    }
    /**
     * Remove server telemetry cache entry
     */
    clearTelemetryCache() {
      const lastRequests = this.getLastRequests();
      const numErrorsFlushed = ServerTelemetryManager.maxErrorsToSend(lastRequests);
      const errorCount = lastRequests.errors.length;
      if (numErrorsFlushed === errorCount) {
        this.cacheManager.removeItem(this.telemetryCacheKey, this.correlationId);
      } else {
        const serverTelemEntity = {
          failedRequests: lastRequests.failedRequests.slice(numErrorsFlushed * 2),
          errors: lastRequests.errors.slice(numErrorsFlushed),
          cacheHits: 0
        };
        this.cacheManager.setServerTelemetry(this.telemetryCacheKey, serverTelemEntity, this.correlationId);
      }
    }
    /**
     * Returns the maximum number of errors that can be flushed to the server in the next network request
     * @param serverTelemetryEntity
     */
    static maxErrorsToSend(serverTelemetryEntity) {
      let i;
      let maxErrors = 0;
      let dataSize = 0;
      const errorCount = serverTelemetryEntity.errors.length;
      for (i = 0; i < errorCount; i++) {
        const apiId = serverTelemetryEntity.failedRequests[2 * i] || Constants$1.EMPTY_STRING;
        const correlationId = serverTelemetryEntity.failedRequests[2 * i + 1] || Constants$1.EMPTY_STRING;
        const errorCode = serverTelemetryEntity.errors[i] || Constants$1.EMPTY_STRING;
        dataSize += apiId.toString().length + correlationId.toString().length + errorCode.length + 3;
        if (dataSize < SERVER_TELEM_CONSTANTS.MAX_LAST_HEADER_BYTES) {
          maxErrors += 1;
        } else {
          break;
        }
      }
      return maxErrors;
    }
    /**
     * Get the region discovery fields
     *
     * @returns string
     */
    getRegionDiscoveryFields() {
      const regionDiscoveryFields = [];
      regionDiscoveryFields.push(this.regionUsed || Constants$1.EMPTY_STRING);
      regionDiscoveryFields.push(this.regionSource || Constants$1.EMPTY_STRING);
      regionDiscoveryFields.push(this.regionOutcome || Constants$1.EMPTY_STRING);
      return regionDiscoveryFields.join(",");
    }
    /**
     * Update the region discovery metadata
     *
     * @param regionDiscoveryMetadata
     * @returns void
     */
    updateRegionDiscoveryMetadata(regionDiscoveryMetadata) {
      this.regionUsed = regionDiscoveryMetadata.region_used;
      this.regionSource = regionDiscoveryMetadata.region_source;
      this.regionOutcome = regionDiscoveryMetadata.region_outcome;
    }
    /**
     * Set cache outcome
     */
    setCacheOutcome(cacheOutcome) {
      this.cacheOutcome = cacheOutcome;
    }
    setNativeBrokerErrorCode(errorCode) {
      const lastRequests = this.getLastRequests();
      lastRequests.nativeBrokerErrorCode = errorCode;
      this.cacheManager.setServerTelemetry(this.telemetryCacheKey, lastRequests, this.correlationId);
    }
    getNativeBrokerErrorCode() {
      return this.getLastRequests().nativeBrokerErrorCode;
    }
    clearNativeBrokerErrorCode() {
      const lastRequests = this.getLastRequests();
      delete lastRequests.nativeBrokerErrorCode;
      this.cacheManager.setServerTelemetry(this.telemetryCacheKey, lastRequests, this.correlationId);
    }
    static makeExtraSkuString(params) {
      return makeExtraSkuString(params);
    }
  }
  class Deserializer {
    /**
     * Parse the JSON blob in memory and deserialize the content
     * @param cachedJson - JSON blob cache
     */
    static deserializeJSONBlob(jsonFile) {
      const deserializedCache = !jsonFile ? {} : JSON.parse(jsonFile);
      return deserializedCache;
    }
    /**
     * Deserializes accounts to AccountEntity objects
     * @param accounts - accounts of type SerializedAccountEntity
     */
    static deserializeAccounts(accounts) {
      const accountObjects = {};
      if (accounts) {
        Object.keys(accounts).map(function(key) {
          var _a;
          const serializedAcc = accounts[key];
          const mappedAcc = {
            homeAccountId: serializedAcc.home_account_id,
            environment: serializedAcc.environment,
            realm: serializedAcc.realm,
            localAccountId: serializedAcc.local_account_id,
            username: serializedAcc.username,
            authorityType: serializedAcc.authority_type,
            name: serializedAcc.name,
            clientInfo: serializedAcc.client_info,
            lastModificationTime: serializedAcc.last_modification_time,
            lastModificationApp: serializedAcc.last_modification_app,
            tenantProfiles: (_a = serializedAcc.tenantProfiles) == null ? void 0 : _a.map((serializedTenantProfile) => {
              return JSON.parse(serializedTenantProfile);
            })
          };
          const account = new AccountEntity();
          CacheManager.toObject(account, mappedAcc);
          accountObjects[key] = account;
        });
      }
      return accountObjects;
    }
    /**
     * Deserializes id tokens to IdTokenEntity objects
     * @param idTokens - credentials of type SerializedIdTokenEntity
     */
    static deserializeIdTokens(idTokens) {
      const idObjects = {};
      if (idTokens) {
        Object.keys(idTokens).map(function(key) {
          const serializedIdT = idTokens[key];
          const idToken = {
            homeAccountId: serializedIdT.home_account_id,
            environment: serializedIdT.environment,
            credentialType: serializedIdT.credential_type,
            clientId: serializedIdT.client_id,
            secret: serializedIdT.secret,
            realm: serializedIdT.realm
          };
          idObjects[key] = idToken;
        });
      }
      return idObjects;
    }
    /**
     * Deserializes access tokens to AccessTokenEntity objects
     * @param accessTokens - access tokens of type SerializedAccessTokenEntity
     */
    static deserializeAccessTokens(accessTokens) {
      const atObjects = {};
      if (accessTokens) {
        Object.keys(accessTokens).map(function(key) {
          const serializedAT = accessTokens[key];
          const accessToken = {
            homeAccountId: serializedAT.home_account_id,
            environment: serializedAT.environment,
            credentialType: serializedAT.credential_type,
            clientId: serializedAT.client_id,
            secret: serializedAT.secret,
            realm: serializedAT.realm,
            target: serializedAT.target,
            cachedAt: serializedAT.cached_at,
            expiresOn: serializedAT.expires_on,
            extendedExpiresOn: serializedAT.extended_expires_on,
            refreshOn: serializedAT.refresh_on,
            keyId: serializedAT.key_id,
            tokenType: serializedAT.token_type,
            requestedClaims: serializedAT.requestedClaims,
            requestedClaimsHash: serializedAT.requestedClaimsHash,
            userAssertionHash: serializedAT.userAssertionHash
          };
          atObjects[key] = accessToken;
        });
      }
      return atObjects;
    }
    /**
     * Deserializes refresh tokens to RefreshTokenEntity objects
     * @param refreshTokens - refresh tokens of type SerializedRefreshTokenEntity
     */
    static deserializeRefreshTokens(refreshTokens) {
      const rtObjects = {};
      if (refreshTokens) {
        Object.keys(refreshTokens).map(function(key) {
          const serializedRT = refreshTokens[key];
          const refreshToken = {
            homeAccountId: serializedRT.home_account_id,
            environment: serializedRT.environment,
            credentialType: serializedRT.credential_type,
            clientId: serializedRT.client_id,
            secret: serializedRT.secret,
            familyId: serializedRT.family_id,
            target: serializedRT.target,
            realm: serializedRT.realm
          };
          rtObjects[key] = refreshToken;
        });
      }
      return rtObjects;
    }
    /**
     * Deserializes appMetadata to AppMetaData objects
     * @param appMetadata - app metadata of type SerializedAppMetadataEntity
     */
    static deserializeAppMetadata(appMetadata) {
      const appMetadataObjects = {};
      if (appMetadata) {
        Object.keys(appMetadata).map(function(key) {
          const serializedAmdt = appMetadata[key];
          appMetadataObjects[key] = {
            clientId: serializedAmdt.client_id,
            environment: serializedAmdt.environment,
            familyId: serializedAmdt.family_id
          };
        });
      }
      return appMetadataObjects;
    }
    /**
     * Deserialize an inMemory Cache
     * @param jsonCache - JSON blob cache
     */
    static deserializeAllCache(jsonCache) {
      return {
        accounts: jsonCache.Account ? this.deserializeAccounts(jsonCache.Account) : {},
        idTokens: jsonCache.IdToken ? this.deserializeIdTokens(jsonCache.IdToken) : {},
        accessTokens: jsonCache.AccessToken ? this.deserializeAccessTokens(jsonCache.AccessToken) : {},
        refreshTokens: jsonCache.RefreshToken ? this.deserializeRefreshTokens(jsonCache.RefreshToken) : {},
        appMetadata: jsonCache.AppMetadata ? this.deserializeAppMetadata(jsonCache.AppMetadata) : {}
      };
    }
  }
  var internals = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    Deserializer,
    Serializer
  });
  const AUTHORIZATION_HEADER_NAME = "Authorization";
  const METADATA_HEADER_NAME = "Metadata";
  const APP_SERVICE_SECRET_HEADER_NAME = "X-IDENTITY-HEADER";
  const SERVICE_FABRIC_SECRET_HEADER_NAME = "secret";
  const API_VERSION_QUERY_PARAMETER_NAME = "api-version";
  const RESOURCE_BODY_OR_QUERY_PARAMETER_NAME = "resource";
  const DEFAULT_MANAGED_IDENTITY_ID = "system_assigned_managed_identity";
  const MANAGED_IDENTITY_DEFAULT_TENANT = "managed_identity";
  const DEFAULT_AUTHORITY_FOR_MANAGED_IDENTITY = `https://login.microsoftonline.com/${MANAGED_IDENTITY_DEFAULT_TENANT}/`;
  const ManagedIdentityEnvironmentVariableNames = {
    AZURE_POD_IDENTITY_AUTHORITY_HOST: "AZURE_POD_IDENTITY_AUTHORITY_HOST",
    IDENTITY_ENDPOINT: "IDENTITY_ENDPOINT",
    IDENTITY_HEADER: "IDENTITY_HEADER",
    IDENTITY_SERVER_THUMBPRINT: "IDENTITY_SERVER_THUMBPRINT",
    IMDS_ENDPOINT: "IMDS_ENDPOINT",
    MSI_ENDPOINT: "MSI_ENDPOINT"
  };
  const ManagedIdentitySourceNames = {
    APP_SERVICE: "AppService",
    AZURE_ARC: "AzureArc",
    CLOUD_SHELL: "CloudShell",
    DEFAULT_TO_IMDS: "DefaultToImds",
    IMDS: "Imds",
    SERVICE_FABRIC: "ServiceFabric"
  };
  const ManagedIdentityIdType = {
    SYSTEM_ASSIGNED: "system-assigned",
    USER_ASSIGNED_CLIENT_ID: "user-assigned-client-id",
    USER_ASSIGNED_RESOURCE_ID: "user-assigned-resource-id",
    USER_ASSIGNED_OBJECT_ID: "user-assigned-object-id"
  };
  const HttpMethod = {
    GET: "get",
    POST: "post"
  };
  const ProxyStatus = {
    SUCCESS_RANGE_START: HttpStatus.SUCCESS_RANGE_START,
    SUCCESS_RANGE_END: HttpStatus.SUCCESS_RANGE_END,
    SERVER_ERROR: HttpStatus.SERVER_ERROR
  };
  const REGION_ENVIRONMENT_VARIABLE = "REGION_NAME";
  const MSAL_FORCE_REGION = "MSAL_FORCE_REGION";
  const RANDOM_OCTET_SIZE = 32;
  const Hash = {
    SHA256: "sha256"
  };
  const CharSet = {
    CV_CHARSET: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  };
  const Constants2 = {
    MSAL_SKU: "msal.js.node",
    JWT_BEARER_ASSERTION_TYPE: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    AUTHORIZATION_PENDING: "authorization_pending",
    HTTP_PROTOCOL: "http://",
    LOCALHOST: "localhost"
  };
  const ApiId = {
    acquireTokenSilent: 62,
    acquireTokenByUsernamePassword: 371,
    acquireTokenByDeviceCode: 671,
    acquireTokenByClientCredential: 771,
    acquireTokenByCode: 871,
    acquireTokenByRefreshToken: 872
  };
  const JwtConstants = {
    RSA_256: "RS256",
    PSS_256: "PS256",
    X5T_256: "x5t#S256",
    X5T: "x5t",
    X5C: "x5c",
    AUDIENCE: "aud",
    EXPIRATION_TIME: "exp",
    ISSUER: "iss",
    SUBJECT: "sub",
    NOT_BEFORE: "nbf",
    JWT_ID: "jti"
  };
  const LOOPBACK_SERVER_CONSTANTS = {
    INTERVAL_MS: 100,
    TIMEOUT_MS: 5e3
  };
  const AZURE_ARC_SECRET_FILE_MAX_SIZE_BYTES = 4096;
  const MANAGED_IDENTITY_MAX_RETRIES = 3;
  const MANAGED_IDENTITY_RETRY_DELAY = 1e3;
  const MANAGED_IDENTITY_HTTP_STATUS_CODES_TO_RETRY_ON = [
    HttpStatus.NOT_FOUND,
    HttpStatus.REQUEST_TIMEOUT,
    HttpStatus.TOO_MANY_REQUESTS,
    HttpStatus.SERVER_ERROR,
    HttpStatus.SERVICE_UNAVAILABLE,
    HttpStatus.GATEWAY_TIMEOUT
  ];
  class NetworkUtils {
    static getNetworkResponse(headers, body, statusCode) {
      return {
        headers,
        body,
        status: statusCode
      };
    }
    /*
     * Utility function that converts a URL object into an ordinary options object as expected by the
     * http.request and https.request APIs.
     * https://github.com/nodejs/node/blob/main/lib/internal/url.js#L1090
     */
    static urlToHttpOptions(url) {
      const options = {
        protocol: url.protocol,
        hostname: url.hostname && url.hostname.startsWith("[") ? url.hostname.slice(1, -1) : url.hostname,
        hash: url.hash,
        search: url.search,
        pathname: url.pathname,
        path: `${url.pathname || ""}${url.search || ""}`,
        href: url.href
      };
      if (url.port !== "") {
        options.port = Number(url.port);
      }
      if (url.username || url.password) {
        options.auth = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`;
      }
      return options;
    }
  }
  class HttpClient {
    constructor(proxyUrl, customAgentOptions) {
      this.proxyUrl = proxyUrl || "";
      this.customAgentOptions = customAgentOptions || {};
    }
    /**
     * Http Get request
     * @param url
     * @param options
     */
    async sendGetRequestAsync(url, options, timeout) {
      if (this.proxyUrl) {
        return networkRequestViaProxy(url, this.proxyUrl, HttpMethod.GET, options, this.customAgentOptions, timeout);
      } else {
        return networkRequestViaHttps(url, HttpMethod.GET, options, this.customAgentOptions, timeout);
      }
    }
    /**
     * Http Post request
     * @param url
     * @param options
     */
    async sendPostRequestAsync(url, options) {
      if (this.proxyUrl) {
        return networkRequestViaProxy(url, this.proxyUrl, HttpMethod.POST, options, this.customAgentOptions);
      } else {
        return networkRequestViaHttps(url, HttpMethod.POST, options, this.customAgentOptions);
      }
    }
  }
  const networkRequestViaProxy = (destinationUrlString, proxyUrlString, httpMethod, options, agentOptions, timeout) => {
    const destinationUrl = new URL(destinationUrlString);
    const proxyUrl = new URL(proxyUrlString);
    const headers = (options == null ? void 0 : options.headers) || {};
    const tunnelRequestOptions = {
      host: proxyUrl.hostname,
      port: proxyUrl.port,
      method: "CONNECT",
      path: destinationUrl.hostname,
      headers
    };
    if (agentOptions && Object.keys(agentOptions).length) {
      tunnelRequestOptions.agent = new http.Agent(agentOptions);
    }
    let postRequestStringContent = "";
    if (httpMethod === HttpMethod.POST) {
      const body = (options == null ? void 0 : options.body) || "";
      postRequestStringContent = `Content-Type: application/x-www-form-urlencoded\r
Content-Length: ${body.length}\r
\r
${body}`;
    } else {
      if (timeout) {
        tunnelRequestOptions.timeout = timeout;
      }
    }
    const outgoingRequestString = `${httpMethod.toUpperCase()} ${destinationUrl.href} HTTP/1.1\r
Host: ${destinationUrl.host}\r
Connection: close\r
` + postRequestStringContent + "\r\n";
    return new Promise((resolve, reject) => {
      const request = http.request(tunnelRequestOptions);
      if (timeout) {
        request.on("timeout", () => {
          request.destroy();
          reject(new Error("Request time out"));
        });
      }
      request.end();
      request.on("connect", (response, socket) => {
        const proxyStatusCode = (response == null ? void 0 : response.statusCode) || ProxyStatus.SERVER_ERROR;
        if (proxyStatusCode < ProxyStatus.SUCCESS_RANGE_START || proxyStatusCode > ProxyStatus.SUCCESS_RANGE_END) {
          request.destroy();
          socket.destroy();
          reject(new Error(`Error connecting to proxy. Http status code: ${response.statusCode}. Http status message: ${(response == null ? void 0 : response.statusMessage) || "Unknown"}`));
        }
        socket.write(outgoingRequestString);
        const data = [];
        socket.on("data", (chunk) => {
          data.push(chunk);
        });
        socket.on("end", () => {
          const dataString = Buffer.concat([...data]).toString();
          const dataStringArray = dataString.split("\r\n");
          const httpStatusCode = parseInt(dataStringArray[0].split(" ")[1]);
          const statusMessage = dataStringArray[0].split(" ").slice(2).join(" ");
          const body = dataStringArray[dataStringArray.length - 1];
          const headersArray = dataStringArray.slice(1, dataStringArray.length - 2);
          const entries = /* @__PURE__ */ new Map();
          headersArray.forEach((header) => {
            const headerKeyValue = header.split(new RegExp(/:\s(.*)/s));
            const headerKey = headerKeyValue[0];
            let headerValue = headerKeyValue[1];
            try {
              const object = JSON.parse(headerValue);
              if (object && typeof object === "object") {
                headerValue = object;
              }
            } catch (e) {
            }
            entries.set(headerKey, headerValue);
          });
          const headers2 = Object.fromEntries(entries);
          const parsedHeaders = headers2;
          const networkResponse = NetworkUtils.getNetworkResponse(parsedHeaders, parseBody(httpStatusCode, statusMessage, parsedHeaders, body), httpStatusCode);
          if ((httpStatusCode < HttpStatus.SUCCESS_RANGE_START || httpStatusCode > HttpStatus.SUCCESS_RANGE_END) && // do not destroy the request for the device code flow
          networkResponse.body["error"] !== Constants2.AUTHORIZATION_PENDING) {
            request.destroy();
          }
          resolve(networkResponse);
        });
        socket.on("error", (chunk) => {
          request.destroy();
          socket.destroy();
          reject(new Error(chunk.toString()));
        });
      });
      request.on("error", (chunk) => {
        request.destroy();
        reject(new Error(chunk.toString()));
      });
    });
  };
  const networkRequestViaHttps = (urlString, httpMethod, options, agentOptions, timeout) => {
    const isPostRequest = httpMethod === HttpMethod.POST;
    const body = (options == null ? void 0 : options.body) || "";
    const url = new URL(urlString);
    const headers = (options == null ? void 0 : options.headers) || {};
    const customOptions = {
      method: httpMethod,
      headers,
      ...NetworkUtils.urlToHttpOptions(url)
    };
    if (agentOptions && Object.keys(agentOptions).length) {
      customOptions.agent = new https.Agent(agentOptions);
    }
    if (isPostRequest) {
      customOptions.headers = {
        ...customOptions.headers,
        "Content-Length": body.length
      };
    } else {
      if (timeout) {
        customOptions.timeout = timeout;
      }
    }
    return new Promise((resolve, reject) => {
      let request;
      if (customOptions.protocol === "http:") {
        request = http.request(customOptions);
      } else {
        request = https.request(customOptions);
      }
      if (isPostRequest) {
        request.write(body);
      }
      if (timeout) {
        request.on("timeout", () => {
          request.destroy();
          reject(new Error("Request time out"));
        });
      }
      request.end();
      request.on("response", (response) => {
        const headers2 = response.headers;
        const statusCode = response.statusCode;
        const statusMessage = response.statusMessage;
        const data = [];
        response.on("data", (chunk) => {
          data.push(chunk);
        });
        response.on("end", () => {
          const body2 = Buffer.concat([...data]).toString();
          const parsedHeaders = headers2;
          const networkResponse = NetworkUtils.getNetworkResponse(parsedHeaders, parseBody(statusCode, statusMessage, parsedHeaders, body2), statusCode);
          if ((statusCode < HttpStatus.SUCCESS_RANGE_START || statusCode > HttpStatus.SUCCESS_RANGE_END) && // do not destroy the request for the device code flow
          networkResponse.body["error"] !== Constants2.AUTHORIZATION_PENDING) {
            request.destroy();
          }
          resolve(networkResponse);
        });
      });
      request.on("error", (chunk) => {
        request.destroy();
        reject(new Error(chunk.toString()));
      });
    });
  };
  const parseBody = (statusCode, statusMessage, headers, body) => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (error2) {
      let errorType;
      let errorDescriptionHelper;
      if (statusCode >= HttpStatus.CLIENT_ERROR_RANGE_START && statusCode <= HttpStatus.CLIENT_ERROR_RANGE_END) {
        errorType = "client_error";
        errorDescriptionHelper = "A client";
      } else if (statusCode >= HttpStatus.SERVER_ERROR_RANGE_START && statusCode <= HttpStatus.SERVER_ERROR_RANGE_END) {
        errorType = "server_error";
        errorDescriptionHelper = "A server";
      } else {
        errorType = "unknown_error";
        errorDescriptionHelper = "An unknown";
      }
      parsedBody = {
        error: errorType,
        error_description: `${errorDescriptionHelper} error occured.
Http status code: ${statusCode}
Http status message: ${statusMessage || "Unknown"}
Headers: ${JSON.stringify(headers)}`
      };
    }
    return parsedBody;
  };
  const invalidFileExtension = "invalid_file_extension";
  const invalidFilePath = "invalid_file_path";
  const invalidManagedIdentityIdType = "invalid_managed_identity_id_type";
  const invalidSecret = "invalid_secret";
  const missingId = "missing_client_id";
  const networkUnavailable = "network_unavailable";
  const platformNotSupported = "platform_not_supported";
  const unableToCreateAzureArc = "unable_to_create_azure_arc";
  const unableToCreateCloudShell = "unable_to_create_cloud_shell";
  const unableToCreateSource = "unable_to_create_source";
  const unableToReadSecretFile = "unable_to_read_secret_file";
  const userAssignedNotAvailableAtRuntime = "user_assigned_not_available_at_runtime";
  const wwwAuthenticateHeaderMissing = "www_authenticate_header_missing";
  const wwwAuthenticateHeaderUnsupportedFormat = "www_authenticate_header_unsupported_format";
  const MsiEnvironmentVariableUrlMalformedErrorCodes = {
    [ManagedIdentityEnvironmentVariableNames.AZURE_POD_IDENTITY_AUTHORITY_HOST]: "azure_pod_identity_authority_host_url_malformed",
    [ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT]: "identity_endpoint_url_malformed",
    [ManagedIdentityEnvironmentVariableNames.IMDS_ENDPOINT]: "imds_endpoint_url_malformed",
    [ManagedIdentityEnvironmentVariableNames.MSI_ENDPOINT]: "msi_endpoint_url_malformed"
  };
  const ManagedIdentityErrorMessages = {
    [invalidFileExtension]: "The file path in the WWW-Authenticate header does not contain a .key file.",
    [invalidFilePath]: "The file path in the WWW-Authenticate header is not in a valid Windows or Linux Format.",
    [invalidManagedIdentityIdType]: "More than one ManagedIdentityIdType was provided.",
    [invalidSecret]: "The secret in the file on the file path in the WWW-Authenticate header is greater than 4096 bytes.",
    [platformNotSupported]: "The platform is not supported by Azure Arc. Azure Arc only supports Windows and Linux.",
    [missingId]: "A ManagedIdentityId id was not provided.",
    [MsiEnvironmentVariableUrlMalformedErrorCodes.AZURE_POD_IDENTITY_AUTHORITY_HOST]: `The Managed Identity's '${ManagedIdentityEnvironmentVariableNames.AZURE_POD_IDENTITY_AUTHORITY_HOST}' environment variable is malformed.`,
    [MsiEnvironmentVariableUrlMalformedErrorCodes.IDENTITY_ENDPOINT]: `The Managed Identity's '${ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT}' environment variable is malformed.`,
    [MsiEnvironmentVariableUrlMalformedErrorCodes.IMDS_ENDPOINT]: `The Managed Identity's '${ManagedIdentityEnvironmentVariableNames.IMDS_ENDPOINT}' environment variable is malformed.`,
    [MsiEnvironmentVariableUrlMalformedErrorCodes.MSI_ENDPOINT]: `The Managed Identity's '${ManagedIdentityEnvironmentVariableNames.MSI_ENDPOINT}' environment variable is malformed.`,
    [networkUnavailable]: "Authentication unavailable. The request to the managed identity endpoint timed out.",
    [unableToCreateAzureArc]: "Azure Arc Managed Identities can only be system assigned.",
    [unableToCreateCloudShell]: "Cloud Shell Managed Identities can only be system assigned.",
    [unableToCreateSource]: "Unable to create a Managed Identity source based on environment variables.",
    [unableToReadSecretFile]: "Unable to read the secret file.",
    [userAssignedNotAvailableAtRuntime]: "Service Fabric user assigned managed identity ClientId or ResourceId is not configurable at runtime.",
    [wwwAuthenticateHeaderMissing]: "A 401 response was received form the Azure Arc Managed Identity, but the www-authenticate header is missing.",
    [wwwAuthenticateHeaderUnsupportedFormat]: "A 401 response was received form the Azure Arc Managed Identity, but the www-authenticate header is in an unsupported format."
  };
  class ManagedIdentityError extends AuthError {
    constructor(errorCode) {
      super(errorCode, ManagedIdentityErrorMessages[errorCode]);
      this.name = "ManagedIdentityError";
      Object.setPrototypeOf(this, ManagedIdentityError.prototype);
    }
  }
  function createManagedIdentityError(errorCode) {
    return new ManagedIdentityError(errorCode);
  }
  class ManagedIdentityId {
    get id() {
      return this._id;
    }
    set id(value) {
      this._id = value;
    }
    get idType() {
      return this._idType;
    }
    set idType(value) {
      this._idType = value;
    }
    constructor(managedIdentityIdParams) {
      const userAssignedClientId = managedIdentityIdParams == null ? void 0 : managedIdentityIdParams.userAssignedClientId;
      const userAssignedResourceId = managedIdentityIdParams == null ? void 0 : managedIdentityIdParams.userAssignedResourceId;
      const userAssignedObjectId = managedIdentityIdParams == null ? void 0 : managedIdentityIdParams.userAssignedObjectId;
      if (userAssignedClientId) {
        if (userAssignedResourceId || userAssignedObjectId) {
          throw createManagedIdentityError(invalidManagedIdentityIdType);
        }
        this.id = userAssignedClientId;
        this.idType = ManagedIdentityIdType.USER_ASSIGNED_CLIENT_ID;
      } else if (userAssignedResourceId) {
        if (userAssignedClientId || userAssignedObjectId) {
          throw createManagedIdentityError(invalidManagedIdentityIdType);
        }
        this.id = userAssignedResourceId;
        this.idType = ManagedIdentityIdType.USER_ASSIGNED_RESOURCE_ID;
      } else if (userAssignedObjectId) {
        if (userAssignedClientId || userAssignedResourceId) {
          throw createManagedIdentityError(invalidManagedIdentityIdType);
        }
        this.id = userAssignedObjectId;
        this.idType = ManagedIdentityIdType.USER_ASSIGNED_OBJECT_ID;
      } else {
        this.id = DEFAULT_MANAGED_IDENTITY_ID;
        this.idType = ManagedIdentityIdType.SYSTEM_ASSIGNED;
      }
    }
  }
  class LinearRetryPolicy {
    constructor(maxRetries, retryDelay, httpStatusCodesToRetryOn) {
      this.maxRetries = maxRetries;
      this.retryDelay = retryDelay;
      this.httpStatusCodesToRetryOn = httpStatusCodesToRetryOn;
    }
    retryAfterMillisecondsToSleep(retryHeader) {
      if (!retryHeader) {
        return 0;
      }
      let millisToSleep = Math.round(parseFloat(retryHeader) * 1e3);
      if (isNaN(millisToSleep)) {
        millisToSleep = Math.max(
          0,
          // .valueOf() is needed to subtract dates in TypeScript
          new Date(retryHeader).valueOf() - (/* @__PURE__ */ new Date()).valueOf()
        );
      }
      return millisToSleep;
    }
    async pauseForRetry(httpStatusCode, currentRetry, retryAfterHeader) {
      if (this.httpStatusCodesToRetryOn.includes(httpStatusCode) && currentRetry < this.maxRetries) {
        const retryAfterDelay = this.retryAfterMillisecondsToSleep(retryAfterHeader);
        await new Promise((resolve) => {
          return setTimeout(resolve, retryAfterDelay || this.retryDelay);
        });
        return true;
      }
      return false;
    }
  }
  class HttpClientWithRetries {
    constructor(httpClientNoRetries, retryPolicy) {
      this.httpClientNoRetries = httpClientNoRetries;
      this.retryPolicy = retryPolicy;
    }
    async sendNetworkRequestAsyncHelper(httpMethod, url, options) {
      if (httpMethod === HttpMethod.GET) {
        return this.httpClientNoRetries.sendGetRequestAsync(url, options);
      } else {
        return this.httpClientNoRetries.sendPostRequestAsync(url, options);
      }
    }
    async sendNetworkRequestAsync(httpMethod, url, options) {
      let response = await this.sendNetworkRequestAsyncHelper(httpMethod, url, options);
      let currentRetry = 0;
      while (await this.retryPolicy.pauseForRetry(response.status, currentRetry, response.headers[HeaderNames.RETRY_AFTER])) {
        response = await this.sendNetworkRequestAsyncHelper(httpMethod, url, options);
        currentRetry++;
      }
      return response;
    }
    async sendGetRequestAsync(url, options) {
      return this.sendNetworkRequestAsync(HttpMethod.GET, url, options);
    }
    async sendPostRequestAsync(url, options) {
      return this.sendNetworkRequestAsync(HttpMethod.POST, url, options);
    }
  }
  const NodeAuthErrorMessage = {
    invalidLoopbackAddressType: {
      code: "invalid_loopback_server_address_type",
      desc: "Loopback server address is not type string. This is unexpected."
    },
    unableToLoadRedirectUri: {
      code: "unable_to_load_redirectUrl",
      desc: "Loopback server callback was invoked without a url. This is unexpected."
    },
    noAuthCodeInResponse: {
      code: "no_auth_code_in_response",
      desc: "No auth code found in the server response. Please check your network trace to determine what happened."
    },
    noLoopbackServerExists: {
      code: "no_loopback_server_exists",
      desc: "No loopback server exists yet."
    },
    loopbackServerAlreadyExists: {
      code: "loopback_server_already_exists",
      desc: "Loopback server already exists. Cannot create another."
    },
    loopbackServerTimeout: {
      code: "loopback_server_timeout",
      desc: "Timed out waiting for auth code listener to be registered."
    },
    stateNotFoundError: {
      code: "state_not_found",
      desc: "State not found. Please verify that the request originated from msal."
    },
    thumbprintMissing: {
      code: "thumbprint_missing_from_client_certificate",
      desc: "Client certificate does not contain a SHA-1 or SHA-256 thumbprint."
    }
  };
  class NodeAuthError extends AuthError {
    constructor(errorCode, errorMessage) {
      super(errorCode, errorMessage);
      this.name = "NodeAuthError";
    }
    /**
     * Creates an error thrown if loopback server address is of type string.
     */
    static createInvalidLoopbackAddressTypeError() {
      return new NodeAuthError(NodeAuthErrorMessage.invalidLoopbackAddressType.code, `${NodeAuthErrorMessage.invalidLoopbackAddressType.desc}`);
    }
    /**
     * Creates an error thrown if the loopback server is unable to get a url.
     */
    static createUnableToLoadRedirectUrlError() {
      return new NodeAuthError(NodeAuthErrorMessage.unableToLoadRedirectUri.code, `${NodeAuthErrorMessage.unableToLoadRedirectUri.desc}`);
    }
    /**
     * Creates an error thrown if the server response does not contain an auth code.
     */
    static createNoAuthCodeInResponseError() {
      return new NodeAuthError(NodeAuthErrorMessage.noAuthCodeInResponse.code, `${NodeAuthErrorMessage.noAuthCodeInResponse.desc}`);
    }
    /**
     * Creates an error thrown if the loopback server has not been spun up yet.
     */
    static createNoLoopbackServerExistsError() {
      return new NodeAuthError(NodeAuthErrorMessage.noLoopbackServerExists.code, `${NodeAuthErrorMessage.noLoopbackServerExists.desc}`);
    }
    /**
     * Creates an error thrown if a loopback server already exists when attempting to create another one.
     */
    static createLoopbackServerAlreadyExistsError() {
      return new NodeAuthError(NodeAuthErrorMessage.loopbackServerAlreadyExists.code, `${NodeAuthErrorMessage.loopbackServerAlreadyExists.desc}`);
    }
    /**
     * Creates an error thrown if the loopback server times out registering the auth code listener.
     */
    static createLoopbackServerTimeoutError() {
      return new NodeAuthError(NodeAuthErrorMessage.loopbackServerTimeout.code, `${NodeAuthErrorMessage.loopbackServerTimeout.desc}`);
    }
    /**
     * Creates an error thrown when the state is not present.
     */
    static createStateNotFoundError() {
      return new NodeAuthError(NodeAuthErrorMessage.stateNotFoundError.code, NodeAuthErrorMessage.stateNotFoundError.desc);
    }
    /**
     * Creates an error thrown when client certificate was provided, but neither the SHA-1 or SHA-256 thumbprints were provided
     */
    static createThumbprintMissingError() {
      return new NodeAuthError(NodeAuthErrorMessage.thumbprintMissing.code, NodeAuthErrorMessage.thumbprintMissing.desc);
    }
  }
  const DEFAULT_AUTH_OPTIONS = {
    clientId: Constants$1.EMPTY_STRING,
    authority: Constants$1.DEFAULT_AUTHORITY,
    clientSecret: Constants$1.EMPTY_STRING,
    clientAssertion: Constants$1.EMPTY_STRING,
    clientCertificate: {
      thumbprint: Constants$1.EMPTY_STRING,
      thumbprintSha256: Constants$1.EMPTY_STRING,
      privateKey: Constants$1.EMPTY_STRING,
      x5c: Constants$1.EMPTY_STRING
    },
    knownAuthorities: [],
    cloudDiscoveryMetadata: Constants$1.EMPTY_STRING,
    authorityMetadata: Constants$1.EMPTY_STRING,
    clientCapabilities: [],
    protocolMode: ProtocolMode.AAD,
    azureCloudOptions: {
      azureCloudInstance: AzureCloudInstance.None,
      tenant: Constants$1.EMPTY_STRING
    },
    skipAuthorityMetadataCache: false
  };
  const DEFAULT_CACHE_OPTIONS = {
    claimsBasedCachingEnabled: false
  };
  const DEFAULT_LOGGER_OPTIONS = {
    loggerCallback: () => {
    },
    piiLoggingEnabled: false,
    logLevel: exports.LogLevel.Info
  };
  const DEFAULT_SYSTEM_OPTIONS = {
    loggerOptions: DEFAULT_LOGGER_OPTIONS,
    networkClient: new HttpClient(),
    proxyUrl: Constants$1.EMPTY_STRING,
    customAgentOptions: {},
    disableInternalRetries: false
  };
  const DEFAULT_TELEMETRY_OPTIONS = {
    application: {
      appName: Constants$1.EMPTY_STRING,
      appVersion: Constants$1.EMPTY_STRING
    }
  };
  function buildAppConfiguration({ auth, broker, cache, system, telemetry }) {
    const systemOptions = {
      ...DEFAULT_SYSTEM_OPTIONS,
      networkClient: new HttpClient(system == null ? void 0 : system.proxyUrl, system == null ? void 0 : system.customAgentOptions),
      loggerOptions: (system == null ? void 0 : system.loggerOptions) || DEFAULT_LOGGER_OPTIONS,
      disableInternalRetries: (system == null ? void 0 : system.disableInternalRetries) || false
    };
    if (!!auth.clientCertificate && !!!auth.clientCertificate.thumbprint && !!!auth.clientCertificate.thumbprintSha256) {
      throw NodeAuthError.createStateNotFoundError();
    }
    return {
      auth: { ...DEFAULT_AUTH_OPTIONS, ...auth },
      broker: { ...broker },
      cache: { ...DEFAULT_CACHE_OPTIONS, ...cache },
      system: { ...systemOptions, ...system },
      telemetry: { ...DEFAULT_TELEMETRY_OPTIONS, ...telemetry }
    };
  }
  function buildManagedIdentityConfiguration({ managedIdentityIdParams, system }) {
    const managedIdentityId = new ManagedIdentityId(managedIdentityIdParams);
    const loggerOptions = (system == null ? void 0 : system.loggerOptions) || DEFAULT_LOGGER_OPTIONS;
    let networkClient;
    if (system == null ? void 0 : system.networkClient) {
      networkClient = system.networkClient;
    } else {
      networkClient = new HttpClient(system == null ? void 0 : system.proxyUrl, system == null ? void 0 : system.customAgentOptions);
    }
    if (!(system == null ? void 0 : system.disableInternalRetries)) {
      const linearRetryPolicy = new LinearRetryPolicy(MANAGED_IDENTITY_MAX_RETRIES, MANAGED_IDENTITY_RETRY_DELAY, MANAGED_IDENTITY_HTTP_STATUS_CODES_TO_RETRY_ON);
      networkClient = new HttpClientWithRetries(networkClient, linearRetryPolicy);
    }
    return {
      managedIdentityId,
      system: {
        loggerOptions,
        networkClient
      }
    };
  }
  class GuidGenerator {
    /**
     *
     * RFC4122: The version 4 UUID is meant for generating UUIDs from truly-random or pseudo-random numbers.
     * uuidv4 generates guids from cryprtographically-string random
     */
    generateGuid() {
      return uuid.v4();
    }
    /**
     * verifies if a string is  GUID
     * @param guid
     */
    isGuid(guid) {
      const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return regexGuid.test(guid);
    }
  }
  class EncodingUtils {
    /**
     * 'utf8': Multibyte encoded Unicode characters. Many web pages and other document formats use UTF-8.
     * 'base64': Base64 encoding.
     *
     * @param str text
     */
    static base64Encode(str, encoding) {
      return Buffer.from(str, encoding).toString("base64");
    }
    /**
     * encode a URL
     * @param str
     */
    static base64EncodeUrl(str, encoding) {
      return EncodingUtils.base64Encode(str, encoding).replace(/=/g, Constants$1.EMPTY_STRING).replace(/\+/g, "-").replace(/\//g, "_");
    }
    /**
     * 'utf8': Multibyte encoded Unicode characters. Many web pages and other document formats use UTF-8.
     * 'base64': Base64 encoding.
     *
     * @param base64Str Base64 encoded text
     */
    static base64Decode(base64Str) {
      return Buffer.from(base64Str, "base64").toString("utf8");
    }
    /**
     * @param base64Str Base64 encoded Url
     */
    static base64DecodeUrl(base64Str) {
      let str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
      while (str.length % 4) {
        str += "=";
      }
      return EncodingUtils.base64Decode(str);
    }
  }
  class HashUtils {
    /**
     * generate 'SHA256' hash
     * @param buffer
     */
    sha256(buffer) {
      return crypto2.createHash(Hash.SHA256).update(buffer).digest();
    }
  }
  class PkceGenerator {
    constructor() {
      this.hashUtils = new HashUtils();
    }
    /**
     * generates the codeVerfier and the challenge from the codeVerfier
     * reference: https://tools.ietf.org/html/rfc7636#section-4.1 and https://tools.ietf.org/html/rfc7636#section-4.2
     */
    async generatePkceCodes() {
      const verifier = this.generateCodeVerifier();
      const challenge = this.generateCodeChallengeFromVerifier(verifier);
      return { verifier, challenge };
    }
    /**
     * generates the codeVerfier; reference: https://tools.ietf.org/html/rfc7636#section-4.1
     */
    generateCodeVerifier() {
      const charArr = [];
      const maxNumber = 256 - 256 % CharSet.CV_CHARSET.length;
      while (charArr.length <= RANDOM_OCTET_SIZE) {
        const byte = crypto2.randomBytes(1)[0];
        if (byte >= maxNumber) {
          continue;
        }
        const index = byte % CharSet.CV_CHARSET.length;
        charArr.push(CharSet.CV_CHARSET[index]);
      }
      const verifier = charArr.join(Constants$1.EMPTY_STRING);
      return EncodingUtils.base64EncodeUrl(verifier);
    }
    /**
     * generate the challenge from the codeVerfier; reference: https://tools.ietf.org/html/rfc7636#section-4.2
     * @param codeVerifier
     */
    generateCodeChallengeFromVerifier(codeVerifier) {
      return EncodingUtils.base64EncodeUrl(this.hashUtils.sha256(codeVerifier).toString("base64"), "base64");
    }
  }
  class CryptoProvider {
    constructor() {
      this.pkceGenerator = new PkceGenerator();
      this.guidGenerator = new GuidGenerator();
      this.hashUtils = new HashUtils();
    }
    /**
     * base64 URL safe encoded string
     */
    base64UrlEncode() {
      throw new Error("Method not implemented.");
    }
    /**
     * Stringifies and base64Url encodes input public key
     * @param inputKid - public key id
     * @returns Base64Url encoded public key
     */
    encodeKid() {
      throw new Error("Method not implemented.");
    }
    /**
     * Creates a new random GUID - used to populate state and nonce.
     * @returns string (GUID)
     */
    createNewGuid() {
      return this.guidGenerator.generateGuid();
    }
    /**
     * Encodes input string to base64.
     * @param input - string to be encoded
     */
    base64Encode(input) {
      return EncodingUtils.base64Encode(input);
    }
    /**
     * Decodes input string from base64.
     * @param input - string to be decoded
     */
    base64Decode(input) {
      return EncodingUtils.base64Decode(input);
    }
    /**
     * Generates PKCE codes used in Authorization Code Flow.
     */
    generatePkceCodes() {
      return this.pkceGenerator.generatePkceCodes();
    }
    /**
     * Generates a keypair, stores it and returns a thumbprint - not yet implemented for node
     */
    getPublicKeyThumbprint() {
      throw new Error("Method not implemented.");
    }
    /**
     * Removes cryptographic keypair from key store matching the keyId passed in
     * @param kid - public key id
     */
    removeTokenBindingKey() {
      throw new Error("Method not implemented.");
    }
    /**
     * Removes all cryptographic keys from Keystore
     */
    clearKeystore() {
      throw new Error("Method not implemented.");
    }
    /**
     * Signs the given object as a jwt payload with private key retrieved by given kid - currently not implemented for node
     */
    signJwt() {
      throw new Error("Method not implemented.");
    }
    /**
     * Returns the SHA-256 hash of an input string
     */
    async hashString(plainText) {
      return EncodingUtils.base64EncodeUrl(this.hashUtils.sha256(plainText).toString("base64"), "base64");
    }
  }
  class NodeStorage extends CacheManager {
    constructor(logger, clientId, cryptoImpl, staticAuthorityOptions) {
      super(clientId, cryptoImpl, logger, staticAuthorityOptions);
      this.cache = {};
      this.changeEmitters = [];
      this.logger = logger;
    }
    /**
     * Queue up callbacks
     * @param func - a callback function for cache change indication
     */
    registerChangeEmitter(func) {
      this.changeEmitters.push(func);
    }
    /**
     * Invoke the callback when cache changes
     */
    emitChange() {
      this.changeEmitters.forEach((func) => func.call(null));
    }
    /**
     * Converts cacheKVStore to InMemoryCache
     * @param cache - key value store
     */
    cacheToInMemoryCache(cache) {
      const inMemoryCache = {
        accounts: {},
        idTokens: {},
        accessTokens: {},
        refreshTokens: {},
        appMetadata: {}
      };
      for (const key in cache) {
        const value = cache[key];
        if (typeof value !== "object") {
          continue;
        }
        if (value instanceof AccountEntity) {
          inMemoryCache.accounts[key] = value;
        } else if (isIdTokenEntity(value)) {
          inMemoryCache.idTokens[key] = value;
        } else if (isAccessTokenEntity(value)) {
          inMemoryCache.accessTokens[key] = value;
        } else if (isRefreshTokenEntity(value)) {
          inMemoryCache.refreshTokens[key] = value;
        } else if (isAppMetadataEntity(key, value)) {
          inMemoryCache.appMetadata[key] = value;
        } else {
          continue;
        }
      }
      return inMemoryCache;
    }
    /**
     * converts inMemoryCache to CacheKVStore
     * @param inMemoryCache - kvstore map for inmemory
     */
    inMemoryCacheToCache(inMemoryCache) {
      let cache = this.getCache();
      cache = {
        ...cache,
        ...inMemoryCache.accounts,
        ...inMemoryCache.idTokens,
        ...inMemoryCache.accessTokens,
        ...inMemoryCache.refreshTokens,
        ...inMemoryCache.appMetadata
      };
      return cache;
    }
    /**
     * gets the current in memory cache for the client
     */
    getInMemoryCache() {
      this.logger.trace("Getting in-memory cache");
      const inMemoryCache = this.cacheToInMemoryCache(this.getCache());
      return inMemoryCache;
    }
    /**
     * sets the current in memory cache for the client
     * @param inMemoryCache - key value map in memory
     */
    setInMemoryCache(inMemoryCache) {
      this.logger.trace("Setting in-memory cache");
      const cache = this.inMemoryCacheToCache(inMemoryCache);
      this.setCache(cache);
      this.emitChange();
    }
    /**
     * get the current cache key-value store
     */
    getCache() {
      this.logger.trace("Getting cache key-value store");
      return this.cache;
    }
    /**
     * sets the current cache (key value store)
     * @param cacheMap - key value map
     */
    setCache(cache) {
      this.logger.trace("Setting cache key value store");
      this.cache = cache;
      this.emitChange();
    }
    /**
     * Gets cache item with given key.
     * @param key - lookup key for the cache entry
     */
    getItem(key) {
      this.logger.tracePii(`Item key: ${key}`);
      const cache = this.getCache();
      return cache[key];
    }
    /**
     * Gets cache item with given key-value
     * @param key - lookup key for the cache entry
     * @param value - value of the cache entry
     */
    setItem(key, value) {
      this.logger.tracePii(`Item key: ${key}`);
      const cache = this.getCache();
      cache[key] = value;
      this.setCache(cache);
    }
    getAccountKeys() {
      const inMemoryCache = this.getInMemoryCache();
      const accountKeys = Object.keys(inMemoryCache.accounts);
      return accountKeys;
    }
    getTokenKeys() {
      const inMemoryCache = this.getInMemoryCache();
      const tokenKeys = {
        idToken: Object.keys(inMemoryCache.idTokens),
        accessToken: Object.keys(inMemoryCache.accessTokens),
        refreshToken: Object.keys(inMemoryCache.refreshTokens)
      };
      return tokenKeys;
    }
    /**
     * fetch the account entity
     * @param accountKey - lookup key to fetch cache type AccountEntity
     */
    getAccount(accountKey) {
      const accountEntity = this.getCachedAccountEntity(accountKey);
      if (accountEntity && AccountEntity.isAccountEntity(accountEntity)) {
        return this.updateOutdatedCachedAccount(accountKey, accountEntity, "");
      }
      return null;
    }
    /**
     * Reads account from cache, builds it into an account entity and returns it.
     * @param accountKey - lookup key to fetch cache type AccountEntity
     * @returns
     */
    getCachedAccountEntity(accountKey) {
      const cachedAccount = this.getItem(accountKey);
      return cachedAccount ? Object.assign(new AccountEntity(), this.getItem(accountKey)) : null;
    }
    /**
     * set account entity
     * @param account - cache value to be set of type AccountEntity
     */
    setAccount(account) {
      const accountKey = account.generateAccountKey();
      this.setItem(accountKey, account);
    }
    /**
     * fetch the idToken credential
     * @param idTokenKey - lookup key to fetch cache type IdTokenEntity
     */
    getIdTokenCredential(idTokenKey) {
      const idToken = this.getItem(idTokenKey);
      if (isIdTokenEntity(idToken)) {
        return idToken;
      }
      return null;
    }
    /**
     * set idToken credential
     * @param idToken - cache value to be set of type IdTokenEntity
     */
    setIdTokenCredential(idToken) {
      const idTokenKey = generateCredentialKey(idToken);
      this.setItem(idTokenKey, idToken);
    }
    /**
     * fetch the accessToken credential
     * @param accessTokenKey - lookup key to fetch cache type AccessTokenEntity
     */
    getAccessTokenCredential(accessTokenKey) {
      const accessToken = this.getItem(accessTokenKey);
      if (isAccessTokenEntity(accessToken)) {
        return accessToken;
      }
      return null;
    }
    /**
     * set accessToken credential
     * @param accessToken -  cache value to be set of type AccessTokenEntity
     */
    setAccessTokenCredential(accessToken) {
      const accessTokenKey = generateCredentialKey(accessToken);
      this.setItem(accessTokenKey, accessToken);
    }
    /**
     * fetch the refreshToken credential
     * @param refreshTokenKey - lookup key to fetch cache type RefreshTokenEntity
     */
    getRefreshTokenCredential(refreshTokenKey) {
      const refreshToken = this.getItem(refreshTokenKey);
      if (isRefreshTokenEntity(refreshToken)) {
        return refreshToken;
      }
      return null;
    }
    /**
     * set refreshToken credential
     * @param refreshToken - cache value to be set of type RefreshTokenEntity
     */
    setRefreshTokenCredential(refreshToken) {
      const refreshTokenKey = generateCredentialKey(refreshToken);
      this.setItem(refreshTokenKey, refreshToken);
    }
    /**
     * fetch appMetadata entity from the platform cache
     * @param appMetadataKey - lookup key to fetch cache type AppMetadataEntity
     */
    getAppMetadata(appMetadataKey) {
      const appMetadata = this.getItem(appMetadataKey);
      if (isAppMetadataEntity(appMetadataKey, appMetadata)) {
        return appMetadata;
      }
      return null;
    }
    /**
     * set appMetadata entity to the platform cache
     * @param appMetadata - cache value to be set of type AppMetadataEntity
     */
    setAppMetadata(appMetadata) {
      const appMetadataKey = generateAppMetadataKey(appMetadata);
      this.setItem(appMetadataKey, appMetadata);
    }
    /**
     * fetch server telemetry entity from the platform cache
     * @param serverTelemetrykey - lookup key to fetch cache type ServerTelemetryEntity
     */
    getServerTelemetry(serverTelemetrykey) {
      const serverTelemetryEntity = this.getItem(serverTelemetrykey);
      if (serverTelemetryEntity && isServerTelemetryEntity(serverTelemetrykey, serverTelemetryEntity)) {
        return serverTelemetryEntity;
      }
      return null;
    }
    /**
     * set server telemetry entity to the platform cache
     * @param serverTelemetryKey - lookup key to fetch cache type ServerTelemetryEntity
     * @param serverTelemetry - cache value to be set of type ServerTelemetryEntity
     */
    setServerTelemetry(serverTelemetryKey, serverTelemetry) {
      this.setItem(serverTelemetryKey, serverTelemetry);
    }
    /**
     * fetch authority metadata entity from the platform cache
     * @param key - lookup key to fetch cache type AuthorityMetadataEntity
     */
    getAuthorityMetadata(key) {
      const authorityMetadataEntity = this.getItem(key);
      if (authorityMetadataEntity && isAuthorityMetadataEntity(key, authorityMetadataEntity)) {
        return authorityMetadataEntity;
      }
      return null;
    }
    /**
     * Get all authority metadata keys
     */
    getAuthorityMetadataKeys() {
      return this.getKeys().filter((key) => {
        return this.isAuthorityMetadata(key);
      });
    }
    /**
     * set authority metadata entity to the platform cache
     * @param key - lookup key to fetch cache type AuthorityMetadataEntity
     * @param metadata - cache value to be set of type AuthorityMetadataEntity
     */
    setAuthorityMetadata(key, metadata) {
      this.setItem(key, metadata);
    }
    /**
     * fetch throttling entity from the platform cache
     * @param throttlingCacheKey - lookup key to fetch cache type ThrottlingEntity
     */
    getThrottlingCache(throttlingCacheKey) {
      const throttlingCache = this.getItem(throttlingCacheKey);
      if (throttlingCache && isThrottlingEntity(throttlingCacheKey, throttlingCache)) {
        return throttlingCache;
      }
      return null;
    }
    /**
     * set throttling entity to the platform cache
     * @param throttlingCacheKey - lookup key to fetch cache type ThrottlingEntity
     * @param throttlingCache - cache value to be set of type ThrottlingEntity
     */
    setThrottlingCache(throttlingCacheKey, throttlingCache) {
      this.setItem(throttlingCacheKey, throttlingCache);
    }
    /**
     * Removes the cache item from memory with the given key.
     * @param key - lookup key to remove a cache entity
     * @param inMemory - key value map of the cache
     */
    removeItem(key) {
      this.logger.tracePii(`Item key: ${key}`);
      let result = false;
      const cache = this.getCache();
      if (!!cache[key]) {
        delete cache[key];
        result = true;
      }
      if (result) {
        this.setCache(cache);
        this.emitChange();
      }
      return result;
    }
    /**
     * Remove account entity from the platform cache if it's outdated
     * @param accountKey - lookup key to fetch cache type AccountEntity
     */
    removeOutdatedAccount(accountKey) {
      this.removeItem(accountKey);
    }
    /**
     * Checks whether key is in cache.
     * @param key - look up key for a cache entity
     */
    containsKey(key) {
      return this.getKeys().includes(key);
    }
    /**
     * Gets all keys in window.
     */
    getKeys() {
      this.logger.trace("Retrieving all cache keys");
      const cache = this.getCache();
      return [...Object.keys(cache)];
    }
    /**
     * Clears all cache entries created by MSAL (except tokens).
     */
    clear() {
      this.logger.trace("Clearing cache entries created by MSAL");
      const cacheKeys = this.getKeys();
      cacheKeys.forEach((key) => {
        this.removeItem(key);
      });
      this.emitChange();
    }
    /**
     * Initialize in memory cache from an exisiting cache vault
     * @param cache - blob formatted cache (JSON)
     */
    static generateInMemoryCache(cache) {
      return Deserializer.deserializeAllCache(Deserializer.deserializeJSONBlob(cache));
    }
    /**
     * retrieves the final JSON
     * @param inMemoryCache - itemised cache read from the JSON
     */
    static generateJsonCache(inMemoryCache) {
      return Serializer.serializeAllCache(inMemoryCache);
    }
    /**
     * Updates a credential's cache key if the current cache key is outdated
     */
    updateCredentialCacheKey(currentCacheKey, credential) {
      const updatedCacheKey = generateCredentialKey(credential);
      if (currentCacheKey !== updatedCacheKey) {
        const cacheItem = this.getItem(currentCacheKey);
        if (cacheItem) {
          this.removeItem(currentCacheKey);
          this.setItem(updatedCacheKey, cacheItem);
          this.logger.verbose(`Updated an outdated ${credential.credentialType} cache key`);
          return updatedCacheKey;
        } else {
          this.logger.error(`Attempted to update an outdated ${credential.credentialType} cache key but no item matching the outdated key was found in storage`);
        }
      }
      return currentCacheKey;
    }
  }
  const defaultSerializedCache = {
    Account: {},
    IdToken: {},
    AccessToken: {},
    RefreshToken: {},
    AppMetadata: {}
  };
  class TokenCache {
    constructor(storage, logger, cachePlugin) {
      this.cacheHasChanged = false;
      this.storage = storage;
      this.storage.registerChangeEmitter(this.handleChangeEvent.bind(this));
      if (cachePlugin) {
        this.persistence = cachePlugin;
      }
      this.logger = logger;
    }
    /**
     * Set to true if cache state has changed since last time serialize or writeToPersistence was called
     */
    hasChanged() {
      return this.cacheHasChanged;
    }
    /**
     * Serializes in memory cache to JSON
     */
    serialize() {
      this.logger.trace("Serializing in-memory cache");
      let finalState = Serializer.serializeAllCache(this.storage.getInMemoryCache());
      if (this.cacheSnapshot) {
        this.logger.trace("Reading cache snapshot from disk");
        finalState = this.mergeState(JSON.parse(this.cacheSnapshot), finalState);
      } else {
        this.logger.trace("No cache snapshot to merge");
      }
      this.cacheHasChanged = false;
      return JSON.stringify(finalState);
    }
    /**
     * Deserializes JSON to in-memory cache. JSON should be in MSAL cache schema format
     * @param cache - blob formatted cache
     */
    deserialize(cache) {
      this.logger.trace("Deserializing JSON to in-memory cache");
      this.cacheSnapshot = cache;
      if (this.cacheSnapshot) {
        this.logger.trace("Reading cache snapshot from disk");
        const deserializedCache = Deserializer.deserializeAllCache(this.overlayDefaults(JSON.parse(this.cacheSnapshot)));
        this.storage.setInMemoryCache(deserializedCache);
      } else {
        this.logger.trace("No cache snapshot to deserialize");
      }
    }
    /**
     * Fetches the cache key-value map
     */
    getKVStore() {
      return this.storage.getCache();
    }
    /**
     * API that retrieves all accounts currently in cache to the user
     */
    async getAllAccounts(correlationId = new CryptoProvider().createNewGuid()) {
      this.logger.trace("getAllAccounts called");
      let cacheContext;
      try {
        if (this.persistence) {
          cacheContext = new TokenCacheContext(this, false);
          await this.persistence.beforeCacheAccess(cacheContext);
        }
        return this.storage.getAllAccounts(correlationId);
      } finally {
        if (this.persistence && cacheContext) {
          await this.persistence.afterCacheAccess(cacheContext);
        }
      }
    }
    /**
     * Returns the signed in account matching homeAccountId.
     * (the account object is created at the time of successful login)
     * or null when no matching account is found
     * @param homeAccountId - unique identifier for an account (uid.utid)
     */
    async getAccountByHomeId(homeAccountId) {
      const allAccounts = await this.getAllAccounts();
      if (homeAccountId && allAccounts && allAccounts.length) {
        return allAccounts.filter((accountObj) => accountObj.homeAccountId === homeAccountId)[0] || null;
      } else {
        return null;
      }
    }
    /**
     * Returns the signed in account matching localAccountId.
     * (the account object is created at the time of successful login)
     * or null when no matching account is found
     * @param localAccountId - unique identifier of an account (sub/obj when homeAccountId cannot be populated)
     */
    async getAccountByLocalId(localAccountId) {
      const allAccounts = await this.getAllAccounts();
      if (localAccountId && allAccounts && allAccounts.length) {
        return allAccounts.filter((accountObj) => accountObj.localAccountId === localAccountId)[0] || null;
      } else {
        return null;
      }
    }
    /**
     * API to remove a specific account and the relevant data from cache
     * @param account - AccountInfo passed by the user
     */
    async removeAccount(account, correlationId = new CryptoProvider().createNewGuid()) {
      this.logger.trace("removeAccount called");
      let cacheContext;
      try {
        if (this.persistence) {
          cacheContext = new TokenCacheContext(this, true);
          await this.persistence.beforeCacheAccess(cacheContext);
        }
        await this.storage.removeAccount(AccountEntity.generateAccountCacheKey(account), correlationId);
      } finally {
        if (this.persistence && cacheContext) {
          await this.persistence.afterCacheAccess(cacheContext);
        }
      }
    }
    /**
     * Called when the cache has changed state.
     */
    handleChangeEvent() {
      this.cacheHasChanged = true;
    }
    /**
     * Merge in memory cache with the cache snapshot.
     * @param oldState - cache before changes
     * @param currentState - current cache state in the library
     */
    mergeState(oldState, currentState) {
      this.logger.trace("Merging in-memory cache with cache snapshot");
      const stateAfterRemoval = this.mergeRemovals(oldState, currentState);
      return this.mergeUpdates(stateAfterRemoval, currentState);
    }
    /**
     * Deep update of oldState based on newState values
     * @param oldState - cache before changes
     * @param newState - updated cache
     */
    mergeUpdates(oldState, newState) {
      Object.keys(newState).forEach((newKey) => {
        const newValue = newState[newKey];
        if (!oldState.hasOwnProperty(newKey)) {
          if (newValue !== null) {
            oldState[newKey] = newValue;
          }
        } else {
          const newValueNotNull = newValue !== null;
          const newValueIsObject = typeof newValue === "object";
          const newValueIsNotArray = !Array.isArray(newValue);
          const oldStateNotUndefinedOrNull = typeof oldState[newKey] !== "undefined" && oldState[newKey] !== null;
          if (newValueNotNull && newValueIsObject && newValueIsNotArray && oldStateNotUndefinedOrNull) {
            this.mergeUpdates(oldState[newKey], newValue);
          } else {
            oldState[newKey] = newValue;
          }
        }
      });
      return oldState;
    }
    /**
     * Removes entities in oldState that the were removed from newState. If there are any unknown values in root of
     * oldState that are not recognized, they are left untouched.
     * @param oldState - cache before changes
     * @param newState - updated cache
     */
    mergeRemovals(oldState, newState) {
      this.logger.trace("Remove updated entries in cache");
      const accounts = oldState.Account ? this.mergeRemovalsDict(oldState.Account, newState.Account) : oldState.Account;
      const accessTokens = oldState.AccessToken ? this.mergeRemovalsDict(oldState.AccessToken, newState.AccessToken) : oldState.AccessToken;
      const refreshTokens = oldState.RefreshToken ? this.mergeRemovalsDict(oldState.RefreshToken, newState.RefreshToken) : oldState.RefreshToken;
      const idTokens = oldState.IdToken ? this.mergeRemovalsDict(oldState.IdToken, newState.IdToken) : oldState.IdToken;
      const appMetadata = oldState.AppMetadata ? this.mergeRemovalsDict(oldState.AppMetadata, newState.AppMetadata) : oldState.AppMetadata;
      return {
        ...oldState,
        Account: accounts,
        AccessToken: accessTokens,
        RefreshToken: refreshTokens,
        IdToken: idTokens,
        AppMetadata: appMetadata
      };
    }
    /**
     * Helper to merge new cache with the old one
     * @param oldState - cache before changes
     * @param newState - updated cache
     */
    mergeRemovalsDict(oldState, newState) {
      const finalState = { ...oldState };
      Object.keys(oldState).forEach((oldKey) => {
        if (!newState || !newState.hasOwnProperty(oldKey)) {
          delete finalState[oldKey];
        }
      });
      return finalState;
    }
    /**
     * Helper to overlay as a part of cache merge
     * @param passedInCache - cache read from the blob
     */
    overlayDefaults(passedInCache) {
      this.logger.trace("Overlaying input cache with the default cache");
      return {
        Account: {
          ...defaultSerializedCache.Account,
          ...passedInCache.Account
        },
        IdToken: {
          ...defaultSerializedCache.IdToken,
          ...passedInCache.IdToken
        },
        AccessToken: {
          ...defaultSerializedCache.AccessToken,
          ...passedInCache.AccessToken
        },
        RefreshToken: {
          ...defaultSerializedCache.RefreshToken,
          ...passedInCache.RefreshToken
        },
        AppMetadata: {
          ...defaultSerializedCache.AppMetadata,
          ...passedInCache.AppMetadata
        }
      };
    }
  }
  class ClientAssertion {
    /**
     * Initialize the ClientAssertion class from the clientAssertion passed by the user
     * @param assertion - refer https://tools.ietf.org/html/rfc7521
     */
    static fromAssertion(assertion) {
      const clientAssertion = new ClientAssertion();
      clientAssertion.jwt = assertion;
      return clientAssertion;
    }
    /**
     * @deprecated Use fromCertificateWithSha256Thumbprint instead, with a SHA-256 thumprint
     * Initialize the ClientAssertion class from the certificate passed by the user
     * @param thumbprint - identifier of a certificate
     * @param privateKey - secret key
     * @param publicCertificate - electronic document provided to prove the ownership of the public key
     */
    static fromCertificate(thumbprint, privateKey, publicCertificate) {
      const clientAssertion = new ClientAssertion();
      clientAssertion.privateKey = privateKey;
      clientAssertion.thumbprint = thumbprint;
      clientAssertion.useSha256 = false;
      if (publicCertificate) {
        clientAssertion.publicCertificate = this.parseCertificate(publicCertificate);
      }
      return clientAssertion;
    }
    /**
     * Initialize the ClientAssertion class from the certificate passed by the user
     * @param thumbprint - identifier of a certificate
     * @param privateKey - secret key
     * @param publicCertificate - electronic document provided to prove the ownership of the public key
     */
    static fromCertificateWithSha256Thumbprint(thumbprint, privateKey, publicCertificate) {
      const clientAssertion = new ClientAssertion();
      clientAssertion.privateKey = privateKey;
      clientAssertion.thumbprint = thumbprint;
      clientAssertion.useSha256 = true;
      if (publicCertificate) {
        clientAssertion.publicCertificate = this.parseCertificate(publicCertificate);
      }
      return clientAssertion;
    }
    /**
     * Update JWT for certificate based clientAssertion, if passed by the user, uses it as is
     * @param cryptoProvider - library's crypto helper
     * @param issuer - iss claim
     * @param jwtAudience - aud claim
     */
    getJwt(cryptoProvider, issuer, jwtAudience) {
      if (this.privateKey && this.thumbprint) {
        if (this.jwt && !this.isExpired() && issuer === this.issuer && jwtAudience === this.jwtAudience) {
          return this.jwt;
        }
        return this.createJwt(cryptoProvider, issuer, jwtAudience);
      }
      if (this.jwt) {
        return this.jwt;
      }
      throw createClientAuthError(invalidAssertion);
    }
    /**
     * JWT format and required claims specified: https://tools.ietf.org/html/rfc7523#section-3
     */
    createJwt(cryptoProvider, issuer, jwtAudience) {
      this.issuer = issuer;
      this.jwtAudience = jwtAudience;
      const issuedAt = nowSeconds();
      this.expirationTime = issuedAt + 600;
      const algorithm = this.useSha256 ? JwtConstants.PSS_256 : JwtConstants.RSA_256;
      const header = {
        alg: algorithm
      };
      const thumbprintHeader = this.useSha256 ? JwtConstants.X5T_256 : JwtConstants.X5T;
      Object.assign(header, {
        [thumbprintHeader]: EncodingUtils.base64EncodeUrl(this.thumbprint, "hex")
      });
      if (this.publicCertificate) {
        Object.assign(header, {
          [JwtConstants.X5C]: this.publicCertificate
        });
      }
      const payload = {
        [JwtConstants.AUDIENCE]: this.jwtAudience,
        [JwtConstants.EXPIRATION_TIME]: this.expirationTime,
        [JwtConstants.ISSUER]: this.issuer,
        [JwtConstants.SUBJECT]: this.issuer,
        [JwtConstants.NOT_BEFORE]: issuedAt,
        [JwtConstants.JWT_ID]: cryptoProvider.createNewGuid()
      };
      this.jwt = jwt.sign(payload, this.privateKey, { header });
      return this.jwt;
    }
    /**
     * Utility API to check expiration
     */
    isExpired() {
      return this.expirationTime < nowSeconds();
    }
    /**
     * Extracts the raw certs from a given certificate string and returns them in an array.
     * @param publicCertificate - electronic document provided to prove the ownership of the public key
     */
    static parseCertificate(publicCertificate) {
      const regexToFindCerts = /-----BEGIN CERTIFICATE-----\r*\n(.+?)\r*\n-----END CERTIFICATE-----/gs;
      const certs = [];
      let matches;
      while ((matches = regexToFindCerts.exec(publicCertificate)) !== null) {
        certs.push(matches[1].replace(/\r*\n/g, Constants$1.EMPTY_STRING));
      }
      return certs;
    }
  }
  const name = "@azure/msal-node";
  const version2 = "2.16.3";
  class UsernamePasswordClient extends BaseClient {
    constructor(configuration) {
      super(configuration);
    }
    /**
     * API to acquire a token by passing the username and password to the service in exchage of credentials
     * password_grant
     * @param request - CommonUsernamePasswordRequest
     */
    async acquireToken(request) {
      this.logger.info("in acquireToken call in username-password client");
      const reqTimestamp = nowSeconds();
      const response = await this.executeTokenRequest(this.authority, request);
      const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin);
      responseHandler.validateTokenResponse(response.body);
      const tokenResponse = responseHandler.handleServerTokenResponse(response.body, this.authority, reqTimestamp, request);
      return tokenResponse;
    }
    /**
     * Executes POST request to token endpoint
     * @param authority - authority object
     * @param request - CommonUsernamePasswordRequest provided by the developer
     */
    async executeTokenRequest(authority, request) {
      const queryParametersString = this.createTokenQueryParameters(request);
      const endpoint = UrlString.appendQueryString(authority.tokenEndpoint, queryParametersString);
      const requestBody = await this.createTokenRequestBody(request);
      const headers = this.createTokenRequestHeaders({
        credential: request.username,
        type: CcsCredentialType.UPN
      });
      const thumbprint = {
        clientId: this.config.authOptions.clientId,
        authority: authority.canonicalAuthority,
        scopes: request.scopes,
        claims: request.claims,
        authenticationScheme: request.authenticationScheme,
        resourceRequestMethod: request.resourceRequestMethod,
        resourceRequestUri: request.resourceRequestUri,
        shrClaims: request.shrClaims,
        sshKid: request.sshKid
      };
      return this.executePostToTokenEndpoint(endpoint, requestBody, headers, thumbprint, request.correlationId);
    }
    /**
     * Generates a map for all the params to be sent to the service
     * @param request - CommonUsernamePasswordRequest provided by the developer
     */
    async createTokenRequestBody(request) {
      const parameterBuilder = new RequestParameterBuilder();
      parameterBuilder.addClientId(this.config.authOptions.clientId);
      parameterBuilder.addUsername(request.username);
      parameterBuilder.addPassword(request.password);
      parameterBuilder.addScopes(request.scopes);
      parameterBuilder.addResponseTypeForTokenAndIdToken();
      parameterBuilder.addGrantType(GrantType.RESOURCE_OWNER_PASSWORD_GRANT);
      parameterBuilder.addClientInfo();
      parameterBuilder.addLibraryInfo(this.config.libraryInfo);
      parameterBuilder.addApplicationTelemetry(this.config.telemetry.application);
      parameterBuilder.addThrottling();
      if (this.serverTelemetryManager) {
        parameterBuilder.addServerTelemetry(this.serverTelemetryManager);
      }
      const correlationId = request.correlationId || this.config.cryptoInterface.createNewGuid();
      parameterBuilder.addCorrelationId(correlationId);
      if (this.config.clientCredentials.clientSecret) {
        parameterBuilder.addClientSecret(this.config.clientCredentials.clientSecret);
      }
      const clientAssertion = this.config.clientCredentials.clientAssertion;
      if (clientAssertion) {
        parameterBuilder.addClientAssertion(await getClientAssertion(clientAssertion.assertion, this.config.authOptions.clientId, request.resourceRequestUri));
        parameterBuilder.addClientAssertionType(clientAssertion.assertionType);
      }
      if (!StringUtils.isEmptyObj(request.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
        parameterBuilder.addClaims(request.claims, this.config.authOptions.clientCapabilities);
      }
      if (this.config.systemOptions.preventCorsPreflight && request.username) {
        parameterBuilder.addCcsUpn(request.username);
      }
      return parameterBuilder.createQueryString();
    }
  }
  class ClientApplication {
    /**
     * Constructor for the ClientApplication
     */
    constructor(configuration) {
      this.config = buildAppConfiguration(configuration);
      this.cryptoProvider = new CryptoProvider();
      this.logger = new Logger(this.config.system.loggerOptions, name, version2);
      this.storage = new NodeStorage(this.logger, this.config.auth.clientId, this.cryptoProvider, buildStaticAuthorityOptions(this.config.auth));
      this.tokenCache = new TokenCache(this.storage, this.logger, this.config.cache.cachePlugin);
    }
    /**
     * Creates the URL of the authorization request, letting the user input credentials and consent to the
     * application. The URL targets the /authorize endpoint of the authority configured in the
     * application object.
     *
     * Once the user inputs their credentials and consents, the authority will send a response to the redirect URI
     * sent in the request and should contain an authorization code, which can then be used to acquire tokens via
     * `acquireTokenByCode(AuthorizationCodeRequest)`.
     */
    async getAuthCodeUrl(request) {
      this.logger.info("getAuthCodeUrl called", request.correlationId);
      const validRequest = {
        ...request,
        ...await this.initializeBaseRequest(request),
        responseMode: request.responseMode || ResponseMode.QUERY,
        authenticationScheme: AuthenticationScheme.BEARER
      };
      const authClientConfig = await this.buildOauthClientConfiguration(validRequest.authority, validRequest.correlationId, validRequest.redirectUri, void 0, void 0, request.azureCloudOptions);
      const authorizationCodeClient = new AuthorizationCodeClient(authClientConfig);
      this.logger.verbose("Auth code client created", validRequest.correlationId);
      return authorizationCodeClient.getAuthCodeUrl(validRequest);
    }
    /**
     * Acquires a token by exchanging the Authorization Code received from the first step of OAuth2.0
     * Authorization Code flow.
     *
     * `getAuthCodeUrl(AuthorizationCodeUrlRequest)` can be used to create the URL for the first step of OAuth2.0
     * Authorization Code flow. Ensure that values for redirectUri and scopes in AuthorizationCodeUrlRequest and
     * AuthorizationCodeRequest are the same.
     */
    async acquireTokenByCode(request, authCodePayLoad) {
      this.logger.info("acquireTokenByCode called");
      if (request.state && authCodePayLoad) {
        this.logger.info("acquireTokenByCode - validating state");
        this.validateState(request.state, authCodePayLoad.state || "");
        authCodePayLoad = { ...authCodePayLoad, state: "" };
      }
      const validRequest = {
        ...request,
        ...await this.initializeBaseRequest(request),
        authenticationScheme: AuthenticationScheme.BEARER
      };
      const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenByCode, validRequest.correlationId);
      try {
        const authClientConfig = await this.buildOauthClientConfiguration(validRequest.authority, validRequest.correlationId, validRequest.redirectUri, serverTelemetryManager, void 0, request.azureCloudOptions);
        const authorizationCodeClient = new AuthorizationCodeClient(authClientConfig);
        this.logger.verbose("Auth code client created", validRequest.correlationId);
        return await authorizationCodeClient.acquireToken(validRequest, authCodePayLoad);
      } catch (e) {
        if (e instanceof AuthError) {
          e.setCorrelationId(validRequest.correlationId);
        }
        serverTelemetryManager.cacheFailedRequest(e);
        throw e;
      }
    }
    /**
     * Acquires a token by exchanging the refresh token provided for a new set of tokens.
     *
     * This API is provided only for scenarios where you would like to migrate from ADAL to MSAL. Otherwise, it is
     * recommended that you use `acquireTokenSilent()` for silent scenarios. When using `acquireTokenSilent()`, MSAL will
     * handle the caching and refreshing of tokens automatically.
     */
    async acquireTokenByRefreshToken(request) {
      this.logger.info("acquireTokenByRefreshToken called", request.correlationId);
      const validRequest = {
        ...request,
        ...await this.initializeBaseRequest(request),
        authenticationScheme: AuthenticationScheme.BEARER
      };
      const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenByRefreshToken, validRequest.correlationId);
      try {
        const refreshTokenClientConfig = await this.buildOauthClientConfiguration(validRequest.authority, validRequest.correlationId, validRequest.redirectUri || "", serverTelemetryManager, void 0, request.azureCloudOptions);
        const refreshTokenClient = new RefreshTokenClient(refreshTokenClientConfig);
        this.logger.verbose("Refresh token client created", validRequest.correlationId);
        return await refreshTokenClient.acquireToken(validRequest);
      } catch (e) {
        if (e instanceof AuthError) {
          e.setCorrelationId(validRequest.correlationId);
        }
        serverTelemetryManager.cacheFailedRequest(e);
        throw e;
      }
    }
    /**
     * Acquires a token silently when a user specifies the account the token is requested for.
     *
     * This API expects the user to provide an account object and looks into the cache to retrieve the token if present.
     * There is also an optional "forceRefresh" boolean the user can send to bypass the cache for access_token and id_token.
     * In case the refresh_token is expired or not found, an error is thrown
     * and the guidance is for the user to call any interactive token acquisition API (eg: `acquireTokenByCode()`).
     */
    async acquireTokenSilent(request) {
      const validRequest = {
        ...request,
        ...await this.initializeBaseRequest(request),
        forceRefresh: request.forceRefresh || false
      };
      const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenSilent, validRequest.correlationId, validRequest.forceRefresh);
      try {
        const silentFlowClientConfig = await this.buildOauthClientConfiguration(validRequest.authority, validRequest.correlationId, validRequest.redirectUri || "", serverTelemetryManager, void 0, request.azureCloudOptions);
        const silentFlowClient = new SilentFlowClient(silentFlowClientConfig);
        this.logger.verbose("Silent flow client created", validRequest.correlationId);
        return await silentFlowClient.acquireToken(validRequest);
      } catch (e) {
        if (e instanceof AuthError) {
          e.setCorrelationId(validRequest.correlationId);
        }
        serverTelemetryManager.cacheFailedRequest(e);
        throw e;
      }
    }
    /**
     * Acquires tokens with password grant by exchanging client applications username and password for credentials
     *
     * The latest OAuth 2.0 Security Best Current Practice disallows the password grant entirely.
     * More details on this recommendation at https://tools.ietf.org/html/draft-ietf-oauth-security-topics-13#section-3.4
     * Microsoft's documentation and recommendations are at:
     * https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-authentication-flows#usernamepassword
     *
     * @param request - UsenamePasswordRequest
     */
    async acquireTokenByUsernamePassword(request) {
      this.logger.info("acquireTokenByUsernamePassword called", request.correlationId);
      const validRequest = {
        ...request,
        ...await this.initializeBaseRequest(request)
      };
      const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenByUsernamePassword, validRequest.correlationId);
      try {
        const usernamePasswordClientConfig = await this.buildOauthClientConfiguration(validRequest.authority, validRequest.correlationId, "", serverTelemetryManager, void 0, request.azureCloudOptions);
        const usernamePasswordClient = new UsernamePasswordClient(usernamePasswordClientConfig);
        this.logger.verbose("Username password client created", validRequest.correlationId);
        return await usernamePasswordClient.acquireToken(validRequest);
      } catch (e) {
        if (e instanceof AuthError) {
          e.setCorrelationId(validRequest.correlationId);
        }
        serverTelemetryManager.cacheFailedRequest(e);
        throw e;
      }
    }
    /**
     * Gets the token cache for the application.
     */
    getTokenCache() {
      this.logger.info("getTokenCache called");
      return this.tokenCache;
    }
    /**
     * Validates OIDC state by comparing the user cached state with the state received from the server.
     *
     * This API is provided for scenarios where you would use OAuth2.0 state parameter to mitigate against
     * CSRF attacks.
     * For more information about state, visit https://datatracker.ietf.org/doc/html/rfc6819#section-3.6.
     * @param state - Unique GUID generated by the user that is cached by the user and sent to the server during the first leg of the flow
     * @param cachedState - This string is sent back by the server with the authorization code
     */
    validateState(state, cachedState) {
      if (!state) {
        throw NodeAuthError.createStateNotFoundError();
      }
      if (state !== cachedState) {
        throw createClientAuthError(stateMismatch);
      }
    }
    /**
     * Returns the logger instance
     */
    getLogger() {
      return this.logger;
    }
    /**
     * Replaces the default logger set in configurations with new Logger with new configurations
     * @param logger - Logger instance
     */
    setLogger(logger) {
      this.logger = logger;
    }
    /**
     * Builds the common configuration to be passed to the common component based on the platform configurarion
     * @param authority - user passed authority in configuration
     * @param serverTelemetryManager - initializes servertelemetry if passed
     */
    async buildOauthClientConfiguration(authority, requestCorrelationId, redirectUri, serverTelemetryManager, azureRegionConfiguration, azureCloudOptions) {
      this.logger.verbose("buildOauthClientConfiguration called", requestCorrelationId);
      const userAzureCloudOptions = azureCloudOptions ? azureCloudOptions : this.config.auth.azureCloudOptions;
      const discoveredAuthority = await this.createAuthority(authority, requestCorrelationId, azureRegionConfiguration, userAzureCloudOptions);
      this.logger.info(`Building oauth client configuration with the following authority: ${discoveredAuthority.tokenEndpoint}.`, requestCorrelationId);
      serverTelemetryManager == null ? void 0 : serverTelemetryManager.updateRegionDiscoveryMetadata(discoveredAuthority.regionDiscoveryMetadata);
      const clientConfiguration = {
        authOptions: {
          clientId: this.config.auth.clientId,
          authority: discoveredAuthority,
          clientCapabilities: this.config.auth.clientCapabilities,
          redirectUri
        },
        loggerOptions: {
          logLevel: this.config.system.loggerOptions.logLevel,
          loggerCallback: this.config.system.loggerOptions.loggerCallback,
          piiLoggingEnabled: this.config.system.loggerOptions.piiLoggingEnabled,
          correlationId: requestCorrelationId
        },
        cacheOptions: {
          claimsBasedCachingEnabled: this.config.cache.claimsBasedCachingEnabled
        },
        cryptoInterface: this.cryptoProvider,
        networkInterface: this.config.system.networkClient,
        storageInterface: this.storage,
        serverTelemetryManager,
        clientCredentials: {
          clientSecret: this.clientSecret,
          clientAssertion: await this.getClientAssertion(discoveredAuthority)
        },
        libraryInfo: {
          sku: Constants2.MSAL_SKU,
          version: version2,
          cpu: process.arch || Constants$1.EMPTY_STRING,
          os: process.platform || Constants$1.EMPTY_STRING
        },
        telemetry: this.config.telemetry,
        persistencePlugin: this.config.cache.cachePlugin,
        serializableCache: this.tokenCache
      };
      return clientConfiguration;
    }
    async getClientAssertion(authority) {
      if (this.developerProvidedClientAssertion) {
        this.clientAssertion = ClientAssertion.fromAssertion(await getClientAssertion(this.developerProvidedClientAssertion, this.config.auth.clientId, authority.tokenEndpoint));
      }
      return this.clientAssertion && {
        assertion: this.clientAssertion.getJwt(this.cryptoProvider, this.config.auth.clientId, authority.tokenEndpoint),
        assertionType: Constants2.JWT_BEARER_ASSERTION_TYPE
      };
    }
    /**
     * Generates a request with the default scopes & generates a correlationId.
     * @param authRequest - BaseAuthRequest for initialization
     */
    async initializeBaseRequest(authRequest) {
      this.logger.verbose("initializeRequestScopes called", authRequest.correlationId);
      if (authRequest.authenticationScheme && authRequest.authenticationScheme === AuthenticationScheme.POP) {
        this.logger.verbose("Authentication Scheme 'pop' is not supported yet, setting Authentication Scheme to 'Bearer' for request", authRequest.correlationId);
      }
      authRequest.authenticationScheme = AuthenticationScheme.BEARER;
      if (this.config.cache.claimsBasedCachingEnabled && authRequest.claims && // Checks for empty stringified object "{}" which doesn't qualify as requested claims
      !StringUtils.isEmptyObj(authRequest.claims)) {
        authRequest.requestedClaimsHash = await this.cryptoProvider.hashString(authRequest.claims);
      }
      return {
        ...authRequest,
        scopes: [
          ...authRequest && authRequest.scopes || [],
          ...OIDC_DEFAULT_SCOPES
        ],
        correlationId: authRequest && authRequest.correlationId || this.cryptoProvider.createNewGuid(),
        authority: authRequest.authority || this.config.auth.authority
      };
    }
    /**
     * Initializes the server telemetry payload
     * @param apiId - Id for a specific request
     * @param correlationId - GUID
     * @param forceRefresh - boolean to indicate network call
     */
    initializeServerTelemetryManager(apiId, correlationId, forceRefresh) {
      const telemetryPayload = {
        clientId: this.config.auth.clientId,
        correlationId,
        apiId,
        forceRefresh: forceRefresh || false
      };
      return new ServerTelemetryManager(telemetryPayload, this.storage);
    }
    /**
     * Create authority instance. If authority not passed in request, default to authority set on the application
     * object. If no authority set in application object, then default to common authority.
     * @param authorityString - authority from user configuration
     */
    async createAuthority(authorityString, requestCorrelationId, azureRegionConfiguration, azureCloudOptions) {
      this.logger.verbose("createAuthority called", requestCorrelationId);
      const authorityUrl = Authority.generateAuthority(authorityString, azureCloudOptions);
      const authorityOptions = {
        protocolMode: this.config.auth.protocolMode,
        knownAuthorities: this.config.auth.knownAuthorities,
        cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
        authorityMetadata: this.config.auth.authorityMetadata,
        azureRegionConfiguration,
        skipAuthorityMetadataCache: this.config.auth.skipAuthorityMetadataCache
      };
      return createDiscoveredInstance(authorityUrl, this.config.system.networkClient, this.storage, authorityOptions, this.logger, requestCorrelationId);
    }
    /**
     * Clear the cache
     */
    clearCache() {
      this.storage.clear();
    }
  }
  class LoopbackClient {
    /**
     * Spins up a loopback server which returns the server response when the localhost redirectUri is hit
     * @param successTemplate
     * @param errorTemplate
     * @returns
     */
    async listenForAuthCode(successTemplate, errorTemplate) {
      if (this.server) {
        throw NodeAuthError.createLoopbackServerAlreadyExistsError();
      }
      return new Promise((resolve, reject) => {
        this.server = http.createServer((req, res) => {
          const url = req.url;
          if (!url) {
            res.end(errorTemplate || "Error occurred loading redirectUrl");
            reject(NodeAuthError.createUnableToLoadRedirectUrlError());
            return;
          } else if (url === Constants$1.FORWARD_SLASH) {
            res.end(successTemplate || "Auth code was successfully acquired. You can close this window now.");
            return;
          }
          const redirectUri = this.getRedirectUri();
          const parsedUrl = new URL(url, redirectUri);
          const authCodeResponse = getDeserializedResponse(parsedUrl.search) || {};
          if (authCodeResponse.code) {
            res.writeHead(HttpStatus.REDIRECT, {
              location: redirectUri
            });
            res.end();
          }
          if (authCodeResponse.error) {
            res.end(errorTemplate || `Error occurred: ${authCodeResponse.error}`);
          }
          resolve(authCodeResponse);
        });
        this.server.listen(0, "127.0.0.1");
      });
    }
    /**
     * Get the port that the loopback server is running on
     * @returns
     */
    getRedirectUri() {
      if (!this.server || !this.server.listening) {
        throw NodeAuthError.createNoLoopbackServerExistsError();
      }
      const address = this.server.address();
      if (!address || typeof address === "string" || !address.port) {
        this.closeServer();
        throw NodeAuthError.createInvalidLoopbackAddressTypeError();
      }
      const port = address && address.port;
      return `${Constants2.HTTP_PROTOCOL}${Constants2.LOCALHOST}:${port}`;
    }
    /**
     * Close the loopback server
     */
    closeServer() {
      if (this.server) {
        this.server.close();
        if (typeof this.server.closeAllConnections === "function") {
          this.server.closeAllConnections();
        }
        this.server.unref();
        this.server = void 0;
      }
    }
  }
  class DeviceCodeClient extends BaseClient {
    constructor(configuration) {
      super(configuration);
    }
    /**
     * Gets device code from device code endpoint, calls back to with device code response, and
     * polls token endpoint to exchange device code for tokens
     * @param request - developer provided CommonDeviceCodeRequest
     */
    async acquireToken(request) {
      const deviceCodeResponse = await this.getDeviceCode(request);
      request.deviceCodeCallback(deviceCodeResponse);
      const reqTimestamp = nowSeconds();
      const response = await this.acquireTokenWithDeviceCode(request, deviceCodeResponse);
      const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin);
      responseHandler.validateTokenResponse(response);
      return responseHandler.handleServerTokenResponse(response, this.authority, reqTimestamp, request);
    }
    /**
     * Creates device code request and executes http GET
     * @param request - developer provided CommonDeviceCodeRequest
     */
    async getDeviceCode(request) {
      const queryParametersString = this.createExtraQueryParameters(request);
      const endpoint = UrlString.appendQueryString(this.authority.deviceCodeEndpoint, queryParametersString);
      const queryString = this.createQueryString(request);
      const headers = this.createTokenRequestHeaders();
      const thumbprint = {
        clientId: this.config.authOptions.clientId,
        authority: request.authority,
        scopes: request.scopes,
        claims: request.claims,
        authenticationScheme: request.authenticationScheme,
        resourceRequestMethod: request.resourceRequestMethod,
        resourceRequestUri: request.resourceRequestUri,
        shrClaims: request.shrClaims,
        sshKid: request.sshKid
      };
      return this.executePostRequestToDeviceCodeEndpoint(endpoint, queryString, headers, thumbprint, request.correlationId);
    }
    /**
     * Creates query string for the device code request
     * @param request - developer provided CommonDeviceCodeRequest
     */
    createExtraQueryParameters(request) {
      const parameterBuilder = new RequestParameterBuilder();
      if (request.extraQueryParameters) {
        parameterBuilder.addExtraQueryParameters(request.extraQueryParameters);
      }
      return parameterBuilder.createQueryString();
    }
    /**
     * Executes POST request to device code endpoint
     * @param deviceCodeEndpoint - token endpoint
     * @param queryString - string to be used in the body of the request
     * @param headers - headers for the request
     * @param thumbprint - unique request thumbprint
     * @param correlationId - correlation id to be used in the request
     */
    async executePostRequestToDeviceCodeEndpoint(deviceCodeEndpoint, queryString, headers, thumbprint, correlationId) {
      const { body: { user_code: userCode, device_code: deviceCode, verification_uri: verificationUri, expires_in: expiresIn, interval, message } } = await this.sendPostRequest(thumbprint, deviceCodeEndpoint, {
        body: queryString,
        headers
      }, correlationId);
      return {
        userCode,
        deviceCode,
        verificationUri,
        expiresIn,
        interval,
        message
      };
    }
    /**
     * Create device code endpoint query parameters and returns string
     * @param request - developer provided CommonDeviceCodeRequest
     */
    createQueryString(request) {
      const parameterBuilder = new RequestParameterBuilder();
      parameterBuilder.addScopes(request.scopes);
      parameterBuilder.addClientId(this.config.authOptions.clientId);
      if (request.extraQueryParameters) {
        parameterBuilder.addExtraQueryParameters(request.extraQueryParameters);
      }
      if (request.claims || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
        parameterBuilder.addClaims(request.claims, this.config.authOptions.clientCapabilities);
      }
      return parameterBuilder.createQueryString();
    }
    /**
     * Breaks the polling with specific conditions
     * @param deviceCodeExpirationTime - expiration time for the device code request
     * @param userSpecifiedTimeout - developer provided timeout, to be compared against deviceCodeExpirationTime
     * @param userSpecifiedCancelFlag - boolean indicating the developer would like to cancel the request
     */
    continuePolling(deviceCodeExpirationTime, userSpecifiedTimeout, userSpecifiedCancelFlag) {
      if (userSpecifiedCancelFlag) {
        this.logger.error("Token request cancelled by setting DeviceCodeRequest.cancel = true");
        throw createClientAuthError(deviceCodePollingCancelled);
      } else if (userSpecifiedTimeout && userSpecifiedTimeout < deviceCodeExpirationTime && nowSeconds() > userSpecifiedTimeout) {
        this.logger.error(`User defined timeout for device code polling reached. The timeout was set for ${userSpecifiedTimeout}`);
        throw createClientAuthError(userTimeoutReached);
      } else if (nowSeconds() > deviceCodeExpirationTime) {
        if (userSpecifiedTimeout) {
          this.logger.verbose(`User specified timeout ignored as the device code has expired before the timeout elapsed. The user specified timeout was set for ${userSpecifiedTimeout}`);
        }
        this.logger.error(`Device code expired. Expiration time of device code was ${deviceCodeExpirationTime}`);
        throw createClientAuthError(deviceCodeExpired);
      }
      return true;
    }
    /**
     * Creates token request with device code response and polls token endpoint at interval set by the device code response
     * @param request - developer provided CommonDeviceCodeRequest
     * @param deviceCodeResponse - DeviceCodeResponse returned by the security token service device code endpoint
     */
    async acquireTokenWithDeviceCode(request, deviceCodeResponse) {
      const queryParametersString = this.createTokenQueryParameters(request);
      const endpoint = UrlString.appendQueryString(this.authority.tokenEndpoint, queryParametersString);
      const requestBody = this.createTokenRequestBody(request, deviceCodeResponse);
      const headers = this.createTokenRequestHeaders();
      const userSpecifiedTimeout = request.timeout ? nowSeconds() + request.timeout : void 0;
      const deviceCodeExpirationTime = nowSeconds() + deviceCodeResponse.expiresIn;
      const pollingIntervalMilli = deviceCodeResponse.interval * 1e3;
      while (this.continuePolling(deviceCodeExpirationTime, userSpecifiedTimeout, request.cancel)) {
        const thumbprint = {
          clientId: this.config.authOptions.clientId,
          authority: request.authority,
          scopes: request.scopes,
          claims: request.claims,
          authenticationScheme: request.authenticationScheme,
          resourceRequestMethod: request.resourceRequestMethod,
          resourceRequestUri: request.resourceRequestUri,
          shrClaims: request.shrClaims,
          sshKid: request.sshKid
        };
        const response = await this.executePostToTokenEndpoint(endpoint, requestBody, headers, thumbprint, request.correlationId);
        if (response.body && response.body.error) {
          if (response.body.error === Constants$1.AUTHORIZATION_PENDING) {
            this.logger.info("Authorization pending. Continue polling.");
            await delay(pollingIntervalMilli);
          } else {
            this.logger.info("Unexpected error in polling from the server");
            throw createAuthError(postRequestFailed, response.body.error);
          }
        } else {
          this.logger.verbose("Authorization completed successfully. Polling stopped.");
          return response.body;
        }
      }
      this.logger.error("Polling stopped for unknown reasons.");
      throw createClientAuthError(deviceCodeUnknownError);
    }
    /**
     * Creates query parameters and converts to string.
     * @param request - developer provided CommonDeviceCodeRequest
     * @param deviceCodeResponse - DeviceCodeResponse returned by the security token service device code endpoint
     */
    createTokenRequestBody(request, deviceCodeResponse) {
      const requestParameters = new RequestParameterBuilder();
      requestParameters.addScopes(request.scopes);
      requestParameters.addClientId(this.config.authOptions.clientId);
      requestParameters.addGrantType(GrantType.DEVICE_CODE_GRANT);
      requestParameters.addDeviceCode(deviceCodeResponse.deviceCode);
      const correlationId = request.correlationId || this.config.cryptoInterface.createNewGuid();
      requestParameters.addCorrelationId(correlationId);
      requestParameters.addClientInfo();
      requestParameters.addLibraryInfo(this.config.libraryInfo);
      requestParameters.addApplicationTelemetry(this.config.telemetry.application);
      requestParameters.addThrottling();
      if (this.serverTelemetryManager) {
        requestParameters.addServerTelemetry(this.serverTelemetryManager);
      }
      if (!StringUtils.isEmptyObj(request.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
        requestParameters.addClaims(request.claims, this.config.authOptions.clientCapabilities);
      }
      return requestParameters.createQueryString();
    }
  }
  class PublicClientApplication extends ClientApplication {
    /**
     * Important attributes in the Configuration object for auth are:
     * - clientID: the application ID of your application. You can obtain one by registering your application with our Application registration portal.
     * - authority: the authority URL for your application.
     *
     * AAD authorities are of the form https://login.microsoftonline.com/\{Enter_the_Tenant_Info_Here\}.
     * - If your application supports Accounts in one organizational directory, replace "Enter_the_Tenant_Info_Here" value with the Tenant Id or Tenant name (for example, contoso.microsoft.com).
     * - If your application supports Accounts in any organizational directory, replace "Enter_the_Tenant_Info_Here" value with organizations.
     * - If your application supports Accounts in any organizational directory and personal Microsoft accounts, replace "Enter_the_Tenant_Info_Here" value with common.
     * - To restrict support to Personal Microsoft accounts only, replace "Enter_the_Tenant_Info_Here" value with consumers.
     *
     * Azure B2C authorities are of the form https://\{instance\}/\{tenant\}/\{policy\}. Each policy is considered
     * its own authority. You will have to set the all of the knownAuthorities at the time of the client application
     * construction.
     *
     * ADFS authorities are of the form https://\{instance\}/adfs.
     */
    constructor(configuration) {
      super(configuration);
      if (this.config.broker.nativeBrokerPlugin) {
        if (this.config.broker.nativeBrokerPlugin.isBrokerAvailable) {
          this.nativeBrokerPlugin = this.config.broker.nativeBrokerPlugin;
          this.nativeBrokerPlugin.setLogger(this.config.system.loggerOptions);
        } else {
          this.logger.warning("NativeBroker implementation was provided but the broker is unavailable.");
        }
      }
      this.skus = ServerTelemetryManager.makeExtraSkuString({
        libraryName: Constants2.MSAL_SKU,
        libraryVersion: version2
      });
    }
    /**
     * Acquires a token from the authority using OAuth2.0 device code flow.
     * This flow is designed for devices that do not have access to a browser or have input constraints.
     * The authorization server issues a DeviceCode object with a verification code, an end-user code,
     * and the end-user verification URI. The DeviceCode object is provided through a callback, and the end-user should be
     * instructed to use another device to navigate to the verification URI to input credentials.
     * Since the client cannot receive incoming requests, it polls the authorization server repeatedly
     * until the end-user completes input of credentials.
     */
    async acquireTokenByDeviceCode(request) {
      this.logger.info("acquireTokenByDeviceCode called", request.correlationId);
      const validRequest = Object.assign(request, await this.initializeBaseRequest(request));
      const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenByDeviceCode, validRequest.correlationId);
      try {
        const deviceCodeConfig = await this.buildOauthClientConfiguration(validRequest.authority, validRequest.correlationId, "", serverTelemetryManager, void 0, request.azureCloudOptions);
        const deviceCodeClient = new DeviceCodeClient(deviceCodeConfig);
        this.logger.verbose("Device code client created", validRequest.correlationId);
        return await deviceCodeClient.acquireToken(validRequest);
      } catch (e) {
        if (e instanceof AuthError) {
          e.setCorrelationId(validRequest.correlationId);
        }
        serverTelemetryManager.cacheFailedRequest(e);
        throw e;
      }
    }
    /**
     * Acquires a token interactively via the browser by requesting an authorization code then exchanging it for a token.
     */
    async acquireTokenInteractive(request) {
      var _a;
      const correlationId = request.correlationId || this.cryptoProvider.createNewGuid();
      this.logger.trace("acquireTokenInteractive called", correlationId);
      const { openBrowser, successTemplate, errorTemplate, windowHandle, loopbackClient: customLoopbackClient, ...remainingProperties } = request;
      if (this.nativeBrokerPlugin) {
        const brokerRequest = {
          ...remainingProperties,
          clientId: this.config.auth.clientId,
          scopes: request.scopes || OIDC_DEFAULT_SCOPES,
          redirectUri: `${Constants2.HTTP_PROTOCOL}${Constants2.LOCALHOST}`,
          authority: request.authority || this.config.auth.authority,
          correlationId,
          extraParameters: {
            ...remainingProperties.extraQueryParameters,
            ...remainingProperties.tokenQueryParameters,
            [X_CLIENT_EXTRA_SKU]: this.skus
          },
          accountId: (_a = remainingProperties.account) == null ? void 0 : _a.nativeAccountId
        };
        return this.nativeBrokerPlugin.acquireTokenInteractive(brokerRequest, windowHandle);
      }
      const { verifier, challenge } = await this.cryptoProvider.generatePkceCodes();
      const loopbackClient = customLoopbackClient || new LoopbackClient();
      let authCodeResponse = {};
      let authCodeListenerError = null;
      try {
        const authCodeListener = loopbackClient.listenForAuthCode(successTemplate, errorTemplate).then((response) => {
          authCodeResponse = response;
        }).catch((e) => {
          authCodeListenerError = e;
        });
        const redirectUri = await this.waitForRedirectUri(loopbackClient);
        const validRequest = {
          ...remainingProperties,
          correlationId,
          scopes: request.scopes || OIDC_DEFAULT_SCOPES,
          redirectUri,
          responseMode: ResponseMode.QUERY,
          codeChallenge: challenge,
          codeChallengeMethod: CodeChallengeMethodValues.S256
        };
        const authCodeUrl = await this.getAuthCodeUrl(validRequest);
        await openBrowser(authCodeUrl);
        await authCodeListener;
        if (authCodeListenerError) {
          throw authCodeListenerError;
        }
        if (authCodeResponse.error) {
          throw new ServerError(authCodeResponse.error, authCodeResponse.error_description, authCodeResponse.suberror);
        } else if (!authCodeResponse.code) {
          throw NodeAuthError.createNoAuthCodeInResponseError();
        }
        const clientInfo = authCodeResponse.client_info;
        const tokenRequest = {
          code: authCodeResponse.code,
          codeVerifier: verifier,
          clientInfo: clientInfo || Constants$1.EMPTY_STRING,
          ...validRequest
        };
        return await this.acquireTokenByCode(tokenRequest);
      } finally {
        loopbackClient.closeServer();
      }
    }
    /**
     * Returns a token retrieved either from the cache or by exchanging the refresh token for a fresh access token. If brokering is enabled the token request will be serviced by the broker.
     * @param request - developer provided SilentFlowRequest
     * @returns
     */
    async acquireTokenSilent(request) {
      const correlationId = request.correlationId || this.cryptoProvider.createNewGuid();
      this.logger.trace("acquireTokenSilent called", correlationId);
      if (this.nativeBrokerPlugin) {
        const brokerRequest = {
          ...request,
          clientId: this.config.auth.clientId,
          scopes: request.scopes || OIDC_DEFAULT_SCOPES,
          redirectUri: `${Constants2.HTTP_PROTOCOL}${Constants2.LOCALHOST}`,
          authority: request.authority || this.config.auth.authority,
          correlationId,
          extraParameters: {
            ...request.tokenQueryParameters,
            [X_CLIENT_EXTRA_SKU]: this.skus
          },
          accountId: request.account.nativeAccountId,
          forceRefresh: request.forceRefresh || false
        };
        return this.nativeBrokerPlugin.acquireTokenSilent(brokerRequest);
      }
      return super.acquireTokenSilent(request);
    }
    /**
     * Removes cache artifacts associated with the given account
     * @param request - developer provided SignOutRequest
     * @returns
     */
    async signOut(request) {
      if (this.nativeBrokerPlugin && request.account.nativeAccountId) {
        const signoutRequest = {
          clientId: this.config.auth.clientId,
          accountId: request.account.nativeAccountId,
          correlationId: request.correlationId || this.cryptoProvider.createNewGuid()
        };
        await this.nativeBrokerPlugin.signOut(signoutRequest);
      }
      await this.getTokenCache().removeAccount(request.account, request.correlationId);
    }
    /**
     * Returns all cached accounts for this application. If brokering is enabled this request will be serviced by the broker.
     * @returns
     */
    async getAllAccounts() {
      if (this.nativeBrokerPlugin) {
        const correlationId = this.cryptoProvider.createNewGuid();
        return this.nativeBrokerPlugin.getAllAccounts(this.config.auth.clientId, correlationId);
      }
      return this.getTokenCache().getAllAccounts();
    }
    /**
     * Attempts to retrieve the redirectUri from the loopback server. If the loopback server does not start listening for requests within the timeout this will throw.
     * @param loopbackClient - developer provided custom loopback server implementation
     * @returns
     */
    async waitForRedirectUri(loopbackClient) {
      return new Promise((resolve, reject) => {
        let ticks = 0;
        const id = setInterval(() => {
          if (LOOPBACK_SERVER_CONSTANTS.TIMEOUT_MS / LOOPBACK_SERVER_CONSTANTS.INTERVAL_MS < ticks) {
            clearInterval(id);
            reject(NodeAuthError.createLoopbackServerTimeoutError());
            return;
          }
          try {
            const r = loopbackClient.getRedirectUri();
            clearInterval(id);
            resolve(r);
            return;
          } catch (e) {
            if (e instanceof AuthError && e.errorCode === NodeAuthErrorMessage.noLoopbackServerExists.code) {
              ticks++;
              return;
            }
            clearInterval(id);
            reject(e);
            return;
          }
        }, LOOPBACK_SERVER_CONSTANTS.INTERVAL_MS);
      });
    }
  }
  class ClientCredentialClient extends BaseClient {
    constructor(configuration, appTokenProvider) {
      super(configuration);
      this.appTokenProvider = appTokenProvider;
    }
    /**
     * Public API to acquire a token with ClientCredential Flow for Confidential clients
     * @param request - CommonClientCredentialRequest provided by the developer
     */
    async acquireToken(request) {
      if (request.skipCache || request.claims) {
        return this.executeTokenRequest(request, this.authority);
      }
      const [cachedAuthenticationResult, lastCacheOutcome] = await this.getCachedAuthenticationResult(request, this.config, this.cryptoUtils, this.authority, this.cacheManager, this.serverTelemetryManager);
      if (cachedAuthenticationResult) {
        if (lastCacheOutcome === CacheOutcome.PROACTIVELY_REFRESHED) {
          this.logger.info("ClientCredentialClient:getCachedAuthenticationResult - Cached access token's refreshOn property has been exceeded'. It's not expired, but must be refreshed.");
          const refreshAccessToken = true;
          await this.executeTokenRequest(request, this.authority, refreshAccessToken);
        }
        return cachedAuthenticationResult;
      } else {
        return this.executeTokenRequest(request, this.authority);
      }
    }
    /**
     * looks up cache if the tokens are cached already
     */
    async getCachedAuthenticationResult(request, config2, cryptoUtils, authority, cacheManager, serverTelemetryManager) {
      var _a, _b;
      const clientConfiguration = config2;
      const managedIdentityConfiguration = config2;
      let lastCacheOutcome = CacheOutcome.NOT_APPLICABLE;
      let cacheContext;
      if (clientConfiguration.serializableCache && clientConfiguration.persistencePlugin) {
        cacheContext = new TokenCacheContext(clientConfiguration.serializableCache, false);
        await clientConfiguration.persistencePlugin.beforeCacheAccess(cacheContext);
      }
      const cachedAccessToken = this.readAccessTokenFromCache(authority, ((_a = managedIdentityConfiguration.managedIdentityId) == null ? void 0 : _a.id) || clientConfiguration.authOptions.clientId, new ScopeSet(request.scopes || []), cacheManager, request.correlationId);
      if (clientConfiguration.serializableCache && clientConfiguration.persistencePlugin && cacheContext) {
        await clientConfiguration.persistencePlugin.afterCacheAccess(cacheContext);
      }
      if (!cachedAccessToken) {
        serverTelemetryManager == null ? void 0 : serverTelemetryManager.setCacheOutcome(CacheOutcome.NO_CACHED_ACCESS_TOKEN);
        return [null, CacheOutcome.NO_CACHED_ACCESS_TOKEN];
      }
      if (isTokenExpired(cachedAccessToken.expiresOn, ((_b = clientConfiguration.systemOptions) == null ? void 0 : _b.tokenRenewalOffsetSeconds) || DEFAULT_TOKEN_RENEWAL_OFFSET_SEC)) {
        serverTelemetryManager == null ? void 0 : serverTelemetryManager.setCacheOutcome(CacheOutcome.CACHED_ACCESS_TOKEN_EXPIRED);
        return [null, CacheOutcome.CACHED_ACCESS_TOKEN_EXPIRED];
      }
      if (cachedAccessToken.refreshOn && isTokenExpired(cachedAccessToken.refreshOn.toString(), 0)) {
        lastCacheOutcome = CacheOutcome.PROACTIVELY_REFRESHED;
        serverTelemetryManager == null ? void 0 : serverTelemetryManager.setCacheOutcome(CacheOutcome.PROACTIVELY_REFRESHED);
      }
      return [
        await ResponseHandler.generateAuthenticationResult(cryptoUtils, authority, {
          account: null,
          idToken: null,
          accessToken: cachedAccessToken,
          refreshToken: null,
          appMetadata: null
        }, true, request),
        lastCacheOutcome
      ];
    }
    /**
     * Reads access token from the cache
     */
    readAccessTokenFromCache(authority, id, scopeSet, cacheManager, correlationId) {
      const accessTokenFilter = {
        homeAccountId: Constants$1.EMPTY_STRING,
        environment: authority.canonicalAuthorityUrlComponents.HostNameAndPort,
        credentialType: CredentialType.ACCESS_TOKEN,
        clientId: id,
        realm: authority.tenant,
        target: ScopeSet.createSearchScopes(scopeSet.asArray())
      };
      const accessTokens = cacheManager.getAccessTokensByFilter(accessTokenFilter, correlationId);
      if (accessTokens.length < 1) {
        return null;
      } else if (accessTokens.length > 1) {
        throw createClientAuthError(multipleMatchingTokens);
      }
      return accessTokens[0];
    }
    /**
     * Makes a network call to request the token from the service
     * @param request - CommonClientCredentialRequest provided by the developer
     * @param authority - authority object
     */
    async executeTokenRequest(request, authority, refreshAccessToken) {
      let serverTokenResponse;
      let reqTimestamp;
      if (this.appTokenProvider) {
        this.logger.info("Using appTokenProvider extensibility.");
        const appTokenPropviderParameters = {
          correlationId: request.correlationId,
          tenantId: this.config.authOptions.authority.tenant,
          scopes: request.scopes,
          claims: request.claims
        };
        reqTimestamp = nowSeconds();
        const appTokenProviderResult = await this.appTokenProvider(appTokenPropviderParameters);
        serverTokenResponse = {
          access_token: appTokenProviderResult.accessToken,
          expires_in: appTokenProviderResult.expiresInSeconds,
          refresh_in: appTokenProviderResult.refreshInSeconds,
          token_type: AuthenticationScheme.BEARER
        };
      } else {
        const queryParametersString = this.createTokenQueryParameters(request);
        const endpoint = UrlString.appendQueryString(authority.tokenEndpoint, queryParametersString);
        const requestBody = await this.createTokenRequestBody(request);
        const headers = this.createTokenRequestHeaders();
        const thumbprint = {
          clientId: this.config.authOptions.clientId,
          authority: request.authority,
          scopes: request.scopes,
          claims: request.claims,
          authenticationScheme: request.authenticationScheme,
          resourceRequestMethod: request.resourceRequestMethod,
          resourceRequestUri: request.resourceRequestUri,
          shrClaims: request.shrClaims,
          sshKid: request.sshKid
        };
        this.logger.info("Sending token request to endpoint: " + authority.tokenEndpoint);
        reqTimestamp = nowSeconds();
        const response = await this.executePostToTokenEndpoint(endpoint, requestBody, headers, thumbprint, request.correlationId);
        serverTokenResponse = response.body;
        serverTokenResponse.status = response.status;
      }
      const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin);
      responseHandler.validateTokenResponse(serverTokenResponse, refreshAccessToken);
      const tokenResponse = await responseHandler.handleServerTokenResponse(serverTokenResponse, this.authority, reqTimestamp, request);
      return tokenResponse;
    }
    /**
     * generate the request to the server in the acceptable format
     * @param request - CommonClientCredentialRequest provided by the developer
     */
    async createTokenRequestBody(request) {
      const parameterBuilder = new RequestParameterBuilder();
      parameterBuilder.addClientId(this.config.authOptions.clientId);
      parameterBuilder.addScopes(request.scopes, false);
      parameterBuilder.addGrantType(GrantType.CLIENT_CREDENTIALS_GRANT);
      parameterBuilder.addLibraryInfo(this.config.libraryInfo);
      parameterBuilder.addApplicationTelemetry(this.config.telemetry.application);
      parameterBuilder.addThrottling();
      if (this.serverTelemetryManager) {
        parameterBuilder.addServerTelemetry(this.serverTelemetryManager);
      }
      const correlationId = request.correlationId || this.config.cryptoInterface.createNewGuid();
      parameterBuilder.addCorrelationId(correlationId);
      if (this.config.clientCredentials.clientSecret) {
        parameterBuilder.addClientSecret(this.config.clientCredentials.clientSecret);
      }
      const clientAssertion = request.clientAssertion || this.config.clientCredentials.clientAssertion;
      if (clientAssertion) {
        parameterBuilder.addClientAssertion(await getClientAssertion(clientAssertion.assertion, this.config.authOptions.clientId, request.resourceRequestUri));
        parameterBuilder.addClientAssertionType(clientAssertion.assertionType);
      }
      if (!StringUtils.isEmptyObj(request.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
        parameterBuilder.addClaims(request.claims, this.config.authOptions.clientCapabilities);
      }
      return parameterBuilder.createQueryString();
    }
  }
  class OnBehalfOfClient extends BaseClient {
    constructor(configuration) {
      super(configuration);
    }
    /**
     * Public API to acquire tokens with on behalf of flow
     * @param request - developer provided CommonOnBehalfOfRequest
     */
    async acquireToken(request) {
      this.scopeSet = new ScopeSet(request.scopes || []);
      this.userAssertionHash = await this.cryptoUtils.hashString(request.oboAssertion);
      if (request.skipCache || request.claims) {
        return this.executeTokenRequest(request, this.authority, this.userAssertionHash);
      }
      try {
        return await this.getCachedAuthenticationResult(request);
      } catch (e) {
        return await this.executeTokenRequest(request, this.authority, this.userAssertionHash);
      }
    }
    /**
     * look up cache for tokens
     * Find idtoken in the cache
     * Find accessToken based on user assertion and account info in the cache
     * Please note we are not yet supported OBO tokens refreshed with long lived RT. User will have to send a new assertion if the current access token expires
     * This is to prevent security issues when the assertion changes over time, however, longlived RT helps retaining the session
     * @param request - developer provided CommonOnBehalfOfRequest
     */
    async getCachedAuthenticationResult(request) {
      var _a, _b;
      const cachedAccessToken = this.readAccessTokenFromCacheForOBO(this.config.authOptions.clientId, request);
      if (!cachedAccessToken) {
        (_a = this.serverTelemetryManager) == null ? void 0 : _a.setCacheOutcome(CacheOutcome.NO_CACHED_ACCESS_TOKEN);
        this.logger.info("SilentFlowClient:acquireCachedToken - No access token found in cache for the given properties.");
        throw createClientAuthError(tokenRefreshRequired);
      } else if (isTokenExpired(cachedAccessToken.expiresOn, this.config.systemOptions.tokenRenewalOffsetSeconds)) {
        (_b = this.serverTelemetryManager) == null ? void 0 : _b.setCacheOutcome(CacheOutcome.CACHED_ACCESS_TOKEN_EXPIRED);
        this.logger.info(`OnbehalfofFlow:getCachedAuthenticationResult - Cached access token is expired or will expire within ${this.config.systemOptions.tokenRenewalOffsetSeconds} seconds.`);
        throw createClientAuthError(tokenRefreshRequired);
      }
      const cachedIdToken = this.readIdTokenFromCacheForOBO(cachedAccessToken.homeAccountId, request.correlationId);
      let idTokenClaims;
      let cachedAccount = null;
      if (cachedIdToken) {
        idTokenClaims = extractTokenClaims(cachedIdToken.secret, EncodingUtils.base64Decode);
        const localAccountId = idTokenClaims.oid || idTokenClaims.sub;
        const accountInfo = {
          homeAccountId: cachedIdToken.homeAccountId,
          environment: cachedIdToken.environment,
          tenantId: cachedIdToken.realm,
          username: Constants$1.EMPTY_STRING,
          localAccountId: localAccountId || Constants$1.EMPTY_STRING
        };
        cachedAccount = this.cacheManager.readAccountFromCache(accountInfo, request.correlationId);
      }
      if (this.config.serverTelemetryManager) {
        this.config.serverTelemetryManager.incrementCacheHits();
      }
      return ResponseHandler.generateAuthenticationResult(this.cryptoUtils, this.authority, {
        account: cachedAccount,
        accessToken: cachedAccessToken,
        idToken: cachedIdToken,
        refreshToken: null,
        appMetadata: null
      }, true, request, idTokenClaims);
    }
    /**
     * read idtoken from cache, this is a specific implementation for OBO as the requirements differ from a generic lookup in the cacheManager
     * Certain use cases of OBO flow do not expect an idToken in the cache/or from the service
     * @param atHomeAccountId - account id
     */
    readIdTokenFromCacheForOBO(atHomeAccountId, correlationId) {
      const idTokenFilter = {
        homeAccountId: atHomeAccountId,
        environment: this.authority.canonicalAuthorityUrlComponents.HostNameAndPort,
        credentialType: CredentialType.ID_TOKEN,
        clientId: this.config.authOptions.clientId,
        realm: this.authority.tenant
      };
      const idTokenMap = this.cacheManager.getIdTokensByFilter(idTokenFilter, correlationId);
      if (Object.values(idTokenMap).length < 1) {
        return null;
      }
      return Object.values(idTokenMap)[0];
    }
    /**
     * Fetches the cached access token based on incoming assertion
     * @param clientId - client id
     * @param request - developer provided CommonOnBehalfOfRequest
     */
    readAccessTokenFromCacheForOBO(clientId, request) {
      const authScheme = request.authenticationScheme || AuthenticationScheme.BEARER;
      const credentialType = authScheme.toLowerCase() !== AuthenticationScheme.BEARER.toLowerCase() ? CredentialType.ACCESS_TOKEN_WITH_AUTH_SCHEME : CredentialType.ACCESS_TOKEN;
      const accessTokenFilter = {
        credentialType,
        clientId,
        target: ScopeSet.createSearchScopes(this.scopeSet.asArray()),
        tokenType: authScheme,
        keyId: request.sshKid,
        requestedClaimsHash: request.requestedClaimsHash,
        userAssertionHash: this.userAssertionHash
      };
      const accessTokens = this.cacheManager.getAccessTokensByFilter(accessTokenFilter, request.correlationId);
      const numAccessTokens = accessTokens.length;
      if (numAccessTokens < 1) {
        return null;
      } else if (numAccessTokens > 1) {
        throw createClientAuthError(multipleMatchingTokens);
      }
      return accessTokens[0];
    }
    /**
     * Make a network call to the server requesting credentials
     * @param request - developer provided CommonOnBehalfOfRequest
     * @param authority - authority object
     */
    async executeTokenRequest(request, authority, userAssertionHash) {
      const queryParametersString = this.createTokenQueryParameters(request);
      const endpoint = UrlString.appendQueryString(authority.tokenEndpoint, queryParametersString);
      const requestBody = await this.createTokenRequestBody(request);
      const headers = this.createTokenRequestHeaders();
      const thumbprint = {
        clientId: this.config.authOptions.clientId,
        authority: request.authority,
        scopes: request.scopes,
        claims: request.claims,
        authenticationScheme: request.authenticationScheme,
        resourceRequestMethod: request.resourceRequestMethod,
        resourceRequestUri: request.resourceRequestUri,
        shrClaims: request.shrClaims,
        sshKid: request.sshKid
      };
      const reqTimestamp = nowSeconds();
      const response = await this.executePostToTokenEndpoint(endpoint, requestBody, headers, thumbprint, request.correlationId);
      const responseHandler = new ResponseHandler(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin);
      responseHandler.validateTokenResponse(response.body);
      const tokenResponse = await responseHandler.handleServerTokenResponse(response.body, this.authority, reqTimestamp, request, void 0, userAssertionHash);
      return tokenResponse;
    }
    /**
     * generate a server request in accepable format
     * @param request - developer provided CommonOnBehalfOfRequest
     */
    async createTokenRequestBody(request) {
      const parameterBuilder = new RequestParameterBuilder();
      parameterBuilder.addClientId(this.config.authOptions.clientId);
      parameterBuilder.addScopes(request.scopes);
      parameterBuilder.addGrantType(GrantType.JWT_BEARER);
      parameterBuilder.addClientInfo();
      parameterBuilder.addLibraryInfo(this.config.libraryInfo);
      parameterBuilder.addApplicationTelemetry(this.config.telemetry.application);
      parameterBuilder.addThrottling();
      if (this.serverTelemetryManager) {
        parameterBuilder.addServerTelemetry(this.serverTelemetryManager);
      }
      const correlationId = request.correlationId || this.config.cryptoInterface.createNewGuid();
      parameterBuilder.addCorrelationId(correlationId);
      parameterBuilder.addRequestTokenUse(ON_BEHALF_OF);
      parameterBuilder.addOboAssertion(request.oboAssertion);
      if (this.config.clientCredentials.clientSecret) {
        parameterBuilder.addClientSecret(this.config.clientCredentials.clientSecret);
      }
      const clientAssertion = this.config.clientCredentials.clientAssertion;
      if (clientAssertion) {
        parameterBuilder.addClientAssertion(await getClientAssertion(clientAssertion.assertion, this.config.authOptions.clientId, request.resourceRequestUri));
        parameterBuilder.addClientAssertionType(clientAssertion.assertionType);
      }
      if (request.claims || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) {
        parameterBuilder.addClaims(request.claims, this.config.authOptions.clientCapabilities);
      }
      return parameterBuilder.createQueryString();
    }
  }
  class ConfidentialClientApplication extends ClientApplication {
    /**
     * Constructor for the ConfidentialClientApplication
     *
     * Required attributes in the Configuration object are:
     * - clientID: the application ID of your application. You can obtain one by registering your application with our application registration portal
     * - authority: the authority URL for your application.
     * - client credential: Must set either client secret, certificate, or assertion for confidential clients. You can obtain a client secret from the application registration portal.
     *
     * In Azure AD, authority is a URL indicating of the form https://login.microsoftonline.com/\{Enter_the_Tenant_Info_Here\}.
     * If your application supports Accounts in one organizational directory, replace "Enter_the_Tenant_Info_Here" value with the Tenant Id or Tenant name (for example, contoso.microsoft.com).
     * If your application supports Accounts in any organizational directory, replace "Enter_the_Tenant_Info_Here" value with organizations.
     * If your application supports Accounts in any organizational directory and personal Microsoft accounts, replace "Enter_the_Tenant_Info_Here" value with common.
     * To restrict support to Personal Microsoft accounts only, replace "Enter_the_Tenant_Info_Here" value with consumers.
     *
     * In Azure B2C, authority is of the form https://\{instance\}/tfp/\{tenant\}/\{policyName\}/
     * Full B2C functionality will be available in this library in future versions.
     *
     * @param Configuration - configuration object for the MSAL ConfidentialClientApplication instance
     */
    constructor(configuration) {
      super(configuration);
      this.setClientCredential();
      this.appTokenProvider = void 0;
    }
    /**
     * This extensibility point only works for the client_credential flow, i.e. acquireTokenByClientCredential and
     * is meant for Azure SDK to enhance Managed Identity support.
     *
     * @param IAppTokenProvider  - Extensibility interface, which allows the app developer to return a token from a custom source.
     */
    SetAppTokenProvider(provider) {
      this.appTokenProvider = provider;
    }
    /**
     * Acquires tokens from the authority for the application (not for an end user).
     */
    async acquireTokenByClientCredential(request) {
      this.logger.info("acquireTokenByClientCredential called", request.correlationId);
      let clientAssertion;
      if (request.clientAssertion) {
        clientAssertion = {
          assertion: await getClientAssertion(
            request.clientAssertion,
            this.config.auth.clientId
            // tokenEndpoint will be undefined. resourceRequestUri is omitted in ClientCredentialRequest
          ),
          assertionType: Constants2.JWT_BEARER_ASSERTION_TYPE
        };
      }
      const baseRequest = await this.initializeBaseRequest(request);
      const validBaseRequest = {
        ...baseRequest,
        scopes: baseRequest.scopes.filter((scope) => !OIDC_DEFAULT_SCOPES.includes(scope))
      };
      const validRequest = {
        ...request,
        ...validBaseRequest,
        clientAssertion
      };
      const authority = new UrlString(validRequest.authority);
      const tenantId = authority.getUrlComponents().PathSegments[0];
      if (Object.values(AADAuthorityConstants).includes(tenantId)) {
        throw createClientAuthError(missingTenantIdError);
      }
      const ENV_MSAL_FORCE_REGION = process.env[MSAL_FORCE_REGION];
      let region;
      if (validRequest.azureRegion !== "DisableMsalForceRegion") {
        if (!validRequest.azureRegion && ENV_MSAL_FORCE_REGION) {
          region = ENV_MSAL_FORCE_REGION;
        } else {
          region = validRequest.azureRegion;
        }
      }
      const azureRegionConfiguration = {
        azureRegion: region,
        environmentRegion: process.env[REGION_ENVIRONMENT_VARIABLE]
      };
      const serverTelemetryManager = this.initializeServerTelemetryManager(ApiId.acquireTokenByClientCredential, validRequest.correlationId, validRequest.skipCache);
      try {
        const clientCredentialConfig = await this.buildOauthClientConfiguration(validRequest.authority, validRequest.correlationId, "", serverTelemetryManager, azureRegionConfiguration, request.azureCloudOptions);
        const clientCredentialClient = new ClientCredentialClient(clientCredentialConfig, this.appTokenProvider);
        this.logger.verbose("Client credential client created", validRequest.correlationId);
        return await clientCredentialClient.acquireToken(validRequest);
      } catch (e) {
        if (e instanceof AuthError) {
          e.setCorrelationId(validRequest.correlationId);
        }
        serverTelemetryManager.cacheFailedRequest(e);
        throw e;
      }
    }
    /**
     * Acquires tokens from the authority for the application.
     *
     * Used in scenarios where the current app is a middle-tier service which was called with a token
     * representing an end user. The current app can use the token (oboAssertion) to request another
     * token to access downstream web API, on behalf of that user.
     *
     * The current middle-tier app has no user interaction to obtain consent.
     * See how to gain consent upfront for your middle-tier app from this article.
     * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow#gaining-consent-for-the-middle-tier-application
     */
    async acquireTokenOnBehalfOf(request) {
      this.logger.info("acquireTokenOnBehalfOf called", request.correlationId);
      const validRequest = {
        ...request,
        ...await this.initializeBaseRequest(request)
      };
      try {
        const onBehalfOfConfig = await this.buildOauthClientConfiguration(validRequest.authority, validRequest.correlationId, "", void 0, void 0, request.azureCloudOptions);
        const oboClient = new OnBehalfOfClient(onBehalfOfConfig);
        this.logger.verbose("On behalf of client created", validRequest.correlationId);
        return await oboClient.acquireToken(validRequest);
      } catch (e) {
        if (e instanceof AuthError) {
          e.setCorrelationId(validRequest.correlationId);
        }
        throw e;
      }
    }
    setClientCredential() {
      var _a, _b, _c;
      const clientSecretNotEmpty = !!this.config.auth.clientSecret;
      const clientAssertionNotEmpty = !!this.config.auth.clientAssertion;
      const certificateNotEmpty = (!!((_a = this.config.auth.clientCertificate) == null ? void 0 : _a.thumbprint) || !!((_b = this.config.auth.clientCertificate) == null ? void 0 : _b.thumbprintSha256)) && !!((_c = this.config.auth.clientCertificate) == null ? void 0 : _c.privateKey);
      if (this.appTokenProvider) {
        return;
      }
      if (clientSecretNotEmpty && clientAssertionNotEmpty || clientAssertionNotEmpty && certificateNotEmpty || clientSecretNotEmpty && certificateNotEmpty) {
        throw createClientAuthError(invalidClientCredential);
      }
      if (this.config.auth.clientSecret) {
        this.clientSecret = this.config.auth.clientSecret;
        return;
      }
      if (this.config.auth.clientAssertion) {
        this.developerProvidedClientAssertion = this.config.auth.clientAssertion;
        return;
      }
      if (!certificateNotEmpty) {
        throw createClientAuthError(invalidClientCredential);
      } else {
        this.clientAssertion = !!this.config.auth.clientCertificate.thumbprintSha256 ? ClientAssertion.fromCertificateWithSha256Thumbprint(this.config.auth.clientCertificate.thumbprintSha256, this.config.auth.clientCertificate.privateKey, this.config.auth.clientCertificate.x5c) : ClientAssertion.fromCertificate(
          // guaranteed to be a string, due to prior error checking in this function
          this.config.auth.clientCertificate.thumbprint,
          this.config.auth.clientCertificate.privateKey,
          this.config.auth.clientCertificate.x5c
        );
      }
    }
  }
  const ManagedIdentityUserAssignedIdQueryParameterNames = {
    MANAGED_IDENTITY_CLIENT_ID: "client_id",
    MANAGED_IDENTITY_OBJECT_ID: "object_id",
    MANAGED_IDENTITY_RESOURCE_ID: "mi_res_id"
  };
  class BaseManagedIdentitySource {
    constructor(logger, nodeStorage, networkClient, cryptoProvider) {
      this.logger = logger;
      this.nodeStorage = nodeStorage;
      this.networkClient = networkClient;
      this.cryptoProvider = cryptoProvider;
    }
    async getServerTokenResponseAsync(response, _networkClient, _networkRequest, _networkRequestOptions) {
      return this.getServerTokenResponse(response);
    }
    getServerTokenResponse(response) {
      var _a, _b;
      let refreshIn, expiresIn;
      if (response.body.expires_on) {
        expiresIn = response.body.expires_on - nowSeconds();
        if (expiresIn > 2 * 3600) {
          refreshIn = expiresIn / 2;
        }
      }
      const serverTokenResponse = {
        status: response.status,
        // success
        access_token: response.body.access_token,
        expires_in: expiresIn,
        scope: response.body.resource,
        token_type: response.body.token_type,
        refresh_in: refreshIn,
        // error
        correlation_id: response.body.correlation_id || response.body.correlationId,
        error: typeof response.body.error === "string" ? response.body.error : (_a = response.body.error) == null ? void 0 : _a.code,
        error_description: response.body.message || (typeof response.body.error === "string" ? response.body.error_description : (_b = response.body.error) == null ? void 0 : _b.message),
        error_codes: response.body.error_codes,
        timestamp: response.body.timestamp,
        trace_id: response.body.trace_id
      };
      return serverTokenResponse;
    }
    async acquireTokenWithManagedIdentity(managedIdentityRequest, managedIdentityId, fakeAuthority, refreshAccessToken) {
      const networkRequest = this.createRequest(managedIdentityRequest.resource, managedIdentityId);
      const headers = networkRequest.headers;
      headers[HeaderNames.CONTENT_TYPE] = Constants$1.URL_FORM_CONTENT_TYPE;
      const networkRequestOptions = { headers };
      if (Object.keys(networkRequest.bodyParameters).length) {
        networkRequestOptions.body = networkRequest.computeParametersBodyString();
      }
      const reqTimestamp = nowSeconds();
      let response;
      try {
        if (networkRequest.httpMethod === HttpMethod.POST) {
          response = await this.networkClient.sendPostRequestAsync(networkRequest.computeUri(), networkRequestOptions);
        } else {
          response = await this.networkClient.sendGetRequestAsync(networkRequest.computeUri(), networkRequestOptions);
        }
      } catch (error2) {
        if (error2 instanceof AuthError) {
          throw error2;
        } else {
          throw createClientAuthError(networkError);
        }
      }
      const responseHandler = new ResponseHandler(managedIdentityId.id, this.nodeStorage, this.cryptoProvider, this.logger, null, null);
      const serverTokenResponse = await this.getServerTokenResponseAsync(response, this.networkClient, networkRequest, networkRequestOptions);
      responseHandler.validateTokenResponse(serverTokenResponse, refreshAccessToken);
      return responseHandler.handleServerTokenResponse(serverTokenResponse, fakeAuthority, reqTimestamp, managedIdentityRequest);
    }
    getManagedIdentityUserAssignedIdQueryParameterKey(managedIdentityIdType) {
      switch (managedIdentityIdType) {
        case ManagedIdentityIdType.USER_ASSIGNED_CLIENT_ID:
          this.logger.info("[Managed Identity] Adding user assigned client id to the request.");
          return ManagedIdentityUserAssignedIdQueryParameterNames.MANAGED_IDENTITY_CLIENT_ID;
        case ManagedIdentityIdType.USER_ASSIGNED_RESOURCE_ID:
          this.logger.info("[Managed Identity] Adding user assigned resource id to the request.");
          return ManagedIdentityUserAssignedIdQueryParameterNames.MANAGED_IDENTITY_RESOURCE_ID;
        case ManagedIdentityIdType.USER_ASSIGNED_OBJECT_ID:
          this.logger.info("[Managed Identity] Adding user assigned object id to the request.");
          return ManagedIdentityUserAssignedIdQueryParameterNames.MANAGED_IDENTITY_OBJECT_ID;
        default:
          throw createManagedIdentityError(invalidManagedIdentityIdType);
      }
    }
  }
  BaseManagedIdentitySource.getValidatedEnvVariableUrlString = (envVariableStringName, envVariable, sourceName, logger) => {
    try {
      return new UrlString(envVariable).urlString;
    } catch (error2) {
      logger.info(`[Managed Identity] ${sourceName} managed identity is unavailable because the '${envVariableStringName}' environment variable is malformed.`);
      throw createManagedIdentityError(MsiEnvironmentVariableUrlMalformedErrorCodes[envVariableStringName]);
    }
  };
  class ManagedIdentityRequestParameters {
    constructor(httpMethod, endpoint) {
      this.httpMethod = httpMethod;
      this._baseEndpoint = endpoint;
      this.headers = {};
      this.bodyParameters = {};
      this.queryParameters = {};
    }
    computeUri() {
      const parameterBuilder = new RequestParameterBuilder();
      if (this.queryParameters) {
        parameterBuilder.addExtraQueryParameters(this.queryParameters);
      }
      const queryParametersString = parameterBuilder.createQueryString();
      return UrlString.appendQueryString(this._baseEndpoint, queryParametersString);
    }
    computeParametersBodyString() {
      const parameterBuilder = new RequestParameterBuilder();
      if (this.bodyParameters) {
        parameterBuilder.addExtraQueryParameters(this.bodyParameters);
      }
      return parameterBuilder.createQueryString();
    }
  }
  const APP_SERVICE_MSI_API_VERSION = "2019-08-01";
  class AppService extends BaseManagedIdentitySource {
    constructor(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint, identityHeader) {
      super(logger, nodeStorage, networkClient, cryptoProvider);
      this.identityEndpoint = identityEndpoint;
      this.identityHeader = identityHeader;
    }
    static getEnvironmentVariables() {
      const identityEndpoint = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT];
      const identityHeader = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_HEADER];
      return [identityEndpoint, identityHeader];
    }
    static tryCreate(logger, nodeStorage, networkClient, cryptoProvider) {
      const [identityEndpoint, identityHeader] = AppService.getEnvironmentVariables();
      if (!identityEndpoint || !identityHeader) {
        logger.info(`[Managed Identity] ${ManagedIdentitySourceNames.APP_SERVICE} managed identity is unavailable because one or both of the '${ManagedIdentityEnvironmentVariableNames.IDENTITY_HEADER}' and '${ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT}' environment variables are not defined.`);
        return null;
      }
      const validatedIdentityEndpoint = AppService.getValidatedEnvVariableUrlString(ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT, identityEndpoint, ManagedIdentitySourceNames.APP_SERVICE, logger);
      logger.info(`[Managed Identity] Environment variables validation passed for ${ManagedIdentitySourceNames.APP_SERVICE} managed identity. Endpoint URI: ${validatedIdentityEndpoint}. Creating ${ManagedIdentitySourceNames.APP_SERVICE} managed identity.`);
      return new AppService(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint, identityHeader);
    }
    createRequest(resource, managedIdentityId) {
      const request = new ManagedIdentityRequestParameters(HttpMethod.GET, this.identityEndpoint);
      request.headers[APP_SERVICE_SECRET_HEADER_NAME] = this.identityHeader;
      request.queryParameters[API_VERSION_QUERY_PARAMETER_NAME] = APP_SERVICE_MSI_API_VERSION;
      request.queryParameters[RESOURCE_BODY_OR_QUERY_PARAMETER_NAME] = resource;
      if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
        request.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(managedIdentityId.idType)] = managedIdentityId.id;
      }
      return request;
    }
  }
  const ARC_API_VERSION = "2019-11-01";
  const DEFAULT_AZURE_ARC_IDENTITY_ENDPOINT = "http://127.0.0.1:40342/metadata/identity/oauth2/token";
  const HIMDS_EXECUTABLE_HELPER_STRING = "N/A: himds executable exists";
  const SUPPORTED_AZURE_ARC_PLATFORMS = {
    win32: `${process.env["ProgramData"]}\\AzureConnectedMachineAgent\\Tokens\\`,
    linux: "/var/opt/azcmagent/tokens/"
  };
  const AZURE_ARC_FILE_DETECTION = {
    win32: `${process.env["ProgramFiles"]}\\AzureConnectedMachineAgent\\himds.exe`,
    linux: "/opt/azcmagent/bin/himds"
  };
  class AzureArc extends BaseManagedIdentitySource {
    constructor(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint) {
      super(logger, nodeStorage, networkClient, cryptoProvider);
      this.identityEndpoint = identityEndpoint;
    }
    static getEnvironmentVariables() {
      let identityEndpoint = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT];
      let imdsEndpoint = process.env[ManagedIdentityEnvironmentVariableNames.IMDS_ENDPOINT];
      if (!identityEndpoint || !imdsEndpoint) {
        const fileDetectionPath = AZURE_ARC_FILE_DETECTION[process.platform];
        try {
          fs2.accessSync(fileDetectionPath, fs2.constants.F_OK | fs2.constants.R_OK);
          identityEndpoint = DEFAULT_AZURE_ARC_IDENTITY_ENDPOINT;
          imdsEndpoint = HIMDS_EXECUTABLE_HELPER_STRING;
        } catch (err) {
        }
      }
      return [identityEndpoint, imdsEndpoint];
    }
    static tryCreate(logger, nodeStorage, networkClient, cryptoProvider, managedIdentityId) {
      const [identityEndpoint, imdsEndpoint] = AzureArc.getEnvironmentVariables();
      if (!identityEndpoint || !imdsEndpoint) {
        logger.info(`[Managed Identity] ${ManagedIdentitySourceNames.AZURE_ARC} managed identity is unavailable through environment variables because one or both of '${ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT}' and '${ManagedIdentityEnvironmentVariableNames.IMDS_ENDPOINT}' are not defined. ${ManagedIdentitySourceNames.AZURE_ARC} managed identity is also unavailable through file detection.`);
        return null;
      }
      if (imdsEndpoint === HIMDS_EXECUTABLE_HELPER_STRING) {
        logger.info(`[Managed Identity] ${ManagedIdentitySourceNames.AZURE_ARC} managed identity is available through file detection. Defaulting to known ${ManagedIdentitySourceNames.AZURE_ARC} endpoint: ${DEFAULT_AZURE_ARC_IDENTITY_ENDPOINT}. Creating ${ManagedIdentitySourceNames.AZURE_ARC} managed identity.`);
      } else {
        const validatedIdentityEndpoint = AzureArc.getValidatedEnvVariableUrlString(ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT, identityEndpoint, ManagedIdentitySourceNames.AZURE_ARC, logger);
        validatedIdentityEndpoint.endsWith("/") ? validatedIdentityEndpoint.slice(0, -1) : validatedIdentityEndpoint;
        AzureArc.getValidatedEnvVariableUrlString(ManagedIdentityEnvironmentVariableNames.IMDS_ENDPOINT, imdsEndpoint, ManagedIdentitySourceNames.AZURE_ARC, logger);
        logger.info(`[Managed Identity] Environment variables validation passed for ${ManagedIdentitySourceNames.AZURE_ARC} managed identity. Endpoint URI: ${validatedIdentityEndpoint}. Creating ${ManagedIdentitySourceNames.AZURE_ARC} managed identity.`);
      }
      if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
        throw createManagedIdentityError(unableToCreateAzureArc);
      }
      return new AzureArc(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint);
    }
    createRequest(resource) {
      const request = new ManagedIdentityRequestParameters(HttpMethod.GET, this.identityEndpoint.replace("localhost", "127.0.0.1"));
      request.headers[METADATA_HEADER_NAME] = "true";
      request.queryParameters[API_VERSION_QUERY_PARAMETER_NAME] = ARC_API_VERSION;
      request.queryParameters[RESOURCE_BODY_OR_QUERY_PARAMETER_NAME] = resource;
      return request;
    }
    async getServerTokenResponseAsync(originalResponse, networkClient, networkRequest, networkRequestOptions) {
      let retryResponse;
      if (originalResponse.status === HttpStatus.UNAUTHORIZED) {
        const wwwAuthHeader = originalResponse.headers["www-authenticate"];
        if (!wwwAuthHeader) {
          throw createManagedIdentityError(wwwAuthenticateHeaderMissing);
        }
        if (!wwwAuthHeader.includes("Basic realm=")) {
          throw createManagedIdentityError(wwwAuthenticateHeaderUnsupportedFormat);
        }
        const secretFilePath = wwwAuthHeader.split("Basic realm=")[1];
        if (!SUPPORTED_AZURE_ARC_PLATFORMS.hasOwnProperty(process.platform)) {
          throw createManagedIdentityError(platformNotSupported);
        }
        const expectedSecretFilePath = SUPPORTED_AZURE_ARC_PLATFORMS[process.platform];
        const fileName = path2.basename(secretFilePath);
        if (!fileName.endsWith(".key")) {
          throw createManagedIdentityError(invalidFileExtension);
        }
        if (expectedSecretFilePath + fileName !== secretFilePath) {
          throw createManagedIdentityError(invalidFilePath);
        }
        let secretFileSize;
        try {
          secretFileSize = await fs2.statSync(secretFilePath).size;
        } catch (e) {
          throw createManagedIdentityError(unableToReadSecretFile);
        }
        if (secretFileSize > AZURE_ARC_SECRET_FILE_MAX_SIZE_BYTES) {
          throw createManagedIdentityError(invalidSecret);
        }
        let secret;
        try {
          secret = fs2.readFileSync(secretFilePath, "utf-8");
        } catch (e) {
          throw createManagedIdentityError(unableToReadSecretFile);
        }
        const authHeaderValue = `Basic ${secret}`;
        this.logger.info(`[Managed Identity] Adding authorization header to the request.`);
        networkRequest.headers[AUTHORIZATION_HEADER_NAME] = authHeaderValue;
        try {
          retryResponse = await networkClient.sendGetRequestAsync(networkRequest.computeUri(), networkRequestOptions);
        } catch (error2) {
          if (error2 instanceof AuthError) {
            throw error2;
          } else {
            throw createClientAuthError(networkError);
          }
        }
      }
      return this.getServerTokenResponse(retryResponse || originalResponse);
    }
  }
  class CloudShell extends BaseManagedIdentitySource {
    constructor(logger, nodeStorage, networkClient, cryptoProvider, msiEndpoint) {
      super(logger, nodeStorage, networkClient, cryptoProvider);
      this.msiEndpoint = msiEndpoint;
    }
    static getEnvironmentVariables() {
      const msiEndpoint = process.env[ManagedIdentityEnvironmentVariableNames.MSI_ENDPOINT];
      return [msiEndpoint];
    }
    static tryCreate(logger, nodeStorage, networkClient, cryptoProvider, managedIdentityId) {
      const [msiEndpoint] = CloudShell.getEnvironmentVariables();
      if (!msiEndpoint) {
        logger.info(`[Managed Identity] ${ManagedIdentitySourceNames.CLOUD_SHELL} managed identity is unavailable because the '${ManagedIdentityEnvironmentVariableNames.MSI_ENDPOINT} environment variable is not defined.`);
        return null;
      }
      const validatedMsiEndpoint = CloudShell.getValidatedEnvVariableUrlString(ManagedIdentityEnvironmentVariableNames.MSI_ENDPOINT, msiEndpoint, ManagedIdentitySourceNames.CLOUD_SHELL, logger);
      logger.info(`[Managed Identity] Environment variable validation passed for ${ManagedIdentitySourceNames.CLOUD_SHELL} managed identity. Endpoint URI: ${validatedMsiEndpoint}. Creating ${ManagedIdentitySourceNames.CLOUD_SHELL} managed identity.`);
      if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
        throw createManagedIdentityError(unableToCreateCloudShell);
      }
      return new CloudShell(logger, nodeStorage, networkClient, cryptoProvider, msiEndpoint);
    }
    createRequest(resource) {
      const request = new ManagedIdentityRequestParameters(HttpMethod.POST, this.msiEndpoint);
      request.headers[METADATA_HEADER_NAME] = "true";
      request.bodyParameters[RESOURCE_BODY_OR_QUERY_PARAMETER_NAME] = resource;
      return request;
    }
  }
  const IMDS_TOKEN_PATH = "/metadata/identity/oauth2/token";
  const DEFAULT_IMDS_ENDPOINT = `http://169.254.169.254${IMDS_TOKEN_PATH}`;
  const IMDS_API_VERSION = "2018-02-01";
  class Imds extends BaseManagedIdentitySource {
    constructor(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint) {
      super(logger, nodeStorage, networkClient, cryptoProvider);
      this.identityEndpoint = identityEndpoint;
    }
    static tryCreate(logger, nodeStorage, networkClient, cryptoProvider) {
      let validatedIdentityEndpoint;
      if (process.env[ManagedIdentityEnvironmentVariableNames.AZURE_POD_IDENTITY_AUTHORITY_HOST]) {
        logger.info(`[Managed Identity] Environment variable ${ManagedIdentityEnvironmentVariableNames.AZURE_POD_IDENTITY_AUTHORITY_HOST} for ${ManagedIdentitySourceNames.IMDS} returned endpoint: ${process.env[ManagedIdentityEnvironmentVariableNames.AZURE_POD_IDENTITY_AUTHORITY_HOST]}`);
        validatedIdentityEndpoint = Imds.getValidatedEnvVariableUrlString(ManagedIdentityEnvironmentVariableNames.AZURE_POD_IDENTITY_AUTHORITY_HOST, `${process.env[ManagedIdentityEnvironmentVariableNames.AZURE_POD_IDENTITY_AUTHORITY_HOST]}${IMDS_TOKEN_PATH}`, ManagedIdentitySourceNames.IMDS, logger);
      } else {
        logger.info(`[Managed Identity] Unable to find ${ManagedIdentityEnvironmentVariableNames.AZURE_POD_IDENTITY_AUTHORITY_HOST} environment variable for ${ManagedIdentitySourceNames.IMDS}, using the default endpoint.`);
        validatedIdentityEndpoint = DEFAULT_IMDS_ENDPOINT;
      }
      return new Imds(logger, nodeStorage, networkClient, cryptoProvider, validatedIdentityEndpoint);
    }
    createRequest(resource, managedIdentityId) {
      const request = new ManagedIdentityRequestParameters(HttpMethod.GET, this.identityEndpoint);
      request.headers[METADATA_HEADER_NAME] = "true";
      request.queryParameters[API_VERSION_QUERY_PARAMETER_NAME] = IMDS_API_VERSION;
      request.queryParameters[RESOURCE_BODY_OR_QUERY_PARAMETER_NAME] = resource;
      if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
        request.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(managedIdentityId.idType)] = managedIdentityId.id;
      }
      return request;
    }
  }
  const SERVICE_FABRIC_MSI_API_VERSION = "2019-07-01-preview";
  class ServiceFabric extends BaseManagedIdentitySource {
    constructor(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint, identityHeader) {
      super(logger, nodeStorage, networkClient, cryptoProvider);
      this.identityEndpoint = identityEndpoint;
      this.identityHeader = identityHeader;
    }
    static getEnvironmentVariables() {
      const identityEndpoint = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT];
      const identityHeader = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_HEADER];
      const identityServerThumbprint = process.env[ManagedIdentityEnvironmentVariableNames.IDENTITY_SERVER_THUMBPRINT];
      return [identityEndpoint, identityHeader, identityServerThumbprint];
    }
    static tryCreate(logger, nodeStorage, networkClient, cryptoProvider, managedIdentityId) {
      const [identityEndpoint, identityHeader, identityServerThumbprint] = ServiceFabric.getEnvironmentVariables();
      if (!identityEndpoint || !identityHeader || !identityServerThumbprint) {
        logger.info(`[Managed Identity] ${ManagedIdentitySourceNames.SERVICE_FABRIC} managed identity is unavailable because one or all of the '${ManagedIdentityEnvironmentVariableNames.IDENTITY_HEADER}', '${ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT}' or '${ManagedIdentityEnvironmentVariableNames.IDENTITY_SERVER_THUMBPRINT}' environment variables are not defined.`);
        return null;
      }
      const validatedIdentityEndpoint = ServiceFabric.getValidatedEnvVariableUrlString(ManagedIdentityEnvironmentVariableNames.IDENTITY_ENDPOINT, identityEndpoint, ManagedIdentitySourceNames.SERVICE_FABRIC, logger);
      logger.info(`[Managed Identity] Environment variables validation passed for ${ManagedIdentitySourceNames.SERVICE_FABRIC} managed identity. Endpoint URI: ${validatedIdentityEndpoint}. Creating ${ManagedIdentitySourceNames.SERVICE_FABRIC} managed identity.`);
      if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
        logger.warning(`[Managed Identity] ${ManagedIdentitySourceNames.SERVICE_FABRIC} user assigned managed identity is configured in the cluster, not during runtime. See also: https://learn.microsoft.com/en-us/azure/service-fabric/configure-existing-cluster-enable-managed-identity-token-service.`);
      }
      return new ServiceFabric(logger, nodeStorage, networkClient, cryptoProvider, identityEndpoint, identityHeader);
    }
    createRequest(resource, managedIdentityId) {
      const request = new ManagedIdentityRequestParameters(HttpMethod.GET, this.identityEndpoint);
      request.headers[SERVICE_FABRIC_SECRET_HEADER_NAME] = this.identityHeader;
      request.queryParameters[API_VERSION_QUERY_PARAMETER_NAME] = SERVICE_FABRIC_MSI_API_VERSION;
      request.queryParameters[RESOURCE_BODY_OR_QUERY_PARAMETER_NAME] = resource;
      if (managedIdentityId.idType !== ManagedIdentityIdType.SYSTEM_ASSIGNED) {
        request.queryParameters[this.getManagedIdentityUserAssignedIdQueryParameterKey(managedIdentityId.idType)] = managedIdentityId.id;
      }
      return request;
    }
  }
  class ManagedIdentityClient {
    constructor(logger, nodeStorage, networkClient, cryptoProvider) {
      this.logger = logger;
      this.nodeStorage = nodeStorage;
      this.networkClient = networkClient;
      this.cryptoProvider = cryptoProvider;
    }
    async sendManagedIdentityTokenRequest(managedIdentityRequest, managedIdentityId, fakeAuthority, refreshAccessToken) {
      if (!ManagedIdentityClient.identitySource) {
        ManagedIdentityClient.identitySource = this.selectManagedIdentitySource(this.logger, this.nodeStorage, this.networkClient, this.cryptoProvider, managedIdentityId);
      }
      return ManagedIdentityClient.identitySource.acquireTokenWithManagedIdentity(managedIdentityRequest, managedIdentityId, fakeAuthority, refreshAccessToken);
    }
    allEnvironmentVariablesAreDefined(environmentVariables) {
      return Object.values(environmentVariables).every((environmentVariable) => {
        return environmentVariable !== void 0;
      });
    }
    /**
     * Determine the Managed Identity Source based on available environment variables. This API is consumed by ManagedIdentityApplication's getManagedIdentitySource.
     * @returns ManagedIdentitySourceNames - The Managed Identity source's name
     */
    getManagedIdentitySource() {
      ManagedIdentityClient.sourceName = this.allEnvironmentVariablesAreDefined(ServiceFabric.getEnvironmentVariables()) ? ManagedIdentitySourceNames.SERVICE_FABRIC : this.allEnvironmentVariablesAreDefined(AppService.getEnvironmentVariables()) ? ManagedIdentitySourceNames.APP_SERVICE : this.allEnvironmentVariablesAreDefined(CloudShell.getEnvironmentVariables()) ? ManagedIdentitySourceNames.CLOUD_SHELL : this.allEnvironmentVariablesAreDefined(AzureArc.getEnvironmentVariables()) ? ManagedIdentitySourceNames.AZURE_ARC : ManagedIdentitySourceNames.DEFAULT_TO_IMDS;
      return ManagedIdentityClient.sourceName;
    }
    /**
     * Tries to create a managed identity source for all sources
     * @returns the managed identity Source
     */
    selectManagedIdentitySource(logger, nodeStorage, networkClient, cryptoProvider, managedIdentityId) {
      const source = ServiceFabric.tryCreate(logger, nodeStorage, networkClient, cryptoProvider, managedIdentityId) || AppService.tryCreate(logger, nodeStorage, networkClient, cryptoProvider) || CloudShell.tryCreate(logger, nodeStorage, networkClient, cryptoProvider, managedIdentityId) || AzureArc.tryCreate(logger, nodeStorage, networkClient, cryptoProvider, managedIdentityId) || Imds.tryCreate(logger, nodeStorage, networkClient, cryptoProvider);
      if (!source) {
        throw createManagedIdentityError(unableToCreateSource);
      }
      return source;
    }
  }
  class ManagedIdentityApplication {
    constructor(configuration) {
      this.config = buildManagedIdentityConfiguration(configuration || {});
      this.logger = new Logger(this.config.system.loggerOptions, name, version2);
      const fakeStatusAuthorityOptions = {
        canonicalAuthority: Constants$1.DEFAULT_AUTHORITY
      };
      if (!ManagedIdentityApplication.nodeStorage) {
        ManagedIdentityApplication.nodeStorage = new NodeStorage(this.logger, this.config.managedIdentityId.id, DEFAULT_CRYPTO_IMPLEMENTATION, fakeStatusAuthorityOptions);
      }
      this.networkClient = this.config.system.networkClient;
      this.cryptoProvider = new CryptoProvider();
      const fakeAuthorityOptions = {
        protocolMode: ProtocolMode.AAD,
        knownAuthorities: [DEFAULT_AUTHORITY_FOR_MANAGED_IDENTITY],
        cloudDiscoveryMetadata: "",
        authorityMetadata: ""
      };
      this.fakeAuthority = new Authority(
        DEFAULT_AUTHORITY_FOR_MANAGED_IDENTITY,
        this.networkClient,
        ManagedIdentityApplication.nodeStorage,
        fakeAuthorityOptions,
        this.logger,
        this.cryptoProvider.createNewGuid(),
        // correlationID
        void 0,
        true
      );
      this.fakeClientCredentialClient = new ClientCredentialClient({
        authOptions: {
          clientId: this.config.managedIdentityId.id,
          authority: this.fakeAuthority
        }
      });
      this.managedIdentityClient = new ManagedIdentityClient(this.logger, ManagedIdentityApplication.nodeStorage, this.networkClient, this.cryptoProvider);
    }
    /**
     * Acquire an access token from the cache or the managed identity
     * @param managedIdentityRequest - the ManagedIdentityRequestParams object passed in by the developer
     * @returns the access token
     */
    async acquireToken(managedIdentityRequestParams) {
      if (!managedIdentityRequestParams.resource) {
        throw createClientConfigurationError(urlEmptyError);
      }
      const managedIdentityRequest = {
        forceRefresh: managedIdentityRequestParams.forceRefresh,
        resource: managedIdentityRequestParams.resource.replace("/.default", ""),
        scopes: [
          managedIdentityRequestParams.resource.replace("/.default", "")
        ],
        authority: this.fakeAuthority.canonicalAuthority,
        correlationId: this.cryptoProvider.createNewGuid()
      };
      if (managedIdentityRequestParams.claims || managedIdentityRequest.forceRefresh) {
        return this.managedIdentityClient.sendManagedIdentityTokenRequest(managedIdentityRequest, this.config.managedIdentityId, this.fakeAuthority);
      }
      const [cachedAuthenticationResult, lastCacheOutcome] = await this.fakeClientCredentialClient.getCachedAuthenticationResult(managedIdentityRequest, this.config, this.cryptoProvider, this.fakeAuthority, ManagedIdentityApplication.nodeStorage);
      if (cachedAuthenticationResult) {
        if (lastCacheOutcome === CacheOutcome.PROACTIVELY_REFRESHED) {
          this.logger.info("ClientCredentialClient:getCachedAuthenticationResult - Cached access token's refreshOn property has been exceeded'. It's not expired, but must be refreshed.");
          const refreshAccessToken = true;
          await this.managedIdentityClient.sendManagedIdentityTokenRequest(managedIdentityRequest, this.config.managedIdentityId, this.fakeAuthority, refreshAccessToken);
        }
        return cachedAuthenticationResult;
      } else {
        return this.managedIdentityClient.sendManagedIdentityTokenRequest(managedIdentityRequest, this.config.managedIdentityId, this.fakeAuthority);
      }
    }
    /**
     * Determine the Managed Identity Source based on available environment variables. This API is consumed by Azure Identity SDK.
     * @returns ManagedIdentitySourceNames - The Managed Identity source's name
     */
    getManagedIdentitySource() {
      return ManagedIdentityClient.sourceName || this.managedIdentityClient.getManagedIdentitySource();
    }
  }
  class DistributedCachePlugin {
    constructor(client, partitionManager) {
      this.client = client;
      this.partitionManager = partitionManager;
    }
    /**
     * Deserializes the cache before accessing it
     * @param cacheContext - TokenCacheContext
     */
    async beforeCacheAccess(cacheContext) {
      const partitionKey = await this.partitionManager.getKey();
      const cacheData = await this.client.get(partitionKey);
      cacheContext.tokenCache.deserialize(cacheData);
    }
    /**
     * Serializes the cache after accessing it
     * @param cacheContext - TokenCacheContext
     */
    async afterCacheAccess(cacheContext) {
      if (cacheContext.cacheHasChanged) {
        const kvStore = cacheContext.tokenCache.getKVStore();
        const accountEntities = Object.values(kvStore).filter((value) => AccountEntity.isAccountEntity(value));
        let partitionKey;
        if (accountEntities.length > 0) {
          const accountEntity = accountEntities[0];
          partitionKey = await this.partitionManager.extractKey(accountEntity);
        } else {
          partitionKey = await this.partitionManager.getKey();
        }
        await this.client.set(partitionKey, cacheContext.tokenCache.serialize());
      }
    }
  }
  exports.AuthError = AuthError;
  exports.AuthErrorCodes = AuthErrorCodes;
  exports.AuthErrorMessage = AuthErrorMessage;
  exports.AzureCloudInstance = AzureCloudInstance;
  exports.ClientApplication = ClientApplication;
  exports.ClientAssertion = ClientAssertion;
  exports.ClientAuthError = ClientAuthError;
  exports.ClientAuthErrorCodes = ClientAuthErrorCodes;
  exports.ClientAuthErrorMessage = ClientAuthErrorMessage;
  exports.ClientConfigurationError = ClientConfigurationError;
  exports.ClientConfigurationErrorCodes = ClientConfigurationErrorCodes;
  exports.ClientConfigurationErrorMessage = ClientConfigurationErrorMessage;
  exports.ClientCredentialClient = ClientCredentialClient;
  exports.ConfidentialClientApplication = ConfidentialClientApplication;
  exports.CryptoProvider = CryptoProvider;
  exports.DeviceCodeClient = DeviceCodeClient;
  exports.DistributedCachePlugin = DistributedCachePlugin;
  exports.InteractionRequiredAuthError = InteractionRequiredAuthError;
  exports.InteractionRequiredAuthErrorCodes = InteractionRequiredAuthErrorCodes;
  exports.InteractionRequiredAuthErrorMessage = InteractionRequiredAuthErrorMessage;
  exports.Logger = Logger;
  exports.ManagedIdentityApplication = ManagedIdentityApplication;
  exports.ManagedIdentitySourceNames = ManagedIdentitySourceNames;
  exports.NodeStorage = NodeStorage;
  exports.OnBehalfOfClient = OnBehalfOfClient;
  exports.PromptValue = PromptValue;
  exports.ProtocolMode = ProtocolMode;
  exports.PublicClientApplication = PublicClientApplication;
  exports.ResponseMode = ResponseMode;
  exports.ServerError = ServerError;
  exports.TokenCache = TokenCache;
  exports.TokenCacheContext = TokenCacheContext;
  exports.UsernamePasswordClient = UsernamePasswordClient;
  exports.internals = internals;
  exports.version = version2;
})(msalNode);
const msal = msalNode;
const debug$4 = srcExports("prismarine-auth");
let MsaTokenManager$1 = class MsaTokenManager {
  constructor(msalConfig2, scopes, cache) {
    this.msaClientId = msalConfig2.auth.clientId;
    this.scopes = scopes;
    this.cache = cache;
    const beforeCacheAccess = async (cacheContext) => {
      cacheContext.tokenCache.deserialize(JSON.stringify(await this.cache.getCached()));
    };
    const afterCacheAccess = async (cacheContext) => {
      if (cacheContext.cacheHasChanged) {
        await this.cache.setCachedPartial(JSON.parse(cacheContext.tokenCache.serialize()));
      }
    };
    const cachePlugin = {
      beforeCacheAccess,
      afterCacheAccess
    };
    msalConfig2.cache = {
      cachePlugin
    };
    this.msalApp = new msal.PublicClientApplication(msalConfig2);
    this.msalConfig = msalConfig2;
  }
  getUsers() {
    const accounts = this.msaCache.Account;
    const users = [];
    if (!accounts) return users;
    for (const account of Object.values(accounts)) {
      users.push(account);
    }
    return users;
  }
  async getAccessToken() {
    const { AccessToken: tokens } = await this.cache.getCached();
    if (!tokens) return;
    const account = Object.values(tokens).filter((t2) => t2.client_id === this.msaClientId)[0];
    if (!account) {
      debug$4("[msa] No valid access token found", tokens);
      return;
    }
    const until = new Date(account.expires_on * 1e3) - Date.now();
    const valid2 = until > 1e3;
    return { valid: valid2, until, token: account.secret };
  }
  async getRefreshToken() {
    const { RefreshToken: tokens } = await this.cache.getCached();
    if (!tokens) return;
    const account = Object.values(tokens).filter((t2) => t2.client_id === this.msaClientId)[0];
    if (!account) {
      debug$4("[msa] No valid refresh token found", tokens);
      return;
    }
    return { token: account.secret };
  }
  async refreshTokens() {
    const rtoken = await this.getRefreshToken();
    if (!rtoken) {
      throw new Error("Cannot refresh without refresh token");
    }
    const refreshTokenRequest = {
      refreshToken: rtoken.token,
      scopes: this.scopes
    };
    return new Promise((resolve, reject) => {
      this.msalApp.acquireTokenByRefreshToken(refreshTokenRequest).then((response) => {
        debug$4("[msa] refreshed token", JSON.stringify(response));
        resolve(response);
      }).catch((error2) => {
        debug$4("[msa] failed to refresh", JSON.stringify(error2));
        reject(error2);
      });
    });
  }
  async verifyTokens() {
    if (this.forceRefresh) try {
      await this.refreshTokens();
    } catch {
    }
    const at = await this.getAccessToken();
    const rt = await this.getRefreshToken();
    if (!at || !rt) {
      return false;
    }
    debug$4("[msa] have at, rt", at, rt);
    if (at.valid && rt) {
      return true;
    } else {
      try {
        await this.refreshTokens();
        return true;
      } catch (e) {
        console.warn("Error refreshing token", e);
        return false;
      }
    }
  }
  // Authenticate with device_code flow
  async authDeviceCode(dataCallback) {
    const deviceCodeRequest = {
      deviceCodeCallback: (resp) => {
        debug$4("[msa] device_code response: ", resp);
        dataCallback(resp);
      },
      scopes: this.scopes
    };
    return new Promise((resolve, reject) => {
      this.msalApp.acquireTokenByDeviceCode(deviceCodeRequest).then((response) => {
        debug$4("[msa] device_code resp", JSON.stringify(response));
        this.cache.getCached().then((cached) => {
          if (!cached.Account) {
            cached.Account = { "": response.account };
            this.cache.setCachedPartial(cached);
          }
          resolve(response);
        });
      }).catch((error2) => {
        console.warn("[msa] Error getting device code. Ensure your supplied `authTitle` token (or clientId in your supplied MSAL config) is valid and that it has permission to do non-interactive code based auth.");
        console.debug(JSON.stringify(error2));
        reject(error2);
      });
    });
  }
};
var MsaTokenManager_1 = MsaTokenManager$1;
const debug$3 = srcExports("prismarine-auth");
const { Endpoints: Endpoints$3 } = Constants;
const { checkStatusWithHelp } = Util;
let BedrockTokenManager$1 = class BedrockTokenManager {
  constructor(cache) {
    this.cache = cache;
  }
  async getCachedAccessToken() {
    const { mca: token } = await this.cache.getCached();
    debug$3("[mc] token cache", token);
    if (!token) return;
    debug$3("Auth token", token);
    const jwt = token.chain[0];
    const [header, payload, signature] = jwt.split(".").map((k) => Buffer.from(k, "base64"));
    const body = JSON.parse(String(payload));
    const expires = new Date(body.exp * 1e3);
    const remainingMs = expires - Date.now();
    const valid2 = remainingMs > 1e3;
    return { valid: valid2, until: expires, chain: token.chain, token: token.token || token.Token || "" };
  }
  async setCachedAccessToken(data) {
    await this.cache.setCachedPartial({
      mca: {
        ...data,
        obtainedOn: Date.now()
      }
    });
  }
  async verifyTokens() {
    const at = await this.getCachedAccessToken();
    if (!at || this.forceRefresh) {
      return false;
    }
    debug$3("[mc] have user access token", at);
    if (at.valid) {
      return true;
    }
    return false;
  }
  async getAccessToken(clientPublicKey, xsts) {
    debug$3("[mc] authing to minecraft", clientPublicKey, xsts);
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "MCPE/UWP",
      Authorization: `XBL3.0 x=${xsts.userHash};${xsts.XSTSToken}`
    };
    const MineServicesResponse = await fetch(Endpoints$3.minecraftBedrock.authenticate, {
      method: "post",
      headers,
      body: JSON.stringify({ identityPublicKey: clientPublicKey })
    }).then(checkStatusWithHelp({ 401: "Ensure that you are able to sign-in to Minecraft with this account" }));
    debug$3("[mc] mc auth response", MineServicesResponse);
    await this.setCachedAccessToken(MineServicesResponse);
    return MineServicesResponse;
  }
};
var MinecraftBedrockTokenManager = BedrockTokenManager$1;
const debug$2 = srcExports("prismarine-auth");
const { Endpoints: Endpoints$2 } = Constants;
let PlayfabTokenManager$1 = class PlayfabTokenManager {
  constructor(cache) {
    this.cache = cache;
  }
  async setCachedAccessToken(data) {
    await this.cache.setCachedPartial(data);
  }
  async getCachedAccessToken() {
    const { pfb: cache } = await this.cache.getCached();
    debug$2("[pf] token cache", cache);
    if (!cache) return;
    const expires = new Date(cache.EntityToken.TokenExpiration);
    const remaining = expires - Date.now();
    const valid2 = remaining > 1e3;
    return { valid: valid2, until: expires, data: cache };
  }
  async getAccessToken(xsts) {
    const response = await fetch(Endpoints$2.PlayfabLoginWithXbox, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        CreateAccount: true,
        EncryptedRequest: null,
        InfoRequestParameters: {
          GetCharacterInventories: false,
          GetCharacterList: false,
          GetPlayerProfile: true,
          GetPlayerStatistics: false,
          GetTitleData: false,
          GetUserAccountInfo: true,
          GetUserData: false,
          GetUserInventory: false,
          GetUserReadOnlyData: false,
          GetUserVirtualCurrency: false,
          PlayerStatisticNames: null,
          ProfileConstraints: null,
          TitleDataKeys: null,
          UserDataKeys: null,
          UserReadOnlyDataKeys: null
        },
        PlayerSecret: null,
        TitleId: "20CA2",
        XboxToken: `XBL3.0 x=${xsts.userHash};${xsts.XSTSToken}`
      })
    });
    const data = await response.json();
    await this.setCachedAccessToken({ pfb: data.data });
    return data.data;
  }
};
var PlayfabTokenManager_1 = PlayfabTokenManager$1;
const debug$1 = srcExports("prismarine-auth");
const { Endpoints: Endpoints$1 } = Constants;
const { checkStatus } = Util;
class MinecraftBedrockServicesTokenManager {
  constructor(cache) {
    this.cache = cache;
  }
  async getCachedAccessToken() {
    const { mcs: token } = await this.cache.getCached();
    debug$1("[mcs] token cache", token);
    if (!token) return { valid: false };
    const expires = new Date(token.validUntil);
    const remainingMs = expires - Date.now();
    const valid2 = remainingMs > 1e3;
    return { valid: valid2, until: expires, token: token.mcToken, data: token };
  }
  async setCachedToken(data) {
    await this.cache.setCachedPartial(data);
  }
  async getAccessToken(sessionTicket, options = {}) {
    const response = await fetch(Endpoints$1.minecraftBedrock.servicesSessionStart, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device: {
          applicationType: options.applicationType ?? "MinecraftPE",
          gameVersion: options.version ?? "1.20.62",
          id: options.deviceId ?? "c1681ad3-415e-30cd-abd3-3b8f51e771d1",
          memory: options.deviceMemory ?? String(8 * (1024 * 1024 * 1024)),
          platform: options.platform ?? "Windows10",
          playFabTitleId: options.playFabtitleId ?? "20CA2",
          storePlatform: options.storePlatform ?? "uwp.store",
          type: options.type ?? "Windows10"
        },
        user: {
          token: sessionTicket,
          tokenType: "PlayFab"
        }
      })
    }).then(checkStatus);
    const tokenResponse = {
      mcToken: response.result.authorizationHeader,
      validUntil: response.result.validUntil,
      treatments: response.result.treatments,
      configurations: response.result.configurations,
      treatmentContext: response.result.treatmentContext
    };
    debug$1("[mc] mc-services token response", tokenResponse);
    await this.setCachedToken({ mcs: tokenResponse });
    return tokenResponse;
  }
  async getMultiplayerToken(serviceToken, publicKey) {
    var _a;
    const response = await fetch(Endpoints$1.minecraftBedrock.multiplayerSessionStart, {
      method: "post",
      headers: {
        accept: "*/*",
        authorization: serviceToken,
        "content-type": "application/json",
        "User-Agent": "libhttpclient/1.0.0.0",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate, br"
      },
      body: JSON.stringify({ publicKey })
    }).then(checkStatus);
    return ((_a = response == null ? void 0 : response.result) == null ? void 0 : _a.signedToken) || (response == null ? void 0 : response.signedToken) || "";
  }
}
var MinecraftBedrockServicesManager = MinecraftBedrockServicesTokenManager;
const fs = require$$0$1;
const path = require$$6;
const crypto = crypto$6;
const debug = srcExports("prismarine-auth");
const Titles = Titles$1;
const { createHash } = Util;
const { Endpoints, msalConfig } = Constants;
const FileCache2 = FileCache_1;
const LiveTokenManager2 = LiveTokenManager_1;
const JavaTokenManager = MinecraftJavaTokenManager_1;
const XboxTokenManager2 = XboxTokenManager_1;
const MsaTokenManager2 = MsaTokenManager_1;
const BedrockTokenManager2 = MinecraftBedrockTokenManager;
const PlayfabTokenManager2 = PlayfabTokenManager_1;
const MinecraftServicesTokenManager = MinecraftBedrockServicesManager;
async function retry(methodFn, beforeRetry, times) {
  while (times--) {
    if (times !== 0) {
      try {
        return await methodFn();
      } catch (e) {
        if (e instanceof URIError) {
          throw e;
        } else {
          debug(e);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      await beforeRetry();
    } else {
      return await methodFn();
    }
  }
}
const CACHE_IDS = ["msal", "live", "sisu", "xbl", "bed", "mca", "mcs", "pfb"];
class MicrosoftAuthFlow {
  constructor(username = "", cache = __dirname, options, codeCallback) {
    this.username = username;
    if (options && !options.flow) {
      throw new Error("Missing 'flow' argument in options. See docs for more information.");
    }
    this.options = options || { flow: "live", authTitle: Titles.MinecraftNintendoSwitch };
    this.initTokenManagers(username, cache, options == null ? void 0 : options.forceRefresh);
    this.codeCallback = codeCallback;
  }
  initTokenManagers(username, cache, forceRefresh) {
    if (typeof cache !== "function") {
      let cachePath = cache;
      debug(`Using cache path: ${cachePath}`);
      try {
        if (!fs.existsSync(cachePath)) {
          fs.mkdirSync(cachePath, { recursive: true });
        }
      } catch (e) {
        console.log("Failed to open cache dir", e, " ... will use current dir");
        cachePath = __dirname;
      }
      cache = ({ cacheName, username: username2 }) => {
        if (!CACHE_IDS.includes(cacheName)) {
          throw new Error(`Cannot instantiate cache for unknown ID: '${cacheName}'`);
        }
        const hash = createHash(username2);
        const result = new FileCache2(path.join(cachePath, `./${hash}_${cacheName}-cache.json`));
        if (forceRefresh) {
          result.reset();
        }
        return result;
      };
    }
    if (this.options.flow === "live" || this.options.flow === "sisu") {
      if (!this.options.authTitle) throw new Error(`Please specify an "authTitle" in Authflow constructor when using ${this.options.flow} flow`);
      this.msa = new LiveTokenManager2(this.options.authTitle, ["service::user.auth.xboxlive.com::MBI_SSL"], cache({ cacheName: this.options.flow, username }));
      this.doTitleAuth = true;
    } else if (this.options.flow === "msal") {
      let config2 = this.options.msalConfig;
      if (!config2) {
        config2 = structuredClone(msalConfig);
        if (!this.options.authTitle) throw new Error("Must specify an Azure client ID token inside the `authTitle` parameter when using Azure-based auth. See https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app#register-an-application for more information on obtaining an Azure token.");
        config2.auth.clientId = this.options.authTitle;
      }
      this.msa = new MsaTokenManager2(config2, ["XboxLive.signin", "offline_access"], cache({ cacheName: "msal", username }));
    } else {
      throw new Error(`Unknown flow: ${this.options.flow} (expected "live", "sisu", or "msal")`);
    }
    const keyPair = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
    this.xbl = new XboxTokenManager2(keyPair, cache({ cacheName: "xbl", username }));
    this.mba = new BedrockTokenManager2(cache({ cacheName: "bed", username }));
    this.mca = new JavaTokenManager(cache({ cacheName: "mca", username }));
    this.mcs = new MinecraftServicesTokenManager(cache({ cacheName: "mcs", username }));
    this.pfb = new PlayfabTokenManager2(cache({ cacheName: "pfb", username }));
  }
  async getMsaToken() {
    if (await this.msa.verifyTokens()) {
      debug("[msa] Using existing tokens");
      const { token } = await this.msa.getAccessToken();
      return token;
    } else {
      debug("[msa] No valid cached tokens, need to sign in");
      const ret = await this.msa.authDeviceCode((response) => {
        if (this.codeCallback) return this.codeCallback(response);
        console.info("[msa] First time signing in. Please authenticate now:");
        console.info(response.message);
      });
      if (ret.account) {
        console.info(`[msa] Signed in as ${ret.account.username}`);
      } else {
        console.info("[msa] Signed in with Microsoft");
      }
      debug("[msa] got auth result", ret);
      return ret.accessToken;
    }
  }
  async getPlayfabLogin() {
    const cache = this.pfb.getCachedAccessToken();
    if (cache.valid) {
      return cache.data;
    }
    const xsts = await this.getXboxToken(Endpoints.PlayfabRelyingParty);
    const playfab = await this.pfb.getAccessToken(xsts);
    return playfab;
  }
  async getMinecraftBedrockServicesToken({ version: version2 = "1.20.62" }) {
    version2 = version2.startsWith("1.") ? version2 : `1.${version2}`;
    const cache = await this.mcs.getCachedAccessToken();
    if (cache.valid) {
      return cache.data;
    }
    const playfab = await this.getPlayfabLogin();
    const mcs = await this.mcs.getAccessToken(playfab.SessionTicket, { version: version2 });
    return mcs;
  }
  async getXboxToken(relyingParty = this.options.relyingParty || Endpoints.xbox.relyingParty, forceRefresh = false) {
    const options = { ...this.options, relyingParty };
    const { xstsToken, userToken, deviceToken, titleToken } = await this.xbl.getCachedTokens(relyingParty);
    if (xstsToken.valid && !forceRefresh) {
      debug("[xbl] Using existing XSTS token");
      return xstsToken.data;
    }
    if (options.password) {
      debug("[xbl] password is present, trying to authenticate using xboxreplay/xboxlive-auth");
      const xsts = await this.xbl.doReplayAuth(this.username, options.password, options);
      return xsts;
    }
    debug("[xbl] Need to obtain tokens");
    return await retry(async () => {
      const msaToken = await this.getMsaToken();
      if (options.flow === "sisu" && (!userToken.valid || !deviceToken.valid || !titleToken.valid)) {
        debug(`[xbl] Sisu flow selected, trying to authenticate with authTitle ID ${options.authTitle}`);
        const dt2 = await this.xbl.getDeviceToken(options);
        const sisu = await this.xbl.doSisuAuth(msaToken, dt2, options);
        return sisu;
      }
      const ut = userToken.token ?? await this.xbl.getUserToken(msaToken, options.flow === "msal");
      const dt = deviceToken.token ?? await this.xbl.getDeviceToken(options);
      const tt = titleToken.token ?? (this.doTitleAuth ? await this.xbl.getTitleToken(msaToken, dt) : void 0);
      const xsts = await this.xbl.getXSTSToken({ userToken: ut, deviceToken: dt, titleToken: tt }, options);
      return xsts;
    }, () => {
      this.msa.forceRefresh = true;
    }, 2);
  }
  async getMinecraftJavaToken(options = {}) {
    const response = { token: "", entitlements: {}, profile: {} };
    if (await this.mca.verifyTokens()) {
      debug("[mc] Using existing tokens");
      const { token } = await this.mca.getCachedAccessToken();
      response.token = token;
    } else {
      debug("[mc] Need to obtain tokens");
      await retry(async () => {
        const xsts = await this.getXboxToken(Endpoints.minecraftJava.XSTSRelyingParty);
        debug("[xbl] xsts data", xsts);
        response.token = await this.mca.getAccessToken(xsts);
      }, () => {
        this.xbl.forceRefresh = true;
      }, 2);
    }
    if (options.fetchEntitlements) {
      response.entitlements = await this.mca.fetchEntitlements(response.token).catch((e) => debug("Failed to obtain entitlement data", e));
    }
    if (options.fetchProfile) {
      response.profile = await this.mca.fetchProfile(response.token).catch((e) => debug("Failed to obtain profile data", e));
    }
    if (options.fetchCertificates) {
      response.certificates = await this.mca.fetchCertificates(response.token).catch((e) => debug("Failed to obtain keypair data", e));
    }
    if (options.fetchAttributes) {
      response.attributes = await this.mca.fetchAttributes(response.token).catch((e) => debug("Failed to obtain attributes data", e));
    }
    return response;
  }
  async getMinecraftBedrockChain(publicKey) {
    if (await this.mba.verifyTokens() && false) ;
    else {
      if (!publicKey) throw new Error("Need to specifiy a ECDH x509 URL encoded public key");
      debug("[mc] Need to obtain tokens");
      return await retry(async () => {
        const xsts = await this.getXboxToken(Endpoints.minecraftBedrock.XSTSRelyingParty);
        debug("[xbl] xsts data", xsts);
        const token = await this.mba.getAccessToken(publicKey, xsts);
        const body = JSON.parse(Buffer.from(token.chain[1].split(".")[1], "base64").toString());
        if (!body.extraData.titleId && this.doTitleAuth) {
          throw Error("missing titleId in response");
        }
        return token.chain;
      }, () => {
        this.xbl.forceRefresh = true;
      }, 2);
    }
  }
  async getMinecraftBedrockMultiplayerToken(publicKey, options = {}) {
    if (!publicKey) throw new Error("Need to specifiy a ECDH x509 URL encoded public key");
    const { mcToken } = await this.getMinecraftBedrockServicesToken(options);
    if (!mcToken) throw new Error("Failed to obtain Minecraft Bedrock services token");
    return await this.mcs.getMultiplayerToken(mcToken, publicKey);
  }
  async getMinecraftBedrockToken(publicKey, options = {}) {
    const chain = await this.getMinecraftBedrockChain(publicKey);
    const token = await this.getMinecraftBedrockMultiplayerToken(publicKey, options);
    return { chain, token };
  }
}
var MicrosoftAuthFlow_1 = MicrosoftAuthFlow;
if (typeof process !== "undefined" && parseInt(process.versions.node.split(".")[0]) < 14) {
  console.error("Your node version is currently", process.versions.node);
  console.error("Please update it to a version >= 14.x.x from https://nodejs.org/");
  process.exit(1);
}
var prismarineAuth = {
  Authflow: MicrosoftAuthFlow_1,
  Titles: Titles$1
};
let mainWindowRef = null;
function setAuthMainWindow(win2) {
  mainWindowRef = win2;
}
function getSkinsDir() {
  return path$1.join(app.getPath("userData"), "skins");
}
function getAuthCacheDir() {
  return path$1.join(app.getPath("userData"), "auth-cache");
}
async function downloadAndSaveSkin(uuid, skinUrl) {
  await promises.mkdir(getSkinsDir(), { recursive: true });
  const res = await fetch(skinUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path$1.join(getSkinsDir(), `${uuid}.png`);
  await promises.writeFile(filePath, buffer);
  return `${uuid}.png`;
}
function loginWithPrismarine(showDeviceCodeUI) {
  return new Promise((resolve, reject) => {
    let codeWasShown = false;
    const flow = new prismarineAuth.Authflow(
      "nimbus-launcher-user",
      getAuthCacheDir(),
      {
        flow: "live",
        authTitle: prismarineAuth.Titles.MinecraftNintendoSwitch,
        deviceType: "Nintendo"
      },
      (deviceCode) => {
        codeWasShown = true;
        if (!showDeviceCodeUI) {
          reject(new Error("AUTH_REQUIRED"));
          return;
        }
        mainWindowRef == null ? void 0 : mainWindowRef.webContents.send("auth:device-code", {
          code: deviceCode.user_code,
          url: deviceCode.verification_uri
        });
      }
    );
    flow.getMinecraftJavaToken({ fetchProfile: true }).then(resolve).catch((err) => {
      if (!codeWasShown) reject(err);
    });
  });
}
async function processLoginResult(result) {
  var _a, _b;
  const profile = result.profile;
  const activeSkin = ((_a = profile.skins) == null ? void 0 : _a.find((s) => s.state === "ACTIVE")) ?? ((_b = profile.skins) == null ? void 0 : _b[0]);
  let localSkinPath = null;
  if (activeSkin == null ? void 0 : activeSkin.url) {
    localSkinPath = await downloadAndSaveSkin(profile.id, activeSkin.url);
  }
  return {
    profile: { uuid: profile.id, username: profile.name },
    localSkinPath
  };
}
function registerAuthHandlers() {
  ipcMain.handle("auth:login", async () => {
    const result = await loginWithPrismarine(true);
    return processLoginResult(result);
  });
  ipcMain.handle("auth:restore-session", async () => {
    try {
      const result = await loginWithPrismarine(false);
      return processLoginResult(result);
    } catch {
      return null;
    }
  });
  ipcMain.handle("auth:logout", async () => {
    await promises.rm(getAuthCacheDir(), { recursive: true, force: true });
  });
  ipcMain.handle("shell:open-external", (_event, url) => {
    shell.openExternal(url);
  });
}
function registerAppFileProtocol() {
  protocol.handle("app-file", async (request) => {
    const url = new URL(request.url);
    const fileName = decodeURIComponent(url.pathname).replace(/^\//, "");
    const filePath = path$1.join(getSkinsDir(), fileName);
    try {
      const data = await promises.readFile(filePath);
      return new Response(data, {
        headers: {
          "Cache-Control": "no-store"
        }
      });
    } catch {
      return new Response(null, { status: 404 });
    }
  });
}
process.env.DEBUG = "prismarine-auth";
createRequire(import.meta.url);
const __dirname$1 = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win = null;
function createWindow() {
  win = new BrowserWindow(
    {
      width: 1080,
      height: 720,
      minWidth: 1040,
      minHeight: 620,
      frame: false,
      show: false,
      autoHideMenuBar: true,
      icon: path$1.join(process.env.VITE_PUBLIC, "Logo.png"),
      webPreferences: {
        preload: path$1.join(MAIN_DIST, "preload.cjs"),
        sandbox: false
      }
    }
  );
  setAuthMainWindow(win);
  registerAuthHandlers();
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
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
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
      stream: true
    }
  }
]);
app.whenReady().then(() => {
  registerAppFileProtocol();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
