-- supabase/schema.sql
-- Run this entire file in the Supabase SQL editor.
-- It creates the tables and sets up Row Level Security (RLS).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
-- Stores one row per user. The id column matches auth.users.id.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle  TEXT UNIQUE NOT NULL
);

-- Make the handle lookup fast
CREATE INDEX IF NOT EXISTS profiles_handle_idx ON public.profiles(handle);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Any logged-in user can read any profile (needed for public pages)
CREATE POLICY "Anyone can read profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can only insert/update their own profile row
CREATE POLICY "Users can upsert own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. BOOKMARKS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  is_public  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);

-- Enable RLS on bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- ── SELECT policies ──────────────────────────────────────────────────────────

-- Authenticated users can only see their OWN bookmarks (dashboard)
CREATE POLICY "Users can read own bookmarks"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Anonymous visitors can only see PUBLIC bookmarks (public profile page)
-- This is the critical security policy — it enforces privacy at the DB level,
-- not just on the frontend. Even a direct API call cannot bypass it.
CREATE POLICY "Public can read public bookmarks"
  ON public.bookmarks
  FOR SELECT
  TO anon
  USING (is_public = true);

-- ── INSERT policy ────────────────────────────────────────────────────────────

-- Authenticated users can only insert rows where user_id = their own id
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── UPDATE policy ────────────────────────────────────────────────────────────

-- Authenticated users can only update their own rows
CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── DELETE policy ────────────────────────────────────────────────────────────

-- Authenticated users can only delete their own rows
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
