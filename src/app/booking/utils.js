// src/app/booking/utils.js

/**
 * Robustly parses time strings to minutes from midnight.
 * Handles: "9am", "9:30am", "09:00 AM", "12pm", "9am-10am"
 */
export const timeToMinutes = (timeStr) => {
  try {
    if (!timeStr) return -1;

    // 1. Get the start time part (before the hyphen)
    const startPart = timeStr.split(/-|–/)[0].trim().toLowerCase();

    // 2. Regex to find hours, minutes (optional), and am/pm
    const match = startPart.match(/(\d+)(?::(\d+))?\s*(am|pm)/);

    if (!match) {
      console.warn("Could not parse time:", timeStr);
      return -1;
    }

    let [_, hoursStr, minutesStr, period] = match;
    let hours = parseInt(hoursStr, 10);
    let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

    // 3. Convert to 24-hour format
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return (hours * 60) + minutes;
  } catch (e) {
    console.error('Time parsing error:', timeStr, e);
    return -1;
  }
};

/**
 * Check if a time slot is in the past relative to current time
 */
export const isSlotInPast = (slotTime, selectedDateString) => {
  const now = new Date();
  if (!selectedDateString) return false;

  const [year, month, day] = selectedDateString.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);

  // 1. Future Date
  if (selectedDate > now && selectedDate.toDateString() !== now.toDateString()) return false;

  // 2. Past Date
  // Reset time portions for pure date comparison
  const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (selectedDate < todayReset) return true;

  // 3. Today
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();
  const slotStartMinutes = timeToMinutes(slotTime);

  if (slotStartMinutes === -1) return false;

  const BUFFER_MINUTES = 0; 
  return slotStartMinutes < (currentMinutes + BUFFER_MINUTES);
};

/**
 * Filter slots to remove past times for today
 */
export const filterAvailableSlots = (slots, selectedDateString) => {
  if (!Array.isArray(slots)) return [];
  
  return slots.filter(slot => {
    // Always show booked/closed slots
    if (slot.status === 'booked' || slot.status === 'closed') return true;
    
    // Filter out available slots that have passed
    return !isSlotInPast(slot.time, selectedDateString);
  });
};

export const getFormattedDate = (dateObj) => dateObj.toLocaleDateString('en-CA');