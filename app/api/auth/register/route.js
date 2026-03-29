import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

function randomSuffix() {
  return Math.floor(100 + Math.random() * 900).toString();
}

function baseSlug(name) {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 24);
  return s || "user";
}

async function generateUniqueUsername(name) {
  const base = baseSlug(name);
  for (let i = 0; i < 25; i++) {
    const candidate = `${base}-${randomSuffix()}`;
    const exists = await User.findOne({ username: candidate });
    if (!exists) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername(name);

    await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      username,
    });

    return NextResponse.json({ success: true, username });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
