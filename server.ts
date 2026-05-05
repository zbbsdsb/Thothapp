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

  // ─────────────────────────────────────────────────────────────────────────
  // WeChat Pay — App Payment (APIv3)
  // Prerequisites: WX_MCHID, WX_SERIAL_NO, WX_PRIVATE_KEY_PATH, WX_APIV3_KEY
  // ─────────────────────────────────────────────────────────────────────────

  const wxMchId         = process.env.WX_MCHID          ?? '';
  const wxSerialNo      = process.env.WX_SERIAL_NO       ?? '';
  const wxPrivateKeyPath = process.env.WX_PRIVATE_KEY_PATH ?? '';
  const wxApiV3Key       = process.env.WX_APIV3_KEY       ?? '';
  const wxAppId         = process.env.WX_APP_ID          ?? '';

  // Minimal in-memory order store (replace with DB in production)
  const orderStore = new Map<string, any>();

  /** Build WeChat Pay APIv3 request signature */
  async function buildWxV3Signature(
    method: string,
    url: string,
    body: string,
  ): Promise<{ timestamp: string; nonce: string; signature: string }> {
    const { readFileSync } = await import('fs');
    const crypto = await import('crypto');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID().replace(/-/g, '');
    const privateKey = readFileSync(wxPrivateKeyPath, 'utf8');

    const signStr = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
    const sign = crypto
      .createSign('RSA-SHA256')
      .update(signStr)
      .sign(privateKey, 'base64');

    return { timestamp, nonce, signature: sign };
  }

  /** AES-256-GCM decrypt WeChat callback body (APIv3) */
  function decryptCallback(cipherText: string): any {
    const crypto = require('crypto');
    const buffer = Buffer.from(cipherText, 'base64');
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(buffer.length - 16);
    const data = buffer.subarray(12, buffer.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(wxApiV3Key, 'utf8'), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  }

  /**
   * POST /api/payment/create-order
   * Create a WeChat App payment order via APIv3.
   * Returns signed SDK call parameters for openWeChatPay().
   */
  app.post('/api/payment/create-order', async (req, res) => {
    try {
      const { out_trade_no, amount, description, attach = '' } = req.body;

      if (!out_trade_no || !amount || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const nonceStr = require('crypto').randomUUID().replace(/-/g, '');
      const timestamp = Math.floor(Date.now() / 1000).toString();

      // Step 1: WeChat unified order
      const orderPayload = JSON.stringify({
        appid: wxAppId,
        mchid: wxMchId,
        description,
        out_trade_no,
        time_expire: new Date(Date.now() + 30 * 60 * 1000)
          .toISOString()
          .replace('.000Z', 'Z'),
        amount: { total: amount, currency: 'CNY' },
        attach,
        notify_url: `${process.env.PAYMENT_SERVER_BASE_URL ?? 'https://api.thothapp.com'}/api/payment/callback`,
      });

      const { timestamp: sigTs, nonce, signature } = await buildWxV3Signature(
        'POST',
        '/v3/pay/transactions/app',
        orderPayload,
      );

      const wxRes = await fetch('https://api.mch.weixin.qq.com/v3/pay/transactions/app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${wxMchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${sigTs}",serial_no="${wxSerialNo}"`,
        },
        body: orderPayload,
      });

      const wxData = await wxRes.json();

      if (!wxRes.ok || wxData.code) {
        console.error('[WeChat] Create order failed:', wxData);
        return res.status(400).json({ error: wxData.message ?? 'WeChat order failed' });
      }

      const prepayId: string = wxData.prepay_id;

      // Step 2: Sign parameters for WeChat SDK (App-side call)
      // signStr = `${wxAppId}\n${prepayId}\n${timestamp}\n${nonceStr}\n`
      const sdkSignStr = `${wxAppId}\n${prepayId}\n${timestamp}\n${nonceStr}\n`;
      const { readFileSync } = await import('fs');
      const { createSign } = await import('crypto');
      const privateKey = readFileSync(wxPrivateKeyPath, 'utf8');
      const sdkSign = createSign('RSA-SHA256').update(sdkSignStr).sign(privateKey, 'base64');

      // Store order locally for query
      orderStore.set(out_trade_no, {
        prepayId,
        status: 'pending',
        createdAt: Date.now(),
      });

      return res.json({
        prepayId,
        nonceStr,
        timestamp,
        sign: sdkSign,
        outTradeNo: out_trade_no,
      });
    } catch (err: any) {
      console.error('[WeChat] Create order error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/payment/callback
   * WeChat async payment notification (decrypted via APIv3 AES key).
   * Respond HTTP 200 to acknowledge receipt.
   */
  app.post('/api/payment/callback', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const body = (req as any).body?.toString() ?? '';
      const headers = req.headers as Record<string, string>;
      const wxSign = headers['wechatpay-signature'];
      const wxTs = headers['wechatpay-timestamp'];
      const wxNonce = headers['wechatpay-nonce'];

      // TODO: verify WeChat signature (use WX_APIV3_KEY to HMAC-SHA256 check)

      let plain: any;
      try {
        const cipherText = JSON.parse(body).resource?.ciphertext;
        if (!cipherText) return res.status(400).send('invalid body');
        plain = decryptCallback(cipherText);
      } catch {
        return res.status(400).send('decrypt failed');
      }

      const { out_trade_no, trade_state, transaction_id } = plain;

      if (orderStore.has(out_trade_no)) {
        orderStore.get(out_trade_no).status =
          trade_state === 'SUCCESS' ? 'success' : trade_state === 'PAYERROR' ? 'failed' : 'pending';
        orderStore.get(out_trade_no).transactionId = transaction_id;
      }

      console.log(`[WeChat Callback] ${out_trade_no} → ${trade_state}`);
      return res.status(200).json({ code: 'SUCCESS', message: 'OK' });
    } catch (err: any) {
      console.error('[WeChat] Callback error:', err);
      res.status(500).send('error');
    }
  });

  /**
   * GET /api/payment/query-order
   * Query WeChat order status (for client polling fallback).
   */
  app.get('/api/payment/query-order', async (req, res) => {
    try {
      const { out_trade_no } = req.query as { out_trade_no: string };

      if (!out_trade_no) return res.status(400).json({ error: 'Missing out_trade_no' });

      // Check local store first (fast)
      const local = orderStore.get(out_trade_no as string);
      if (local) {
        return res.json({
          outTradeNo: out_trade_no,
          tradeState: local.status,
          transactionId: local.transactionId ?? '',
          tradeStateDesc: local.status,
        });
      }

      // Fallback: query WeChat directly
      const url = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${out_trade_no}?mchid=${wxMchId}`;
      const { timestamp: sigTs, nonce, signature } = await buildWxV3Signature('GET', `/v3/pay/transactions/out-trade-no/${out_trade_no}?mchid=${wxMchId}`, '');
      const wxRes = await fetch(url, {
        headers: {
          Authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${wxMchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${sigTs}",serial_no="${wxSerialNo}"`,
        },
      });

      if (!wxRes.ok) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const wxData = await wxRes.json();
      return res.json({
        outTradeNo: out_trade_no,
        tradeState: wxData.trade_state === 'SUCCESS' ? 'success' : wxData.trade_state === 'USERPAYING' ? 'pending' : 'failed',
        transactionId: wxData.transaction_id ?? '',
        tradeStateDesc: wxData.trade_state_desc ?? '',
      });
    } catch (err: any) {
      console.error('[WeChat] Query error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R2 Upload
  // ─────────────────────────────────────────────────────────────────────────

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
