// src/app/page.js
// Landing page — shown to everyone, logged in or not.
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <span className="home-badge">✦ Personal Link Library</span>

      <h1 className="home-h1">
        Your links, <span>organised</span>
        <br />& shareable
      </h1>

      <p className="home-sub">
        Save bookmarks, keep them private or share a beautiful public profile
        — all in one place.
      </p>

      <div className="home-ctas">
        <Link href="/signup" className="btn btn-primary" style={{ width: "auto" }}>
          Get started free
        </Link>
        <Link href="/login" className="btn btn-secondary">
          Log in
        </Link>
      </div>
    </main>
  );
}
