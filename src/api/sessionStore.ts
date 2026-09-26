import type { ScanSession } from "./sessionTypes";
import { defaultStorage } from "./storage";

export interface ScanSessionStore {
  create(session: ScanSession): Promise<ScanSession>;
  get(id: string): Promise<ScanSession | null>;
  update(session: ScanSession): Promise<ScanSession>;
  list(siteKey?: string): Promise<ScanSession[]>;
}

export const defaultScanSessionStore: ScanSessionStore = defaultStorage.scans;

export { defaultStorage };
