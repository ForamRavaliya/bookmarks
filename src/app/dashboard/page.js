// src/app/dashboard/page.js
// Server component — fetches user + bookmarks on the server.
// The middleware already guarantees only logged-in users reach here.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the user's profile (handle)
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .single();

  // Get all bookmarks belonging to this user
  // RLS ensures no other user's bookmarks are returned
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      user={user}
      profile={profile}
      initialBookmarks={bookmarks ?? []}
    />
  );
}
