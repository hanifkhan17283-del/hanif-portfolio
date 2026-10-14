const nodemailer = require("nodemailer");

const REQUIRED_EMAIL_SETTINGS = [
  "EMAIL_HOST",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "CONTACT_RECIPIENT"
];

function getEmailConfigurationStatus(env = process.env) {
  const missing = REQUIRED_EMAIL_SETTINGS.filter(
    key => !env[key] || !env[key].trim()
  );
  const invalid = [];
  const port = env.EMAIL_PORT ? Number(env.EMAIL_PORT) : 587;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    invalid.push("EMAIL_PORT");
  }
  if (
    env.EMAIL_SECURE &&
    !["true", "false"].includes(env.EMAIL_SECURE.toLowerCase())
  ) {
    invalid.push("EMAIL_SECURE");
  }
  if (
    env.CONTACT_RECIPIENT &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.CONTACT_RECIPIENT.trim())
  ) {
    invalid.push("CONTACT_RECIPIENT");
  }

  return {
    configured: missing.length === 0 && invalid.length === 0,
    missing,
    invalid
  };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

async function sendNotification(message) {
  const configuration = getEmailConfigurationStatus();
  if (configuration.missing.length) {
    return {sent: false, error: "email_not_configured"};
  }
  if (configuration.invalid.length) {
    return {sent: false, error: "email_configuration_invalid"};
  }

  const submittedAt = new Date(message.created_at).toISOString();
  const text = [
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    `Project type: ${message.project_type}`,
    `Subject: ${message.subject}`,
    `Submitted: ${submittedAt}`,
    "",
    message.message
  ].join("\n");
  const html = `
    <h2>New portfolio inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(message.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(message.email)}</p>
    <p><strong>Project type:</strong> ${escapeHtml(message.project_type)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(message.subject)}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
    <hr />
    <p>${escapeHtml(message.message).replace(/\n/g, "<br />")}</p>
  `;

  try {
    const port = Number(process.env.EMAIL_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: process.env.EMAIL_SECURE === "true" || port === 465,
      requireTLS: process.env.EMAIL_SECURE !== "true" && port !== 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.CONTACT_RECIPIENT,
      replyTo: message.email,
      subject: `New Portfolio Inquiry: ${message.subject}`,
      text,
      html
    });
    return {sent: true};
  } catch (error) {
    console.error(
      "Inquiry email delivery failed:",
      error.code || "delivery_error"
    );
    return {sent: false, error: "delivery_failed"};
  }
}

module.exports = {
  escapeHtml,
  getEmailConfigurationStatus,
  sendNotification
};
