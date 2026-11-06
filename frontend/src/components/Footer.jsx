
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="gt-footer">
      <div className="gt-footer-container">

        <div className="gt-footer-top">
          <div className="gt-footer-identity">
            <span className="gt-footer-symbol">
              <svg
                viewBox="0 0 64 64"
                width="20"
                height="20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M32 50V27"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M31 33C19 33 13 26 13 16C24 16 31 22 31 33Z"
                  fill="currentColor"
                />
                <path
                  d="M33 29C33 18 40 12 51 12C51 23 44 29 33 29Z"
                  fill="currentColor"
                />
                <path
                  d="M22 51H42"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="gt-footer-name">
              Green<span>Track</span>
            </span>
          </div>

          <nav className="gt-footer-nav" aria-label="Footer navigation">
            <a href="/#features">Features</a>
            <a href="/#how-it-works">How it works</a>
            <a href="/#about">About</a>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Get started</Link>
          </nav>
        </div>

        <div className="gt-footer-bottom">
          <span>
            © {new Date().getFullYear()} GreenTrack.
            All rights reserved.
          </span>

          <span className="gt-footer-message">
            Track smarter. Grow better.
          </span>
        </div>

      </div>
    </footer>
  );
}
