/**
 * Pending Booking Intent Store (enataka_pending_booking)
 * Preserves user seat selection across Sign In, 2FA, and Quick Registration
 * Automatically expires after 15 minutes.
 */

export const PENDING_BOOKING_STORAGE_KEY = "enataka_pending_booking";
export const PENDING_BOOKING_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Saves the pending booking intent to sessionStorage.
 * @param {Object} data
 * @param {number|string} data.showId - Show ID
 * @param {number|string|null} data.slotId - Time slot identifier or string
 * @param {string[]} data.seatKeys - Array of seat identifiers (e.g. ["Normal-D7", "Normal-D8"])
 * @param {string} [data.returnPath] - Path to return to if needed (e.g. "/show/12/seats")
 * @param {Array} [data.seats] - Detailed seat objects including category and price
 * @param {number} [data.totalAmount] - Total price of selected seats
 * @param {string} [data.showTitle] - Show title for context banners
 * @param {string} [data.showTime] - Show time for context
 */
export function savePendingBooking({
  showId,
  slotId = null,
  seatKeys = [],
  returnPath = "",
  seats = [],
  totalAmount = 0,
  showTitle = "",
  showTime = "",
}) {
  if (typeof window === "undefined") return null;

  const payload = {
    showId: Number(showId) || showId,
    slotId: slotId || null,
    seatKeys: Array.isArray(seatKeys) ? seatKeys : [],
    returnPath: returnPath || `/show/${showId}/seats`,
    expiresAt: Date.now() + PENDING_BOOKING_TTL_MS,
    seats: Array.isArray(seats) ? seats : [],
    totalAmount: Number(totalAmount) || 0,
    showTitle: showTitle || "",
    showTime: showTime || "",
    createdAt: Date.now(),
  };

  try {
    sessionStorage.setItem(PENDING_BOOKING_STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch (err) {
    console.error("Failed to save pending booking intent:", err);
    return null;
  }
}

/**
 * Retrieves the pending booking intent from sessionStorage if valid and not expired.
 * Removes expired intents automatically.
 * @returns {Object|null}
 */
export function getPendingBooking() {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(PENDING_BOOKING_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.expiresAt) {
      clearPendingBooking();
      return null;
    }

    if (Date.now() > Number(parsed.expiresAt)) {
      clearPendingBooking();
      return null;
    }

    return parsed;
  } catch (err) {
    console.error("Failed to parse pending booking intent:", err);
    clearPendingBooking();
    return null;
  }
}

/**
 * Clears the pending booking intent from sessionStorage.
 */
export function clearPendingBooking() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear pending booking:", err);
  }
}

/**
 * Checks if a non-expired pending booking exists.
 * @returns {boolean}
 */
export function hasValidPendingBooking() {
  return getPendingBooking() !== null;
}
