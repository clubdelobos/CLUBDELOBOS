// Automated slice of the Khoopper security block (S01, S02, S03, S15, S18, S20 + server-action auth).
// Usage: npm run security   → exits 1 on any FAIL. Prints locations only, never secret values.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const run = (cmd, args) => {
  try { return execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28, shell: cmd === "npm" && process.platform === "win32" }); }
  catch (e) { return e.stdout ?? ""; }
};
const files = run("git", ["ls-files", "src", "scripts", "supabase", "next.config.ts", "vercel.json"]).split("\n").filter(Boolean);
const code = files.filter((f) => /\.(tsx?|mjs|js)$/.test(f));
let failed = false;
const report = (id, ok, msg) => { if (!ok) failed = true; console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${msg}`); };

// S20 — dependencies: no critical advisory allowed; high ones are listed for triage.
const audit = JSON.parse(run("npm", ["audit", "--json"]) || "{}").metadata?.vulnerabilities ?? {};
report("S20", !audit.critical, `npm audit → critical ${audit.critical ?? "?"}, high ${audit.high ?? "?"}, moderate ${audit.moderate ?? "?"}`);

// S02 — secrets in tracked files and in all history (pattern hits, values never printed).
const SECRET = "(eyJ[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{10,}|sk_live_[A-Za-z0-9]{10,}|sk-ant-[A-Za-z0-9_-]{20,}|re_[A-Za-z0-9]{24,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)";
const tracked = run("git", ["grep", "-lE", SECRET, "--", ":!package-lock.json", ":!*.example"]).split("\n").filter(Boolean);
const history = run("git", ["log", "--all", "--oneline", "-G", SECRET, "--", ".", ":!package-lock.json", ":!*.example"]).split("\n").filter(Boolean);
report("S02", !tracked.length && !history.length, `secret patterns: ${tracked.length} tracked file(s)${tracked.length ? " " + tracked.join(", ") : ""}, ${history.length} commit(s) in history`);
report("S02", run("git", ["ls-files", ".env", ".env.local"]).trim() === "", ".env / .env.local not tracked");

// S01/S03 — private env or service-role client reachable from a "use client" module.
const leaks = code.filter((f) => {
  const s = readFileSync(f, "utf8");
  return /^["']use client["']/m.test(s) && /(createServiceRoleClient|SERVICE_ROLE|process\.env\.(?!NEXT_PUBLIC_|NODE_ENV))/.test(s);
});
report("S01/S03", !leaks.length, `client modules touching private env/service role: ${leaks.length}${leaks.length ? " " + leaks.join(", ") : ""}`);
const publicEnv = [...new Set(code.flatMap((f) => [...readFileSync(f, "utf8").matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)].map((m) => m[0])))];
report("S01", !publicEnv.some((n) => /SECRET|SERVICE|PRIVATE|PASSWORD/.test(n)), `NEXT_PUBLIC vars: ${publicEnv.join(", ") || "none"}`);

// Server actions must authenticate: every "use server" file needs a guard call.
const actions = code.filter((f) => /^["']use server["']/m.test(readFileSync(f, "utf8")));
const unguarded = actions.filter((f) => !/(requireRole|requireUser|getUser\(|verifySession|requireAdmin|rate_limit_hit)/.test(readFileSync(f, "utf8")));
report("S06", !unguarded.length, `${actions.length} server-action files, without auth/rate-limit guard: ${unguarded.length}${unguarded.length ? " " + unguarded.join(", ") : " (public ones must be reviewed by hand)"}`);

// S15 — raw HTML sinks (JSON-LD <script> is the only expected use).
const sinks = code.flatMap((f) => readFileSync(f, "utf8").split("\n").map((l, i) => [f, i + 1, l]).filter(([, , l]) => /dangerouslySetInnerHTML|\.innerHTML\s*=|insertAdjacentHTML/.test(l)).map(([f, n]) => `${f}:${n}`));
report("S15", true, `raw HTML sinks to review by hand: ${sinks.length}${sinks.length ? " → " + sinks.join(", ") : ""}`);

// S18 — security headers declared.
const cfg = readFileSync("next.config.ts", "utf8");
const missing = ["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security", "Content-Security-Policy"].filter((h) => !cfg.includes(h));
report("S18", !missing.length, `headers declared in next.config.ts; missing: ${missing.join(", ") || "none"}`);

process.exit(failed ? 1 : 0);
