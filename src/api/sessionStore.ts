import type { ScanSession } from "./sessionTypes";

export interface ScanSessionStore {
  create(session: ScanSession): Promise<ScanSession>;
  get(id: string): Promise<ScanSession | null>;
  list(): Promise<ScanSession[]>;
}

export class InMemoryScanSessionStore implements ScanSessionStore {
  private readonly sessions = new Map<string, ScanSession>();

  async create(session: ScanSession): Promise<ScanSession> {
    this.sessions.set(session.id, session);
    return session;
  }

  async get(id: string): Promise<ScanSession | null> {
    return this.sessions.get(id) ?? null;
  }

  async list(): Promise<ScanSession[]> {
    return [...this.sessions.values()].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }
}

export const defaultScanSessionStore = new InMemoryScanSessionStore();
