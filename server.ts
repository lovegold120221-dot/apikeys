import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const EBURON_API_KEY = process.env.EBURON_API_KEY || "";
const FIREBASE_API_KEY = "AIzaSyBpIVXx5V_hlBxVW01a6HrLV8QXmK-j2UI";
const TOKEN_LIMIT = 1_000_000;

// --- API Key Store ---

interface UserRecord {
  email: string;
  apiKey: string;
  tokensUsed: number;
  tokensLimit: number;
  createdAt: number;
}

interface StoreData {
  users: Record<string, UserRecord>;
}

const DATA_FILE = path.join(process.cwd(), "data", "api-keys.json");

function loadStore(): StoreData {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { users: {} };
  }
}

function saveStore(store: StoreData): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function generateApiKey(): string {
  const buf = crypto.randomBytes(24);
  return "eburon_" + buf.toString("hex");
}

// --- Firebase ID Token Verification (REST API, no service account needed) ---

async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email: string } | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const user = data.users?.[0];
    if (!user) return null;
    return { uid: user.localId, email: user.email || "" };
  } catch {
    return null;
  }
}

// --- Auth helpers ---

async function resolveToken(authHeader: string | undefined): Promise<{
  uid: string;
  email: string;
  userRecord: UserRecord | null;
} | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  // 1) Static admin key
  if (EBURON_API_KEY && token === EBURON_API_KEY) {
    return { uid: "admin", email: "admin@eburon.ai", userRecord: null };
  }

  // 2) Stored API key lookup
  const store = loadStore();
  for (const [uid, rec] of Object.entries(store.users)) {
    if (rec.apiKey === token) {
      return { uid, email: rec.email, userRecord: rec };
    }
  }

  // 3) Firebase ID token verification
  const fbUser = await verifyFirebaseToken(token);
  if (fbUser) {
    const key = `firebase:${fbUser.uid}`;
    let rec = store.users[key];
    if (!rec) {
      rec = {
        email: fbUser.email,
        apiKey: generateApiKey(),
        tokensUsed: 0,
        tokensLimit: TOKEN_LIMIT,
        createdAt: Date.now(),
      };
      store.users[key] = rec;
      saveStore(store);
    }
    return { uid: key, email: rec.email, userRecord: rec };
  }

  return null;
}

function checkQuota(uid: string, userRecord: UserRecord | null, estimatedTokens: number): string | null {
  if (uid === "admin") return null;
  if (!userRecord) return "User not found";
  if (userRecord.tokensUsed + estimatedTokens > userRecord.tokensLimit) {
    return "Token limit exceeded (1M tokens). Upgrade your plan or wait for reset.";
  }
  return null;
}

function consumeTokens(uid: string, tokens: number): void {
  if (uid === "admin") return;
  const store = loadStore();
  const rec = store.users[uid];
  if (rec) {
    rec.tokensUsed += tokens;
    saveStore(store);
  }
}

// Static aliases for non-eburon-branded models that are mapped to eburon-* public IDs.
const STATIC_ALIASES: Record<string, string> = {
  "eburon-embed": process.env.EBURON_EMBED_MODEL || "qwen3.5:0.8b",
  "eburon-reasoning": process.env.EBURON_REASONING_MODEL || "ornith:35b",
  "eburon-code": process.env.EBURON_CODE_MODEL || "qwen2.5-coder-1.5b-unsensored:local",
  "eburon-local": process.env.EBURON_LOCAL_MODEL || "orbit-ai:latest",
  "eburon-build-validator": process.env.EBURON_VALIDATOR_MODEL || "ornith:35b"
};

const EBURON_ENV_OVERRIDES: Record<string, string | undefined> = {
  "eburon-pro": process.env.EBURON_CORE_MODEL,
  "eburon-pro/autonomous": process.env.EBURON_AGENT_MODEL,
  "eburon-ui-designer-vision": process.env.EBURON_VISION_MODEL,
  "eburon/beta": process.env.EBURON_FAST_MODEL,
  "eburon-build-validator": process.env.EBURON_VALIDATOR_MODEL
};

