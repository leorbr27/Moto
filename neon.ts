import { defineConfig } from "@Neon/config/v1";

export default defineConfig({
  auth: true,
  preview: {
    functions: {
      api: {
        name: "Moto API",
        source: "src/index.ts",
      },
    },
  },
});
