import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const MatchLineUpScreen = ({ navigation }) => {
  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [bowler, setBowler] = useState(null);

  const battingPlayers = [
    {
      id: 1,
      name: 'Arjun Mehta',
      role: 'Opener • RHB',
      initials: 'AM',
    },
    {
      id: 2,
      name: 'David Warner',
      role: 'Opener • LHB',
      initials: 'DW',
    },
    {
      id: 3,
      name: 'Rohit Sharma',
      role: 'Batter • RHB',
      initials: 'RS',
    },
    {
      id: 4,
      name: 'Steve Smith',
      role: 'Batter • RHB',
      initials: 'SS',
    },
  ];

  const bowlingPlayers = [
    {
      id: 1,
      name: 'Jasprit Bumrah',
      role: 'Fast • RA',
      initials: 'JB',
    },
    {
      id: 2,
      name: 'Mitchell Starc',
      role: 'Fast • LA',
      initials: 'MS',
    },
    {
      id: 3,
      name: 'Rashid Khan',
      role: 'Spinner • RA',
      initials: 'RK',
    },
  ];

  const selectBatsman = player => {
    if (!striker) {
      setStriker(player);
    } else if (
      striker?.name !== player.name &&
      !nonStriker
    ) {
      setNonStriker(player);
    }
  };

  const removePlayer = playerName => {
    if (striker?.name === playerName) {
      setStriker(null);
    }

    if (nonStriker?.name === playerName) {
      setNonStriker(null);
    }
  };

  const selectBowler = player => {
    if (bowler?.name === player.name) {
      setBowler(null);
    } else {
      setBowler(player);
    }
  };

  const isReady =
    striker && nonStriker && bowler;

  const renderBattingPlayer = player => {
    const selected =
      striker?.name === player.name ||
      nonStriker?.name === player.name;

    return (
      <View style={styles.playerRow}>
        <View style={styles.playerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {player.initials}
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

        <TouchableOpacity
          style={[
            styles.addButton,
            selected && styles.removeButton,
          ]}
          onPress={() => {
            if (selected) {
              removePlayer(player.name);
            } else {
              selectBatsman(player);
            }
          }}
        >
          <Text style={styles.addButtonText}>
            {selected ? 'Remove' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBowler = player => {
    const selected =
      bowler?.name === player.name;

    return (
      <View style={styles.playerRow}>
        <View style={styles.playerLeft}>
          <View
            style={[
              styles.avatar,
              styles.orangeAvatar,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                styles.orangeText,
              ]}
            >
              {player.initials}
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

        <TouchableOpacity
          style={[
            styles.addButton,
            selected && styles.removeButton,
          ]}
          onPress={() => selectBowler(player)}
        >
          <Text style={styles.addButtonText}>
            {selected ? 'Remove' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
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
          <View style={styles.logoRow}>
            <Text style={styles.logo}>
              🏏 cricIn
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationBtn}
          >
            <Text style={styles.notificationIcon}>
              🔔
            </Text>
          </TouchableOpacity>
        </View>

        {/* Match Info */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            Match Setup
          </Text>

          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              Toss won by{' '}
              <Text style={styles.bold}>
                Green Valley CC
              </Text>{' '}
              (Elected to Bat)
            </Text>
          </View>
        </View>

        {/* Openers Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Select Openers
          </Text>

          <Text style={styles.sectionSubtitle}>
            Green Valley CC Batting Roster
          </Text>

          {/* Selection Boxes */}
          <View style={styles.selectionRow}>
            <View
              style={[
                styles.selectionBox,
                striker &&
                  styles.activeSelectionBox,
              ]}
            >
              <Text style={styles.selectionLabel}>
                STRIKER
              </Text>

              <Text style={styles.selectionName}>
                {striker
                  ? striker.name
                  : 'Not Selected'}
              </Text>
            </View>

            <View
              style={[
                styles.selectionBox,
                nonStriker &&
                  styles.activeSelectionBox,
              ]}
            >
              <Text style={styles.selectionLabel}>
                NON-STRIKER
              </Text>

              <Text style={styles.selectionName}>
                {nonStriker
                  ? nonStriker.name
                  : 'Not Selected'}
              </Text>
            </View>
          </View>

          {/* Player List */}
          <View style={styles.playerList}>
            {battingPlayers.map(player => (
              <View key={player.id}>
                {renderBattingPlayer(player)}
              </View>
            ))}
          </View>
        </View>

        {/* Bowler Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Select Opening Bowler
          </Text>

          <Text style={styles.sectionSubtitle}>
            The Rangers SC Bowling Roster
          </Text>

          {/* Bowler Box */}
          <View
            style={[
              styles.selectionBox,
              bowler &&
                styles.activeSelectionBox,
            ]}
          >
            <Text style={styles.selectionLabel}>
              OPENING BOWLER
            </Text>

            <Text
              style={[
                styles.selectionName,
                styles.orangeText,
              ]}
            >
              {bowler
                ? bowler.name
                : 'Not Selected'}
            </Text>
          </View>

          {/* Bowler List */}
          <View style={styles.playerList}>
            {bowlingPlayers.map(player => (
              <View key={player.id}>
                {renderBowler(player)}
              </View>
            ))}
          </View>
        </View>

        {/* Stadium Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            Final Match Warmup
          </Text>

          <Text style={styles.bannerText}>
            Ensuring rosters are locked. Ready
            to commence the first ball?
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>
            Cancel Setup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!isReady}
          style={[
            styles.startButton,
            !isReady && styles.disabledButton,
          ]}
          onPress={() =>
            
            navigation.navigate(
              'LiveScoringScreen',
            )
          }
        >
          <Text style={styles.startButtonText}>
            Start Scoring ▶
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MatchLineUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBF1',
  },

  scrollContainer: {
    padding: 16,
    paddingBottom: 140,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00490E',
  },

  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationIcon: {
    fontSize: 18,
  },

  titleSection: {
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#00490E',
    marginBottom: 12,
  },

  infoBanner: {
    backgroundColor: '#E9EFE3',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  infoText: {
    color: '#40493D',
    fontSize: 13,
  },

  bold: {
    fontWeight: '700',
    color: '#00490E',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#181D17',
  },

  sectionSubtitle: {
    marginTop: 4,
    color: '#707A6C',
    marginBottom: 18,
  },

  selectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  selectionBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3D7',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },

  activeSelectionBox: {
    borderColor: '#00490E',
    backgroundColor: '#F1F5EB',
  },

  selectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707A6C',
    marginBottom: 6,
  },

  selectionName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#00490E',
  },

  playerList: {
    marginTop: 4,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5EAE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  orangeAvatar: {
    backgroundColor: '#FFE0C2',
  },

  avatarText: {
    color: '#00490E',
    fontWeight: '800',
  },

  orangeText: {
    color: '#8F4E00',
  },

  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181D17',
  },

  playerRole: {
    fontSize: 12,
    color: '#707A6C',
    marginTop: 2,
  },

  addButton: {
    backgroundColor: '#00490E',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },

  removeButton: {
    backgroundColor: '#BA1A1A',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  banner: {
    backgroundColor: '#0D631B',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },

  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8BDD86',
    marginBottom: 10,
  },

  bannerText: {
    color: '#DFF5DA',
    lineHeight: 22,
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

  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3D7',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#40493D',
    fontWeight: '700',
  },

  startButton: {
    flex: 2,
    backgroundColor: '#00490E',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },

  disabledButton: {
    opacity: 0.5,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});