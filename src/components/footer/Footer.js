import React from "react";
import "./Footer.css";
import {greeting, socialMediaLinks} from "../../portfolio";

const quickLinks = [
  {label: "Home", href: "#greeting"},
  {label: "About", href: "#about"},
  {label: "Skills", href: "#skills"},
  {label: "Experience", href: "#experience"},
  {label: "Projects", href: "#projects"},
  {label: "Certifications", href: "#achievements"},
  {label: "Contact", href: "#contact"}
];

const socialAccounts = [
  {
    key: "github",
    label: "GitHub",
    icon: "fab fa-github",
    url: socialMediaLinks.github
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "fab fa-linkedin-in",
    url: socialMediaLinks.linkedin
  },
  {
    key: "gitlab",
    label: "GitLab",
    icon: "fab fa-gitlab",
    url: socialMediaLinks.gitlab
  },
  {
    key: "medium",
    label: "Medium",
    icon: "fab fa-medium-m",
    url: socialMediaLinks.medium
  },
  {
    key: "stackoverflow",
    label: "Stack Overflow",
    icon: "fab fa-stack-overflow",
    url: socialMediaLinks.stackoverflow
  }
].filter(account => account.url && /^https?:\/\//i.test(account.url));

function scrollToTop() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  window.scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"});
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const email = socialMediaLinks.gmail;
  const validEmail =
    email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          <a
            className="footer-brand-link"
            href="#greeting"
            aria-label={`${greeting.username}, home`}
          >
            <span className="footer-monogram" aria-hidden="true">
              HM
            </span>
            <span id="footer-brand-title" className="footer-name">
              {greeting.username}
            </span>
          </a>
          <p className="footer-specialty">
            AI &amp; Machine Learning <span aria-hidden="true">|</span> Python{" "}
            <span aria-hidden="true">|</span> n8n Automation
          </p>
          <p className="footer-description">
            Building practical AI solutions, intelligent workflows, and modern
            web experiences.
          </p>
        </section>

        <nav className="footer-navigation" aria-label="Footer navigation">
          <h2 className="footer-heading">Quick Links</h2>
          <ul>
            {quickLinks.map(link => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="footer-connect" aria-labelledby="footer-connect-title">
          <h2 className="footer-heading" id="footer-connect-title">
            Connect With Me
          </h2>
          <div className="footer-social-links">
            {socialAccounts.map(account => (
              <a
                key={account.key}
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Hanif Muhammad on ${account.label}`}
                title={account.label}
              >
                <i className={account.icon} aria-hidden="true"></i>
              </a>
            ))}
            {validEmail && (
              <a
                href={`mailto:${validEmail}`}
                aria-label={`Email Hanif Muhammad at ${validEmail}`}
                title="Email"
              >
                <i className="fas fa-envelope" aria-hidden="true"></i>
              </a>
            )}
          </div>
          {validEmail && (
            <a className="footer-email" href={`mailto:${validEmail}`}>
              {validEmail}
            </a>
          )}
        </section>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} Hanif Muhammad. All rights reserved.
        </p>
        <div className="footer-meta">
          <span>Built with React</span>
          <button className="footer-back-to-top" type="button" onClick={scrollToTop}>
            Back to Top <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
