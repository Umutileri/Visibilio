
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const privateIPv4Ranges: Array<[number, number]> = [
  [ip4("10.0.0.0"), ip4("10.255.255.255")],
  [ip4("100.64.0.0"), ip4("100.127.255.255")],
  [ip4("127.0.0.0"), ip4("127.255.255.255")],
  [ip4("169.254.0.0"), ip4("169.254.255.255")],
  [ip4("172.16.0.0"), ip4("172.31.255.255")],
  [ip4("192.0.0.0"), ip4("192.0.0.255")],
  [ip4("192.168.0.0"), ip4("192.168.255.255")],
  [ip4("198.18.0.0"), ip4("198.19.255.255")],
  [ip4("224.0.0.0"), ip4("255.255.255.255")],
];

function ip4(value: string): number {
  return value.split(".").reduce((acc, part) => acc * 256 + Number(part), 0);
}

function isBlockedIpv4(value: string): boolean {
  if (isIP(value) !== 4) return false;
  const numeric = ip4(value);
  return privateIPv4Ranges.some(([start, end]) => numeric >= start && numeric <= end);
}

function isBlockedIp(value: string): boolean {
  if (value === "::1" || value === "::" || isBlockedIpv4(value)) return true;
  if (isIP(value) === 6) {
    const normalized = value.toLowerCase();
    return normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
  }
  return false;
}

export async function assertSafeTarget(url: URL): Promise<void> {
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Local targets are not allowed.");
  }

  if (isBlockedIp(hostname)) {
    throw new Error("Private, local, or reserved IP targets are not allowed.");
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isBlockedIp(record.address))) {
    throw new Error("Target resolves to a private, local, or reserved network address.");
  }
}
