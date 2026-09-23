import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| ground.service.js
|
| Description:
| Every call the grounds feature makes - discovery, owner management,
| bookings and reviews.
|
| Same shape as tournament.service.js: thin wrappers that unwrap
| { success, data } and let the caller handle errors, so a screen's catch
| block sees the server's own message rather than a wrapped one.
|
| WHY THE SEARCH PARAMS ARE BUILT HERE
|
| The discovery screen holds its filters as a plain object with empty
| strings and nulls in it, because that is what a form is. Sending those
| straight through puts `?city=&sort=` on the URL, and the server then has
| to decide whether an empty string means "any" or "a ground whose city is
| the empty string".
|
| So they are stripped once, here, and every screen that searches gets the
| same behaviour.
|
|--------------------------------------------------------------------------
*/

const unwrap = (response) => response.data?.data ?? response.data;

const clean = (params = {}) => {
  const out = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      if (!value.length) return;

      /* Arrays go as comma-joined, which is what the server splits on. */
      out[key] = value.join(",");

      return;
    }

    out[key] = value;
  });

  return out;
};

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
|
| Facility chips, pitch types, sorts, distance buckets and the policy
| defaults. Fetched from the server rather than hardcoded so a new facility
| appears in the filter bar and on the add-ground form without an app
| release - and the icon for it comes down with it, so the app keeps no
| mapping of its own.
*/

export const getGroundOptionsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.GROUND.OPTIONS);

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Discovery
|--------------------------------------------------------------------------
|
| Pass latitude and longitude when the user has allowed location - the
| server then answers with a real distance on every card and can sort by
| it. Without them it falls back to the city and area filters, and
| `sort: "distance"` quietly becomes rating, because there is nothing to
| measure from.
|
| Filters the server understands:
|   q, city, area, radiusKm, pitchType, facilities[], minRating,
|   minPromiseScore, maxPrice, unitType, night, date, floodlights,
|   verifiedOnly, sort
*/

export const searchGroundsApi = async (filters = {}) => {
  const response = await apiClient.get(ENDPOINTS.GROUND.SEARCH, {
    params: clean(filters),
  });

  return unwrap(response);
};

export const getGroundByIdApi = async (groundId, coords = {}) => {
  const response = await apiClient.get(ENDPOINTS.GROUND.DETAILS(groundId), {
    params: clean(coords),
  });

  return unwrap(response);
};

/*
| One date's slots on every unit of a ground. Each slot comes back already
| marked available / booked / blocked / past with a reason, so the screen
| renders them all and greys out the ones that cannot be taken.
|
| Hiding them instead would be worse: a player who can see 6-9 is missing
| and cannot see why assumes the app is broken.
*/

export const getAvailabilityApi = async (groundId, date, unitType) => {
  const response = await apiClient.get(
    ENDPOINTS.GROUND.AVAILABILITY(groundId),
    { params: clean({ date, unitType }) },
  );

  return unwrap(response);
};

export const getGroundReviewsApi = async (groundId, params = {}) => {
  const response = await apiClient.get(ENDPOINTS.GROUND.REVIEWS(groundId), {
    params: clean(params),
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Owner - the ground
|--------------------------------------------------------------------------
*/

export const createGroundApi = async (payload) => {
  const response = await apiClient.post(ENDPOINTS.GROUND.CREATE, payload);

  return unwrap(response);
};

export const getMyGroundsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.GROUND.MINE);

  return unwrap(response);
};

export const updateGroundApi = async (groundId, payload) => {
  const response = await apiClient.put(
    ENDPOINTS.GROUND.UPDATE(groundId),
    payload,
  );

  return unwrap(response);
};

export const setGroundPausedApi = async (groundId, paused) => {
  const response = await apiClient.patch(ENDPOINTS.GROUND.PAUSE(groundId), {
    paused,
  });

  return unwrap(response);
};

export const deleteGroundApi = async (groundId) => {
  const response = await apiClient.delete(ENDPOINTS.GROUND.DELETE(groundId));

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Owner - units
|--------------------------------------------------------------------------
|
| A unit is one bookable thing: a pitch or a net. A ground with two pitches
| and four nets has six, each with its own hours and its own rates.
*/

export const getUnitsApi = async (groundId) => {
  const response = await apiClient.get(ENDPOINTS.GROUND.UNITS(groundId));

  return unwrap(response);
};

export const createUnitApi = async (groundId, payload) => {
  const response = await apiClient.post(
    ENDPOINTS.GROUND.CREATE_UNIT(groundId),
    payload,
  );

  return unwrap(response);
};

export const updateUnitApi = async (groundId, unitId, payload) => {
  const response = await apiClient.put(
    ENDPOINTS.GROUND.UPDATE_UNIT(groundId, unitId),
    payload,
  );

  return unwrap(response);
};

export const deleteUnitApi = async (groundId, unitId) => {
  const response = await apiClient.delete(
    ENDPOINTS.GROUND.DELETE_UNIT(groundId, unitId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Owner - blackouts and calendar
|--------------------------------------------------------------------------
|
| A blackout is time taken off the market: maintenance, a booking taken
| over the phone, a monsoon week. Pass no unitId to close the whole ground
| for that date, which is what an owner means when they tap a day and say
| "closed".
*/

export const addBlackoutApi = async (groundId, payload) => {
  const response = await apiClient.post(
    ENDPOINTS.GROUND.BLACKOUTS(groundId),
    payload,
  );

  return unwrap(response);
};

export const removeBlackoutApi = async (groundId, blackoutId) => {
  const response = await apiClient.delete(
    ENDPOINTS.GROUND.DELETE_BLACKOUT(groundId, blackoutId),
  );

  return response.data;
};

export const getOwnerCalendarApi = async (groundId, from, to) => {
  const response = await apiClient.get(ENDPOINTS.GROUND.CALENDAR(groundId), {
    params: clean({ from, to }),
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Bookings - player side
|--------------------------------------------------------------------------
|
| `flexibilityMinutes` is the one field worth understanding. 0, 30 or 60 -
| how far the team can move if the exact slot is not free. It is what lets
| the owner counter-offer instead of rejecting, and it turns a dead "no"
| into a booking more often than anything else in this flow.
|
| `matchId` attaches an existing fixture. `createMatch` builds a new draft
| one from this slot. Neither is required - a net session or a knock-about
| has no match, and forcing one into existence would fill the matches list
| with fixtures that were never played.
*/

export const requestBookingApi = async (payload) => {
  const response = await apiClient.post(
    ENDPOINTS.GROUND.REQUEST_BOOKING,
    payload,
  );

  return unwrap(response);
};

export const getMyBookingsApi = async (tab = "upcoming") => {
  const response = await apiClient.get(ENDPOINTS.GROUND.MY_BOOKINGS, {
    params: { tab },
  });

  return unwrap(response);
};

/*
| Comes back with an `actions` object saying exactly what this user can do
| right now - canApprove, canCheckIn, canReview and so on. The screen
| renders buttons from that rather than working it out from the status, so
| there are no dead buttons and the rules live in one place.
*/

export const getBookingByIdApi = async (bookingId) => {
  const response = await apiClient.get(ENDPOINTS.GROUND.BOOKING(bookingId));

  return unwrap(response);
};

export const respondToCounterApi = async (bookingId, accept) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.RESPOND_COUNTER(bookingId),
    { accept },
  );

  return unwrap(response);
};

export const cancelBookingApi = async (bookingId, reason) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.CANCEL_BOOKING(bookingId),
    { reason },
  );

  return unwrap(response);
};

export const checkOutApi = async (bookingId, payload = {}) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.CHECK_OUT(bookingId),
    payload,
  );

  return unwrap(response);
};

export const getAttachableBookingsApi = async () => {
  const response = await apiClient.get(
    ENDPOINTS.GROUND.ATTACHABLE_BOOKINGS,
  );

  return unwrap(response);
};

export const attachMatchToBookingApi = async (bookingId, matchId) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.ATTACH_MATCH(bookingId),
    { matchId },
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Bookings - owner side
|--------------------------------------------------------------------------
*/

export const getOwnerBookingsApi = async (tab = "pending", groundId) => {
  const response = await apiClient.get(ENDPOINTS.GROUND.OWNER_BOOKINGS, {
    params: clean({ tab, groundId }),
  });

  return unwrap(response);
};

export const approveBookingApi = async (bookingId) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.APPROVE_BOOKING(bookingId),
  );

  return unwrap(response);
};

