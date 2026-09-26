import { createPostgresStorage } from "./postgresStorage";
import type { VisibilioStorage } from "./storage";
import { createInMemoryStorage } from "./storage";

export type StorageMode = "memory" | "postgres";

export function createStorageFromEnv(env: NodeJS.ProcessEnv = process.env): VisibilioStorage & { pool?: ReturnType<typeof createPostgresStorage>["pool"] } {
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

  return createPostgresStorage(env.DATABASE_URL);
}
