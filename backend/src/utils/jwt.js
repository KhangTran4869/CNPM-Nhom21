import crypto from "crypto";

const base64Url = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlJson = (value) => base64Url(JSON.stringify(value));

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  return Buffer.from(padded, "base64").toString("utf8");
};

const secret = () => process.env.JWT_SECRET || "dev-secret-change-me";

const parseExpiresIn = (expiresIn = process.env.JWT_EXPIRES_IN || "1d") => {
  if (typeof expiresIn === "number") return expiresIn;
  const match = String(expiresIn).match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
};

export const signToken = (payload, options = {}) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: now,
    exp: now + parseExpiresIn(options.expiresIn),
  };
  const unsigned = `${base64UrlJson(header)}.${base64UrlJson(body)}`;
  const signature = crypto
    .createHmac("sha256", secret())
    .update(unsigned)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${unsigned}.${signature}`;
};

export const verifyToken = (token) => {
  const [header, payload, signature] = String(token).split(".");
  if (!header || !payload || !signature) throw new Error("Token không hợp lệ");

  const expected = crypto
    .createHmac("sha256", secret())
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    )
  ) {
    throw new Error("Token không hợp lệ");
  }

  const decoded = JSON.parse(decodeBase64Url(payload));
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token đã hết hạn");
  }
  return decoded;
};
