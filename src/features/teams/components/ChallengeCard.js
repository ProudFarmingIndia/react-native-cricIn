import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const STATUS_META = {
  PENDING: { label: "PENDING", color: "#B26A00", bg: "#FFF4E0" },
  ACCEPTED: { label: "ACCEPTED", color: "#0B7A0B", bg: "#E6F4E6" },
  REJECTED: { label: "REJECTED", color: "#C62828", bg: "#FDEBEB" },
  CANCELLED: { label: "CANCELLED", color: "#555555", bg: "#EEEEEE" },
  EXPIRED: { label: "EXPIRED", color: "#555555", bg: "#EEEEEE" },
};

export default function ChallengeCard({
  challenge,
  type,
  onAccept,
  onReject,
  onWithdraw,
  onModify,
}) {
  const status = challenge.status || "PENDING";
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  const isPending = status === "PENDING";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.team} numberOfLines={1}>
          {challenge.teamName}
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusText, { color: meta.color }]}>
            {meta.label}
          </Text>
        </View>
      </View>

      <Text style={styles.metaText}>{challenge.format}</Text>
      <Text style={styles.metaText}>
        📅 {challenge.date} • {challenge.time}
      </Text>
      <Text style={styles.metaText}>📍 {challenge.venue}</Text>

      {isPending && type === "received" && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
            <Text>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPending && type === "sent" && (
        <TouchableOpacity style={styles.withdrawBtn} onPress={onWithdraw}>
          <Text style={styles.withdrawText}>Withdraw Challenge</Text>
        </TouchableOpacity>
      )}

      {isPending && (
        <TouchableOpacity style={styles.modifyBtn} onPress={onModify}>
          <Text style={styles.modifyText}>✏️ Modify / Counter-Proposal</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  team: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  metaText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: "#0B7A0B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },

  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  acceptText: {
    color: "#fff",
  },

  withdrawBtn: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ff5252",
    borderRadius: 8,
    alignItems: "center",
  },

  withdrawText: {
    color: "red",
  },

  modifyBtn: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#0B7A0B",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F1F8F1",
  },

  modifyText: {
    color: "#0B7A0B",
    fontWeight: "600",
  },
});