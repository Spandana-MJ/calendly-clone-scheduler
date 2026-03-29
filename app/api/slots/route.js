import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Availability from "@/models/Availability";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { generateSlots } from "@/lib/slots";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const date = searchParams.get("date");

    if (!username || !date) {
      return NextResponse.json(
        { error: "username and date are required", slots: [] },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: "Host not found", slots: [], hostId: null },
        { status: 404 }
      );
    }

    const anchor = new Date(`${date}T12:00:00`);
    const day = anchor.toLocaleDateString("en-US", { weekday: "long" });

    const availability = await Availability.findOne({
      userId: user._id.toString(),
      day,
    });

    if (!availability) {
      return NextResponse.json({
        slots: [],
        hostId: user._id.toString(),
        day,
      });
    }

    const raw = generateSlots(
      availability.startTime,
      availability.endTime,
      30
    );

    const booked = await Booking.find({
      hostId: user._id.toString(),
      date,
    }).lean();

    const bookedSet = new Set(booked.map((b) => b.time));
    const slots = raw.filter((t) => !bookedSet.has(t));

    return NextResponse.json({
      slots,
      hostId: user._id.toString(),
      day,
    });
  } catch (e) {
    console.error("Slots GET:", e);
    return NextResponse.json(
      { error: "Server error", slots: [], hostId: null },
      { status: 500 }
    );
  }
}
