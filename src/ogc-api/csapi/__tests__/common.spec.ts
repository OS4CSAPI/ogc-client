/**
 * Tests for CSAPI Common API-Level Behavior
 * Validates the API landing page, conformance declaration, and core service links
 * required by OGC API – Features and OGC API – Connected Systems Parts 1 & 2.
 *
 * Traces to:
 *   - /req/landing-page/content           (OGC API – Features § 7.1)
 *   - /req/conformance/content            (OGC API – Features § 7.2)
 *   - /req/landing-page/csapi-extensions  (23-001 § 8, 23-002 § 7.4 Req 30)
 *
 * Test strategy:
 *   - Hybrid execution (fixtures by default, live endpoints when CSAPI_LIVE = true)
 *   - Verifies the existence of key service links and declared conformance classes
 */

import { maybeFetchOrLoad } from "../helpers";

const apiRoot: string = process.env.CSAPI_API_ROOT || "https://example.csapi.server";

/**
 * Requirement: /req/landing-page/content
 * The API landing page SHALL provide a title and link relations for all primary resources.
 */
test("Landing page contains expected metadata and canonical links", async () => {
  const data: Record<string, unknown> = await maybeFetchOrLoad("common_landing", apiRoot);

  expect(data).toBeDefined();
  expect((data as any).title).toBeDefined();
  expect(Array.isArray((data as any).links)).toBe(true);

  const links = (data as any).links as Array<{ rel: string }>;
  const rels = links.map((l) => l.rel);
  expect(rels).toContain("self");
  expect(rels).toContain("conformance");

  // Verify CSAPI-specific link relations are present
  const csapiRels = ["systems", "deployments", "datastreams"];
  const hasCsapiLinks = csapiRels.every((r) =>
    rels.some((x: string) => x.toLowerCase().includes(r))
  );
  expect(hasCsapiLinks).toBe(true);
});

/**
 * Requirement: /req/conformance/content
 * The /conformance endpoint SHALL list implemented conformance classes as URIs.
 */
test("Conformance declaration lists valid CSAPI conformance classes", async () => {
  const url = `${apiRoot}/conformance`;
  const data: Record<string, unknown> = await maybeFetchOrLoad("common_conformance", url);

  expect(data).toBeDefined();
  const conformsTo = (data as any).conformsTo as string[];
  expect(Array.isArray(conformsTo)).toBe(true);
  expect(conformsTo.length).toBeGreaterThan(0);

  // Check for at least one CSAPI and one Features conformance URI
  const joined = conformsTo.join(" ");
  expect(joined).toMatch(/connected-systems/i);
  expect(joined).toMatch(/ogcapi-features/i);
});

/**
 * Requirement: /req/landing-page/csapi-extensions
 * The landing page SHALL reference all canonical CSAPI extensions from Parts 1 & 2.
 */
test("Landing page advertises CSAPI extension endpoints", async () => {
  const data: Record<string, unknown> = await maybeFetchOrLoad("common_landing", apiRoot);
  const links = (data as any).links as Array<{ rel: string }>;
  const rels = links.map((l) => l.rel.toLowerCase());

  const expected = [
    "systems",
    "deployments",
    "procedures",
    "samplingfeatures",
    "datastreams",
    "observations",
    "commands",
    "feasibility",
  ];

  for (const rel of expected) {
    const found = rels.some((r: string) => r.includes(rel));
    expect(found).toBe(true);
  }
});
