import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173", "capacitor://localhost"];

/** Sanitize file key to prevent path traversal while preserving directory structure */
function sanitizeFileName(fileName: string): string {
  // Normalize backslashes to forward slashes
  const normalized = fileName.replace(/\\/g, "/");
  // Remove parent directory references and leading slashes
  const safe = normalized.replace(/\.\./g, "").replace(/^\/+|\/+$/g, "");
  // Validate each path segment
  const segments = safe.split("/");
  for (const seg of segments) {
    if (!seg || seg.length > 255 || !/^[a-zA-Z0-9._-]+$/.test(seg)) {
      return "";
    }
  }
  return safe;
}

/** Validate content type against allowed audio formats */
const ALLOWED_CONTENT_TYPES = new Set([
  "audio/webm",
  "audio/wav",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/x-m4a",
  "audio/mp3",
]);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  app.use(express.json());

  // R2 Configuration
  const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Get Presigned URL for R2 Upload
  app.post("/api/r2/presign", async (req, res) => {
    try {
      const { fileName, contentType } = req.body;

      // Validate required fields
      if (!fileName || !contentType) {
        return res.status(400).json({ error: "fileName and contentType are required" });
      }

      // Validate content type
      if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
        return res.status(400).json({ error: `Unsupported content type: ${contentType}` });
      }

      // Validate and sanitize file name
      const key = sanitizeFileName(fileName);
      if (!key || key.length > 512) {
        return res.status(400).json({ error: "Invalid file name" });
      }

      if (!process.env.R2_BUCKET_NAME) {
        return res.status(500).json({ error: "R2_BUCKET_NAME not configured" });
      }

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

      const publicUrl = process.env.R2_PUBLIC_URL
        ? `${process.env.R2_PUBLIC_URL}/${key}`
        : `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${key}`;

      res.json({ signedUrl, publicUrl });
    } catch (error: any) {
      console.error("R2 Presign Error:", error);
      res.status(500).json({ error: error.message });
    }
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
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
