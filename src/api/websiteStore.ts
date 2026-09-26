import type { WebsiteRef } from "./sessionTypes";
import { createInMemoryStorage, defaultStorage } from "./storage";

export interface WebsiteStore {
  upsert(website: WebsiteRef): Promise<WebsiteRef>;
  get(key: string): Promise<WebsiteRef | null>;
  list(): Promise<WebsiteRef[]>;
}

export const defaultWebsiteStore: WebsiteStore = defaultStorage.websites;

export class InMemoryWebsiteStore implements WebsiteStore {
  private readonly store = createInMemoryStorage().websites;

  upsert(website: WebsiteRef): Promise<WebsiteRef> {
    return this.store.upsert(website);
  }

  get(key: string): Promise<WebsiteRef | null> {
    return this.store.get(key);
  }

  list(): Promise<WebsiteRef[]> {
    return this.store.list();
  }
}
