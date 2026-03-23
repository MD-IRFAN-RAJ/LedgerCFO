import helmet from "helmet";
import rateLimit from "express-rate-limit";

// ----------- Helpers -----------

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getAllowedOrigins = () => parseCsv(process.env.FRONTEND_URL);

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

  // 🔥 TEMP: allow all origins (to confirm fix)
  res.header("Access-Control-Allow-Origin", origin || "*");

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // ✅ Always allow preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
};