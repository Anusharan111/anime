import dotenv from "dotenv";
import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import express from "express";
import app from "./api/index.js";

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || "5174", 10);

async function startServer() {
  const httpServer = createServer(app);

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Anime Battle local server listening on port ${PORT}`);
  });
}

startServer();
