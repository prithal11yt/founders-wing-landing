import crypto from "crypto"
import { promisify } from "util"

const scrypt = promisify(crypto.scrypt)

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("base64url")
  const hash = await scrypt(password, salt, 64) as Buffer
  return `${salt}.${hash.toString("base64url")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash, extra] = stored.split(".")
  if (!salt || !hash || extra) return false
  const candidate = await scrypt(password, salt, 64) as Buffer
  const expected = Buffer.from(hash, "base64url")
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)
}

export async function createInvitation() {
  const token = crypto.randomBytes(32).toString("base64url")
  const expiresAt = Date.now() + 60 * 60 * 1000
  return { token, expiresAt, stored: `invite:${expiresAt}:${await hashPassword(token)}` }
}

export async function verifyInvitation(token: unknown, stored: string): Promise<boolean> {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false
  const [kind, expiry, hash, extra] = stored.split(":")
  if (kind !== "invite" || extra || !Number.isFinite(Number(expiry)) || Number(expiry) <= Date.now()) return false
  return verifyPassword(token, hash)
}

export function credentialVersion(stored: string): string {
  const secret = process.env.LEADS_AUTH_SECRET
  if (!secret) throw new Error("LEADS_AUTH_SECRET not configured")
  return crypto.createHmac("sha256", secret).update(`member-credential:${stored}`).digest("base64url")
}
