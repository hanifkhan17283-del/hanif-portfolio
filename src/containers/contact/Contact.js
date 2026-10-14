import React, {useContext, useRef, useState} from "react";
import "./Contact.css";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import {contactInfo} from "../../portfolio";
import {Fade} from "react-reveal";
import StyleContext from "../../contexts/StyleContext";

const projectTypes = [
  "AI/ML",
  "Data Science",
  "n8n Automation",
  "Web Development",
  "Virtual Assistant",
  "Social Media Management",
  "Other"
];

function createSubmissionKey() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  const values = new Uint8Array(16);
  window.crypto.getRandomValues(values);
  return Array.from(values, value => value.toString(16).padStart(2, "0")).join(
    ""
  );
}

export default function Contact() {
  const {isDark} = useContext(StyleContext);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({type: "", text: ""});
  const submissionKey = useRef(createSubmissionKey());

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    setSubmitting(true);
    setNotice({type: "", text: ""});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": submissionKey.current
        },
        body: JSON.stringify(payload)
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Your message could not be sent. Please try again.");
      }
      if (!response.ok || !result.received) {
        throw new Error(
          result.error || "Your message could not be sent. Please try again."
        );
      }

      form.reset();
      submissionKey.current = createSubmissionKey();
      setNotice({
        type: "success",
        text: "Thanks for reaching out. Your message has been received."
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof TypeError
            ? "We could not reach the contact service. Please try again in a moment."
            : error.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Fade bottom duration={1000} distance="20px">
      <section
        className={`main contact-margin-top ${isDark ? "dark-mode" : ""}`}
        id="contact"
      >
        <div className="contact-div-main">
          <div className="contact-header">
            <h1 className="heading contact-title">{contactInfo.title}</h1>
            <p
              className={
                isDark
                  ? "dark-mode contact-subtitle"
                  : "subTitle contact-subtitle"
              }
            >
              {contactInfo.subtitle}
            </p>
            <div className={`contact-text-div ${isDark ? "dark-mode" : ""}`}>
              <p className="contact-intro">
                Tell me a little about what you are looking to build. I’ll get
                back to you as soon as I can.
              </p>
              {contactInfo.number && (
                <a
                  className="contact-detail"
                  href={`tel:${contactInfo.number}`}
                >
                  {contactInfo.number}
                </a>
              )}
              <a
                className="contact-detail-email"
                href={`mailto:${contactInfo.email_address}`}
              >
                {contactInfo.email_address}
              </a>
              <SocialMedia />
            </div>
          </div>
          <div className="contact-form-column">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <label>
                  Full Name
                  <input
                    name="name"
                    autoComplete="name"
                    maxLength="100"
                    required
                  />
                </label>
                <label>
                  Email Address
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    maxLength="254"
                    required
                  />
                </label>
              </div>
              <label>
                Subject
                <input name="subject" maxLength="200" required />
              </label>
              <label>
                Project Type
                <select name="projectType" defaultValue="Other">
                  {projectTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Message
                <textarea
                  name="message"
                  rows="6"
                  minLength="10"
                  maxLength="5000"
                  required
                />
              </label>
              <label className="contact-honeypot" aria-hidden="true">
                Leave this field empty
                <input name="website" tabIndex="-1" autoComplete="off" />
              </label>
              <button
                className="contact-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
              <p
                className={`contact-notice ${notice.type}`}
                role={notice.type === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {notice.text}
              </p>
            </form>
          </div>
        </div>
      </section>
    </Fade>
  );
}
