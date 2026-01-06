/**
 * Daily Operations Coverage Report - Validation
 * Sanitized reference implementation (no proprietary logic/data).
 */

const ALLOWED_ROLES = new Set(["Supervisor", "Team Lead", "Manager"]);
const STORE_ID_REGEX = /^STORE_[A-Z0-9_]+$/;

function isISODateYYYYMMDD(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validate a daily operations report object.
 * @param {object} report
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
function validateReport(report) {
  const errors = [];
  const warnings = [];

  if (report == null || typeof report !== "object" || Array.isArray(report)) {
    return { ok: false, errors: ["Report must be an object."], warnings: [] };
  }

  // Required top-level fields
  if (!isISODateYYYYMMDD(report.date)) {
    errors.push("date is required and must be in YYYY-MM-DD format.");
  }

  if (!isNonEmptyString(report.store_id) || !STORE_ID_REGEX.test(report.store_id)) {
    errors.push('store_id is required and must look like "STORE_A" / "STORE_LOCATION_01".');
  }

  if (!isNonEmptyString(report.submitted_by_role) || !ALLOWED_ROLES.has(report.submitted_by_role)) {
    errors.push('submitted_by_role is required and must be one of: "Supervisor", "Team Lead", "Manager".');
  }

  // coverage block
  if (report.coverage == null || typeof report.coverage !== "object" || Array.isArray(report.coverage)) {
    errors.push("coverage is required and must be an object.");
  } else {
    const c = report.coverage;

    if (typeof c.opening_staff_present !== "boolean") {
      errors.push("coverage.opening_staff_present is required and must be boolean.");
    }

    if (typeof c.closing_staff_present !== "boolean") {
      errors.push("coverage.closing_staff_present is required and must be boolean.");
    }

    if (!Array.isArray(c.missing_roles)) {
      errors.push("coverage.missing_roles is required and must be an array.");
    } else {
      const invalid = c.missing_roles.filter(r => typeof r !== "string" || r.trim().length === 0);
      if (invalid.length > 0) errors.push("coverage.missing_roles must only contain non-empty strings.");
    }
  }

  // issues block
  if (report.issues == null || typeof report.issues !== "object" || Array.isArray(report.issues)) {
    errors.push("issues is required and must be an object.");
  } else {
    const i = report.issues;

    for (const key of ["staffing_issue", "utilities_issue", "incident_reported"]) {
      if (typeof i[key] !== "boolean") {
        errors.push(`issues.${key} is required and must be boolean.`);
      }
    }

    if (i.notes != null && typeof i.notes !== "string") {
      errors.push("issues.notes must be a string if provided.");
    }

    // Helpful warnings (not hard failures)
    if (i.incident_reported === true && (!isNonEmptyString(i.notes))) {
      warnings.push("incident_reported is true but issues.notes is empty. Consider adding incident context.");
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

module.exports = { validateReport };
