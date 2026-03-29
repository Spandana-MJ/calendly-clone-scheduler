"use client";

import CalendarPicker from "@/components/CalendarPicker";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function BookPage() {
  const params = useParams();
  const username = params?.username;

  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [hostError, setHostError] = useState(null);
  const [selected, setSelected] = useState("");
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const formattedDate = useMemo(
    () => (date ? date.toISOString().split("T")[0] : ""),
    [date]
  );

  useEffect(() => {
    if (!date || !username) return;
    setSlotsLoading(true);
    setHostError(null);
    fetch(
      `/api/slots?username=${encodeURIComponent(username)}&date=${formattedDate}`
    )
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 404) {
          setHostError(data.error ?? "Host not found");
          setSlots([]);
          return;
        }
        if (!res.ok) {
          setHostError(data.error ?? "Could not load slots");
          setSlots([]);
          return;
        }
        setSlots(data.slots ?? []);
      })
      .catch(() => {
        setHostError("Could not load slots");
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [date, formattedDate, username]);

  const confirmBooking = async () => {
    setBookingError(null);
    setBookingLoading(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          guestName: name.trim(),
          guestEmail: email.trim(),
          date: formattedDate,
          time: selected,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error ?? "Booking failed");
        return;
      }
      setStep(4);
    } catch {
      setBookingError("Something went wrong.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!username) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-slate-600">
        Invalid link.
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-lg px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              Book a meeting with {username}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose a date, then a time, and confirm your details.
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn mt-8"
            >
              Select date & time
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              Pick a date & slot
            </h2>
            <CalendarPicker value={date} onChange={setDate} minDate={new Date()} />
            {hostError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {hostError}
              </p>
            )}
            {slotsLoading && (
              <p className="text-sm text-slate-500">Loading available times…</p>
            )}
            {!slotsLoading && !hostError && date && slots.length === 0 && (
              <p className="text-sm text-slate-600">
                No availability for this weekday. Ask the host to add hours for{" "}
                {date.toLocaleDateString("en-US", { weekday: "long" })}.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setSelected(slot);
                    setStep(3);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:border-blue-500 hover:bg-blue-50"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back
            </button>
            <p className="text-sm text-slate-600">
              {formattedDate} · {selected}
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Your name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input mt-1"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1"
                placeholder="you@company.com"
              />
            </div>
            {bookingError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {bookingError}
              </p>
            )}
            <button
              type="button"
              disabled={bookingLoading || !name.trim() || !email.trim()}
              onClick={confirmBooking}
              className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {bookingLoading ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-emerald-800">
              You&apos;re booked
            </h2>
            <p className="mt-2 text-slate-600">
              With <strong>{username}</strong>
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {formattedDate} · {selected}
            </p>
            <p className="mt-6 text-sm text-slate-500">
              A confirmation has been saved. If the host connected Google Calendar, an
              invite may appear in their calendar.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
