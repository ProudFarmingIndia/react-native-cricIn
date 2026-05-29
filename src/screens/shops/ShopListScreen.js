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
  StatusBar,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

// const COLORS = {
//   primary: "#00490e",
//   secondary: "#8f4e00",
//   background: "#f7fbf1",
//   surface: "#ffffff",
//   text: "#181d17",
//   textLight: "#40493d",
//   border: "#dfe5d9",
//   card: "#ffffff",
//   error: "#ba1a1a",
//   secondaryContainer: "#ff8f04",
// };

const FILTERS = [
  "Distance",
  "Rating",
  "Discounts",
  "Category",
];

const SHOPS = [
  {
    id: 1,
    name: "Stellar Sports Academy",
    address:
      "42 Pavilion Street, Ground Floor, Central District",
    rating: "4.8",
    distance: "1.2 km away",
    offer: "Up to 20% Off for CricMaster members",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop",
    tags: ["Custom Bats", "Footwear", "Repairs"],
  },

  {
    id: 2,
    name: "Elite Willow Hub",
    address: "18 Boundary Road, West Commercial Hub",
    rating: "4.6",
    distance: "2.8 km away",
    offer: "Flash Sale: 15% off pads",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    tags: ["English Willow", "Coaching Gear"],
  },

  {
    id: 3,
    name: "The Cricket Loft",
    address: "Suite 305, Skyline Sports Plaza",
    rating: "4.9",
    distance: "3.5 km away",
    offer: "Free Batting Grip",
    image:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop",
    tags: ["Team Apparel", "Digital Analysis"],
  },
];

export default function ShopListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons
            name="sports-cricket"
            size={28}
            color={COLORS.primary}
          />

          <Text style={styles.headerTitle}>
            Explore Shops
          </Text>
        </View>

        <TouchableOpacity style={styles.notificationBtn}>
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* SEARCH */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <MaterialIcons
              name="search"
              size={22}
              color="#707a6c"
            />

            <TextInput
              placeholder="Search for cricket gear, stores..."
              placeholderTextColor="#707a6c"
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.filterBtn}>
            <MaterialIcons
              name="filter-list"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                index === 0 && styles.activeChip,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  index === 0 && styles.activeChipText,
                ]}
              >
                {item}
              </Text>

              {index === 0 && (
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={18}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SHOP LIST */}
        {SHOPS.map((shop) => (
          <View
            key={shop.id}
            style={styles.shopCard}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: shop.image }}
                style={styles.shopImage}
              />

              <View style={styles.offerBadge}>
                <Text style={styles.offerText}>
                  {shop.offer}
                </Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.shopTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopName}>
                    {shop.name}
                  </Text>

                  <View style={styles.locationRow}>
                    <MaterialIcons
                      name="location-on"
                      size={16}
                      color={COLORS.primary}
                    />

                    <Text style={styles.address}>
                      {shop.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.ratingBox}>
                  <View style={styles.ratingRow}>
                    <MaterialIcons
                      name="star"
                      size={18}
                      color="#f5b301"
                    />

                    <Text style={styles.ratingText}>
                      {shop.rating}
                    </Text>
                  </View>

                  <Text style={styles.distanceText}>
                    {shop.distance}
                  </Text>
                </View>
              </View>

              {/* TAGS */}
              <View style={styles.tagContainer}>
                {shop.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>

              {/* BUTTON */}
              <TouchableOpacity style={styles.visitBtn}>
                <Text style={styles.visitBtnText}>
                  Visit Store
                </Text>
              </TouchableOpacity>
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

  header: {
    height: 65,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    marginLeft: 10,
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
  },

  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingHorizontal: 16,
  },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.text,
  },

  filterBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  filterContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    marginTop: 18,
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: "#e7ece2",
    marginRight: 10,
  },

  activeChip: {
    backgroundColor: COLORS.primary,
  },

  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textLight,
  },

  activeChipText: {
    color: "#fff",
    marginRight: 4,
  },

  shopCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  imageWrapper: {
    position: "relative",
  },

  shopImage: {
    width: "100%",
    height: 220,
  },

  offerBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
  },

  offerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#623300",
  },

  cardContent: {
    padding: 18,
  },

  shopTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  shopName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingRight: 12,
  },

  address: {
    marginLeft: 4,
    fontSize: 13,
    color: COLORS.textLight,
    flex: 1,
    lineHeight: 18,
  },

  ratingBox: {
    alignItems: "flex-end",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  distanceText: {
    marginTop: 4,
    fontSize: 11,
    color: "#707a6c",
    fontWeight: "600",
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
  },

  tag: {
    backgroundColor: "#eef2eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textLight,
  },

  visitBtn: {
    marginTop: 14,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  visitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});