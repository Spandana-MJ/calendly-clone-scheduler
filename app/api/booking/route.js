import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hostId = searchParams.get("hostId");
    const date = searchParams.get("date");

    await connectDB();

    const query = {};
    if (hostId) query.hostId = hostId;
    if (date) query.date = date;

    const bookings = await Booking.find(query)
      .sort({ date: 1, time: 1 })
      .lean();

    return NextResponse.json(bookings);
  } catch (e) {
    console.error("Booking GET:", e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, guestName, guestEmail, date, time } = body;

    if (!username || !guestName?.trim() || !guestEmail?.trim() || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim());
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid guest email" }, { status: 400 });
    }

    const host = await User.findOne({ username });
    if (!host) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 });
    }

    try {
      const booking = await Booking.create({
        hostId: host._id.toString(),
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        date,
        time,
      });

      try {
        await createGoogleCalendarEvent(host, {
          date,
          time,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim().toLowerCase(),
        });
      } catch (calErr) {
        console.error("Google Calendar error (booking still saved):", calErr);
      }

      return NextResponse.json({ success: true, booking });
    } catch (err) {
      if (err?.code === 11000) {
        return NextResponse.json(
          { error: "This time slot was just booked. Please pick another." },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (e) {
    console.error("Booking POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
