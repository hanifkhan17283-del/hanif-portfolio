const test = require("node:test");
const assert = require("node:assert/strict");
const {PROJECT_TYPES, validateContact} = require("./contact-validation");

test("validates and normalizes a complete contact inquiry", () => {
  const result = validateContact({
    name: " Hanif Muhammad ",
    email: " HANIF@example.com ",
    subject: "Portfolio inquiry",
    projectType: "AI/ML",
    message: "I would like to discuss an AI project."
  });

  assert.equal(result.error, undefined);
  assert.deepEqual(result.value, {
    name: "Hanif Muhammad",
    email: "hanif@example.com",
    subject: "Portfolio inquiry",
    projectType: "AI/ML",
    message: "I would like to discuss an AI project."
  });
});

test("rejects missing fields, malformed addresses, and short messages", () => {
  assert.ok(validateContact({}).error);
  assert.ok(
    validateContact({
      name: "Visitor",
      email: "not-an-email",
      subject: "Hello",
      projectType: "Other",
      message: "A sufficiently long message."
    }).error
  );
  assert.ok(
    validateContact({
      name: "Visitor",
      email: "visitor@example.com",
      subject: "Hello",
      projectType: "Other",
      message: "Short"
    }).error
  );
});

test("rejects invalid project types and header injection", () => {
  const valid = {
    name: "Visitor",
    email: "visitor@example.com",
    subject: "Hello",
    projectType: "Other",
    message: "A sufficiently long message."
  };
  assert.ok(validateContact({...valid, projectType: "Unknown"}).error);
  assert.ok(
    validateContact({...valid, subject: "Hello\r\nBcc: attacker@example.com"})
      .error
  );
  assert.equal(PROJECT_TYPES.length, 7);
});

test("rejects fields that exceed server-side length limits", () => {
  const valid = {
    name: "Visitor",
    email: "visitor@example.com",
    subject: "Hello",
    projectType: "Other",
    message: "A sufficiently long message."
  };
  assert.ok(validateContact({...valid, name: "N".repeat(101)}).error);
  assert.ok(validateContact({...valid, subject: "S".repeat(201)}).error);
  assert.ok(validateContact({...valid, message: "M".repeat(5001)}).error);
});
