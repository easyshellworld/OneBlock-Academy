import { NextRequest, NextResponse } from "next/server";

const nonces = new Map<string, { expiresAt: number; issuedAt: number }>();

export async function GET() {
  const nonce = crypto.randomUUID();
  const now = Date.now();
  const issuedAt = now;
  const expiresAt = now + 5 * 60 * 1000;

  nonces.set(nonce, { expiresAt, issuedAt });

  return NextResponse.json({ nonce, expiresAt });
}

export function consumeNonce(nonce: string): { expiresAt: number; issuedAt: number } | null {
  const stored = nonces.get(nonce);
  if (!stored) return null;
  nonces.delete(nonce);
  return stored;
}

export { consumeNonce as getStoredNonce };
