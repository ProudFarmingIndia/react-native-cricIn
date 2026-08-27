import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";

const highlights = [
  {
    title: "Kohli Stunning Century",
    image:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200",
  },
  {
    title: "Bumrah Deadly Yorkers",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200",
  },
];

export default function HighlightsTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {highlights.map((item, index) => (
        <View key={index} style={styles.card}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
          />

          <Text style={styles.title}>{item.title}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 220,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    padding: 16,
  },
});