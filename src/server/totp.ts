import { authenticator } from "otplib";

// otplib's default base32 plugin (`thirty-two`) uses the deprecated `new Buffer()`.
// Under Next's server bundle, Node's deprecation-warning path (`isInsideNodeModules`)
// throws "Cannot read properties of undefined (reading '0')", which 500s the 2FA flow.
// We swap in an RFC 4648 base32 codec built on modern Buffer APIs to avoid that path.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const base32Encode = (buffer: Buffer): string => {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
};

const base32Decode = (input: string): Buffer => {
  const clean = input.replace(/=+$/, "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

authenticator.options = {
  keyEncoder: (secret: string, encoding: BufferEncoding): string => base32Encode(Buffer.from(secret, encoding)),
  keyDecoder: (encodedSecret: string, encoding: BufferEncoding): string => base32Decode(encodedSecret).toString(encoding)
};

export { authenticator };
