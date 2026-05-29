import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const QuickScoreScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏏 cricIn</Text>

          <TouchableOpacity style={styles.notificationBtn}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Match Setup</Text>
          <Text style={styles.subtitle}>
            Configure your upcoming fixture details
          </Text>
        </View>

        {/* Teams */}
        <View style={styles.teamSection}>
          {/* Team A */}
          <TouchableOpacity style={styles.teamCard}>
            <View style={styles.teamLogo}>
              <Text style={styles.teamLogoText}>A</Text>
            </View>

            <Text style={styles.teamTitle}>Select Team A</Text>
            <Text style={styles.teamSubTitle}>HOME TEAM</Text>

            <TouchableOpacity style={styles.teamButton}>
              <Text style={styles.teamButtonText}>Choose Team</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Team B */}
          <TouchableOpacity style={styles.teamCard}>
            <View style={styles.teamLogo}>
              <Text style={styles.teamLogoText}>+</Text>
            </View>

            <Text style={styles.teamTitle}>Select Team B</Text>
            <Text style={styles.teamSubTitle}>AWAY TEAM</Text>

            <TouchableOpacity style={styles.teamButton}>
              <Text style={styles.teamButtonText}>Choose Team</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Venue Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Venue & Location</Text>

          <TextInput
            placeholder="Search by name or address..."
            placeholderTextColor="#707A6C"
            style={styles.input}
          />

          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationButtonText}>
              📍 Current Location
            </Text>
          </TouchableOpacity>

          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>Map Preview</Text>
          </View>
        </View>

        {/* Match Specifications */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Match Specifications</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Match Type</Text>

            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>
                Limited Overs (T20)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Overs</Text>

            <TextInput
              value="20"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ball Type</Text>

            <View style={styles.ballTypeContainer}>
              <TouchableOpacity style={styles.activeBallType}>
                <Text style={styles.activeBallTypeText}>
                  Red Leather
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ballType}>
                <Text style={styles.ballTypeText}>
                  White Leather
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ballType}>
                <Text style={styles.ballTypeText}>
                  Tennis
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date & Time</Text>

            <View style={styles.dateTimeContainer}>
              <TextInput
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#707A6C"
                style={[styles.input, styles.flex]}
              />

              <TextInput
                placeholder="10:30 AM"
                placeholderTextColor="#707A6C"
                style={[styles.input, styles.timeInput]}
              />
            </View>
          </View>
        </View>

        {/* Match Officials */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Match Officials</Text>

          <View style={styles.officialContainer}>
            <TouchableOpacity style={styles.officialCard}>
              <Text style={styles.officialIcon}>👤</Text>
              <Text style={styles.officialText}>Add Umpire 1</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.officialCard}>
              <Text style={styles.officialIcon}>👤</Text>
              <Text style={styles.officialText}>Add Umpire 2</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.officialCard}>
              <Text style={styles.officialIcon}>📝</Text>
              <Text style={styles.officialText}>Assign Scorer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              navigation.navigate("Matches", {
                screen: "TossScreen",
              })
            }
            
          >
            <Text style={styles.startButtonText}>
              Time for Toss
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Draft</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuickScoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5EB',
  },

  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00490E',
  },

  notificationBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationIcon: {
    fontSize: 20,
  },

  titleContainer: {
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#00490E',
  },

  subtitle: {
    fontSize: 15,
    color: '#707A6C',
    marginTop: 4,
  },

  teamSection: {
    gap: 16,
    marginBottom: 24,
  },

  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E9EFE3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  teamLogoText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#00490E',
  },

  teamTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#181D17',
  },

  teamSubTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#707A6C',
    marginTop: 4,
    marginBottom: 16,
  },

  teamButton: {
    backgroundColor: '#00490E',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },

  teamButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#181D17',
    marginBottom: 20,
  },

  input: {
    backgroundColor: '#F1F5EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#181D17',
  },

  locationButton: {
    marginTop: 12,
    backgroundColor: '#DFF5DA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  locationButtonText: {
    color: '#00490E',
    fontWeight: '700',
  },

  mapPlaceholder: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#DDE3D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00490E',
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#707A6C',
    marginBottom: 8,
  },

  dropdown: {
    backgroundColor: '#F1F5EB',
    borderRadius: 12,
    padding: 16,
  },

  dropdownText: {
    color: '#181D17',
    fontSize: 15,
  },

  ballTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },

  activeBallType: {
    backgroundColor: '#DFF5DA',
    borderWidth: 2,
    borderColor: '#00490E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  activeBallTypeText: {
    color: '#00490E',
    fontWeight: '700',
  },

  ballType: {
    borderWidth: 1,
    borderColor: '#DDE3D7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  ballTypeText: {
    color: '#707A6C',
    fontWeight: '600',
  },

  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  flex: {
    flex: 1,
  },

  timeInput: {
    width: 120,
  },

  officialContainer: {
    gap: 14,
  },

  officialCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDE3D7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  officialIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  officialText: {
    color: '#707A6C',
    fontWeight: '600',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 14,
  },

  startButton: {
    flex: 1,
    backgroundColor: '#8F4E00',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  saveButton: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE3D7',
    backgroundColor: '#FFFFFF',
  },

  saveButtonText: {
    fontWeight: '700',
    color: '#181D17',
  },
});