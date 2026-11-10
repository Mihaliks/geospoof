// MiLocation: audit the actual shipping resources, not only the source configuration.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const root = resolve(process.argv[2] || "dist");
const json = (name) => JSON.parse(readFileSync(join(root, name), "utf8"));
const manifest = json("manifest.json");
assert.equal(manifest.background.persistent, false, "Build the Safari target first");
assert.equal(manifest.background.service_worker, undefined);
const dataVersion = JSON.parse(readFileSync("src/shared/geo-tz-data.json", "utf8")).version;
const data = `geo-tz/${dataVersion}/`;
assert.ok(statSync(join(root, data, "timezones.geojson.geo.dat")).size > 29_000_000);
assert.ok(json(data + "timezones.geojson.index.json").lookup);
const pointer = json("site-groups/v1/latest.json");
const catalog = readFileSync(join(root, pointer.path));
assert.equal(createHash("sha256").update(catalog).digest("hex"), pointer.sha256);
assert.equal(catalog.length, pointer.bytes);
assert.equal(JSON.parse(catalog).release, pointer.release);

function audit(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) audit(path);
    else if (/\.(js|html|css)$/.test(name)) {
      const source = readFileSync(path, "utf8");
      assert.ok(!/geospoof\.com/i.test(source), `Upstream host in executable resource: ${path}`);
    }
  }
}
audit(root);
console.log(
  "Standalone Safari resources verified: local timezone geometry, local catalog, no upstream hosts."
);
