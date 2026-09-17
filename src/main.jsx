import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import LoginOverlay from "./components/auth/LoginOverlay";
import SignupOverlay from "./components/auth/SignupOverlay";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
// createRoot(document.getElementById("login-root")).render(<LoginOverlay />);
// createRoot(document.getElementById("signup-root")).render(<SignupOverlay />);
