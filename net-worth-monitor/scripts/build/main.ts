import { execSync } from "child_process";
import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "../..");

// Build ID for cache busting (timestamp format: yyyyMMddHHmmss)
const isDevBuild = process.env.NODE_ENV === "development";
const buildId = isDevBuild ? "" : new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

interface LambdaConfig {
  entry: string;
  outdir: string;
  forbiddenDeps?: string[];
}

const lambdas: LambdaConfig[] = [
  { entry: "src/api", outdir: "dist/api", forbiddenDeps: ["preact", "preact-render-to-string"] },
  { entry: "src/ui/server", outdir: "dist/ssr" },
];

const sharedConfig: esbuild.BuildOptions = {
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  jsx: "automatic",
  jsxImportSource: "preact",
  sourcemap: true,
  minify: false,
  metafile: true,
  banner: {
    js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
  },
};

// Define globals for SSR builds
const ssrDefines = {
  __BUILD_ID__: JSON.stringify(buildId),
};

const buildLambda = async ({ entry, outdir }: LambdaConfig) => {
  const entryFile = path.join(entry, "lambda.ts");
  const outFile = path.join(outdir, "index.js");

  console.log(`  ${entryFile} → ${outFile}`);

  // Add defines for SSR build
  const isSSR = entry === "src/ui/server";

  await esbuild.build({
    ...sharedConfig,
    entryPoints: [path.join(rootDir, entryFile)],
    outfile: path.join(rootDir, outFile),
    define: isSSR ? ssrDefines : undefined,
  });

  // Write package.json for ESM support
  fs.mkdirSync(path.join(rootDir, outdir), { recursive: true });
  fs.writeFileSync(path.join(rootDir, outdir, "package.json"), JSON.stringify({ type: "module" }, null, 2));
};

const buildClient = async () => {
  const jsFileName = buildId ? `app.${buildId}.js` : "app.js";
  const cssFileName = buildId ? `app.${buildId}.css` : "app.css";
  const outDir = path.join(rootDir, "dist/static");

  // Ensure output directory exists
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`  src/ui/client/index.tsx → dist/static/${jsFileName}`);

  // Build client JS bundle (CSS is built separately by PostCSS)
  await esbuild.build({
    entryPoints: [path.join(rootDir, "src/ui/client/index.tsx")],
    bundle: true,
    minify: !isDevBuild,
    platform: "browser",
    target: ["es2020", "chrome89", "firefox108", "safari16.4"],
    outfile: path.join(outDir, jsFileName),
    sourcemap: true,
    format: "esm",
    jsx: "automatic",
    jsxImportSource: "preact",
    external: ["*.css"],
    define: {
      "process.env.NODE_ENV": JSON.stringify(isDevBuild ? "development" : "production"),
      "import.meta.env.DEV": isDevBuild ? "true" : "false",
    },
  });

  // Build CSS with PostCSS (Tailwind 4)
  console.log(`  src/ui/client/app.css → dist/static/${cssFileName}`);

  // In monorepo, postcss binary is in root node_modules
  const monorepoRoot = path.join(rootDir, "..");
  const postcssPath = path.join(monorepoRoot, "node_modules/.bin/postcss");
  const cssInput = path.join(rootDir, "src/ui/client/app.css");
  const cssOutput = path.join(outDir, cssFileName);
  execSync(`"${postcssPath}" "${cssInput}" -o "${cssOutput}"`, { stdio: "inherit", cwd: rootDir });

  console.log(`\n  Build ID: ${buildId || "(dev)"}`);
};

const build = async () => {
  console.log("Building Lambda functions...\n");

  for (const lambda of lambdas) {
    await buildLambda(lambda);
  }

  console.log("\nBuilding client bundle...\n");
  await buildClient();

  console.log("\nDone!");
};

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
