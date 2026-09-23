import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  getBookingByIdApi,
  approveBookingApi,
  rejectBookingApi,
  counterBookingApi,
  respondToCounterApi,
  cancelBookingApi,
  checkInApi,
  checkOutApi,
  markNoShowApi,
  setPaymentStatusApi,
} from "../services/ground.service";

import {
  money,
  fmtDate,
  fmtTime,
  fmtSlot,
  statusMeta,
  CANCEL_REASONS,
  REJECT_REASONS,
} from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| BookingDetailScreen.js
|
| Description:
| One booking, everything about it, and every action either side can take.
|
| WHY THE BUTTONS COME FROM THE SERVER
|
| The response carries an `actions` object - canApprove, canCounter,
| canCheckIn, canReview and the rest - and this screen renders exactly what
| is in it.
|
| The alternative is working the rules out here from the status, whether
| check-in has happened, whether the grace period has passed and who is
| looking. That logic already exists on the server because it has to, and a
| second copy in the app would drift: the day a rule changes, the screen
| offers a button the server then refuses, and the user is told "no" by
| something that just invited them to tap it.
|
| So there are no dead buttons on this screen, and there is one place that
| decides what is allowed.
|
| WHY THE DELAY EXPLANATION IS SO PROMINENT
|
| It is the part of the feature nobody will believe until they see it work.
| A team kept waiting by the side before them gets their end time moved and
| their overtime waived, with nobody to complain to and nobody to convince -
| two timestamps decided it. Saying so, in plain words, on the booking
| itself, is what makes that credible.
|
|--------------------------------------------------------------------------
*/

const Row = ({ icon, label, value, tone, bold }) => (
  <View style={styles.row}>
    {icon ? (
      <Ionicons name={icon} size={14} color={COLORS.onSurfaceVariant} />
    ) : null}

    <Text style={styles.rowLabel}>{label}</Text>

    <Text
      style={[
        styles.rowValue,
        tone ? { color: tone } : null,
        bold ? styles.rowValueBold : null,
      ]}
    >
      {value}
    </Text>
  </View>
);

const Section = ({ title, children }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}

    <View style={styles.card}>{children}</View>
  </View>
);

/*
| Used for both "why are you cancelling" and "why are you declining". Same
| shape, different presets - and a free-text box, because the preset that
| fits is never the one they need.
*/

