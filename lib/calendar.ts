import * as Calendar from 'expo-calendar';

/**
 * Add an appointment to the device calendar through the OS's own event UI
 * (`createEventInCalendarAsync`) — no permission prompt and no calendar
 * picking. Fire-and-forget: a device without calendar support, or a
 * dismissed dialog, simply does nothing.
 */
export async function addAppointmentToCalendar(params: {
  title: string;
  startsAt: Date;
  endsAt: Date;
  location: string;
  notes: string;
}): Promise<void> {
  try {
    await Calendar.createEventInCalendarAsync({
      title: params.title,
      startDate: params.startsAt,
      endDate: params.endsAt,
      location: params.location,
      notes: params.notes,
    });
  } catch {
    // Calendar UI unavailable or cancelled — this action is non-essential.
  }
}
