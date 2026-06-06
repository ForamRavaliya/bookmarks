// src/app/api/send-welcome/route.js
// POST /api/send-welcome
// Called right after signup to send a welcome email using Resend.
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Welcome to Bookmarks 🔖",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
          <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Welcome to Bookmarks! 🔖</h1>
          <p style="color: #555; line-height: 1.6;">
            Thanks for signing up. You can now save bookmarks, keep them private, 
            or share a public profile page with anyone.
          </p>
          <a 
            href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login"
            style="
              display: inline-block;
              margin-top: 1.5rem;
              background: #7c6af7;
              color: #fff;
              text-decoration: none;
              padding: 0.65rem 1.4rem;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Go to your dashboard →
          </a>
          <p style="margin-top: 2rem; font-size: 0.8rem; color: #aaa;">
            If you didn't sign up for this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send welcome error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
