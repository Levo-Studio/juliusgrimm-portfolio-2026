import { describe, expect, it } from "vitest";
import { isPublicAddress } from "@/lib/ip-address";

const refused: Array<[address: string, why: string]> = [
  ["0.0.0.0", "unspecified"],
  ["0.1.2.3", "this network"],
  ["10.0.0.1", "private"],
  ["10.255.255.255", "private"],
  ["100.64.0.1", "CGNAT"],
  ["100.127.255.254", "CGNAT"],
  ["127.0.0.1", "loopback"],
  ["127.53.0.1", "loopback"],
  ["169.254.169.254", "link-local / cloud metadata"],
  ["172.16.0.1", "private"],
  ["172.31.255.255", "private"],
  ["192.0.0.8", "IETF protocol assignments"],
  ["192.0.2.10", "TEST-NET-1"],
  ["192.88.99.1", "6to4 relay anycast"],
  ["192.168.1.1", "private"],
  ["198.18.0.1", "benchmarking"],
  ["198.19.255.255", "benchmarking"],
  ["198.51.100.7", "TEST-NET-2"],
  ["203.0.113.9", "TEST-NET-3"],
  ["224.0.0.1", "multicast"],
  ["239.255.255.250", "multicast"],
  ["240.0.0.1", "reserved"],
  ["255.255.255.255", "broadcast"],
  ["::", "unspecified"],
  ["::1", "loopback"],
  ["0:0:0:0:0:0:0:1", "loopback, uncompressed"],
  ["::ffff:127.0.0.1", "IPv4-mapped loopback"],
  ["::ffff:7f00:1", "IPv4-mapped loopback, hex"],
  ["::ffff:169.254.169.254", "IPv4-mapped metadata"],
  ["::ffff:10.0.0.1", "IPv4-mapped private"],
  ["::127.0.0.1", "IPv4-compatible (deprecated)"],
  ["::8.8.8.8", "IPv4-compatible (deprecated)"],
  ["64:ff9b::7f00:1", "NAT64 of loopback"],
  ["64:ff9b::a9fe:a9fe", "NAT64 of metadata"],
  ["64:ff9b::192.168.0.1", "NAT64 of private"],
  ["64:ff9b:1::1", "local-use NAT64"],
  ["2002:7f00:1::1", "6to4 of loopback"],
  ["2002:c0a8:101::1", "6to4 of private"],
  ["100::1", "discard-only"],
  ["2001::1", "Teredo"],
  ["2001:db8::1", "documentation"],
  ["3fff::1", "documentation"],
  ["fc00::1", "unique-local"],
  ["fd12:3456:789a::1", "unique-local"],
  ["fe80::1", "link-local"],
  ["fe80::1%eth0", "link-local with zone"],
  ["febf::1", "link-local"],
  ["fec0::1", "site-local (deprecated)"],
  ["ff02::1", "multicast"],
  ["4000::1", "outside global unicast"],
  ["not-an-ip", "not an address"],
  ["example.com", "a name, not an address"],
  ["256.1.1.1", "invalid IPv4"],
  ["", "empty"]
];

const allowed = [
  "1.1.1.1",
  "8.8.8.8",
  "93.184.215.14",
  "100.63.255.255",
  "100.128.0.1",
  "172.15.255.255",
  "172.32.0.1",
  "192.0.1.1",
  "192.169.0.1",
  "198.17.255.255",
  "198.20.0.1",
  "223.255.255.254",
  "2606:4700:4700::1111",
  "2a00:1450:4001:80b::200e",
  "::ffff:8.8.8.8",
  "64:ff9b::808:808",
  "2002:808:808::1",
  "2001:200::1",
  "3fff:1000::1"
];

describe("isPublicAddress", () => {
  it.each(refused)("refuses %s (%s)", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(allowed)("allows %s", (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });
});
