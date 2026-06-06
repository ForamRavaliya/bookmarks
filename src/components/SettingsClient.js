// src/components/SettingsClient.js
// Client component for the settings page — lets users claim/update their handle.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsClient({ user, profile }) {
  const router = useRouter();
  const supabase = createClient();

  const [handle, setHandle] = useState(profile?.handle ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validate handle: only lowercase letters, numbers, underscores, hyphens
  function isValidHandle(h) {
    return /^[a-z0-9_-]{3,30}$/.test(h);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleaned = handle.trim().toLowerCase();

    if (!isValidHandle(cleaned)) {
      setError(
        "Handle must be 3–30 characters and only contain lowercase letters, numbers, _ or -."
      );
      return;
    }

    setLoading(true);

    // Upsert the profile row
    // The UNIQUE constraint on handle will cause an error if taken.
    const { error: upsertError } = await supabase.from("profiles").upsert(
      { id: user.id, handle: cleaned },
      { onConflict: "id" } // update existing row for this user
    );

    if (upsertError) {
      // Postgres unique violation code
      if (upsertError.code === "23505") {
        setError("That handle is already taken. Please choose another.");
      } else {
        setError(upsertError.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(`Handle saved! Your public profile: /${cleaned}`);
    setLoading(false);
    router.refresh(); // refresh server data
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <Link href="/dashboard" className="nav-logo">
            🔖 Bookmarks
          </Link>
          <div className="nav-right">
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/dashboard"
            style={{ color: "var(--text-muted)", fontSize: "0.87rem" }}
          >
            ← Back to dashboard
          </Link>
        </div>

        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          Settings
        </h1>

        {/* Handle setup card */}
        <div className="settings-card">
          <h3>Your public handle</h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "1rem",
            }}
          >
            This will be your public profile URL:{" "}
            <code
              style={{
                background: "var(--surface-2)",
                padding: "0.1rem 0.4rem",
                borderRadius: 4,
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
              }}
            >
              bookmarks.app/{handle || "yourhandle"}
            </code>
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="handle">
                Handle
              </label>
              <input
                id="handle"
                className="form-input"
                placeholder="yourhandle"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                pattern="[a-z0-9_-]+"
                minLength={3}
                maxLength={30}
                required
              />
              <p className="form-hint">
                3–30 characters. Lowercase letters, numbers, _ and - only.
              </p>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: "auto", minWidth: 160 }}
            >
              {loading ? <span className="spinner" /> : "Save handle"}
            </button>
          </form>
        </div>

        {/* Account info card */}
        <div className="settings-card">
          <h3>Account</h3>
          <p style={{ fontSize: "0.87rem", color: "var(--text-muted)" }}>
            Signed in as <strong style={{ color: "var(--text)" }}>{user.email}</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
