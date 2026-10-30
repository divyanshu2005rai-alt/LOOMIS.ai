import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import {
  cfVisionChat,
  cfTextToImage,
  requireEnv,
  stripDataUrlPrefix,
  MAX_GROQ_IMAGES,
} from "./aiProviders";

export const generateThumbnail = action({
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
      manualTranscriptions: v.optional(v.array(v.object({
        fileName: v.string(),
        text: v.string(),
        format: v.string(),
      }))),
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
    moodBoardReferences: v.optional(v.array(
      v.object({
        url: v.string(),
        type: v.string(),
        title: v.optional(v.string()),
      })
    )),
  },
  handler: async (ctx, args): Promise<{ concept: string; imageUrl: string; prompt?: string; storageId?: string }> => {
    console.log("[Thumbnail] Starting thumbnail generation process");
    console.log("[Thumbnail] Args received:", {
      agentType: args.agentType,
      videoId: args.videoId,
      frameCount: args.videoFrames.length,
      hasTranscription: !!args.videoData.transcription,
      hasProfile: !!args.profileData,
      connectedAgentsCount: args.connectedAgentOutputs.length,
      moodBoardCount: args.moodBoardReferences?.length || 0
    });
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Provider credentials (all stored in Convex env vars)
    const groqKey = requireEnv("GROQ_API_KEY");
    const cfAccountId = requireEnv("CF_ACCOUNT_ID");
    const cfApiToken = requireEnv("CF_API_TOKEN");

    try {
      // If we have a videoId, fetch the latest video data with transcription
      let videoData = args.videoData;
      if (args.videoId) {
        console.log("[Thumbnail] Fetching fresh video data for ID:", args.videoId);
        const freshVideoData = await ctx.runQuery(api.videos.getWithTranscription, {
          videoId: args.videoId,
        });
        console.log("[Thumbnail] Fresh video data fetched:", {
          hasTitle: !!freshVideoData?.title,
          hasTranscription: !!freshVideoData?.transcription,
          transcriptionLength: freshVideoData?.transcription?.length || 0
        });
        if (freshVideoData && freshVideoData.transcription) {
          videoData = {
            title: freshVideoData.title || args.videoData.title,
            transcription: freshVideoData.transcription,
          };
        }
      }

      // Validate inputs
      if (!args.videoFrames || args.videoFrames.length === 0) {
        throw new Error("No video frames provided for thumbnail generation.");
      }
      
      // Validate that we have at least one image
      if (!args.videoFrames || args.videoFrames.length === 0) {
        throw new Error("No images provided for thumbnail generation.");
      }

      // Build a comprehensive prompt for thumbnail generation
      console.log("[Thumbnail] Building thumbnail generation prompt");
      
      let thumbnailPrompt = "Create an eye-catching YouTube thumbnail with the following requirements:\n\n";
      
      if (videoData.title) {
        thumbnailPrompt += `Video Title: ${videoData.title}\n`;
      }
      
      if (videoData.transcription) {
        const summary = videoData.transcription.slice(0, 500);
        thumbnailPrompt += `\nVideo Content Summary: ${summary}...\n`;
      }
      
      // Add manual transcriptions if available
      if (videoData.manualTranscriptions && videoData.manualTranscriptions.length > 0) {
        thumbnailPrompt += "\nManual Transcriptions Provided:\n";
        videoData.manualTranscriptions.forEach((transcript, index) => {
          thumbnailPrompt += `\n--- ${transcript.fileName} (${transcript.format.toUpperCase()}) ---\n`;
          const excerpt = transcript.text.slice(0, 800);
          thumbnailPrompt += `${excerpt}...\n`;
        });
        thumbnailPrompt += "\n";
      }
      
      if (args.connectedAgentOutputs.length > 0) {
        thumbnailPrompt += "\nRelated content:\n";
        args.connectedAgentOutputs.forEach(({ type, content }) => {
          if (type === "title") {
            thumbnailPrompt += `- Title suggestion: ${content}\n`;
          }
        });
      }
      
      if (args.profileData) {
        thumbnailPrompt += `\nChannel Style:\n`;
        thumbnailPrompt += `- ${args.profileData.channelName} (${args.profileData.niche})\n`;
        thumbnailPrompt += `- Content Type: ${args.profileData.contentType}\n`;
        if (args.profileData.tone) {
          thumbnailPrompt += `- Tone: ${args.profileData.tone}\n`;
        }
      }
      
      if (args.additionalContext) {
        thumbnailPrompt += `\nSpecific requirements: ${args.additionalContext}\n`;
      }
      
      // Process mood board references before adding to prompt
      let moodBoardImages: Array<{ type: string; imageUrl: string; title: string }> = [];
      
      if (args.moodBoardReferences && args.moodBoardReferences.length > 0) {
        console.log("[Thumbnail] Processing mood board references:", args.moodBoardReferences.length);
        
        try {
          // Process mood board references to download images
          const processedRefs = await ctx.runAction(api.moodboardUtils.processMoodBoardReferences, {
            references: args.moodBoardReferences,
            maxImages: 3, // Limit to 3 mood board images to avoid overwhelming the prompt
          });
          
          console.log("[Thumbnail] Processed mood board references:", processedRefs.length);
          
          // Add text description to prompt
          thumbnailPrompt += "\nMOOD BOARD REFERENCES:\n";
          
          processedRefs.forEach((ref: any) => {
            if (ref.imageData) {
              // Store image for later inclusion in vision API
              moodBoardImages.push({
                type: ref.type,
                imageUrl: ref.imageData,
                title: ref.title || ref.url,
              });
              thumbnailPrompt += `- [${ref.type}] ${ref.title || ref.url} (visual reference included)\n`;
            } else {
              // Just text reference
              thumbnailPrompt += `- [${ref.type}] ${ref.description}\n`;
            }
          });
          
          if (moodBoardImages.length > 0) {
            thumbnailPrompt += "Use these visual references for style inspiration, color palette, composition, and overall aesthetic.\n";
          }
        } catch (error) {
          console.error("[Thumbnail] Error processing mood board references:", error);
          // Fallback to just text descriptions
          thumbnailPrompt += "\nMOOD BOARD REFERENCES (text only due to processing error):\n";
          args.moodBoardReferences.forEach(ref => {
            thumbnailPrompt += `- [${ref.type}] ${ref.title || ref.url}\n`;
          });
        }
      }
      
      thumbnailPrompt += `\nDesign Requirements:\n`;
      thumbnailPrompt += `1. High contrast and vibrant colors\n`;
      thumbnailPrompt += `2. Clear, readable text overlay (3-5 words max)\n`;
      thumbnailPrompt += `3. Emotional facial expressions if applicable\n`;
      thumbnailPrompt += `4. 16:9 aspect ratio optimized for YouTube\n`;
      thumbnailPrompt += `5. Professional quality that stands out in search results\n`;
      
      console.log("[Thumbnail] Prompt created, length:", thumbnailPrompt.length);
      console.log("[Thumbnail] Mood board images included:", moodBoardImages.length);
      
      // ── Vision analysis with Cloudflare Workers AI ──────────
      console.log("[Thumbnail] Analyzing uploaded image with Cloudflare Llama 3.2 vision...");
      if (!args.videoFrames || args.videoFrames.length === 0) {
        throw new Error("No frames available for thumbnail generation");
      }
      const firstFrame = args.videoFrames[0];
      const sourceBase64 = stripDataUrlPrefix(firstFrame.dataUrl);

      let thumbnailConcept = "";
      try {
        thumbnailConcept = await cfVisionChat(
          cfAccountId,
          cfApiToken,
          thumbnailPrompt + "\n\nAnalyze this image and describe the perfect YouTube thumbnail based on it. Be specific about visual elements, colors, composition, and suggested text overlay (3-5 words).",
          sourceBase64,
          { maxTokens: 600 }
        );
        console.log("[Thumbnail] Analysis complete. Concept:", thumbnailConcept.substring(0, 200) + "...");
      } catch (err: any) {
        console.warn("[Thumbnail] Vision concept error, using fallback concept:", err.message);
        thumbnailConcept = `High-CTR YouTube thumbnail for "${videoData.title || "video"}" with high contrast, vibrant colors, clear focal point, and compelling visual elements.`;
      }

      let visualDescription = "";
      try {
        visualDescription = await cfVisionChat(
          cfAccountId,
          cfApiToken,
          "Describe what you see in this image in detail: subjects, expressions, background, objects, colors, and lighting.",
          sourceBase64,
          { maxTokens: 400 }
        );
        console.log("[Thumbnail] Visual description obtained");
      } catch (err: any) {
        console.warn("[Thumbnail] Visual description error, using fallback:", err.message);
        visualDescription = "A clear scene from the video with focal subject and vivid background.";
      }
      
      // Extract key elements from the concept - better regex for text overlay
      const textOverlayMatch = thumbnailConcept.match(/text[:\s]*["']([^"']+)["']/i) ||
                             thumbnailConcept.match(/suggested text[:\s]*["']([^"']+)["']/i) ||
                             thumbnailConcept.match(/text overlay[:\s]*["']([^"']+)["']/i) ||
                             thumbnailConcept.match(/["']([^"']{5,40})["'][^"']*(?:text|overlay)/i);
      const textOverlay = textOverlayMatch ? textOverlayMatch[1].trim() : "AMAZING TIPS";
      
      console.log("[Thumbnail] Extracted text overlay:", textOverlay);
      
      // Build a comprehensive prompt for SDXL that includes video context
      let sdxlPrompt = "Create a YouTube thumbnail based on this video content:\n\n";
      
      // Debug: Log connected agent outputs
      console.log("[Thumbnail] Connected agent outputs:", args.connectedAgentOutputs);
      
      // Add AI-generated video title from connected agents
      const titleFromAgent = args.connectedAgentOutputs.find(output => output.type === "title");
      if (titleFromAgent && titleFromAgent.content && titleFromAgent.content.trim() !== "") {
        console.log("[Thumbnail] Using AI-generated title:", titleFromAgent.content);
        sdxlPrompt += `VIDEO TITLE: ${titleFromAgent.content}\n\n`;
      } else {
        console.log("[Thumbnail] No AI title found in connected agents");
      }
      
      // Add transcription summary if available
      if (videoData.transcription) {
        const transcriptSummary = videoData.transcription.slice(0, 300);
        sdxlPrompt += `VIDEO CONTENT: ${transcriptSummary}...\n\n`;
      }
      
      // Add visual description from the uploaded frames
      const shortDescription = visualDescription.length > 400 ? 
        visualDescription.substring(0, 400) + "..." : 
        visualDescription;
      sdxlPrompt += `VISUAL ELEMENTS: ${shortDescription}\n\n`;
      
      // Add design requirements with the extracted text overlay
      sdxlPrompt += "DESIGN REQUIREMENTS:\n";
      sdxlPrompt += `- Main text overlay should say: "${textOverlay}"\n`;
      sdxlPrompt += "- Make the text LARGE and BOLD\n";
      sdxlPrompt += "- Use eye-catching YouTube thumbnail style\n";
      sdxlPrompt += "- High contrast and vibrant colors\n";
      sdxlPrompt += "- Professional quality\n";
      sdxlPrompt += "- 16:9 aspect ratio\n";
      
      // Add channel style if available
      if (args.profileData) {
        const channelInfo = `${args.profileData.channelName} - ${args.profileData.niche}`;
        sdxlPrompt += `\nCHANNEL STYLE: ${channelInfo}\n`;
        if (args.profileData.contentType) {
          sdxlPrompt += `Content type: ${args.profileData.contentType}\n`;
        }
        if (args.profileData.tone) {
          sdxlPrompt += `Tone: ${args.profileData.tone}\n`;
        }
        if (args.profileData.targetAudience) {
          sdxlPrompt += `Target audience: ${args.profileData.targetAudience}\n`;
        }
      }
      
      // Add mood board references to the generation prompt
      if (moodBoardImages.length > 0) {
        sdxlPrompt += "\nMOOD BOARD VISUAL REFERENCES:\n";
        sdxlPrompt += `${moodBoardImages.length} visual references have been included for style inspiration.\n`;
        sdxlPrompt += "Study their composition, color schemes, and overall aesthetic to create a cohesive thumbnail.\n";
      }
      
      // Add any specific context from the user
      if (args.additionalContext) {
        sdxlPrompt += `\nSPECIFIC REQUIREMENTS: ${args.additionalContext}\n`;
      }
      
      // Add other connected agent outputs (descriptions, etc)
      const otherAgentOutputs = args.connectedAgentOutputs
        .filter(output => output.type !== "title" && output.type !== "thumbnail");
      if (otherAgentOutputs.length > 0) {
        sdxlPrompt += "\nOTHER CONTEXT:\n";
        otherAgentOutputs.forEach(output => {
          if (output.type === "description" && output.content) {
            sdxlPrompt += `- Video Description: ${output.content.slice(0, 200)}...\n`;
          }
        });
      }
      
      // Ensure prompt doesn't exceed limit
      if (sdxlPrompt.length > 1000) {
        sdxlPrompt = sdxlPrompt.substring(0, 1000) + "...";
      }
      
      console.log("[Thumbnail] Generating thumbnail with Cloudflare Workers AI SDXL...");
      console.log("[Thumbnail] Prompt:", sdxlPrompt.substring(0, 200) + "...");
      
      const imageBlob = await cfTextToImage(cfAccountId, cfApiToken, sdxlPrompt, {
        guidance: 7.5,
        numSteps: 20,
      });

      console.log("[Thumbnail] Image generation completed");

      // Store the PNG blob in Convex storage
      console.log("[Thumbnail] Storing image in Convex storage...");
      const storageId = await ctx.storage.store(imageBlob);
      const generatedImageUrl = await ctx.storage.getUrl(storageId);

      if (!generatedImageUrl) {
        throw new Error("Failed to get URL for stored image");
      }

      console.log("[Thumbnail] Image stored successfully");
      console.log("[Thumbnail] Final image URL:", generatedImageUrl.substring(0, 100) + "...");
      
      // Combine the concept with generation details
      const fullConcept = `${thumbnailConcept}\n\n=== Generated Thumbnail ===\nText Overlay: "${textOverlay}"\nGeneration Prompt: ${sdxlPrompt}`;
      
      // Return the result with permanent URL
      return {
        concept: fullConcept,
        imageUrl: generatedImageUrl,
        prompt: `=== Original Requirements ===\n${thumbnailPrompt}\n\n=== AI Analysis ===\n${thumbnailConcept}\n\n=== Generation Prompt ===\n${sdxlPrompt}`,
        storageId,
      };
    } catch (error: any) {
      console.error("[Thumbnail] Error generating thumbnail:", error);
      console.error("[Thumbnail] Error type:", error.constructor.name);
      console.error("[Thumbnail] Error message:", error.message);
      console.error("[Thumbnail] Error stack:", error.stack);
      
      throw error;
    }
  },
});
