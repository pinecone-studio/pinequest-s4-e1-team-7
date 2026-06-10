import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Env = {
  DB: D1Database;
  BUCKET: R2Bucket;
  CLERK_WEBHOOK_SECRET?: string;
  JWT_SECRET?: string;
};

export const createDb = (env: Env) => drizzle(env.DB, { schema });
