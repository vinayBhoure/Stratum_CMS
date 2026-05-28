import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { publicCache, cacheKey } from "../config/cache";
import {
  publicUserIdSchema,
  publicLimitQuerySchema,
  publicProjectsQuerySchema,
} from "../validators/public.schema";
import * as publicService from "../services/public.service";

const CACHE_MAX_AGE = 600;

function setCacheHeaders(res: import("express").Response): void {
  res.set("Cache-Control", `public, max-age=${CACHE_MAX_AGE}`);
}

async function withCache<T>(
  key: string,
  fetch: () => Promise<T>
): Promise<T> {
  const hit = publicCache.get<T>(key);
  if (hit !== undefined) return hit;
  const data = await fetch();
  publicCache.set(key, data);
  return data;
}

export const getPublicUserInfo = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = publicUserIdSchema.parse(req.params);
  await publicService.assertUserExists(userId);

  const key = cacheKey(userId, "user-info");
  const data = await withCache(key, () => publicService.getPublicUserInfo(userId));

  setCacheHeaders(res);
  res.status(200).json(successEnvelope(data, 200));
});

export const getPublicProjects = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = publicUserIdSchema.parse(req.params);
  const query = publicProjectsQuerySchema.parse(req.query);
  await publicService.assertUserExists(userId);

  const queryStr = JSON.stringify({ tag: query.tag, limit: query.limit });
  const key = cacheKey(userId, "projects", queryStr);
  const data = await withCache(key, () => publicService.getPublicProjects(userId, query));

  setCacheHeaders(res);
  res.status(200).json(successEnvelope(data, 200));
});

export const getPublicExperience = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = publicUserIdSchema.parse(req.params);
  const query = publicLimitQuerySchema.parse(req.query);
  await publicService.assertUserExists(userId);

  const key = cacheKey(userId, "experience", query.limit !== undefined ? String(query.limit) : "");
  const data = await withCache(key, () => publicService.getPublicExperience(userId, query));

  setCacheHeaders(res);
  res.status(200).json(successEnvelope(data, 200));
});

export const getPublicSkills = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = publicUserIdSchema.parse(req.params);
  const query = publicLimitQuerySchema.parse(req.query);
  await publicService.assertUserExists(userId);

  const key = cacheKey(userId, "skills", query.limit !== undefined ? String(query.limit) : "");
  const data = await withCache(key, () => publicService.getPublicSkills(userId, query));

  setCacheHeaders(res);
  res.status(200).json(successEnvelope(data, 200));
});

export const getPublicTags = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = publicUserIdSchema.parse(req.params);
  const query = publicLimitQuerySchema.parse(req.query);
  await publicService.assertUserExists(userId);

  const key = cacheKey(userId, "tags", query.limit !== undefined ? String(query.limit) : "");
  const data = await withCache(key, () => publicService.getPublicTags(userId, query));

  setCacheHeaders(res);
  res.status(200).json(successEnvelope(data, 200));
});

export const getPublicResume = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = publicUserIdSchema.parse(req.params);
  await publicService.assertUserExists(userId);

  const key = cacheKey(userId, "resume");
  const data = await withCache(key, () => publicService.getPublicResume(userId));

  setCacheHeaders(res);
  res.status(200).json(successEnvelope(data, 200));
});
