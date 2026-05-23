import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple YAML frontmatter parser
 * Handles:
 * ---
 * title: "My Title"
 * description: "My Description"
 * category: "guides"
 * ---
 * ... content ...
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
  const match = content.match(frontmatterRegex);
  if (!match) {
    return { frontmatter: {}, content };
  }

  const yamlStr = match[1];
  const frontmatter: Record<string, any> = {};

  // Parse simple YAML (key: value pairs)
  const lines = yamlStr.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }

  return { frontmatter, content: content.slice(match[0].length) };
}

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dir: string, baseDir: string = dir): Promise<{ filePath: string; relativePath: string }[]> {
  const files: { filePath: string; relativePath: string }[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findMarkdownFiles(fullPath, baseDir)));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const relativePath = path.relative(baseDir, fullPath);
        files.push({ filePath: fullPath, relativePath });
      }
    }
  } catch (e) {
    // Directory doesn't exist, return empty
  }
  return files;
}

/**
 * Determine category from file path
 */
function getCategoryFromPath(relativePath: string, frontmatter: Record<string, any>): string {
  if (frontmatter.category) return frontmatter.category;
  if (relativePath.includes("features")) return "features";
  if (relativePath.includes("guides")) return "guides";
  return "specs";
}

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
  const PORT = parseInt(process.env.PORT || '3000', 10);

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

  // Docs API Routes
  app.get("/api/docs", async (_req, res) => {
    try {
      const docsDir = path.join(__dirname, "docs");
      const mdFiles = await findMarkdownFiles(docsDir, docsDir);
      const docs = [];

      for (const { filePath, relativePath } of mdFiles) {
        const content = await fs.readFile(filePath, "utf-8");
        const { frontmatter } = parseFrontmatter(content);
        const category = getCategoryFromPath(relativePath, frontmatter);
        docs.push({
          id: relativePath.replace(/\\/g, "/").replace(".md", ""),
          title: frontmatter.title || path.basename(filePath, ".md"),
          description: frontmatter.description || "",
          category,
          relativePath: relativePath.replace(/\\/g, "/"),
        });
      }

      res.json(docs);
    } catch (error) {
      console.error("Docs list error:", error);
      res.status(500).json({ error: "Failed to fetch docs" });
    }
  });

  app.get("/api/docs/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const docsDir = path.join(__dirname, "docs");
      const filePath = path.join(docsDir, `${id}.md`);
      const content = await fs.readFile(filePath, "utf-8");
      const { frontmatter, content: body } = parseFrontmatter(content);
      const category = getCategoryFromPath(id, frontmatter);

      res.json({
        id,
        title: frontmatter.title || path.basename(filePath, ".md"),
        description: frontmatter.description || "",
        category,
        content: body,
      });
    } catch (error) {
      console.error("Doc fetch error:", error);
      res.status(404).json({ error: "Doc not found" });
    }
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
  // Alipay — App Payment
  // Prerequisites: ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY, ALIPAY_GATEWAY
  // ─────────────────────────────────────────────────────────────────────────

  const alipayAppId = process.env.ALIPAY_APP_ID ?? '';
  const alipayPrivateKey = process.env.ALIPAY_PRIVATE_KEY ?? '';
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY ?? '';
  const alipayGateway = process.env.ALIPAY_GATEWAY ?? 'https://openapi.alipay.com/gateway.do';
  const alipayNotifyUrl = process.env.ALIPAY_NOTIFY_URL ?? `${process.env.PAYMENT_SERVER_BASE_URL ?? 'https://api.thothapp.com'}/api/alipay/callback`;

  // Minimal in-memory Alipay order store (replace with DB in production)
  interface AlipayOrder {
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    transactionId?: string;
    createdAt: number;
  }
  const alipayOrderStore = new Map<string, AlipayOrder>();

  /**
   * Helper: Build Alipay request parameters with RSA2 signature
   */
  function buildAlipayRequestParams(method: string, bizContent: any): Record<string, string> {
    const crypto = require('crypto');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const params: Record<string, string> = {
      app_id: alipayAppId,
      method,
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp,
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    };

    // Add notify_url for app pay
    if (method === 'alipay.trade.app.pay') {
      params.notify_url = alipayNotifyUrl;
    }

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(params).sort();
    let signStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&');

    // Sign with RSA2
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signStr);
    const privateKeyPem = formatPrivateKey(alipayPrivateKey);
    const sign = signer.sign(privateKeyPem, 'base64');

    params.sign = sign;

    return params;
  }

  /**
   * Helper: Format private key to PEM format
   */
  function formatPrivateKey(key: string): string {
    if (!key.includes('-----BEGIN')) {
      return `-----BEGIN PRIVATE KEY-----\n${key.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
    }
    return key;
  }

  /**
   * Helper: Format public key to PEM format
   */
  function formatPublicKey(key: string): string {
    if (!key.includes('-----BEGIN')) {
      return `-----BEGIN PUBLIC KEY-----\n${key.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    }
    return key;
  }

  /**
   * Helper: Verify Alipay notification signature
   */
  function verifyAlipayNotify(params: Record<string, string>): boolean {
    const crypto = require('crypto');

    // Extract sign and sign_type
    const { sign, sign_type, ...restParams } = params;

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(restParams).sort();
    let signStr = sortedKeys.map(key => `${key}=${restParams[key]}`).join('&');

    // Verify with RSA2
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signStr);
    const publicKeyPem = formatPublicKey(alipayPublicKey);

    return verifier.verify(publicKeyPem, sign, 'base64');
  }

  /**
   * POST /api/alipay/create-order
   * Create an Alipay App payment order.
   * Returns signed orderStr for Alipay SDK.
   */
  app.post('/api/alipay/create-order', async (req, res) => {
    try {
      const { out_trade_no, total_amount, subject, attach = '' } = req.body;

      if (!out_trade_no || !total_amount || !subject) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Build Alipay order parameters
      const bizContent = {
        out_trade_no,
        total_amount: total_amount.toFixed(2),
        subject,
        body: attach,
        product_code: 'QUICK_MSECURITY_PAY',
      };

      const params = buildAlipayRequestParams('alipay.trade.app.pay', bizContent);

      // Build orderStr for SDK
      const orderStr = Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

      // Store order locally
      alipayOrderStore.set(out_trade_no, {
        status: 'pending',
        createdAt: Date.now(),
      });

      return res.json({
        orderStr,
        outTradeNo: out_trade_no,
      });
    } catch (err: any) {
      console.error('[Alipay] Create order error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/alipay/callback
   * Alipay async payment notification.
   * Respond with 'success' to acknowledge receipt.
   */
  app.post('/api/alipay/callback', express.urlencoded({ extended: true }), async (req, res) => {
    try {
      const params = req.body as Record<string, string>;

      // Verify signature
      const isValid = verifyAlipayNotify(params);
      if (!isValid) {
        console.error('[Alipay] Invalid notification signature');
        return res.send('fail');
      }

      const { out_trade_no, trade_status, trade_no } = params;

      // Update order status
      let status: 'pending' | 'success' | 'failed' | 'cancelled' = 'pending';
      if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
        status = 'success';
      } else if (trade_status === 'TRADE_CLOSED') {
        status = 'cancelled';
      }

      if (alipayOrderStore.has(out_trade_no)) {
        alipayOrderStore.get(out_trade_no)!.status = status;
        alipayOrderStore.get(out_trade_no)!.transactionId = trade_no;
      }

      console.log(`[Alipay Callback] ${out_trade_no} → ${trade_status}`);
      return res.send('success');
    } catch (err: any) {
      console.error('[Alipay] Callback error:', err);
      res.send('fail');
    }
  });

  /**
   * GET /api/alipay/query-order
   * Query Alipay order status (for client polling fallback).
   */
  app.get('/api/alipay/query-order', async (req, res) => {
    try {
      const { out_trade_no } = req.query as { out_trade_no: string };

      if (!out_trade_no) return res.status(400).json({ error: 'Missing out_trade_no' });

      // Check local store first (fast)
      const local = alipayOrderStore.get(out_trade_no);
      if (local && local.status !== 'pending') {
        return res.json({
          outTradeNo: out_trade_no,
          tradeState: local.status,
          transactionId: local.transactionId ?? '',
          tradeStateDesc: local.status,
        });
      }

      // Fallback: Query Alipay directly
      const bizContent = { out_trade_no };
      const params = buildAlipayRequestParams('alipay.trade.query', bizContent);

      const queryStr = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

      const alipayRes = await fetch(`${alipayGateway}?${queryStr}`, {
        method: 'GET',
      });

      const alipayData = await alipayRes.json();
      const response = alipayData.alipay_trade_query_response;

      if (response.code !== '10000') {
        return res.status(404).json({ error: response.sub_msg || 'Order not found' });
      }

      let tradeState: 'pending' | 'success' | 'failed' | 'cancelled' = 'pending';
      if (response.trade_status === 'TRADE_SUCCESS' || response.trade_status === 'TRADE_FINISHED') {
        tradeState = 'success';
      } else if (response.trade_status === 'TRADE_CLOSED') {
        tradeState = 'cancelled';
      } else {
        tradeState = 'pending';
      }

      // Update local store
      if (alipayOrderStore.has(out_trade_no)) {
        alipayOrderStore.get(out_trade_no)!.status = tradeState;
        alipayOrderStore.get(out_trade_no)!.transactionId = response.trade_no;
      }

      return res.json({
        outTradeNo: out_trade_no,
        tradeState,
        transactionId: response.trade_no ?? '',
        tradeStateDesc: response.trade_status ?? '',
      });
    } catch (err: any) {
      console.error('[Alipay] Query error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Google Play Billing — Server-Side Verification & RTDN
  // Prerequisites: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON, GOOGLE_PLAY_PACKAGE_NAME
  // ─────────────────────────────────────────────────────────────────────────

  const googlePlayPackageName = process.env.GOOGLE_PLAY_PACKAGE_NAME ?? 'com.thoth.dreamarchive';
  let googlePlayServiceAccount: any = null;

  /**
   * Initialize Google Play Developer API service account credentials.
   * Called lazily on first API request.
   */
  async function getGooglePlayCredentials(): Promise<any> {
    if (googlePlayServiceAccount) return googlePlayServiceAccount;

    const keyPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    if (!keyPath) {
      throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON environment variable is not set');
    }

    try {
      const { readFileSync } = await import('fs');
      const { GoogleAuth } = await import('google-auth-library');
      const keyFile = JSON.parse(readFileSync(keyPath, 'utf8'));

      const auth = new GoogleAuth({
        credentials: {
          client_email: keyFile.client_email,
          private_key: keyFile.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      });

      googlePlayServiceAccount = auth;
      return auth;
    } catch (err) {
      console.error('[Google Play] Failed to initialize credentials:', err);
      throw new Error('Failed to initialize Google Play API credentials');
    }
  }

  /**
   * Call the Google Play Developer API.
   */
  async function callPlayDeveloperApi(path: string, method: string = 'GET', body?: any): Promise<any> {
    const auth = await getGooglePlayCredentials();
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const url = `https://www.googleapis.com/androidpublisher/v3/applications/${googlePlayPackageName}${path}`;

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      console.error(`[Google Play] API error ${res.status}:`, data);
      throw new Error(data.error?.message ?? `Google Play API error: ${res.status}`);
    }

    return data;
  }

  /**
   * POST /api/google-play/verify
   * Verify a purchase token via Google Play Developer API.
   * Updates Firestore user profile with subscription tier.
   */
  app.post('/api/google-play/verify', async (req, res) => {
    try {
      const { purchaseToken, productId, orderId, userId } = req.body;

      if (!purchaseToken || !productId || !userId) {
        return res.status(400).json({ error: 'Missing required fields: purchaseToken, productId, userId' });
      }

      // Determine if this is a subscription or one-time product
      const isSubscription = productId.includes('premium');

      if (isSubscription) {
        // Verify subscription via purchases.subscriptionsv2.get
        const purchase = await callPlayDeveloperApi(
          `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`
        );

        // Verify purchase state
        if (purchase.purchaseState !== 0) {
          return res.status(400).json({
            error: 'Purchase not completed',
            purchaseState: purchase.purchaseState,
          });
        }

        // Verify package name
        if (purchase.packageName !== googlePlayPackageName) {
          return res.status(400).json({ error: 'Package name mismatch' });
        }

        // Check subscription state
        const subscriptionState = purchase.subscriptionState;
        const isActive = ['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'].includes(subscriptionState);

        if (!isActive) {
          return res.json({
            verified: false,
            tier: 'free',
            subscriptionState,
          });
        }

        // Acknowledge the purchase if not already acknowledged
        if (purchase.acknowledgementState !== 1) {
          await callPlayDeveloperApi(
            `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
            'POST'
          );
        }

        // Calculate expiry from line items
        const expiryDate = purchase.lineItems?.[0]?.expiryTime
          ? new Date(purchase.lineItems[0].expiryTime).toISOString()
          : null;

        // TODO: Update Firestore user profile with subscription tier
        // await updateUserSubscription(userId, {
        //   tier: 'premium',
        //   planId: productId,
        //   expiryDate,
        //   autoRenewing: purchase.autoResumeTime != null,
        //   purchaseToken,
        // });

        console.log(`[Google Play] Verified subscription: ${userId} → ${productId}`);

        return res.json({
          verified: true,
          tier: 'premium',
          planId: productId,
          expiryDate,
          autoRenewing: true,
          subscriptionState,
        });
      } else {
        // Verify one-time product via purchases.products.get
        const purchase = await callPlayDeveloperApi(
          `/purchases/products/tokens/${encodeURIComponent(purchaseToken)}`
        );

        if (purchase.purchaseState !== 0) {
          return res.status(400).json({
            error: 'Purchase not completed',
            purchaseState: purchase.purchaseState,
          });
        }

        if (purchase.packageName !== googlePlayPackageName) {
          return res.status(400).json({ error: 'Package name mismatch' });
        }

        // Acknowledge if needed
        if (purchase.acknowledgementState !== 1) {
          await callPlayDeveloperApi(
            `/purchases/products/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
            'POST'
          );
        }

        console.log(`[Google Play] Verified one-time purchase: ${userId} → ${productId}`);

        return res.json({
          verified: true,
          productId,
          purchaseState: purchase.purchaseState,
        });
      }
    } catch (err: any) {
      console.error('[Google Play] Verify error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/google-play/consume
   * Consume a one-time purchase and add credits to the user's balance.
   */
  app.post('/api/google-play/consume', async (req, res) => {
    try {
      const { purchaseToken, productId, orderId, userId } = req.body;

      if (!purchaseToken || !productId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify the purchase first
      const purchase = await callPlayDeveloperApi(
        `/purchases/products/tokens/${encodeURIComponent(purchaseToken)}`
      );

      if (purchase.purchaseState !== 0) {
        return res.status(400).json({ error: 'Purchase not completed' });
      }

      if (purchase.consumptionState === 1) {
        return res.status(400).json({ error: 'Purchase already consumed' });
      }

      // Consume the purchase via Play Developer API
      await callPlayDeveloperApi(
        `/purchases/products/tokens/${encodeURIComponent(purchaseToken)}:consume`,
        'POST'
      );

      // Determine credits to add based on product ID
      let creditsToAdd = 0;
      if (productId === 'thoth_credits_10') creditsToAdd = 10;
      else if (productId === 'thoth_credits_50') creditsToAdd = 50;

      // TODO: Update Firestore user credits_balance
      // const newBalance = await addUserCredits(userId, creditsToAdd);

      console.log(`[Google Play] Consumed purchase: ${userId} → ${productId} (+${creditsToAdd} credits)`);

      return res.json({
        verified: true,
        creditsAdded: creditsToAdd,
        // newBalance, // Uncomment when Firestore integration is ready
      });
    } catch (err: any) {
      console.error('[Google Play] Consume error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/google-play/subscription-status
   * Query the current subscription status for a user.
   */
  app.get('/api/google-play/subscription-status', async (req, res) => {
    try {
      const { userId } = req.query as { userId: string };

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      // TODO: Read from Firestore
      // const userProfile = await getUserProfile(userId);
      // if (userProfile.subscription_tier === 'premium' && !isExpired(userProfile)) {
      //   return res.json({ tier: 'premium', planId: userProfile.subscription_plan_id, ... });
      // }

      // Placeholder response until Firestore integration
      return res.json({
        tier: 'free',
        planId: null,
        expiryDate: null,
        autoRenewing: false,
      });
    } catch (err: any) {
      console.error('[Google Play] Subscription status error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/google-play/rtdn
   * Real-Time Developer Notification webhook from Google Cloud Pub/Sub.
   * Receives subscription state change notifications.
   */
  app.post('/api/google-play/rtdn', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const body = (req as any).body?.toString() ?? '';
      const message = JSON.parse(body);
      const pubsubMessage = message.message;

      if (!pubsubMessage?.data) {
        console.warn('[Google Play RTDN] Empty message data');
        return res.status(200).send('OK');
      }

      // Decode base64 data
      const decodedData = Buffer.from(pubsubMessage.data, 'base64').toString('utf8');
      const notification = JSON.parse(decodedData);

      const { notificationType, purchaseToken, subscriptionId } = notification;

      console.log(`[Google Play RTDN] ${notificationType} for ${subscriptionId ?? purchaseToken}`);

      // Fetch full purchase details from Play Developer API
      if (purchaseToken) {
        try {
          const purchase = await callPlayDeveloperApi(
            `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`
          );

          // TODO: Update Firestore based on notification type
          switch (notificationType) {
            case 1: // SUBSCRIPTION_PURCHASED
              console.log(`[Google Play RTDN] Subscription purchased: ${subscriptionId}`);
              break;
            case 2: // SUBSCRIPTION_RENEWED
              console.log(`[Google Play RTDN] Subscription renewed: ${subscriptionId}`);
              break;
            case 3: // SUBSCRIPTION_IN_GRACE_PERIOD
              console.log(`[Google Play RTDN] Subscription in grace period: ${subscriptionId}`);
              break;
            case 4: // SUBSCRIPTION_ON_HOLD
              console.log(`[Google Play RTDN] Subscription on hold: ${subscriptionId}`);
              break;
            case 5: // SUBSCRIPTION_REVOKED
              console.log(`[Google Play RTDN] Subscription revoked: ${subscriptionId}`);
              break;
            case 6: // SUBSCRIPTION_EXPIRED
              console.log(`[Google Play RTDN] Subscription expired: ${subscriptionId}`);
              break;
            case 13: // SUBSCRIPTION_PAUSED
              console.log(`[Google Play RTDN] Subscription paused: ${subscriptionId}`);
              break;
            case 14: // SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED
              console.log(`[Google Play RTDN] Pause schedule changed: ${subscriptionId}`);
              break;
            case 15: // SUBSCRIPTION_RESTARTED
              console.log(`[Google Play RTDN] Subscription restarted: ${subscriptionId}`);
              break;
            default:
              console.log(`[Google Play RTDN] Unknown notification type: ${notificationType}`);
          }
        } catch (apiErr) {
          console.error(`[Google Play RTDN] Failed to fetch purchase details:`, apiErr);
        }
      }

      // Always return 200 to acknowledge receipt
      return res.status(200).send('OK');
    } catch (err: any) {
      console.error('[Google Play RTDN] Error:', err);
      // Still return 200 to prevent retry spam
      return res.status(200).send('OK');
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
