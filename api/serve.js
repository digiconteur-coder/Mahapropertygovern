const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "artifacts", "bharat-property");
const STATIC_ROOT = path.join(PROJECT_ROOT, "static-build");
const TEMPLATE_PATH = path.join(PROJECT_ROOT, "server", "templates", "landing-page.html");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
};

function getAppName() {
  try {
    const appJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "app.json"), "utf-8"));
    return appJson.expo?.name || "Bharat Property Card";
  } catch {
    return "Bharat Property Card";
  }
}

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: `Manifest not found for platform: ${platform}` }));
    return;
  }
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.end(manifest);
}

function serveLandingPage(req, res) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    res.statusCode = 503;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end("<h1>Build not ready</h1><p>The app bundle has not been built yet. Trigger a Vercel redeploy to build it.</p>");
    return;
  }
  const forwardedProto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const baseUrl = `${forwardedProto}://${host}`;
  const expsUrl = host;
  const appName = getAppName();
  const html = fs.readFileSync(TEMPLATE_PATH, "utf-8")
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.statusCode = 200;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(html);
}

function serveStaticFile(urlPath, res) {
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(STATIC_ROOT, safePath);
  if (!filePath.startsWith(STATIC_ROOT)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.end("Not Found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  res.statusCode = 200;
  res.setHeader("content-type", contentType);
  res.end(fs.readFileSync(filePath));
}

module.exports = (req, res) => {
  const url = new URL(req.url || "/", `https://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === "/" || pathname === "/manifest") {
    const platform = req.headers["expo-platform"];
    if (platform === "ios" || platform === "android") {
      return serveManifest(platform, res);
    }
    if (pathname === "/") {
      return serveLandingPage(req, res);
    }
  }

  serveStaticFile(pathname, res);
};
