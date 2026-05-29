import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';

const SquadSelectForMatch = ({ navigation }) => {
  const [selectedPlayers, setSelectedPlayers] = useState([
    '1',
    '3',
  ]);

  const teamAPlayers = [
    {
      id: '1',
      name: 'Arjun Sharma',
      role: 'All Rounder • Right Hand Bat',
      captain: true,
    },
    {
      id: '2',
      name: 'Marcus Thorne',
      role: 'Wicket Keeper • Top Order',
    },
    {
      id: '3',
      name: 'Zahid Khan',
      role: 'Fast Bowler • Tail-ender',
      viceCaptain: true,
    },
    {
      id: '4',
      name: 'David Miller',
      role: 'Middle Order • Left Hand Bat',
    },
  ];

  const teamBPlayers = [
    {
      id: '5',
      name: "Liam O'Connell",
      role: 'Opening Bat • Wicket Keeper',
    },
    {
      id: '6',
      name: 'Chen Wei',
      role: 'Spin Bowler • All Rounder',
    },
    {
      id: '7',
      name: 'Ismail Yusuf',
      role: 'Fast Bowler • Tail-ender',
    },
  ];

  const togglePlayer = id => {
    if (selectedPlayers.includes(id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== id));
    } else {
      setSelectedPlayers([...selectedPlayers, id]);
    }
  };

  const renderPlayer = item => {
    const selected = selectedPlayers.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          selected && styles.selectedPlayerCard,
        ]}
        onPress={() => togglePlayer(item.id)}
      >
        <View style={styles.playerLeft}>
          <View style={styles.playerAvatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0)}
            </Text>
          </View>

          <View>
            <Text style={styles.playerName}>
              {item.name}
            </Text>

            <Text style={styles.playerRole}>
              {item.role}
            </Text>
          </View>
        </View>

        <View style={styles.playerRight}>
          {item.captain && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>C</Text>
            </View>
          )}

          {item.viceCaptain && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>VC</Text>
            </View>
          )}

          <Text style={styles.checkIcon}>
            {selected ? '✅' : '⭕'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.title}>
            Squad Selection
          </Text>

          <Text style={styles.subtitle}>
            Configure Playing XI and Substitutes
          </Text>
        </View>

        {/* Team A */}
        <View style={styles.teamContainer}>
          <View style={styles.teamHeader}>
            <View>
              <Text style={styles.teamName}>
                Green Valley CC
              </Text>

              <Text style={styles.teamLabel}>
                TEAM A
              </Text>
            </View>

            <TouchableOpacity>
              <Text style={styles.addPlayer}>
                + Add Player
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Search roster..."
            placeholderTextColor="#707A6C"
            style={styles.searchInput}
          />

          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>
                Playing XI (7/11)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>
                Substitutes (2/4)
              </Text>
            </TouchableOpacity>
          </View>

          {teamAPlayers.map(player => (
            <View key={player.id}>
              {renderPlayer(player)}
            </View>
          ))}
        </View>

        {/* Team B */}
        <View style={styles.teamContainer}>
          <View style={styles.teamHeader}>
            <View>
              <Text style={styles.teamName2}>
                Desert Heat XI
              </Text>

              <Text style={styles.teamLabel}>
                TEAM B
              </Text>
            </View>

            <TouchableOpacity>
              <Text style={styles.addPlayer}>
                + Add Player
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Search roster..."
            placeholderTextColor="#707A6C"
            style={styles.searchInput}
          />

          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.activeTabOrange}>
              <Text style={styles.activeTabOrangeText}>
                Playing XI (0/11)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>
                Substitutes (0/4)
              </Text>
            </TouchableOpacity>
          </View>

          {teamBPlayers.map(player => (
            <View key={player.id}>
              {renderPlayer(player)}
            </View>
          ))}
        </View>

        {/* Bottom Summary */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>
              TOTAL SELECTED
            </Text>

            <Text style={styles.summaryValue}>
              {selectedPlayers.length} / 22 Players
            </Text>
          </View>

          <View style={styles.summaryButtons}>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                Save Draft
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() =>
                navigation.navigate("Matches", {
                  screen: "MatchLineUpScreen",
                })
              }
            >
              <Text style={styles.confirmButtonText}>
                Match Lineup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SquadSelectForMatch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBF1',
  },

  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
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
    fontSize: 18,
  },

  titleContainer: {
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#181D17',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#707A6C',
  },

  teamContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  teamName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00490E',
  },

  teamName2: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8F4E00',
  },

  teamLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#707A6C',
    marginTop: 2,
  },

  addPlayer: {
    color: '#8F4E00',
    fontWeight: '700',
  },

  searchInput: {
    backgroundColor: '#F1F5EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    color: '#181D17',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5EB',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },

  activeTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  activeTabText: {
    color: '#00490E',
    fontWeight: '700',
    fontSize: 13,
  },

  activeTabOrange: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  activeTabOrangeText: {
    color: '#8F4E00',
    fontWeight: '700',
    fontSize: 13,
  },

  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabText: {
    color: '#707A6C',
    fontWeight: '600',
    fontSize: 13,
  },

  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3D7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  selectedPlayerCard: {
    backgroundColor: '#F1FAEE',
    borderColor: '#00490E',
  },

  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DDE3D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00490E',
  },

  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181D17',
  },

  playerRole: {
    marginTop: 2,
    fontSize: 12,
    color: '#707A6C',
  },

  playerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  badge: {
    backgroundColor: '#DFF5DA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },

  badgeText: {
    color: '#00490E',
    fontWeight: '700',
    fontSize: 11,
  },

  checkIcon: {
    fontSize: 20,
  },

  summaryCard: {
    backgroundColor: '#E9EFE3',
    borderRadius: 24,
    padding: 20,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#707A6C',
    fontWeight: '700',
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '800',
    color: '#181D17',
  },

  summaryButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },

  saveButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#00490E',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#00490E',
    fontWeight: '700',
  },

  confirmButton: {
    flex: 1,
    backgroundColor: '#00490E',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});