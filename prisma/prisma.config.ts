import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:fhgofKHbHsyMWujHEPvEndFqyGEtxDSV@switchyard.proxy.rlwy.net:20496/railway",
  },
});