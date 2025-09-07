import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./navbarOverlay.css";

/**
 * Overlay Navbar with fixed HBYS brand (top-left)
 * - Inline SVG icons (no FA dependency)
 * - Active route highlighting with NavLink
 * - Click outside to close
 * - Brand: "HBYS — Randevu & Sıra Takip"
 */
export default function NavbarOverlay({
  links = [
    { to: "/", label: "Dashboard" },
    { to: "/patients", label: "Hastalar" },
    { to: "/patients/new", label: "Yeni Hasta" },
  ],
}) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      const root = document.querySelector(".nav-ovl-root");
      if (!root) return;
      const btn = root.querySelector(".menu-btn");
      const ovl = root.querySelector(".nav-overlay");
      const brand = root.querySelector(".brand");
      if (
        btn &&
        ovl &&
        !btn.contains(e.target) &&
        !ovl.contains(e.target) &&
        !(brand && brand.contains(e.target))
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="nav-ovl-root">
      {/* Fixed Brand (top-left) */}
      <div className="brand">
        <NavLink to="/" className="brand-link" onClick={() => setOpen(false)}>
          <span className="logo-outer" aria-hidden="true">
            <span className="logo-inner" />
          </span>
          <span className="brand-text">
            <span className="brand-title">HBYS</span>
            <span className="brand-sub">Randevu &amp; Sıra Takip</span>
          </span>
        </NavLink>
      </div>

      {/* Toggle Button */}
      <button
        aria-label="Menüyü aç/kapat"
        className={`menu-btn ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? (
          // X icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          // Bars icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      <div className={`nav-overlay ${open ? "open" : ""}`}>
        <ul className="nav-menu">
          {links.map((l, i) => (
            <li
              key={l.to}
              className={open ? "show" : ""}
              style={{ transitionDelay: open ? `${(i + 1) * 100}ms` : "0ms" }}
            >
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
