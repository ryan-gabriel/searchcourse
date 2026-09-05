/**
 * Admin API Authorization Guard
 *
 * Verifies the caller is an authenticated Supabase user with the
 * `is_admin: true` claim in user_metadata before any admin mutation/read.
 * Must be called at the top of every /api/admin/* route handler.
 */

import "server-only";

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase";

export async function requireAdmin() {
  let admin;
  try {
    admin = await getAdminUser();
  } catch (error) {
    // Treat auth-session failures as unauthorized (fail closed), never as a 500.
    console.error("Admin auth check failed:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}