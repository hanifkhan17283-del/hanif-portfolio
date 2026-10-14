import React, {useContext, useState} from "react";
import "./Header.css";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import StyleContext from "../../contexts/StyleContext";
import {greeting} from "../../portfolio";

const navigationLinks = [
  {label: "Home", href: "#greeting"},
  {label: "About", href: "#about"},
  {label: "Skills", href: "#skills"},
  {label: "Education", href: "#education"},
  {label: "Experience", href: "#experience"},
  {label: "Projects", href: "#projects"},
  {label: "Certifications", href: "#achievements"},
  {label: "Contact", href: "#contact"}
];

function Header() {
  const {isDark} = useContext(StyleContext);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`site-header${isDark ? " site-header-dark" : ""}`}>
      <div className="header-inner">
        <a
          href="#greeting"
          className="header-brand"
          aria-label={`${greeting.username}, home`}
          onClick={() => setMenuOpen(false)}
        >
          <span className="header-monogram" aria-hidden="true">
            HM
          </span>
          <span className="header-brand-name">{greeting.username}</span>
        </a>

        <button
          className="header-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(open => !open)}
        >
          <span aria-hidden="true">{menuOpen ? "\u00d7" : "\u2630"}</span>
        </button>

        <nav
          id="primary-navigation"
          className={`header-navigation${menuOpen ? " header-navigation-open" : ""}`}
          aria-label="Main navigation"
        >
          <ul>
            {navigationLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            <li className="header-theme-control">
              <ToggleSwitch />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
