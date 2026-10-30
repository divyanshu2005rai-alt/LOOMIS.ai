import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import {
  cfVisionChat,
  cfTextToImage,
  requireEnv,
  stripDataUrlPrefix,
} from "./aiProviders";

export const refineThumbnail = action({
  args: {
    agentId: v.id("agents"),
    currentThumbnailUrl: v.string(),
    userMessage: v.string(),
    videoId: v.optional(v.id("videos")),
    profileData: v.optional(
      v.object({
        channelName: v.string(),
        contentType: v.string(),
        niche: v.string(),
        tone: v.optional(v.string()),
        targetAudience: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<{ 
    concept: string; 
    imageUrl: string; 
    prompt?: string;
    storageId?: string;
  }> => {
    console.log("[Thumbnail Refine] Starting thumbnail refinement");
    console.log("[Thumbnail Refine] User message:", args.userMessage);
    console.log("[Thumbnail Refine] Current thumbnail URL:", args.currentThumbnailUrl);
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const groqKey = requireEnv("GROQ_API_KEY");
    const cfAccountId = requireEnv("CF_ACCOUNT_ID");
    const cfApiToken = requireEnv("CF_API_TOKEN");

    try {
      // Get video data if available
      let videoData: any = {};
      if (args.videoId) {
        const freshVideoData = await ctx.runQuery(api.videos.getWithTranscription, {
          videoId: args.videoId,
        });
        if (freshVideoData) {
          videoData = freshVideoData;
        }
      }

      // Download the current thumbnail to use as source for img2img and vision
      console.log("[Thumbnail Refine] Downloading current thumbnail...");
      let sourceBase64: string | null = null;
      
      try {
        const imageResponse = await fetch(args.currentThumbnailUrl);
        if (!imageResponse.ok) {
          throw new Error("Failed to download current thumbnail");
        }
        
        const imageBlob = await imageResponse.blob();
        console.log("[Thumbnail Refine] Image blob size:", imageBlob.size);

        // Convert blob to base64
        const arrayBuffer = await imageBlob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        sourceBase64 = btoa(binary);
      } catch (downloadError) {
        console.error("[Thumbnail Refine] Error downloading image:", downloadError);
      }

      // ── Analyze current thumbnail with Cloudflare Workers AI vision ──
      console.log("[Thumbnail Refine] Analyzing current thumbnail with Cloudflare Llama 3.2 vision...");
      let currentAnalysis = "";
      try {
        currentAnalysis = await cfVisionChat(
          cfAccountId,
          cfApiToken,
          `Analyze this thumbnail and user feedback: "${args.userMessage}". Describe: 1. Main visual elements 2. Colors and text 3. Specific improvements needed based on user request.`,
          sourceBase64 || undefined,
          { maxTokens: 500 }
        );
        console.log("[Thumbnail Refine] Current thumbnail analysis:", currentAnalysis);
      } catch (err: any) {
        console.warn("[Thumbnail Refine] Vision analysis fallback:", err.message);
        currentAnalysis = `Requested thumbnail adjustments: ${args.userMessage}`;
      }

      // Build refinement prompt
      let refinementPrompt = "Edit this YouTube thumbnail based on user feedback:\n\n";
      
      refinementPrompt += `USER FEEDBACK: ${args.userMessage}\n\n`;
      refinementPrompt += `CURRENT THUMBNAIL ANALYSIS:\n${currentAnalysis}\n\n`;
      
      if (videoData.title) {
        refinementPrompt += `VIDEO TITLE: ${videoData.title}\n\n`;
      }
      
      refinementPrompt += "REQUIREMENTS:\n";
      refinementPrompt += "- Apply the user's requested changes while keeping what works\n";
      refinementPrompt += "- Maintain YouTube thumbnail best practices\n";
      refinementPrompt += "- Keep text large, bold, and readable\n";
      refinementPrompt += "- Ensure high contrast and vibrant colors\n";
      
      if (args.profileData) {
        refinementPrompt += `\nCHANNEL STYLE: ${args.profileData.channelName} - ${args.profileData.niche}\n`;
      }

      // Ensure prompt doesn't exceed limit
      if (refinementPrompt.length > 1000) {
        refinementPrompt = refinementPrompt.substring(0, 1000) + "...";
      }

      console.log("[Thumbnail Refine] Refinement prompt:", refinementPrompt.substring(0, 200) + "...");

      // ── Generate refined thumbnail with Cloudflare SDXL ─────
      console.log("[Thumbnail Refine] Generating refined thumbnail...");
      // Generate refined thumbnail via text-to-image with full visual context
      const fullRefinePrompt = `Create a YouTube thumbnail that incorporates these changes: ${refinementPrompt}. Based on analysis: ${currentAnalysis}`;
      const resultBlob = await cfTextToImage(cfAccountId, cfApiToken, fullRefinePrompt, {
        guidance: 7.5,
        numSteps: 20,
      });

      // Store the generated PNG in Convex storage
      console.log("[Thumbnail Refine] Storing refined image in Convex storage...");
      const storageId = await ctx.storage.store(resultBlob);
      const finalImageUrl = await ctx.storage.getUrl(storageId);

      if (!finalImageUrl) {
        throw new Error("Failed to get URL for stored refined image");
      }

      console.log("[Thumbnail Refine] Refinement completed successfully");

      // Create concept description
      const concept = `Refined thumbnail based on user feedback: "${args.userMessage}"\n\nChanges applied:\n${currentAnalysis}`;

      return {
        concept,
        imageUrl: finalImageUrl,
        prompt: refinementPrompt,
        storageId,
      };
    } catch (error: any) {
      console.error("[Thumbnail Refine] Error:", error);
      throw error;
    }
  },
});