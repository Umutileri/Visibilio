import { Pool } from "pg";
import type { VisibilioStorage } from "./storage";
import { createPostgresStorage } from "./postgresStorage";
import { createInMemoryStorage } from "./storage";

export type StorageMode = "memory" | "postgres";

export async function createStorageFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): Promise<VisibilioStorage & { pool?: Pool }> {
  const mode = env.VISIBILIO_STORAGE ?? (env.DATABASE_URL ? "postgres" : "memory");

  if (mode === "memory") {
    return createInMemoryStorage();
  }

  if (mode !== "postgres") {
    throw new Error(`Unsupported VISIBILIO_STORAGE mode: ${mode}`);
  }

  if (!env.DATABASE_URL) {
    throw new Error("VISIBILIO_STORAGE=postgres requires DATABASE_URL.");
  }

  const storage = createPostgresStorage(env.DATABASE_URL);
  await storage.pool.query("SELECT 1");
  return storage;
}
