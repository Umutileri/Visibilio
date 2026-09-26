import type { ScanSession, WebsiteRef } from "./sessionTypes";

export interface WebsiteRepository {
  upsert(website: WebsiteRef): Promise<WebsiteRef>;
  get(key: string): Promise<WebsiteRef | null>;
  list(): Promise<WebsiteRef[]>;
}

export interface ScanSessionRepository {
  create(session: ScanSession): Promise<ScanSession>;
  get(id: string): Promise<ScanSession | null>;
  update(session: ScanSession): Promise<ScanSession>;
  list(siteKey?: string): Promise<ScanSession[]>;
}

export interface VisibilioStorage {
  websites: WebsiteRepository;
  scans: ScanSessionRepository;
}

export function createInMemoryStorage(): VisibilioStorage {
  return {
    websites: new InMemoryWebsiteRepository(),
    scans: new InMemoryScanSessionRepository(),
  };
}

class InMemoryWebsiteRepository implements WebsiteRepository {
  private readonly websites = new Map<string, WebsiteRef>();

  async upsert(website: WebsiteRef): Promise<WebsiteRef> {
    const existing = this.websites.get(website.key);
    const next = {
      ...existing,
      ...website,
      createdAt:
        existing?.createdAt ?? website.createdAt ?? new Date().toISOString(),
    };
    this.websites.set(next.key, next);
    return next;
  }

  async get(key: string): Promise<WebsiteRef | null> {
    return this.websites.get(key) ?? null;
  }

  async list(): Promise<WebsiteRef[]> {
    return [...this.websites.values()].sort((left, right) =>
      (right.lastScanAt ?? right.createdAt ?? "").localeCompare(
        left.lastScanAt ?? left.createdAt ?? "",
      ),
    );
  }
}

class InMemoryScanSessionRepository implements ScanSessionRepository {
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
    return [...this.sessions.values()]
      .filter((session) => !siteKey || session.siteKey === siteKey)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }
}

export const defaultStorage = createInMemoryStorage();
