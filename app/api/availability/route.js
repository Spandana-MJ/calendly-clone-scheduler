import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Availability from "@/models/Availability";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const rows = await Availability.find({ userId: session.user.id }).sort({
      day: 1,
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error("Availability GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { day, startTime, endTime, timezone } = body;

    if (!day || !startTime || !endTime || !timezone) {
      return NextResponse.json(
        { error: "day, startTime, endTime, and timezone are required" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    await connectDB();

    await Availability.findOneAndUpdate(
      { userId: session.user.id, day },
      {
        userId: session.user.id,
        day,
        startTime,
        endTime,
        timezone,
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(session.user.id, { timezone });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Availability POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const day = searchParams.get("day");
    if (!day) {
      return NextResponse.json({ error: "day query required" }, { status: 400 });
    }

    await connectDB();
    await Availability.deleteOne({ userId: session.user.id, day });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Availability DELETE:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
