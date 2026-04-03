/**
 * Creates `claims` and `outcomes` tables in Supabase Postgres.
 * Requires DATABASE_URL (Postgres URI with DB password) — not anon/service JWT.
 *
 * Usage: npm run db:apply
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

const schemaPath = path.join(root, "supabase", "schema.sql");

const url = process.env.DATABASE_URL;
if (!url || !url.startsWith("postgres")) {
  console.error(
    [
      "Missing DATABASE_URL in environment.",
      "1. Open Supabase → Project Settings → Database.",
      "2. Under Connection string, choose URI and copy (paste your database password).",
      "3. Add to .env.local:",
      '   DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@....pooler.supabase.com:6543/postgres"',
      "4. Run: npm run db:apply",
      "",
      "Easiest: paste supabase/schema.sql into SQL Editor → Run (no DATABASE_URL).",
    ].join("\n")
  );
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("OK — tables public.claims and public.outcomes are ready.");
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";

  if (
    code === "28P01" ||
    /password authentication failed|authentication failed|Database authentication failed/i.test(msg)
  ) {
    console.error(
      [
        "Postgres rejected the password in DATABASE_URL.",
        "",
        "Fix:",
        "  • Supabase → Project Settings → Database → Reset database password",
        "  • Copy the NEW connection string (URI) from the same page — it embeds the new password.",
        "  • Update DATABASE_URL in .env.local and run npm run db:apply again.",
        "",
        "If your password has @ # / % + or spaces, it must be URL-encoded inside the URI",
        "(or use the exact string Supabase shows after 'Copy', which is already encoded).",
        "",
        "Or skip DATABASE_URL: open SQL Editor, paste supabase/schema.sql, Run.",
      ].join("\n")
    );
  } else {
    console.error(msg);
  }
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
