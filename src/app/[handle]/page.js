// src/app/[handle]/page.js
// Public profile — visible to anyone, no login needed.
// IMPORTANT: Only public bookmarks are fetched here.
// Even if someone tried to bypass the frontend, RLS would still block
// private bookmarks because we use the anon key with no session.
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }) {
  return {
    title: `@${params.handle} — Bookmarks`,
  };
}

export default async function PublicProfilePage({ params }) {
  const { handle } = params;
  const supabase = createClient();

  // 1. Look up the profile by handle
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("handle", handle)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // 2. Fetch ONLY public bookmarks for that user
  // Note: RLS also enforces is_public = true for anon reads (see SQL file)
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("id, title, url, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const initial = profile.handle?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="profile-page">
      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <h1 className="profile-handle">
          <span>@</span>
          {profile.handle}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {bookmarks?.length ?? 0} public bookmark
          {bookmarks?.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Bookmark links */}
      <div className="container">
        {!bookmarks || bookmarks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔗</span>
            <p>No public bookmarks yet.</p>
          </div>
        ) : (
          <div className="profile-links">
            {bookmarks.map((bm) => {
              // Extract hostname for display
              let hostname = bm.url;
              try {
                hostname = new URL(bm.url).hostname.replace("www.", "");
              } catch {}

              return (
                <a
                  key={bm.id}
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link-card"
                >
                  {/* Favicon-style icon using first letter */}
                  <div className="profile-link-icon">
                    {bm.title?.[0]?.toUpperCase() ?? "🔗"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="profile-link-title">{bm.title}</div>
                    <span className="profile-link-url">{hostname}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="profile-footer">
        Powered by <Link href="/">Bookmarks</Link>
      </p>
    </div>
  );
}
