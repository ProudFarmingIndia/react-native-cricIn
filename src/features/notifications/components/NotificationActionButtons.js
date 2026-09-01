import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { COLORS } from "../../../constants/colors";

import {
  NOTIFICATION_STATUS,
} from "../constants/notificationTypes";

export default function NotificationActionButtons({
  status,
  onAccept,
  onReject,

  accepting = false,
  rejecting = false,
}) {
  /*
  |--------------------------------------------------------------------------
  | Pending Invitation
  |--------------------------------------------------------------------------
  */

  if (status === NOTIFICATION_STATUS.PENDING) {
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            accepting && styles.disabledButton,
          ]}
          activeOpacity={0.8}
          disabled={accepting || rejecting}
          onPress={onAccept}
        >
          {accepting ? (
            <ActivityIndicator
              size="small"
              color="#FFF"
            />
          ) : (
            <Text style={styles.acceptText}>
              Accept
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rejectButton,
            rejecting && styles.disabledButton,
          ]}
          activeOpacity={0.8}
          disabled={accepting || rejecting}
          onPress={onReject}
        >
          {rejecting ? (
            <ActivityIndicator
              size="small"
              color="#EF4444"
            />
          ) : (
            <Text style={styles.rejectText}>
              Reject
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Accepted
  |--------------------------------------------------------------------------
  */

  if (status === NOTIFICATION_STATUS.ACCEPTED) {
    return (
      <View style={styles.badgeAccepted}>
        <Text style={styles.badgeAcceptedText}>
          ✓ Accepted
        </Text>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Rejected
  |--------------------------------------------------------------------------
  */

  if (status === NOTIFICATION_STATUS.REJECTED) {
    return (
      <View style={styles.badgeRejected}>
        <Text style={styles.badgeRejectedText}>
          Rejected
        </Text>
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Cancelled
  |--------------------------------------------------------------------------
  */

  if (status === NOTIFICATION_STATUS.CANCELLED) {
    return (
      <View style={styles.badgeCancelled}>
        <Text style={styles.badgeCancelledText}>
          Cancelled
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  row: {
    width: 95,

    justifyContent: "center",
  },

  acceptButton: {
    backgroundColor: COLORS.primary,

    borderRadius: 10,

    paddingVertical: 10,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 8,

    minHeight: 42,
  },

  acceptText: {
    color: "#FFF",

    fontWeight: "700",
  },

  rejectButton: {
    borderWidth: 1,

    borderColor: "#EF4444",

    borderRadius: 10,

    paddingVertical: 9,

    alignItems: "center",

    justifyContent: "center",

    minHeight: 42,
  },

  rejectText: {
    color: "#EF4444",

    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  badgeAccepted: {
    backgroundColor: "#DCFCE7",

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 10,
  },

  badgeAcceptedText: {
    color: "#15803D",

    fontWeight: "700",
  },

  badgeRejected: {
    backgroundColor: "#FEE2E2",

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 10,
  },

  badgeRejectedText: {
    color: "#DC2626",

    fontWeight: "700",
  },

  badgeCancelled: {
    backgroundColor: "#E5E7EB",

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 10,
  },

  badgeCancelledText: {
    color: "#6B7280",

    fontWeight: "700",
  },
});