import { StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

export default StyleSheet.create({
  /*
  |--------------------------------------------------------------------------
  | Notification Card
  |--------------------------------------------------------------------------
  */

  notificationCard: {
    flexDirection: "row",

    alignItems: "flex-start",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 16,

    marginHorizontal: 16,

    marginVertical: 8,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,

    shadowRadius: 10,

    elevation: 4,
  },

  unreadNotification: {
    backgroundColor: "#F5FFF7",

    borderLeftWidth: 4,

    borderLeftColor: COLORS.primary,
  },

  /*
  |--------------------------------------------------------------------------
  | Icon
  |--------------------------------------------------------------------------
  */

  iconContainer: {
    width: 56,

    height: 56,

    borderRadius: 28,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 16,
  },

  /*
  |--------------------------------------------------------------------------
  | Content
  |--------------------------------------------------------------------------
  */

  content: {
    flex: 1,
  },

  /*
  |--------------------------------------------------------------------------
  | Title
  |--------------------------------------------------------------------------
  */

  titleRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 6,
  },

  title: {
    flex: 1,

    fontSize: 16,

    fontWeight: "700",

    color: "#111827",

    marginRight: 10,
  },

  unreadDot: {
    width: 10,

    height: 10,

    borderRadius: 5,

    backgroundColor: COLORS.primary,
  },

  /*
  |--------------------------------------------------------------------------
  | Message
  |--------------------------------------------------------------------------
  */

  message: {
    fontSize: 14,

    color: "#6B7280",

    lineHeight: 22,

    marginBottom: 12,
  },

  /*
  |--------------------------------------------------------------------------
  | Footer
  |--------------------------------------------------------------------------
  */

  footer: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  time: {
    fontSize: 12,

    color: "#9CA3AF",

    fontWeight: "500",
  },

  /*
  |--------------------------------------------------------------------------
  | Buttons
  |--------------------------------------------------------------------------
  */

  actionContainer: {
    flexDirection: "row",

    alignItems: "center",
  },

  acceptButton: {
    backgroundColor: COLORS.primary,

    borderRadius: 10,

    paddingHorizontal: 18,

    paddingVertical: 8,

    marginLeft: 12,
  },

  acceptButtonText: {
    color: "#FFFFFF",

    fontWeight: "700",

    fontSize: 13,
  },

  rejectButton: {
    borderWidth: 1,

    borderColor: "#EF4444",

    borderRadius: 10,

    paddingHorizontal: 18,

    paddingVertical: 8,

    marginLeft: 8,
  },

  rejectButtonText: {
    color: "#EF4444",

    fontWeight: "700",

    fontSize: 13,
  },

  /*
  |--------------------------------------------------------------------------
  | Status Badge
  |--------------------------------------------------------------------------
  */

  badge: {
    borderRadius: 20,

    paddingHorizontal: 12,

    paddingVertical: 6,
  },

  acceptedBadge: {
    backgroundColor: "#DCFCE7",
  },

  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },

  cancelledBadge: {
    backgroundColor: "#E5E7EB",
  },

  badgeText: {
    fontSize: 12,

    fontWeight: "700",
  },

  acceptedText: {
    color: "#15803D",
  },

  rejectedText: {
    color: "#DC2626",
  },

  cancelledText: {
    color: "#6B7280",
  },

  /*
  |--------------------------------------------------------------------------
  | Section Header
  |--------------------------------------------------------------------------
  */

  sectionHeader: {
    marginHorizontal: 20,

    marginTop: 24,

    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: "#111827",
  },

  /*
  |--------------------------------------------------------------------------
  | Filter Chips
  |--------------------------------------------------------------------------
  */

  filterContainer: {
    paddingHorizontal: 16,

    paddingVertical: 12,
  },

  filterChip: {
    paddingHorizontal: 18,

    paddingVertical: 10,

    borderRadius: 24,

    backgroundColor: "#F3F4F6",

    marginRight: 10,
  },

  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },

  filterText: {
    color: "#4B5563",

    fontWeight: "600",

    fontSize: 14,
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  emptyContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: "#111827",

    marginTop: 24,
  },

  emptySubtitle: {
    textAlign: "center",

    fontSize: 15,

    lineHeight: 24,

    color: "#6B7280",

    marginTop: 12,
  },

  /*
  |--------------------------------------------------------------------------
  | Skeleton
  |--------------------------------------------------------------------------
  */

  skeletonCard: {
    height: 90,

    backgroundColor: "#ECECEC",

    borderRadius: 18,

    marginHorizontal: 16,

    marginVertical: 8,
  },

  /*
  |--------------------------------------------------------------------------
  | Screen
  |--------------------------------------------------------------------------
  */

  screen: {
    flex: 1,

    backgroundColor: "#F8FAFC",
  },

  listContent: {
    paddingBottom: 40,
  },
});