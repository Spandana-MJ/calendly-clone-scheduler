import { google } from "googleapis";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const err = searchParams.get("error");

  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (err || !code || !state) {
    return NextResponse.redirect(new URL("/dashboard?google=error", base));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL("/dashboard?google=config", base));
  }

  const oauth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await oauth.getToken(code);

  if (!tokens.refresh_token) {
    return NextResponse.redirect(new URL("/dashboard?google=no_refresh", base));
  }

  await connectDB();
  await User.findByIdAndUpdate(state, {
    googleRefreshToken: tokens.refresh_token,
  });

  return NextResponse.redirect(new URL("/dashboard?google=connected", base));
}
