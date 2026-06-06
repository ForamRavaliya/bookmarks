// src/app/api/bookmarks/[id]/route.js
// PATCH  /api/bookmarks/:id  — update a bookmark
// DELETE /api/bookmarks/:id  — delete a bookmark
// RLS ensures users can only touch their own rows.
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, url, is_public } = body;

  const { data, error } = await supabase
    .from("bookmarks")
    .update({ title, url, is_public })
    .eq("id", params.id)
    // RLS will block if this row belongs to another user,
    // but we add the user_id check as a belt-and-suspenders guard.
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id); // belt-and-suspenders check

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
