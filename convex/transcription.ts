"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const GROQ_TRANSCRIPTION_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";

export const transcribeVideoGroq = action({
  args: {
    videoId: v.id("videos"),
    storageId: v.id("_storage"),
    fileType: v.optional(v.string()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; transcription: string; service: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Groq API key not configured. Add GROQ_API_KEY to your Convex environment variables.");
    }

    try {
      await ctx.runMutation(api.videos.updateTranscriptionStatus, {
        id: args.videoId,
        status: "processing",
        progress: "Starting transcription...",
      });

      const fileBlob = await ctx.storage.get(args.storageId);
      if (!fileBlob) {
        throw new Error("Could not retrieve the uploaded file from storage.");
      }

      await ctx.runMutation(api.videos.updateTranscriptionStatus, {
        id: args.videoId,
        status: "processing",
        progress: "Processing with Groq Whisper...",
      });

      const supportedExts = ["flac", "mp3", "mp4", "mpeg", "mpga", "m4a", "ogg", "wav", "webm"];
      const originalName = args.fileName || "audio.mp4";
      const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : "";
      const safeName = supportedExts.includes(ext)
        ? originalName
        : `${originalName.replace(/\.[^.]+$/, "") || "audio"}.mp4`;

      const body = new FormData();
      body.append("file", fileBlob, safeName);
      body.append("model", GROQ_TRANSCRIPTION_MODEL);
      body.append("response_format", "json");

      const response = await fetch(GROQ_TRANSCRIPTION_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body,
      });

      if (!response.ok) {
        const details = await response.text();
        if (response.status === 401) throw new Error("Groq API authentication failed. Check GROQ_API_KEY.");
        if (response.status === 413) throw new Error("The file is too large for the configured Groq tier.");
        if (response.status === 429) throw new Error("Groq rate limit exceeded. Please try again shortly.");
        console.error("Groq transcription API error:", response.status, details);
        throw new Error(`Groq transcription failed (${response.status}).`);
      }

      const result = (await response.json()) as { text?: string };
      const transcription = result.text?.trim();
      if (!transcription) {
        throw new Error("No speech detected. Ensure the file contains clear speech.");
      }

      await ctx.runMutation(api.videos.updateVideoTranscription, {
        videoId: args.videoId,
        transcription,
      });

      return { success: true, transcription, service: "groq" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transcription failed. Please try again.";
      await ctx.runMutation(api.videos.updateTranscriptionStatus, {
        id: args.videoId,
        status: "failed",
        error: message,
      });
      throw error;
    }
  },
});

export const transcribeVideo = action({
  args: {
    videoId: v.id("videos"),
    storageId: v.id("_storage"),
    fileType: v.optional(v.string()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; transcription: string; service: string }> =>
    ctx.runAction(api.transcription.transcribeVideoGroq, args),
});
