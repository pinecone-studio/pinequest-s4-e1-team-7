import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { usersRoute } from "./routes/users";
import { translationsRoute } from "./routes/translations";
import { signsRoute } from "./routes/signs";
import { dictionaryRoute } from "./routes/dictionary";
import { webhooksRoute } from "./routes/webhooks";
import { authRoute } from "./routes/auth";
import { chatRoute } from "./routes/chat";
import { feedbackRoute } from "./routes/feedback";
import type { Env } from "./db";
import { handleChatWebSocket } from "./lib/chat-ws";
import { UserNotify } from "./durable-objects/UserNotify";

export { UserNotify };

type Variables = { user: { id: string; email: string; name: string; phone: string } };

const app = new Hono<{ Bindings: Env; Variables: Variables }>()
  .use("*", logger())
  .use(
    "*",
    cors({
      origin: (origin) => origin ?? "*",
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .get("/", (c) => c.json({ ok: true, message: "Sign Bridge API" }))
  .route("/api/auth", authRoute)
  .route("/api/chat", chatRoute)
  .route("/api/users", usersRoute)
  .route("/api/translations", translationsRoute)
  .route("/api/signs", signsRoute)
  .route("/api/dictionary", dictionaryRoute)
  .route("/api/webhooks", webhooksRoute)
  .route("/api/feedback", feedbackRoute);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat/ws") {
      return handleChatWebSocket(request, env);
    }
    return app.fetch(request, env, ctx);
  },
};
