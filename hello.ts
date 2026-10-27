import { Pool } from "pg";
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

// A public readiness probe for the Neon Function deployment. It returns only
// service status, never credentials or database details.
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 5000 });
const storage = new S3Client({
  forcePathStyle: true,
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function hello(): Promise<Response> {
  const [database, objectStorage] = await Promise.allSettled([
    pool.query("SELECT 1"),
    storage.send(new HeadBucketCommand({ Bucket: "assets" })),
  ]);
  const checks = {
    postgres: database.status === "fulfilled" ? "ok" : "unavailable",
    objectStorage: objectStorage.status === "fulfilled" ? "ok" : "unavailable",
  };
  const ready = Object.values(checks).every((status) => status === "ok");
  return Response.json({ status: ready ? "ok" : "unavailable", checks }, { status: ready ? 200 : 503 });
}
