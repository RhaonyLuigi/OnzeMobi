import { spawnSync } from "node:child_process";
import { writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(
  new URL("../node_modules/expo/bin/cli", import.meta.url),
);
const result = spawnSync(
  process.execPath,
  [cli, "export", "--platform", "web", "--output-dir", "dist-pages"],
  {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      ONZE_PAGES_BASE_PATH: "/OnzeMobi",
      EXPO_NO_TELEMETRY: "1",
    },
  },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
// GitHub must serve Expo's _expo directory without Jekyll filtering it.
await writeFile(new URL("../dist-pages/.nojekyll", import.meta.url), "");
for (const path of ["index.html", "home.html", "trip.html", "charging.html"]) {
  await access(new URL(`../dist-pages/${path}`, import.meta.url));
}
console.log("GitHub Pages export ready: dist-pages (base path /OnzeMobi)");
