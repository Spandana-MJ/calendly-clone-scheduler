"use client";

import { COMMON_TIMEZONES } from "@/lib/timezones";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import "react-calendar/dist/Calendar.css";

const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [timezone, setTimezone] = useState("UTC");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const weekdayLabel = useMemo(() => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }, [date]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    setDate(new Date());
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!rows.length || !date) return;
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const match = rows.find((r) => r.day === day);
    if (match) {
      setStartTime(match.startTime);
      setEndTime(match.endTime);
      setTimezone(match.timezone);
    }
  }, [date, rows]);

  const saveAvailability = async () => {
    if (!date) return;
    setMessage(null);
    setSaving(true);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day,
          startTime,
          endTime,
          timezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not save");
        return;
      }
      setMessage("Saved for " + day + ".");
      const refreshed = await fetch("/api/availability").then((r) => r.json());
      if (Array.isArray(refreshed)) setRows(refreshed);
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const removeDay = async (day) => {
    if (!confirm(`Remove availability for ${day}?`)) return;
    const res = await fetch(
      `/api/availability?day=${encodeURIComponent(day)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.day !== day));
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (!date) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
        Loading calendar…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Availability</h1>
      <p className="mt-2 text-slate-600">
        Pick a day on the calendar — we save <strong>weekly</strong> hours for that
        weekday ({weekdayLabel}). Guests only see slots on dates you have configured.
      </p>

      {message && (
        <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-800">
          {message}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Calendar
            value={date}
            onChange={(v) => v instanceof Date && setDate(v)}
            minDate={new Date()}
          />
          <p className="mt-3 text-sm text-slate-600">
            Editing: <strong>{weekdayLabel}</strong>
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input mt-1"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Start
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">End</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input mt-1"
            />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveAvailability}
            className="btn"
          >
            {saving ? "Saving…" : "Save availability"}
          </button>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Saved weekly rules</h2>
        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No rules yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {rows.map((r) => (
              <li
                key={r.day}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm"
              >
                <span>
                  <strong>{r.day}</strong> · {r.startTime}–{r.endTime} · {r.timezone}
                </span>
                <button
                  type="button"
                  onClick={() => removeDay(r.day)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
