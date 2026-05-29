import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const ShotSelectionScreen = () => {
  const [selectedShot, setSelectedShot] =
    useState('Drive');

  const shots = [
    {
      name: 'Drive',
      icon: '⬆️',
    },
    {
      name: 'Pull',
      icon: '↪️',
    },
    {
      name: 'Cut',
      icon: '↗️',
    },
    {
      name: 'Sweep',
      icon: '↩️',
    },
    {
      name: 'Flick',
      icon: '➡️',
    },
    {
      name: 'Defence',
      icon: '🛡️',
    },
    {
      name: 'Lofted',
      icon: '🚀',
    },
    {
      name: 'Straight',
      icon: '🎯',
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
            <Text style={styles.logo}>
              🏏 Cricket Pro
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.liveText}>
              Live Scorecard
            </Text>

            <Text style={styles.scoreText}>
              IND 184/3 (18.2)
            </Text>
          </View>
        </View>

        {/* Batter Context */}
        <View style={styles.contextCard}>
          <View>
            <Text style={styles.contextLabel}>
              CURRENT BATTER
            </Text>

            <Text style={styles.batterName}>
              Virat Kohli
              <Text style={styles.batterSub}>
                {' '}
                84*(52)
              </Text>
            </Text>
          </View>

          <View style={styles.runBadge}>
            <Text style={styles.runBadgeText}>
              +4 Runs
            </Text>
          </View>
        </View>

        {/* Shot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ✨ SELECT SHOT TYPE
          </Text>

          <View style={styles.shotGrid}>
            {shots.map((shot, index) => {
              const active =
                selectedShot === shot.name;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.shotButton,
                    active &&
                      styles.activeShotButton,
                  ]}
                  onPress={() =>
                    setSelectedShot(shot.name)
                  }
                >
                  <Text style={styles.shotIcon}>
                    {shot.icon}
                  </Text>

                  <Text
                    style={[
                      styles.shotText,
                      active &&
                        styles.activeShotText,
                    ]}
                  >
                    {shot.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pitch Area */}
        <View style={styles.pitchCard}>
          <Text style={styles.pitchTitle}>
            Shot Placement
          </Text>

          <View style={styles.pitchCircle}>
            <View style={styles.pitchStrip} />

            <View
              style={[
                styles.hitPoint,
                {
                  top: 50,
                  right: 40,
                },
              ]}
            />

            <View
              style={[
                styles.hitPoint,
                {
                  bottom: 60,
                  left: 45,
                  backgroundColor: '#8F4E00',
                },
              ]}
            />
          </View>

          <Text style={styles.selectedShotText}>
            Selected Shot: {selectedShot}
          </Text>
        </View>

        {/* Shot Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>
            Shot Analytics
          </Text>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsBox}>
              <Text style={styles.analyticsLabel}>
                Timing
              </Text>

              <Text style={styles.analyticsValue}>
                Perfect
              </Text>
            </View>

            <View style={styles.analyticsBox}>
              <Text style={styles.analyticsLabel}>
                Power
              </Text>

              <Text style={styles.analyticsValue}>
                86%
              </Text>
            </View>

            <View style={styles.analyticsBox}>
              <Text style={styles.analyticsLabel}>
                Placement
              </Text>

              <Text style={styles.analyticsValue}>
                Deep Cover
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text
            style={styles.secondaryButtonText}
          >
            Skip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Save Shot
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ShotSelectionScreen;

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

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8F4E00',
  },

  headerRight: {
    alignItems: 'flex-end',
  },

  liveText: {
    color: '#00490E',
    fontWeight: '700',
    fontSize: 12,
  },

  scoreText: {
    color: '#707A6C',
    marginTop: 2,
    fontSize: 12,
  },

  contextCard: {
    backgroundColor: '#F1F5EB',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  contextLabel: {
    color: '#707A6C',
    fontSize: 11,
    fontWeight: '700',
  },

  batterName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00490E',
    marginTop: 6,
  },

  batterSub: {
    color: '#707A6C',
    fontSize: 18,
  },

  runBadge: {
    backgroundColor: '#00490E',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  runBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: '#40493D',
    fontWeight: '700',
    marginBottom: 16,
    fontSize: 14,
  },

  shotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  shotButton: {
    width: '22%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3D7',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },

  activeShotButton: {
    borderWidth: 2,
    borderColor: '#00490E',
    backgroundColor: '#DFF5DA',
  },

  shotIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  shotText: {
    color: '#181D17',
    fontWeight: '700',
    fontSize: 12,
  },

  activeShotText: {
    color: '#00490E',
  },

  pitchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DDE3D7',
  },

  pitchTitle: {
    alignSelf: 'flex-start',
    fontSize: 22,
    fontWeight: '700',
    color: '#181D17',
    marginBottom: 20,
  },

  pitchCircle: {
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

  pitchStrip: {
    width: 36,
    height: 100,
    backgroundColor: '#0D631B',
    borderRadius: 8,
  },

  hitPoint: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00490E',
  },

  selectedShotText: {
    marginTop: 18,
    color: '#00490E',
    fontWeight: '700',
    fontSize: 16,
  },

  detailsCard: {
    backgroundColor: '#0D631B',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },

  detailsTitle: {
    color: '#8BDD86',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 18,
  },

  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  analyticsBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },

  analyticsLabel: {
    color: '#DFF5DA',
    fontSize: 11,
    fontWeight: '700',
  },

  analyticsValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
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
