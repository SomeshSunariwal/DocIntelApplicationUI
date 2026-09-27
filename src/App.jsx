import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoginOverlay from "./components/auth/LoginOverlay";
import SignupOverlay from "./components/auth/SignupOverlay";
import Dashboard from "./components/dashboard/dashboard";
import { API_URL, HomeEndpoint } from "./components/constants";

const TOKEN_STORAGE_KEY = "token";

function tokenIsUnexpired(token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function App() {
  const [authState, setAuthState] = useState("checking");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token || !tokenIsUnexpired(token)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setAuthState("signed-out");
      return undefined;
    }

    fetch(`${HomeEndpoint}${API_URL.GET_ALL_USER_DOCUMENTS}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Stored session is no longer valid");
        const body = await response.json();
        if (body?.errorCode !== undefined) {
          throw new Error(body.message || "Stored session is no longer valid");
        }
        if (!cancelled) setAuthState("signed-in");
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (!cancelled) setAuthState("signed-out");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      authState === "signed-out" &&
      location.pathname !== "/login" &&
      location.pathname !== "/signup"
    ) {
      navigate("/login", { replace: true });
    }
    if (
      authState === "signed-in" &&
      (location.pathname === "/login" || location.pathname === "/signup")
    ) {
      navigate("/", { replace: true });
    }
  }, [authState, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthState("signed-out");
    navigate("/login", { replace: true });
  };

  const handleLogin = () => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken || !tokenIsUnexpired(savedToken)) return;
    setAuthState("signed-in");
    navigate("/", { replace: true });
  };

  if (authState === "checking") {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Checking your session…
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authState === "signed-in" ? (
            <Navigate to="/" replace />
          ) : (
            <LoginOverlay
              onLogin={handleLogin}
              onSignup={() => navigate("/signup")}
            />
          )
        }
      />
      <Route
        path="/signup"
        element={
          authState === "signed-in" ? (
            <Navigate to="/" replace />
          ) : (
            <SignupOverlay onLogin={() => navigate("/login")} />
          )
        }
      />
      <Route
        path="/"
        element={
          authState === "signed-in" ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={authState === "signed-in" ? "/" : "/login"} replace />
        }
      />
    </Routes>
  );
}
