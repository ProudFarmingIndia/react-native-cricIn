// GroundDetailsScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';

const facilities = [
  { id: '1', title: 'Valet Parking', icon: '🚗' },
  { id: '2', title: 'Refreshments', icon: '🍔' },
  { id: '3', title: 'Purified Water', icon: '💧' },
  { id: '4', title: 'Premium Seating', icon: '🪑' },
  { id: '5', title: 'Main Pavilion', icon: '🏟️' },
  { id: '6', title: 'Net Practice', icon: '🏏' },
];

const weatherData = [
  { day: 'MON', temp: '22°', icon: '☁️' },
  { day: 'TUE', temp: '26°', icon: '☀️' },
  { day: 'WED', temp: '24°', icon: '🌤️' },
  { day: 'THU', temp: '25°', icon: '☀️' },
  { day: 'FRI', temp: '19°', icon: '🌧️' },
];

const GroundDetailsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO IMAGE */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
            }}
            style={styles.heroImage}
          />

          <View style={styles.overlay} />

          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <View style={styles.badgePrimary}>
                <Text style={styles.badgeText}>Premium Venue</Text>
              </View>

              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeText}>ICC Rated</Text>
              </View>
            </View>

            <Text style={styles.groundName}>
              Lord's Cricket Ground
            </Text>

            <Text style={styles.location}>
              📍 St John's Wood, London, UK
            </Text>
          </View>
        </View>

        {/* PITCH ANALYSIS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            🎥 Pitch Analysis
          </Text>

          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
            }}
            style={styles.pitchImage}
          />

          <Text style={styles.pitchDescription}>
            "Surface looks hard with minimal grass cover.
            Expect significant spin in the second session."
          </Text>
        </View>

        {/* BOUNDARY DIMENSIONS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            🏏 Boundary Dimensions
          </Text>

          <View style={styles.dimensionContainer}>
            <Text style={styles.dimension}>Straight - 75m</Text>
            <Text style={styles.dimension}>Off Side - 68m</Text>
            <Text style={styles.dimension}>Leg Side - 65m</Text>
            <Text style={styles.dimension}>Third Man - 62m</Text>
          </View>
        </View>

        {/* MATCH STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Total Matches</Text>
            <Text style={styles.statsValue}>144</Text>
            <Text style={styles.statsSubText}>
              First-class records
            </Text>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>1st Innings Win</Text>
            <Text style={styles.statsValue}>40%</Text>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Chasing Win</Text>
            <Text style={styles.statsValue}>60%</Text>
          </View>
        </View>

        {/* FACILITIES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            🌟 World-Class Facilities
          </Text>

          <FlatList
            data={facilities}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{
              justifyContent: 'space-between',
            }}
            renderItem={({ item }) => (
              <View style={styles.facilityCard}>
                <Text style={styles.facilityIcon}>
                  {item.icon}
                </Text>

                <Text style={styles.facilityText}>
                  {item.title}
                </Text>
              </View>
            )}
          />
        </View>

        {/* BOOKING CARD */}
        <View style={styles.bookingCard}>
          <Text style={styles.sectionTitle}>
            💰 Booking Rates
          </Text>

          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceTitle}>
                Weekdays
              </Text>

              <Text style={styles.priceSub}>
                Mon - Thu (Full Day)
              </Text>
            </View>

            <Text style={styles.price}>₹25,000</Text>
          </View>

          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceTitle}>
                Weekends
              </Text>

              <Text style={styles.priceSub}>
                Fri - Sun (Full Day)
              </Text>
            </View>

            <Text style={styles.price}>₹45,000</Text>
          </View>

          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>
              Check Availability
            </Text>
          </TouchableOpacity>
        </View>

        {/* WEATHER */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            ☀️ Pitch Weather
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {weatherData.map((item) => (
              <View
                key={item.day}
                style={styles.weatherCard}
              >
                <Text style={styles.weatherDay}>
                  {item.day}
                </Text>

                <Text style={styles.weatherIcon}>
                  {item.icon}
                </Text>

                <Text style={styles.weatherTemp}>
                  {item.temp}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* MANAGEMENT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            👨‍💼 Venue Management
          </Text>

          <View style={styles.managementRow}>
            <Image
              source={{
                uri: 'https://randomuser.me/api/portraits/men/32.jpg',
              }}
              style={styles.profileImage}
            />

            <View>
              <Text style={styles.personName}>
                Marylebone Cricket Club
              </Text>

              <Text style={styles.personRole}>
                Trustee / Owner
              </Text>
            </View>
          </View>

          <View style={styles.managementRow}>
            <Image
              source={{
                uri: 'https://randomuser.me/api/portraits/men/45.jpg',
              }}
              style={styles.profileImage}
            />

            <View>
              <Text style={styles.personName}>
                Robert Thompson
              </Text>

              <Text style={styles.personRole}>
                Chief Caretaker
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FLOATING BOOK BUTTON */}
      <TouchableOpacity style={styles.floatingButton}>
        <Text style={styles.floatingButtonText}>
          📅 Book Now
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GroundDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBF1',
  },

  heroContainer: {
    height: 350,
    position: 'relative',
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },

  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  badgePrimary: {
    backgroundColor: '#0D631B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },

  badgeSecondary: {
    backgroundColor: '#FF8F04',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  groundName: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },

  location: {
    color: '#fff',
    fontSize: 15,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#181D17',
  },

  pitchImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },

  pitchDescription: {
    marginTop: 14,
    color: '#40493D',
    fontStyle: 'italic',
    lineHeight: 22,
  },

  dimensionContainer: {
    gap: 10,
  },

  dimension: {
    fontSize: 16,
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },

  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },

  statsTitle: {
    fontSize: 12,
    color: '#707A6C',
    marginBottom: 8,
    textAlign: 'center',
  },

  statsValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0D631B',
  },

  statsSubText: {
    fontSize: 12,
    color: '#707A6C',
    marginTop: 4,
  },

  facilityCard: {
    width: '48%',
    backgroundColor: '#F1F5EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },

  facilityIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  facilityText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  bookingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#0D631B',
  },

  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7FBF1',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },

  priceTitle: {
    fontWeight: '700',
    fontSize: 16,
  },

  priceSub: {
    color: '#707A6C',
    marginTop: 4,
  },

  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D631B',
  },

  bookButton: {
    backgroundColor: '#0D631B',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
  },

  bookButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  weatherCard: {
    backgroundColor: '#F1F5EB',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    alignItems: 'center',
    width: 80,
  },

  weatherDay: {
    fontWeight: '700',
    marginBottom: 8,
  },

  weatherIcon: {
    fontSize: 28,
  },

  weatherTemp: {
    marginTop: 8,
    fontWeight: '700',
    fontSize: 16,
  },

  managementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },

  personName: {
    fontWeight: '700',
    fontSize: 16,
  },

  personRole: {
    color: '#707A6C',
    marginTop: 4,
  },

  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF8F04',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 100,
    elevation: 8,
  },

  floatingButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});