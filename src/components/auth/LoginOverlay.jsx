import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { userLoginAction } from "../apis/actions/userLoginAction";

export default function LoginOverlay({ onLogin, onSignup }) {
  const dispatch = useDispatch();
  const {
    data: loginData,
    loading,
    error: loginError,
  } = useSelector((state) => state.rootReducer.userLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loginData?.token && localStorage.getItem("token") === loginData.token) {
      onLogin();
    }
  }, [loginData, onLogin]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    dispatch(userLoginAction({ username: email.trim(), passphrase: password }));
  };

  return (
    <div
      className="login-screen"
      role="dialog"
      aria-modal="true"
      aria-label="Login"
    >
      <div className="login-backdrop" />

      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark" aria-hidden="true">
            <span className="login-brand-page" />
            <span className="login-brand-line line-one" />
            <span className="login-brand-line line-two" />
            <span className="login-brand-line line-three" />
          </div>
          <span>
            <b>Doc</b>
            <strong>Intel</strong>
          </span>
        </div>

        <p className="login-kicker">Turn Documents into Insights</p>
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue to your workspace</p>

        <form onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="login-email">
            Email
          </label>
          <div className="login-input-wrap">
            <UserRound size={20} strokeWidth={1.8} />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="login-password-heading">
            <label className="login-label" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={() => setError("Password recovery will be added later.")}
            >
              Forgot password?
            </button>
          </div>
          <div className="login-input-wrap">
            <LockKeyhole size={20} strokeWidth={1.8} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {(error || loginError) && (
            <p className="login-error">{error || loginError}</p>
          )}

          <button className="login-submit" type="submit" disabled={loading}>
            <span>{loading ? "Signing in…" : "Login"}</span>
            <ArrowRight size={21} />
          </button>
        </form>

        <div className="login-divider">
          <span /> <b>OR</b> <span />
        </div>

        <button
          className="google-login"
          type="button"
          onClick={() => setError("Google sign-in will be connected later.")}
        >
          <span className="google-g">G</span>
          <span>Continue with Google</span>
        </button>

        <p className="login-signup">
          Don't have an account?{" "}
          <button type="button" onClick={onSignup}>
            Sign up
          </button>
        </p>
      </section>
    </div>
  );
}
