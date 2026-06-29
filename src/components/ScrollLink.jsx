// src/components/ScrollLink.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ScrollLink({ to, children, className = "", ...props }) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTarget = () => {
    const el = document.querySelector(to);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(() => scrollToTarget(), 150); // give time for home to load
    } else {
      scrollToTarget();
    }
  };

  return (
    <button onClick={handleClick} className={className} {...props}>
      {children}
    </button>
  );
}