export const rejectBookingApi = async (bookingId, reason) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.REJECT_BOOKING(bookingId),
    { reason },
  );

  return unwrap(response);
};

/*
| The offer has to sit inside the flexibility the team declared and keep
| the same duration. The server refuses anything else with a message that
| says which rule was broken, so the screen does not have to duplicate the
| arithmetic - it just shows what comes back.
*/

export const counterBookingApi = async (bookingId, payload) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.COUNTER_BOOKING(bookingId),
    payload,
  );

  return unwrap(response);
};

/*
| One tap when the side walks on. Everything else - who was late, whether
| the ground itself caused it, whether the slot gets extended - is computed
| from this timestamp and the previous booking's check-out.
*/

export const checkInApi = async (bookingId) => {
  const response = await apiClient.patch(ENDPOINTS.GROUND.CHECK_IN(bookingId));

  return unwrap(response);
};

export const markNoShowApi = async (bookingId) => {
  const response = await apiClient.patch(ENDPOINTS.GROUND.NO_SHOW(bookingId));

  return unwrap(response);
};

export const setPaymentStatusApi = async (bookingId, paymentStatus) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.SET_PAYMENT(bookingId),
    { paymentStatus },
  );

  return unwrap(response);
};

export const getOwnerEarningsApi = async (params = {}) => {
  const response = await apiClient.get(ENDPOINTS.GROUND.OWNER_EARNINGS, {
    params: clean(params),
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Reviews
|--------------------------------------------------------------------------
|
| The form comes from the server because the promise questions are whatever
| THIS ground committed to - a ground that promised nothing is not asked
| five pointless questions, and a ground that promised six is asked about
| all six.
*/

export const getReviewFormApi = async (bookingId) => {
  const response = await apiClient.get(
    ENDPOINTS.GROUND.REVIEW_FORM(bookingId),
  );

  return unwrap(response);
};

export const createReviewApi = async (payload) => {
  const response = await apiClient.post(
    ENDPOINTS.GROUND.CREATE_REVIEW,
    payload,
  );

  return unwrap(response);
};

export const updateMyReviewApi = async (reviewId, payload) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.UPDATE_REVIEW(reviewId),
    payload,
  );

  return unwrap(response);
};

export const getMyReviewsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.GROUND.MY_REVIEWS);

  return unwrap(response);
};

export const replyToReviewApi = async (reviewId, text) => {
  const response = await apiClient.patch(
    ENDPOINTS.GROUND.REPLY_REVIEW(reviewId),
    { text },
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
|
| Lives here rather than in a user service because the only thing that
| switches roles today is the grounds feature. Move it out the day the shop
| needs it too.
*/

export const getMyRolesApi = async () => {
  const response = await apiClient.get(ENDPOINTS.USER.ROLES);

  return unwrap(response);
};

export const switchRoleApi = async (role) => {
  const response = await apiClient.patch(ENDPOINTS.USER.ACTIVE_ROLE, { role });

  return unwrap(response);
};