const isEburonBranded = (name: string): boolean =>
  /(^|[\/:-])eburon([\/:-]|$)|^eburon/i.test(name);

const stripTag = (fullName: string): string => fullName.replace(/:[^:/]+$/, "");

let MODEL_ALIASES: Record<string, string> = { ...STATIC_ALIASES };
let PUBLIC_MODELS: { id: string; owned_by: string }[] = [];

async function loadEburonModelsFromOllama(): Promise<void> {
  const discovered: { id: string; fullName: string }[] = [];
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json() as { models?: { name: string }[] };
      for (const m of data.models ?? []) {
        const fullName = m.name;
        if (!isEburonBranded(fullName)) continue;
        const id = stripTag(fullName);
        if (!discovered.some(d => d.id === id)) {
          discovered.push({ id, fullName });
        }
      }
    }
  } catch (e) {
    console.warn("Could not auto-detect eburon models from Ollama:", (e as Error).message);
  }

  const aliases: Record<string, string> = { ...STATIC_ALIASES };
  const publicModels: { id: string; owned_by: string }[] = [];

  for (const { id, fullName } of discovered) {
    aliases[id] = EBURON_ENV_OVERRIDES[id] || fullName;
    publicModels.push({ id, owned_by: "eburon-ai" });
  }

  for (const [id, override] of Object.entries(EBURON_ENV_OVERRIDES)) {
    if (override && !aliases[id]) {
      aliases[id] = override;
      publicModels.push({ id, owned_by: "eburon-ai" });
    }
  }

  MODEL_ALIASES = aliases;
  PUBLIC_MODELS = publicModels;
  console.log(`Loaded ${publicModels.length} Eburon models (${discovered.length} auto-detected from Ollama).`);
}

// ---- Calculate estimated tokens from a request body ----

function estimatePromptTokens(messages: any[] | undefined, input: any): number {
  let text = "";
  if (messages) {
    for (const m of messages) {
      if (typeof m.content === "string") text += m.content + " ";
      else if (Array.isArray(m.content)) {
        for (const part of m.content) {
          if (part.text) text += part.text + " ";
        }
      }
    }
  }
  if (typeof input === "string") text += input + " ";
  if (Array.isArray(input)) text += input.join(" ");
  return Math.max(1, Math.ceil(text.length / 4));
}

