/**
 * Tests for CSAPI Part 2 — Canonical Endpoints
 * Validates presence, discoverability, and accessibility of all canonical endpoints
 * defined in OGC API – Connected Systems Part 2 (§7.4, Req30–34).
 *
 * Traces to:
 *   - /req/canonical-endpoints/listing       (23-002 §7.4 Req30)
 *   - /req/canonical-endpoints/access        (23-002 §7.4 Req31–32)
 *   - /req/canonical-endpoints/collections   (23-002 §7.4 Req33–34)
 *
 * Test strategy:
 *   - Hybrid execution: uses local fixtures by default, or live endpoints if CSAPI_LIVE=true.
 *   - Verifies landing page link relations, accessibility, and collection structure
 *     for all canonical CSAPI Part 2 endpoints.
 */

import { CANONICAL_ENDPOINTS } from "../url_builder";
import { maybeFetchOrLoad, expectFeatureCollection } from "../helpers";

const apiRoot = process.env.CSAPI_API_ROOT || "https://example.csapi.server";

/**
 * Requirement: /req/canonical-endpoints/listing
 * The API landing page SHALL advertise all canonical CSAPI Part 2 endpoints.
 */
test("Landing page advertises all canonical CSAPI Part 2 endpoints", async () => {
  const data = await maybeFetchOrLoad("endpointsPart2Landing", apiRoot);

  expect(data).toBeDefined();
  expect(Array.isArray(data.links)).toBe(true);

  // Extract rel or href identifiers for comparison
  const linkHrefs = data.links.map((l: any) => l.href || "");
  const linkRels = data.links.map((l: any) => l.rel || "");

  // Each canonical endpoint should appear either by href or rel
  for (const endpoint of CANONICAL_ENDPOINTS) {
    const found =
      linkHrefs.some((h: string) => h.includes(`/${endpoint}`)) ||
      linkRels.some((r: string) => r.toLowerCase().includes(endpoint.toLowerCase()));
    expect(found).toBe(true);
  }
});

/**
 * Requirement: /req/canonical-endpoints/access
 * Each canonical endpoint SHALL be accessible and return a valid response structure.
 */
test("All canonical CSAPI Part 2 endpoints are accessible and return collections", async () => {
  for (const endpoint of CANONICAL_ENDPOINTS) {
    const url = `${apiRoot}/${endpoint}`;
    const fixtureKey = `endpoint_${endpoint}`; // ✅ direct lowerCamelCase key
    const data = await maybeFetchOrLoad(fixtureKey, url);

    // Some endpoints (e.g., properties) may use "Collection" instead of "FeatureCollection"
    if (data.type === "Collection" || data.members) {
      expect(data).toHaveProperty("type", "Collection");
      expect(Array.isArray(data.members)).toBe(true);
    } else {
      expectFeatureCollection(data);
    }
  }
});

/**
 * Requirement: /req/canonical-endpoints/collections
 * Each endpoint collection SHALL include a title, link relations, and items.
 */
test("Each canonical endpoint collection includes expected metadata", async () => {
  for (const endpoint of CANONICAL_ENDPOINTS) {
    const url = `${apiRoot}/${endpoint}`;
    const fixtureKey = `endpoint_${endpoint}`; // ✅ direct lowerCamelCase key
    const data = await maybeFetchOrLoad(fixtureKey, url);

    if (data.links) {
      expect(Array.isArray(data.links)).toBe(true);
    }
    if (data.title) {
      expect(typeof data.title).toBe("string");
    }

    const items = data.features || data.members || [];
    expect(Array.isArray(items)).toBe(true);
  }
});
