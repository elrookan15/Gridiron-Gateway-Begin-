/**
 * Sidearm directory parser regression gate — Presto/Nuxt table rows + bio-link coach signal.
 */
import assert from "node:assert/strict";
import { parseSidearmDirectoryHtml } from "./sidearmDirectoryScraper";

let failures = 0;

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`[FAIL] ${name}`);
    console.error(err);
  }
}

const URL = "https://example.edu/sports/football/coaches";

check("Presto positional row: position-group title + /coaches/ bio link", () => {
  const html = `
    <div class="c-coaches-page">
      <table><tbody>
        <tr>
          <td><a href="/sports/football/roster/coaches/jane-doe/123">Jane Doe</a></td>
          <td>Quarterbacks</td>
          <td>205-555-0100</td>
          <td>jdoe@example.edu</td>
        </tr>
      </tbody></table>
    </div>`;
  const rows = parseSidearmDirectoryHtml(html, "cfbd-333", URL, "2026-09-22T00:00:00.000Z");
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.fullName, "Jane Doe");
  assert.equal(rows[0]?.title, "Quarterbacks");
  assert.equal(rows[0]?.email, "jdoe@example.edu");
  assert.equal(rows[0]?.officePhone, "205-555-0100");
});

check("Presto row without coach signal is excluded", () => {
  const html = `
    <div class="c-coaches-page">
      <table><tbody>
        <tr>
          <td>Support Staff</td>
          <td>Operations</td>
          <td></td>
          <td></td>
        </tr>
      </tbody></table>
    </div>`;
  const rows = parseSidearmDirectoryHtml(html, "cfbd-333", URL, "2026-09-22T00:00:00.000Z");
  assert.equal(rows.length, 0);
});

check("Legacy staff-directory-table still parses", () => {
  const html = `
    <table class="staff-directory-table"><tbody>
      <tr>
        <td class="name"><a href="#">Pat Coach</a></td>
        <td class="title">Head Football Coach</td>
        <td class="phone">555-1212</td>
        <td class="staff-directory-email"><a href="mailto:pat@example.edu">pat@example.edu</a></td>
      </tr>
    </tbody></table>`;
  const rows = parseSidearmDirectoryHtml(html, "cfbd-333", URL, "2026-09-22T00:00:00.000Z");
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.title, "Head Football Coach");
});

if (failures > 0) {
  console.error(`\nSidearm scraper suite: ${failures} failure(s).`);
  process.exit(1);
}
console.log("\nSidearm scraper suite: all checks passed.");
