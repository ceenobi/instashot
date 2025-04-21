import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function connectToDb() {
  try {
    await prisma.$connect();
    console.log("Connected to the database!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

export { connectToDb };
