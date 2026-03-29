"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-calendar/dist/Calendar.css";

const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

export default function CalendarPicker({ value, onChange, minDate }) {
  const min = useMemo(() => minDate ?? new Date(), [minDate]);

  return (
    <div className="calendar-shell rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <Calendar
        value={value}
        minDate={min}
        onChange={(v) => {
          if (v instanceof Date) onChange(v);
        }}
      />
    </div>
  );
}
