
import { Link } from "react-router-dom";
import "./GreenTrackLogo.css";

export default function GreenTrackLogo({ to = "/" }) {
  return (
    <Link to={to} className="gt-logo" aria-label="GreenTrack home">
      <span className="gt-logo-icon">
        <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true">
          <path d="M32 50V27" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M31 33C19 33 13 26 13 16C24 16 31 22 31 33Z" fill="white" />
          <path d="M33 29C33 18 40 12 51 12C51 23 44 29 33 29Z" fill="white" />
          <path d="M22 51H42" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="gt-logo-text">
        Green<span>Track</span>
      </span>
    </Link>
  );
}
