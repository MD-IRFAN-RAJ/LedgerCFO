import helmet from "helmet";
import rateLimit from "express-rate-limit";

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
  // Always allow OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  const origin = req.headers.origin;

  res.header("Access-Control-Allow-Credentials", "true");

  if (origin && isOriginAllowed(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );
  }

  if (!isOriginAllowed(origin)) {
    return res.status(403).json({ message: "CORS origin is not allowed" });
  }

  return next();
};