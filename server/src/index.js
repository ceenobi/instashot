import { PrismaClient } from '@prisma/client';
import { connectToDb } from "./db/connection.js";
import { httpServer } from "./app.js";

const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();
let server;

// Centralized error handler
const handleError = (type, error) => {
  console.error(`❌ ${type}:`, error);
  return type.includes('UNCAUGHT') || type.includes('UNHANDLED') 
    ? gracefulShutdown(type)
    : process.exit(1);
};

async function startServer() {
  try {
    await connectToDb();
    console.log("✅ Database connection established");

    server = httpServer.listen(PORT, () => {
      console.log(`
🚀 Server started successfully
✅ Server is running on port ${PORT}
📚 API Documentation: http://localhost:${PORT}/api-docs
🌐 Environment: ${process.env.NODE_ENV || "development"}
`);
    });

    // Event handlers
    server.on("error", (error) => handleError('Server error', error));
    process.on("uncaughtException", (error) => handleError('Uncaught Exception', error));
    process.on("unhandledRejection", (error) => handleError('Unhandled Rejection', error));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    handleError('Failed to start server', error);
  }
}

async function gracefulShutdown(signal) {
  console.log(`\n${signal} signal received. Starting graceful shutdown...`);

  try {
    const shutdownTasks = [
      // Close server
      server && new Promise((resolve) => {
        server.close((err) => {
          console.log(err 
            ? "❌ Error closing server" 
            : "✅ Server closed successfully"
          );
          resolve();
        });
      }),
      // Close database
      prisma.$disconnect()
        .then(() => console.log("✅ Database connection closed"))
        .catch((err) => console.error("❌ Error closing database connection:", err))
    ];

    await Promise.allSettled(shutdownTasks);
    console.log("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
}

startServer();
