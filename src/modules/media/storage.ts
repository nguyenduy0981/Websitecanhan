import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env, isR2Configured } from "@/env";
import { ServiceUnavailableError } from "@/lib/errors";

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (!isR2Configured) {
    throw new ServiceUnavailableError(
      "Media upload isn't available yet — storage hasn't been configured.",
    );
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return cachedClient;
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  const s3 = getClient();
  await s3.send(
    new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  const s3 = getClient();
  await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
}

export function publicUrlFor(key: string): string {
  if (!env.R2_PUBLIC_URL) {
    throw new ServiceUnavailableError(
      "Media upload isn't available yet — storage hasn't been configured.",
    );
  }
  return `${env.R2_PUBLIC_URL}/${key}`;
}