const ReasonModal = ({ visible, title, presets, onClose, onSubmit }) => {
  const [text, setText] = useState("");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{title}</Text>

          <View style={styles.presetWrap}>
            {presets.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.preset, text === p && styles.presetActive]}
                activeOpacity={0.85}
                onPress={() => setText(p)}
              >
                <Text style={[styles.presetText, text === p && styles.presetTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.modalInput}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={200}
            placeholder="Apni wajah likho (optional)"
            placeholderTextColor={COLORS.outline}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Rehne do</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalConfirm}
              onPress={() => {
                onSubmit(text.trim());

                setText("");
              }}
            >
              <Text style={styles.modalConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/*
| The owner's counter-offer. Only the start time is entered - the duration
| is fixed, because the server refuses an offer of a different length and
| there is nowhere in this flow to renegotiate the price.
*/

const CounterModal = ({ visible, booking, onClose, onSubmit }) => {
  const [minutes, setMinutes] = useState(30);

  const [message, setMessage] = useState("");

  if (!booking) return null;

  const flex = Number(booking.flexibilityMinutes || 0);

  const duration =
    new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime();

  const proposedStart = new Date(
    new Date(booking.startTime).getTime() + minutes * 60000,
  );

  const proposedEnd = new Date(proposedStart.getTime() + duration);

  /*
  | Only shifts the team actually allowed. Offering them something outside
  | their own stated flexibility is refused by the server, so the picker
  | simply does not contain it.
  */
  const shifts = [-60, -30, 30, 60].filter((m) => Math.abs(m) <= flex);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Doosra time offer karo</Text>

          <Text style={styles.modalHint}>
            Team ne {flex} min tak flexibility di hai. Duration wahi rahegi.
          </Text>

          <View style={styles.presetWrap}>
            {shifts.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.preset, minutes === m && styles.presetActive]}
                activeOpacity={0.85}
                onPress={() => setMinutes(m)}
              >
                <Text
                  style={[styles.presetText, minutes === m && styles.presetTextActive]}
                >
                  {m > 0 ? `+${m} min` : `${m} min`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.proposed}>
            <Text style={styles.proposedLabel}>Naya time</Text>

            <Text style={styles.proposedValue}>
              {fmtTime(proposedStart)} – {fmtTime(proposedEnd)}
            </Text>
          </View>

          <TextInput
            style={styles.modalInput}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={200}
            placeholder="Team ko kuch batana hai? (optional)"
            placeholderTextColor={COLORS.outline}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Rehne do</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalConfirm}
              onPress={() =>
                onSubmit({
                  startTime: proposedStart.toISOString(),
                  endTime: proposedEnd.toISOString(),
                  message: message.trim(),
                })
              }
            >
              <Text style={styles.modalConfirmText}>Offer bhejo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function BookingDetailScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { bookingId } = route.params || {};

  const [booking, setBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);

  const [counterOpen, setCounterOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getBookingByIdApi(bookingId);

      setBooking(data);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  /*
  | One wrapper for every action, so none of them can forget to reload, to
  | clear the busy flag, or to show the server's own error. Each action is
  | then one line at the call site.
  */
  const run = async (fn, successMessage) => {
    setBusy(true);

    try {
      const result = await fn();

      await load();

      if (successMessage || result?.message) {
        Alert.alert("Done", result?.message || successMessage);
      }
    } catch (error) {
      Alert.alert(
        "Nahi ho paaya",
        error?.response?.data?.message || "Kuch galat ho gaya.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={28} color={COLORS.outline} />

        <Text style={styles.errorText}>Ye booking load nahi ho payi.</Text>
      </View>
    );
  }

  const isOwner = !!booking.isOwner;

  const actions = booking.actions || {};

  const meta = statusMeta(booking.status, isOwner);

  const ground = booking.groundId || {};

  const unit = booking.unitId || {};

  const match = booking.matchId || null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/*
        |--------------------------------------------------------------------
        | Status, first
        |--------------------------------------------------------------------
        */}

        <View style={[styles.hero, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.fg} />

          <View style={styles.heroText}>
            <Text style={[styles.heroStatus, { color: meta.fg }]}>{meta.label}</Text>

            <Text style={[styles.heroSlot, { color: meta.fg }]}>
              {fmtSlot(booking.startTime, booking.endTime)}
            </Text>
          </View>
        </View>

        {/*
        | A counter-offer is the one state that needs an answer, so it gets
        | its own panel with the buttons in it rather than being one row
        | among many.
        */}
        {booking.status === "countered" && booking.counterOffer?.startTime ? (
          <View style={styles.counterPanel}>
            <Text style={styles.counterHeading}>
              {isOwner ? "Aapne ye time offer kiya hai" : "Owner ne doosra time offer kiya"}
            </Text>

            <View style={styles.counterCompare}>
              <View style={styles.counterCol}>
                <Text style={styles.counterColLabel}>Aapne maanga tha</Text>

                <Text style={styles.counterColValue}>
                  {fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}
                </Text>
              </View>

              <Ionicons name="arrow-forward" size={16} color="#8f4e00" />

              <View style={styles.counterCol}>
                <Text style={styles.counterColLabel}>Offer</Text>

                <Text style={[styles.counterColValue, styles.counterColNew]}>
                  {fmtTime(booking.counterOffer.startTime)} –{" "}
                  {fmtTime(booking.counterOffer.endTime)}
                </Text>
              </View>
            </View>

            {booking.counterOffer.message ? (
              <Text style={styles.counterMessage}>
                “{booking.counterOffer.message}”
              </Text>
            ) : null}

            {actions.canRespondToCounter ? (
              <View style={styles.counterButtons}>
                <TouchableOpacity
                  style={styles.counterDecline}
                  disabled={busy}
                  onPress={() =>
                    run(
                      () => respondToCounterApi(bookingId, false),
                      "Offer decline kar diya.",
                    )
                  }
                >
                  <Text style={styles.counterDeclineText}>Nahi chalega</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.counterAccept}
                  disabled={busy}
                  onPress={() =>
                    run(
                      () => respondToCounterApi(bookingId, true),
                      "Booking confirm ho gayi.",
                    )
                  }
                >
                  <Text style={styles.counterAcceptText}>Ye time chalega</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}

        {/*
        |--------------------------------------------------------------------
        | What was booked
        |--------------------------------------------------------------------
        */}

        <Section title={isOwner ? "Booking" : "Ground"}>
          {!isOwner ? (
            <TouchableOpacity
              style={styles.groundLink}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("GroundDetailScreen", { groundId: ground._id })
              }
            >
              <View style={styles.groundInfo}>
                <Text style={styles.groundName}>{ground.groundName}</Text>

                <Text style={styles.groundArea}>
                  {[ground.area, ground.city].filter(Boolean).join(", ")}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={17} color={COLORS.outline} />
            </TouchableOpacity>
          ) : (
            <Row
              icon="people-outline"
              label="Team"
              value={
                booking.teamId?.teamName ||
                booking.bookedBy?.fullName ||
                "—"
              }
              bold
            />
          )}

          <Row
            icon={unit.unitType === "net" ? "grid-outline" : "baseball-outline"}
            label={unit.unitType === "net" ? "Net" : "Pitch"}
            value={unit.name || "—"}
          />

          {unit.pitchType ? (
            <Row icon="layers-outline" label="Pitch type" value={unit.pitchType} />
          ) : null}

          <Row
            icon="pricetag-outline"
            label="Purpose"
            value={
              booking.purpose === "net"
                ? "Net session"
                : booking.purpose === "practice"
                  ? "Practice"
                  : "Match"
            }
          />

          {booking.flexibilityMinutes > 0 ? (
            <Row
              icon="swap-horizontal-outline"
              label="Flexibility"
              value={`${booking.flexibilityMinutes} min`}
            />
          ) : null}

          {booking.note ? (
            <View style={styles.note}>
              <Text style={styles.noteLabel}>Note</Text>

              <Text style={styles.noteBody}>{booking.note}</Text>
            </View>
          ) : null}
        </Section>

        {/*
        | The fixture. On the owner's side this is the point of the whole
        | feature - they can see who is playing whom on their pitch.
        */}
        {match ? (
          <Section title="Match">
            <Row
              icon="trophy-outline"
              label="Teams"
              value={`${match.teamA?.teamName || "Team A"} vs ${
                match.teamB?.teamName || "TBD"
              }`}
              bold
            />

            {match.matchType ? (
              <Row
                icon="options-outline"
                label="Format"
                value={`${match.matchType}${match.overs ? ` · ${match.overs} overs` : ""}`}
              />
            ) : null}

            <Row icon="flag-outline" label="Status" value={match.status || "—"} />
          </Section>
        ) : null}

        {/*
        |--------------------------------------------------------------------
        | What actually happened
        |--------------------------------------------------------------------
        |
        | Only once there is something to say. An untouched booking showing
        | four empty timestamp rows tells nobody anything.
        */}

        {booking.checkInAt || booking.checkOutAt ? (
          <Section title="Session">
            {booking.checkInAt ? (
              <Row
                icon="log-in-outline"
                label="Check-in"
                value={fmtTime(booking.checkInAt)}
              />
            ) : null}

            {booking.checkOutAt ? (
              <Row
                icon="log-out-outline"
                label="Check-out"
                value={fmtTime(booking.checkOutAt)}
              />
            ) : null}

            {/*
            | The heart of it. Nobody claimed this and nobody had to be
            | believed - the previous booking's check-out time settled it,
            | the end time already moved, and no overtime was charged.
            */}
            {booking.delayFault === "ground" ? (
              <View style={styles.compPanel}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />

                <Text style={styles.compText}>
                  Isse pehle wali booking late chhoot gayi thi, to ye deri ground
                  ki thi. Aapki slot {booking.compensationMinutes} min aage badha
                  di gayi aur overtime ka koi charge nahi lagega.
                </Text>
              </View>
            ) : booking.delayFault === "team" ? (
              <View style={styles.latePanel}>
                <Ionicons name="alert-circle" size={16} color={COLORS.onErrorContainer} />

                <Text style={styles.lateText}>
                  {booking.delayMinutes} min late start — grace period ke baad.
                  Ground ka time waise hi khatam hoga.
                </Text>
              </View>
            ) : booking.checkInAt ? (
              <View style={styles.onTimePanel}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />

                <Text style={styles.compText}>Time par shuru hua.</Text>
              </View>
            ) : null}
          </Section>
        ) : null}

        {/*
        |--------------------------------------------------------------------
        | The bill
        |--------------------------------------------------------------------
        */}

        <Section title="Paisa">
          <Row icon="cash-outline" label="Slot" value={money(booking.amount)} />

          {booking.overtimeMinutes > 0 ? (
            <Row
              icon="trending-up-outline"
              label={`Overtime (${booking.overtimeMinutes} min)`}
              value={money(booking.overtimeAmount)}
              tone={COLORS.secondary}
            />
          ) : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>

            <Text style={styles.totalValue}>
              {money(booking.totalAmount || booking.amount)}
            </Text>
          </View>

          <Row
            icon="wallet-outline"
            label="Payment"
            value={
              booking.paymentStatus === "paid"
                ? "Mil gaya"
                : booking.paymentStatus === "waived"
                  ? "Maaf kiya"
                  : "Ground par cash"
            }
            tone={
              booking.paymentStatus === "paid" ? COLORS.success : COLORS.onSurface
            }
          />

          {actions.canSetPayment ? (
            <View style={styles.payRow}>
              {["paid", "unpaid", "waived"].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.payChip,
                    booking.paymentStatus === s && styles.payChipActive,
                  ]}
                  disabled={busy}
                  onPress={() => run(() => setPaymentStatusApi(bookingId, s))}
                >
                  <Text
                    style={[
                      styles.payChipText,
                      booking.paymentStatus === s && styles.payChipTextActive,
                    ]}
                  >
                    {s === "paid" ? "Paid" : s === "unpaid" ? "Unpaid" : "Waived"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </Section>

        {booking.cancelledAt ? (
          <Section title="Cancellation">
            <Row
              icon="close-circle-outline"
              label="Kisne kiya"
              value={booking.cancelledBy === "owner" ? "Ground" : "Team"}
            />

            <Row
              icon="time-outline"
              label="Policy ke andar"
              value={booking.cancelledWithinPolicy ? "Haan" : "Nahi"}
              tone={booking.cancelledWithinPolicy ? COLORS.success : COLORS.error}
            />

            {booking.cancelReason ? (
              <View style={styles.note}>
                <Text style={styles.noteLabel}>Wajah</Text>

                <Text style={styles.noteBody}>{booking.cancelReason}</Text>
              </View>
            ) : null}
          </Section>
        ) : null}

        {booking.rejectionReason ? (
          <Section title="Decline ki wajah">
            <Text style={styles.noteBody}>{booking.rejectionReason}</Text>
          </Section>
        ) : null}

        {/*
        | The number, once it is worth having. Before confirmation the ground
        | has not agreed to anything and should not be fielding calls.
        */}
        {ground.contactNumber ? (
          <TouchableOpacity
            style={styles.callButton}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(`tel:${ground.contactNumber}`)}
          >
            <Ionicons name="call" size={16} color={COLORS.primary} />

            <Text style={styles.callText}>Ground ko call karo</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/*
      |--------------------------------------------------------------------
      | Actions
      |--------------------------------------------------------------------
      |
      | Every button here exists because the server said it may. See the
      | note at the top of the file.
      */}

      <View style={styles.actionBar}>
        {actions.canApprove ? (
          <TouchableOpacity
            style={[styles.primaryAction, busy && styles.disabled]}
            disabled={busy}
            onPress={() =>
              run(() => approveBookingApi(bookingId), "Booking confirm ho gayi.")
            }
          >
            <Ionicons name="checkmark" size={17} color={COLORS.onPrimary} />

            <Text style={styles.primaryActionText}>Accept</Text>
          </TouchableOpacity>
        ) : null}

        {actions.canCounter ? (
          <TouchableOpacity
            style={[styles.secondaryAction, busy && styles.disabled]}
            disabled={busy}
            onPress={() => setCounterOpen(true)}
          >
            <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />

            <Text style={styles.secondaryActionText}>Doosra time</Text>
          </TouchableOpacity>
        ) : null}

        {actions.canReject ? (
          <TouchableOpacity
            style={[styles.dangerAction, busy && styles.disabled]}
            disabled={busy}
            onPress={() => setRejectOpen(true)}
          >
            <Text style={styles.dangerActionText}>Decline</Text>
          </TouchableOpacity>
        ) : null}

        {actions.canCheckIn ? (
          <TouchableOpacity
            style={[styles.primaryAction, busy && styles.disabled]}
            disabled={busy}
            onPress={() => run(() => checkInApi(bookingId))}
          >
            <Ionicons name="log-in" size={17} color={COLORS.onPrimary} />

            <Text style={styles.primaryActionText}>Check in</Text>
          </TouchableOpacity>
        ) : null}

        {actions.canCheckOut ? (
          <TouchableOpacity
            style={[styles.primaryAction, busy && styles.disabled]}
            disabled={busy}
            onPress={() =>
              Alert.alert(
                "Session khatam?",
                "Check-out ke baad overtime aur total bill final ho jaayega.",
                [
                  { text: "Abhi nahi", style: "cancel" },
                  {
                    text: "Check out",
                    onPress: () => run(() => checkOutApi(bookingId)),
                  },
                ],
              )
            }
          >
            <Ionicons name="log-out" size={17} color={COLORS.onPrimary} />

            <Text style={styles.primaryActionText}>Check out</Text>
          </TouchableOpacity>
        ) : null}

        {actions.canMarkNoShow ? (
          <TouchableOpacity
            style={[styles.dangerAction, busy && styles.disabled]}
            disabled={busy}
            onPress={() =>
              Alert.alert(
                "No show mark karein?",
                "Team nahi aayi — ye unke record me jaayega.",
                [
                  { text: "Rehne do", style: "cancel" },
                  {
                    text: "Mark no-show",
                    style: "destructive",
                    onPress: () => run(() => markNoShowApi(bookingId)),
                  },
                ],
              )
            }
          >
            <Text style={styles.dangerActionText}>No show</Text>
          </TouchableOpacity>
        ) : null}

        {actions.canReview ? (
          <TouchableOpacity
            style={[styles.primaryAction, busy && styles.disabled]}
            disabled={busy}
            onPress={() =>
              navigation.navigate("RateGroundScreen", { bookingId })
            }
          >
            <Ionicons name="star" size={16} color={COLORS.onPrimary} />

            <Text style={styles.primaryActionText}>Rating do</Text>
          </TouchableOpacity>
        ) : null}

        {actions.canCancel ? (
          <TouchableOpacity
            style={[styles.textAction, busy && styles.disabled]}
            disabled={busy}
            onPress={() => setCancelOpen(true)}
          >
            <Text style={styles.textActionText}>Cancel booking</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ReasonModal
        visible={cancelOpen}
        title="Booking cancel karni hai?"
        presets={CANCEL_REASONS}
        onClose={() => setCancelOpen(false)}
        onSubmit={(reason) => {
          setCancelOpen(false);

          run(() => cancelBookingApi(bookingId, reason));
        }}
      />

      <ReasonModal
        visible={rejectOpen}
        title="Request decline karni hai?"
        presets={REJECT_REASONS}
        onClose={() => setRejectOpen(false)}
        onSubmit={(reason) => {
          setRejectOpen(false);

          run(() => rejectBookingApi(bookingId, reason), "Request decline kar di.");
        }}
      />

      <CounterModal
        visible={counterOpen}
        booking={booking}
        onClose={() => setCounterOpen(false)}
        onSubmit={(payload) => {
          setCounterOpen(false);

          run(
            () => counterBookingApi(bookingId, payload),
            "Offer team ko bhej diya.",
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.background,
  },

  errorText: { fontSize: 13.5, color: COLORS.onSurfaceVariant },

  scroll: { padding: 16, paddingBottom: 30, gap: 13 },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderRadius: 14,
    padding: 14,
  },

  heroText: { flex: 1, gap: 2 },

  heroStatus: { fontSize: 14.5, fontWeight: "900" },

  heroSlot: { fontSize: 12.5, fontWeight: "700" },

  counterPanel: {
    backgroundColor: "#fff8ec",
    borderWidth: 1,
    borderColor: "#ffd9a0",
    borderRadius: 13,
    padding: 13,
    gap: 10,
  },

  counterHeading: { fontSize: 13, fontWeight: "900", color: "#8f4e00" },

  counterCompare: { flexDirection: "row", alignItems: "center", gap: 10 },

  counterCol: { flex: 1, gap: 2 },

  counterColLabel: { fontSize: 10.5, fontWeight: "700", color: "#a06a2c" },

  counterColValue: { fontSize: 12.5, fontWeight: "800", color: COLORS.onSurface },

  counterColNew: { color: "#8f4e00" },

  counterMessage: { fontSize: 12, fontStyle: "italic", color: "#8f4e00" },

  counterButtons: { flexDirection: "row", gap: 9 },

  counterDecline: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e0b880",
  },

  counterDeclineText: { fontSize: 13, fontWeight: "800", color: "#8f4e00" },

  counterAccept: {
    flex: 1.4,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
  },

  counterAcceptText: { fontSize: 13, fontWeight: "900", color: COLORS.onPrimary },

  section: { gap: 7 },

  sectionTitle: { fontSize: 13.5, fontWeight: "900", color: COLORS.onSurface },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
    gap: 9,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },

  rowLabel: { flex: 1, fontSize: 12.5, color: COLORS.onSurfaceVariant },

  rowValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.onSurface,
    textTransform: "capitalize",
  },

  rowValueBold: { fontWeight: "900" },

  groundLink: { flexDirection: "row", alignItems: "center", gap: 8 },

  groundInfo: { flex: 1, gap: 1 },

  groundName: { fontSize: 14, fontWeight: "900", color: COLORS.onSurface },

  groundArea: { fontSize: 11.5, color: COLORS.onSurfaceVariant },

  note: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 9,
    padding: 9,
    gap: 2,
  },

  noteLabel: { fontSize: 10, fontWeight: "900", color: COLORS.outline },

  noteBody: { fontSize: 12.5, lineHeight: 18, color: COLORS.onSurfaceVariant },

  compPanel: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#e4f4e5",
    borderRadius: 10,
    padding: 11,
  },

  onTimePanel: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#e4f4e5",
    borderRadius: 10,
    padding: 11,
  },

  compText: { flex: 1, fontSize: 11.5, lineHeight: 17, fontWeight: "700", color: "#1b5e20" },

  latePanel: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 10,
    padding: 11,
  },

  lateText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "700",
    color: COLORS.onErrorContainer,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    paddingTop: 9,
  },

  totalLabel: { fontSize: 13, fontWeight: "900", color: COLORS.onSurface },

  totalValue: { fontSize: 17, fontWeight: "900", color: COLORS.primary },

  payRow: { flexDirection: "row", gap: 7, marginTop: 2 },

  payChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  payChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  payChipText: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  payChipTextActive: { color: COLORS.onPrimary },

  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
  },

  callText: { fontSize: 13.5, fontWeight: "800", color: COLORS.primary },

  actionBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  disabled: { opacity: 0.55 },

  primaryAction: {
    flex: 1,
    minWidth: 130,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },

  primaryActionText: { fontSize: 13.5, fontWeight: "900", color: COLORS.onPrimary },

  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  secondaryActionText: { fontSize: 13, fontWeight: "800", color: COLORS.primary },

  dangerAction: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  dangerActionText: { fontSize: 13, fontWeight: "800", color: COLORS.error },

  textAction: { paddingHorizontal: 6, paddingVertical: 10 },

  textActionText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.error,
    textDecorationLine: "underline",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  modal: {
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 17,
    gap: 11,
  },

  modalTitle: { fontSize: 15, fontWeight: "900", color: COLORS.onSurface },

  modalHint: {
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
    marginTop: -6,
  },

  presetWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },

  preset: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  presetActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  presetText: { fontSize: 11.5, fontWeight: "700", color: COLORS.onSurfaceVariant },

  presetTextActive: { color: COLORS.onPrimary },

  proposed: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 10,
    padding: 11,
    gap: 2,
  },

  proposedLabel: { fontSize: 10.5, fontWeight: "800", color: COLORS.outline },

  proposedValue: { fontSize: 15, fontWeight: "900", color: COLORS.primary },

  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 62,
    textAlignVertical: "top",
    fontSize: 12.5,
    color: COLORS.onSurface,
  },

  modalActions: { flexDirection: "row", gap: 9 },

  modalCancel: { flex: 1, alignItems: "center", paddingVertical: 13 },

  modalCancelText: { fontSize: 13, fontWeight: "800", color: COLORS.onSurfaceVariant },

  modalConfirm: {
    flex: 1.3,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
  },

  modalConfirmText: { fontSize: 13, fontWeight: "900", color: COLORS.onPrimary },
});
