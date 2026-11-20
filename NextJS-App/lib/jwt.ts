import crypto from "crypto";

interface JwtHeader {
  alg: string;
  typ: string;
}

interface JwtPayload {
  [key: string]: unknown;
  exp?: number;
  iat?: number;
}

/**
 * Sign a JWT using HMAC SHA-256 (HS256) with native Node.js crypto.
 * Zero external dependencies.
 */
export function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds: number = 7 * 24 * 60 * 60
): string {
  const header: JwtHeader = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest("base64url");

  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Verify and decode an HS256 JWT using native Node.js crypto.
 * Returns decoded payload if valid and unexpired; returns null otherwise.
 */
export function verifyJwt<T extends Record<string, unknown> = Record<string, unknown>>(
  token: string,
  secret: string
): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [b64Header, b64Payload, signature] = parts;

    // Verify signature
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${b64Header}.${b64Payload}`)
      .digest("base64url");

    if (signature !== expectedSig) {
      return null;
    }

    // Decode and verify expiration
    const payloadJson = Buffer.from(b64Payload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson) as JwtPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}
