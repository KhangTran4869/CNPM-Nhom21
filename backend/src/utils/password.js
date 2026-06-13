import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (password, storedHash) => {
  if (!storedHash || !storedHash.startsWith("scrypt$")) return false;
  const [, salt, key] = storedHash.split("$");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  const expected = Buffer.from(key, "hex");
  return (
    expected.length === derivedKey.length &&
    crypto.timingSafeEqual(expected, derivedKey)
  );
};
