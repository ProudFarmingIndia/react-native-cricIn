import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";
import { SPACING } from "../../../constants/spacing";

const grounds = [
  {
    id: 1,
    name: "Lord's Cricket Ground",
    location: "St John's Wood, London",
    price: "$150",
    time: "20 Overs / 4hrs",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200",
  },
  {
    id: 2,
    name: "The Adelaide Oval",
    location: "War Memorial Dr, Adelaide",
    price: "$120",
    time: "15 Overs / 3hrs",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200",
  },
];

export default function GroundsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TITLE */}
        <Text style={styles.title}>Explore Grounds</Text>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textSecondary}
          />

          <TextInput
            placeholder="Search premier stadiums..."
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
          />
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
        >
          <TouchableOpacity style={styles.activeFilter}>
            <Ionicons
              name="time-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.activeFilterText}>Time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons
              name="cash-outline"
              size={18}
              color={COLORS.textSecondary}
            />
            <Text style={styles.filterText}>Price</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons
              name="location-outline"
              size={18}
              color={COLORS.textSecondary}
            />
            <Text style={styles.filterText}>Location</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* GROUND LIST */}
        {grounds.map((ground) => (
          <View
            key={ground.id}
            style={styles.card}
          >
            {/* IMAGE */}
            <View>
              <Image
                source={{ uri: ground.image }}
                style={styles.image}
              />

              <View style={styles.ratingBadge}>
                <Ionicons
                  name="star"
                  size={14}
                  color="#ff9500"
                />

                <Text style={styles.ratingText}>{ground.rating}</Text>
              </View>
            </View>

            {/* CONTENT */}
            <View style={styles.cardBody}>
              <Text style={styles.groundName}>{ground.name}</Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.locationText}>
                  {ground.location}
                </Text>
              </View>

              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.price}>{ground.price}</Text>

                  <Text style={styles.timeText}>
                    {ground.time}
                  </Text>
                </View>

                <TouchableOpacity style={styles.bookBtn}>
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  filtersRow: {
    marginBottom: 20,
  },

  header: {
    height: 60,
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    marginTop: 10,
    marginBottom: 20,
  },

  searchBox: {
    marginHorizontal: SPACING.lg,
    backgroundColor: "#eef2ea",
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.textPrimary,
  },

  activeFilter: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginLeft: SPACING.lg,
    marginRight: 10,
    backgroundColor: "#edf8ed",
  },

  activeFilterText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontWeight: "600",
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: "#fff",
  },

  filterText: {
    marginLeft: 5,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: SPACING.lg,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 220,
  },

  ratingBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: 4,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  cardBody: {
    padding: 16,
  },

  groundName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  locationText: {
    marginLeft: 5,
    color: COLORS.textSecondary,
    flex: 1,
  },

  bottomRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },

  timeText: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },

  bookBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});