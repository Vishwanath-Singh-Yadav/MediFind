import crypto from "crypto";

const attempts = new Map();
export function rateLimit({ windowMs = 60_000, max = 100 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}`; const now = Date.now(); const entry = attempts.get(key) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
    entry.count += 1; attempts.set(key, entry); res.set("RateLimit-Remaining", Math.max(0, max - entry.count));
    if (entry.count > max) return res.status(429).json({ message: "Too many requests. Please try again shortly." }); next();
  };
}
export function requestContext(req, res, next) { req.requestId = req.get("x-request-id") || crypto.randomUUID(); res.set("x-request-id", req.requestId); next(); }
