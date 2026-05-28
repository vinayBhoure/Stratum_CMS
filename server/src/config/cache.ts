import NodeCache from "node-cache";

const PUBLIC_API_TTL = 600;

export const publicCache = new NodeCache({ stdTTL: PUBLIC_API_TTL, useClones: false });

export function cacheKey(userId: string, section: string, query: string = ""): string {
  return query ? `${userId}:${section}:${query}` : `${userId}:${section}`;
}
