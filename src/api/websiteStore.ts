import type { WebsiteRef } from "./sessionTypes";

export interface WebsiteStore {
  upsert(website: WebsiteRef): Promise<WebsiteRef>;
  get(key: string): Promise<WebsiteRef | null>;
  list(): Promise<WebsiteRef[]>;
}

export class InMemoryWebsiteStore implements WebsiteStore {
  private readonly websites = new Map<string, WebsiteRef>();

  async upsert(website: WebsiteRef): Promise<WebsiteRef> {
    const existing = this.websites.get(website.key);
    const next: WebsiteRef = {
      ...existing,
      ...website,
      createdAt: existing?.createdAt ?? website.createdAt ?? new Date().toISOString(),
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

export const defaultWebsiteStore = new InMemoryWebsiteStore();
