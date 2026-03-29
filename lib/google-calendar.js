import { google } from "googleapis";

const SLOT_MINUTES = 30;

function addMinutesWall(date, time, add) {
  const [h, m] = time.split(":").map(Number);
  let mins = h * 60 + m + add;
  let day = date;
  if (mins >= 24 * 60) {
    mins -= 24 * 60;
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    day = `${y}-${mo}-${da}`;
  }
  const eh = Math.floor(mins / 60);
  const em = mins % 60;
  return `${day}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00`;
}

export async function createGoogleCalendarEvent(host, params) {
  if (!host.googleRefreshToken) return;

  const oauth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth.setCredentials({ refresh_token: host.googleRefreshToken });

  const calendar = google.calendar({ version: "v3", auth: oauth });

  const timeZone = host.timezone || "UTC";
  const startDateTime = `${params.date}T${params.time}:00`;
  const endDateTime = addMinutesWall(params.date, params.time, SLOT_MINUTES);

  await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `Meeting with ${params.guestName}`,
      description: `Scheduled via Scheduler.\nGuest: ${params.guestName} (${params.guestEmail})`,
      start: { dateTime: startDateTime, timeZone },
      end: { dateTime: endDateTime, timeZone },
      attendees: [{ email: params.guestEmail }],
    },
  });
}
