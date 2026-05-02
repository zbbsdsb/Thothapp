import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ""
  }
});

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

/**
 * Uploads an audio file to Cloudflare R2.
 * @param audioBlob The audio blob to upload
 * @param fileName The name of the file
 * @returns A Promise that resolves to the URL of the uploaded file
 */
export const uploadToR2 = async (audioBlob: Blob, fileName: string, mimeType: string): Promise<string> => {
  try {
    if (!bucketName) {
      throw new Error("Cloudflare R2 bucket name is not set");
    }

    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: mimeType
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    // Upload the file using the presigned URL
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: audioBlob,
      headers: {
        "Content-Type": mimeType
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to R2: ${response.statusText}`);
    }

    // Return the URL for the uploaded file
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw error;
  }
};
