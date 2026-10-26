import { isIPv4, isIPv6 } from "net";

/**
 * Classifies resolved addresses for the favicon resolver: only addresses on the public
 * internet may be fetched. Everything else — loopback, private, link-local, CGNAT,
 * unique-local, multicast, documentation, benchmarking, reserved, unspecified — is refused,
 * including IPv4 addresses wrapped in IPv6 (IPv4-mapped, IPv4-compatible, NAT64, 6to4).
 */

const parseIPv4 = (address: string): number[] | null => {
  if (!isIPv4(address)) return null;
  return address.split(".").map(Number);
};

/** Eight 16-bit groups, or null. Accepts "::" compression, a trailing dotted quad and a zone id. */
const parseIPv6 = (input: string): number[] | null => {
  const address = input.replace(/%.*$/, "");
  if (!isIPv6(address)) return null;

  let text = address;
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (dotted) {
    const [a, b, c, d] = parseIPv4(dotted[1]) ?? [];
    text = `${text.slice(0, -dotted[1].length)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }

  const [head, tail] = text.includes("::") ? text.split("::") : [text, undefined];
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const missing = tail === undefined ? 0 : 8 - left.length - right.length;
  const groups = [...left, ...Array<string>(missing).fill("0"), ...right].map((group) => parseInt(group, 16));
  return groups.length === 8 && groups.every((group) => Number.isInteger(group) && group >= 0 && group <= 0xffff) ? groups : null;
};

const isPublicIPv4 = ([a, b, c]: number[]): boolean => {
  if (a === 0) return false; // "this network", unspecified
  if (a === 10) return false; // private
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
  if (a === 127) return false; // loopback
  if (a === 169 && b === 254) return false; // link-local (incl. cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return false; // private
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false; // IETF assignments, TEST-NET-1
  if (a === 192 && b === 88 && c === 99) return false; // 6to4 relay anycast
  if (a === 192 && b === 168) return false; // private
  if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
  if (a === 198 && b === 51 && c === 100) return false; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return false; // TEST-NET-3
  if (a >= 224) return false; // multicast, reserved, broadcast
  return true;
};

const embeddedIPv4 = (high: number, low: number): number[] => [high >> 8, high & 0xff, low >> 8, low & 0xff];

const isPublicIPv6 = (groups: number[]): boolean => {
  const [g0, g1, g2, g3, g4, g5, g6, g7] = groups;
  const zeroUpTo = (count: number): boolean => groups.slice(0, count).every((group) => group === 0);

  // ::ffff:a.b.c.d (IPv4-mapped) carries a real IPv4 destination.
  if (zeroUpTo(5) && g5 === 0xffff) return isPublicIPv4(embeddedIPv4(g6, g7));
  // ::, ::1 and the deprecated IPv4-compatible ::a.b.c.d.
  if (zeroUpTo(6)) return false;
  // 64:ff9b::/96 well-known NAT64 prefix: the gateway connects to the embedded IPv4.
  if (g0 === 0x64 && g1 === 0xff9b && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0) return isPublicIPv4(embeddedIPv4(g6, g7));
  // 2002::/16 6to4 embeds an IPv4 address in the next 32 bits.
  if (g0 === 0x2002) return isPublicIPv4(embeddedIPv4(g1, g2));

  // Only global unicast (2000::/3) is public; this also refuses unique-local fc00::/7,
  // link-local fe80::/10, site-local fec0::/10, multicast ff00::/8, discard 100::/64 and
  // the local-use NAT64 prefix 64:ff9b:1::/48.
  if ((g0 & 0xe000) !== 0x2000) return false;
  if (g0 === 0x2001 && g1 < 0x200) return false; // 2001::/23 IETF assignments (Teredo, ...)
  if (g0 === 0x2001 && g1 === 0xdb8) return false; // documentation
  if (g0 === 0x3fff && (g1 & 0xf000) === 0) return false; // 3fff::/20 documentation
  return true;
};

/** True only for a syntactically valid IPv4/IPv6 address that is routable on the public internet. */
export const isPublicAddress = (address: string): boolean => {
  const v4 = parseIPv4(address);
  if (v4) return isPublicIPv4(v4);
  const v6 = parseIPv6(address);
  if (v6) return isPublicIPv6(v6);
  return false;
};
