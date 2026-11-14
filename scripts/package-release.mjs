import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const targetArg = process.argv[2];
if (!targetArg || !path.isAbsolute(targetArg)) {
  throw new Error("Pass an absolute, empty release directory outside the repository.");
}
const target = path.resolve(targetArg);
const relative = path.relative(root, target);
if (
  !(relative === ".." || relative.startsWith(`..${path.sep}`)) ||
  root.startsWith(target + path.sep)
) {
  throw new Error("Release output must be outside the repository and not its ancestor.");
}
if (fs.existsSync(target) && fs.readdirSync(target).length) {
  throw new Error("Release output must be empty. Existing releases are never overwritten.");
}
const dist = path.join(root, "dist");
if (!fs.existsSync(path.join(dist, "index.html")))
  throw new Error("Run the quality gate first to build dist.");
const files = {};
function inspect(folder, prefix = "") {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const name = prefix + entry.name;
    const file = path.join(folder, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Release cannot contain symlinks.");
    if (entry.isDirectory()) inspect(file, `${name}/`);
    else {
      if (name.split("/").some((part) => part.startsWith(".")) || name.endsWith(".map")) {
        throw new Error(`Unexpected release file: ${name}`);
      }
      files[name] = createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    }
  }
}
inspect(dist);
const ordered = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
const releaseId = createHash("sha256").update(JSON.stringify(ordered)).digest("hex");
fs.mkdirSync(target, { recursive: true });
fs.cpSync(dist, path.join(target, "site"), { recursive: true });
fs.writeFileSync(
  path.join(target, "release-manifest.json"),
  JSON.stringify(
    {
      version: 1,
      releaseId,
      createdAt: new Date().toISOString(),
      node: process.version,
      files: ordered,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Release ${releaseId}: ${Object.keys(files).length} files. Publish only ${path.join(target, "site")}.`,
);
