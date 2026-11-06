import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createApp } from "./app.js";

const app = createApp();
const PORT = Number(process.env.PORT) || 3001;

// Production static file serving
const clientDistPath = path.resolve(process.cwd(), "dist/client");
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving production static files from ${clientDistPath}`);

  // Serve static assets
  app.use(
    "/*",
    serveStatic({
      root: "./dist/client",
    }),
  );

  // SPA fallback for HTML5 routing
  app.get("*", async (c) => {
    const indexPath = path.join(clientDistPath, "index.html");
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, "utf-8");
      return c.html(html);
    }
    return c.text("Not Found", 404);
  });
}

console.log(`[Server] Starting Stamps Mini Test Server on port ${PORT}...`);
serve({
  fetch: app.fetch,
  port: PORT,
});
console.log(`[Server] Server ready at http://localhost:${PORT}`);
