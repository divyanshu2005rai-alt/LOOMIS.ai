/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents from "../agents.js";
import type * as ai from "../ai.js";
import type * as aiHackathon from "../aiHackathon.js";
import type * as aiProviders from "../aiProviders.js";
import type * as canvas from "../canvas.js";
import type * as chat from "../chat.js";
import type * as debug from "../debug.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as moodboardUtils from "../moodboardUtils.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as shares from "../shares.js";
import type * as stats from "../stats.js";
import type * as thumbnail from "../thumbnail.js";
import type * as thumbnailGPTImage from "../thumbnailGPTImage.js";
import type * as thumbnailRefine from "../thumbnailRefine.js";
import type * as transcription from "../transcription.js";
import type * as transcriptionUpload from "../transcriptionUpload.js";
import type * as transcriptions from "../transcriptions.js";
import type * as users from "../users.js";
import type * as videoJobs from "../videoJobs.js";
import type * as videos from "../videos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  ai: typeof ai;
  aiHackathon: typeof aiHackathon;
  aiProviders: typeof aiProviders;
  canvas: typeof canvas;
  chat: typeof chat;
  debug: typeof debug;
  files: typeof files;
  http: typeof http;
  moodboardUtils: typeof moodboardUtils;
  profiles: typeof profiles;
  projects: typeof projects;
  shares: typeof shares;
  stats: typeof stats;
  thumbnail: typeof thumbnail;
  thumbnailGPTImage: typeof thumbnailGPTImage;
  thumbnailRefine: typeof thumbnailRefine;
  transcription: typeof transcription;
  transcriptionUpload: typeof transcriptionUpload;
  transcriptions: typeof transcriptions;
  users: typeof users;
  videoJobs: typeof videoJobs;
  videos: typeof videos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
