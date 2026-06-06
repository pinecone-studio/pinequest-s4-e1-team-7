import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/sso-callback(.*)",
  "/call(.*)",
  "/models(.*)",
  "/mediapipe-wasm(.*)",
  "/tfjs-wasm(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Static ML assets (.wasm/.task/.bin) skip auth entirely — they must load
    // for the live recognizer regardless of session state.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|wasm|task|bin)).*)",
    "/(api|trpc)(.*)",
  ],
};
