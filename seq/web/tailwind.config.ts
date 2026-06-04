import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f17",
        panel: "#111827",
        accent: "#7c3aed",
      },
    },
  },
  plugins: [],
};

export default config;
