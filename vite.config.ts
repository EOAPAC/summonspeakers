// The shared config preset already registers these — do NOT add them manually
// or the app breaks with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss,
//     tsConfigPaths, nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection.
// Pass extra options through defineConfig({ vite: { ... }, ... }) as below.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Pinned rather than left to auto-detection. The preset defaults nitro to
  // cloudflare-module; nitro's own zero-config detection would pick Vercel up
  // anyway, but naming it means a build produces the same output whether or not
  // it runs on Vercel's infrastructure. Override per environment with
  // NITRO_PRESET if this ever deploys somewhere else.
  nitro: { preset: "vercel" },

  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
