import type { WebsiteRef } from "./sessionTypes";
import { defaultStorage } from "./storage";

export interface WebsiteStore {
  upsert(website: WebsiteRef): Promise<WebsiteRef>;
  get(key: string): Promise<WebsiteRef | null>;
  list(): Promise<WebsiteRef[]>;
}

export const defaultWebsiteStore: WebsiteStore = defaultStorage.websites;
