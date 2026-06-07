import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sign-Bridge",
    short_name: "Sign",
    description: "Монгол дохионы хэлний шууд дуудлага",
    start_url: "/",
    display: "standalone",
    background_color: "#0a120d",
    theme_color: "#2fae5e",
    icons: [
      { src: "/", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
