import { SignJWT, jwtVerify } from "jose";

const COOKIE = "cg_admin";

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function secretKey() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("Missing ADMIN_JWT_SECRET");
  return new TextEncoder().encode(s);
}

export async function signAdminToken(email: string): Promise<string> {
  return new SignJWT({ role: "admin", email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secretKey());
}

export async function verifyAdminToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!email || !getAdminEmails().includes(email.toLowerCase())) {
      return null;
    }
    return { email };
  } catch {
    return null;
  }
}

export { COOKIE as ADMIN_COOKIE_NAME };
