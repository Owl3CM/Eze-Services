#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tracked = execFileSync("git", ["ls-files", "-z", "--", "lib"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

const trackedSet = new Set(tracked);
const canonicalByLowerCase = new Map();
const failures = [];

for (const file of tracked) {
  const lower = file.toLowerCase();
  const existing = canonicalByLowerCase.get(lower);
  if (existing && existing !== file) {
    failures.push(`Git case collision: ${existing} <> ${file}`);
  } else {
    canonicalByLowerCase.set(lower, file);
  }
}

const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"];
const sourceFiles = tracked.filter((file) => /\.[cm]?[jt]sx?$/.test(file));
const importPattern = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["'](\.{1,2}\/[^"'?#]+)["']/g;

for (const file of sourceFiles) {
  const source = readFileSync(path.join(root, file), "utf8");
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
    const candidates = [
      ...extensions.map((extension) => `${base}${extension}`),
      ...extensions.slice(1).map((extension) => `${base}/index${extension}`),
    ];

    if (candidates.some((candidate) => trackedSet.has(candidate))) continue;

    const canonical = candidates.map((candidate) => canonicalByLowerCase.get(candidate.toLowerCase())).find(Boolean);
    if (!canonical) continue;

    const line = source.slice(0, match.index).split("\n").length;
    failures.push(`${file}:${line}: ${specifier} uses the wrong case; Git stores ${canonical}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Import casing check passed (${sourceFiles.length} tracked source files).`);
