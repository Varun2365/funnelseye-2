// D:\PRJ_YCT_Final\services\generic_calendar_service.js

const { v4: uuidv4 } = require('uuid');

// In-memory data store for appointments.
// This is a simple mock for a real database.
const mockAppointments = [];

const create = ({ coachId, leadId, startTime, duration, summary, notes, timeZone }) => {
  const newAppointment = {
    id: uuidv4(),
    coachId,
    leadId,
    startTime,
    duration,
    summary,
    notes,
    timeZone,
  };
  mockAppointments.push(newAppointment);

  console.log(`Appointment created:`, newAppointment);

  return {
    action_summary: {
      result: `Event "${summary}" created successfully.`,
    },
    events: [
      {
        event_id: newAppointment.id,
        duration,
        // The attendees array will be empty in this mock, but a real service would populate it.
        attendees: [leadId, coachId],
        provider: 'google_calendar',
      },
    ],
  };
};

const search = ({ coachId, date }) => {
  // Defensive check: if date is not a valid string, return an empty array
  if (!date || typeof date !== 'string') {
    return [];
  }

  console.log(`Simulating search for events on date: ${date}`);
  
  const filteredAppointments = mockAppointments.filter(
    (appt) => appt.coachId === coachId && appt.startTime.toISOString().startsWith(date)
  );

  // The `search` function should return the raw appointment objects,
  // not the formatted response from the `create` function.
  return filteredAppointments;
};

// This function is still needed for the `getAvailableSlots` endpoint
const getAvailableSlots = (coachSettings, existingAppointments, date) => {
  // This is a placeholder for your actual logic to calculate available slots.
  // It should take the coach's working hours, duration, and existing appointments
  // to find open time slots.
  
  // For demonstration, we'll just return some hardcoded slots.
  if (existingAppointments && existingAppointments.length > 0) {
    return []; // No slots if there are existing appointments (a very simple mock)
  }

  return [
    { startTime: `${date}T09:00:00.000Z`, duration: 60 },
    { startTime: `${date}T10:00:00.000Z`, duration: 60 },
  ];
};

module.exports = {
  create,
  search,
  getAvailableSlots,
  // Make sure you have a `require('uuid')` and a `uuidv4()` function if you use this.
};