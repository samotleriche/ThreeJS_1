const isCodeSandbox =
  "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;
import { resolve } from "path";

export default {
  root: "",
  base: "./",
  server: {
    host: true,
    open: !isCodeSandbox, // Open if it's not a CodeSandbox
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "./index.html"),
        nested: resolve(__dirname, "./nested/index2.html"),
        nested2: resolve(__dirname, "./nested2/index.html"),
        nested3: resolve(__dirname, "./index.html"),
      },
    },
  },
};
