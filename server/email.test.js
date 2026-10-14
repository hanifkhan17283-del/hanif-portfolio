const test = require("node:test");
const assert = require("node:assert/strict");
const {
  escapeHtml,
  getEmailConfigurationStatus,
  sendNotification
} = require("./email");

test("escapes untrusted message content in HTML email", () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert('x')">&`),
    "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;"
  );
});

test("does not claim delivery when SMTP configuration is missing", async () => {
  const keys = [
    "EMAIL_HOST",
    "EMAIL_USER",
    "EMAIL_PASSWORD",
    "CONTACT_RECIPIENT"
  ];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  keys.forEach(key => delete process.env[key]);

  try {
    assert.deepEqual(await sendNotification({}), {
      sent: false,
      error: "email_not_configured"
    });
  } finally {
    keys.forEach(key => {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    });
  }
});

test("identifies missing settings without exposing setting values", () => {
  assert.deepEqual(
    getEmailConfigurationStatus({
      EMAIL_HOST: "",
      EMAIL_USER: "",
      EMAIL_PASSWORD: "",
      CONTACT_RECIPIENT: ""
    }),
    {
      configured: false,
      missing: [
        "EMAIL_HOST",
        "EMAIL_USER",
        "EMAIL_PASSWORD",
        "CONTACT_RECIPIENT"
      ],
      invalid: []
    }
  );
});

test("validates SMTP port, TLS mode, and notification recipient", () => {
  const configuration = {
    EMAIL_HOST: "smtp.example.com",
    EMAIL_PORT: "587",
    EMAIL_SECURE: "false",
    EMAIL_USER: "mailer@example.com",
    EMAIL_PASSWORD: "configured-secret",
    EMAIL_FROM: "mailer@example.com",
    CONTACT_RECIPIENT: "owner@example.com"
  };

  assert.equal(getEmailConfigurationStatus(configuration).configured, true);
  assert.deepEqual(
    getEmailConfigurationStatus({
      ...configuration,
      EMAIL_PORT: "not-a-port",
      EMAIL_SECURE: "sometimes",
      CONTACT_RECIPIENT: "not-an-email"
    }).invalid,
    ["EMAIL_PORT", "EMAIL_SECURE", "CONTACT_RECIPIENT"]
  );
});
