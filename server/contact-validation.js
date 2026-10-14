const PROJECT_TYPES = [
  "AI/ML",
  "Data Science",
  "n8n Automation",
  "Web Development",
  "Virtual Assistant",
  "Social Media Management",
  "Other"
];

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateContact(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {error: "Please check your contact form and try again."};
  }

  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const subject = text(body.subject);
  const projectType = text(body.projectType);
  const message = text(body.message);

  if (
    !name ||
    name.length > 100 ||
    email.length > 254 ||
    !subject ||
    subject.length > 200 ||
    !message ||
    message.length > 5000 ||
    projectType.length > 50 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    /[\r\n]/.test(email) ||
    /[\r\n]/.test(subject) ||
    (projectType && !PROJECT_TYPES.includes(projectType))
  ) {
    return {error: "Please check your contact form and try again."};
  }

  return {
    value: {name, email, subject, projectType: projectType || "Other", message}
  };
}

module.exports = {PROJECT_TYPES, validateContact};
