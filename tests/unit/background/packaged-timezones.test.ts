// MiLocation: use the real resolver/data, with every network URL refused.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { beforeEach, expect, test, vi } from "vitest";
import { createPackagedTimezoneLookup } from "@/background/packaged-timezones";
import geoTzData from "@/shared/geo-tz-data.json";

const origin = "moz-extension://test/";
const prefix = `${origin}geo-tz/${geoTzData.version}/`;
const requests: string[] = [];

beforeEach(() => {
  requests.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      requests.push(input);
      if (!input.startsWith(prefix)) throw new Error(`Unexpected network access: ${input}`);
      const name = input.slice(prefix.length);
      const bytes = await readFile(resolve("node_modules/geo-tz/data", name));
      return new Response(bytes, { status: 200 });
    })
  );
});

test("resolves real cities and borders with exclusively packaged geometry", async () => {
  const lookup = createPackagedTimezoneLookup();
  for (const [lat, lon, zone] of [
    [41.0082, 28.9784, "Europe/Istanbul"],
    [52.52, 13.405, "Europe/Berlin"],
    [40.7128, -74.006, "America/New_York"],
    [27.7172, 85.324, "Asia/Kathmandu"],
    [1.3521, 103.8198, "Asia/Singapore"],
    [55.7558, 37.6173, "Europe/Moscow"],
  ] as const) {
    expect(await lookup.find(lat, lon)).toContain(zone);
  }
  expect(requests.every((url) => url.startsWith(prefix))).toBe(true);
  expect(requests.filter((url) => url.endsWith(".dat"))).toHaveLength(1);
  expect(requests.filter((url) => url.endsWith(".json"))).toHaveLength(1);
});

test("a failed local read can be retried without a remote fallback", async () => {
  const lookup = createPackagedTimezoneLookup();
  const fetchMock = vi.mocked(fetch);
  fetchMock.mockRejectedValueOnce(new Error("local read interrupted"));
  await expect(lookup.find(41.0082, 28.9784)).rejects.toThrow();
  expect(await lookup.find(41.0082, 28.9784)).toContain("Europe/Istanbul");
  expect(requests.every((url) => url.startsWith(prefix))).toBe(true);
});
