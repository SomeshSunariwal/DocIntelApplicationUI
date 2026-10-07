import React from "react";
import { ChevronDown } from "lucide-react";

export default function ProfileMenu({ onLogout }) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const rootRef = React.useRef(null);
  const closeTimerRef = React.useRef(null);

  const closeMenu = () => {
    setOpen(false);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setMounted(false), 200);
  };

  React.useEffect(() => {
    if (!open) return undefined;
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) closeMenu();
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, [open]);

  React.useEffect(
    () => () => {
      window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          if (open) {
            closeMenu();
            return;
          }
          window.clearTimeout(closeTimerRef.current);
          setMounted(true);
          setOpen(true);
        }}
        className="rounded-md p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#383838]"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <ChevronDown size={16} />
      </button>
      {mounted && (
        <div
          className="profile-dropdown"
          data-state={open ? "open" : "closed"}
          aria-hidden={!open}
        >
          <button type="button" className="profile-dropdown-item">
            Edit Profile
          </button>
          <div className="profile-dropdown-divider" />
          <button
            type="button"
            className="profile-dropdown-item profile-dropdown-logout"
            onClick={() => {
              closeMenu();
              onLogout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
