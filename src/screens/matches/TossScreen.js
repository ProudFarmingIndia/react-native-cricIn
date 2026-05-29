import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const TossScreen = ({ navigation }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const isReady = selectedTeam && selectedChoice;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏏 CricIn</Text>

          <View style={styles.headerRight}>
            <Text style={styles.headerIcon}>🏏</Text>

            <Text style={styles.headerTitle}>Toss Session</Text>
          </View>
        </View>

        {/* Coin Animation Section */}
        <View style={styles.coinSection}>
          <View style={styles.coinGlow} />

          <View style={styles.coin}>
            <Text style={styles.coinIcon}>🪙</Text>
          </View>

          {/* TOSS ACTION BUTTON */}
          {/* RANDOM FLIP BUTTON */}
          <TouchableOpacity
            style={styles.flipButton}
            // ADD RANDOM COIN FLIP LOGIC HERE
            onPress={() => {}}
          >
            <Text style={styles.flipButtonText}>Flip Coin</Text>
          </TouchableOpacity>
        </View>

        {/* Team Selection */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepText}>1</Text>
            </View>

            <Text style={styles.sectionTitle}>Who won the toss?</Text>
          </View>

          {/* Team A */}
          <TouchableOpacity
            style={[
              styles.teamButton,
              selectedTeam === "Lions" && styles.selectedButton,
            ]}
            onPress={() => setSelectedTeam("Lions")}
          >
            <View style={styles.teamLeft}>
              <View style={styles.teamLogoGreen}>
                <Text style={styles.logoText}>🦁</Text>
              </View>

              <Text style={styles.teamName}>Lions CC</Text>
            </View>

            <Text style={styles.checkIcon}>
              {selectedTeam === "Lions" ? "✅" : "⭕"}
            </Text>
          </TouchableOpacity>

          {/* Team B */}
          <TouchableOpacity
            style={[
              styles.teamButton,
              selectedTeam === "Wolves" && styles.selectedButton,
            ]}
            onPress={() => setSelectedTeam("Wolves")}
          >
            <View style={styles.teamLeft}>
              <View style={styles.teamLogoOrange}>
                <Text style={styles.logoText}>🐺</Text>
              </View>

              <Text style={styles.teamName}>Wolves United</Text>
            </View>

            <Text style={styles.checkIcon}>
              {selectedTeam === "Wolves" ? "✅" : "⭕"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Choice Selection */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepText}>2</Text>
            </View>

            <Text style={styles.sectionTitle}>What did they choose?</Text>
          </View>

          <View style={styles.choiceContainer}>
            {/* Batting */}
            <TouchableOpacity
              style={[
                styles.choiceButton,
                selectedChoice === "Batting" && styles.selectedButton,
              ]}
              onPress={() => setSelectedChoice("Batting")}
            >
              <Text style={styles.choiceIcon}>🏏</Text>

              <Text style={styles.choiceText}>BATTING</Text>
            </TouchableOpacity>

            {/* Bowling */}
            <TouchableOpacity
              style={[
                styles.choiceButton,
                selectedChoice === "Bowling" && styles.selectedButton,
              ]}
              onPress={() => setSelectedChoice("Bowling")}
            >
              <Text style={styles.choiceIcon}>⚾</Text>

              <Text style={styles.choiceText}>BOWLING</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        {isReady && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              <Text style={styles.bold}>
                {selectedTeam === "Lions" ? "Lions CC" : "Wolves United"}
              </Text>{" "}
              won the toss and elected to{" "}
              <Text style={styles.bold}>{selectedChoice}</Text> first.
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate("LiveScoringScreen")}
            >
              <Text style={styles.startButtonText}>Start Match</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* here  create one button touchableOpacity because when user click to this navigate to another screen ...button should in center */}

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <TouchableOpacity
            style={styles.statusBadge}
            onPress={() =>
              navigation.navigate("Matches", {
                screen: "SquadSelectForMatch",
              })
            }
          >
            <Text style={styles.statusText}>Squad Selection</Text>
          </TouchableOpacity>
        </View>
        {/* Reset */}
        <TouchableOpacity
          onPress={() => {
            setSelectedTeam(null);
            setSelectedChoice(null);
          }}
        >
          <Text style={styles.resetText}>Reset Toss Options</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TossScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FBF1",
  },

  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#00490E",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#707A6C",
  },

  coinSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  coinGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#DFF5DA",
    opacity: 0.7,
  },

  coin: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFB77B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "#FFDCC2",
    elevation: 8,
  },

  coinIcon: {
    fontSize: 80,
  },

  statusBadge: {
    marginTop: 20,
    backgroundColor: "#0D631B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 50,
  },

  statusText: {
    color: "#8BDD86",
    fontWeight: "700",
    fontSize: 13,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DDE3D7",
  },

  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#00490E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  stepText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#181D17",
  },

  teamButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DDE3D7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#F1F5EB",
  },

  selectedButton: {
    borderColor: "#00490E",
    backgroundColor: "#E9F7E5",
  },

  teamLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  teamLogoGreen: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0D631B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  teamLogoOrange: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FF8F04",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  logoText: {
    fontSize: 24,
  },

  teamName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181D17",
  },

  checkIcon: {
    fontSize: 22,
  },

  choiceContainer: {
    flexDirection: "row",
    gap: 16,
  },

  choiceButton: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#DDE3D7",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5EB",
  },

  choiceIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  choiceText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#40493D",
  },

  summaryContainer: {
    backgroundColor: "#DFF5DA",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BFE5B8",
  },

  summaryText: {
    fontSize: 16,
    color: "#00490E",
    lineHeight: 24,
    textAlign: "center",
  },

  bold: {
    fontWeight: "800",
  },

  startButton: {
    marginTop: 20,
    backgroundColor: "#00490E",
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: "center",
  },

  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  resetText: {
    textAlign: "center",
    color: "#707A6C",
    fontWeight: "700",
    textDecorationLine: "underline",
    marginTop: 8,
  },
  flipButton: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#DDE3D7",
  },

  flipButtonText: {
    color: "#00490E",
    fontWeight: "700",
    fontSize: 14,
  },
});
