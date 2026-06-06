// src/components/DashboardClient.js
// Client component that renders the full dashboard UI.
// Receives initial data from the server component (no extra fetch on load).
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardClient({ user, profile, initialBookmarks }) {
  const router = useRouter();
  const supabase = createClient();

  // ── State ──────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  const publicCount = bookmarks.filter((bm) => bm.is_public).length;
  const privateCount = bookmarks.length - publicCount;
  const [copied, setCopied] = useState(false);

  async function copyProfileLink() {
    if (!profile?.handle) return;

    await navigator.clipboard.writeText(
      `${window.location.origin}/${profile.handle}`
    );

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Add-form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  // ── Logout ─────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // ── Add bookmark ───────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    setAdding(true);
    setAddError("");

    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, is_public: isPublic }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAddError(data.error ?? "Failed to add bookmark");
      setAdding(false);
      return;
    }

    // Prepend to list and reset form
    setBookmarks((prev) => [data, ...prev]);
    setTitle("");
    setUrl("");
    setIsPublic(false);
    setAdding(false);
  }

  // ── Start editing ──────────────────────────────────────
  function startEdit(bm) {
    setEditingId(bm.id);
    setEditTitle(bm.title);
    setEditUrl(bm.url);
    setEditIsPublic(bm.is_public);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  // ── Save edit ──────────────────────────────────────────
  async function handleEdit(id) {
    setEditLoading(true);
    setEditError("");

    const res = await fetch(`/api/bookmarks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        url: editUrl,
        is_public: editIsPublic,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setEditError(data.error ?? "Failed to update");
      setEditLoading(false);
      return;
    }

    setBookmarks((prev) =>
      prev.map((bm) => (bm.id === id ? data : bm))
    );
    setEditingId(null);
    setEditLoading(false);
  }

  // ── Delete ─────────────────────────────────────────────
 async function handleDelete(id) {
   const ok = confirm("Are you sure you want to delete this bookmark?");
   if (!ok) return;

   setDeletingId(id);

   const res = await fetch(`/api/bookmarks/${id}`, {
     method: "DELETE",
   });

   if (res.ok) {
     setBookmarks((prev) => prev.filter((bm) => bm.id !== id));
   }

   setDeletingId(null);
 }

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      {/* ── Navbar ── */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <Link href="/dashboard" className="nav-logo">
            🔖 Bookmarks
          </Link>

          <div className="nav-right">
            {profile?.handle && (
              <span className="nav-handle">@{profile.handle}</span>
            )}
            <Link
              href="/dashboard/settings"
              className="btn btn-ghost"
              style={{ padding: "0.35rem 0.75rem" }}
            >
              ⚙ Settings
            </Link>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="dashboard-main">
        {/* Handle warning if not set */}
        {!profile?.handle && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            ⚠ You haven't set a handle yet.{" "}
            <Link
              href="/dashboard/settings"
              style={{ color: "#fff", fontWeight: 600 }}
            >
              Set it now →
            </Link>
          </div>
        )}

        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-label">Total Bookmarks</span>
            <strong>{bookmarks.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Public</span>
            <strong>{publicCount}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Private</span>
            <strong>{privateCount}</strong>
          </div>
        </div>

        {/* ── Add bookmark form ── */}
        <div className="add-form-card">
          <h2>Add a bookmark</h2>

          {addError && <div className="alert alert-error">{addError}</div>}

          <form onSubmit={handleAdd}>
            <div className="add-form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="bm-title">
                  Title
                </label>
                <input
                  id="bm-title"
                  className="form-input"
                  placeholder="My favourite article"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="bm-url">
                  URL
                </label>
                <input
                  id="bm-url"
                  className="form-input"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-checkbox-row">
              <input
                id="bm-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label htmlFor="bm-public">
                Make this bookmark public (visible on your profile)
              </label>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={adding}
              style={{ width: "auto", minWidth: 140 }}
            >
              {adding ? <span className="spinner" /> : "＋ Add bookmark"}
            </button>
          </form>
        </div>

        {/* ── Bookmark list ── */}
        <div className="section-header">
          <h2 className="section-title">
            Your bookmarks{" "}
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
              ({bookmarks.length})
            </span>
          </h2>

         {profile?.handle && (
           <div className="profile-actions">
             <button
               type="button"
               onClick={copyProfileLink}
               className={`btn ${copied ? "btn-success" : "btn-secondary"}`}
               style={{ fontSize: "0.8rem", padding: "0.35rem 0.85rem" }}
             >
               {copied ? "Copied ✓" : "Copy link"}
             </button>

             <Link
               href={`/${profile.handle}`}
               target="_blank"
               className="btn btn-secondary"
               style={{ fontSize: "0.8rem", padding: "0.35rem 0.85rem" }}
             >
               View public profile ↗
             </Link>
           </div>
         )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <p>
              No bookmarks yet. Add your first link above and it will appear
              here.
            </p>
          </div>
        ) : (
          <div className="bookmark-list">
            {bookmarks.map((bm) => {
              // Show inline edit form for the bookmark being edited
              if (editingId === bm.id) {
                return (
                  <div key={bm.id} className="edit-form">
                    <div className="add-form-row">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Title</label>
                        <input
                          className="form-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">URL</label>
                        <input
                          className="form-input"
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-checkbox-row">
                      <input
                        type="checkbox"
                        checked={editIsPublic}
                        onChange={(e) => setEditIsPublic(e.target.checked)}
                        id={`edit-public-${bm.id}`}
                      />
                      <label htmlFor={`edit-public-${bm.id}`}>Public</label>
                    </div>

                    {editError && (
                      <div className="alert alert-error">{editError}</div>
                    )}

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEdit(bm.id)}
                        disabled={editLoading}
                        style={{ width: "auto", minWidth: 100 }}
                      >
                        {editLoading ? <span className="spinner" /> : "Save"}
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              // Normal card view
              return (
                <div key={bm.id} className="bookmark-card">
               <div className="bookmark-info">
                 <div className="bookmark-title">{bm.title}</div>

                 <a
                   href={bm.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="bookmark-url"
                 >
                   {bm.url}
                 </a>

                 <div className="bookmark-meta">
                   <span
                     className={`badge ${
                       bm.is_public ? "badge-public" : "badge-private"
                     }`}
                   >
                     {bm.is_public ? "🌐 Public" : "🔒 Private"}
                   </span>

                   <span className="bookmark-date">
                     {new Date(bm.created_at).toLocaleDateString()}
                   </span>
                 </div>
               </div>


                  <div className="bookmark-actions">
                    <button
                      className="btn btn-ghost"
                      onClick={() => startEdit(bm)}
                    >
                      ✏ Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(bm.id)}
                      disabled={deletingId === bm.id}
                    >
                      {deletingId === bm.id ? (
                        <span className="spinner" />
                      ) : (
                        "🗑 Delete"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
