import crypto from "node:crypto";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function sha256Hex(str) {
  return crypto
    .createHash("sha256")
    .update(String(str || "").trim().toUpperCase(), "utf8")
    .digest("hex");
}

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seedStr) {
  let a = hashSeed(String(seedStr));
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed(items, seedStr) {
  const arr = [...items];
  const rand = mulberry32(seedStr);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateAccessCode(prefix = "X616", length = 4) {
  const bytes = crypto.randomBytes(length);
  let suffix = "";
  for (let i = 0; i < length; i++) {
    suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `${prefix.toUpperCase()}-${suffix}`;
}

export function generateUniqueCodes(count, prefix = "X616") {
  const set = new Set();
  while (set.size < count) {
    set.add(generateAccessCode(prefix, 4));
  }
  return [...set];
}
