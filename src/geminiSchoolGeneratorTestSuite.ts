import {
  UNVERIFIED_CONTACT_LABEL,
  hasVerifiedRecruitingEmail,
  normalizeCollegeDivision,
  validateSchoolEntry,
} from "./lib/geminiSchoolGeneratorEngine";
import type { SchoolEntry } from "./data/schoolsData";

export function runGeminiSchoolGeneratorTestSuite() {
  console.log("==================================================");
  console.log("🤖 RUNNING GEMINI AI SCHOOL GENERATOR & DATABASE SUITE");
  console.log("==================================================");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, errorMessage?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName} -> ${errorMessage || "Assertion failed"}`);
      failedTests++;
    }
  }

  // Test 1: Valid DII School Entry Validation
  const validD2: Partial<SchoolEntry> = {
    name: "Valdosta State Blazers",
    mascot: "Blazers",
    division: "DII",
    conference: "Gulf South Conference",
    cityState: "Valdosta, GA",
    primaryColor: "#BA0C2F",
    secondaryColor: "#000000",
    topMajors: ["Business", "Sports Management", "Nursing"],
    programHighlights: "3x NCAA Division II National Champions.",
  };

  const res1 = validateSchoolEntry(validD2);
  assert(res1.isValid === true && Boolean(res1.school), "Valid Division II school entry validated");
  assert(res1.school?.divisionLabel === "Division 2 (DII)", "Division label correctly mapped to 'Division 2 (DII)'");
  assert(res1.school?.primaryColor === "#BA0C2F", "Primary hex color preserved");

  // Test 2: Missing School Name Rejection
  const res2 = validateSchoolEntry({ ...validD2, name: "" });
  assert(res2.isValid === false && res2.error === "School name is required.", "Missing school name rejected");

  // Test 3: Missing Mascot Rejection
  const res3 = validateSchoolEntry({ ...validD2, mascot: "" });
  assert(res3.isValid === false && res3.error === "Mascot is required.", "Missing mascot rejected");

  // Test 4: Invalid Division Rejection
  const res4 = validateSchoolEntry({ ...validD2, division: "INVALID" });
  assert(res4.isValid === false, "Invalid division label rejected");

  // Test 5: Fallback Colors and Default Attributes
  const minimalSchool: Partial<SchoolEntry> = {
    name: "Ferris State Bulldogs",
    mascot: "Bulldogs",
    division: "DII",
    conference: "GLIAC",
    cityState: "Big Rapids, MI",
  };
  const res5 = validateSchoolEntry(minimalSchool);
  assert(res5.isValid === true, "Minimal school entry validated with fallbacks");
  assert(res5.school?.primaryColor === "#0f172a", "Default fallback primary color (#0f172a) assigned");
  assert(
    res5.school?.recruitingEmail === UNVERIFIED_CONTACT_LABEL,
    "Missing contacts stay unverified — no invented @.edu address",
  );
  assert(
    res5.school?.recruitingPhone === UNVERIFIED_CONTACT_LABEL,
    "Missing phones stay unverified — no 555 placeholder",
  );

  // Test 6: Gemini schema drift D2/D3 must map onto CollegeDivision DII/DIII
  assert(normalizeCollegeDivision("D2") === "DII", "Gemini D2 alias maps to DII");
  assert(normalizeCollegeDivision("D3") === "DIII", "Gemini D3 alias maps to DIII");
  const geminiD2Payload = {
    name: "Valdosta State Blazers",
    mascot: "Blazers",
    division: "D2",
    conference: "Gulf South Conference",
    cityState: "Valdosta, GA",
    recruitingEmail: "recruiting@valdosta-state.edu",
    recruitingPhone: "(555) 019-2026",
  };
  const res6 = validateSchoolEntry(geminiD2Payload);
  assert(res6.isValid === true && res6.school?.division === "DII", "Gemini D2 payload accepted as DII");
  assert(
    res6.school?.recruitingEmail === UNVERIFIED_CONTACT_LABEL &&
      !hasVerifiedRecruitingEmail(res6.school?.recruitingEmail ?? ""),
    "LLM-supplied recruiting email discarded (Sidearm/CSV only)",
  );
  assert(
    !String(res6.school?.recruitingEmail).includes("@"),
    "AI-generated school must not expose a clickable invented mailbox",
  );

  console.log("==================================================");
  console.log(`📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runGeminiSchoolGeneratorTestSuite();
