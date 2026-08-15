export const DEFAULT_IGNORED_DIRS = new Set([
  "node_modules", ".git", ".nuxt", ".output", "dist",
  "build", "coverage", ".cache",
]);

export const IMPORTANT_FILES = new Set([
  "package.json", "package-lock.json", "pnpm-lock.yaml",
  "yarn.lock", "bun.lockb", "nuxt.config.ts", "vite.config.ts",
  "tsconfig.json", "Dockerfile", "docker-compose.yml",
  "composer.json", "requirements.txt", "go.mod", "Cargo.toml",
  ".env.example", "README.md", "README",
]);

export const KEEP_PATTERN =
  /^(index|app|main|router|layout|middleware)\./i;

export const ASSET_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
  ".ico", ".mp4", ".mp3",
]);