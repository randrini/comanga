import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Simple in-memory rate limiter for brute-force protection
const rateLimitMap = new Map<
  string,
  { count: number; firstAttempt: number; blockedUntil: number }
>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (entry) {
    // If blocked, check if block expired
    if (entry.blockedUntil > now) {
      return false; // still blocked
    }
    // If block expired, reset
    if (entry.blockedUntil > 0 && entry.blockedUntil <= now) {
      rateLimitMap.delete(key);
      return true;
    }
    // If outside the window, reset
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
      return true;
    }
    // Increment and check threshold
    entry.count += 1;
    if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
      return false;
    }
    return true;
  }

  // First attempt
  rateLimitMap.set(key, { count: 1, firstAttempt: now, blockedUntil: 0 });
  return true;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Rate limit check (global by IP-like key using username)
        const rateLimitKey = `login:${credentials.username}`;
        if (!checkRateLimit(rateLimitKey)) {
          return null;
        }

        // Env-var-based credentials check only
        if (
          credentials.username === process.env.ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          // On success, clear rate limit entry
          rateLimitMap.delete(rateLimitKey);
          return {
            id: "1",
            name: credentials.username,
            email: `${credentials.username}@comanga.local`,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};