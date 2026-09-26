import type { ScanSession } from "./sessionTypes";
import { createInMemoryStorage, defaultStorage } from "./storage";

export interface ScanSessionStore {
  create(session: ScanSession): Promise<ScanSession>;
  get(id: string): Promise<ScanSession | null>;
  update(session: ScanSession): Promise<ScanSession>;
  list(siteKey?: string): Promise<ScanSession[]>;
}

export const defaultScanSessionStore: ScanSessionStore = defaultStorage.scans;

export class InMemoryScanSessionStore implements ScanSessionStore {
  private readonly store = createInMemoryStorage().scans;

  create(session: ScanSession): Promise<ScanSession> {
    return this.store.create(session);
  }

  get(id: string): Promise<ScanSession | null> {
    return this.store.get(id);
  }

  update(session: ScanSession): Promise<ScanSession> {
    return this.store.update(session);
  }

  list(siteKey?: string): Promise<ScanSession[]> {
    return this.store.list(siteKey);
  }
}

export { defaultStorage };
