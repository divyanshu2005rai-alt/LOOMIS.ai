import { createOpenAI } from "@ai-sdk/openai";

/**
 * Shared AI provider helpers.
 *
 * • Groq  – vision chat completions & resilient text generation
 * • Cloudflare Workers AI – SDXL image generation / img2img
 */

// ─── Groq Text Generation ──────────────────────────────────

export interface GroqTextOptions {
  system?: string;
  prompt?: string;
  messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Direct, highly resilient Groq chat completion with automatic model fallback.
 * Uses native fetch to avoid SDK routing issues and handles rate/model limits seamlessly.
 */
export async function groqGenerateText(options: GroqTextOptions): Promise<{ text: string }> {
  const apiKey = requireEnv("GROQ_API_KEY");

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  if (options.messages && options.messages.length > 0) {
    messages.push(...options.messages);
  } else if (options.prompt) {
    messages.push({ role: "user", content: options.prompt });
  }

  // Candidate models available on Groq (tested against active account models)
  const candidateModels = [
    options.model,
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "allam-2-7b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ].filter(Boolean) as string[];

  let lastError: Error | null = null;
  for (const model of candidateModels) {
    try {
      console.log(`[Groq] Generating text with model: ${model}`);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 500,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[Groq] Model ${model} returned (${res.status}): ${errorText}`);
        const isModelUnavailable =
          res.status === 404 ||
          res.status === 400 && (
            errorText.includes("model_decommissioned") ||
            errorText.includes("model_not_found") ||
            errorText.includes("does not exist") ||
            errorText.includes("do not have access") ||
            errorText.includes("terms_required") ||
            errorText.includes("invalid_request_error")
          );

        if (isModelUnavailable) {
          lastError = new Error(`Groq model ${model} not available: ${errorText}`);
          continue; // Try next fallback model
        }
        throw new Error(`Groq API error (${res.status}): ${errorText}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string; reasoning?: string } }>;
      };
      const text =
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.message?.reasoning ||
        "";
      console.log(`[Groq] Successfully generated text using model: ${model}`);
      return { text };
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes("not available")) continue;
      throw err;
    }
  }

  throw lastError || new Error("All Groq models failed");
}

/**
 * Returns a Groq chat language model instance for streaming endpoints (e.g. streamText).
 */
export function getGroqChatModel(model = "qwen/qwen3.8-27b") {
  const apiKey = requireEnv("GROQ_API_KEY");
  const groq = createOpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
  });
  return groq(model);
}

// ─── Groq Vision ───────────────────────────────────────────

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_MODEL = "qwen/qwen3.8-27b";

/** Maximum images to include in a single Groq vision request. */
export const MAX_GROQ_IMAGES = 4;

export type ContentPart =
  | { type: "text"; text: string }
  | {
    type: "image_url";
    image_url: { url: string; detail?: string };
  };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

/**
 * Send a vision-capable chat completion request to Groq.
 * Message format is OpenAI-compatible (text + image_url content parts).
 */
export async function groqVisionChat(
  apiKey: string,
  messages: ChatMessage[],
  opts?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const res = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages,
      max_tokens: opts?.maxTokens ?? 800,
      temperature: opts?.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    if (res.status === 401)
      throw new Error("Groq API authentication failed. Check GROQ_API_KEY.");
    if (res.status === 429)
      throw new Error("Groq rate limit exceeded. Please try again shortly.");
    throw new Error(`Groq vision error (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Cloudflare Workers AI (SDXL) ─────────────────────────

const CF_SDXL_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

function cfUrl(accountId: string, model: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
}

/** Convert a raw base64 string to an integer byte array for the CF JSON API. */
export function base64ToBytes(base64: string): number[] {
  const bin = atob(base64);
  const bytes = new Array<number>(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Cloudflare Workers AI Vision analysis using Llama 3.2 11B Vision Instruct.
 */
export async function cfVisionChat(
  accountId: string,
  apiToken: string,
  prompt: string,
  sourceBase64?: string,
  opts?: { maxTokens?: number }
): Promise<string> {
  const body: Record<string, unknown> = {
    prompt,
    max_tokens: opts?.maxTokens ?? 600,
  };
  if (sourceBase64) {
    body.image = base64ToBytes(sourceBase64);
  }

  const res = await fetch(cfUrl(accountId, "@cf/meta/llama-3.2-11b-vision-instruct"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Cloudflare vision error (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as {
    result?: { response?: string };
    errors?: Array<{ message: string }>;
  };

  if (data.errors && data.errors.length > 0) {
    throw new Error(`Cloudflare vision error: ${data.errors[0].message}`);
  }

  return data.result?.response ?? "";
}

/** Strip the `data:…;base64,` prefix from a data-URL, returning raw base64. */
export function stripDataUrlPrefix(dataUrl: string): string {
  const idx = dataUrl.indexOf(",");
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

/**
 * Text-to-image via Cloudflare Workers AI SDXL.
 * Returns a raw PNG Blob.
 */
export async function cfTextToImage(
  accountId: string,
  apiToken: string,
  prompt: string,
  opts?: {
    width?: number;
    height?: number;
    numSteps?: number;
    guidance?: number;
  }
): Promise<Blob> {
  const body: Record<string, unknown> = {
    prompt,
    num_steps: Math.min(opts?.numSteps ?? 20, 20), // free-tier cap
    guidance: opts?.guidance ?? 7.5,
  };
  if (opts?.width) body.width = opts.width;
  if (opts?.height) body.height = opts.height;

  const res = await fetch(cfUrl(accountId, CF_SDXL_MODEL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Cloudflare SDXL text-to-image error (${res.status}): ${detail}`
    );
  }
  return res.blob();
}

/**
 * Image-to-image (img2img) via Cloudflare Workers AI SDXL.
 * `sourceBase64` should be raw base64 (no data-URL prefix).
 * Returns a raw PNG Blob.
 */
export async function cfImageToImage(
  accountId: string,
  apiToken: string,
  prompt: string,
  sourceBase64: string,
  opts?: { strength?: number; numSteps?: number; guidance?: number }
): Promise<Blob> {
  const res = await fetch(cfUrl(accountId, CF_SDXL_MODEL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image: base64ToBytes(sourceBase64),
      strength: opts?.strength ?? 0.65,
      num_steps: Math.min(opts?.numSteps ?? 20, 20),
      guidance: opts?.guidance ?? 7.5,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Cloudflare SDXL img2img error (${res.status}): ${detail}`
    );
  }
  return res.blob();
}

// ─── Environment helpers ──────────────────────────────────

/** Read a required environment variable or throw a clear error. */
export function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val)
    throw new Error(
      `${name} is not configured. Add it to your Convex environment variables.`
    );
  return val;
}
