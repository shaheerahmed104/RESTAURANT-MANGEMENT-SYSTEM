/* =====================================================
   booking.js  -  Table reservation form
   ===================================================== */

const bookingForm = document.getElementById('bookingForm');
const bName = document.getElementById('bName');
const bPhone = document.getElementById('bPhone');
const bDate = document.getElementById('bDate');
const bTime = document.getElementById('bTime');
const bGuests = document.getElementById('bGuests');
const bNotes = document.getElementById('bNotes');

const MAX_BOOKINGS_PER_SLOT = 5;   // simple "capacity" rule

// Time slots: 12:00 PM to 11:00 PM, every hour
function buildTimeOptions() {
  let html = '<option value="">Select time</option>';
  for (let hour = 12; hour <= 23; hour++) {
    const value = `${pad(hour)}:00`;
    html += `<option value="${value}">${formatTime(value)}</option>`;
  }
  bTime.innerHTML = html;
}

// A date cannot be in the past
bDate.min = todayKey();
bDate.value = todayKey();
buildTimeOptions();

// Has this time already passed? (only matters when the date is today)
function isPast(dateValue, timeValue) {
  if (dateValue !== todayKey()) return dateValue < todayKey();
  const now = new Date();
  return Number(timeValue.split(':')[0]) <= now.getHours();
}

bookingForm.addEventListener('submit', event => {
  event.preventDefault();

  const dateOk = markField(bDate, bDate.value !== '' && bDate.value >= todayKey());
  const timeOk = markField(bTime, bTime.value !== '' && !(dateOk && isPast(bDate.value, bTime.value)));
  const guests = Number(bGuests.value);

  const ok =
    markField(bName, bName.value.trim().length >= 2) &
    markField(bPhone, isValidPhone(bPhone.value)) &
    dateOk & timeOk &
    markField(bGuests, Number.isInteger(guests) && guests >= 1 && guests <= 20);

  if (!ok) {
    showToast('Please fix the highlighted fields.', 'error');
    return;
  }

  // Check the slot is not fully booked
  const reservations = getReservations();
  const sameSlot = reservations.filter(r =>
    r.date === bDate.value && r.time === bTime.value && r.status !== 'Cancelled');
  if (sameSlot.length >= MAX_BOOKINGS_PER_SLOT) {
    markField(bTime, false);
    showToast('Sorry, that time is fully booked. Please choose another time.', 'error');
    return;
  }

  const reservation = {
    id: generateReservationId(),
    name: bName.value.trim(),
    phone: bPhone.value.trim(),
    date: bDate.value,
    time: bTime.value,
    guests: guests,
    notes: bNotes.value.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  reservations.push(reservation);
  saveReservations(reservations);

  // Show the confirmation instead of the form
  bookingForm.classList.add('d-none');
  document.getElementById('bookingSuccess').classList.remove('d-none');
  document.getElementById('bookingId').textContent = reservation.id;
  document.getElementById('bookingSummary').textContent =
    `${reservation.name}, a table for ${reservation.guests} is reserved on ` +
    `${formatDateKey(reservation.date)} at ${formatTime(reservation.time)}.`;
  showToast('Table reserved successfully!', 'success');
});

document.getElementById('newBookingBtn').addEventListener('click', () => {
  bookingForm.reset();
  bookingForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
  bDate.value = todayKey();
  bGuests.value = 2;
  bookingForm.classList.remove('d-none');
  document.getElementById('bookingSuccess').classList.add('d-none');
});
