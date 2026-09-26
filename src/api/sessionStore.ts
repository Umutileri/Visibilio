import type { ScanSession } from "./sessionTypes";
import { createInMemoryStorage } from "./storage";

export interface ScanSessionStore {
  create(session: ScanSession): Promise<ScanSession>;
  get(id: string): Promise<ScanSession | null>;
  update(session: ScanSession): Promise<ScanSession>;
  list(siteKey?: string): Promise<ScanSession[]>;
}

export class InMemoryScanSessionStore implements ScanSessionStore {
  private readonly repository = createInMemoryStorage().scans;

  create(session: ScanSession): Promise<ScanSession> {
    return this.repository.create(session);
  }

  get(id: string): Promise<ScanSession | null> {
    return this.repository.get(id);
  }

  update(session: ScanSession): Promise<ScanSession> {
    return this.repository.update(session);
  }

  list(siteKey?: string): Promise<ScanSession[]> {
    return this.repository.list(siteKey);
  }
}

export const defaultScanSessionStore: ScanSessionStore = createInMemoryStorage().scans;
