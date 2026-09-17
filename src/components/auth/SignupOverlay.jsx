import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

export default function SignupOverlay({ setLogin, setSignUP }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("Sign up will be connected later.");
  };

  return (
    <div
      className="login-screen signup-screen"
      role="dialog"
      aria-modal="true"
      aria-label="Sign up"
    >
      <div className="login-backdrop" />
      <section className="login-card signup-card">
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
        <h1>Create Account</h1>
        <p className="login-subtitle">
          Sign up to get started with your workspace
        </p>

        <form onSubmit={handleSubmit}>
          <div className="signup-two-col">
            <div>
              <label className="login-label" htmlFor="signup-username">
                Username
              </label>
              <div className="login-input-wrap">
                <UserRound size={18} strokeWidth={1.8} />
                <input
                  id="signup-username"
                  placeholder="Username"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="login-label" htmlFor="signup-email">
                Email
              </label>
              <div className="login-input-wrap">
                <Mail size={18} strokeWidth={1.8} />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          <div className="signup-two-col signup-name-row">
            <div>
              <label className="login-label" htmlFor="signup-first-name">
                First Name
              </label>
              <div className="login-input-wrap">
                <UserRound size={18} strokeWidth={1.8} />
                <input
                  id="signup-first-name"
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>
            </div>
            <div>
              <label className="login-label" htmlFor="signup-last-name">
                Last Name
              </label>
              <div className="login-input-wrap">
                <UserRound size={18} strokeWidth={1.8} />
                <input
                  id="signup-last-name"
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>

          <label
            className="login-label signup-field-label"
            htmlFor="signup-password"
          >
            Password
          </label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} strokeWidth={1.8} />
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <label
            className="login-label signup-field-label"
            htmlFor="signup-re-password"
          >
            Re Password
          </label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} strokeWidth={1.8} />
            <input
              id="signup-re-password"
              type={showRePassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowRePassword((v) => !v)}
              aria-label={showRePassword ? "Hide password" : "Show password"}
            >
              {showRePassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-submit signup-submit" type="submit">
            <span>Sign up</span>
            <ArrowRight size={21} />
          </button>
        </form>

        <div className="login-divider">
          <span /> <b>OR</b> <span />
        </div>

        <button
          className="google-login"
          type="button"
          onClick={() => setError("Google sign-up will be connected later.")}
        >
          <span className="google-g">G</span>
          <span>Sign up with Google</span>
        </button>

        <p className="login-signup">
          Already a user?{" "}
          <button type="button" onClick={() => setSignUP(false)}>
            Sign in
          </button>
        </p>
      </section>
    </div>
  );
}
