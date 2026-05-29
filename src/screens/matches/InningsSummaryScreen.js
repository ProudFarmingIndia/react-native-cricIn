import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const InningsSummaryScreen = ({ navigation }) => {
  const wickets = [
    {
      score: '24/1',
      batter: 'R. Gaikwad',
      over: '2.4 ov',
    },
    {
      score: '58/2',
      batter: 'V. Kohli',
      over: '7.1 ov',
    },
    {
      score: '102/3',
      batter: 'S. Iyer',
      over: '11.5 ov',
    },
    {
      score: '149/4',
      batter: 'R. Sharma',
      over: '16.2 ov',
    },
    {
      score: '171/5',
      batter: 'Hardik Pandya',
      over: '18.4 ov',
    },
    {
      score: '184/7',
      batter: 'Last Wicket',
      over: '20 ov',
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

          <TouchableOpacity style={styles.notificationBtn}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.inningsBadge}>
            <Text style={styles.inningsBadgeText}>
              INNINGS COMPLETE
            </Text>
          </View>

          <Text style={styles.mainScore}>184/7</Text>

          <Text style={styles.overText}>
            20 Overs Completed
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>CRR</Text>
              <Text style={styles.statValue}>9.20</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>4s</Text>
              <Text style={styles.statValue}>15</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>6s</Text>
              <Text style={styles.statValue}>8</Text>
            </View>
          </View>
        </View>

        {/* Partnership */}
        <View style={styles.partnershipCard}>
          <Text style={styles.sectionTitle}>
            Highest Partnership
          </Text>

          <Text style={styles.partnershipRuns}>
            66 Runs
          </Text>

          <Text style={styles.partnershipSub}>
            (48 balls)
          </Text>

          <Text style={styles.partnershipPlayers}>
            Rohit Sharma & Virat Kohli
          </Text>
        </View>

        {/* Fall of Wickets */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Fall of Wickets
          </Text>

          {wickets.map((item, index) => (
            <View
              key={index}
              style={styles.wicketRow}
            >
              <View style={styles.wicketLeft}>
                <View style={styles.wicketCircle}>
                  <Text style={styles.wicketCircleText}>
                    W
                  </Text>
                </View>

                <View>
                  <Text style={styles.wicketScore}>
                    {item.score}
                  </Text>

                  <Text style={styles.wicketPlayer}>
                    {item.batter}
                  </Text>
                </View>
              </View>

              <Text style={styles.wicketOver}>
                {item.over}
              </Text>
            </View>
          ))}
        </View>

        {/* Match Summary */}
        <View style={styles.summaryBanner}>
          <Text style={styles.summaryTitle}>
            First Innings Complete
          </Text>

          <Text style={styles.summaryText}>
            Target for opponent team is 185 runs.
            Bowling team needs 186 runs to win.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            Scorecard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate('SecondInningsScreen')
          }
        >
          <Text style={styles.primaryButtonText}>
            Start 2nd Innings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InningsSummaryScreen;

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

  scoreCard: {
    backgroundColor: '#00490E',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
  },

  inningsBadge: {
    backgroundColor: '#FFB77B',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 30,
  },

  inningsBadgeText: {
    color: '#623300',
    fontWeight: '700',
    fontSize: 11,
  },

  mainScore: {
    fontSize: 60,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 18,
  },

  overText: {
    color: '#DFF5DA',
    fontSize: 16,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },

  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 4,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },

  statLabel: {
    color: '#8BDD86',
    fontSize: 12,
    fontWeight: '700',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },

  partnershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDE3D7',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#181D17',
  },

  partnershipRuns: {
    fontSize: 42,
    fontWeight: '900',
    color: '#00490E',
    marginTop: 14,
  },

  partnershipSub: {
    color: '#707A6C',
    marginTop: 4,
  },

  partnershipPlayers: {
    marginTop: 12,
    color: '#181D17',
    fontWeight: '700',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  wicketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5EB',
  },

  wicketLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  wicketCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#BA1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  wicketCircleText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  wicketScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181D17',
  },

  wicketPlayer: {
    marginTop: 2,
    color: '#707A6C',
    fontSize: 12,
  },

  wicketOver: {
    color: '#00490E',
    fontWeight: '700',
  },

  summaryBanner: {
    backgroundColor: '#0D631B',
    borderRadius: 26,
    padding: 24,
    marginBottom: 20,
  },

  summaryTitle: {
    color: '#8BDD86',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },

  summaryText: {
    color: '#DFF5DA',
    lineHeight: 24,
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
