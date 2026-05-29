import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const LiveScoringScreen = () => {
  const recentBalls = [
    '4',
    '.',
    '1',
    'W',
    '1lb',
    '6',
    '.',
    '2',
    'wd',
    '1',
    '.',
    '4',
  ];

  const scoreButtons = [
    { label: '0', sub: 'Dot Ball' },
    { label: '1', sub: 'Single' },
    { label: '2', sub: 'Double' },
    { label: '3', sub: 'Triple' },
    { label: '4', sub: 'Boundary', highlight: true },
    { label: '6', sub: 'Maximum', primary: true },
    { label: 'W', sub: 'Wicket', wicket: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileIcon}>
                👤
              </Text>
            </View>

            <Text style={styles.logo}>
              CricIn
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.matchId}>
              Match #42
            </Text>

            <Text style={styles.liveText}>
              LIVE SCORING
            </Text>
          </View>
        </View>

        {/* Main Scorecard */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreTop}>
            <View>
              <View style={styles.inningsBadge}>
                <Text style={styles.inningsText}>
                  1st Innings
                </Text>
              </View>

              <Text style={styles.mainScore}>
                142/4
              </Text>

              <Text style={styles.oversText}>
                Overs:{' '}
                <Text style={styles.bold}>
                  16.4
                </Text>
              </Text>
            </View>

            <View style={styles.rightStats}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />

                <Text style={styles.liveIndicatorText}>
                  LIVE
                </Text>
              </View>

              <Text style={styles.statsText}>
                CRR:{' '}
                <Text style={styles.primary}>
                  8.52
                </Text>
              </Text>

              <Text style={styles.statsText}>
                Proj:{' '}
                <Text style={styles.primary}>
                  178
                </Text>
              </Text>
            </View>
          </View>

          {/* Player Stats */}
          <View style={styles.playerStatsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                STRIKER
              </Text>

              <Text style={styles.statName}>
                R. Sharma*
              </Text>

              <Text style={styles.statSub}>
                48 (32) • 4x4, 2x6
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                NON-STRIKER
              </Text>

              <Text style={styles.statName}>
                V. Kohli
              </Text>

              <Text style={styles.statSub}>
                12 (10) • 1x4
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                BOWLER
              </Text>

              <Text
                style={[
                  styles.statName,
                  styles.secondaryText,
                ]}
              >
                M. Starc
              </Text>

              <Text style={styles.statSub}>
                3.4-0-28-2
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                LAST BALL
              </Text>

              <View style={styles.lastBallRow}>
                <View style={styles.lastBallCircle}>
                  <Text
                    style={styles.lastBallText}
                  >
                    4
                  </Text>
                </View>

                <Text style={styles.statSub}>
                  Cover Drive
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Wagon Wheel */}
        <View style={styles.wagonCard}>
          <Text style={styles.sectionTitle}>
            Wagon Wheel
          </Text>

          <View style={styles.wagonCircle}>
            <View style={styles.pitch} />

            {/* Mock Points */}
            <View
              style={[
                styles.dot,
                {
                  bottom: 30,
                  left: 40,
                },
              ]}
            />

            <View
              style={[
                styles.dot,
                {
                  top: 40,
                  right: 30,
                  backgroundColor: '#00490E',
                },
              ]}
            />
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: '#8F4E00',
                  },
                ]}
              />

              <Text style={styles.legendText}>
                Off Side
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: '#00490E',
                  },
                ]}
              />

              <Text style={styles.legendText}>
                On Side
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Entry */}
        <View style={styles.quickEntryCard}>
          <View style={styles.quickEntryHeader}>
            <Text style={styles.quickTitle}>
              ✏️ Quick Entry
            </Text>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.smallButton}
              >
                <Text
                  style={styles.smallButtonText}
                >
                  Undo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallButton}
              >
                <Text
                  style={styles.smallButtonText}
                >
                  Partnership
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Score Buttons */}
          <View style={styles.scoreGrid}>
            {scoreButtons.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.scoreButton,
                  item.highlight &&
                    styles.highlightButton,
                  item.primary &&
                    styles.primaryButton,
                  item.wicket &&
                    styles.wicketButton,
                ]}
              >
                <Text
                  style={[
                    styles.scoreButtonText,
                    (item.primary ||
                      item.wicket) &&
                      styles.whiteText,
                  ]}
                >
                  {item.label}
                </Text>

                <Text
                  style={[
                    styles.scoreSubText,
                    (item.primary ||
                      item.wicket) &&
                      styles.whiteSubText,
                  ]}
                >
                  {item.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Extras */}
          <View style={styles.extrasGrid}>
            {[
              'Wide',
              'No Ball',
              'Bye',
              'Leg Bye',
              'Others',
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.extraButton}
              >
                <Text style={styles.extraTitle}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Balls */}
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>
              Recent Balls (Over 16)
            </Text>

            <Text style={styles.recentSub}>
              Last 12 deliveries
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >
            <View style={styles.ballRow}>
              {recentBalls.map((ball, index) => (
                <View
                  key={index}
                  style={[
                    styles.ballCircle,
                    ball === '4' &&
                      styles.primaryBall,
                    ball === '6' &&
                      styles.primaryBall,
                    ball === 'W' &&
                      styles.wicketBall,
                    ball === 'wd' &&
                      styles.wideBall,
                  ]}
                >
                  <Text
                    style={[
                      styles.ballText,
                      (ball === '4' ||
                        ball === '6' ||
                        ball === 'W' ||
                        ball === 'wd') &&
                        styles.whiteText,
                    ]}
                  >
                    {ball}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
      >
        <Text style={styles.fabText}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LiveScoringScreen;

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

  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#00490E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  profileIcon: {
    fontSize: 18,
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00490E',
  },

  headerRight: {
    alignItems: 'flex-end',
  },

  matchId: {
    color: '#707A6C',
    fontSize: 12,
  },

  liveText: {
    color: '#00490E',
    fontWeight: '800',
    marginTop: 2,
  },

  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inningsBadge: {
    backgroundColor: '#FF8F04',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },

  inningsText: {
    color: '#623300',
    fontWeight: '700',
    fontSize: 11,
  },

  mainScore: {
    fontSize: 52,
    fontWeight: '800',
    color: '#00490E',
    marginTop: 12,
  },

  oversText: {
    fontSize: 16,
    color: '#707A6C',
  },

  bold: {
    fontWeight: '700',
    color: '#181D17',
  },

  rightStats: {
    alignItems: 'flex-end',
  },

  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BA1A1A',
    marginRight: 6,
  },

  liveIndicatorText: {
    fontSize: 11,
    color: '#707A6C',
    fontWeight: '700',
  },

  statsText: {
    color: '#707A6C',
    marginBottom: 4,
  },

  primary: {
    color: '#00490E',
    fontWeight: '700',
  },

  playerStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#F1F5EB',
    borderRadius: 18,
    padding: 14,
  },

  statLabel: {
    fontSize: 11,
    color: '#707A6C',
    fontWeight: '700',
  },

  statName: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#00490E',
  },

  statSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#707A6C',
  },

  secondaryText: {
    color: '#8F4E00',
  },

  lastBallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  lastBallCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00490E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  lastBallText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  wagonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  sectionTitle: {
    alignSelf: 'flex-start',
    fontWeight: '700',
    color: '#707A6C',
    marginBottom: 18,
  },

  wagonCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#EBEFE5',
    borderWidth: 4,
    borderColor: '#DDE3D7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  pitch: {
    width: 30,
    height: 80,
    backgroundColor: '#0D631B',
    borderRadius: 6,
  },

  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8F4E00',
  },

  legendRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 24,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },

  legendText: {
    color: '#707A6C',
    fontSize: 12,
  },

  quickEntryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DFF5DA',
  },

  quickEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  quickTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00490E',
  },

  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },

  smallButton: {
    backgroundColor: '#E5EAE0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  smallButtonText: {
    color: '#40493D',
    fontWeight: '700',
    fontSize: 12,
  },

  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  scoreButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#F1F5EB',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  highlightButton: {
    backgroundColor: '#DFF5DA',
  },

  primaryButton: {
    backgroundColor: '#00490E',
  },

  wicketButton: {
    backgroundColor: '#FF8F04',
  },

  scoreButtonText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#181D17',
  },

  scoreSubText: {
    marginTop: 4,
    fontSize: 10,
    color: '#707A6C',
    fontWeight: '700',
  },

  whiteText: {
    color: '#FFFFFF',
  },

  whiteSubText: {
    color: '#FFFFFF',
  },

  extrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },

  extraButton: {
    backgroundColor: '#E5EAE0',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    minWidth: '30%',
    alignItems: 'center',
  },

  extraTitle: {
    fontWeight: '700',
    color: '#181D17',
  },

  recentCard: {
    backgroundColor: '#F1F5EB',
    borderRadius: 24,
    padding: 20,
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  recentTitle: {
    color: '#707A6C',
    fontWeight: '700',
  },

  recentSub: {
    color: '#707A6C',
    fontSize: 12,
  },

  ballRow: {
    flexDirection: 'row',
    gap: 12,
  },

  ballCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDE3D7',
  },

  primaryBall: {
    backgroundColor: '#00490E',
    borderColor: '#00490E',
  },

  wicketBall: {
    backgroundColor: '#8F4E00',
    borderColor: '#8F4E00',
  },

  wideBall: {
    backgroundColor: '#BA1A1A',
    borderColor: '#BA1A1A',
  },

  ballText: {
    fontWeight: '700',
    color: '#181D17',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FF8F04',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },

  fabText: {
    fontSize: 26,
  },
});