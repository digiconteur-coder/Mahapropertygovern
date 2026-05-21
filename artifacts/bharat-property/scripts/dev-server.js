/**
 * Dev wrapper for Expo on Replit.
 *
 * Immediately opens PORT with a /status health-check endpoint so that
 * Replit's workflow system can confirm the process is alive. Meanwhile,
 * starts the Expo Metro bundler in the background and proxies requests
 * once Metro is ready.
 */

const http = require("http");
const { spawn, execSync } = require("child_process");
const path = require("path");

const PORT = parseInt(process.env.PORT || "24533", 10);
const METRO_PORT = 19000; // Fixed internal Metro port far from PORT

let metroPort = METRO_PORT;
let metroReady = false;

const LOADING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="refresh" content="4"/>
<title>Bharat Property Card System</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1e3a8a;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#fff}
  .brand{font-size:22px;font-weight:700;letter-spacing:0.5px;margin-bottom:6px}
  .sub{font-size:14px;opacity:.7;margin-bottom:40px}
  .spinner{width:44px;height:44px;border:3px solid rgba(255,255,255,.25);border-top-color:#f97316;border-radius:50%;animation:spin 0.9s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .msg{margin-top:24px;font-size:13px;opacity:.6}
</style>
</head>
<body>
  <div class="brand">Bharat Property Card System</div>
  <div class="sub">Government Property Management Platform</div>
  <div class="spinner"></div>
  <div class="msg">Metro bundler starting, page will reload automatically...</div>
</body>
</html>`;

function proxyRequest(req, res) {
  const headers = { ...req.headers, host: `localhost:${metroPort}` };
  // Remove headers that cause Metro's CORS middleware to reject the request
  delete headers["origin"];
  delete headers["referer"];
  const opts = {
    hostname: "localhost",
    port: metroPort,
    path: req.url,
    method: req.method,
    headers,
  };
  const proxy = http.request(opts, (pr) => {
    res.writeHead(pr.statusCode, pr.headers);
    pr.pipe(res);
  });
  proxy.on("error", () => {
    res.writeHead(502);
    res.end("Metro not ready");
  });
  req.pipe(proxy);
}

const server = http.createServer((req, res) => {
  const url = req.url || "/";
  if (url === "/status" || url.startsWith("/status?")) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", metroReady }));
    return;
  }
  if (metroReady) {
    proxyRequest(req, res);
  } else {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(LOADING_HTML);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[dev-server] Listening on port ${PORT}`);
  launchMetro();
  waitForMetro();
});

function launchMetro() {
  // Kill anything on METRO_PORT
  try {
    execSync(`kill $(cat /proc/net/tcp | awk 'NR>1{a=$2;split(a,p,":");x=0+("0x"p[2]);if(x==${METRO_PORT})print NR}' 2>/dev/null) 2>/dev/null`, { stdio: "ignore" });
  } catch (_) {}

  const env = {
    ...process.env,
    EXPO_PACKAGER_PROXY_URL: `https://${process.env.REPLIT_EXPO_DEV_DOMAIN || ""}`,
    EXPO_PUBLIC_DOMAIN: process.env.REPLIT_DEV_DOMAIN || "",
    EXPO_PUBLIC_REPL_ID: process.env.REPL_ID || "",
    REACT_NATIVE_PACKAGER_HOSTNAME: process.env.REPLIT_DEV_DOMAIN || "",
  };

  const projectRoot = path.resolve(__dirname, "..");
  const metro = spawn(
    "pnpm",
    ["exec", "expo", "start", "--localhost", "--port", String(METRO_PORT)],
    { stdio: ["pipe", "pipe", "pipe"], cwd: projectRoot, env }
  );

  // Send 'y' in case it asks about port conflict
  setTimeout(() => { try { metro.stdin.write("y\n"); } catch (_) {} }, 1500);

  let buffer = "";
  const onData = (data) => {
    const txt = data.toString();
    buffer += txt;
    process.stdout.write(txt);

    // Detect actual port Metro chose (in case it bumped)
    const m = buffer.match(/Web is waiting on http:\/\/localhost:(\d+)/);
    if (m) {
      const detected = parseInt(m[1], 10);
      if (detected !== metroPort) {
        console.log(`[dev-server] Metro chose port ${detected}`);
        metroPort = detected;
      }
    }
  };

  metro.stdout.on("data", onData);
  metro.stderr.on("data", (d) => process.stderr.write(d));

  metro.on("error", (e) => console.error("[metro error]", e.message));
  metro.on("exit", (code) => {
    console.log("[metro] exited", code);
    process.exit(code || 0);
  });

  const cleanup = () => { try { metro.kill(); } catch (_) {} };
  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
}

async function waitForMetro() {
  for (let i = 0; i < 180; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    if (await checkMetro()) {
      console.log(`[dev-server] Metro ready on port ${metroPort}`);
      metroReady = true;
      return;
    }
  }
  console.warn("[dev-server] Metro did not become ready in 6 minutes");
}

function checkMetro() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${metroPort}/status`, (res) => {
      resolve(res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
  });
}
