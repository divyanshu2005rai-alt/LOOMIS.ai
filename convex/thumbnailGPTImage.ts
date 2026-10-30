import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import {
  cfTextToImage,
  requireEnv,
  stripDataUrlPrefix,
} from "./aiProviders";

export const generateThumbnailWithGPTImage = action({
  args: {
    agentType: v.literal("thumbnail"),
    videoId: v.optional(v.id("videos")),
    videoFrames: v.array(
      v.object({
        dataUrl: v.string(),
        timestamp: v.number(),
      })
    ),
    videoData: v.object({
      title: v.optional(v.string()),
      transcription: v.optional(v.string()),
      duration: v.optional(v.number()),
      resolution: v.optional(v.object({
        width: v.number(),
        height: v.number(),
      })),
      format: v.optional(v.string()),
    }),
    connectedAgentOutputs: v.array(
      v.object({
        type: v.string(),
        content: v.string(),
      })
    ),
    profileData: v.optional(
      v.object({
        channelName: v.string(),
        contentType: v.string(),
        niche: v.string(),
        tone: v.optional(v.string()),
        targetAudience: v.optional(v.string()),
      })
    ),
    additionalContext: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ concept: string; imageUrl: string; prompt?: string; storageId?: string }> => {
    console.log("[SDXL Thumbnail] Starting thumbnail generation process");
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const cfAccountId = requireEnv("CF_ACCOUNT_ID");
    const cfApiToken = requireEnv("CF_API_TOKEN");

    try {
      // Get fresh video data if videoId is provided
      let videoData = args.videoData;
      if (args.videoId) {
        const freshVideoData = await ctx.runQuery(api.videos.getWithTranscription, {
          videoId: args.videoId,
        });
        if (freshVideoData && freshVideoData.transcription) {
          videoData = {
            title: freshVideoData.title || args.videoData.title,
            transcription: freshVideoData.transcription,
          };
        }
      }

      if (!args.videoFrames || args.videoFrames.length === 0) {
        throw new Error("No video frames provided for thumbnail generation.");
      }

      // Build prompt for thumbnail generation
      let prompt = "Generate a photorealistic image of a YouTube thumbnail on a white background ";
      
      if (videoData.title) {
        prompt += `for a video titled '${videoData.title}' `;
      }
      
      // Add channel branding if available
      if (args.profileData) {
        prompt += `in the style of ${args.profileData.channelName} (${args.profileData.niche} channel) `;
      }
      
      // Add text overlay suggestions from connected agents
      let textOverlay = "";
      args.connectedAgentOutputs.forEach(({ type, content }) => {
        if (type === "title" && content.length < 30) {
          textOverlay = content;
        }
      });
      
      if (textOverlay) {
        prompt += `with bold text overlay saying '${textOverlay}' `;
      }
      
      prompt += "containing all the visual elements from the reference pictures. ";
      prompt += "Make it eye-catching with vibrant colors and high contrast.";
      
      // Limit prompt length
      if (prompt.length > 1000) {
        prompt = prompt.substring(0, 1000);
      }
      
      console.log("[SDXL Thumbnail] Generated prompt:", prompt);
      
      console.log("[SDXL Thumbnail] Processing text-to-image with Cloudflare SDXL...");

      const imageBlob = await cfTextToImage(cfAccountId, cfApiToken, prompt, {
        guidance: 7.5,
        numSteps: 20,
      });

      console.log("[SDXL Thumbnail] Image generated, storing in Convex...");

      // Store the PNG blob in Convex storage
      const storageId = await ctx.storage.store(imageBlob);
      const permanentUrl = await ctx.storage.getUrl(storageId);

      if (!permanentUrl) {
        throw new Error("Failed to get permanent URL for stored image");
      }
      
      console.log("[SDXL Thumbnail] Image stored successfully");
      
      const concept = `Generated YouTube thumbnail using Cloudflare Workers AI SDXL.\nText overlay: "${textOverlay || 'None'}"`;
      
      return {
        concept,
        imageUrl: permanentUrl,
        prompt,
        storageId,
      };
    } catch (error: any) {
      console.error("[SDXL Thumbnail] Error:", error);
      throw error;
    }
  },
});