#!/usr/bin/env node
/**
 * Static auth/security verification for M3.
 * Usage: node scripts/auth-verify.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const checks = [];

function pass(message) {
  checks.push({ ok: true, message });
  console.log(`✓ ${message}`);
}

function fail(message) {
  checks.push({ ok: false, message });
  console.error(`✗ ${message}`);
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

console.log("Sugidanon M3 — auth/security verification\n");

const serviceSource = read("lib/supabase/service.ts");
if (serviceSource.includes('import "server-only"')) {
  pass("Service client is marked server-only");
} else {
  fail("Service client missing server-only import");
}

if (!read("middleware.ts").includes("updateSession")) {
  fail("middleware.ts missing updateSession");
} else {
  pass("middleware.ts invokes session updater");
}

const middlewareSource = read("lib/supabase/middleware.ts");
if (middlewareSource.includes("isAdminRoute") && middlewareSource.includes("isLearnerRoute")) {
  pass("Middleware defines admin and learner route guards");
} else {
  fail("Middleware route guards incomplete");
}

for (const file of [
  "lib/auth/session.ts",
  "lib/auth/actions.ts",
  "components/auth/login-form.tsx",
  "app/login/page.tsx",
  "app/admin/login/page.tsx",
  "app/unauthorized/page.tsx",
]) {
  try {
    read(file);
    pass(`Auth file present: ${file}`);
  } catch {
    fail(`Missing auth file: ${file}`);
  }
}

const clientFiles = [
  "components/auth/login-form.tsx",
  "components/learner/learner-shell.tsx",
  "components/admin/admin-shell.tsx",
];

for (const file of clientFiles) {
  const source = read(file);
  if (source.includes("lib/supabase/service")) {
    fail(`${file} imports service-role module`);
  }
}

pass("Client components do not import service-role module");

const failed = checks.filter((check) => !check.ok);
console.log(`\n--- Summary: ${checks.length - failed.length}/${checks.length} passed ---`);

if (failed.length > 0) {
  process.exit(1);
}
