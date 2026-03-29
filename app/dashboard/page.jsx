"use client";


import CopyLinkButton from "@/components/CopyLinkButton";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense,useEffect, useMemo, useState } from "react";

 function DashboardContent(){
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [origin, setOrigin] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const googleStatus = searchParams.get("google");

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const username = session?.user?.username ?? "";
  const bookingPath = username ? `/book/${username}` : "";
  const bookingUrl = origin && username ? `${origin}${bookingPath}` : "";

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoadingBookings(true);
    fetch(`/api/booking?hostId=${session.user.id}`)
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, [session?.user?.id]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...bookings]
      .filter((b) => b.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
  }, [bookings]);

  if (status === "loading" || !session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">
        Hello, {session.user?.name ?? "there"}
      </h1>
      <p className="mt-2 text-slate-600">
        Share your link so people can book time with you.
      </p>

      {googleStatus === "connected" && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Google Calendar connected. New bookings will create events when possible.
        </p>
      )}
      {googleStatus === "no_refresh" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Google did not return a refresh token. Try revoking app access in your Google
          account, then connect again.
        </p>
      )}
      {googleStatus === "error" && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Google connection was cancelled or failed.
        </p>
      )}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Your booking link</h2>
        <p className="mt-1 text-sm text-slate-600">
          Path:{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">{bookingPath}</code>
        </p>
        {bookingUrl ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="min-w-0 flex-1 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-800">
              {bookingUrl}
            </p>
            <CopyLinkButton link={bookingUrl} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Loading link…</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Google Calendar</h2>
        <p className="mt-1 text-sm text-slate-600">
          Connect so confirmed bookings create calendar events with guest email.
        </p>
        <a
          href="/api/google/auth"
          className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Connect Google Calendar
        </a>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
          <Link
            href="/availability"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Manage availability
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming meetings</h2>
        {loadingBookings ? (
          <p className="mt-4 text-sm text-slate-500">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No upcoming meetings yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((b) => (
              <li
                key={b._id}
                className="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm"
              >
                <p className="font-medium text-slate-900">
                  {b.date} · {b.time}
                </p>
                <p className="text-slate-600">
                  {b.guestName} · {b.guestEmail}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}