// --- Express App ---

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Error handling for body-parser
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        error: { message: "Invalid JSON payload.", type: "invalid_request_error", code: "invalid_json" }
      });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        error: { message: "Request payload too large.", type: "invalid_request_error", code: "payload_too_large" }
      });
    }
    next(err);
  });

  // Authentication Middleware — accepts Firebase ID tokens, generated API keys, or EBURON_API_KEY
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authResult = await resolveToken(req.headers.authorization);
    if (!authResult) {
      return res.status(401).json({
        error: { message: "Invalid or missing API key. Provide a valid Bearer token.", type: "authentication_error", code: "invalid_api_key" }
      });
    }
    const quotaError = checkQuota(authResult.uid, authResult.userRecord, 0);
    if (quotaError) {
      return res.status(429).json({ error: { message: quotaError, type: "quota_error", code: "token_limit_exceeded" } });
    }
    req.uid = authResult.uid;
    req.userRecord = authResult.userRecord;
    next();
  };

  // Quota-aware auth — checks token limit from request body before proxying
  const authMiddlewareWithQuota = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authResult = await resolveToken(req.headers.authorization);
    if (!authResult) {
      return res.status(401).json({
        error: { message: "Invalid or missing API key.", type: "authentication_error", code: "invalid_api_key" }
      });
    }
    const estimatedTokens = estimatePromptTokens(req.body?.messages, req.body?.input);
    const quotaError = checkQuota(authResult.uid, authResult.userRecord, estimatedTokens);
    if (quotaError) {
      return res.status(429).json({ error: { message: quotaError, type: "quota_error", code: "token_limit_exceeded" } });
    }
    req.uid = authResult.uid;
    req.userRecord = authResult.userRecord;
    req.estimatedTokens = estimatedTokens;
    next();
  };

  // --- /v1/auth/user ---

  app.get("/v1/auth/user", authMiddleware, async (req, res) => {
    const store = loadStore();
    const rec = store.users[req.uid!];
    if (!rec) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      email: rec.email,
      apiKey: rec.apiKey,
      tokensUsed: rec.tokensUsed,
      tokensLimit: rec.tokensLimit
    });
  });

  // --- /v1/models ---

  app.get("/v1/models", authMiddleware, async (req, res) => {
    await loadEburonModelsFromOllama();
    return res.json({
      object: "list",
      data: PUBLIC_MODELS.map(m => ({ id: m.id, object: "model", owned_by: m.owned_by }))
    });
  });

  // --- /v1/chat/completions ---

  app.post("/v1/chat/completions", authMiddlewareWithQuota, async (req, res) => {
    try {
      const { model: publicModelId, messages, stream, temperature, ...rest } = req.body;
      const internalModelName = MODEL_ALIASES[publicModelId] || publicModelId;
      const ollamaUrl = `${OLLAMA_BASE_URL}/v1/chat/completions`;

      const requestBody = {
        model: internalModelName,
        messages,
        stream: !!stream,
        temperature,
        ...rest
      };

      let response;
      try {
        response = await fetch(ollamaUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
      } catch (e) {
        return res.status(503).json({
          error: { message: "Eburon AI local runtime is currently unreachable.", type: "server_error", code: "runtime_offline" }
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama error:", errorText);
        return res.status(response.status).json({
          error: { message: "Internal server error.", type: "server_error", code: "internal_error" }
        });
      }

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let totalOutputTokens = 0;

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const dataObj = JSON.parse(line.substring(6));
                  if (dataObj.model) dataObj.model = publicModelId;
                  if (dataObj.choices?.[0]?.delta?.content) {
                    totalOutputTokens += dataObj.choices[0].delta.content.split(" ").length;
                  }
                  res.write(`data: ${JSON.stringify(dataObj)}\n\n`);
                } catch (parseErr) {
                  res.write(`${line}\n`);
                }
              } else if (line) {
                res.write(`${line}\n`);
              }
            }
          }

          // Track token usage: input (estimated) + output (counted)
          const promptTokens = req.estimatedTokens || 0;
          const totalTokens = promptTokens + totalOutputTokens;
          consumeTokens(req.uid!, totalTokens);

          res.end();
        } else {
          res.end();
        }
      } else {
        const data = await response.json();
        if (data.model) data.model = publicModelId;

        // Track token usage from Ollama's usage data
        const promptTokens = data.usage?.prompt_tokens || req.estimatedTokens || 0;
        const completionTokens = data.usage?.completion_tokens || 0;
        const totalTokens = promptTokens + completionTokens;
        consumeTokens(req.uid!, totalTokens);

        // Attach usage tracking to response
        data.usage = {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens
        };

        res.json(data);
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({
        error: { message: e.message || "An unexpected error occurred", type: "server_error", code: "internal_error" }
      });
    }
  });

  // --- /v1/embeddings ---

  app.post("/v1/embeddings", authMiddlewareWithQuota, async (req, res) => {
    try {
      const { model: publicModelId, input, ...rest } = req.body;
      const internalModelName = MODEL_ALIASES[publicModelId] || publicModelId;
      const ollamaUrl = `${OLLAMA_BASE_URL}/v1/embeddings`;

      let response;
      try {
        response = await fetch(ollamaUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: internalModelName, input, ...rest })
        });
      } catch (e) {
        return res.status(503).json({
          error: { message: "Eburon AI local runtime is currently unreachable.", type: "server_error", code: "runtime_offline" }
        });
      }

      if (!response.ok) {
        return res.status(response.status).json({
          error: { message: "Internal server error.", type: "server_error", code: "internal_error" }
        });
      }

      const data = await response.json();
      if (data.model) data.model = publicModelId;

      const tokens = req.estimatedTokens || 0;
      consumeTokens(req.uid!, tokens);

      data.usage = { prompt_tokens: tokens, total_tokens: tokens };

      res.json(data);
    } catch (e: any) {
      res.status(500).json({
        error: { message: e.message || "An unexpected error occurred", type: "server_error", code: "internal_error" }
      });
    }
  });

  // --- Free Google Translate via translate_a/single (same engine their website uses) ---
  // Google's endpoint rejects URLs beyond ~5k chars, so chunk long inputs.

  const GT_MAX_CHARS = 4500;

  async function gtChunk(chunk: string, target: string, source: string = "auto") {
    const url = `https://translate.google.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Translate error: ${res.status}`);
    const data = await res.json();
    const translated = data[0]?.map((seg: any) => seg[0]).join("") || "";
    const detected = data[2] || source;
    return { translated, detected };
  }

  function splitText(text: string, max: number): string[] {
    if (text.length <= max) return [text];
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      if (i + max >= text.length) { chunks.push(text.slice(i)); break; }
      let cut = text.lastIndexOf("\n", i + max);
      if (cut <= i) cut = text.lastIndexOf(". ", i + max);
      if (cut <= i) cut = text.lastIndexOf(" ", i + max);
      if (cut <= i) cut = i + max;
      chunks.push(text.slice(i, cut + 1));
      i = cut + 1;
    }
    return chunks;
  }

  const gt = async (text: string, target: string, source: string = "auto") => {
    const chunks = splitText(text, GT_MAX_CHARS);
    let translated = "";
    let detected = source;
    for (let idx = 0; idx < chunks.length; idx++) {
      const part = await gtChunk(chunks[idx], target, source);
      translated += part.translated;
      if (idx === 0) detected = part.detected;
    }
    return { translated, detected };
  };

  // --- Eburon Translation API ---

  app.post("/v1/translation/text", authMiddleware, async (req, res) => {
    try {
      const { text, target_language, source_language = "auto" } = req.body;
      if (!text || !target_language) {
        return res.status(400).json({ error: "Missing required fields: text, target_language" });
      }

      const { translated, detected } = await gt(text, target_language, source_language);
      const tokens = Math.ceil(text.length / 4);
      consumeTokens(req.uid!, tokens);

      res.json({
        object: "translation",
        source_language, detected_language: detected, target_language,
        input: text, translation: translated,
        usage: { input_tokens: tokens, total_tokens: tokens },
        provider: "eburon-neural-nmt-v4"
      });
    } catch (error: any) {
      res.status(500).json({ error: "Translation failed", details: error.message });
    }
  });

  app.post("/v1/translation/detect-language", authMiddleware, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Missing required field: text" });

      const { detected } = await gt(text, "en");
      const tokens = Math.ceil(text.length / 4);
      consumeTokens(req.uid!, tokens);

      res.json({
        object: "language_detection",
        input: text, detected_language: detected,
        usage: { input_tokens: tokens, total_tokens: tokens },
        provider: "eburon-neural-nmt-v4"
      });
    } catch (error: any) {
      res.status(500).json({ error: "Detection failed", details: error.message });
    }
  });

  app.post("/v1/translation/images", authMiddleware, async (req, res) => {
    try {
      const { image_data, target_language } = req.body;
      if (!image_data || !target_language) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      consumeTokens(req.uid!, 1000);

      res.json({
        object: "image_translation", target_language,
        extracted_text: "", translated_text: "",
        note: "Text extraction from images is not available via the free tier.",
        usage: { total_tokens: 1000 },
        provider: "eburon-vision-nmt"
      });
    } catch (error: any) {
      res.status(500).json({ error: "Image translation failed", details: error.message });
    }
  });

  app.get("/v1/translation/languages", authMiddleware, async (req, res) => {
    res.json({
      object: "list",
      data: [
        { name: "English", code: "en" },
        { name: "Filipino", code: "tl" },
        { name: "Spanish", code: "es" },
      ]
    });
  });

  // Catch-all for non-existent API routes
  app.all("/v1/*", (req, res) => {
    res.status(404).json({
      error: { message: `Route ${req.method} ${req.url} not found`, type: "invalid_request_error", code: "resource_missing" }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await loadEburonModelsFromOllama();

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Kill the old process (lsof -i:${PORT} -t | xargs kill -9) and try again.`);
      process.exit(1);
    }
    throw err;
  });
}

startServer();
