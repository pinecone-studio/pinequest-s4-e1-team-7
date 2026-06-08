import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { usersRoute } from "./routes/users";
import { translationsRoute } from "./routes/translations";
import { signsRoute } from "./routes/signs";
import { dictionaryRoute } from "./routes/dictionary";
import { webhooksRoute } from "./routes/webhooks";
import type { Env } from "./db";

const app = new Hono<{ Bindings: Env }>()
  .use("*", logger())
  .use(
    "*",
    cors({
      origin: (origin) => origin ?? "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  )
  .get("/", (c) => c.json({ ok: true, message: "Sign Bridge API" }))
  .route("/api/users", usersRoute)
  .route("/api/translations", translationsRoute)
  .route("/api/signs", signsRoute)
  .route("/api/dictionary", dictionaryRoute)
  .route("/api/webhooks", webhooksRoute);

export default app;
