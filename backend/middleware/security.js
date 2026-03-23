import helmet from "helmet";
import rateLimit from "express-rate-limit";

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const allowedOrigins = parseCsv(process.env.FRONTEND_URL);

const allowedOriginRegexes = parseCsv(process.env.FRONTEND_URL_REGEX)
  .map((pattern) => {
    try {
      return new RegExp(pattern);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return allowedOriginRegexes.some((regex) => regex.test(origin));
};

export const securityHeaders = helmet({
  crossOriginResourcePolicy: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

export const corsGuard = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    if (!isOriginAllowed(origin)) {
      return res.status(403).json({ message: "CORS origin is not allowed" });
    }
    return res.sendStatus(204);
  }

  if (!isOriginAllowed(origin)) {
    return res.status(403).json({ message: "CORS origin is not allowed" });
  }

  return next();
};