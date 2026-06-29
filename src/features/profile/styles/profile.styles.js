import { StyleSheet } from "react-native";
import { COLORS } from "../../../constants/colors";

export default StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  scrollContainer: {
    paddingBottom: 120,
  },

  sectionSpacing: {
    marginTop: 16,
  },

  tabContainer: {
    marginTop: 12,
    marginBottom: 8,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 12,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: COLORS.primaryContainer,
  },

  badgeText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: "600",
  },

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },

  sectionHeaderText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
});