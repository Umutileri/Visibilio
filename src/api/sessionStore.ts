import type { ScanSession } from "./sessionTypes";

export interface ScanSessionStore {
  create(session: ScanSession): Promise<ScanSession>;
  get(id: string): Promise<ScanSession | null>;
  update(session: ScanSession): Promise<ScanSession>;
  list(siteKey?: string): Promise<ScanSession[]>;
}

export class InMemoryScanSessionStore implements ScanSessionStore {
  private readonly sessions = new Map<string, ScanSession>();

  async create(session: ScanSession): Promise<ScanSession> {
    if (this.sessions.has(session.id)) {
      throw new Error("A scan session with this id already exists.");
    }

    this.sessions.set(session.id, session);
    return session;
  }

  async get(id: string): Promise<ScanSession | null> {
    return this.sessions.get(id) ?? null;
  }

  async update(session: ScanSession): Promise<ScanSession> {
    if (!this.sessions.has(session.id)) {
      throw new Error("Cannot update an unknown scan session.");
    }

    this.sessions.set(session.id, session);
    return session;
  }

  async list(siteKey?: string): Promise<ScanSession[]> {
    const sessions = [...this.sessions.values()].filter(
      (session) => !siteKey || session.siteKey === siteKey,
    );

    return sessions.sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }
}

export const defaultScanSessionStore = new InMemoryScanSessionStore();

