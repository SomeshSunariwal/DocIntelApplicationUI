import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoginOverlay from "./components/auth/LoginOverlay";
import SignupOverlay from "./components/auth/SignupOverlay";
import Dashboard from "./components/dashboard/Dashboard";
import { userVerifyAction } from "./components/apis/actions/userVerifyAction";
import { getUserInformationAction } from "./components/apis/actions/getUserInformationAction";

const TOKEN_STORAGE_KEY = "token";

export default function App() {
  const [authState, setAuthState] = useState("checking");
  const dispatch = useDispatch();
  const { data: userVerifyResponse, error: userVerifyError } = useSelector(
    (state) => state.rootReducer.userVerify,
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setAuthState("signed-out");
      return;
    }

    dispatch(userVerifyAction());
  }, [dispatch]);

  useEffect(() => {
    if (typeof userVerifyResponse?.validate !== "boolean") return;

    if (userVerifyResponse.validate) {
      setAuthState("signed-in");
      dispatch(getUserInformationAction());
      return;
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthState("signed-out");
  }, [userVerifyResponse, dispatch]);

  useEffect(() => {
    if (!userVerifyError) return;
    setAuthState("signed-out");
  }, [userVerifyError]);

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
    if (!savedToken) return;
    dispatch(getUserInformationAction());
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
