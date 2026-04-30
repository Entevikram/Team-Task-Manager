import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envConfig = readFileSync(resolve(__dirname, "..", ".env"), "utf-8");
const dbUrlMatch = envConfig.match(/DATABASE_URL=(.*)/);
const connectionString = dbUrlMatch?.[1];
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;