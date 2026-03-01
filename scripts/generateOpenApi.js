#!/usr/bin/env node
// AI-slop

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/*
Usage:

node scripts/generate-openapi.js <input-schema> <output-file>

Example:
node scripts/generate-openapi.js \
  src/config/schemas/gbifSchema.json \
  src/config/schemas/gbif.d.ts
*/

const [inputSchema, outputFile] = process.argv.slice(2);

if (!inputSchema || !outputFile) {
  console.error("❌ Usage: generate-openapi <input-schema> <output-file>");
  process.exit(1);
}

try {
  console.log("🔧 Generating OpenAPI types...");
  execSync(`npx openapi-typescript ${inputSchema} -o ${outputFile}`, {
    stdio: "inherit",
  });

  const resolvedPath = path.resolve(process.cwd(), outputFile);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Generated file not found: ${resolvedPath}`);
  }

  const content = fs.readFileSync(resolvedPath, "utf8");

  if (!content.startsWith("// @ts-nocheck")) {
    fs.writeFileSync(resolvedPath, "// @ts-nocheck\n\n" + content, "utf8");
    console.log("✅ Added // @ts-nocheck");
  } else {
    console.log("ℹ️  // @ts-nocheck already present");
  }

  console.log("🎉 Done.");
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
