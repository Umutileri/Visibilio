import type { WebsiteProject } from "./sessionTypes";

export interface WebsiteProjectStore {
  create(project: WebsiteProject): Promise<WebsiteProject>;
  get(id: string): Promise<WebsiteProject | null>;
  list(): Promise<WebsiteProject[]>;
}

export class InMemoryWebsiteProjectStore implements WebsiteProjectStore {
  private readonly projects = new Map<string, WebsiteProject>();

  async create(project: WebsiteProject): Promise<WebsiteProject> {
    if (this.projects.has(project.id)) {
      throw new Error("A project with this id already exists.");
    }

    this.projects.set(project.id, project);
    return project;
  }

  async get(id: string): Promise<WebsiteProject | null> {
    return this.projects.get(id) ?? null;
  }

  async list(): Promise<WebsiteProject[]> {
    return [...this.projects.values()].sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt),
    );
  }
}

export const defaultWebsiteProjectStore = new InMemoryWebsiteProjectStore();
