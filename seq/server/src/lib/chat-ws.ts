import type { Env } from "@/db";
import { verifyJwt } from "@/lib/crypto";

/** Hono-г тойрч WebSocket upgrade-ийг DO руу шууд дамжуулна. */
export async function handleChatWebSocket(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.headers.get("Upgrade") !== "websocket") {
    return Response.json({ error: "WebSocket шаардлагатай" }, { status: 426 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return Response.json({ error: "token шаардлагатай" }, { status: 401 });
  }

  const secret = env.JWT_SECRET ?? "dev-sign-bridge-secret-change-me";
  const user = await verifyJwt(token, secret);
  if (!user) {
    return Response.json({ error: "Token хүчингүй" }, { status: 401 });
  }

  if (!env.USER_NOTIFY) {
    return Response.json({ error: "Realtime тохиргоо байхгүй" }, { status: 503 });
  }

  const stub = env.USER_NOTIFY.get(env.USER_NOTIFY.idFromName(user.sub));
  return stub.fetch(request);
}
