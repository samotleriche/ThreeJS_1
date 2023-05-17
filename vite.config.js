import glsl from "vite-plugin-glsl";

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
        nested3: resolve(__dirname, "./nested3/index.html"),
        nested4: resolve(__dirname, "./nested4/index.html"),
        nested5: resolve(__dirname, "./nested5/index.html"),
        nested6: resolve(__dirname, "./nested6/index.html"),
        shaders: resolve(__dirname, "./shaders/index.html"),
        modified: resolve(__dirname, "./modified/index.html"),
      },
    },
  },
  plugins: [glsl()],
};
