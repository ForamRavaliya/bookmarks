// src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "Bookmarks — Your personal link library",
  description: "Save and share your favourite links.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
