const test = require("node:test");
const assert = require("node:assert/strict");
const { validateReport } = require("./validateReport");

test("valid report returns ok", () => {
  const report = {
    date: "2026-01-05",
    store_id: "STORE_A",
    submitted_by_role: "Supervisor",
    coverage: {
      opening_staff_present: true,
      closing_staff_present: true,
      missing_roles: []
    },
    issues: {
      staffing_issue: false,
      utilities_issue: false,
      incident_reported: false,
      notes: "Normal operations."
    }
  };

  const res = validateReport(report);
  assert.equal(res.ok, true);
  assert.deepEqual(res.errors, []);
});

test("missing required fields returns errors", () => {
  const report = {};
  const res = validateReport(report);

  assert.equal(res.ok, false);
  assert.ok(res.errors.length > 0);
});

test("incident without notes returns warning (not error)", () => {
  const report = {
    date: "2026-01-05",
    store_id: "STORE_A",
    submitted_by_role: "Supervisor",
    coverage: {
      opening_staff_present: true,
      closing_staff_present: true,
      missing_roles: []
    },
    issues: {
      staffing_issue: false,
      utilities_issue: false,
      incident_reported: true,
      notes: ""
    }
  };

  const res = validateReport(report);
  assert.equal(res.ok, true);
  assert.equal(res.warnings.length, 1);
});
