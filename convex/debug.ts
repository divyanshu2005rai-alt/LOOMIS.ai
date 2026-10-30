import { action, query } from "./_generated/server";

export const listGroqModels = action({
  handler: async () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { error: "No GROQ_API_KEY in convex environment" };
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json();
      return { status: res.status, models: data };
    } catch (e: any) {
      return { error: e.message };
    }
  },
});

export const getAllTranscriptions = query({
  handler: async (ctx) => {
    const transcriptions = await ctx.db.query("transcriptions").collect();
    return transcriptions;
  },
});

export const getTranscriptionsByUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;
    
    const transcriptions = await ctx.db
      .query("transcriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
      
    return {
      userId,
      count: transcriptions.length,
      transcriptions,
    };
  },
});
