import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUserAction } from "../apis/actions/registerUserAction";
import {
  ArrowRight,
  Check,
  X,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

export default function SignupOverlay({ onLogin }) {
  const dispatch = useDispatch();
  const { loading, success, error: registrationError } = useSelector(
    (state) => state.rootReducer.registerUser,
  );
  const [fields, setFields] = useState({
    username: "", firstName: "", lastName: "", email: "", password: "", rePassword: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const registrationPending = useRef(false);
  useEffect(() => {
    if (registrationPending.current && !loading) {
      registrationPending.current = false;
      if (success) onLogin();
    }
  }, [loading, success, onLogin]);
  const passwordsMatch = fields.password === fields.rePassword && !!fields.password.trim();
  const updateField = (event) => {
    setFields((values) => ({ ...values, [event.target.name]: event.target.value }));
    setError("");
    setSubmitted(false);
  };
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    setSubmitted(false);
    if (Object.values(fields).some((value) => !value.trim())) {
      setError("Please fill in all fields.");
      return;
    }
    if (!e.currentTarget.elements.email.validity.valid) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordsMatch) {
      setError("Password and Re Password must match.");
      return;
    }
    setError("");
    setSubmitted(true);
    registrationPending.current = true;
    dispatch(registerUserAction({
      username: fields.username.trim(),
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      email: fields.email.trim(),
      password: fields.password,
    }));
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="signup-full-width">
            <div>
              <label className="login-label" htmlFor="signup-username">
                Username
              </label>
              <div className="login-input-wrap">
                <UserRound size={18} strokeWidth={1.8} />
                <input
                  id="signup-username"
                  name="username"
                  value={fields.username}
                  onChange={updateField}
                  required
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
                  name="email"
                  value={fields.email}
                  onChange={updateField}
                  required
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
                  name="firstName"
                  value={fields.firstName}
                  onChange={updateField}
                  required
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
                  name="lastName"
                  value={fields.lastName}
                  onChange={updateField}
                  required
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
              name="password"
              value={fields.password}
              onChange={updateField}
              required
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
              name="rePassword"
              value={fields.rePassword}
              onChange={updateField}
              required
              aria-invalid={!!fields.rePassword && !passwordsMatch}
              type={showRePassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            {fields.rePassword && (
              <span
                className={`signup-password-status ${passwordsMatch ? "is-match" : "is-mismatch"}`}
                role="status"
                aria-label={passwordsMatch ? "Passwords match" : "Passwords do not match"}
              >
                {passwordsMatch ? <Check size={19} /> : <X size={19} />}
              </span>
            )}
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowRePassword((v) => !v)}
              aria-label={showRePassword ? "Hide password" : "Show password"}
            >
              {showRePassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {(error || (submitted && registrationError)) && (
            <p className="login-error" role="alert">{error || registrationError}</p>
          )}

          <button className="login-submit signup-submit" type="submit" disabled={loading}>
            <span>{loading ? "Signing up…" : "Sign up"}</span>
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
          <button type="button" onClick={onLogin}>
            Sign in
          </button>
        </p>
      </section>
    </div>
  );
}
