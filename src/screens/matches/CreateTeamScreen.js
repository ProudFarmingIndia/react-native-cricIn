import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const CreateTeamScreen = ({ navigation }) => {
  const [teamName, setTeamName] = useState('');
  const [selectedLogo, setSelectedLogo] =
    useState('🦁');

  const logos = [
    '🦁',
    '🐯',
    '🦅',
    '🐺',
    '🐉',
    '🔥',
    '⚡',
    '🏏',
  ];

  const players = [
    {
      name: 'Virat Kohli',
      role: 'Top Order Batter',
    },
    {
      name: 'Rohit Sharma',
      role: 'Opening Batter',
    },
    {
      name: 'Hardik Pandya',
      role: 'All Rounder',
    },
    {
      name: 'Jasprit Bumrah',
      role: 'Fast Bowler',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏏 cricIn</Text>

          <TouchableOpacity
            style={styles.profileButton}
          >
            <Text style={styles.profileIcon}>
              👤
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Create Your Team
          </Text>

          <Text style={styles.subtitle}>
            Build your squad and customize
            team identity.
          </Text>
        </View>

        {/* Team Card */}
        <View style={styles.teamCard}>
          <View style={styles.logoPreview}>
            <Text style={styles.logoEmoji}>
              {selectedLogo}
            </Text>
          </View>

          <TextInput
            placeholder="Enter Team Name"
            placeholderTextColor="#707A6C"
            value={teamName}
            onChangeText={setTeamName}
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>
            Choose Team Logo
          </Text>

          <View style={styles.logoGrid}>
            {logos.map((item, index) => {
              const active =
                selectedLogo === item;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.logoButton,
                    active &&
                      styles.activeLogoButton,
                  ]}
                  onPress={() =>
                    setSelectedLogo(item)
                  }
                >
                  <Text style={styles.logoButtonText}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Squad Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Squad Preview
            </Text>

            <TouchableOpacity>
              <Text style={styles.addText}>
                + Add Player
              </Text>
            </TouchableOpacity>
          </View>

          {players.map((player, index) => (
            <View
              key={index}
              style={styles.playerRow}
            >
              <View style={styles.playerLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {player.name
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <View>
                  <Text style={styles.playerName}>
                    {player.name}
                  </Text>

                  <Text style={styles.playerRole}>
                    {player.role}
                  </Text>
                </View>
              </View>

              <TouchableOpacity>
                <Text style={styles.removeText}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Team Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              Players
            </Text>

            <Text style={styles.statValue}>
              11
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              Batters
            </Text>

            <Text style={styles.statValue}>
              5
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>
              Bowlers
            </Text>

            <Text style={styles.statValue}>
              4
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text
            style={styles.secondaryButtonText}
          >
            Save Draft
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Create Team
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateTeamScreen;

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

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIcon: {
    fontSize: 18,
  },

  titleContainer: {
    marginBottom: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#181D17',
  },

  subtitle: {
    marginTop: 8,
    color: '#707A6C',
    fontSize: 15,
    lineHeight: 22,
  },

  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DFF5DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  logoEmoji: {
    fontSize: 56,
  },

  input: {
    width: '100%',
    backgroundColor: '#F1F5EB',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#181D17',
  },

  sectionLabel: {
    alignSelf: 'flex-start',
    marginTop: 24,
    marginBottom: 14,
    color: '#40493D',
    fontWeight: '700',
  },

  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },

  logoButton: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#F1F5EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  activeLogoButton: {
    backgroundColor: '#DFF5DA',
    borderColor: '#00490E',
    borderWidth: 2,
  },

  logoButtonText: {
    fontSize: 28,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#181D17',
  },

  addText: {
    color: '#00490E',
    fontWeight: '700',
  },

  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5EB',
  },

  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5EAE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarText: {
    color: '#00490E',
    fontWeight: '800',
    fontSize: 18,
  },

  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181D17',
  },

  playerRole: {
    marginTop: 2,
    color: '#707A6C',
    fontSize: 12,
  },

  removeText: {
    color: '#BA1A1A',
    fontWeight: '700',
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#0D631B',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },

  statLabel: {
    color: '#8BDD86',
    fontWeight: '700',
    fontSize: 12,
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#EBEFE5',
    borderTopWidth: 1,
    borderTopColor: '#DDE3D7',
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#DDE3D7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#40493D',
    fontWeight: '700',
  },

  primaryButton: {
    flex: 2,
    backgroundColor: '#00490E',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
