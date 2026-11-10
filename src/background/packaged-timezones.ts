// MiLocation fork: timezone boundary data is loaded exclusively from the app bundle.
import { init } from "browser-geo-tz";
import geoTzData from "@/shared/geo-tz-data.json";

/** Lazy, shared reads: extension URLs need not implement HTTP Range requests. */
export function createPackagedTimezoneLookup() {
  const root = `geo-tz/${geoTzData.version}/`;
  let geometry: Promise<ArrayBuffer> | undefined;
  let index: Promise<unknown> | undefined;

  async function read(path: string): Promise<Response> {
    const response = await fetch(browser.runtime.getURL(root + path));
    if (!response.ok) throw new Error(`Packaged timezone data unavailable: ${path}`);
    return response;
  }

  return init(
    async (start, end) => {
      geometry ??= read("timezones.geojson.geo.dat")
        .then((response) => response.arrayBuffer())
        .catch((error: unknown) => {
          geometry = undefined;
          throw error;
        });
      const bytes = await geometry;
      if (start < 0 || end < start || end >= bytes.byteLength) {
        throw new Error("Packaged timezone geometry/index mismatch");
      }
      return bytes.slice(start, end + 1);
    },
    () => {
      index ??= read("timezones.geojson.index.json")
        .then((response) => response.json() as Promise<unknown>)
        .catch((error: unknown) => {
          index = undefined;
          throw error;
        });
      return index;
    }
  );
}
