const isCodeSandbox =
  "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;
import { resolve } from "path";

export default {
  root: "",
  server: {
    host: true,
    open: !isCodeSandbox, // Open if it's not a CodeSandbox
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "./index.html"),
        nested: resolve(__dirname, "./nested/index2.html"),
      },
    },
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
  },
};
