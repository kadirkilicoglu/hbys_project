import { useState } from "react";
import { NavLink } from "react-router-dom";

/**
 * Reusable top navigation for HBYS theme
 * - TailwindCSS
 * - Works with react-router
 * - Active link is styled automatically
 * - Mobile hamburger with slide-down panel
 */
export default function Navbar({
  brand = "HBYS",
  links = [
    { to: "/", label: "Dashboard" },
    { to: "/patients", label: "Hastalar" },
    { to: "/patients/new", label: "Yeni Hasta" },
  ],
  right = null, // optional right-side content
}) {
  const [open, setOpen] = useState(false);

  const baseBtn =
    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm border";
  const activeBtn = "text-white bg-white/30 border-white/50 shadow-lg";
  const idleBtn =
    "text-teal-800 bg-teal-100/25 hover:bg-teal-100/35 border-teal-600/40";

  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded" />
            </div>
            <span className="text-xl font-semibold text-white">{brand}</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `${baseBtn} ${isActive ? activeBtn : idleBtn}`
                }
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            {right}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-10 h-10 grid place-items-center rounded-lg text-white/90 hover:bg-white/10"
            aria-label="Menüyü aç/kapat"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              {open ? (
                <path
                  fillRule="evenodd"
                  d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 01.75.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-4">
          <nav className="flex flex-col gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `${baseBtn} ${isActive ? activeBtn : idleBtn}`
                }
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            {right}
          </nav>
        </div>
      </div>
    </header>
  );
}
