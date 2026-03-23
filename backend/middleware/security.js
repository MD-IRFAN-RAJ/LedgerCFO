import helmet from "helmet";
import rateLimit from "express-rate-limit";

// ----------- Helpers -----------

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getAllowedOrigins = () => {
  const fromFrontendUrl = parseCsv(process.env.FRONTEND_URL);
  const fromCorsAllowlist = parseCsv(process.env.CORS_ALLOWED_ORIGINS);
  return [...new Set([...fromFrontendUrl, ...fromCorsAllowlist])];
};

const getAllowedOriginRegexes = () =>
  parseCsv(process.env.FRONTEND_URL_REGEX)
    .map((pattern) => {
      try {
        return new RegExp(pattern);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

const isOriginAllowed = (origin) => {
  const allowedOrigins = getAllowedOrigins();
  const allowedOriginRegexes = getAllowedOriginRegexes();

  if (!origin) return true; // allow tools like Postman

  // If no allowlist is configured in production, do not block the app.
  if (allowedOrigins.length === 0 && allowedOriginRegexes.length === 0) {
    return true;
  }

  if (allowedOrigins.includes(origin)) return true;

  return allowedOriginRegexes.some((regex) => regex.test(origin));
};

// ----------- Security Headers -----------

export const securityHeaders = helmet({
  crossOriginResourcePolicy: false,
});

// ----------- Rate Limiter -----------

export const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// ----------- CORS Middleware (FIXED) -----------

export const corsGuard = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Always allow preflight checks
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ message: "CORS origin is not allowed" });
  }

  return next();
};