import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/environment.js";

async function startServer() {
  try {
    // Attempt database connection
    await connectDB();
  } catch (error) {
    console.warn(
      `[Startup Warning] Server starting without active database connection: ${error.message}`
    );
  }

  const server = app.listen(env.PORT, () => {
    console.log(`===================================================`);
    console.log(` ElectionVerify AI Shared Backend`);
    console.log(` Environment : ${env.NODE_ENV}`);
    console.log(` Listening on: http://localhost:${env.PORT}`);
    console.log(` Health Check: http://localhost:${env.PORT}/health`);
    console.log(` API Base    : http://localhost:${env.PORT}/api`);
    console.log(`===================================================`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[Shutdown] Received ${signal}. Closing HTTP server...`);
    server.close(async () => {
      console.log("[Shutdown] HTTP server closed.");
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer();
