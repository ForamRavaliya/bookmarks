import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <span className="home-badge">✦ Personal Bookmark Manager</span>

        <h1 className="home-h1">
          Save your links.
          <br />
          Share only what you want.
        </h1>

        <p className="home-sub">
          A secure personal bookmarks app where you can store private links,
          publish selected bookmarks, and share your public profile with anyone.
        </p>

        <div className="home-ctas">
          <Link href="/signup" className="btn btn-primary home-btn">
            Get started free
          </Link>
          <Link href="/login" className="btn btn-secondary home-btn">
            Log in
          </Link>
        </div>
      </section>

      <section className="home-features">
        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Private by default</h3>
          <p>
            Your bookmarks belong only to your account. Other users cannot view
            or manage them.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>Public profile</h3>
          <p>
            Claim a unique handle and share only your public bookmarks through a
            clean profile page.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Simple dashboard</h3>
          <p>
            Add, edit, delete, and organize useful links from one secure
            dashboard.
          </p>
        </div>
      </section>
    </main>
  );
}