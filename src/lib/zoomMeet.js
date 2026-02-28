// src/lib/zoomMeet.js — FIXED: Robust time parsing

export async function createZoomMeeting(bookingDetails) {
  const { name, email, department, date, time } = bookingDetails;

  try {
    // ═══════════════════════════════════════
    // DEBUG: Log exactly what we received
    // ═══════════════════════════════════════
    console.log('📹 Zoom meeting request:', {
      name,
      department,
      date,
      time,
      timeCharCodes: time ? [...time].map(c => c.charCodeAt(0)) : 'NULL',
    });

    // Step 1: Get Zoom Access Token
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: process.env.ZOOM_ACCOUNT_ID,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('❌ Zoom token error:', error);
      throw new Error('Failed to get Zoom access token');
    }

    const { access_token } = await tokenResponse.json();
    console.log('✅ Zoom access token obtained');

    // ═══════════════════════════════════════
    // Step 2: ROBUST TIME PARSING
    // ═══════════════════════════════════════
    const { startISO, durationMinutes } = parseBookingTime(date, time);

    console.log('📅 Parsed meeting time:', {
      startISO,
      durationMinutes,
    });

    // Step 3: Create Zoom Meeting
    const meetingResponse = await fetch(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: `${department} Consultation - ${name}`,
          type: 2,
          start_time: startISO,
          duration: durationMinutes,
          timezone: 'Asia/Kolkata',
          agenda: `Online consultation for ${name} - ${department}`,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: false,
            waiting_room: true,
            audio: 'both',
            auto_recording: 'none',
            approval_type: 0,
          },
        }),
      }
    );

    if (!meetingResponse.ok) {
      const error = await meetingResponse.json();
      console.error('❌ Zoom API error:', error);
      throw new Error(`Zoom API error: ${error.message || 'Unknown'}`);
    }

    const meetingData = await meetingResponse.json();
    console.log('✅ Zoom meeting created:', meetingData.id);

    return {
      meetLink: meetingData.join_url,
      meetingId: meetingData.id,
      meetingPassword: meetingData.password || '',
      hostLink: meetingData.start_url,
    };
  } catch (error) {
    console.error('❌ Zoom meeting creation failed:', error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════
// 🔥 BULLETPROOF TIME PARSER
// Handles ALL formats:
//   "09:00 AM – 10:00 AM"  (en-dash)
//   "09:00 AM - 10:00 AM"  (hyphen)
//   "09:00 AM — 10:00 AM"  (em-dash)
//   "09:00 AM to 10:00 AM"
//   "9:00 AM – 10:00 AM"   (no leading zero)
//   "09:00 AM"             (single time, no range)
//   "14:00 – 15:00"        (24-hour format)
// ═══════════════════════════════════════════════
function parseBookingTime(dateStr, timeStr) {
  console.log('🕐 Parsing time:', JSON.stringify(timeStr));

  // Default fallback
  const DEFAULT_DURATION = 60;

  if (!dateStr || !timeStr) {
    throw new Error(`Missing date or time: date=${dateStr}, time=${timeStr}`);
  }

  // ─── Normalize the separator ───
  // Replace ALL types of dashes/separators with a standard pipe
  const normalized = timeStr
    .replace(/\s*[–—−‐-]\s*/g, '|')  // en-dash, em-dash, minus, hyphen
    .replace(/\s+to\s+/gi, '|')       // "to" separator
    .trim();

  console.log('🔄 Normalized time string:', JSON.stringify(normalized));

  const parts = normalized.split('|');
  const startTimeRaw = parts[0]?.trim();
  const endTimeRaw = parts[1]?.trim();

  console.log('📌 Start time raw:', JSON.stringify(startTimeRaw));
  console.log('📌 End time raw:', JSON.stringify(endTimeRaw));

  if (!startTimeRaw) {
    throw new Error(`Could not extract start time from: ${timeStr}`);
  }

  // ─── Convert start time to 24-hour ───
  const start24 = convertTo24HourSafe(startTimeRaw);
  console.log('✅ Start 24h:', start24);

  // ─── Calculate duration ───
  let durationMinutes = DEFAULT_DURATION;

  if (endTimeRaw) {
    try {
      const end24 = convertTo24HourSafe(endTimeRaw);
      console.log('✅ End 24h:', end24);

      const [sh, sm] = start24.split(':').map(Number);
      const [eh, em] = end24.split(':').map(Number);

      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;

      if (endMins > startMins) {
        durationMinutes = endMins - startMins;
      } else {
        durationMinutes = DEFAULT_DURATION;
      }
    } catch (e) {
      console.warn('⚠️ Could not parse end time, using default duration:', e.message);
      durationMinutes = DEFAULT_DURATION;
    }
  }

  // ─── Build ISO date string ───
  // Format: "2025-02-21T09:00:00"
  const isoString = `${dateStr}T${start24}:00`;

  // Validate the date
  const testDate = new Date(isoString);
  if (isNaN(testDate.getTime())) {
    console.error('❌ Invalid date created from:', isoString);
    // Fallback: use date with a default time
    const fallbackISO = `${dateStr}T09:00:00`;
    const fallbackDate = new Date(fallbackISO);
    if (isNaN(fallbackDate.getTime())) {
      throw new Error(`Cannot create valid date from: ${dateStr} and ${timeStr}`);
    }
    console.warn('⚠️ Using fallback time: 09:00');
    return {
      startISO: fallbackDate.toISOString(),
      durationMinutes: DEFAULT_DURATION,
    };
  }

  return {
    startISO: testDate.toISOString(),
    durationMinutes,
  };
}

// ═══════════════════════════════════════════════
// 🔥 SAFE 24-HOUR CONVERTER
// Handles: "09:00 AM", "9:00 PM", "14:00", "9 AM"
// ═══════════════════════════════════════════════
function convertTo24HourSafe(timeInput) {
  if (!timeInput) throw new Error('Empty time input');

  const cleaned = timeInput.trim().toUpperCase();
  console.log('  🔧 Converting:', JSON.stringify(cleaned));

  // ─── Method 1: Regex for 12-hour format ───
  // Matches: "9:00 AM", "09:00 PM", "12:30 AM", "9 PM"
  const match12h = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);

  if (match12h) {
    let hours = parseInt(match12h[1], 10);
    const minutes = parseInt(match12h[2] || '0', 10);
    const period = match12h[3].toUpperCase();

    // Convert to 24-hour
    if (period === 'AM') {
      if (hours === 12) hours = 0;   // 12 AM = 00:00
    } else {
      // PM
      if (hours !== 12) hours += 12;  // 1 PM = 13, 12 PM stays 12
    }

    const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    console.log('  ✅ 12h→24h:', result);
    return result;
  }

  // ─── Method 2: Already 24-hour format ───
  // Matches: "14:00", "09:30", "9:00"
  const match24h = cleaned.match(/^(\d{1,2}):(\d{2})$/);

  if (match24h) {
    const hours = parseInt(match24h[1], 10);
    const minutes = parseInt(match24h[2], 10);

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      console.log('  ✅ 24h format:', result);
      return result;
    }
  }

  // ─── Method 3: Just a number with AM/PM ───
  // Matches: "9AM", "9 PM", "12PM"
  const matchSimple = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/i);

  if (matchSimple) {
    let hours = parseInt(matchSimple[1], 10);
    const period = matchSimple[2].toUpperCase();

    if (period === 'AM' && hours === 12) hours = 0;
    if (period === 'PM' && hours !== 12) hours += 12;

    const result = `${hours.toString().padStart(2, '0')}:00`;
    console.log('  ✅ Simple→24h:', result);
    return result;
  }

  // ─── Method 4: Extract any time-like pattern ───
  const lastResort = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (lastResort) {
    const hours = parseInt(lastResort[1], 10);
    const minutes = parseInt(lastResort[2], 10);

    // Check if there's AM/PM anywhere in the string
    const hasPM = cleaned.includes('PM');
    const hasAM = cleaned.includes('AM');

    let finalHours = hours;
    if (hasPM && hours !== 12) finalHours += 12;
    if (hasAM && hours === 12) finalHours = 0;

    const result = `${finalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    console.log('  ✅ Last resort:', result);
    return result;
  }

  // ─── Nothing worked ───
  console.error('  ❌ Could not parse time:', JSON.stringify(timeInput));
  throw new Error(`Cannot parse time: "${timeInput}"`);
}