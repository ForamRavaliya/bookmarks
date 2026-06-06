import Link from "next/link";
import { loginUser } from "./actions";

export default function LoginPage({ searchParams }) {
  const error = searchParams?.error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>🔖</span> Bookmarks
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form action={loginUser}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              className="form-input"
              type="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Sign in
          </button>
        </form>

        <p className="auth-link">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}