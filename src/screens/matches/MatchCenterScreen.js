import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const MatchCenterScreen = () => {
  const overs = [
    {
      over: 'Over 64 (Lyon)',
      balls: ['1', '0', '4', '0', '1', '0'],
    },
    {
      over: 'Over 63 (Starc)',
      balls: ['0', 'W', '0', '1L', '2', '0'],
    },
    {
      over: 'Over 62 (Lyon)',
      balls: ['0', '1', '1', '0', '0', '0'],
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
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>🏏 cricIn</Text>
          </View>

          <TouchableOpacity style={styles.notificationBtn}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Live Summary */}
        <View style={styles.liveCard}>
          <View>
            <Text style={styles.matchInfo}>
              IND vs AUS • 1st Test • Day 4
            </Text>

            <View style={styles.scoreRow}>
              <Text style={styles.score}>248/4</Text>

              <Text style={styles.overText}>
                (64.2 Ov)
              </Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>
                LIVE
              </Text>
            </View>

            <Text style={styles.targetText}>
              Target: 382
            </Text>
          </View>
        </View>

        {/* Previous Overs */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>
            Previous Overs
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.overScroll}>
              {overs.map((item, index) => (
                <View
                  key={index}
                  style={styles.overCard}
                >
                  <Text style={styles.overTitle}>
                    {item.over}
                  </Text>

                  <View style={styles.ballRow}>
                    {item.balls.map((ball, i) => (
                      <View
                        key={i}
                        style={[
                          styles.ballCircle,
                          ball === '4' &&
                            styles.boundaryBall,
                          ball === 'W' &&
                            styles.wicketBall,
                        ]}
                      >
                        <Text
                          style={[
                            styles.ballText,
                            (ball === '4' ||
                              ball === 'W') &&
                              styles.whiteText,
                          ]}
                        >
                          {ball}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Batter Card */}
        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <View style={styles.playerInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  VK
                </Text>
              </View>

              <View>
                <Text style={styles.playerName}>
                  Virat Kohli*
                </Text>

                <Text style={styles.playerSub}>
                  Innings: 82 (114)
                </Text>
              </View>
            </View>

            <View style={styles.strikeRateBox}>
              <Text style={styles.strikeRate}>
                S.R. 71.9
              </Text>

              <Text style={styles.currentLabel}>
                Current Batsman
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>4s</Text>
              <Text style={styles.statValue}>8</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>6s</Text>
              <Text style={styles.statValue}>1</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Dots</Text>
              <Text style={styles.statValue}>48</Text>
            </View>
          </View>
        </View>

        {/* Wagon Wheel */}
        <View style={styles.wagonCard}>
          <Text style={styles.sectionTitle}>
            Wagon Wheel Analysis
          </Text>

          <View style={styles.wagonCircle}>
            <View style={styles.pitch} />

            <View
              style={[
                styles.hitDot,
                { top: 40, right: 50 },
              ]}
            />

            <View
              style={[
                styles.hitDot,
                {
                  bottom: 50,
                  left: 40,
                  backgroundColor: '#8F4E00',
                },
              ]}
            />
          </View>
        </View>

        {/* Partnership Card */}
        <View style={styles.partnershipCard}>
          <Text style={styles.partnershipTitle}>
            Current Partnership
          </Text>

          <Text style={styles.partnershipRuns}>
            74 Runs
          </Text>

          <Text style={styles.partnershipBalls}>
            92 Balls
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MatchCenterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBF1',
  },

  scrollContainer: {
    paddingBottom: 100,
  },

  header: {
    height: 70,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5EB',
  },

  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: '#00490E',
  },

  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationIcon: {
    fontSize: 18,
  },

  liveCard: {
    backgroundColor: '#00490E',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  matchInfo: {
    color: '#DFF5DA',
    fontSize: 13,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
  },

  score: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  overText: {
    color: '#DFF5DA',
    marginLeft: 8,
    marginBottom: 6,
  },

  rightSection: {
    alignItems: 'flex-end',
  },

  liveBadge: {
    backgroundColor: '#FF8F04',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 30,
    marginBottom: 8,
  },

  liveBadgeText: {
    color: '#623300',
    fontWeight: '700',
    fontSize: 11,
  },

  targetText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  sectionContainer: {
    marginTop: 22,
    paddingHorizontal: 16,
  },

  sectionLabel: {
    color: '#707A6C',
    fontWeight: '700',
    marginBottom: 12,
  },

  overScroll: {
    flexDirection: 'row',
    gap: 14,
  },

  overCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDE3D7',
    minWidth: 150,
  },

  overTitle: {
    color: '#707A6C',
    fontWeight: '700',
    marginBottom: 10,
    fontSize: 12,
  },

  ballRow: {
    flexDirection: 'row',
    gap: 6,
  },

  ballCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBEFE5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  boundaryBall: {
    backgroundColor: '#0D631B',
  },

  wicketBall: {
    backgroundColor: '#BA1A1A',
  },

  ballText: {
    fontWeight: '700',
    fontSize: 11,
  },

  whiteText: {
    color: '#FFFFFF',
  },

  playerCard: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DFF5DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarText: {
    color: '#00490E',
    fontWeight: '900',
    fontSize: 22,
  },

  playerName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00490E',
  },

  playerSub: {
    color: '#707A6C',
    marginTop: 4,
  },

  strikeRateBox: {
    alignItems: 'flex-end',
  },

  strikeRate: {
    color: '#8F4E00',
    fontWeight: '800',
    fontSize: 20,
  },

  currentLabel: {
    color: '#707A6C',
    marginTop: 4,
    fontSize: 12,
  },

  statsGrid: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#F1F5EB',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },

  statLabel: {
    color: '#707A6C',
    fontWeight: '700',
    fontSize: 12,
  },

  statValue: {
    color: '#181D17',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6,
  },

  wagonCard: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 22,
    fontWeight: '700',
    color: '#181D17',
    marginBottom: 18,
  },

  wagonCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EBEFE5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#DDE3D7',
    position: 'relative',
  },

  pitch: {
    width: 34,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#0D631B',
  },

  hitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00490E',
  },

  partnershipCard: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#0D631B',
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
  },

  partnershipTitle: {
    color: '#8BDD86',
    fontSize: 18,
    fontWeight: '700',
  },

  partnershipRuns: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    marginTop: 10,
  },

  partnershipBalls: {
    color: '#DFF5DA',
    fontSize: 16,
    marginTop: 4,
  },
});

