export function generateSlots(start, end, durationMinutes = 30) {
  const slots = [];
  const startMs = parseTimeToMs(start);
  const endMs = parseTimeToMs(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return [];
  }

  let current = startMs;
  while (current + durationMinutes * 60 * 1000 <= endMs) {
    slots.push(formatMsAsHHmm(current));
    current += durationMinutes * 60 * 1000;
  }
  return slots;
}

function parseTimeToMs(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return (h * 60 + m) * 60 * 1000;
}

function formatMsAsHHmm(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
