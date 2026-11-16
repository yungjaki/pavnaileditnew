import { OAuth2Client } from "google-auth-library";

function getOAuthClient() {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

/**
 * Add a booking to Pavlina's Google Calendar.
 * date: "DD.MM.YYYY", time: "HH:MM"
 * Returns the created event id, or null on failure.
 */
export async function addBookingToCalendar({ name, phone, date, time, services, totalPrice, nailLength }) {
  try {
    const client = getOAuthClient();
    const { token } = await client.getAccessToken();
    if (!token) throw new Error("No access token");

    const calendarId = process.env.TECH_CALENDAR_ID || "primary";

    // Parse date/time — format is DD.MM.YYYY / HH:MM. Google applies the
    // Europe/Sofia timeZone field, so we only build wall-clock strings here.
    const [d, m, y] = date.split(".").map(Number);
    const [hh, mm]  = time.split(":").map(Number);

    const pad = n => String(n).padStart(2, "0");
    // Date.UTC is used purely as a calendar calculator (no timezone shift),
    // so a late slot correctly rolls over into the next day.
    const fmt = (dt) =>
      `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:00`;
    const start = new Date(Date.UTC(y, m - 1, d, hh, mm));
    const end   = new Date(start.getTime() + 90 * 60 * 1000); // ~90 minute appointment
    const dateTimeStr = fmt(start);
    const endDateTimeStr = fmt(end);

    const nailLengthLabel = {
      short: "Къси",
      medium: "Средни",
      long: "Дълги",
      xlong: "X-Дълги",
    }[nailLength] || "";

    const event = {
      summary: `💅 ${name}`,
      description: [
        `📱 ${phone}`,
        nailLengthLabel ? `📏 Дължина: ${nailLengthLabel}` : "",
        `✨ Услуги: ${(Array.isArray(services) ? services : [services]).join(", ")}`,
        `💶 Общо: ${totalPrice}€`,
      ].filter(Boolean).join("\n"),
      start: { dateTime: dateTimeStr, timeZone: "Europe/Sofia" },
      end:   { dateTime: endDateTimeStr, timeZone: "Europe/Sofia" },
      colorId: "4", // Flamingo pink (closest to pink in Google Calendar)
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Calendar API error: ${response.status} — ${err}`);
    }

    const created = await response.json();
    return created.id;

  } catch (err) {
    console.error("addBookingToCalendar failed:", err.message);
    return null;
  }
}

/**
 * Delete a booking event from Google Calendar by eventId.
 */
export async function removeBookingFromCalendar(eventId) {
  if (!eventId) return;
  try {
    const client = getOAuthClient();
    const { token } = await client.getAccessToken();
    if (!token) return;

    const calendarId = process.env.TECH_CALENDAR_ID || "primary";

    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (err) {
    console.error("removeBookingFromCalendar failed:", err.message);
  }
}
